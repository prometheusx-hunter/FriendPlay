import {
  FINISHED,
  PIECES_PER_PLAYER,
  SAFE_CELLS,
  YARD,
  computeDestination,
  getMovablePieceIds,
  isOnSharedTrack,
  toAbsoluteCell,
} from './rules';
import { LudoActionResult, LudoGameState, LudoPlayerState } from './types';

const MAX_CONSECUTIVE_SIXES = 3;

const consecutiveSixesByRoom = new Map<string, number>();

export function createLudoGame(
  roomId: string,
  players: { userId: string; username: string; seat: number }[],
): LudoGameState {
  const sortedPlayers = [...players].sort((a, b) => a.seat - b.seat);

  const playerStates: LudoPlayerState[] = sortedPlayers.map((p) => ({
    userId: p.userId,
    username: p.username,
    seat: p.seat,
    finishedCount: 0,
    pieces: Array.from({ length: PIECES_PER_PLAYER }, (_, pieceId) => ({
      pieceId,
      stepsTaken: YARD,
    })),
  }));

  consecutiveSixesByRoom.set(roomId, 0);

  return {
    roomId,
    status: 'playing',
    currentTurnUserId: playerStates[0].userId,
    lastDice: null,
    movablePieceIds: [],
    hasRolled: false,
    players: playerStates,
    winnerUserId: null,
    finishOrder: [],
  };
}

export function rollDice(state: LudoGameState, userId: string): LudoActionResult {
  if (state.status !== 'playing') {
    return { ok: false, message: 'খেলা শেষ হয়ে গেছে' };
  }
  if (state.currentTurnUserId !== userId) {
    return { ok: false, message: 'এখন আপনার turn না' };
  }
  if (state.hasRolled) {
    return { ok: false, message: 'ইতিমধ্যে dice roll করা হয়েছে, এখন piece move করুন' };
  }

  const dice = Math.floor(Math.random() * 6) + 1;
  const player = state.players.find((p) => p.userId === userId)!;
  const movablePieceIds = getMovablePieceIds(player.pieces, dice);

  state.lastDice = dice;
  state.hasRolled = true;
  state.movablePieceIds = movablePieceIds;

    if (movablePieceIds.length === 0) {
    state.hasRolled = false;
    advanceTurn(state);
  }

  return { ok: true, state };
}

export function movePiece(
  state: LudoGameState,
  userId: string,
  pieceId: number,
): LudoActionResult {
  if (state.status !== 'playing') {
    return { ok: false, message: 'খেলা শেষ হয়ে গেছে' };
  }
  if (state.currentTurnUserId !== userId) {
    return { ok: false, message: 'এখন আপনার turn না' };
  }
  if (!state.hasRolled || state.lastDice === null) {
    return { ok: false, message: 'আগে dice roll করুন' };
  }
  if (!state.movablePieceIds.includes(pieceId)) {
    return { ok: false, message: 'এই piece-টা এখন move করা যাবে না' };
  }

  const player = state.players.find((p) => p.userId === userId)!;
  const piece = player.pieces.find((p) => p.pieceId === pieceId)!;
  const destination = computeDestination(piece.stepsTaken, state.lastDice)!;

  piece.stepsTaken = destination;

  let captured = false;
  if (isOnSharedTrack(destination)) {
    const absoluteCell = toAbsoluteCell(player.seat, destination);
    if (!SAFE_CELLS.has(absoluteCell)) {
      captured = capturePiecesAt(state, player.userId, absoluteCell);
    }
  }

  let justFinishedPiece = false;
  if (destination === FINISHED) {
    justFinishedPiece = true;
    player.finishedCount += 1;
    if (player.finishedCount === PIECES_PER_PLAYER && !state.finishOrder.includes(player.userId)) {
      state.finishOrder.push(player.userId);
      if (!state.winnerUserId) {
        state.winnerUserId = player.userId;
      }
    }
  }

  const stillPlaying = state.players.filter((p) => p.finishedCount < PIECES_PER_PLAYER);
  if (stillPlaying.length <= 1) {
    state.status = 'finished';
    if (stillPlaying.length === 1 && !state.finishOrder.includes(stillPlaying[0].userId)) {
      state.finishOrder.push(stillPlaying[0].userId);
    }
    state.hasRolled = false;
    state.movablePieceIds = [];
    cleanupLudoGame(state.roomId);
    return { ok: true, state };
  }

  const earnsExtraTurn = state.lastDice === 6 || captured || justFinishedPiece;
  state.hasRolled = false;
  state.movablePieceIds = [];

  if (earnsExtraTurn) {
    if (state.lastDice === 6) {
      const sixes = (consecutiveSixesByRoom.get(state.roomId) ?? 0) + 1;
      if (sixes >= MAX_CONSECUTIVE_SIXES) {
        consecutiveSixesByRoom.set(state.roomId, 0);
        advanceTurn(state);
        return { ok: true, state };
      }
      consecutiveSixesByRoom.set(state.roomId, sixes);
    }
    return { ok: true, state };
  }

  consecutiveSixesByRoom.set(state.roomId, 0);
  advanceTurn(state);
  return { ok: true, state };
}

function capturePiecesAt(
  state: LudoGameState,
  movingUserId: string,
  absoluteCell: number,
): boolean {
  let captured = false;
  for (const opponent of state.players) {
    if (opponent.userId === movingUserId) continue;
    for (const piece of opponent.pieces) {
      if (!isOnSharedTrack(piece.stepsTaken)) continue;
      if (toAbsoluteCell(opponent.seat, piece.stepsTaken) === absoluteCell) {
        piece.stepsTaken = YARD;
        captured = true;
      }
    }
  }
  return captured;
}

function advanceTurn(state: LudoGameState) {
  const activeUserIds = state.players
    .filter((p) => p.finishedCount < PIECES_PER_PLAYER)
    .sort((a, b) => a.seat - b.seat)
    .map((p) => p.userId);

  const currentIndex = activeUserIds.indexOf(state.currentTurnUserId);
  const nextIndex = (currentIndex + 1) % activeUserIds.length;
  state.currentTurnUserId = activeUserIds[nextIndex];
}

export function cleanupLudoGame(roomId: string) {
  consecutiveSixesByRoom.delete(roomId);
}