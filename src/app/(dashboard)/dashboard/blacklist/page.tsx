'use client';

import { BlacklistTable } from '@/components/dashboard';

export default function BlacklistPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Lista Negra</h1>
        <p className="text-muted-foreground">Gestione los vehículos con restricciones de acceso</p>
      </div>
      <BlacklistTable />
    </div>
  );
}