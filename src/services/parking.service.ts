import { apiClient } from './api-client';
import type { ParkingSpot, ParkingSession, ParkingSessionCreate, CapacityAlert } from '@/types';

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

  async releaseSpot(token: string, spotId: number): Promise<ParkingSpot> {
    return apiClient.post<ParkingSpot>(`/spots/${spotId}/release`, undefined, token);
  },

  async setMaintenance(token: string, spotId: number): Promise<ParkingSpot> {
    return apiClient.post<ParkingSpot>(`/spots/${spotId}/maintenance`, undefined, token);
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