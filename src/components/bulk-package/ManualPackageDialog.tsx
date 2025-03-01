
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import PackageForm from '@/components/PackageForm';
import { Package, PackageFormData } from '@/types/package';

interface ManualPackageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId: number | null;
  image: string;
  onSubmit: (data: PackageFormData) => void;
}

const ManualPackageDialog: React.FC<ManualPackageDialogProps> = ({
  open,
  onOpenChange,
  itemId,
  image,
  onSubmit
}) => {
  if (!itemId) return null;
  
  const initialData: Package = {
    id: String(itemId),
    type: 'caja',
    received_date: new Date().toISOString(),
    delivered_date: null,
    company: 'otro',
    neighbor_id: '',
    images: [image]
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registro Manual de Paquete</DialogTitle>
          <DialogDescription>
            Ingresa los datos del paquete manualmente
          </DialogDescription>
        </DialogHeader>
        
        <PackageForm
          initialData={initialData}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ManualPackageDialog;
