'use client';

import React from 'react';
import { useAlerts } from '@/context';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import { MapPin, Car, Bike, Circle, Accessibility, TrendingUp, AlertTriangle } from 'lucide-react';
import type { ParkingSpot, VehicleType, SpotStatus } from '@/types';
import { STATUS_LABELS, SPOT_COLORS } from '@/types';

const vehicleIcons: Record<VehicleType, React.ReactNode> = {
  car: <Car className="h-3 w-3" />,
  motocycle: <Bike className="h-3 w-3" />,
  bicycle: <Circle className="h-3 w-3" />,
  'discapacitado': <Accessibility className="h-3 w-3" />,
};

interface SpotCellProps {
  spot: ParkingSpot;
  onClick?: (spot: ParkingSpot) => void;
}

function SpotCell({ spot, onClick }: SpotCellProps) {
  const statusColors: Record<SpotStatus, string> = {
    free: 'bg-green-100 border-green-300 hover:bg-green-200',
    occupied: 'bg-red-100 border-red-300 hover:bg-red-200',
    reserved: 'bg-yellow-100 border-yellow-300 hover:bg-yellow-200',
    maintenance: 'bg-gray-100 border-gray-300',
  };

  return (
    <button
      onClick={() => onClick?.(spot)}
      className={`
        w-12 h-12 rounded-lg border-2 flex flex-col items-center justify-center
        transition-all ${statusColors[spot.status]}
        ${spot.is_near_exit ? 'ring-2 ring-primary ring-offset-1' : ''}
      `}
      title={`${spot.spot_number} - ${STATUS_LABELS[spot.status]}`}
    >
      <span className="text-[8px] font-bold">{spot.spot_number}</span>
      {vehicleIcons[spot.vehicle_type]}
    </button>
  );
}

interface ZoneGridProps {
  zoneName: string;
  spots: ParkingSpot[];
  rows: number;
  cols: number;
  onSpotClick?: (spot: ParkingSpot) => void;
}

function ZoneGrid({ zoneName, spots, rows, cols, onSpotClick }: ZoneGridProps) {
  const gridSpots = spots.slice(0, rows * cols);
  const gridSpotsMap = new Map(gridSpots.map((s) => [s.spot_number, s]));

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-muted-foreground">{zoneName}</h4>
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {Array.from({ length: rows * cols }).map((_, idx) => {
          const row = Math.floor(idx / cols);
          const col = idx % cols;
          const spotKey = `${String.fromCharCode(65 + row)}${col + 1}`;
          const spot = gridSpotsMap.get(spotKey) || gridSpots.find((s) => s.row === String.fromCharCode(65 + row) && s.column === col + 1);

          if (!spot) {
            return (
              <div
                key={`empty-${zoneName}-${idx}`}
                className="w-12 h-12 rounded-lg bg-muted/30 border border-dashed border-muted"
              />
            );
          }

          return <SpotCell key={spot.id} spot={spot} onClick={onSpotClick} />;
        })}
      </div>
    </div>
  );
}

export function ParkingMap() {
  const { spots, capacityAlert } = useAlerts();

  const spotsByZone = spots.reduce((acc, spot) => {
    const zone = spot.zone || 'General';
    if (!acc[zone]) acc[zone] = [];
    acc[zone].push(spot);
    return acc;
  }, {} as Record<string, ParkingSpot[]>);

  const statsByStatus = spots.reduce(
    (acc, spot) => {
      acc[spot.status] = (acc[spot.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="h-10 w-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{statsByStatus.free || 0}</p>
              <p className="text-xs text-muted-foreground">Libres</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="h-10 w-10 rounded-lg bg-red-500/20 flex items-center justify-center">
              <Car className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{statsByStatus.occupied || 0}</p>
              <p className="text-xs text-muted-foreground">Ocupados</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="h-10 w-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{spots.length}</p>
              <p className="text-xs text-muted-foreground">Total Espacios</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${capacityAlert?.is_full ? 'bg-red-500/20' : 'bg-blue-500/20'}`}>
              {capacityAlert?.is_full ? (
                <AlertTriangle className="h-5 w-5 text-red-500" />
              ) : (
                <TrendingUp className="h-5 w-5 text-blue-500" />
              )}
            </div>
            <div>
              <p className="text-2xl font-bold">
                {capacityAlert?.percentage?.toFixed(0) || 0}%
              </p>
              <p className="text-xs text-muted-foreground">Ocupación</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500" />
          <span className="text-sm">Libre</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500" />
          <span className="text-sm">Ocupado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-500" />
          <span className="text-sm">Reservado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-500" />
          <span className="text-sm">Mantenimiento</span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mapa del Parqueadero</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(spotsByZone).map(([zoneName, zoneSpots]) => (
              <ZoneGrid
                key={zoneName}
                zoneName={zoneName}
                spots={zoneSpots}
                rows={5}
                cols={6}
              />
            ))}
          </div>

          {spots.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay espacios de parqueadero configurados</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}