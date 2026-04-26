'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, Input, Select, Alert } from '@/components/ui';
import { vehiclesService } from '@/services';
import { useAuth } from '@/context';
import { Car, Plus, Search, Edit, Trash2, AlertTriangle } from 'lucide-react';
import type { Vehicle, VehicleType } from '@/types';
import { VEHICLE_TYPE_LABELS } from '@/types';

export function VehiclesTable() {
  const { token, hasRole } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState({
    plate: '',
    vehicle_type: 'car' as VehicleType,
    owner_name: '',
    owner_phone: '',
    owner_email: '',
    is_resident: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (token) loadVehicles();
  }, [token]);

  const loadVehicles = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await vehiclesService.getAll(token);
      setVehicles(data);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredVehicles = vehicles.filter(
    (v) =>
      v.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.owner_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenModal = (vehicle?: Vehicle) => {
    if (vehicle) {
      setEditingVehicle(vehicle);
      setFormData({
        plate: vehicle.plate,
        vehicle_type: vehicle.vehicle_type,
        owner_name: vehicle.owner_name,
        owner_phone: vehicle.owner_phone || '',
        owner_email: vehicle.owner_email || '',
        is_resident: vehicle.is_resident,
      });
    } else {
      setEditingVehicle(null);
      setFormData({
        plate: '',
        vehicle_type: 'car',
        owner_name: '',
        owner_phone: '',
        owner_email: '',
        is_resident: false,
      });
    }
    setErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingVehicle(null);
    setErrors({});
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.plate.trim()) {
      newErrors.plate = 'La placa es requerida';
    } else if (!/^[A-Z]{3}[0-9]{3}$|^[A-Z]{3}[0-9]{2}[A-Z]$/i.test(formData.plate)) {
      newErrors.plate = 'Formato de placa inválido (ej: ABC123)';
    }
    
    if (!formData.owner_name.trim()) {
      newErrors.owner_name = 'El nombre del propietario es requerido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !token) return;

    try {
      if (editingVehicle) {
        await vehiclesService.update(token, editingVehicle.id, formData);
      } else {
        await vehiclesService.create(token, formData);
      }
      await loadVehicles();
      handleCloseModal();
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Error al guardar el vehículo',
      });
    }
  };

  const handleDelete = async (vehicleId: number) => {
    if (!token || !confirm('¿Está seguro de eliminar este vehículo?')) return;

    try {
      await vehiclesService.delete(token, vehicleId);
      await loadVehicles();
    } catch (error) {
      console.error('Error deleting vehicle:', error);
    }
  };

  const vehicleTypeOptions = Object.entries(VEHICLE_TYPE_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Gestión de Vehículos
          </CardTitle>
          {hasRole(['admin']) && (
            <Button onClick={() => handleOpenModal()}>
              <Plus className="h-4 w-4" />
              Nuevo Vehículo
            </Button>
          )}
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
                    Contacto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Estado
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
                      Cargando vehículos...
                    </td>
                  </tr>
                ) : filteredVehicles.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      No se encontraron vehículos
                    </td>
                  </tr>
                ) : (
                  filteredVehicles.map((vehicle) => (
                    <tr key={vehicle.id}>
                      <td className="px-4 py-3">
                        <span className="font-mono font-bold">{vehicle.plate}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{vehicle.owner_name}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {vehicle.owner_phone && <p>{vehicle.owner_phone}</p>}
                        {vehicle.owner_email && <p className="text-muted-foreground">{vehicle.owner_email}</p>}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {VEHICLE_TYPE_LABELS[vehicle.vehicle_type]}
                      </td>
                      <td className="px-4 py-3">
                        {vehicle.is_resident ? (
                          <Badge variant="success">Residente</Badge>
                        ) : (
                          <Badge variant="secondary">Visitante</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {hasRole(['admin']) && (
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleOpenModal(vehicle)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(vehicle.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        )}
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
              {editingVehicle ? 'Editar Vehículo' : 'Nuevo Vehículo'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.general && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  {errors.general}
                </Alert>
              )}

              <Input
                label="Placa"
                placeholder="ABC123"
                value={formData.plate}
                onChange={(e) => setFormData({ ...formData, plate: e.target.value.toUpperCase() })}
                error={errors.plate}
                className="uppercase"
                disabled={!!editingVehicle}
              />

              <Select
                label="Tipo de Vehículo"
                options={vehicleTypeOptions}
                value={formData.vehicle_type}
                onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value as VehicleType })}
              />

              <Input
                label="Nombre del Propietario"
                placeholder="Nombre completo"
                value={formData.owner_name}
                onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                error={errors.owner_name}
              />

              <Input
                label="Teléfono (opcional)"
                placeholder="3001234567"
                value={formData.owner_phone}
                onChange={(e) => setFormData({ ...formData, owner_phone: e.target.value })}
              />

              <Input
                label="Email (opcional)"
                type="email"
                placeholder="email@ejemplo.com"
                value={formData.owner_email}
                onChange={(e) => setFormData({ ...formData, owner_email: e.target.value })}
              />

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_resident"
                  checked={formData.is_resident}
                  onChange={(e) => setFormData({ ...formData, is_resident: e.target.checked })}
                  className="h-4 w-4"
                />
                <label htmlFor="is_resident" className="text-sm">¿Es vehículo residente?</label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={handleCloseModal}>
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1">
                  {editingVehicle ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}