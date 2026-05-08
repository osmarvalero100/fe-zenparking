'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@/components/ui';
import { parkingService, reportsService, vehiclesService } from '@/services';
import { useAuth } from '@/context';
import { FileText, Download, Calendar, DollarSign, Clock, Car } from 'lucide-react';
import type { AuditLog, ParkingSession, Vehicle } from '@/types';
import { formatDateTime, formatDuration, formatCurrency } from '@/types';

export function ReportsTable() {
  const { token } = useAuth();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [activeSessions, setActiveSessions] = useState<ParkingSession[]>([]);
  const [vehicleMap, setVehicleMap] = useState<Record<number, Vehicle>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'audit' | 'active'>('audit');

  useEffect(() => {
    if (token) loadData();
  }, [token]);

  const loadData = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const [logs, sessions, vehiclesData] = await Promise.all([
        reportsService.getAuditLogs(token),
        parkingService.getActiveSessions(token),
        vehiclesService.getAll(token),
      ]);
      setAuditLogs(logs);
      setActiveSessions(sessions);
      const map: Record<number, Vehicle> = {};
      vehiclesData.forEach((v) => { map[v.id] = v; });
      setVehicleMap(map);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPlate = (session: ParkingSession): string =>
    session.plate || vehicleMap[session.vehicle_id]?.plate || 'N/A';

  const getVehicleType = (session: ParkingSession): string => {
    if (session.vehicle_type) return session.vehicle_type;
    const vehicle = vehicleMap[session.vehicle_id];
    return vehicle?.vehicle_type || 'N/A';
  };

  const handleExportCsv = async () => {
    if (!token) return;
    try {
      const csv = await reportsService.getDailyMovementsCsv(token);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting CSV:', error);
    }
  };

  const tabs = [
    { id: 'audit', label: 'Bitácora de Acciones', icon: <FileText className="h-4 w-4" /> },
    { id: 'active', label: 'Sesiones Activas', icon: <Car className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'primary' : 'outline'}
              onClick={async () => {
                setActiveTab(tab.id as 'audit' | 'active');
                if (!token) return;
                try {
                  if (tab.id === 'audit') {
                    const logs = await reportsService.getAuditLogs(token);
                    setAuditLogs(logs);
                  } else {
                    const [sessions, vehiclesData] = await Promise.all([
                      parkingService.getActiveSessions(token),
                      vehiclesService.getAll(token),
                    ]);
                    setActiveSessions(sessions);
                    const map: Record<number, Vehicle> = {};
                    vehiclesData.forEach((v) => { map[v.id] = v; });
                    setVehicleMap(map);
                  }
                } catch (error) {
                  console.error('Error refreshing tab:', error);
                }
              }}
            >
              {tab.icon}
              {tab.label}
            </Button>
          ))}
        </div>
        <Button variant="outline" onClick={handleExportCsv}>
          <Download className="h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      {activeTab === 'audit' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Bitácora de Acciones del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Fecha/Hora
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Acción
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Recurso
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Detalles
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                        Cargando bitácora...
                      </td>
                    </tr>
                  ) : auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                        No hay registros de auditoría
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="px-4 py-3 text-sm whitespace-nowrap">
                          {formatDateTime(log.created_at)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {log.user?.full_name || `Usuario #${log.user_id}`}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <Badge variant="secondary">{log.action}</Badge>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="font-medium">{log.resource}</span>
                          {log.resource_id && (
                            <span className="text-muted-foreground ml-1">#{log.resource_id}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground max-w-xs truncate">
                          {log.details || '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'active' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Vehículos Actualmente en el Parqueadero
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Ticket
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Placa
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Hora de Ingreso
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Duración
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                        Cargando sesiones...
                      </td>
                    </tr>
                  ) : activeSessions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                        No hay vehículos en el parqueadero
                      </td>
                    </tr>
                  ) : (
                    activeSessions.map((session) => {
                      const entryTime = new Date(session.entry_time);
                      const now = new Date();
                      const minutes = Math.floor((now.getTime() - entryTime.getTime()) / 60000);
                      return (
                        <tr key={session.id}>
                          <td className="px-4 py-3 text-sm font-mono">
                            {session.ticket_number}
                          </td>
                          <td className="px-4 py-3 text-sm font-bold">
                            {getPlate(session)}
                          </td>
                          <td className="px-4 py-3 text-sm capitalize">
                            {getVehicleType(session)}
                          </td>
                          <td className="px-4 py-3 text-sm whitespace-nowrap">
                            {formatDateTime(session.entry_time)}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <Badge variant={minutes > 60 ? 'warning' : 'secondary'}>
                              <Clock className="h-3 w-3 mr-1" />
                              {formatDuration(minutes)}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}