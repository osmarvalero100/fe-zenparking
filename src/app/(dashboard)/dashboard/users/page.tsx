'use client';

import { UsersTable } from '@/components/dashboard';
import { useAuth } from '@/context';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function UsersPage() {
  const { hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!hasRole(['admin'])) {
      router.push('/dashboard');
    }
  }, [hasRole, router]);

  if (!hasRole(['admin'])) {
    return null;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
        <p className="text-muted-foreground">Administre los perfiles de usuarios y roles del sistema</p>
      </div>
      <UsersTable />
    </div>
  );
}