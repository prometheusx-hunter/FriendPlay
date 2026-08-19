export interface LudoPiece {
  pieceId: number;
  stepsTaken: number;
}

export interface LudoPlayerState {
  userId: string;
  username: string;
  seat: number;
  pieces: LudoPiece[];
  finishedCount: number;
}

export type LudoStatus = 'playing' | 'finished';

export interface LudoGameState {
  roomId: string;
  status: LudoStatus;
  currentTurnUserId: string;
  lastDice: number | null;
  movablePieceIds: number[];
  hasRolled: boolean;
  players: LudoPlayerState[];
  winnerUserId: string | null;
  finishOrder: string[];
}

export type LudoActionResult =
  | { ok: true; state: LudoGameState }
  | { ok: false; message: string };