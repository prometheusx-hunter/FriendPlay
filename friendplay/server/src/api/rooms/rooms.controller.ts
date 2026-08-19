import { Request, Response } from 'express';
import { roomStore } from '../../websocket/roomStore';

export async function listRooms(_req: Request, res: Response) {
  res.status(200).json({ rooms: roomStore.listOpenRooms() });
}