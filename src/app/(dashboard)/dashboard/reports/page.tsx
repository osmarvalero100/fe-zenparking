'use client';

import { ReportsTable } from '@/components/dashboard';

export default function ReportsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Reportes y Estadísticas</h1>
        <p className="text-muted-foreground">Consulte la bitácora de acciones y el estado del parqueadero</p>
      </div>
      <ReportsTable />
    </div>
  );
}