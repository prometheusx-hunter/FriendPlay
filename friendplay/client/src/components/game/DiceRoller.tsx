import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const PIP_LAYOUTS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[30, 30], [70, 70]],
  3: [[30, 30], [50, 50], [70, 70]],
  4: [[30, 30], [70, 30], [30, 70], [70, 70]],
  5: [[30, 30], [70, 30], [50, 50], [30, 70], [70, 70]],
  6: [[30, 25], [70, 25], [30, 50], [70, 50], [30, 75], [70, 75]],
};

function DiceFace({ value }: { value: number }) {
  const pips = PIP_LAYOUTS[value] ?? [];
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <defs>
        <linearGradient id="diceFaceGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e7e2d6" />
        </linearGradient>
      </defs>
      <ellipse cx={52} cy={94} rx={40} ry={6} fill="black" opacity={0.25} />
      <rect
        x="4" y="4" width="92" height="92" rx="26"
        fill="url(#diceFaceGradient)" stroke="#c9c2b3" strokeWidth="2"
      />
      <ellipse cx={34} cy={28} rx={28} ry={18} fill="white" opacity={0.35} />
      <ellipse cx={34} cy={28} rx={14} ry={9} fill="white" opacity={0.35} />
      {pips.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={8} fill="#1b2420" />
      ))}
    </svg>
  );
}

interface DiceRollerProps {
  value: number | null;
  canRoll: boolean;
  onRoll: () => void;
}

const SPIN_TICKS = 20;
const TICK_MS = 90;

export function DiceRoller({ value, canRoll, onRoll }: DiceRollerProps) {
  const [displayValue, setDisplayValue] = useState(value ?? 1);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinRotation, setSpinRotation] = useState(0);
  const prevValue = useRef(value);

  useEffect(() => {
    if (value === null || value === prevValue.current) return;
    prevValue.current = value;
    // Spin 5–7 full turns forward from wherever it last landed — always a
    // clean multiple of 360 so it lands flat, and never snaps backward to 0,
    // so consecutive rolls feel like one continuous roll.
    const extraSpins = 5 + Math.floor(Math.random() * 3);
    setSpinRotation((r) => r + extraSpins * 360);
    setIsSpinning(true);

    let ticks = 0;
    const interval = setInterval(() => {
      setDisplayValue(1 + Math.floor(Math.random() * 6));
      ticks += 1;
      if (ticks >= SPIN_TICKS) {
        clearInterval(interval);
        setDisplayValue(value);
        setIsSpinning(false);
      }
    }, TICK_MS);

    return () => clearInterval(interval);
  }, [value]);

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-16 w-16" style={{ perspective: 500 }}>
        <motion.div
          className="absolute inset-x-2 bottom-0 h-2 rounded-full bg-black/30 blur-[3px]"
          animate={
            isSpinning
              ? { opacity: [0.35, 0.14, 0.3, 0.14, 0.3, 0.16, 0.35], scaleX: [1, 0.6, 0.85, 0.62, 0.8, 0.7, 1] }
              : { opacity: 0.35, scaleX: 1 }
          }
          transition={
            isSpinning
              ? { duration: (SPIN_TICKS * TICK_MS) / 1000, ease: 'easeInOut' }
              : { type: 'spring', stiffness: 420, damping: 11, mass: 0.7 }
          }
        />
        <motion.div
          className="h-16 w-16"
          style={{ transformStyle: 'preserve-3d' }}
          animate={
            isSpinning
              ? {
                  rotateY: spinRotation,
                  rotateX: [0, 10, -8, 6, -4, 0],
                  scale: [1, 1.08, 0.95, 1.05, 0.97, 1],
                }
              : { scale: 1 }
          }
          transition={
            isSpinning
              ? {
                  rotateY: { duration: (SPIN_TICKS * TICK_MS) / 1000, ease: [0.13, 0.72, 0.2, 1] },
                  rotateX: { duration: (SPIN_TICKS * TICK_MS) / 1000, ease: 'easeInOut' },
                  scale: { duration: (SPIN_TICKS * TICK_MS) / 1000, ease: 'easeInOut' },
                }
              : { type: 'spring', stiffness: 380, damping: 13, mass: 0.8 }
          }
        >
          <DiceFace value={displayValue} />
        </motion.div>
      </div>

      <motion.button
        onClick={onRoll}
        disabled={!canRoll || isSpinning}
        whileHover={canRoll && !isSpinning ? { scale: 1.05 } : undefined}
        whileTap={canRoll && !isSpinning ? { scale: 0.94 } : undefined}
        animate={
          canRoll && !isSpinning
            ? { boxShadow: ['0 0 0 0 rgba(184,134,11,0.45)', '0 0 0 10px rgba(184,134,11,0)'] }
            : { boxShadow: '0 0 0 0 rgba(184,134,11,0)' }
        }
        transition={
          canRoll && !isSpinning
            ? { duration: 1.4, repeat: Infinity, ease: 'easeOut' }
            : { duration: 0.2 }
        }
        className="rounded-full border-2 border-felt-line bg-parchment px-6 py-2 font-body text-sm font-bold tracking-wide text-ink disabled:cursor-not-allowed disabled:opacity-40"
      >
        ROLL
      </motion.button>
    </div>
  );
}