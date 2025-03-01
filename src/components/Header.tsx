
import React from 'react';
import { Users, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNeighbors } from '@/context/NeighborContext';

interface HeaderProps {
  onAddNew: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAddNew }) => {
  const { neighbors } = useNeighbors();
  
  return (
    <header className="sticky top-0 z-10 backdrop-blur-md bg-background/80 border-b py-4 px-6 mb-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="rounded-full bg-primary/10 p-2 text-primary">
              <Users size={24} />
            </div>
            <div>
              <h1 className="text-xl font-medium">Base de Datos de Vecinos</h1>
              <p className="text-sm text-muted-foreground">
                {neighbors.length} {neighbors.length === 1 ? 'vecino' : 'vecinos'} registrados
              </p>
            </div>
          </div>
          <Button onClick={onAddNew} className="group">
            <Plus size={18} className="mr-2 transition-transform group-hover:scale-110" />
            Agregar Vecino
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
