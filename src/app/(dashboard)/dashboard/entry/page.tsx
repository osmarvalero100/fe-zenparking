'use client';

import { EntryForm } from '@/components/forms';

export default function EntryPage() {
  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Registro de Ingreso</h1>
        <p className="text-muted-foreground">Capture los datos del vehículo para generar el ticket de ingreso</p>
      </div>
      <EntryForm />
    </div>
  );
}