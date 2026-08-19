import axiosClient from '../../api/axiosClient';
import type { RoomState } from '../../socket/types';

export async function listRoomsRequest(): Promise<RoomState[]> {
  const { data } = await axiosClient.get<{ rooms: RoomState[] }>('/rooms');
  return data.rooms;
}