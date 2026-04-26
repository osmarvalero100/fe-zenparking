'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import { useAlerts } from '@/context';
import { Bell, AlertTriangle, Car, CheckCircle } from 'lucide-react';
import type { BlacklistEntry } from '@/types';
import { formatDateTime } from '@/types';

export default function NotificationsPage() {
  const { blacklistAlerts, capacityAlert, refreshData, isRefreshing } = useAlerts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notificaciones</h1>
          <p className="text-muted-foreground">Alertas y avisos del sistema</p>
        </div>
        <button
          onClick={refreshData}
          disabled={isRefreshing}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isRefreshing ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      {capacityAlert?.is_full && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="h-12 w-12 rounded-full bg-destructive/20 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-destructive">Aforo Completo</p>
              <p className="text-sm text-destructive/80">
                El parqueadero ha alcanzado el 100% de su capacidad. No hay espacios disponibles.
              </p>
            </div>
            <Badge variant="destructive">100%</Badge>
          </CardContent>
        </Card>
      )}

      {blacklistAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Vehículos Sospechosos ({blacklistAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {blacklistAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`
                    flex items-center gap-4 p-4 rounded-lg border
                    ${alert.alert_level === 'high' ? 'bg-destructive/10 border-destructive/30' : ''}
                    ${alert.alert_level === 'medium' ? 'bg-warning/10 border-warning/30' : ''}
                    ${alert.alert_level === 'low' ? 'bg-info/10 border-info/30' : ''}
                  `}
                >
                  <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                    <Car className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-lg">{alert.vehicle?.plate || 'N/A'}</p>
                    <p className="text-sm text-muted-foreground">{alert.reason}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Reportado: {formatDateTime(alert.created_at)}
                    </p>
                  </div>
                  <Badge
                    variant={
                      alert.alert_level === 'high'
                        ? 'destructive'
                        : alert.alert_level === 'medium'
                        ? 'warning'
                        : 'secondary'
                    }
                  >
                    {alert.alert_level.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Estado del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <CheckCircle className="h-4 w-4 text-success" />
                Estado del Servidor
              </div>
              <p className="font-semibold text-success">Operativo</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <CheckCircle className="h-4 w-4 text-success" />
                Base de Datos
              </div>
              <p className="font-semibold text-success">Conectada</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <CheckCircle className="h-4 w-4 text-success" />
                Última Sincronización
              </div>
              <p className="font-semibold">{new Date().toLocaleTimeString('es-CO')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {blacklistAlerts.length === 0 && !capacityAlert?.is_full && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="h-16 w-16 rounded-full bg-success/20 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
            <p className="text-lg font-semibold">Todo en Orden</p>
            <p className="text-muted-foreground">No hay alertas activas en este momento</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}