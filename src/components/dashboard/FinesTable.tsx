'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, Input, Select, Alert, SearchableSelect } from '@/components/ui';
import { finesService, vehiclesService } from '@/services';
import { useAuth } from '@/context';
import { FileText, Plus, Search, AlertTriangle, Camera, CheckCircle, XCircle } from 'lucide-react';
import type { FineWithVehicle, FineType, Vehicle } from '@/types';
import { FINE_TYPE_LABELS, STATUS_LABELS, formatCurrency, formatDateTime } from '@/types';

export function FinesTable() {
  const { token, hasRole } = useAuth();
  const [fines, setFines] = useState<FineWithVehicle[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'paid'>('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedFine, setSelectedFine] = useState<FineWithVehicle | null>(null);
  const [formData, setFormData] = useState({
    vehicle_id: '',
    fine_type: 'mal_parking' as FineType,
    amount: 0,
    description: '',
    photo_url: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (token) {
      loadFines();
      loadVehicles();
    }
  }, [token]);

  const loadVehicles = async () => {
    if (!token) return;
    try {
      const data = await vehiclesService.getAll(token);
      setVehicles(data);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    }
  };

  const handleOpenModal = () => {
    setFormData({
      vehicle_id: '',
      fine_type: 'mal_parking',
      amount: 0,
      description: '',
      photo_url: '',
    });
    setErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setErrors({});
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.vehicle_id) {
      newErrors.vehicle_id = 'Seleccione un vehículo';
    }
    if (formData.amount <= 0) {
      newErrors.amount = 'El monto debe ser mayor a 0';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !token) return;

    try {
      await finesService.create(token, {
        vehicle_id: parseInt(formData.vehicle_id),
        fine_type: formData.fine_type,
        description: formData.description,
        amount: formData.amount,
        photo_url: formData.photo_url || undefined,
      });
      await loadFines();
      handleCloseModal();
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Error al registrar multa',
      });
    }
  };

  const vehicleOptions = vehicles.map((v) => ({
    value: String(v.id),
    label: `${v.plate} - ${v.owner_name}`,
  }));

  const fineTypeOptions = Object.entries(FINE_TYPE_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  const loadFines = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await finesService.getAll(token);
      setFines(data);
    } catch (error) {
      console.error('Error loading fines:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayFine = async (fineId: number) => {
    if (!token) return;
    try {
      await finesService.payFine(token, fineId);
      await loadFines();
    } catch (error) {
      console.error('Error paying fine:', error);
    }
  };

  const filteredFines = fines.filter((fine) => {
    const matchesSearch =
      fine.vehicle?.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fine.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || fine.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getFineTypeBadge = (type: string) => {
    const variants: Record<string, 'warning' | 'destructive' | 'secondary'> = {
      mal_parking: 'warning',
      invasion: 'destructive',
      over_time: 'secondary',
    };
    return <Badge variant={variants[type] || 'secondary'}>{FINE_TYPE_LABELS[type as keyof typeof FINE_TYPE_LABELS]}</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Gestión de Multas
          </CardTitle>
          {hasRole(['admin', 'operator']) && (
            <Button onClick={handleOpenModal}>
              <Plus className="h-4 w-4" />
              Registrar Multa
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por placa o descripción..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
              >
                Todas
              </Button>
              <Button
                variant={filterStatus === 'pending' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('pending')}
              >
                Pendientes
              </Button>
              <Button
                variant={filterStatus === 'paid' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('paid')}
              >
                Pagadas
              </Button>
            </div>
          </div>

          <div className="rounded-lg border overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Placa
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Valor
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
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      Cargando multas...
                    </td>
                  </tr>
                ) : filteredFines.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      No se encontraron multas
                    </td>
                  </tr>
                ) : (
                  filteredFines.map((fine) => (
                    <tr key={fine.id}>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        {formatDateTime(fine.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono font-bold">{fine.vehicle?.plate || 'N/A'}</span>
                      </td>
                      <td className="px-4 py-3">
                        {getFineTypeBadge(fine.fine_type)}
                      </td>
                      <td className="px-4 py-3 text-sm max-w-xs truncate">
                        {fine.description || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold">
                        {formatCurrency(fine.amount)}
                      </td>
                      <td className="px-4 py-3">
                        {fine.status === 'paid' ? (
                          <Badge variant="success">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Pagada
                          </Badge>
                        ) : (
                          <Badge variant="warning">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Pendiente
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {fine.photo_url && (
                            <Button variant="ghost" size="sm" className="cursor-pointer" onClick={() => setSelectedFine(fine)}>
                              <Camera className="h-4 w-4" />
                            </Button>
                          )}
                          {fine.status === 'pending' && hasRole(['admin', 'operator']) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePayFine(fine.id)}
                            >
                              <CheckCircle className="h-4 w-4 text-success" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Pendiente</p>
                <p className="text-xl font-bold text-warning">
                  {formatCurrency(
                    fines.filter((f) => f.status === 'pending').reduce((sum, f) => sum + f.amount, 0)
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Cobrado</p>
                <p className="text-xl font-bold text-success">
                  {formatCurrency(
                    fines.filter((f) => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0)
                  )}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-xl border shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-semibold mb-4">Registrar Nueva Multa</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.general && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  {errors.general}
                </Alert>
              )}

              <SearchableSelect
                label="Vehículo"
                options={vehicleOptions}
                value={formData.vehicle_id}
                onChange={(value) => setFormData({ ...formData, vehicle_id: value })}
                error={errors.vehicle_id}
                placeholder="Buscar vehículo por placa o propietario..."
              />

              <Select
                label="Tipo de Multa"
                options={fineTypeOptions}
                value={formData.fine_type}
                onChange={(e) => setFormData({ ...formData, fine_type: e.target.value as FineType })}
              />

              <Input
                label="Monto (COP)"
                type="number"
                placeholder="50000"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
                error={errors.amount}
              />

              <Input
                label="Descripción"
                placeholder="Descripción de la infracción..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                error={errors.description}
              />

              <Input
                label="URL de Foto (opcional)"
                placeholder="https://..."
                value={formData.photo_url}
                onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
              />

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseModal}>
                  Cancelar
                </Button>
                <Button type="submit">
                  <Plus className="h-4 w-4" />
                  Registrar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedFine?.photo_url && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setSelectedFine(null)}>
          <div className="bg-card rounded-xl border shadow-lg max-w-2xl p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Foto de la Infracción</h3>
              <Button variant="ghost" size="icon" onClick={() => setSelectedFine(null)}>
                <XCircle className="h-5 w-5" />
              </Button>
            </div>
            <img src={selectedFine.photo_url} alt="Foto de infracció" className="max-w-full max-h-[70vh] rounded-lg" />
          </div>
        </div>
      )}
    </div>
  );
}