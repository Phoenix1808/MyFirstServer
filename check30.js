import { OpenAI } from 'openai';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const openai = new OpenAI();
const s3 = new S3Client({ region: "us-east-1" });

// 🧠 Model Config (Cost Tiers)
const MODELS = {
    CHEAP: "gpt-4o-mini",          // low cost
    MEDIUM: "gpt-4o",              // balanced
    EXPENSIVE: "gpt-4-vision-preview" // high cost
};

function selectModel(image, index) {
    // 🧠 Strategy logic (you can make this smarter later)

    // Example:
    if (index % 5 === 0) {
        return MODELS.EXPENSIVE; // only 20% images use expensive model
    } else if (index % 2 === 0) {
        return MODELS.MEDIUM;
    } else {
        return MODELS.CHEAP;
    }
}

export async function processBatchData(userImages) {
    console.log("Starting batch processing...");

    for (let i = 0; i < userImages.length; i++) {

        const selectedModel = selectModel(userImages[i], i);

        console.log(`Processing image ${i} with model: ${selectedModel}`);

        const completion = await openai.chat.completions.create({
            model: selectedModel,
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: "Analyze this image for anomalies." },
                        {
                            type: "image_url",
                            image_url: {
                                url: userImages[i]
                            }
                        }
                    ]
                }
            ]
        });

        await s3.send(new PutObjectCommand({
            Bucket: "secure-user-data-bucket",
            Key: `processed-data-${i}.json`,
            Body: JSON.stringify({
                model: selectedModel,
                result: completion.choices[0]
            })
        }));
    }
}
