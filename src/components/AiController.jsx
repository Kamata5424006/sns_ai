import { useEffect, useRef } from "react";

const INTERVAL_MINUTES = 2;
const INTERVAL_MS = INTERVAL_MINUTES * 60 * 1000;

export default function AiController() {
  const started = useRef(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const start = async () => {
      if (started.current) return;
      started.current = true;

      console.log("AI auto post started");

      // 初回即実行
      try {
        await fetch("/.netlify/functions/externalApi", { method: "POST" });
        console.log("AI post executed");
      } catch (err) {
        console.error("AI post error:", err);
      }

      timerRef.current = setInterval(async () => {
        try {
          await fetch("/.netlify/functions/externalApi", { method: "POST" });
          console.log("AI post executed");
        } catch (err) {
          console.error("AI post error:", err);
        }
      }, INTERVAL_MS);
    };

    const handler = () => start();

    window.addEventListener("click", handler, { once: true });
    window.addEventListener("scroll", handler, { once: true });
    window.addEventListener("keydown", handler, { once: true });
    window.addEventListener("touchstart", handler, { once: true });

    return () => {
      window.removeEventListener("click", handler);
      window.removeEventListener("scroll", handler);
      window.removeEventListener("keydown", handler);
      window.removeEventListener("touchstart", handler);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return null;
}
