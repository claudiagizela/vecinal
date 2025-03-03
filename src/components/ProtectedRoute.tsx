
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/auth';
import { Button } from './ui/button';
import { Shield, XCircle } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, devModeEnabled, toggleDevMode, signOut } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user && !devModeEnabled) {
    return <Navigate to="/auth" replace />;
  }

  const handleForceLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error during force logout:", error);
    } finally {
      // Ensure dev mode is always disabled after attempting logout
      toggleDevMode();
    }
  };

  return (
    <>
      {children}
      {!user && devModeEnabled && (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
          <Button 
            onClick={handleForceLogout} 
            variant="destructive" 
            className="flex items-center gap-2"
          >
            <XCircle size={16} />
            Forzar Cierre de Sesión
          </Button>
          <Button 
            onClick={toggleDevMode} 
            variant="outline" 
            className="bg-yellow-100 border-yellow-300 text-yellow-800 hover:bg-yellow-200 flex items-center gap-2"
          >
            <Shield size={16} />
            Modo Desarrollo Activo (Click para desactivar)
          </Button>
        </div>
      )}
    </>
  );
};

export default ProtectedRoute;
