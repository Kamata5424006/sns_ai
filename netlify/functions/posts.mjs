import { Pool } from "pg";

// Netlifyの環境変数
const connectionString =
  process.env.NETLIFY_DATABASE_URL || 
  process.env.NETLIFY_DATABASE_URL_UNPOOLED;

// DB 接続
const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
});

// テーブル初期化（初回のみ）
async function init() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS posts(
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

export default async function handler(req) {
    // POST 以外は拒否
    if(req.method == "POST"){
        return await createPost_user(req);
    }

    if(req.method == "GET"){
        return await getPosts();
    }

    return new Response(
        "Method Not Allowed", 
        { status: 405 }
    );
}

async function createPost_user(req) {
    try {
      // リクエスト body を読む
      const { text } = await req.json();
      
      if (!text || !text.trim()) {
        return new Response(
          JSON.stringify({ error: "text is required" }),
          { status: 400 }
        );
      }

      const author = "you";

      // DB に保存
      await pool.query(
        "INSERT INTO posts (text, author) VALUES ($1, $2)",
        [text, author]
      );

      // 成功レスポンス
      return new Response(
        JSON.stringify({ ok: true }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
      );
    } catch (err) {
      console.error(err);
    
      return new Response(
        JSON.stringify({ error: "failed to save post" }),
        { status: 500 }
      );
    }
}

async function getPosts(){
    try {
        const result = await pool.query(
          "SELECT id, text, author, created_at FROM posts ORDER BY id DESC"
        );
        
        return new Response(
            JSON.stringify(result.rows),
            {
                status: 200, 
                headers: { "Content-Type": "application/json" },
            }
        );
    } catch(err){
        console.error(err);
        return new Response(
            JSON.stringify({ error: "failed to get posts "}),
            { status: 500 }
        );
    }
}