import { OpenAI } from 'openai';
const openai = new OpenAI();
export async function processData() {
    await openai.chat.completions.create({ model: "gpt-4", messages: [] });
}
