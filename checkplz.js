// cloudOperations.js

import AWS from "aws-sdk";
import Anthropic from "@anthropic-ai/sdk";

// AWS Clients
const s3 = new AWS.S3({ region: "us-east-1" });
const dynamo = new AWS.DynamoDB.DocumentClient({ region: "us-east-1" });
const lambda = new AWS.Lambda({ region: "us-east-1" });

// AI Client
const claude = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ─── Place an Order ─────────────────────────────────────────────

export async function placeOrder(order) {
  const orderId = `ORD-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 7)
    .toUpperCase()}`;

  // 1. Store Order + Update Inventory
  await dynamo
    .transactWrite({
      TransactItems: [
        {
          Put: {
            TableName: "Orders",
            ConditionExpression: "attribute_not_exists(orderId)",
            Item: {
              orderId,
              userId: order.userId,
              items: order.items,
              totalUsd: order.items.reduce(
                (s, i) => s + i.priceUsd * i.qty,
                0
              ),
              status: "pending",
              shippingAddress: order.shippingAddress,
              createdAt: new Date().toISOString(),
            },
          },
        },
        ...order.items.map((item) => ({
          Update: {
            TableName: "Inventory",
            Key: { sku: item.sku },
            UpdateExpression: "SET stock = stock - :qty",
            ConditionExpression: "stock >= :qty",
            ExpressionAttributeValues: {
              ":qty": item.qty,
            },
          },
        })),
      ],
    })
    .promise();

  // 2. Async Invoice Generation (Lambda)
  await lambda
    .invoke({
      FunctionName: "acme-invoice-generator",
      InvocationType: "Event",
      Payload: JSON.stringify({
        orderId,
        userId: order.userId,
      }),
    })
    .promise();

  // 3. Generate Signed URL
  const invoiceKey = `invoices/${order.userId}/${orderId}.pdf`;

  const invoiceUrl = s3.getSignedUrl("getObject", {
    Bucket: "acme-orders-invoices",
    Key: invoiceKey,
    Expires: 86400,
  });

  return { orderId, invoiceUrl };
}

// ─── Generate Recommendation Email ─────────────────────────────

export async function generateRecommendationEmail(
  userId,
  recentOrders
) {
  // Fetch User Profile
  const profile = await dynamo
    .get({
      TableName: "UserProfiles",
      Key: { userId },
    })
    .promise();

  const userName = profile.Item?.name || "Valued Customer";

  const purchasedItems = recentOrders
    .flatMap((o) => o.items.map((i) => i.name))
    .join(", ");

  // Claude AI Generation
  const message = await claude.messages.create({
    model: "claude-3-sonnet-20240229",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Write a personalized HTML recommendation email for ${userName}.
Recent purchases: ${purchasedItems}.
Include 3 product recommendations, a 10% discount code, and CTA.`,
      },
    ],
  });

  const htmlEmail = message.content[0].text;

  // Store Email in S3
  await s3
    .putObject({
      Bucket: "acme-email-templates",
      Key: `personalized/${userId}/${Date.now()}.html`,
      Body: htmlEmail,
      ContentType: "text/html",
    })
    .promise();

  return htmlEmail;
}

// ─── Daily Revenue Calculation (⚠️ Expensive Scan) ─────────────────

export async function getDailyRevenue(date) {
  const result = await dynamo
    .scan({
      TableName: "Orders",
      FilterExpression:
        "begins_with(createdAt, :date) AND #s = :status",
      ExpressionAttributeNames: {
        "#s": "status",
      },
      ExpressionAttributeValues: {
        ":date": date,
        ":status": "completed",
      },
      ProjectionExpression: "orderId, totalUsd",
    })
    .promise();

  return (result.Items || []).reduce(
    (sum, row) => sum + row.totalUsd,
    0
  );
}

// ─── Bulk Upload Product Images ─────────────────────────────

export async function bulkUploadProductImages(products) {
  // Upload images in parallel (⚠️ potential cost spike)
  await Promise.all(
    products.map((p) =>
      s3
        .putObject({
          Bucket: "acme-product-images",
          Key: `catalog/${p.sku}/hero.jpg`,
          Body: p.imageBuffer,
          ContentType: p.contentType,
          CacheControl: "max-age=31536000",
          StorageClass: "INTELLIGENT_TIERING",
        })
        .promise()
    )
  );

  // Update DB in parallel
  await Promise.all(
    products.map((p) =>
      dynamo
        .update({
          TableName: "Inventory",
          Key: { sku: p.sku },
          UpdateExpression:
            "SET imageUrl = :url, updatedAt = :t",
          ExpressionAttributeValues: {
            ":url": `https://acme-product-images.s3.amazonaws.com/catalog/${p.sku}/hero.jpg`,
            ":t": new Date().toISOString(),
          },
        })
        .promise()
    )
  );
}
