import { OpenAI } from 'openai';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const openai = new OpenAI();
const s3 = new S3Client({ region: "us-east-1" });

export async function processBatchData(userImages) {
    for (let i = 0; i < userImages.length; i++) {
        const completion = await openai.chat.completions.create({
            model: "gpt-4-vision-preview",
            messages: [{ role: "user", content: "Analyze this image." }]
        });
        await s3.send(new PutObjectCommand({
            Bucket: "my-bucket",
            Key: `result-${i}.json`,
            Body: JSON.stringify(completion.choices[0])
        }));
    }
}
