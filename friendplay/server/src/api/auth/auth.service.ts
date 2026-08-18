import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../../database/client';
import { env } from '../../config/env';
import { AppError } from '../../utils/AppError';
import { LoginInput, PublicUser, RegisterInput } from './auth.types';

const SALT_ROUNDS = 12;

function toPublicUser(user: {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
}): PublicUser {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    createdAt: user.createdAt,
  };
}

function signToken(userId: string, username: string): string {
  return jwt.sign({ userId, username }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

export async function registerUser(
  input: RegisterInput,
): Promise<{ user: PublicUser; token: string }> {
  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email: input.email }, { username: input.username }],
    },
  });

  if (existing) {
    const field = existing.email === input.email ? 'Email' : 'Username';
    throw new AppError(`${field} is already taken`, 409);
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      username: input.username,
      email: input.email,
      passwordHash,
    },
  });

  const token = signToken(user.id, user.username);
  return { user: toPublicUser(user), token };
}

export async function loginUser(
  input: LoginInput,
): Promise<{ user: PublicUser; token: string }> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  // সাবধানতা: user না পেলে এবং password ভুল হলে একই generic message দেওয়া হয় —
  // এতে আক্রমণকারী বুঝতে পারবে না email-টা আদৌ রেজিস্টার করা আছে কিনা
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isValid = await bcrypt.compare(input.password, user.passwordHash);
  if (!isValid) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = signToken(user.id, user.username);
  return { user: toPublicUser(user), token };
}

export async function getUserById(userId: string): Promise<PublicUser> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return toPublicUser(user);
}
