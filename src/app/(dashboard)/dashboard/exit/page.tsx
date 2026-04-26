'use client';

import { ExitForm } from '@/components/forms';

export default function ExitPage() {
  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Registro de Salida</h1>
        <p className="text-muted-foreground">Procese la salida del vehículo y genere el comprobante de pago</p>
      </div>
      <ExitForm />
    </div>
  );
}