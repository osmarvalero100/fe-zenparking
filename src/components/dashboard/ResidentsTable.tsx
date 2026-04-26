'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, Input, Select } from '@/components/ui';
import { residentsService } from '@/services';
import { useAuth } from '@/context';
import { Users, Plus, Search, Car, Home, AlertCircle } from 'lucide-react';
import type { ResidentVehicle } from '@/types';
import { VEHICLE_TYPE_LABELS } from '@/types';

export function ResidentsTable() {
  const { token } = useAuth();
  const [residents, setResidents] = useState<ResidentVehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<ResidentVehicle | null>(null);

  useEffect(() => {
    if (token) loadResidents();
  }, [token]);

  const loadResidents = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await residentsService.getAll(token);
      setResidents(data);
    } catch (error) {
      console.error('Error loading residents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredResidents = residents.filter(
    (r) =>
      r.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.owner_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (vehicle: ResidentVehicle) => {
    const now = new Date();
    const endDate = new Date(vehicle.end_date);
    const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (!vehicle.is_active) {
      return <Badge variant="secondary">Inactivo</Badge>;
    }
    if (daysLeft <= 5) {
      return <Badge variant="warning">Por Vencer ({daysLeft} días)</Badge>;
    }
    if (daysLeft <= 0) {
      return <Badge variant="destructive">Vencido</Badge>;
    }
    return <Badge variant="success">Activo</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Vehículos Residentes / Mensuales
          </CardTitle>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="h-4 w-4" />
            Nuevo Residente
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por placa o propietario..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="rounded-lg border overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Placa
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Propietario
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Celda
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Vencimiento
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      Cargando residentes...
                    </td>
                  </tr>
                ) : filteredResidents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      No se encontraron vehículos residentes
                    </td>
                  </tr>
                ) : (
                  filteredResidents.map((vehicle) => (
                    <tr key={vehicle.id}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4 text-muted-foreground" />
                          <span className="font-mono font-bold">{vehicle.plate}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{vehicle.owner_name}</p>
                          {vehicle.owner_phone && (
                            <p className="text-xs text-muted-foreground">{vehicle.owner_phone}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {VEHICLE_TYPE_LABELS[vehicle.vehicle_type]}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono">
                        {vehicle.spot_number || 'Sin asignar'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {vehicle.rate_name}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {new Date(vehicle.end_date).toLocaleDateString('es-CO')}
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(vehicle)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}