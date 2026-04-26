import { apiClient } from './api-client';
import type { Vehicle, BlacklistEntry } from '@/types';

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

  async getBlacklist(token: string): Promise<BlacklistEntry[]> {
    return apiClient.get<BlacklistEntry[]>('/blacklist/', token);
  },

  async checkBlacklist(token: string, plate: string): Promise<BlacklistEntry | null> {
    try {
      return await apiClient.get<BlacklistEntry>(`/vehicles/blacklist/check/${encodeURIComponent(plate)}`, token);
    } catch {
      return null;
    }
  },
};