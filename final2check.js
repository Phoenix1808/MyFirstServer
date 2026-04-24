import { parse } from '@typescript-eslint/typescript-estree';

// ── The exact code the user submitted ─────────────────────────────────────────
const TEST_CODE = `
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
            Bucket: "secure-user-data-bucket",
            Key: \`processed-data-\${i}.json\`,
            Body: JSON.stringify(completion.choices[0])
        }));
    }
}
`;
