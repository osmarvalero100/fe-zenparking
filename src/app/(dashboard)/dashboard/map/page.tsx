'use client';

import { ParkingMap } from '@/components/dashboard';

export default function MapPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Mapa del Parqueadero</h1>
        <p className="text-muted-foreground">Vista en tiempo real de la disponibilidad de espacios</p>
      </div>
      <ParkingMap />
    </div>
  );
}