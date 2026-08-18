import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError';
import { env } from '../config/env';

// Express-এ এই middleware সবার শেষে বসে — কোনো route/service-এ throw হওয়া
// যেকোনো error এখানে এসে ধরা পড়ে এবং একটা consistent JSON response হিসেবে ফেরত যায়।
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  // Zod validation error (request body ভুল ফরম্যাটে এলে)
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: 'Invalid input',
      errors: err.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  // আমাদের নিজের ছোঁড়া expected error (যেমন: "email already registered")
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  // অপ্রত্যাশিত/unknown error — production-এ internal detail leak করা উচিত না
  console.error('Unexpected error:', err);
  return res.status(500).json({
    message: env.isProd ? 'Something went wrong' : String(err),
  });
}
