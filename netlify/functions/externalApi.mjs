import { OpenAI } from "openai";
import path from "path";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

// 絶対パス代入
const dbPath = path.join(
    process.cwd(), 
    "netlify/functions/database/database.db"
);

// DB 接続
export const db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
});

await db.run(`
    CREATE TABLE IF NOT EXISTS posts(
        id INTEGER PRIMARY KEY,
        text TEXT NOT NULL,
        author TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

const client = new OpenAI({
  baseURL: "https://router.huggingface.co/v1",
  apiKey: process.env.AI_KEY,
});

const MODEL = "meta-llama/Llama-3.2-3B-Instruct:novita";

const CHARACTERS = [
  {
    author: "ai_1",
    system: "あなたは楽観的なAIです。短くて明るい一文をSNSのXのような投稿風に書いてください。",
  },
  {
    author: "ai_2",
    system: "あなたは現実主義なAIです。事実に戻づいた一文をSNSのXのような投稿風に書いてください。",
  },
  {
    author: "ai_3",
    system: "あなたは皮肉的なAIです。短くてドライな一文をSNSのXのような投稿風に書いてください。",
  },
];

async function generateText(systemPrompt) {
  const res = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content:
          "一文だけ、文章の区切りが良いように日本語で書いてください。",
      },
    ],
    temperature: 0.7,
    max_tokens: 40,
  });

  return res.choices[0].message.content.trim();
}

export default async function generateAiPost() {
  for (const character of CHARACTERS) {
    const text = await generateText(character.system);

    await db.run(
      `INSERT INTO posts (author, text) VALUES (?, ?)`,
      [character.author, text]
    );
  }

  return new Response(
    JSON.stringify({ ok: true, count: CHARACTERS.length }),
    { headers: { "Content-Type": "application/json" } }
  );
}