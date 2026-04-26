'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { CapacityAlert, BlacklistEntry, ParkingSpot } from '@/types';
import { parkingService, vehiclesService } from '@/services';
import { useAuth } from './AuthContext';

interface AlertContextType {
  capacityAlert: CapacityAlert | null;
  blacklistAlerts: BlacklistEntry[];
  isRefreshing: boolean;
  refreshData: () => Promise<void>;
  spots: ParkingSpot[];
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [capacityAlert, setCapacityAlert] = useState<CapacityAlert | null>(null);
  const [blacklistAlerts, setBlacklistAlerts] = useState<BlacklistEntry[]>([]);
  const [spots, setSpots] = useState<ParkingSpot[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshData = useCallback(async () => {
    if (!token) return;
    
    setIsRefreshing(true);
    try {
      const [capacity, blacklist, spotsData] = await Promise.all([
        parkingService.getCapacityAlert(token),
        vehiclesService.getBlacklist(token),
        parkingService.getSpots(token),
      ]);
      setCapacityAlert(capacity);
      setBlacklistAlerts(blacklist.filter(b => b.is_active));
      setSpots(spotsData);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      refreshData();
      const interval = setInterval(refreshData, 30000);
      return () => clearInterval(interval);
    }
  }, [token, refreshData]);

  return (
    <AlertContext.Provider
      value={{
        capacityAlert,
        blacklistAlerts,
        isRefreshing,
        refreshData,
        spots,
      }}
    >
      {children}
    </AlertContext.Provider>
  );
}

export function useAlerts() {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlerts must be used within an AlertProvider');
  }
  return context;
}