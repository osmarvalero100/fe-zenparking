'use client';

import React, { useState } from 'react';
import { Button, Input, Alert, Badge, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { exitService, finesService } from '@/services';
import { useAuth, useAlerts } from '@/context';
import { formatCurrency, formatDateTime, formatDuration, VEHICLE_TYPE_LABELS } from '@/types';
import { Ticket, Car, Clock, DollarSign, CheckCircle, AlertTriangle, Printer } from 'lucide-react';
import type { ExitSession, FineWithVehicle } from '@/types';

interface ExitFormData {
  ticketOrPlate: string;
}

interface FormErrors {
  ticketOrPlate?: string;
  general?: string;
  blocked?: string;
}

export function ExitForm() {
  const { token } = useAuth();
  const { refreshData } = useAlerts();
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState<ExitSession | null>(null);
  const [pendingFines, setPendingFines] = useState<FineWithVehicle[]>([]);
  const [showPayment, setShowPayment] = useState(false);
  const [formData, setFormData] = useState<ExitFormData>({ ticketOrPlate: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [showFinesModal, setShowFinesModal] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, ticketOrPlate: e.target.value.toUpperCase() }));
    if (errors.ticketOrPlate) setErrors((prev) => ({ ...prev, ticketOrPlate: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.ticketOrPlate.trim()) {
      newErrors.ticketOrPlate = 'Ingrese el número de ticket o la placa';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !token) return;

    setIsLoading(true);
    setErrors({});
    setSession(null);

    try {
      const searchTerm = formData.ticketOrPlate.trim().toUpperCase();
      
      const sessionByPlate = await exitService.searchByPlate(token, searchTerm);
      if (sessionByPlate) {
        setSession(sessionByPlate);
        await loadPendingFines(token, sessionByPlate);
        return;
      }

      const sessionByTicket = await exitService.searchByTicket(token, searchTerm);
      if (sessionByTicket) {
        setSession(sessionByTicket);
        await loadPendingFines(token, sessionByTicket);
        return;
      }

      setErrors({ general: 'No se encontró ninguna sesión con ese ticket o placa' });
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'No se encontró la sesión',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotal = (): number => {
    const parkingFee = session?.total_amount || 0;
    const finesTotal = pendingFines.reduce((sum, f) => sum + f.amount, 0);
    return parkingFee + finesTotal;
  };

  const loadPendingFines = async (token: string, session: ExitSession) => {
    try {
      const fines = await finesService.getPendingFines(token);
      const vehicleFines = fines.filter(
        (f) => f.vehicle_id === session.vehicle_id || f.vehicle?.plate === session.plate
      );
      setPendingFines(vehicleFines);
    } catch {
      setPendingFines([]);
    }
  };

  const handleProcessExit = async () => {
    if (!session || !token) return;

    setIsLoading(true);

    try {
      if (pendingFines.length > 0) {
        for (const fine of pendingFines) {
          await finesService.payFine(token, fine.id);
        }
      }

      const sessionId = session.session_id || session.id;
      if (!sessionId) {
        setErrors({ general: 'No se pudo identificar la sesión' });
        setIsLoading(false);
        return;
      }
      await exitService.processExit(token, sessionId, 'paid');
      setShowSuccess(true);
      await refreshData();
    } catch (error) {
      if (error instanceof Error && error.message.includes('blocked')) {
        setErrors({ blocked: error.message });
      } else {
        setErrors({ general: error instanceof Error ? error.message : 'Error al procesar salida' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewExit = () => {
    setSession(null);
    setPendingFines([]);
    setShowPayment(false);
    setShowSuccess(false);
    setShowFinesModal(false);
    setFormData({ ticketOrPlate: '' });
  };

  const handlePrintReceipt = () => {
    if (!session) return;
    const receiptContent = `
      ================================
      ZENPARKING - COMPROBANTE DE SALIDA
      ================================
      No. Ticket: ${session.ticket_number}
      Placa: ${session.plate}
      Tipo: ${VEHICLE_TYPE_LABELS[session.vehicle_type]}
      Hora Ingreso: ${formatDateTime(session.entry_time)}
      Hora Salida: ${formatDateTime(new Date().toISOString())}
      Duración: ${formatDuration(session.duration_minutes || 0)}
      Valor Total: ${formatCurrency(calculateTotal())}
      Estado Pago: PAGADO
      ================================
    `;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Comprobante ${session.ticket_number}</title>
            <style>
              body { font-family: monospace; white-space: pre; padding: 20px; }
            </style>
          </head>
          <body>${receiptContent}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (showSuccess && session) {
    return (
      <div className="bg-card rounded-xl border shadow-sm p-6 space-y-6">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-success/20">
            <CheckCircle className="h-8 w-8 text-success" />
          </div>
          <h2 className="text-2xl font-bold text-success">¡Salida Registrada!</h2>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">No. Ticket:</span>
            <span className="font-mono font-bold">{session.ticket_number}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Placa:</span>
            <span className="font-bold">{session.plate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Hora de Salida:</span>
            <span>{formatDateTime(new Date().toISOString())}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Pagado:</span>
            <span className="font-bold text-success">{formatCurrency(calculateTotal())}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={handleNewExit}>
            Nueva Salida
          </Button>
          <Button className="flex-1" onClick={handlePrintReceipt}>
            <Printer className="h-4 w-4" />
            Imprimir Comprobante
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Ticket className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Registro de Salida</h2>
          <p className="text-sm text-muted-foreground">Ingrese el ticket o la placa del vehículo</p>
        </div>
      </div>

      {!session ? (
        <form onSubmit={handleSearch} className="space-y-4">
          {errors.general && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              {errors.general}
            </Alert>
          )}

          <Input
            label="Número de Ticket o Placa"
            placeholder="ABC123 o TKT-2026-0001"
            value={formData.ticketOrPlate}
            onChange={handleChange}
            error={errors.ticketOrPlate}
            className="text-center text-lg font-mono uppercase tracking-wider"
          />

          <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
            <Search className="h-5 w-5" />
            Buscar Vehículo
          </Button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Car className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-bold text-xl">{session.plate}</p>
                <p className="text-sm text-muted-foreground">
                  {VEHICLE_TYPE_LABELS[session.vehicle_type]} - Ticket: {session.ticket_number}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Hora de Ingreso</p>
                  <p className="text-sm font-medium">{formatDateTime(session.entry_time)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Duración</p>
                  <p className="text-sm font-medium">{formatDuration(session.duration_minutes || 0)}</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4 mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <span className="text-lg font-semibold">Parqueo:</span>
                </div>
                <span className="text-lg font-medium">
                  {formatCurrency(session.total_amount || 0)}
                </span>
              </div>

              {pendingFines.length > 0 && (
                <>
                  <button
                    type="button"
                    className="flex items-center justify-between w-full text-sm font-semibold text-warning cursor-pointer hover:opacity-80"
                    onClick={() => setShowFinesModal(true)}
                  >
                    <span className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Multas Pendientes ({pendingFines.length}):
                    </span>
                    <span>
                      {formatCurrency(pendingFines.reduce((sum, f) => sum + f.amount, 0))}
                    </span>
                  </button>
                  {pendingFines.map((fine, idx) => (
                    <div key={idx} className="flex justify-between text-sm bg-warning/10 p-2 rounded">
                      <span className="truncate mr-2">{fine.description || 'Multa'}</span>
                      <span className="font-medium whitespace-nowrap">{formatCurrency(fine.amount)}</span>
                    </div>
                  ))}
                </>
              )}
            </div>

            <div className="border-t pt-4 mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-6 w-6 text-primary" />
                  <span className="text-xl font-bold">Total a Pagar:</span>
                </div>
                <span className="text-3xl font-bold text-primary">
                  {formatCurrency(calculateTotal())}
                </span>
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <p className="text-sm font-medium mb-3">Método de Pago:</p>
              <div className="flex gap-3">
                <Button
                  variant={paymentMethod === 'cash' ? 'primary' : 'outline'}
                  className="flex-1"
                  onClick={() => setPaymentMethod('cash')}
                >
                  Efectivo
                </Button>
                <Button
                  variant={paymentMethod === 'card' ? 'primary' : 'outline'}
                  className="flex-1"
                  onClick={() => setPaymentMethod('card')}
                >
                  Tarjeta
                </Button>
              </div>
            </div>
          </div>

          {errors.blocked && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              {errors.blocked}
            </Alert>
          )}

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={handleNewExit}>
              Cancelar
            </Button>
            <Button
              className="flex-1"
              onClick={handleProcessExit}
              isLoading={isLoading}
            >
              <CheckCircle className="h-4 w-4" />
              Confirmar Salida
            </Button>
          </div>
        </div>
      )}

      {showFinesModal && pendingFines.length > 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowFinesModal(false)}>
          <div className="bg-card rounded-xl border shadow-lg w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Multas Pendientes
            </h3>
            <div className="space-y-2 mb-4">
              {pendingFines.map((fine, idx) => (
                <div key={idx} className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium">{fine.description || 'Multa'}</p>
                  <p className="text-sm text-muted-foreground">{formatCurrency(fine.amount)}</p>
                </div>
              ))}
            </div>
            <Button className="w-full" onClick={() => setShowFinesModal(false)}>
              Cerrar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

import { Search } from 'lucide-react';