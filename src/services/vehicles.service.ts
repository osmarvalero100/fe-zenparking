import { apiClient } from './api-client';
import type { Vehicle, BlacklistEntry, BlacklistCheckResponse } from '@/types';

export const vehiclesService = {
  async getAll(token: string): Promise<Vehicle[]> {
    return apiClient.get<Vehicle[]>('/vehicles/', token);
  },

  async getById(token: string, vehicleId: number): Promise<Vehicle> {
    return apiClient.get<Vehicle>(`/vehicles/${vehicleId}`, token);
  },

  async getByPlate(token: string, plate: string): Promise<Vehicle> {
    return apiClient.get<Vehicle>(`/vehicles/plate/${encodeURIComponent(plate)}`, token);
  },

  async create(token: string, data: Partial<Vehicle>): Promise<Vehicle> {
    return apiClient.post<Vehicle>('/vehicles/', data, token);
  },

  async update(token: string, vehicleId: number, data: Partial<Vehicle>): Promise<Vehicle> {
    return apiClient.put<Vehicle>(`/vehicles/${vehicleId}`, data, token);
  },

  async delete(token: string, vehicleId: number): Promise<void> {
    await apiClient.delete(`/vehicles/${vehicleId}`, token);
  },

  async getResident(token: string): Promise<Vehicle[]> {
    return apiClient.get<Vehicle[]>('/vehicles/resident', token);
  },

  async getBlacklist(token: string): Promise<BlacklistEntry[]> {
    return apiClient.get<BlacklistEntry[]>('/blacklist/', token);
  },

  async checkBlacklist(token: string, plate: string): Promise<BlacklistCheckResponse | null> {
    try {
      return await apiClient.get<BlacklistCheckResponse>(`/vehicles/blacklist/check/${encodeURIComponent(plate)}`, token);
    } catch {
      return null;
    }
  },

  async addToBlacklist(token: string, vehicleId: number, reason: string, alertLevel: 'low' | 'medium' | 'high'): Promise<BlacklistEntry> {
    return apiClient.post<BlacklistEntry>('/blacklist/', {
      vehicle_id: vehicleId,
      reason,
      alert_level: alertLevel,
    }, token);
  },

  async updateBlacklistEntry(token: string, blacklistId: number, data: { reason?: string; alert_level?: 'low' | 'medium' | 'high'; is_active?: boolean }): Promise<BlacklistEntry> {
    return apiClient.patch<BlacklistEntry>(`/blacklist/${blacklistId}`, data, token);
  },

  async removeFromBlacklist(token: string, blacklistId: number): Promise<void> {
    await apiClient.delete(`/blacklist/${blacklistId}`, token);
  },
};