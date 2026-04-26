'use client';

import { FinesTable } from '@/components/dashboard';

export default function FinesPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Gestión de Multas</h1>
        <p className="text-muted-foreground">Consulte y gestione las multas por mal parqueo, invasión o tiempo excedido</p>
      </div>
      <FinesTable />
    </div>
  );
}