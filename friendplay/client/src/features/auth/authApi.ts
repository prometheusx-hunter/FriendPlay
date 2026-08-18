import axiosClient from '../../api/axiosClient';

export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export async function registerRequest(payload: RegisterPayload): Promise<User> {
  const { data } = await axiosClient.post<{ user: User }>('/auth/register', payload);
  return data.user;
}

export async function loginRequest(payload: LoginPayload): Promise<User> {
  const { data } = await axiosClient.post<{ user: User }>('/auth/login', payload);
  return data.user;
}

export async function logoutRequest(): Promise<void> {
  await axiosClient.post('/auth/logout');
}

export async function meRequest(): Promise<User> {
  const { data } = await axiosClient.get<{ user: User }>('/auth/me');
  return data.user;
}

// Backend থেকে আসা error message বের করার helper — axios error shape predictable না
export function extractErrorMessage(error: unknown, fallback: string): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response?: { data?: { message?: string } } }).response?.data?.message ===
      'string'
  ) {
    return (error as { response: { data: { message: string } } }).response.data.message;
  }
  return fallback;
}
