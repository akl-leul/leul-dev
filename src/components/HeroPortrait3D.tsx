import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

/** Blueprint portrait with layered 3D depth that tilts toward the cursor. */
const HeroPortrait3D = () => {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 120, damping: 18 });
  const sy = useSpring(my, { stiffness: 120, damping: 18 });
  const rotateY = useTransform(sx, [-0.5, 0.5], [-14, 14]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [10, -10]);
  const gridX = useTransform(sx, [-0.5, 0.5], [-18, 18]);
  const gridY = useTransform(sy, [-0.5, 0.5], [-18, 18]);

  const onMove = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const reset = () => { mx.set(0); my.set(0); };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.9 }}
      className="relative mx-auto w-full max-w-[460px] [perspective:1200px]"
    >
      <motion.div style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }} className="relative">
        {/* Back layer: blueprint plate */}
        <motion.div
          style={{ x: gridX, y: gridY, transform: 'translateZ(-80px)' }}
          className="absolute inset-[8%_4%_4%_4%] border border-border rounded-sm bg-[linear-gradient(hsl(var(--border)/0.35)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border)/0.35)_1px,transparent_1px)] bg-[size:28px_28px]"
        />
        {/* Glow */}
        <div
          style={{ transform: 'translateZ(-40px)' }}
          className="absolute left-1/2 top-1/3 -translate-x-1/2 w-3/4 aspect-square rounded-full bg-primary/30 blur-3xl"
        />
        {/* Portrait */}
        <img
          src="/leul-portrait.png"
          alt="Leul — blueprint portrait"
          style={{ transform: 'translateZ(40px)' }}
          className="relative w-full h-auto drop-shadow-[0_30px_40px_hsl(var(--primary)/0.45)]"
        />
        {/* Front accent */}
        <div style={{ transform: 'translateZ(90px)' }} className="absolute -left-2 bottom-[12%] bp-mono text-[10px] tracking-widest text-primary border border-primary/60 bg-background/70 backdrop-blur px-3 py-1.5">
          FIG. 01 — 3D ELEVATION
        </div>
      </motion.div>
    </motion.div>
  );
};

export default HeroPortrait3D;
