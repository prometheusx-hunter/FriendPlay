export type GameType = 'ludo' | 'spades' | 'twenty_nine';
export type RoomStatus = 'waiting' | 'playing' | 'finished';
export type PlayerPresence = 'connected' | 'disconnected';

export interface RoomPlayer {
  userId: string;
  username: string;
  seat: number;
  isHost: boolean;
  presence: PlayerPresence;
}

export interface RoomState {
  id: string;
  gameType: GameType;
  status: RoomStatus;
  maxPlayers: number;
  players: RoomPlayer[];
  createdAt: string;
}

export type RoomAck =
  | { ok: true; room: RoomState }
  | { ok: false; message: string };

export type LudoStatus = 'playing' | 'finished';

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

export interface ClientToServerEvents {
  'room:create': (payload: { gameType: GameType }, ack: (res: RoomAck) => void) => void;
  'room:join': (payload: { roomId: string }, ack: (res: RoomAck) => void) => void;
  'room:leave': (payload: { roomId: string }, ack: (res: { ok: boolean }) => void) => void;
  'game:start': (
    payload: { roomId: string },
    ack: (res: { ok: boolean; message?: string }) => void,
  ) => void;
  'game:rollDice': (
    payload: { roomId: string },
    ack: (res: { ok: boolean; message?: string }) => void,
  ) => void;
  'game:movePiece': (
    payload: { roomId: string; pieceId: number },
    ack: (res: { ok: boolean; message?: string }) => void,
  ) => void;
}

export interface ServerToClientEvents {
  'room:update': (room: RoomState) => void;
  'lobby:update': (rooms: RoomState[]) => void;
  'room:closed': (payload: { roomId: string; reason: string }) => void;
  'game:state': (state: LudoGameState) => void;
}