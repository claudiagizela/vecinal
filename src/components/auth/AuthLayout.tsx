
import React from 'react';
import { Package } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-3 text-primary">
              <Package size={36} />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Gestión de Paquetes</CardTitle>
          <CardDescription>
            Inicia sesión o regístrate para acceder al sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 text-center text-sm">
          <p className="text-muted-foreground">
            Al continuar, aceptas nuestros términos de servicio y política de privacidad.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AuthLayout;
