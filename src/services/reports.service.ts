import { apiClient, API_BASE_URL } from './api-client';
import type { AuditLog, Fine } from '@/types';

export const reportsService = {
  async getDailyMovements(token: string, date?: string) {
    const params = date ? `?date=${date}` : '';
    return apiClient.get(`/reports/daily-movements${params}`, token);
  },

  async getDailyMovementsCsv(token: string, date?: string): Promise<string> {
    const params = date ? `?date=${date}` : '';
    const response = await fetch(
      `${API_BASE_URL}/reports/daily-movements-csv${params}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        mode: 'cors',
      }
    );
    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(errorText || `Error ${response.status}: No se pudo descargar el reporte`);
    }
    return response.text();
  },

  async getAuditLogs(token: string): Promise<AuditLog[]> {
    return apiClient.get<AuditLog[]>('/reports/audit-logs', token);
  },

  async getRevenueSummary(token: string) {
    return apiClient.get('/reports/revenue-summary', token);
  },

  async getSpotsUtilization(token: string) {
    return apiClient.get('/reports/spots-utilization', token);
  },

  async getFines(token: string): Promise<Fine[]> {
    return apiClient.get<Fine[]>('/fines/', token);
  },

  async payFine(token: string, fineId: number): Promise<Fine> {
    return apiClient.post<Fine>(`/fines/${fineId}/pay`, undefined, token);
  },
};