'use client';

import { VehiclesTable } from '@/components/dashboard';

export default function VehiclesPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Vehículos</h1>
        <p className="text-muted-foreground">Gestione el registro de vehículos en el sistema</p>
      </div>
      <VehiclesTable />
    </div>
  );
}