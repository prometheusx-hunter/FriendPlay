import { LudoGameState } from '../ludo/types';

class GameStore {
  private games = new Map<string, LudoGameState>();

  set(roomId: string, state: LudoGameState) {
    this.games.set(roomId, state);
  }

  get(roomId: string): LudoGameState | undefined {
    return this.games.get(roomId);
  }

  delete(roomId: string) {
    this.games.delete(roomId);
  }
}

export const gameStore = new GameStore();