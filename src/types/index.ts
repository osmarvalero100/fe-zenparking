export type UserRole = 'admin' | 'operator' | 'auditor';

export type VehicleType = 'car' | 'motocycle' | 'bicycle' | 'discapacitado';

export type SpotStatus = 'free' | 'occupied' | 'reserved' | 'maintenance';

export type FineType = 'mal_parking' | 'invasion' | 'over_time';

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at?: string;
  last_login?: string;
}

export interface Vehicle {
  id: number;
  plate: string;
  vehicle_type: VehicleType;
  owner_name: string;
  owner_phone?: string;
  owner_email?: string;
  is_resident: boolean;
  monthly_rate_id?: number;
  created_at?: string;
}

export interface ParkingSpot {
  id: number;
  spot_number: string;
  vehicle_type: VehicleType;
  zone?: string;
  floor: number;
  row?: string;
  column?: number;
  is_near_exit: boolean;
  status: SpotStatus;
}

export interface ParkingSession {
  id: number;
  vehicle_id: number;
  spot_id?: number;
  ticket_number: string;
  plate: string;
  vehicle_type: VehicleType;
  entry_time: string;
  exit_time?: string;
  duration_minutes?: number;
  total_amount?: number;
  payment_status: 'pending' | 'paid';
  notes?: string;
  created_by?: number;
}

export interface Rate {
  id: number;
  name: string;
  vehicle_type: VehicleType;
  price_per_hour: number;
  max_price?: number;
  description?: string;
  is_active: boolean;
}

export interface Fine {
  id: number;
  vehicle_id: number;
  session_id?: number;
  fine_type: FineType;
  amount: number;
  description?: string;
  photo_url?: string;
  status: 'pending' | 'paid';
  paid_at?: string;
  created_at: string;
}

export interface BlacklistEntry {
  id: number;
  vehicle_id: number;
  reason: string;
  alert_level: 'low' | 'medium' | 'high';
  is_active: boolean;
  created_at: string;
  vehicle?: Vehicle;
}

export interface AuditLog {
  id: number;
  user_id: number;
  action: string;
  resource: string;
  resource_id?: number;
  details?: string;
  ip_address?: string;
  created_at: string;
  user?: User;
}

export interface CapacityAlert {
  total_spots: number;
  occupied_spots: number;
  available_spots: number;
  percentage: number;
  is_full: boolean;
  last_updated: string;
}

export interface ParkingMap {
  zones: Zone[];
  spots: ParkingSpot[];
}

export interface Zone {
  id: string;
  name: string;
  rows: number;
  columns: number;
  vehicle_type: VehicleType;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface UserCreate {
  username: string;
  email: string;
  full_name: string;
  password: string;
  role: UserRole;
}

export interface ParkingSessionCreate {
  plate: string;
  spot_id?: number;
}

export interface ApiError {
  detail: string;
}

export const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  car: 'Carro',
  motocycle: 'Motocicleta',
  bicycle: 'Bicicleta',
  'discapacitado': 'Discapacitado',
};

export const VEHICLE_TYPE_ICONS: Record<VehicleType, string> = {
  car: 'car',
  motocycle: 'bike',
  bicycle: 'circle',
  'discapacitado': 'accessibility',
};

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrador',
  operator: 'Operador',
  auditor: 'Auditor',
};

export const STATUS_LABELS: Record<string, string> = {
  free: 'Libre',
  occupied: 'Ocupado',
  reserved: 'Reservado',
  maintenance: 'Mantenimiento',
  pending: 'Pendiente',
  paid: 'Pagado',
};

export const SPOT_COLORS: Record<SpotStatus, string> = {
  free: 'bg-green-500',
  occupied: 'bg-red-500',
  reserved: 'bg-yellow-500',
  maintenance: 'bg-gray-500',
};

export const ALERT_LEVEL_COLORS: Record<string, string> = {
  low: 'bg-blue-500',
  medium: 'bg-yellow-500',
  high: 'bg-red-500',
};

export const FINE_TYPE_LABELS: Record<FineType, string> = {
  mal_parking: 'Mal Estacionamiento',
  invasion: 'Invasión',
  over_time: 'Tiempo Excedido',
};

export const CURRENCY_FORMAT = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatCurrency(amount: number): string {
  return CURRENCY_FORMAT.format(amount);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours} h`;
  return `${hours} h ${mins} min`;
}