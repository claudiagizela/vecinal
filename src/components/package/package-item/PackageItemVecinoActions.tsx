
import React from 'react';
import { Eye, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PackageItemVecinoActionsProps {
  isDelivered: boolean;
  onViewDetails: () => void;
  onMarkDelivered?: () => void;
}

const PackageItemVecinoActions: React.FC<PackageItemVecinoActionsProps> = ({
  isDelivered,
  onViewDetails,
  onMarkDelivered
}) => {
  return (
    <div className="flex justify-end gap-2 mt-3">
      <Button 
        size="sm" 
        variant="outline" 
        onClick={onViewDetails}
        className="h-8"
      >
        <Eye size={14} className="mr-1" /> Ver detalle
      </Button>
      
      {!isDelivered && onMarkDelivered && (
        <Button
          size="sm"
          variant="outline"
          onClick={onMarkDelivered}
          className="h-8 text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
        >
          <Check size={14} className="mr-1" /> Confirmar recepción
        </Button>
      )}
    </div>
  );
};

export default PackageItemVecinoActions;
