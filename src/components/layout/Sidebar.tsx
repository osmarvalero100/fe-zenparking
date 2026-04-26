'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth, useAlerts } from '@/context';
import {
  LayoutDashboard,
  Car,
  CarFront,
  LogOut,
  Users,
  FileText,
  Bell,
  MapPin,
  AlertTriangle,
  FileWarning,
  ArrowRightFromLine,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles?: ('admin' | 'operator' | 'auditor')[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Ingreso Vehículos', href: '/dashboard/entry', icon: <Car className="h-5 w-5" /> },
  { label: 'Salida Vehículos', href: '/dashboard/exit', icon: <ArrowRightFromLine className="h-5 w-5" /> },
  { label: 'Mapa del Parqueadero', href: '/dashboard/map', icon: <MapPin className="h-5 w-5" /> },
  { label: 'Vehículos', href: '/dashboard/vehicles', icon: <CarFront className="h-5 w-5" /> },
  { label: 'Celdas', href: '/dashboard/spots', icon: <MapPin className="h-5 w-5" />, roles: ['admin'] },
  { label: 'Lista Negra', href: '/dashboard/blacklist', icon: <AlertTriangle className="h-5 w-5" /> },
  { label: 'Multas', href: '/dashboard/fines', icon: <FileWarning className="h-5 w-5" /> },
  { label: 'Usuarios', href: '/dashboard/users', icon: <Users className="h-5 w-5" />, roles: ['admin'] },
  { label: 'Reportes', href: '/dashboard/reports', icon: <FileText className="h-5 w-5" /> },
  { label: 'Notificaciones', href: '/dashboard/notifications', icon: <Bell className="h-5 w-5" /> },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout, hasRole } = useAuth();

  const filteredNavItems = navItems.filter(
    (item) => !item.roles || hasRole(item.roles)
  );

  return (
    <aside className="flex flex-col w-64 bg-card border-r border-border h-screen sticky top-0">
      <div className="flex items-center gap-2 h-16 px-6 border-b border-border">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
          <Car className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="font-semibold text-lg">ZenParking</span>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border space-y-4">
        <div className="px-3 py-2">
          <p className="text-sm font-medium truncate">{user?.full_name || 'Usuario'}</p>
          <p className="text-xs text-muted-foreground capitalize">{user?.role || 'Sin rol'}</p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}

export function AlertsBar() {
  const { blacklistAlerts, capacityAlert } = useAlerts();

  const highPriorityAlerts = blacklistAlerts.filter((b) => b.alert_level === 'high');

  return (
    <div className="flex items-center gap-4 px-6 py-2 bg-muted/50 border-b border-border text-sm">
      {capacityAlert?.is_full && (
        <div className="flex items-center gap-2 text-destructive font-medium">
          <AlertTriangle className="h-4 w-4" />
          Aforo al 100%
        </div>
      )}
      {capacityAlert && !capacityAlert.is_full && (
        <span className="text-muted-foreground">
          {capacityAlert.available_spots} espacios disponibles
        </span>
      )}
      {highPriorityAlerts.length > 0 && (
        <div className="flex items-center gap-2 text-destructive font-medium">
          <AlertTriangle className="h-4 w-4" />
          {highPriorityAlerts.length} vehículo(s) sospechoso(s)
        </div>
      )}
    </div>
  );
}