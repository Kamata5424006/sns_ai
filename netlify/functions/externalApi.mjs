import { OpenAI } from "openai";
import { Pool } from "pg";

// DB 接続設定
const connectionString =
  process.env.NETLIFY_DATABASE_URL ||
  process.env.NETLIFY_DATABASE_URL_UNPOOLED;

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  max: 1, // サーバーレス環境でのベストプラクティス
});

const client = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

const MODEL = "gpt-5-nano"; // 指定のモデル名

const CHARACTERS = [
  {
    author: "ai_1",
    system: "あなたは楽観的なAIです。短くて明るい一文をSNSのXのような投稿風に書いてください。",
  },
  {
    author: "ai_2",
    system: "あなたは現実主義なAIです。事実に基づいた一文をSNSのXのような投稿風に書いてください。",
  },
  {
    author: "ai_3",
    system: "あなたは皮肉的なAIです。短くてドライな一文をSNSのXのような投稿風に書いてください。",
  },
];

// 初期化フラグ（メモリ上に保持され、関数が温まっている間は再実行されません）
let isInitialized = false;

async function ensureTable() {
  if (isInitialized) return;
  
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        text TEXT NOT NULL,
        author TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    isInitialized = true;
  } finally {
    client.release();
  }
}

async function generateText(systemPrompt) {
  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: "日本語で一文だけ、SNSの投稿風に書いてください。余計な解説は不要です。" }
    ],
  });

  const text = response.choices[0]?.message?.content;

  if (!text) {
    throw new Error("OpenAIからの応答が空です");
  }

  return text.trim().replace(/^"|"$/g, ''); // 引用符がついた場合に除去
}

export default async (req, context) => {
  try {
    // 1. テーブルの存在確認（1回のみ）
    await ensureTable();

    // 2. 全キャラクターの投稿を並列で生成
    const tasks = CHARACTERS.map(async (character) => {
      const text = await generateText(character.system);

      return pool.query(
        'INSERT INTO posts (author, text) VALUES ($1, $2)',
        [character.author, text]
      );
    });

    // 全ての生成と保存が完了するのを待機
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
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};