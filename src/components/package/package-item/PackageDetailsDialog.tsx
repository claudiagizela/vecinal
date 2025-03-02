
import React from 'react';
import { Check } from 'lucide-react';
import { Package } from '@/types/package';
import { formatDateTime } from '@/utils/dateFormatters';
import PackageStatusBadge from '../PackageStatusBadge';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/components/ui/dialog';

interface PackageDetailsDialogProps {
  pkg: Package;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMarkDelivered?: (id: string) => void;
}

const PackageDetailsDialog: React.FC<PackageDetailsDialogProps> = ({
  pkg,
  open,
  onOpenChange,
  onMarkDelivered
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Detalles del Paquete</DialogTitle>
          <DialogDescription>
            Información completa sobre su paquete
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="font-medium text-right">Tipo:</div>
            <div className="col-span-2 capitalize">{pkg.type}</div>
            
            <div className="font-medium text-right">Compañía:</div>
            <div className="col-span-2">{pkg.company}</div>
            
            <div className="font-medium text-right">Recibido:</div>
            <div className="col-span-2">
              {formatDateTime(pkg.received_date).date} a las {formatDateTime(pkg.received_date).time}
            </div>
            
            {pkg.delivered_date && (
              <>
                <div className="font-medium text-right">Entregado:</div>
                <div className="col-span-2">
                  {formatDateTime(pkg.delivered_date).date} a las {formatDateTime(pkg.delivered_date).time}
                </div>
              </>
            )}
            
            <div className="font-medium text-right">Estado:</div>
            <div className="col-span-2">
              <PackageStatusBadge isDelivered={!!pkg.delivered_date} />
            </div>
          </div>
        </div>
        
        <DialogFooter>
          {!pkg.delivered_date && onMarkDelivered && (
            <Button 
              onClick={() => {
                onMarkDelivered(pkg.id);
                onOpenChange(false);
              }}
              className="w-full sm:w-auto"
            >
              <Check size={16} className="mr-2" /> Confirmar recepción
            </Button>
          )}
          {pkg.delivered_date && (
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              Cerrar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PackageDetailsDialog;
