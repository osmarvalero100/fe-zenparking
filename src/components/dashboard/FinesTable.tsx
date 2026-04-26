'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, Input, Alert } from '@/components/ui';
import { finesService } from '@/services';
import { useAuth } from '@/context';
import { FileText, Plus, Search, AlertTriangle, Camera, CheckCircle, XCircle } from 'lucide-react';
import type { FineWithVehicle } from '@/types';
import { FINE_TYPE_LABELS, STATUS_LABELS, formatCurrency, formatDateTime } from '@/types';

export function FinesTable() {
  const { token, hasRole } = useAuth();
  const [fines, setFines] = useState<FineWithVehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'paid'>('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedFine, setSelectedFine] = useState<FineWithVehicle | null>(null);

  useEffect(() => {
    if (token) loadFines();
  }, [token]);

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
            <Button onClick={() => setShowModal(true)}>
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
                            <Button variant="ghost" size="sm" onClick={() => setSelectedFine(fine)}>
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
    </div>
  );
}