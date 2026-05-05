'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Input, Alert, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { authService } from '@/services';
import { Lock, CheckCircle, ArrowLeft } from 'lucide-react';

function NewPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Token inválido o faltante');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await authService.resetPassword(token, password);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al restablecer contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-success/20">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
            <h1 className="text-2xl font-bold text-success">Contraseña Actualizada</h1>
            <p className="text-muted-foreground">
              Tu contraseña ha sido restablecida correctamente.
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <Button variant="outline" className="w-full" onClick={() => router.push('/login')}>
                <ArrowLeft className="h-4 w-4" />
                Volver al Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary">
            <Lock className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold">ZenParking</h1>
          <p className="text-muted-foreground">Restablecer Contraseña</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Nueva Contraseña
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">{error}</Alert>
              )}

              <p className="text-sm text-muted-foreground">
                Ingresa tu nueva contraseña.
              </p>

              <Input
                label="Nueva Contraseña"
                type="password"
                placeholder="******"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Input
                label="Confirmar Contraseña"
                type="password"
                placeholder="******"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              <Button type="submit" className="w-full" isLoading={isLoading}>
                Restablecer Contraseña
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  className="text-sm text-primary hover:underline"
                  onClick={() => router.push('/login')}
                >
                  <ArrowLeft className="h-4 w-4 inline mr-1" />
                  Volver al Login
                </button>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          © 2026 ZenParking. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}

export default function NewPasswordPage() {
  return (
    <Suspense>
      <NewPasswordContent />
    </Suspense>
  );
}
