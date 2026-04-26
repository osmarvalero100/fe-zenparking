'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, Input, Select, Alert } from '@/components/ui';
import { parkingService } from '@/services';
import { useAuth, useAlerts } from '@/context';
import { MapPin, Plus, Search, Edit, Trash2, AlertTriangle, Wrench, CheckCircle } from 'lucide-react';
import type { ParkingSpot, VehicleType, SpotStatus } from '@/types';
import { VEHICLE_TYPE_LABELS, STATUS_LABELS, SPOT_COLORS } from '@/types';

export function SpotsTable() {
  const { token, hasRole } = useAuth();
  const { refreshData } = useAlerts();
  const [spots, setSpots] = useState<ParkingSpot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<SpotStatus | 'all'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingSpot, setEditingSpot] = useState<ParkingSpot | null>(null);
  const [formData, setFormData] = useState({
    spot_number: '',
    vehicle_type: 'car' as VehicleType,
    zone: '',
    floor: 1,
    row: '',
    column: 1,
    is_near_exit: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (token) loadSpots();
  }, [token]);

  const loadSpots = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await parkingService.getSpots(token);
      setSpots(data);
    } catch (error) {
      console.error('Error loading spots:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSpots = spots.filter((s) => {
    const matchesSearch = s.spot_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.zone?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || s.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: spots.length,
    free: spots.filter((s) => s.status === 'free').length,
    occupied: spots.filter((s) => s.status === 'occupied').length,
    maintenance: spots.filter((s) => s.status === 'maintenance').length,
  };

  const handleOpenModal = (spot?: ParkingSpot) => {
    if (spot) {
      setEditingSpot(spot);
      setFormData({
        spot_number: spot.spot_number,
        vehicle_type: spot.vehicle_type,
        zone: spot.zone || '',
        floor: spot.floor,
        row: spot.row || '',
        column: spot.column || 1,
        is_near_exit: spot.is_near_exit,
      });
    } else {
      setEditingSpot(null);
      setFormData({
        spot_number: '',
        vehicle_type: 'car',
        zone: '',
        floor: 1,
        row: '',
        column: 1,
        is_near_exit: false,
      });
    }
    setErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSpot(null);
    setErrors({});
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.spot_number.trim()) {
      newErrors.spot_number = 'El número de celda es requerido';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !token) return;

    try {
      if (editingSpot) {
        await parkingService.updateSpot(token, editingSpot.id, formData);
      } else {
        await parkingService.createSpot(token, formData);
      }
      await loadSpots();
      await refreshData();
      handleCloseModal();
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Error al guardar la celda',
      });
    }
  };

  const handleDelete = async (spotId: number) => {
    if (!token || !confirm('¿Está seguro de eliminar esta celda?')) return;
    try {
      await parkingService.deleteSpot(token, spotId);
      await loadSpots();
      await refreshData();
    } catch (error) {
      console.error('Error deleting spot:', error);
    }
  };

  const handleSetMaintenance = async (spot: ParkingSpot) => {
    if (!token) return;
    try {
      if (spot.status === 'maintenance') {
        await parkingService.releaseSpot(token, spot.id);
      } else {
        await parkingService.setMaintenance(token, spot.id);
      }
      await loadSpots();
      await refreshData();
    } catch (error) {
      console.error('Error changing spot status:', error);
    }
  };

  const vehicleTypeOptions = Object.entries(VEHICLE_TYPE_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  const statusOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'free', label: 'Libre' },
    { value: 'occupied', label: 'Ocupado' },
    { value: 'maintenance', label: 'Mantenimiento' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Celdas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="h-10 w-10 rounded-lg bg-success/20 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.free}</p>
              <p className="text-xs text-muted-foreground">Libres</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="h-10 w-10 rounded-lg bg-destructive/20 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.occupied}</p>
              <p className="text-xs text-muted-foreground">Ocupados</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
              <Wrench className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.maintenance}</p>
              <p className="text-xs text-muted-foreground">Mantenimiento</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Gestión de Celdas
          </CardTitle>
          {hasRole(['admin']) && (
            <Button onClick={() => handleOpenModal()}>
              <Plus className="h-4 w-4" />
              Nueva Celda
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por número o zona..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              options={statusOptions}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as SpotStatus | 'all')}
            />
          </div>

          <div className="rounded-lg border overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Celda
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Zona
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Near Exit
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      Cargando celdas...
                    </td>
                  </tr>
                ) : filteredSpots.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      No se encontraron celdas
                    </td>
                  </tr>
                ) : (
                  filteredSpots.map((spot) => (
                    <tr key={spot.id}>
                      <td className="px-4 py-3">
                        <span className="font-mono font-bold">{spot.spot_number}</span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {spot.zone || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {VEHICLE_TYPE_LABELS[spot.vehicle_type]}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={SPOT_COLORS[spot.status]}>
                          {STATUS_LABELS[spot.status]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {spot.is_near_exit ? (
                          <span className="text-primary font-medium">Sí</span>
                        ) : (
                          <span className="text-muted-foreground">No</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {hasRole(['admin']) && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSetMaintenance(spot)}
                                title={spot.status === 'maintenance' ? 'Activar' : 'Mantenimiento'}
                              >
                                <Wrench className={`h-4 w-4 ${spot.status === 'maintenance' ? 'text-success' : ''}`} />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleOpenModal(spot)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(spot.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-xl border shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingSpot ? 'Editar Celda' : 'Nueva Celda'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.general && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  {errors.general}
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Número de Celda"
                  placeholder="A-1"
                  value={formData.spot_number}
                  onChange={(e) => setFormData({ ...formData, spot_number: e.target.value.toUpperCase() })}
                  error={errors.spot_number}
                  disabled={!!editingSpot}
                />

                <Input
                  label="Zona (opcional)"
                  placeholder="Zona A"
                  value={formData.zone}
                  onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Select
                  label="Tipo"
                  options={vehicleTypeOptions}
                  value={formData.vehicle_type}
                  onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value as VehicleType })}
                />

                <Input
                  label="Piso"
                  type="number"
                  min="1"
                  value={formData.floor}
                  onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) || 1 })}
                />

                <Input
                  label="Columna"
                  type="number"
                  min="1"
                  value={formData.column}
                  onChange={(e) => setFormData({ ...formData, column: parseInt(e.target.value) || 1 })}
                />
              </div>

              <Input
                label="Fila (opcional)"
                placeholder="A"
                value={formData.row}
                onChange={(e) => setFormData({ ...formData, row: e.target.value.toUpperCase() })}
              />

              <div className="p-4 bg-muted/50 rounded-lg border">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_near_exit}
                    onChange={(e) => setFormData({ ...formData, is_near_exit: e.target.checked })}
                    className="h-5 w-5 rounded border-input"
                  />
                  <div>
                    <p className="font-medium">¿Cerca de la Salida?</p>
                    <p className="text-sm text-muted-foreground">
                      Marcar si la celda está ubicada cerca de los accesos
                    </p>
                  </div>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={handleCloseModal}>
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1">
                  {editingSpot ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}