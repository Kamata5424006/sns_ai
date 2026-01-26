import { OpenAI } from "openai";
import { Pool } from "pg";

// DB 接続
const connectionString =
  process.env.NETLIFY_DATABASE_URL ||
  process.env.NETLIFY_DATABASE_URL_UNPOOLED;

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

// テーブル初期化（初回のみ）
async function init() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        text TEXT NOT NULL,
        author TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } finally {
    client.release();
  }
}
init();

const client = new OpenAI({
  baseURL: "https://router.huggingface.co/v1",
  apiKey: process.env.AI_KEY, // Netlifyに登録した環境変数
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

export default async function handler(event, context) {
  await init();

  for (const character of CHARACTERS) {
    const text = await generateText(character.system);

    await pool.query(
      `INSERT INTO posts (author, text) VALUES ($1, $2)`,
      [character.author, text]
    );
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ ok: true, count: CHARACTERS.length })
  };
}