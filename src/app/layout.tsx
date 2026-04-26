import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context';
import { AlertProvider } from '@/context';

export const metadata: Metadata = {
  title: 'ZenParking - Sistema de Gestión de Parqueadero',
  description: 'Plataforma digital moderna, segura y eficiente para la gestión de parqueaderos',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <AlertProvider>{children}</AlertProvider>
        </AuthProvider>
      </body>
    </html>
  );
}