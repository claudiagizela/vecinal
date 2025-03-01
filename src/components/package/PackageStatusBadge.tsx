
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface PackageStatusBadgeProps {
  isDelivered: boolean;
}

const PackageStatusBadge: React.FC<PackageStatusBadgeProps> = ({ isDelivered }) => {
  if (isDelivered) {
    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        Entregado
      </Badge>
    );
  }
  
  return (
    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
      Pendiente
    </Badge>
  );
};

export default PackageStatusBadge;
