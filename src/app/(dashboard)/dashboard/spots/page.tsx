'use client';

import { SpotsTable } from '@/components/dashboard';

export default function SpotsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Celdas de Parqueadero</h1>
        <p className="text-muted-foreground">Gestione la configuración de las celdas del parqueadero</p>
      </div>
      <SpotsTable />
    </div>
  );
}