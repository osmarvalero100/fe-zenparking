import { apiClient } from './api-client';
import type { ExitSession, ResidentVehicle, FineWithVehicle, FineCreate, ExpiringMonthlyPass } from '@/types';

export const finesService = {
  async getAll(token: string): Promise<FineWithVehicle[]> {
    return apiClient.get<FineWithVehicle[]>('/fines/', token);
  },

  async getById(token: string, fineId: number): Promise<FineWithVehicle> {
    return apiClient.get<FineWithVehicle>(`/fines/${fineId}`, token);
  },

  async create(token: string, data: FineCreate): Promise<FineWithVehicle> {
    return apiClient.post<FineWithVehicle>('/fines/', data, token);
  },

  async payFine(token: string, fineId: number): Promise<FineWithVehicle> {
    return apiClient.post<FineWithVehicle>(`/fines/${fineId}/pay`, undefined, token);
  },

  async getPendingFines(token: string): Promise<FineWithVehicle[]> {
    return apiClient.get<FineWithVehicle[]>('/fines/?status=pending', token);
  },
};

export const residentsService = {
  async getAll(token: string): Promise<ResidentVehicle[]> {
    return apiClient.get<ResidentVehicle[]>('/vehicles/resident', token);
  },

  async getExpiringSoon(token: string, days: number = 5): Promise<ExpiringMonthlyPass[]> {
    return apiClient.get<ExpiringMonthlyPass[]>(`/notifications/monthly-expiring?days=${days}`, token);
  },

  async create(token: string, data: {
    plate: string;
    vehicle_type: string;
    owner_name: string;
    owner_phone?: string;
    owner_email?: string;
    monthly_rate_id: number;
  }): Promise<ResidentVehicle> {
    return apiClient.post<ResidentVehicle>('/vehicles/', data, token);
  },
};

export const exitService = {
  async getSessionByTicket(token: string, ticketNumber: string): Promise<ExitSession> {
    return apiClient.get<ExitSession>(`/sessions/ticket/${encodeURIComponent(ticketNumber)}`, token);
  },

  async getSessionByPlate(token: string, plate: string): Promise<ExitSession[]> {
    return apiClient.get<ExitSession[]>(`/sessions/active?plate=${encodeURIComponent(plate)}`, token);
  },

  async processExit(token: string, sessionId: number, paymentStatus: string = 'paid', notes?: string): Promise<ExitSession> {
    return apiClient.post<ExitSession>(`/sessions/${sessionId}/exit`, {
      payment_status: paymentStatus,
      notes,
    }, token);
  },
};