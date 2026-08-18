import { Request, Response } from 'express';
import { getUserById } from '../auth/auth.service';
import { AppError } from '../../utils/AppError';

export async function getUserProfile(
  req: Request<{ id: string }>,
  res: Response,
) {
  const { id } = req.params;
  if (!id) {
    throw new AppError('User id is required', 400);
  }
  const user = await getUserById(id);
  res.status(200).json({ user });
}
