// ---------------------------------------------------------------
// Ludo board geometry (standard 4-color board)
//
// প্রতিটা piece-এর অবস্থান একটা সংখ্যা (stepsTaken) দিয়ে বোঝানো হয়:
//   -1        → yard-এ (এখনো বোর্ডে নামেনি)
//    0 .. 50  → shared track-এ (৫১টা ঘর, নিজের start থেকে গোনা)
//   51 .. 56  → নিজের ঘরের home column (৬টা ঘর, private, capture হয় না)
//   57        → finished (home-এ পৌঁছে গেছে)
// ---------------------------------------------------------------

export const YARD = -1;
export const TRACK_LENGTH = 51;
export const HOME_STRETCH_LENGTH = 6;
export const FINISHED = 51 + HOME_STRETCH_LENGTH; // 57

export const SEATS_PER_GAME = 4;
export const PIECES_PER_PLAYER = 4;

export const SEAT_START_OFFSET: Record<number, number> = {
  0: 0, // লাল
  1: 13, // সবুজ
  2: 26, // হলুদ
  3: 39, // নীল
};

export const SAFE_CELLS = new Set([0, 8, 13, 21, 26, 34, 39, 47]);

export function toAbsoluteCell(seat: number, stepsTaken: number): number {
  const offset = SEAT_START_OFFSET[seat];
  return (offset + stepsTaken) % 52;
}

export function isOnSharedTrack(stepsTaken: number): boolean {
  return stepsTaken >= 0 && stepsTaken <= TRACK_LENGTH - 1;
}

export function computeDestination(stepsTaken: number, dice: number): number | null {
  if (stepsTaken === YARD) {
    return dice === 6 ? 0 : null;
  }
  const destination = stepsTaken + dice;
  if (destination > FINISHED) return null;
  return destination;
}

export interface PieceLike {
  pieceId: number;
  stepsTaken: number;
}

export function getMovablePieceIds(pieces: PieceLike[], dice: number): number[] {
  return pieces
    .filter((p) => p.stepsTaken !== FINISHED && computeDestination(p.stepsTaken, dice) !== null)
    .map((p) => p.pieceId);
}