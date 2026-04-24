import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const s3 = new S3Client({ region: "us-east-1" });

// 🔥 Model Registry
const MODELS = {
  OPENAI_CHEAP: "gpt-4o-mini",
  OPENAI_MEDIUM: "gpt-4o",
  OPENAI_VISION: "gpt-4-vision-preview",

  CLAUDE_HAIKU: "claude-3-haiku-20240307",
  CLAUDE_SONNET: "claude-3-sonnet-20240229",
  CLAUDE_OPUS: "claude-3-opus-20240229",
};

// 🧠 Smart Model Selector
function selectModel(index) {
  if (index % 7 === 0) {
    return { provider: "anthropic", model: MODELS.CLAUDE_OPUS };
  } else if (index % 5 === 0) {
    return { provider: "openai", model: MODELS.OPENAI_VISION };
  } else if (index % 2 === 0) {
    return { provider: "anthropic", model: MODELS.CLAUDE_SONNET };
  } else {
    return { provider: "openai", model: MODELS.OPENAI_CHEAP };
  }
}

// 🔥 OpenAI Call
async function runOpenAI(model, imageUrl) {
  const res = await openai.chat.completions.create({
    model,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "Analyze this image for anomalies." },
          {
            type: "image_url",
            image_url: { url: imageUrl },
          },
        ],
      },
    ],
  });

  return res.choices[0];
}

// 🔥 Claude Call (Opus / Sonnet / Haiku)
async function runClaude(model, imageUrl) {
  const res = await anthropic.messages.create({
    model,
    max_tokens: 500,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "Analyze this image for anomalies." },
          {
            type: "image",
            source: {
              type: "url",
              url: imageUrl,
            },
          },
        ],
      },
    ],
  });

  return res.content[0];
}

// 🚀 Main Function
export async function processBatchData(userImages) {
  console.log("Starting multi-LLM batch processing...");

  for (let i = 0; i < userImages.length; i++) {
    const { provider, model } = selectModel(i);

    console.log(`Image ${i} → ${provider}:${model}`);

    let result;

    try {
      if (provider === "openai") {
        result = await runOpenAI(model, userImages[i]);
      } else {
        result = await runClaude(model, userImages[i]);
      }
    } catch (err) {
      console.log("⚠️ Primary model failed, switching fallback...");

      // 🔁 Fallback to cheap OpenAI model
      result = await runOpenAI(MODELS.OPENAI_CHEAP, userImages[i]);
    }

    await s3.send(
      new PutObjectCommand({
        Bucket: "secure-user-data-bucket",
        Key: `processed-${i}.json`,
        Body: JSON.stringify({
          provider,
          model,
          result,
        }),
      })
    );
  }
}
