import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  const { cleanedLines } = await req.json();

  const prompt = `
  You are an assistant that extracts structured information from a parsed receipt.

  Here is the parsed receipt as an array of lines:
  ${JSON.stringify(cleanedLines, null, 2)}
  
  Please extract the following fields: 
  - **Date** (format as "YYYY-MM-DD", even if original is like "2025年05月20日（火）16:58")
  - **Merchant** or store name
  - **Total amount spent**, formatted in Japanese yen (e.g., "¥1,234")
  - **Expense category** (choose one: Groceries, Dining Out, Transportation, Rent & Utilities, Health & Wellness, Entertainment & Subscriptions, Personal Care & Shopping, Miscellaneous) — based on the listed items

  Return the result as a JSON object with the structure:
  {
    "date": "",
    "merchant": "",
    "amount": "¥ 0",
    "category": ""
  }
  `

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: 'user', content: prompt }],
  });

  const message = response.choices[0].message.content;
  return NextResponse.json({ result: message });
}
