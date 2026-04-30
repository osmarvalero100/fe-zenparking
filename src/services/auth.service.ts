import { apiClient } from './api-client';
import type { TokenResponse, User, UserCreate } from '@/types';

export const authService = {
  async login(username: string, password: string): Promise<TokenResponse> {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    formData.append('grant_type', 'password');

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'https://bk-zenparking.vercel.app/api/v1'}/auth/login`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Error de autenticación' }));
      throw new Error(error.detail || 'Credenciales inválidas');
    }

    return response.json();
  },

  async register(data: UserCreate): Promise<User> {
    return apiClient.post<User>('/auth/register', data);
  },

  async logout(token: string): Promise<void> {
    await apiClient.post('/auth/logout', undefined, token);
  },

  async refreshToken(refreshTokenValue: string): Promise<TokenResponse> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'https://bk-zenparking.vercel.app/api/v1'}/auth/refresh`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${refreshTokenValue}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Token expired');
    }

    return response.json();
  },

  async requestPasswordReset(email: string): Promise<void> {
    const frontendUrl = typeof window !== 'undefined' ? `${window.location.origin}/new-password` : '';
    const url = `${process.env.NEXT_PUBLIC_API_URL || 'https://bk-zenparking.vercel.app/api/v1'}/auth/request-password-reset?email=${encodeURIComponent(email)}&frontend_url=${encodeURIComponent(frontendUrl)}`;
    await fetch(url, { method: 'POST', headers: { 'accept': 'application/json' } });
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const url = `${process.env.NEXT_PUBLIC_API_URL || 'https://bk-zenparking.vercel.app/api/v1'}/auth/reset-password?token=${encodeURIComponent(token)}&new_password=${encodeURIComponent(newPassword)}`;
    await fetch(url, { method: 'POST', headers: { 'accept': 'application/json' } });
  },

  async getCurrentUser(token: string): Promise<User> {
    return apiClient.get<User>('/users/me', token);
  },

  async changePassword(token: string, currentPassword: string, newPassword: string): Promise<void> {
    await apiClient.post('/users/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    }, token);
  },
};