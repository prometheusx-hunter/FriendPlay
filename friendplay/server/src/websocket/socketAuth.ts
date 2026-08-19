import { parse } from 'cookie';
import jwt from 'jsonwebtoken';
import { Socket } from 'socket.io';
import { env } from '../config/env';

interface JwtPayload {
  userId: string;
  username: string;
}

export function socketAuthMiddleware(
  socket: Socket,
  next: (err?: Error) => void,
) {
  const cookieHeader = socket.handshake.headers.cookie;
  if (!cookieHeader) {
    return next(new Error('Authentication required'));
  }

  const cookies = parse(cookieHeader);
  const token = cookies.token;
  if (!token) {
    return next(new Error('Authentication required'));
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    socket.data.userId = payload.userId;
    socket.data.username = payload.username;
    next();
  } catch {
    next(new Error('Invalid or expired session'));
  }
}