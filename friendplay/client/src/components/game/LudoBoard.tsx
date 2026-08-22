import { useRef } from 'react';
import { motion } from 'framer-motion';
import {
  FINISH_POINT,
  SAFE_CELL_ABSOLUTE,
  SEAT_COLORS,
  YARD_BOX_SIZE,
  absoluteCellPoint,
  homeColumnPoint,
  pieceStepsToPoint,
  yardBoxOrigin,
} from './ludoBoardGeometry';
import type { LudoGameState } from '../../socket/types';

interface LudoBoardProps {
  gameState: LudoGameState;
  currentUserId: string;
  onPieceClick: (pieceId: number) => void;
}

const SEATS = [0, 1, 2, 3];

const BOARD_FACE = '#f7f3ea';
const GRID_LINE = '#c9c2b3';
const CELL_WHITE = '#ffffff';

function RingCells() {
  return (
    <>
      {Array.from({ length: 52 }, (_, cell) => {
        const { x, y } = absoluteCellPoint(cell);
        const isStart = cell % 13 === 0;
        const seatForStart = cell / 13;
        const isSafe = SAFE_CELL_ABSOLUTE.has(cell);
        const fill = isStart ? SEAT_COLORS[seatForStart].light : CELL_WHITE;
        return (
          <g key={cell}>
            <rect
              x={x - 18}
              y={y - 18}
              width={36}
              height={36}
              fill={fill}
              stroke={GRID_LINE}
              strokeWidth={1}
            />
            {isSafe && (
              <text x={x} y={y + 6} fontSize={18} textAnchor="middle" fill="#b8860b">
                ★
              </text>
            )}
          </g>
        );
      })}
    </>
  );
}

function HomeColumns() {
  return (
    <>
      {SEATS.map((seat) =>
        Array.from({ length: 6 }, (_, i) => {
          const { x, y } = homeColumnPoint(seat, i);
          return (
            <rect
              key={`${seat}-${i}`}
              x={x - 18}
              y={y - 18}
              width={36}
              height={36}
              fill={SEAT_COLORS[seat].base}
              stroke={GRID_LINE}
              strokeWidth={1}
            />
          );
        }),
      )}
    </>
  );
}

function CenterHome() {
  const c = FINISH_POINT;
  const half = 60; // fills the full 3x3 center block (cols/rows 6-8 at 40px each)
  const corners = {
    tl: { x: c.x - half, y: c.y - half },
    tr: { x: c.x + half, y: c.y - half },
    br: { x: c.x + half, y: c.y + half },
    bl: { x: c.x - half, y: c.y + half },
  };
  const triangle = (
    p1: { x: number; y: number },
    p2: { x: number; y: number },
    color: string,
  ) => (
    <polygon
      points={`${p1.x},${p1.y} ${p2.x},${p2.y} ${c.x},${c.y}`}
      fill={color}
      stroke="#2b2b2b"
      strokeWidth={1.25}
      strokeLinejoin="round"
    />
  );
  // Top = green (seat1), Right = blue (seat2), Bottom = yellow (seat3), Left = red (seat0)
  return (
    <g>
      {triangle(corners.tl, corners.tr, SEAT_COLORS[1].base)}
      {triangle(corners.tr, corners.br, SEAT_COLORS[2].base)}
      {triangle(corners.br, corners.bl, SEAT_COLORS[3].base)}
      {triangle(corners.bl, corners.tl, SEAT_COLORS[0].base)}
      <rect
        x={corners.tl.x}
        y={corners.tl.y}
        width={half * 2}
        height={half * 2}
        fill="none"
        stroke="#1b1b1b"
        strokeWidth={1.5}
      />
    </g>
  );
}

function Yards() {
  return (
    <>
      {SEATS.map((seat) => {
        const origin = yardBoxOrigin(seat);
        return (
          <g key={seat}>
            <rect
              x={origin.x}
              y={origin.y}
              width={YARD_BOX_SIZE}
              height={YARD_BOX_SIZE}
              rx={20}
              fill={SEAT_COLORS[seat].base}
            />
            <text
              x={origin.x + YARD_BOX_SIZE / 2}
              y={origin.y + 32}
              fontSize={17}
              fontWeight={700}
              textAnchor="middle"
              fill="white"
              opacity={0.85}
              letterSpacing={1}
            >
              {SEAT_COLORS[seat].label.toUpperCase()}
            </text>
            {[
              { x: 70, y: 100 },
              { x: 170, y: 100 },
              { x: 70, y: 190 },
              { x: 170, y: 190 },
            ].map((slot, i) => (
              <circle
                key={i}
                cx={origin.x + slot.x}
                cy={origin.y + slot.y}
                r={24}
                fill={SEAT_COLORS[seat].dark}
                fillOpacity={0.55}
                stroke="white"
                strokeOpacity={0.5}
                strokeWidth={2}
              />
            ))}
          </g>
        );
      })}
    </>
  );
}

function MovableGlow({ seat }: { seat: number }) {
  const color = SEAT_COLORS[seat].base;
  return (
    <motion.circle
      r={19}
      fill="none"
      stroke={color}
      strokeWidth={3}
      initial={{ opacity: 0.7, scale: 1 }}
      animate={{ opacity: [0.7, 0, 0.7], scale: [1, 1.6, 1] }}
      transition={{ duration: 1.1, repeat: Infinity, ease: 'easeOut' }}
    />
  );
}

function Peg({ seat }: { seat: number }) {
  const gradientId = `peg-gradient-${seat}`;
  return (
    <g>
      <ellipse cx={2.5} cy={6} rx={17} ry={7} fill="black" opacity={0.25} />
      <circle r={18} fill={`url(#${gradientId})`} stroke="white" strokeWidth={1.75} />

      {/* inner groove ring, like a button-top cast piece */}
      <circle
        r={12.5}
        fill="none"
        stroke={SEAT_COLORS[seat].dark}
        strokeOpacity={0.45}
        strokeWidth={1.25}
      />

      {/* faceted gem sparkle at the center */}
      <path
        d="M0,-6.5 C1,-2 2,-1 6.5,0 C2,1 1,2 0,6.5 C-1,2 -2,1 -6.5,0 C-2,-1 -1,-2 0,-6.5 Z"
        fill="white"
        opacity={0.8}
      />
      <circle r={1.6} fill="white" opacity={0.95} />

      <circle cx={-6} cy={-6} r={6} fill="white" opacity={0.4} />
    </g>
  );
}

export function LudoBoard({ gameState, currentUserId, onPieceClick }: LudoBoardProps) {
  const isMyTurn = gameState.currentTurnUserId === currentUserId;
  const pointGroups = new Map<string, number>();
  // Remembers each piece's last stepsTaken so we can animate hop-by-hop
  // through every cell in between, instead of jumping straight to the target.
  const prevStepsRef = useRef<Map<string, number>>(new Map());

  return (
    <svg
      viewBox="0 0 640 640"
      preserveAspectRatio="xMidYMid meet"
      style={{ width: '100%', height: 'auto', maxWidth: 540, display: 'block', margin: '0 auto' }}
    >
      <defs>
        <linearGradient id="frameGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3a3a3a" />
          <stop offset="100%" stopColor="#0c0c0c" />
        </linearGradient>
        {SEATS.map((seat) => (
          <radialGradient key={seat} id={`peg-gradient-${seat}`} cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="white" stopOpacity={0.5} />
            <stop offset="45%" stopColor={SEAT_COLORS[seat].base} />
            <stop offset="100%" stopColor={SEAT_COLORS[seat].dark} />
          </radialGradient>
        ))}
      </defs>

      <rect x={0} y={0} width={640} height={640} rx={28} fill="url(#frameGradient)" />
      <rect x={20} y={20} width={600} height={600} rx={16} fill={BOARD_FACE} />

      <g transform="translate(20,20)">
        <Yards />
        <HomeColumns />
        <RingCells />
        <CenterHome />

        {gameState.players.map((player) =>
          player.pieces.map((piece) => {
            if (piece.stepsTaken === 57) return null;

            const point = pieceStepsToPoint(player.seat, piece.stepsTaken, piece.pieceId);
            const key = `${Math.round(point.x)}:${Math.round(point.y)}`;
            const stackIndex = pointGroups.get(key) ?? 0;
            pointGroups.set(key, stackIndex + 1);

            const jitter =
              stackIndex === 0
                ? { dx: 0, dy: 0 }
                : {
                    dx: Math.cos((stackIndex * Math.PI) / 2) * 10,
                    dy: Math.sin((stackIndex * Math.PI) / 2) * 10,
                  };

            const isMovable =
              isMyTurn &&
              player.userId === currentUserId &&
              gameState.movablePieceIds.includes(piece.pieceId);

            const pieceKey = `${player.userId}-${piece.pieceId}`;
            const prevSteps = prevStepsRef.current.get(pieceKey);
            prevStepsRef.current.set(pieceKey, piece.stepsTaken);

            const targetX = point.x + jitter.dx;
            const targetY = point.y + jitter.dy;

            // No previous position on record (first render) — just place it,
            // nothing to animate through.
            if (prevSteps === undefined || prevSteps === piece.stepsTaken) {
              return (
                <motion.g
                  key={pieceKey}
                  initial={false}
                  animate={{ x: targetX, y: targetY, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                  onClick={isMovable ? () => onPieceClick(piece.pieceId) : undefined}
                  style={{ cursor: isMovable ? 'pointer' : 'default' }}
                >
                  {isMovable && <MovableGlow seat={player.seat} />}
                  <Peg seat={player.seat} />
                </motion.g>
              );
            }

            const wasCaptured = prevSteps !== -1 && piece.stepsTaken === -1;

            if (wasCaptured) {
              // Sent home: a quick shrink-and-pop "poof" back to the yard,
              // rather than retracing the whole board backwards.
              return (
                <motion.g
                  key={pieceKey}
                  initial={false}
                  animate={{
                    x: targetX,
                    y: targetY,
                    scale: [1, 0.5, 1.25, 1],
                    opacity: [1, 0.5, 1, 1],
                  }}
                  transition={{ duration: 0.5, ease: 'easeIn', times: [0, 0.35, 0.7, 1] }}
                  onClick={isMovable ? () => onPieceClick(piece.pieceId) : undefined}
                  style={{ cursor: isMovable ? 'pointer' : 'default' }}
                >
                  {isMovable && <MovableGlow seat={player.seat} />}
                  <Peg seat={player.seat} />
                </motion.g>
              );
            }

            // Normal move: walk every intermediate cell between the old and
            // new step count, so the piece visibly hops along the path.
            const waypoints: { x: number; y: number }[] = [];
            const start = Math.max(prevSteps, -1);
            for (let s = start; s <= piece.stepsTaken; s += 1) {
              const p = pieceStepsToPoint(player.seat, s, piece.pieceId);
              waypoints.push(s === piece.stepsTaken ? { x: targetX, y: targetY } : p);
            }
            if (waypoints.length < 2) waypoints.unshift({ x: targetX, y: targetY });

            const xs = waypoints.map((w) => w.x);
            const ys = waypoints.map((w) => w.y);
            const times = xs.map((_, i) => i / (xs.length - 1));
            const hopDuration = Math.min(1.3, Math.max(0.28, (xs.length - 1) * 0.16));

            return (
              <motion.g
                key={pieceKey}
                initial={false}
                animate={{
                  x: xs,
                  y: ys,
                  scale: [1, 1.22, 0.9, 1],
                }}
                transition={{
                  x: { duration: hopDuration, ease: 'easeInOut', times },
                  y: { duration: hopDuration, ease: 'easeInOut', times },
                  scale: {
                    duration: 0.35,
                    times: [0, 0.4, 0.75, 1],
                    delay: hopDuration,
                    ease: 'easeOut',
                  },
                }}
                onClick={isMovable ? () => onPieceClick(piece.pieceId) : undefined}
                style={{ cursor: isMovable ? 'pointer' : 'default' }}
              >
                {isMovable && <MovableGlow seat={player.seat} />}
                <Peg seat={player.seat} />
              </motion.g>
            );
          }),
        )}
      </g>
    </svg>
  );
}