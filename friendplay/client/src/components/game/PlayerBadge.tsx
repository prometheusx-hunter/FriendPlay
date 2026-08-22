import { SEAT_COLORS } from './ludoBoardGeometry';
import type { LudoPlayerState } from '../../socket/types';

interface PlayerBadgeProps {
  seat: number;
  player: LudoPlayerState | undefined;
  isCurrentTurn: boolean;
  isSelf: boolean;
}

export function PlayerBadge({ seat, player, isCurrentTurn, isSelf }: PlayerBadgeProps) {
  const color = SEAT_COLORS[seat];

  if (!player) {
    return (
      <div className="flex w-24 flex-col items-center gap-1.5 rounded-xl border border-dashed border-felt-line p-3 opacity-50">
        <div className="h-14 w-14 rounded-full border-2 border-dashed border-felt-line" />
        <span className="text-xs text-mist">খালি</span>
      </div>
    );
  }

  const initial = player.username.charAt(0).toUpperCase();

  return (
    <div
      className={`flex w-24 flex-col items-center gap-1.5 rounded-xl border p-3 transition-colors ${
        isCurrentTurn ? 'border-gold bg-felt-dark' : 'border-felt-line bg-felt-dark/50'
      }`}
    >
      <div
        className="flex h-14 w-14 items-center justify-center rounded-full border-4 text-lg font-bold text-white"
        style={{ backgroundColor: color.base, borderColor: isCurrentTurn ? '#e8bd6a' : color.dark }}
      >
        {initial}
      </div>
      <span className="max-w-full truncate text-xs font-medium text-parchment">
        {player.username}
        {isSelf && ' (আপনি)'}
      </span>
      <span className="text-[11px] text-mist">সম্পন্ন: {player.finishedCount}/4</span>
    </div>
  );
}