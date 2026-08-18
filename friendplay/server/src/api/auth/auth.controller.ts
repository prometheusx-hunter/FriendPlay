import { Request, Response } from 'express';
import { env } from '../../config/env';
import { loginSchema, registerSchema } from './auth.types';
import { getUserById, loginUser, registerUser } from './auth.service';

// Cookie-তে JWT বসানোর common options — controller-এর দুই জায়গাতেই লাগে
const cookieOptions = {
  httpOnly: true, // JavaScript দিয়ে এই cookie পড়া যাবে না (XSS থেকে সুরক্ষা)
  secure: env.isProd, // production-এ শুধু HTTPS-এ পাঠানো হবে
  sameSite: env.isProd ? ('none' as const) : ('lax' as const),
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 দিন (JWT_EXPIRES_IN-এর সাথে মিলিয়ে রাখুন)
};

export async function register(req: Request, res: Response) {
  const input = registerSchema.parse(req.body);
  const { user, token } = await registerUser(input);

  res.cookie('token', token, cookieOptions);
  res.status(201).json({ user });
}

export async function login(req: Request, res: Response) {
  const input = loginSchema.parse(req.body);
  const { user, token } = await loginUser(input);

  res.cookie('token', token, cookieOptions);
  res.status(200).json({ user });
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie('token', cookieOptions);
  res.status(200).json({ message: 'Logged out' });
}

// লগইন করা আছে কিনা চেক করতে frontend এটা কল করবে (page reload-এর পর)
export async function me(req: Request, res: Response) {
  // req.user requireAuth middleware বসিয়ে দেয়
  const user = await getUserById(req.user!.userId);
  res.status(200).json({ user });
}
