
import React from 'react';
import { Users, Package, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNeighbors } from '@/context/NeighborContext';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface HeaderProps {
  onAddNew: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAddNew }) => {
  const { neighbors } = useNeighbors();
  const location = useLocation();
  const isHome = location.pathname === '/';
  const { user, signOut } = useAuth();
  
  return (
    <header className="sticky top-0 z-10 backdrop-blur-md bg-background/80 border-b py-4 px-6 mb-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="rounded-full bg-primary/10 p-2 text-primary">
              {isHome ? <Users size={24} /> : <Package size={24} />}
            </div>
            <div>
              <h1 className="text-xl font-medium">
                {isHome ? 'Base de Datos de Vecinos' : 'Registro de Paquetes'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isHome 
                  ? `${neighbors.length} ${neighbors.length === 1 ? 'vecino' : 'vecinos'} registrados`
                  : 'Gestión de paquetes de los vecinos'}
              </p>
            </div>
          </div>
          <div className="flex space-x-2 items-center">
            {isHome ? (
              <>
                <a href="/packages" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 group">
                  <Package size={18} className="mr-2 transition-transform group-hover:scale-110" />
                  Paquetes
                </a>
                <Button onClick={onAddNew} className="group">
                  <Users size={18} className="mr-2 transition-transform group-hover:scale-110" />
                  Agregar Vecino
                </Button>
              </>
            ) : (
              <Button onClick={onAddNew} className="group">
                <Package size={18} className="mr-2 transition-transform group-hover:scale-110" />
                Agregar Paquete
              </Button>
            )}
            
            {user && (
              <Button 
                variant="outline" 
                onClick={() => signOut()} 
                className="ml-2 group"
              >
                <LogOut size={18} className="transition-transform group-hover:scale-110" />
                <span className="sr-only md:not-sr-only md:ml-2">Cerrar Sesión</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
