'use client';

import React, { useState, useCallback } from 'react';
import { Button, Input, Select, Alert, Badge } from '@/components/ui';
import { parkingService, vehiclesService } from '@/services';
import { useAuth, useAlerts } from '@/context';
import { validatePlate, formatPlate } from '@/lib/utils';
import { Ticket, Car, AlertTriangle, Check, Printer, User } from 'lucide-react';
import type { ParkingSession, BlacklistEntry, VehicleType } from '@/types';
import { VEHICLE_TYPE_LABELS } from '@/types';

interface EntryFormData {
  plate: string;
  vehicle_type: VehicleType;
  spot_id?: number;
}

interface FormErrors {
  plate?: string;
  vehicle_type?: string;
  general?: string;
}

export function EntryForm() {
  const { token } = useAuth();
  const { refreshData, blacklistAlerts } = useAlerts();
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState<ParkingSession | null>(null);
  const [blacklisted, setBlacklisted] = useState<BlacklistEntry | null>(null);
  const [formData, setFormData] = useState<EntryFormData>({
    plate: '',
    vehicle_type: 'car',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [vehicleFormData, setVehicleFormData] = useState({
    owner_name: '',
    owner_phone: '',
    owner_email: '',
    is_resident: false,
  });
  const [vehicleErrors, setVehicleErrors] = useState<Record<string, string>>({});
  const [isCreatingVehicle, setIsCreatingVehicle] = useState(false);

  const checkBlacklist = useCallback(
    async (plate: string) => {
      if (!token || !validatePlate(plate)) return;

      const entry = blacklistAlerts.find(
        (b) => b.vehicle?.plate.toLowerCase() === plate.toLowerCase()
      );

      if (entry) {
        setBlacklisted(entry);
      } else {
        try {
          const result = await vehiclesService.checkBlacklist(token, plate);
          setBlacklisted(result && result.is_blacklisted ? result.entry : null);
        } catch {
          setBlacklisted(null);
        }
      }
    },
    [token, blacklistAlerts]
  );

  const handlePlateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPlate(e.target.value);
    setFormData((prev) => ({ ...prev, plate: formatted }));
    if (errors.plate) setErrors((prev) => ({ ...prev, plate: undefined }));
    if (formatted.length >= 6) checkBlacklist(formatted);
  };

  const handleVehicleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      vehicle_type: e.target.value as VehicleType,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    const newErrors: FormErrors = {};

    if (!formData.plate.trim()) {
      newErrors.plate = 'La placa es requerida';
    } else if (!validatePlate(formData.plate)) {
      newErrors.plate = 'Formato de placa inválido (ej: ABC123)';
    }

    if (!formData.vehicle_type) {
      newErrors.vehicle_type = 'El tipo de vehículo es requerido';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);
    setErrors({});

    try {
      let vehicleExists = false;
      try {
        await vehiclesService.getByPlate(token, formData.plate);
        vehicleExists = true;
      } catch {
        vehicleExists = false;
      }

      if (!vehicleExists) {
        setVehicleFormData({
          owner_name: '',
          owner_phone: '',
          owner_email: '',
          is_resident: false,
        });
        setVehicleErrors({});
        setShowVehicleModal(true);
        setIsLoading(false);
        return;
      }

      await registerEntry();
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Error al registrar ingreso',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const registerEntry = async () => {
    if (!token) return;

    setIsLoading(true);

    try {
      const newSession = await parkingService.registerEntry(token, {
        plate: formData.plate,
        spot_id: formData.spot_id,
      });
      setSession({
        ...newSession,
        plate: newSession.plate || formData.plate,
        vehicle_type: newSession.vehicle_type || formData.vehicle_type,
      });
      setShowSuccess(true);
      await refreshData();
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Error al registrar ingreso',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVehicleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    const newErrors: Record<string, string> = {};

    if (!vehicleFormData.owner_name.trim()) {
      newErrors.owner_name = 'El nombre del propietario es requerido';
    }

    setVehicleErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsCreatingVehicle(true);

    try {
      await vehiclesService.create(token, {
        plate: formData.plate,
        vehicle_type: formData.vehicle_type,
        ...vehicleFormData,
      });
      setShowVehicleModal(false);
      await registerEntry();
    } catch (error) {
      setVehicleErrors({
        general: error instanceof Error ? error.message : 'Error al crear el vehículo',
      });
    } finally {
      setIsCreatingVehicle(false);
    }
  };

  const handleCloseVehicleModal = () => {
    setShowVehicleModal(false);
    setVehicleErrors({});
  };

  const handlePrintTicket = () => {
    if (!session) return;
    const plate = session.plate || formData.plate;
    const vehicleType = session.vehicle_type || formData.vehicle_type;
    const ticketContent = `
      ====================================
      ZENPARKING - TICKET DE INGRESO
      ====================================
      No. Ticket: ${session.ticket_number || 'N/A'}
      Placa: ${plate}
      Tipo: ${VEHICLE_TYPE_LABELS[vehicleType as keyof typeof VEHICLE_TYPE_LABELS] || vehicleType}
      Fecha/Hora: ${session.entry_time ? new Date(session.entry_time).toLocaleString('es-CO') : new Date().toLocaleString('es-CO')}
      ====================================
    `;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Ticket ${session.ticket_number}</title>
            <style>
              body { font-family: monospace; white-space: pre; padding: 20px; }
            </style>
          </head>
          <body>${ticketContent}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleNewEntry = () => {
    setSession(null);
    setBlacklisted(null);
    setShowSuccess(false);
    setFormData({ plate: '', vehicle_type: 'car' });
  };

  const vehicleTypeOptions = Object.entries(VEHICLE_TYPE_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  if (showSuccess && session) {
    return (
      <div className="bg-card rounded-xl border shadow-sm p-6 space-y-6">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-success/20">
            <Check className="h-8 w-8 text-success" />
          </div>
          <h2 className="text-2xl font-bold text-success">¡Ingreso Exitoso!</h2>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">No. Ticket:</span>
            <span className="font-mono font-bold">{session.ticket_number || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Placa:</span>
            <span className="font-bold">{session.plate || formData.plate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tipo:</span>
            <span>{VEHICLE_TYPE_LABELS[session.vehicle_type as keyof typeof VEHICLE_TYPE_LABELS] || VEHICLE_TYPE_LABELS[formData.vehicle_type as keyof typeof VEHICLE_TYPE_LABELS]}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Fecha/Hora:</span>
            <span>{session.entry_time ? new Date(session.entry_time).toLocaleString('es-CO') : new Date().toLocaleString('es-CO')}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={handleNewEntry}>
            Nuevo Ingreso
          </Button>
          <Button className="flex-1" onClick={handlePrintTicket}>
            <Printer className="h-4 w-4" />
            Imprimir Ticket
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
          <h2 className="text-lg font-semibold">Registro de Ingreso</h2>
          <p className="text-sm text-muted-foreground">Ingrese los datos del vehículo</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.general && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            {errors.general}
          </Alert>
        )}

        {blacklisted && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <div className="flex-1">
              <p className="font-semibold">¡Alerta de Seguridad!</p>
              <p className="text-sm">Vehículo en lista negra: {blacklisted.reason}</p>
              <Badge variant="destructive" className="mt-2">
                Nivel: {blacklisted.alert_level?.toUpperCase() || 'DESCONOCIDO'}
              </Badge>
            </div>
          </Alert>
        )}

        <Select
          label="Tipo de Vehículo"
          options={vehicleTypeOptions}
          value={formData.vehicle_type}
          onChange={handleVehicleTypeChange}
          error={errors.vehicle_type}
        />

        <Input
          label="Placa del Vehículo"
          placeholder="ABC123"
          value={formData.plate}
          onChange={handlePlateChange}
          error={errors.plate}
          className="text-center text-lg font-mono uppercase tracking-wider"
          maxLength={6}
        />

        <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
          <Car className="h-5 w-5" />
          Registrar Ingreso
        </Button>
      </form>

      {showVehicleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-xl border shadow-lg w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Crear Vehículo</h3>
                <p className="text-sm text-muted-foreground">
                  No se encontró un vehículo con placa {formData.plate}
                </p>
              </div>
            </div>

            <form onSubmit={handleVehicleSubmit} className="space-y-4">
              {vehicleErrors.general && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  {vehicleErrors.general}
                </Alert>
              )}

              <Input
                label="Nombre del Propietario"
                placeholder="Juan Pérez"
                value={vehicleFormData.owner_name}
                onChange={(e) =>
                  setVehicleFormData((prev) => ({ ...prev, owner_name: e.target.value }))
                }
                error={vehicleErrors.owner_name}
              />

              <Input
                label="Teléfono del Propietario"
                placeholder="3001234567"
                value={vehicleFormData.owner_phone}
                onChange={(e) =>
                  setVehicleFormData((prev) => ({ ...prev, owner_phone: e.target.value }))
                }
                type="tel"
              />

              <Input
                label="Email del Propietario"
                placeholder="juan@email.com"
                value={vehicleFormData.owner_email}
                onChange={(e) =>
                  setVehicleFormData((prev) => ({ ...prev, owner_email: e.target.value }))
                }
                type="email"
              />

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_resident"
                  checked={vehicleFormData.is_resident}
                  onChange={(e) =>
                    setVehicleFormData((prev) => ({ ...prev, is_resident: e.target.checked }))
                  }
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="is_resident" className="text-sm text-muted-foreground">
                  ¿Es residente?
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={handleCloseVehicleModal}>
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1" isLoading={isCreatingVehicle}>
                  Crear y Continuar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}