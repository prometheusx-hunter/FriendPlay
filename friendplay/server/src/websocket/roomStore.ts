import { GameType, RoomPlayer, RoomState, RoomStatus } from './types';

const RECONNECT_GRACE_MS = 30_000; // disconnect হওয়ার পর এই সময় পর্যন্ত সিট ধরে রাখা হয়
const MAX_PLAYERS_BY_GAME: Record<GameType, number> = {
  ludo: 4,
  spades: 4,
  twenty_nine: 4,
};

interface InternalPlayer {
  userId: string;
  username: string;
  socketId: string;
  seat: number;
  isHost: boolean;
  presence: 'connected' | 'disconnected';
  removalTimer?: NodeJS.Timeout;
}

interface InternalRoom {
  id: string;
  gameType: GameType;
  status: RoomStatus;
  maxPlayers: number;
  players: Map<string, InternalPlayer>; // key: userId
  createdAt: Date;
}

const ROOM_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // ambiguous character বাদ (0/O, 1/I)

function generateRoomCode(): string {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)];
  }
  return code;
}

class RoomStore {
  private rooms = new Map<string, InternalRoom>();
  private userRoomIndex = new Map<string, string>(); // userId -> roomId

  createRoom(
    gameType: GameType,
    host: { userId: string; username: string; socketId: string },
  ): RoomState {
    const existingRoomId = this.userRoomIndex.get(host.userId);
    if (existingRoomId) {
      this.removePlayer(existingRoomId, host.userId);
    }

    let id = generateRoomCode();
    while (this.rooms.has(id)) {
      id = generateRoomCode();
    }

    const room: InternalRoom = {
      id,
      gameType,
      status: 'waiting',
      maxPlayers: MAX_PLAYERS_BY_GAME[gameType],
      players: new Map(),
      createdAt: new Date(),
    };

    room.players.set(host.userId, {
      userId: host.userId,
      username: host.username,
      socketId: host.socketId,
      seat: 0,
      isHost: true,
      presence: 'connected',
    });

    this.rooms.set(id, room);
    this.userRoomIndex.set(host.userId, id);

    return this.toPublicState(room);
  }

  joinRoom(
    roomId: string,
    player: { userId: string; username: string; socketId: string },
  ): { ok: true; room: RoomState } | { ok: false; message: string } {
    const room = this.rooms.get(roomId);
    if (!room) {
      return { ok: false, message: 'Room পাওয়া যায়নি' };
    }

    const existing = room.players.get(player.userId);
    if (existing) {
      this.clearRemovalTimer(existing);
      existing.socketId = player.socketId;
      existing.presence = 'connected';
      return { ok: true, room: this.toPublicState(room) };
    }

    if (room.status !== 'waiting') {
      return { ok: false, message: 'খেলা ইতিমধ্যে শুরু হয়ে গেছে' };
    }
    if (room.players.size >= room.maxPlayers) {
      return { ok: false, message: 'Room পূর্ণ' };
    }

    const previousRoomId = this.userRoomIndex.get(player.userId);
    if (previousRoomId && previousRoomId !== roomId) {
      this.removePlayer(previousRoomId, player.userId);
    }

    const takenSeats = new Set(Array.from(room.players.values()).map((p) => p.seat));
    let seat = 0;
    while (takenSeats.has(seat)) seat++;

    room.players.set(player.userId, {
      userId: player.userId,
      username: player.username,
      socketId: player.socketId,
      seat,
      isHost: false,
      presence: 'connected',
    });

    this.userRoomIndex.set(player.userId, roomId);
    return { ok: true, room: this.toPublicState(room) };
  }

  removePlayer(roomId: string, userId: string): RoomState | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const player = room.players.get(userId);
    if (player) {
      this.clearRemovalTimer(player);
    }

    room.players.delete(userId);
    this.userRoomIndex.delete(userId);

    if (room.players.size === 0) {
      this.rooms.delete(roomId);
      return null;
    }

    this.promoteHostIfNeeded(room);
    return this.toPublicState(room);
  }

  markDisconnected(userId: string): { roomId: string; room: RoomState } | null {
    const roomId = this.userRoomIndex.get(userId);
    if (!roomId) return null;

    const room = this.rooms.get(roomId);
    const player = room?.players.get(userId);
    if (!room || !player) return null;

    player.presence = 'disconnected';
    player.removalTimer = setTimeout(() => {
      const remainingRoom = this.removePlayer(roomId, userId);
      onRoomExpired(roomId, remainingRoom);
    }, RECONNECT_GRACE_MS);

    return { roomId, room: this.toPublicState(room) };
  }

  getRoomIdForUser(userId: string): string | undefined {
    return this.userRoomIndex.get(userId);
  }

  getRoom(roomId: string): RoomState | undefined {
    const room = this.rooms.get(roomId);
    return room ? this.toPublicState(room) : undefined;
  }

  listOpenRooms(): RoomState[] {
    return Array.from(this.rooms.values())
      .filter((room) => room.status === 'waiting')
      .map((room) => this.toPublicState(room));
  }

    /** Host game শুরু করলে — validation + status বদলানো, খেলোয়াড়দের seat/username ফেরত দেয় (engine init-এর জন্য) */
  startGame(
    roomId: string,
    userId: string,
  ):
    | { ok: true; players: { userId: string; username: string; seat: number }[] }
    | { ok: false; message: string } {
    const room = this.rooms.get(roomId);
    if (!room) {
      return { ok: false, message: 'Room পাওয়া যায়নি' };
    }
    const requester = room.players.get(userId);
    if (!requester?.isHost) {
      return { ok: false, message: 'শুধু host game শুরু করতে পারবে' };
    }
    if (room.status !== 'waiting') {
      return { ok: false, message: 'Game ইতিমধ্যে শুরু হয়ে গেছে' };
    }
    if (room.players.size < 2) {
      return { ok: false, message: 'শুরু করতে অন্তত ২ জন খেলোয়াড় লাগবে' };
    }

    room.status = 'playing';
    const players = Array.from(room.players.values()).map((p) => ({
      userId: p.userId,
      username: p.username,
      seat: p.seat,
    }));
    return { ok: true, players };
  }

  /** Game শেষ হলে room status বদলানোর জন্য */
  setStatus(roomId: string, status: RoomStatus): RoomState | undefined {
    const room = this.rooms.get(roomId);
    if (!room) return undefined;
    room.status = status;
    return this.toPublicState(room);
  }

  private clearRemovalTimer(player: InternalPlayer) {
    if (player.removalTimer) {
      clearTimeout(player.removalTimer);
      player.removalTimer = undefined;
    }
  }

  private promoteHostIfNeeded(room: InternalRoom) {
    const hasHost = Array.from(room.players.values()).some((p) => p.isHost);
    if (hasHost) return;
    const nextHost = Array.from(room.players.values()).sort((a, b) => a.seat - b.seat)[0];
    if (nextHost) nextHost.isHost = true;
  }

  private toPublicState(room: InternalRoom): RoomState {
    const players: RoomPlayer[] = Array.from(room.players.values())
      .sort((a, b) => a.seat - b.seat)
      .map((p) => ({
        userId: p.userId,
        username: p.username,
        seat: p.seat,
        isHost: p.isHost,
        presence: p.presence,
      }));

    return {
      id: room.id,
      gameType: room.gameType,
      status: room.status,
      maxPlayers: room.maxPlayers,
      players,
      createdAt: room.createdAt.toISOString(),
    };
  }
}

let onRoomExpired: (roomId: string, room: RoomState | null) => void = () => {};
export function setOnRoomExpired(cb: (roomId: string, room: RoomState | null) => void) {
  onRoomExpired = cb;
}

export const roomStore = new RoomStore();