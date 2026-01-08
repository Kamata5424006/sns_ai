import 'dotenv/config';
import generateAiPost from "../netlify/functions/externalApi.mjs";

// 何分おきに投稿するか
const INTERVAL_MINUTES = 2;
const INTERVAL_MS = INTERVAL_MINUTES * 60 * 1000;

// 端末起動時にログ表示
console.log(`AI auto post started. Interval: ${INTERVAL_MINUTES} minutes`);

// メイン関数（1回分の処理）
async function runAiPost() {
  try {
    console.log("[AI] Generating post...");
    await generateAiPost();
    console.log("[AI] Post created successfully.");
  } catch (err) {
    console.error("[AI] Error generating post:", err);
  }
}

// 起動時に1回実行（任意）
await runAiPost();

// 以降、定期実行
setInterval(runAiPost, INTERVAL_MS);