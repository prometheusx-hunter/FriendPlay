// Classic Ludo board = 15x15 grid of cells.
//   - Each yard is a 6x6 block in a corner.
//   - Each arm (between two neighboring yards) is 6 cells wide, 3 cells deep.
//   - The center (finish) block is 3x3, right in the middle.
// This keeps the ring path flush against the yards instead of floating as a
// small disconnected square in the middle of the board.
export const CELL = 40; // 15 * 40 = 600, matching the board's inner drawing area
const GRID = 15;

export interface Point {
  x: number;
  y: number;
}

function cellCenter(col: number, row: number): Point {
  return { x: col * CELL + CELL / 2, y: row * CELL + CELL / 2 };
}

// The 52-cell outer track, walked clockwise starting at red's entry square,
// expressed as [col, row] grid coordinates (0-indexed). Built from the
// standard Ludo layout: each arm contributes its two outer rows/columns to
// the loop, while the middle row/column of each arm is that seat's private
// home stretch (see HOME_RUN below).
const RING_PATH: [number, number][] = [
  [1, 6], [2, 6], [3, 6], [4, 6], [5, 6],
  [6, 5], [6, 4], [6, 3], [6, 2], [6, 1], [6, 0],
  [7, 0],
  [8, 0],
  [8, 1], [8, 2], [8, 3], [8, 4], [8, 5],
  [9, 6], [10, 6], [11, 6], [12, 6], [13, 6], [14, 6],
  [14, 7],
  [14, 8],
  [13, 8], [12, 8], [11, 8], [10, 8], [9, 8],
  [8, 9], [8, 10], [8, 11], [8, 12], [8, 13], [8, 14],
  [7, 14],
  [6, 14],
  [6, 13], [6, 12], [6, 11], [6, 10], [6, 9],
  [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8],
  [0, 7],
  [0, 6],
];

export function absoluteCellPoint(cell: number): Point {
  const normalized = ((cell % 52) + 52) % 52;
  const [col, row] = RING_PATH[normalized];
  return cellCenter(col, row);
}

// Each seat's 6-step home stretch: the middle row/column of the arm it
// approaches from after looping the board, running from just past the
// entry "turn" cell up to the edge of the center block.
const HOME_RUN: Record<number, { from: Point; to: Point }> = {
  0: { from: cellCenter(1, 7), to: { x: 6 * CELL, y: 7 * CELL + CELL / 2 } }, // red: West -> center
  1: { from: cellCenter(7, 1), to: { x: 7 * CELL + CELL / 2, y: 6 * CELL } }, // green: North -> center
  2: { from: cellCenter(13, 7), to: { x: 9 * CELL, y: 7 * CELL + CELL / 2 } }, // blue: East -> center
  3: { from: cellCenter(7, 13), to: { x: 7 * CELL + CELL / 2, y: 9 * CELL } }, // yellow: South -> center
};

export function homeColumnPoint(seat: number, stepIndex: number): Point {
  const { from, to } = HOME_RUN[seat];
  const t = (stepIndex + 1) / 6;
  return { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t };
}

export const FINISH_POINT: Point = cellCenter(7, 7);

const YARD_ORIGIN: Record<number, Point> = {
  0: { x: 0, y: 0 },
  1: { x: 9 * CELL, y: 0 },
  2: { x: 9 * CELL, y: 9 * CELL },
  3: { x: 0, y: 9 * CELL },
};
const YARD_SLOT_OFFSETS: Point[] = [
  { x: 70, y: 100 },
  { x: 170, y: 100 },
  { x: 70, y: 190 },
  { x: 170, y: 190 },
];

export function yardSlotPoint(seat: number, pieceId: number): Point {
  const origin = YARD_ORIGIN[seat];
  const offset = YARD_SLOT_OFFSETS[pieceId] ?? YARD_SLOT_OFFSETS[0];
  return { x: origin.x + offset.x, y: origin.y + offset.y };
}

export function yardBoxOrigin(seat: number): Point {
  return YARD_ORIGIN[seat];
}

export const YARD_BOX_SIZE = 6 * CELL; // 240 — matches the 6x6-cell yard block

export function pieceStepsToPoint(seat: number, stepsTaken: number, pieceId: number): Point {
  if (stepsTaken === -1) return yardSlotPoint(seat, pieceId);
  if (stepsTaken === 57) return FINISH_POINT;
  if (stepsTaken >= 51) return homeColumnPoint(seat, stepsTaken - 51);
  const seatOffset = seat * 13;
  return absoluteCellPoint(seatOffset + stepsTaken);
}

interface SeatColor {
  base: string;
  light: string;
  dark: string;
  label: string;
}

export const SEAT_COLORS: Record<number, SeatColor> = {
  0: { base: '#e63946', light: '#ffd9db', dark: '#a11f2a', label: 'লাল' },
  1: { base: '#2fae4e', light: '#d3f3da', dark: '#1c6e32', label: 'সবুজ' },
  2: { base: '#2f6fed', light: '#d6e3fc', dark: '#1c48ab', label: 'নীল' },
  3: { base: '#f4c11e', light: '#fdf0c4', dark: '#b98e08', label: 'হলুদ' },
};

// Start cells (0, 13, 26, 39) plus one star cell per quadrant (offset +8).
export const SAFE_CELL_ABSOLUTE = new Set([0, 8, 13, 21, 26, 34, 39, 47]);