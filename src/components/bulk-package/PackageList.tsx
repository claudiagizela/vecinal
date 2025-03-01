
import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Neighbor } from '@/types/neighbor';
import { PackageFormData } from '@/types/package';
import PackageItem from './PackageItem';

interface ProcessedImage {
  id: number;
  image: string;
  status: 'processing' | 'success' | 'error';
  packageData?: PackageFormData;
  errorMessage?: string;
  confidenceScore?: number;
}

interface PackageListProps {
  processedImages: ProcessedImage[];
  neighbors: Neighbor[];
  isProcessing: boolean;
  onRetryItem: (id: number) => void;
  onRetryFailed: () => void;
  onClearAll: () => void;
  onManualEdit: (id: number) => void;
  onRegisterPackages: () => void;
}

const PackageList: React.FC<PackageListProps> = ({
  processedImages,
  neighbors,
  isProcessing,
  onRetryItem,
  onRetryFailed,
  onClearAll,
  onManualEdit,
  onRegisterPackages
}) => {
  const hasErrorItems = processedImages.some(i => i.status === 'error');
  const hasSuccessItems = processedImages.some(i => i.status === 'success');
  
  if (processedImages.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Paquetes procesados</h3>
          </div>
          
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-3" />
            <h3 className="text-lg font-medium mb-1">No hay paquetes procesados</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Sube fotografías de las etiquetas de los paquetes para comenzar a procesarlos y registrarlos automáticamente
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Paquetes procesados</h3>
          <div className="flex gap-2">
            {hasErrorItems && (
              <Button variant="outline" size="sm" onClick={onRetryFailed} disabled={isProcessing}>
                Reintentar fallidos
              </Button>
            )}
            {processedImages.length > 0 && (
              <Button variant="outline" size="sm" onClick={onClearAll} disabled={isProcessing}>
                Limpiar
              </Button>
            )}
          </div>
        </div>
        
        <div className="space-y-4">
          {processedImages.map((item) => (
            <PackageItem 
              key={item.id} 
              item={item} 
              neighbors={neighbors}
              onRetry={onRetryItem}
              onManualEdit={onManualEdit}
            />
          ))}
          
          <Separator className="my-4" />
          
          <div className="flex justify-end">
            <Button 
              onClick={onRegisterPackages}
              disabled={isProcessing || !hasSuccessItems}
              className="gap-2"
            >
              <CheckCircle2 size={16} />
              Registrar {processedImages.filter(i => i.status === 'success').length} Paquetes
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PackageList;
