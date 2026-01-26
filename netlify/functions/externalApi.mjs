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

const client = new OpenAI({
  apiKey: process.env.OPENAI_KEY, // Netlifyに登録した環境変数
});

const MODEL = "gpt-5-nano";

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
  const response = await client.responses.create({
      model: MODEL,
      input: systemPrompt + "\n一文だけ、日本語で、SNSの投稿風に書いてください。"
  });

  return response.output_text.trim();
}

export default async (req, context) => { // v2の書き方
  try {
    await init();

    const tasks = CHARACTERS.map(async (character) => {
      const text = await generateText(character.system);

      return pool.query(
        'INSERT INTO posts (author, text) VALUES ($1, $2)',
        [character.author, text]
      );
    });

    // 中のPromiseが全て終わるまで待つ
    await Promise.all(tasks);

    return new Response(
      JSON.stringify({ ok: true, count: CHARACTERS.length }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Function Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500 }
    );
  }
};