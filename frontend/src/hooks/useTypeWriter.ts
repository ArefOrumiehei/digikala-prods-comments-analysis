import { useState, useEffect, useRef } from "react";

export function useTypewriter(text: string, speed = 18, trigger = true) {
  const [displayed, setDisplayed] = useState("");
  const [isDone, setIsDone]       = useState(false);

  const intervalRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const indexRef     = useRef(0);
  const prevTextRef  = useRef("");

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (!trigger || !text) return;

    if (prevTextRef.current !== text) {
      prevTextRef.current = text;
      indexRef.current    = 0;
    }

    intervalRef.current = setInterval(() => {
      indexRef.current += 1;
      const next = indexRef.current;

      setDisplayed(text.slice(0, next));

      if (next >= text.length) {
        clearInterval(intervalRef.current!);
        setIsDone(true);
      }
    }, speed);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text, trigger, speed]);

  return { displayed, isDone };
}