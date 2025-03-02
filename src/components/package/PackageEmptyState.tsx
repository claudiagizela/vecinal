
import React from 'react';
import { PackageIcon } from 'lucide-react';

interface PackageEmptyStateProps {
  hasSearchFilter: boolean;
  isReadOnly?: boolean;
}

const PackageEmptyState: React.FC<PackageEmptyStateProps> = ({ hasSearchFilter, isReadOnly }) => {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-fade-in">
      <PackageIcon size={48} className="text-muted-foreground mb-4 opacity-30" />
      <h3 className="text-lg font-medium">No se encontraron paquetes</h3>
      <p className="text-sm text-muted-foreground mt-1">
        {hasSearchFilter 
          ? 'Prueba con otros términos de búsqueda' 
          : isReadOnly 
            ? 'No tienes paquetes registrados en este momento'
            : 'Agrega paquetes a la base de datos'
        }
      </p>
    </div>
  );
};

export default PackageEmptyState;
