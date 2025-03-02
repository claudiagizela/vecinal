
import React from 'react';
import { Users, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNeighbors } from '@/context/NeighborContext';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/context/auth';

interface HeaderProps {
  onAddNew: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAddNew }) => {
  const { neighbors } = useNeighbors();
  const location = useLocation();
  const isNeighbors = location.pathname === '/neighbors';
  const isPackages = location.pathname === '/packages';
  const { user } = useAuth();
  
  return (
    <header className="sticky top-0 z-10 backdrop-blur-md bg-background/80 border-b py-4 px-6 mb-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="rounded-full bg-primary/10 p-2 text-primary">
              {isNeighbors ? <Users size={24} /> : <Package size={24} />}
            </div>
            <div>
              <h1 className="text-xl font-medium">
                {isNeighbors ? 'Base de Datos de Vecinos' : 'Registro de Paquetes'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isNeighbors 
                  ? `${neighbors.length} ${neighbors.length === 1 ? 'vecino' : 'vecinos'} registrados`
                  : 'Gestión de paquetes de los vecinos'}
              </p>
            </div>
          </div>
          <div className="flex space-x-2 items-center">
            <Button onClick={onAddNew} className="group">
              {isNeighbors ? (
                <>
                  <Users size={18} className="mr-2 transition-transform group-hover:scale-110" />
                  Agregar Vecino
                </>
              ) : (
                <>
                  <Package size={18} className="mr-2 transition-transform group-hover:scale-110" />
                  Agregar Paquete
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
