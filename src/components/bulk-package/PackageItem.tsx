
import React from 'react';
import { RefreshCw, Edit, AlertCircle, FileQuestion, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Neighbor } from '@/types/neighbor';
import { PackageFormData } from '@/types/package';
import { ProcessingErrorType } from '@/hooks/useBulkPackageProcessor';

interface ProcessedImage {
  id: number;
  image: string;
  status: 'processing' | 'success' | 'error';
  packageData?: PackageFormData;
  errorMessage?: string;
  errorType?: ProcessingErrorType;
  confidenceScore?: number;
}

interface PackageItemProps {
  item: ProcessedImage;
  neighbors: Neighbor[];
  onRetry: (id: number) => void;
  onManualEdit: (id: number) => void;
}

const PackageItem: React.FC<PackageItemProps> = ({ 
  item, 
  neighbors, 
  onRetry, 
  onManualEdit 
}) => {
  const getConfidenceBadge = (score?: number) => {
    if (!score) return null;
    
    if (score >= 80) {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Confianza alta ({score}%)
        </Badge>
      );
    } else if (score >= 50) {
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          Confianza media ({score}%)
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          Confianza baja ({score}%)
        </Badge>
      );
    }
  };
  
  const getErrorIcon = (errorType?: ProcessingErrorType) => {
    switch (errorType) {
      case 'neighbor_not_found':
        return <UserX size={16} className="mr-1 text-red-500" />;
      case 'unclear_image':
        return <FileQuestion size={16} className="mr-1 text-amber-500" />;
      case 'generic_error':
      default:
        return <AlertCircle size={16} className="mr-1 text-red-500" />;
    }
  };

  const getErrorBadgeClass = (errorType?: ProcessingErrorType) => {
    switch (errorType) {
      case 'neighbor_not_found':
        return "bg-red-50 text-red-700 border-red-200";
      case 'unclear_image':
        return "bg-amber-50 text-amber-700 border-amber-200";
      case 'generic_error':
      default:
        return "bg-destructive/10 text-destructive border-destructive/20";
    }
  };

  // Check if confidence score is high enough to be ready for registration
  const isReadyToRegister = item.status === 'success' && (item.confidenceScore || 0) >= 80;

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-1 h-24 relative">
          <img 
            src={item.image} 
            alt="Package label" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="col-span-2 p-3">
          <div className="flex justify-between items-start">
            <div>
              {item.status === 'processing' && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Procesando...
                </Badge>
              )}
              {item.status === 'success' && item.packageData && (
                <>
                  <div className="font-medium">
                    {neighbors.find(n => n.id === item.packageData?.neighbor_id)?.name}{' '}
                    {neighbors.find(n => n.id === item.packageData?.neighbor_id)?.last_name}{' '}
                    {neighbors.find(n => n.id === item.packageData?.neighbor_id)?.second_last_name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Apto {neighbors.find(n => n.id === item.packageData?.neighbor_id)?.apartment} | {item.packageData.company}
                  </div>
                  <div className="mt-1">
                    {getConfidenceBadge(item.confidenceScore)}
                  </div>
                </>
              )}
              {item.status === 'error' && (
                <div className="text-destructive text-sm font-medium mb-1 flex items-center">
                  {getErrorIcon(item.errorType)}
                  {item.errorMessage || 'Error al procesar'}
                </div>
              )}
            </div>
            
            {item.status === 'success' && (
              <div className="flex flex-col gap-1">
                {isReadyToRegister ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Listo para registrar
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    Requiere revisión
                  </Badge>
                )}
                <div className="flex gap-1 mt-1">
                  <Button variant="outline" size="sm" className="h-6 px-2" onClick={() => onRetry(item.id)}>
                    <RefreshCw size={12} className="mr-1" /> Reintentar
                  </Button>
                  <Button variant="outline" size="sm" className="h-6 px-2" onClick={() => onManualEdit(item.id)}>
                    <Edit size={12} className="mr-1" /> Editar
                  </Button>
                </div>
              </div>
            )}
            
            {item.status === 'error' && (
              <div className="flex flex-col gap-1">
                <Badge variant="outline" className={getErrorBadgeClass(item.errorType)}>
                  Error
                </Badge>
                <div className="flex gap-1 mt-1">
                  <Button variant="outline" size="sm" className="h-6 px-2" onClick={() => onRetry(item.id)}>
                    <RefreshCw size={12} className="mr-1" /> Reintentar
                  </Button>
                  <Button variant="outline" size="sm" className="h-6 px-2" onClick={() => onManualEdit(item.id)}>
                    <Edit size={12} className="mr-1" /> Manual
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageItem;
