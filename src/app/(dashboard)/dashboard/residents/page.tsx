'use client';

import { ResidentsTable } from '@/components/dashboard';

export default function ResidentsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Vehículos Residentes</h1>
        <p className="text-muted-foreground">Gestione los vehículos con planes mensuales o de residencia</p>
      </div>
      <ResidentsTable />
    </div>
  );
}