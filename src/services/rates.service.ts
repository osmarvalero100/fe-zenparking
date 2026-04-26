import { apiClient } from './api-client';
import type { Rate, VehicleType } from '@/types';

export interface RateCreate {
  name: string;
  vehicle_type: VehicleType;
  price_per_minute: number;
  max_price?: number;
  description?: string;
  is_active?: boolean;
}

export interface RateUpdate {
  name?: string;
  vehicle_type?: VehicleType;
  price_per_minute?: number;
  max_price?: number;
  description?: string;
  is_active?: boolean;
}

export const ratesService = {
  async getAll(token: string): Promise<Rate[]> {
    return apiClient.get<Rate[]>('/rates/', token);
  },

  async getById(token: string, rateId: number): Promise<Rate> {
    return apiClient.get<Rate>(`/rates/${rateId}`, token);
  },

  async create(token: string, data: RateCreate): Promise<Rate> {
    return apiClient.post<Rate>('/rates/', data, token);
  },

  async update(token: string, rateId: number, data: RateUpdate): Promise<Rate> {
    return apiClient.put<Rate>(`/rates/${rateId}`, data, token);
  },

  async delete(token: string, rateId: number): Promise<void> {
    await apiClient.delete(`/rates/${rateId}`, token);
  },

  async toggleActive(token: string, rateId: number, isActive: boolean): Promise<Rate> {
    return apiClient.patch<Rate>(`/rates/${rateId}`, { is_active: isActive }, token);
  },
};