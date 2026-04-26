'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, Input, Select, Alert } from '@/components/ui';
import { vehiclesService } from '@/services';
import { useAuth } from '@/context';
import { AlertTriangle, Plus, Search, Trash2, AlertCircle, ShieldAlert } from 'lucide-react';
import type { BlacklistEntry } from '@/types';
import { formatDateTime, ALERT_LEVEL_COLORS } from '@/types';

export function BlacklistTable() {
  const { token, hasRole } = useAuth();
  const [blacklist, setBlacklist] = useState<BlacklistEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<BlacklistEntry | null>(null);
  const [formData, setFormData] = useState({
    vehicle_plate: '',
    reason: '',
    alert_level: 'medium' as 'low' | 'medium' | 'high',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (token) loadBlacklist();
  }, [token]);

  const loadBlacklist = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await vehiclesService.getBlacklist(token);
      setBlacklist(data);
    } catch (error) {
      console.error('Error loading blacklist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBlacklist = blacklist.filter((entry) => {
    const plate = entry.vehicle?.plate || '';
    const matchesSearch = plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.reason.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = filterLevel === 'all' || entry.alert_level === filterLevel;
    return matchesSearch && matchesLevel;
  });

  const stats = {
    total: blacklist.filter((b) => b.is_active).length,
    high: blacklist.filter((b) => b.is_active && b.alert_level === 'high').length,
    medium: blacklist.filter((b) => b.is_active && b.alert_level === 'medium').length,
    low: blacklist.filter((b) => b.is_active && b.alert_level === 'low').length,
  };

  const handleOpenModal = (entry?: BlacklistEntry) => {
    if (entry) {
      setEditingEntry(entry);
      setFormData({
        vehicle_plate: entry.vehicle?.plate || '',
        reason: entry.reason,
        alert_level: entry.alert_level,
      });
    } else {
      setEditingEntry(null);
      setFormData({
        vehicle_plate: '',
        reason: '',
        alert_level: 'medium',
      });
    }
    setErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEntry(null);
    setErrors({});
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.vehicle_plate.trim() && !editingEntry) {
      newErrors.vehicle_plate = 'La placa es requerida';
    }
    if (!formData.reason.trim()) {
      newErrors.reason = 'El motivo es requerido';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !token) return;

    try {
      if (editingEntry) {
        await vehiclesService.updateBlacklistEntry(token, editingEntry.id, {
          reason: formData.reason,
          alert_level: formData.alert_level,
        });
      } else {
        const vehicle = await vehiclesService.getByPlate(token, formData.vehicle_plate);
        await vehiclesService.addToBlacklist(token, vehicle.id, formData.reason, formData.alert_level);
      }
      await loadBlacklist();
      handleCloseModal();
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Error al guardar',
      });
    }
  };

  const handleDelete = async (entryId: number) => {
    if (!token || !confirm('¿Está seguro de eliminar esta entrada de la lista negra?')) return;
    try {
      await vehiclesService.removeFromBlacklist(token, entryId);
      await loadBlacklist();
    } catch (error) {
      console.error('Error removing from blacklist:', error);
    }
  };

  const handleToggleActive = async (entry: BlacklistEntry) => {
    if (!token) return;
    try {
      await vehiclesService.updateBlacklistEntry(token, entry.id, {
        is_active: !entry.is_active,
      });
      await loadBlacklist();
    } catch (error) {
      console.error('Error toggling blacklist entry:', error);
    }
  };

  const levelOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'high', label: 'Alto' },
    { value: 'medium', label: 'Medio' },
    { value: 'low', label: 'Bajo' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="h-10 w-10 rounded-lg bg-destructive/20 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="h-10 w-10 rounded-lg bg-red-500/20 flex items-center justify-center">
              <ShieldAlert className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.high}</p>
              <p className="text-xs text-muted-foreground">Alto Riesgo</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="h-10 w-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.medium}</p>
              <p className="text-xs text-muted-foreground">Medio Riesgo</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.low}</p>
              <p className="text-xs text-muted-foreground">Bajo Riesgo</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Gestión de Lista Negra
          </CardTitle>
          {hasRole(['admin', 'operator']) && (
            <Button onClick={() => handleOpenModal()}>
              <Plus className="h-4 w-4" />
              Agregar a Lista Negra
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por placa o motivo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              options={levelOptions}
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value as typeof filterLevel)}
            />
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
                    Motivo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Nivel
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Fecha
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
                      Cargando lista negra...
                    </td>
                  </tr>
                ) : filteredBlacklist.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      No hay vehículos en lista negra
                    </td>
                  </tr>
                ) : (
                  filteredBlacklist.map((entry) => (
                    <tr key={entry.id} className={!entry.is_active ? 'opacity-50' : ''}>
                      <td className="px-4 py-3">
                        <span className="font-mono font-bold">{entry.vehicle?.plate || 'N/A'}</span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {entry.vehicle?.owner_name || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm max-w-xs truncate">
                        {entry.reason}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={ALERT_LEVEL_COLORS[entry.alert_level]}>
                          {entry.alert_level.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        {formatDateTime(entry.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        {entry.is_active ? (
                          <Badge variant="success">Activo</Badge>
                        ) : (
                          <Badge variant="secondary">Inactivo</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {hasRole(['admin', 'operator']) && (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleActive(entry)}
                              title={entry.is_active ? 'Desactivar' : 'Activar'}
                            >
                              {entry.is_active ? 'Desactivar' : 'Activar'}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleOpenModal(entry)}>
                              Editar
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(entry.id)}>
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
              {editingEntry ? 'Editar Entrada' : 'Agregar a Lista Negra'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.general && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  {errors.general}
                </Alert>
              )}

              {!editingEntry && (
                <Input
                  label="Placa del Vehículo"
                  placeholder="ABC123"
                  value={formData.vehicle_plate}
                  onChange={(e) => setFormData({ ...formData, vehicle_plate: e.target.value.toUpperCase() })}
                  error={errors.vehicle_plate}
                  className="uppercase"
                />
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Motivo</label>
                <textarea
                  className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  rows={3}
                  placeholder="Descripción del motivo..."
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                />
                {errors.reason && <p className="text-sm text-destructive">{errors.reason}</p>}
              </div>

              <Select
                label="Nivel de Alerta"
                options={[
                  { value: 'low', label: 'Bajo' },
                  { value: 'medium', label: 'Medio' },
                  { value: 'high', label: 'Alto' },
                ]}
                value={formData.alert_level}
                onChange={(e) => setFormData({ ...formData, alert_level: e.target.value as 'low' | 'medium' | 'high' })}
              />

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={handleCloseModal}>
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1">
                  {editingEntry ? 'Actualizar' : 'Agregar'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}