export function countAtProgress(total: number, progress: number) {
  const bounded = Math.max(0, Math.min(1, progress));
  return Math.round(Math.max(0, total) * (1 - Math.pow(1 - bounded, 3)));
}