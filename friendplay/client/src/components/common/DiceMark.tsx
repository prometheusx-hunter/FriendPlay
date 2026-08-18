import { motion } from 'framer-motion';

// একটা ছোট idle-animated die — পুরো auth পেজের "signature element"।
// এটা ধীরে ধীরে দোলে (settle হওয়া dice-এর মতো), যা game-এর dice-roll animation-কে ইঙ্গিত দেয়।
export function DiceMark() {
  const pips: [number, number][] = [
    [30, 30],
    [70, 30],
    [50, 50],
    [30, 70],
    [70, 70],
  ];

  return (
    <motion.div
      className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-parchment shadow-lg"
      animate={{ rotate: [0, -8, 6, -3, 0] }}
      transition={{
        duration: 4,
        repeat: Infinity,
        repeatDelay: 2,
        ease: 'easeInOut',
      }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" className="h-8 w-8">
        {pips.map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={9} fill="var(--color-ruby)" />
        ))}
      </svg>
    </motion.div>
  );
}
