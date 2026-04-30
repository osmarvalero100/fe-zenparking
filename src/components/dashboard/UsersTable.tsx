'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, Input, Select } from '@/components/ui';
import { usersService, authService } from '@/services';
import { useAuth } from '@/context';
import { Users, Plus, Search, UserCheck, UserX, Shield } from 'lucide-react';
import type { User, UserRole } from '@/types';
import { ROLE_LABELS } from '@/types';

const roleColors: Record<UserRole, string> = {
  admin: 'bg-purple-500',
  operator: 'bg-blue-500',
  auditor: 'bg-green-500',
};

interface FormData {
  username: string;
  email: string;
  full_name: string;
  password: string;
  role: UserRole;
}

interface FormErrors {
  username?: string;
  email?: string;
  full_name?: string;
  password?: string;
  role?: string;
  general?: string;
}

export function UsersTable() {
  const { token, user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    full_name: '',
    password: '',
    role: 'operator',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (token) loadUsers();
  }, [token]);

  const loadUsers = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await usersService.getAll(token);
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (userId: number, isActive: boolean) => {
    if (!token) return;
    try {
      if (isActive) {
        await usersService.deactivate(token, userId);
      } else {
        await usersService.activate(token, userId);
      }
      await loadUsers();
    } catch (error) {
      console.error('Error toggling user active status:', error);
    }
  };

  const roleOptions = Object.entries(ROLE_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.username.trim()) newErrors.username = 'El usuario es requerido';
    if (!formData.email.trim()) newErrors.email = 'El correo es requerido';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Correo inválido';
    if (!formData.full_name.trim()) newErrors.full_name = 'El nombre es requerido';
    if (!formData.password || formData.password.length < 6) newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !token) return;

    try {
      await usersService.create(token, {
        username: formData.username,
        email: formData.email,
        full_name: formData.full_name,
        password: formData.password,
        role: formData.role,
      });
      setShowModal(false);
      setFormData({ username: '', email: '', full_name: '', password: '', role: 'operator' });
      await loadUsers();
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Error al crear usuario',
      });
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setErrors({});
    setFormData({ username: '', email: '', full_name: '', password: '', role: 'operator' });
  };

  const filteredUsers = users.filter(
    (user) =>
      user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gestión de Usuarios
          </CardTitle>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="h-4 w-4" />
            Nuevo Usuario
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuarios..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="rounded-lg border overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Correo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      Cargando usuarios...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      No se encontraron usuarios
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {user.full_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{user.full_name}</p>
                            <p className="text-xs text-muted-foreground">@{user.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">{user.email}</td>
                      <td className="px-4 py-3">
                        <Badge
                          className={`${roleColors[user.role]} text-white`}
                        >
                          <Shield className="h-3 w-3 mr-1" />
                          {ROLE_LABELS[user.role]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {user.is_active ? (
                          <Badge variant="success">
                            <UserCheck className="h-3 w-3 mr-1" />
                            Activo
                          </Badge>
                        ) : (
                          <Badge variant="warning">
                            <UserX className="h-3 w-3 mr-1" />
                            Inactivo
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {user.id !== currentUser?.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleActive(user.id, user.is_active)}
                          >
                            {user.is_active ? 'Desactivar' : 'Activar'}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-xl border shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-semibold mb-4">Nuevo Usuario</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.general && (
                <div className="p-3 text-sm text-destructive-foreground bg-destructive/10 rounded-lg">
                  {errors.general}
                </div>
              )}

              <Input
                label="Usuario"
                placeholder="johndoe"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                error={errors.username}
              />

              <Input
                label="Nombre Completo"
                placeholder="John Doe"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                error={errors.full_name}
              />

              <Input
                label="Correo Electrónico"
                type="email"
                placeholder="john@ejemplo.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                error={errors.email}
              />

              <Input
                label="Contraseña"
                type="password"
                placeholder="******"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                error={errors.password}
              />

              <Select
                label="Rol"
                options={roleOptions}
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                error={errors.role}
              />

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseModal}>
                  Cancelar
                </Button>
                <Button type="submit">
                  <Plus className="h-4 w-4" />
                  Crear Usuario
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}