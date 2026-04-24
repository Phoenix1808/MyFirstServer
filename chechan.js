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

// 🔥 Model Pool
const MODELS = {
  FAST: "gpt-4o-mini",
  BALANCED: "gpt-4o",
  HEAVY: "claude-3-opus-20240229",
};

// 🧠 Priority-based routing (different logic from previous)
function getModelByPriority(taskType) {
  switch (taskType) {
    case "thumbnail":
      return { provider: "openai", model: MODELS.FAST };
    case "content-review":
      return { provider: "openai", model: MODELS.BALANCED };
    case "security-scan":
      return { provider: "anthropic", model: MODELS.HEAVY };
    default:
      return { provider: "openai", model: MODELS.FAST };
  }
}

// 🔥 Simulated tasks per file
function classifyTask(fileName) {
  if (fileName.endsWith(".png") || fileName.endsWith(".jpg")) {
    return "thumbnail";
  }
  if (fileName.includes("auth") || fileName.includes("payment")) {
    return "security-scan";
  }
  return "content-review";
}

// 🔥 OpenAI call
async function runOpenAI(model, input) {
  const res = await openai.chat.completions.create({
    model,
    messages: [
      {
        role: "user",
        content: `Analyze this file: ${input}`,
      },
    ],
  });

  return res.choices[0];
}

// 🔥 Claude call
async function runClaude(model, input) {
  const res = await anthropic.messages.create({
    model,
    max_tokens: 400,
    messages: [
      {
        role: "user",
        content: `Perform deep security analysis on: ${input}`,
      },
    ],
  });

  return res.content[0];
}

// 🚀 Main Processing Function
export async function processFiles(files) {
  console.log("🚀 Starting intelligent file processing...");

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    // 🧠 classify workload
    const taskType = classifyTask(file.name);

    // 🧠 select model based on task
    const { provider, model } = getModelByPriority(taskType);

    console.log(`Processing ${file.name} → ${taskType} → ${provider}:${model}`);

    let result;

    try {
      if (provider === "openai") {
        result = await runOpenAI(model, file.content);
      } else {
        result = await runClaude(model, file.content);
      }
    } catch (err) {
      console.log("⚠️ Error occurred, fallback triggered");

      // 🔁 fallback to cheapest
      result = await runOpenAI(MODELS.FAST, file.content);
    }

    // 🔥 Store results in S3
    await s3.send(
      new PutObjectCommand({
        Bucket: "analysis-results-bucket",
        Key: `file-${i}.json`,
        Body: JSON.stringify({
          fileName: file.name,
          taskType,
          provider,
          model,
          result,
        }),
      })
    );
  }
}
