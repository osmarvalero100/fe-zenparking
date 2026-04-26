import { apiClient } from './api-client';
import type { User, UserCreate } from '@/types';

export const usersService = {
  async getAll(token: string, skip = 0, limit = 100): Promise<User[]> {
    return apiClient.get<User[]>(`/users/?skip=${skip}&limit=${limit}`, token);
  },

  async getById(token: string, userId: number): Promise<User> {
    return apiClient.get<User>(`/users/${userId}`, token);
  },

  async create(token: string, data: UserCreate): Promise<User> {
    return apiClient.post<User>('/users/', data, token);
  },

  async activate(token: string, userId: number): Promise<void> {
    await apiClient.post(`/users/${userId}/activate`, undefined, token);
  },

  async deactivate(token: string, userId: number): Promise<void> {
    await apiClient.delete(`/users/${userId}`, token);
  },
};