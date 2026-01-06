import sqlite3 from "sqlite3";
import { open } from "sqlite";

// DB 接続
const dbPromise = open({
  filename: "./database/database.db",
  driver: sqlite3.Database,
});

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
    
    const db = await dbPromise;
    
    // DB に保存
    await db.run(
      `INSERT INTO posts (text, author) VALUES (?, ?)`,
      text,
      author
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
        const db = await dbPromise;

        // dbの全行代入
        const rows = await db.all(
            "SELECT id, text, author, created_at FROM posts ORDER BY id DESC"
        );

        return new Response(
            JSON.stringify(rows),
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