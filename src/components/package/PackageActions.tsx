
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, Pencil, Trash2, RefreshCw } from 'lucide-react';

interface PackageActionsProps {
  isDelivered: boolean;
  onMarkDelivered: () => void;
  onMarkPending?: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const PackageActions: React.FC<PackageActionsProps> = ({
  isDelivered,
  onMarkDelivered,
  onMarkPending,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="flex justify-end gap-2 mt-3">
      {isDelivered ? (
        <>
          {onMarkPending && (
            <Button
              size="sm"
              variant="outline"
              onClick={onMarkPending}
              className="h-8 text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700"
            >
              <RefreshCw size={14} className="mr-1" /> Marcar como pendiente
            </Button>
          )}
        </>
      ) : (
        <Button
          size="sm"
          variant="outline"
          onClick={onMarkDelivered}
          className="h-8 text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
        >
          <Check size={14} className="mr-1" /> Marcar entregado
        </Button>
      )}
      <Button 
        size="icon" 
        variant="ghost" 
        onClick={onEdit}
        className="h-8 w-8 transition-all hover:text-primary"
      >
        <Pencil size={16} />
      </Button>
      <Button 
        size="icon" 
        variant="ghost" 
        onClick={onDelete}
        className="h-8 w-8 transition-all hover:text-destructive"
      >
        <Trash2 size={16} />
      </Button>
    </div>
  );
};

export default PackageActions;
