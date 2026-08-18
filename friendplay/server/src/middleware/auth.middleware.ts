import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';

export interface AuthPayload {
  userId: string;
  username: string;
}

// Express-এর Request type-এ আমাদের custom `user` field যোগ করা হচ্ছে
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

// যেকোনো protected route-এর আগে এই middleware বসালে, cookie-তে থাকা JWT
// verify হবে এবং req.user সেট হবে। token না থাকলে বা invalid হলে 401 রিটার্ন করবে।
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.token;

  if (!token) {
    throw new AppError('Authentication required', 401);
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
    req.user = payload;
    next();
  } catch {
    throw new AppError('Invalid or expired session', 401);
  }
}
