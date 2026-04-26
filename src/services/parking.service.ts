import { apiClient } from './api-client';
import type { ParkingSpot, ParkingSession, ParkingSessionCreate, CapacityAlert, SpotCreate } from '@/types';

export const parkingService = {
  async getSpots(token: string): Promise<ParkingSpot[]> {
    return apiClient.get<ParkingSpot[]>('/spots/', token);
  },

  async getAvailableSpots(token: string): Promise<ParkingSpot[]> {
    return apiClient.get<ParkingSpot[]>('/spots/available', token);
  },

  async getSpotById(token: string, spotId: number): Promise<ParkingSpot> {
    return apiClient.get<ParkingSpot>(`/spots/${spotId}`, token);
  },

  async createSpot(token: string, data: SpotCreate): Promise<ParkingSpot> {
    return apiClient.post<ParkingSpot>('/spots/', data, token);
  },

  async updateSpot(token: string, spotId: number, data: Partial<SpotCreate>): Promise<ParkingSpot> {
    return apiClient.put<ParkingSpot>(`/spots/${spotId}`, data, token);
  },

  async deleteSpot(token: string, spotId: number): Promise<void> {
    await apiClient.delete(`/spots/${spotId}`, token);
  },

  async releaseSpot(token: string, spotId: number): Promise<ParkingSpot> {
    return apiClient.post<ParkingSpot>(`/spots/${spotId}/release`, undefined, token);
  },

  async setMaintenance(token: string, spotId: number): Promise<ParkingSpot> {
    return apiClient.post<ParkingSpot>(`/spots/${spotId}/maintenance`, undefined, token);
  },

  async changeSpotStatus(token: string, spotId: number, status: string): Promise<ParkingSpot> {
    return apiClient.patch<ParkingSpot>(`/spots/${spotId}`, { status }, token);
  },

  async getZones(token: string): Promise<{ name: string; count: number }[]> {
    return apiClient.get<{ name: string; count: number }[]>('/spots/zones', token);
  },

  async getSpotsStatistics(token: string): Promise<{
    total: number;
    free: number;
    occupied: number;
    reserved: number;
    maintenance: number;
  }> {
    return apiClient.get('/spots/statistics', token);
  },

  async getSessions(token: string): Promise<ParkingSession[]> {
    return apiClient.get<ParkingSession[]>('/sessions/', token);
  },

  async getActiveSessions(token: string): Promise<ParkingSession[]> {
    return apiClient.get<ParkingSession[]>('/sessions/active', token);
  },

  async getSessionById(token: string, sessionId: number): Promise<ParkingSession> {
    return apiClient.get<ParkingSession>(`/sessions/${sessionId}`, token);
  },

  async getSessionByTicket(token: string, ticketNumber: string): Promise<ParkingSession> {
    return apiClient.get<ParkingSession>(`/sessions/ticket/${ticketNumber}`, token);
  },

  async registerEntry(token: string, data: ParkingSessionCreate): Promise<ParkingSession> {
    return apiClient.post<ParkingSession>('/sessions/entry', data, token);
  },

  async registerExit(token: string, sessionId: number, notes?: string): Promise<ParkingSession> {
    return apiClient.post<ParkingSession>(`/sessions/${sessionId}/exit`, { notes }, token);
  },

  async getCapacityAlert(token: string): Promise<CapacityAlert> {
    return apiClient.get<CapacityAlert>('/system/capacity-alert', token);
  },
};