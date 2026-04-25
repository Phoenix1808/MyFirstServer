/**
 * TEST FILE: Budget-Safe (passes $50/mo policy check)
 *
 * Expected CloudGauge output:
 *   openai/gpt-4o-mini      → $6.75/mo   (10k calls × $0.00015 in + $0.0006 out)
 *   anthropic/claude-3-haiku → $13.75/mo  (10k calls × $0.00025 in + $0.00125 out)
 *   s3/get                  → $0.27/mo   (100k gets × $0.0004/1k)
 *
 *   TOTAL: ~$20.77/mo
 *   Criticality: 🟢 Low
 *   CI Check: ✅ Cost Approved (under $50/mo budget)
 */
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

const openai    = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const s3        = new S3Client({ region: "us-east-1" });

// Cheap OpenAI model — $6.75/mo
export async function quickSummarize(text) {
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: `Summarize: ${text}` }],
    max_tokens: 1000,
  });
  return res.choices[0].message.content;
}

// Cheapest Anthropic model — $13.75/mo
export async function classifyText(text) {
  const res = await anthropic.messages.create({
    model: "claude-3-haiku-20240307",
    max_tokens: 1000,
    messages: [{ role: "user", content: `Classify: ${text}` }],
  });
  return res.content[0].text;
}

// S3 read-only — $0.27/mo
export async function fetchConfig(configKey) {
  const res = await s3.send(new GetObjectCommand({
    Bucket: "app-config-bucket",
    Key: configKey,
  }));
  return res.Body;
}
