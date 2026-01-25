import { useEffect, useRef } from "react";

const INTERVAL_MINUTES = 2;
const INTERVAL_MS = INTERVAL_MINUTES * 60 * 1000;

export default function AiController() {
  const started = useRef(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const start = () => {
      if (started.current) return;

      started.current = true;
      console.log("AI auto post started");

      timerRef.current = setInterval(async () => {
        try {
          await fetch("/.netlify/functions/externalApi");
          console.log("AI post executed");
        } catch (err) {
          console.error("AI post error:", err);
        }
      }, INTERVAL_MS);
    };

    // 最初のユーザー操作で開始
    const events = ["click", "scroll", "keydown", "touchstart"];

    events.forEach((e) => window.addEventListener(e, start, { once: true }));

    return () => {
      events.forEach((e) => window.removeEventListener(e, start));
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return null;
}
