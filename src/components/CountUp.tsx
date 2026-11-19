import { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';
import { countAtProgress } from '@/lib/count-up';

export default function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (reduceMotion) { setDisplay(value); return; }
    if (!inView) return;
    setDisplay(0);
    let frame = 0;
    let start: number | undefined;
    const tick = (now: number) => {
      start ??= now;
      const progress = Math.min((now - start) / 1600, 1);
      setDisplay(countAtProgress(value, progress));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, inView, reduceMotion]);

  return <span ref={ref} className="inline-block min-w-[2ch] tabular-nums"><span aria-hidden="true">{display}</span><span className="sr-only">{value}</span></span>;
}