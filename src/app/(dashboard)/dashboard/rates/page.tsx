'use client';

import { RatesTable } from '@/components/dashboard';

export default function RatesPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Tarifas</h1>
        <p className="text-muted-foreground">Configure las tarifas del parqueadero por tipo de vehículo</p>
      </div>
      <RatesTable />
    </div>
  );
}