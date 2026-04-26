'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import { useAlerts } from '@/context';
import { Car, MapPin, AlertTriangle, Clock, TrendingUp } from 'lucide-react';
import { formatCurrency, formatDuration, formatDateTime } from '@/types';
import { parkingService } from '@/services';
import { useAuth } from '@/context';
import { useEffect, useState } from 'react';
import type { ParkingSession } from '@/types';

export default function DashboardPage() {
  const { capacityAlert, blacklistAlerts, spots } = useAlerts();
  const { token } = useAuth();
  const [activeSessions, setActiveSessions] = useState<ParkingSession[]>([]);

  useEffect(() => {
    if (token) {
      parkingService.getActiveSessions(token).then(setActiveSessions).catch(console.error);
    }
  }, [token]);

  const stats = [
    {
      title: 'Espacios Totales',
      value: spots.length,
      icon: <MapPin className="h-5 w-5" />,
      color: 'bg-blue-500',
    },
    {
      title: 'Disponibles',
      value: capacityAlert?.available_spots || 0,
      icon: <Car className="h-5 w-5" />,
      color: 'bg-green-500',
    },
    {
      title: 'Ocupados',
      value: capacityAlert?.occupied_spots || 0,
      icon: <Car className="h-5 w-5" />,
      color: 'bg-red-500',
    },
    {
      title: 'Vehículos Activos',
      value: activeSessions.length,
      icon: <Clock className="h-5 w-5" />,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Resumen del parqueadero en tiempo real</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <Card key={idx}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className={`h-12 w-12 rounded-lg ${stat.color}/20 flex items-center justify-center`}>
                <div className={`h-6 w-6 rounded ${stat.color} flex items-center justify-center text-white`}>
                  {React.cloneElement(stat.icon, { className: 'h-4 w-4' })}
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {capacityAlert?.is_full && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="flex items-center gap-4 p-4">
            <AlertTriangle className="h-8 w-8 text-destructive" />
            <div>
              <p className="font-semibold text-destructive">Aforo Completo</p>
              <p className="text-sm text-destructive/80">
                El parqueadero ha alcanzado el 100% de su capacidad
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {blacklistAlerts.length > 0 && (
        <Card className="border-warning">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="h-5 w-5" />
              Alertas de Seguridad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {blacklistAlerts.slice(0, 5).map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-warning/10 border border-warning/20"
                >
                  <div>
                    <p className="font-semibold">{alert.vehicle?.plate || 'N/A'}</p>
                    <p className="text-sm text-muted-foreground">{alert.reason}</p>
                  </div>
                  <Badge variant="warning">{alert.alert_level.toUpperCase()}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Últimos Ingresos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activeSessions.slice(0, 5).map((session) => {
              const entryTime = new Date(session.entry_time);
              const now = new Date();
              const minutes = Math.floor((now.getTime() - entryTime.getTime()) / 60000);
              return (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Car className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{session.plate}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDateTime(session.entry_time)}
                      </p>
                    </div>
                  </div>
                  <Badge variant={minutes > 60 ? 'warning' : 'secondary'}>
                    {formatDuration(minutes)}
                  </Badge>
                </div>
              );
            })}
            {activeSessions.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No hay vehículos en el parqueadero
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}