'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, Input, Select, Alert } from '@/components/ui';
import { ratesService } from '@/services';
import { useAuth } from '@/context';
import { DollarSign, Plus, Search, Edit, Trash2, AlertTriangle } from 'lucide-react';
import type { Rate, VehicleType } from '@/types';
import { VEHICLE_TYPE_LABELS, formatCurrency } from '@/types';

export function RatesTable() {
  const { token, hasRole } = useAuth();
  const [rates, setRates] = useState<Rate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<VehicleType | 'all'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingRate, setEditingRate] = useState<Rate | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    vehicle_type: 'car' as VehicleType,
    price_per_minute: 0,
    max_price: 0,
    description: '',
    is_active: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (token) loadRates();
  }, [token]);

  const loadRates = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await ratesService.getAll(token);
      setRates(data);
    } catch (error) {
      console.error('Error loading rates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRates = rates.filter((r) => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || r.vehicle_type === filterType;
    return matchesSearch && matchesType;
  });

  const handleOpenModal = (rate?: Rate) => {
    if (rate) {
      setEditingRate(rate);
      setFormData({
        name: rate.name,
        vehicle_type: rate.vehicle_type,
        price_per_minute: rate.price_per_minute,
        max_price: rate.max_price || 0,
        description: rate.description || '',
        is_active: rate.is_active,
      });
    } else {
      setEditingRate(null);
      setFormData({
        name: '',
        vehicle_type: 'car',
price_per_minute: 0,
        max_price: 0,
        description: '',
        is_active: true,
      });
    }
    setErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRate(null);
    setErrors({});
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }
    if (formData.price_per_minute <= 0) {
      newErrors.price_per_minute = 'El precio por hora debe ser mayor a 0';
    }
    if (formData.max_price < 0) {
      newErrors.max_price = 'El precio máximo no puede ser negativo';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !token) return;

    try {
      const data = {
        name: formData.name,
        vehicle_type: formData.vehicle_type,
        price_per_minute: formData.price_per_minute,
        max_price: formData.max_price || undefined,
        description: formData.description || undefined,
        is_active: formData.is_active,
      };

      if (editingRate) {
        await ratesService.update(token, editingRate.id, data);
      } else {
        await ratesService.create(token, data);
      }
      await loadRates();
      handleCloseModal();
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Error al guardar la tarifa',
      });
    }
  };

  const handleDelete = async (rateId: number) => {
    if (!token || !confirm('¿Está seguro de eliminar esta tarifa?')) return;
    try {
      await ratesService.delete(token, rateId);
      await loadRates();
    } catch (error) {
      console.error('Error deleting rate:', error);
    }
  };

  const handleToggleActive = async (rate: Rate) => {
    if (!token) return;
    try {
      await ratesService.toggleActive(token, rate.id, !rate.is_active);
      await loadRates();
    } catch (error) {
      console.error('Error toggling rate:', error);
    }
  };

  const vehicleTypeOptions = Object.entries(VEHICLE_TYPE_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  const typeFilterOptions = [
    { value: 'all', label: 'Todos' },
    ...vehicleTypeOptions,
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{rates.length}</p>
              <p className="text-xs text-muted-foreground">Total Tarifas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="h-10 w-10 rounded-lg bg-success/20 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{rates.filter((r) => r.is_active).length}</p>
              <p className="text-xs text-muted-foreground">Activas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{rates.filter((r) => !r.is_active).length}</p>
              <p className="text-xs text-muted-foreground">Inactivas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Gestión de Tarifas
          </CardTitle>
          {hasRole(['admin']) && (
            <Button onClick={() => handleOpenModal()}>
              <Plus className="h-4 w-4" />
              Nueva Tarifa
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              options={typeFilterOptions}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as VehicleType | 'all')}
            />
          </div>

          <div className="rounded-lg border overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Tipo de Vehículo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Precio/Min
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Precio Máximo
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
                      Cargando tarifas...
                    </td>
                  </tr>
                ) : filteredRates.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      No se encontraron tarifas
                    </td>
                  </tr>
                ) : (
                  filteredRates.map((rate) => (
                    <tr key={rate.id}>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{rate.name}</p>
                          {rate.description && (
                            <p className="text-xs text-muted-foreground">{rate.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {VEHICLE_TYPE_LABELS[rate.vehicle_type]}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold">
                        {formatCurrency(rate.price_per_minute || 0)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {rate.max_price ? formatCurrency(rate.max_price) : '-'}
                      </td>
                      <td className="px-4 py-3">
                        {rate.is_active ? (
                          <Badge variant="success">Activa</Badge>
                        ) : (
                          <Badge variant="secondary">Inactiva</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {hasRole(['admin']) && (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleActive(rate)}
                            >
                              {rate.is_active ? 'Desactivar' : 'Activar'}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleOpenModal(rate)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(rate.id)}>
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
              {editingRate ? 'Editar Tarifa' : 'Nueva Tarifa'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.general && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  {errors.general}
                </Alert>
              )}

              <Input
                label="Nombre de la Tarifa"
                placeholder="Tarifa Carro Hora"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={errors.name}
              />

              <Select
                label="Tipo de Vehículo"
                options={vehicleTypeOptions}
                value={formData.vehicle_type}
                onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value as VehicleType })}
              />

              <Input
                label="Precio por Hora (COP)"
                type="number"
                min="0"
                placeholder="5000"
                value={formData.price_per_minute}
                onChange={(e) => setFormData({ ...formData, price_per_minute: parseInt(e.target.value) || 0 })}
                error={errors.price_per_minute}
              />

              <Input
                label="Precio Máximo (COP, opcional)"
                type="number"
                min="0"
                placeholder="25000"
                value={formData.max_price}
                onChange={(e) => setFormData({ ...formData, max_price: parseInt(e.target.value) || 0 })}
                error={errors.max_price}
              />

              <div className="space-y-2">
                <label className="text-sm font-medium">Descripción (opcional)</label>
                <textarea
                  className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  rows={2}
                  placeholder="Descripción de la tarifa..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="p-4 bg-muted/50 rounded-lg border">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="h-5 w-5 rounded border-input"
                  />
                  <div>
                    <p className="font-medium">¿Tarifa Activa?</p>
                    <p className="text-sm text-muted-foreground">
                      Las tarifas inactivas no se aplicarán a nuevos ingresos
                    </p>
                  </div>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={handleCloseModal}>
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1">
                  {editingRate ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}