
import { toast } from '@/components/ui/use-toast';
import { ProcessedImage, ProcessingErrorType } from './types';

export const showProcessingResults = (processedResults: ProcessedImage[]): void => {
  const successCount = processedResults.filter(item => item.status === 'success').length;
  const errorCount = processedResults.filter(item => item.status === 'error').length;
  
  if (successCount > 0 || errorCount > 0) {
    let description = '';
    
    if (successCount > 0) {
      description = `${successCount} de ${processedResults.length} paquetes fueron procesados correctamente.`;
    }
    
    if (errorCount > 0) {
      const errorsByType = processedResults.filter(i => i.status === 'error').reduce((acc, curr) => {
        const errorType = curr.errorType || 'generic_error';
        acc[errorType] = (acc[errorType] || 0) + 1;
        return acc;
      }, {} as Record<ProcessingErrorType, number>);
      
      if (description) description += ' ';
      description += `${errorCount} con errores: `;
      
      const errorDetails = [];
      if (errorsByType.neighbor_not_found) {
        errorDetails.push(`${errorsByType.neighbor_not_found} vecinos no encontrados`);
      }
      if (errorsByType.unclear_image) {
        errorDetails.push(`${errorsByType.unclear_image} imágenes poco claras`);
      }
      if (errorsByType.low_confidence) {
        errorDetails.push(`${errorsByType.low_confidence} con baja confianza`);
      }
      if (errorsByType.generic_error) {
        errorDetails.push(`${errorsByType.generic_error} errores generales`);
      }
      if (errorsByType.duplicate_image) {
        errorDetails.push(`${errorsByType.duplicate_image} imágenes duplicadas`);
      }
      
      description += errorDetails.join(', ');
    }
    
    toast({
      title: "Procesamiento completado",
      description
    });
  }
};

export const showPackagesRegistered = (registeredCount: number): void => {
  if (registeredCount > 0) {
    toast({
      title: "Paquetes registrados",
      description: `${registeredCount} paquetes han sido registrados exitosamente.`,
    });
  }
};

export const showConfidenceThresholdUpdated = (threshold: number): void => {
  toast({
    title: "Umbral de confianza actualizado",
    description: `El umbral de confianza se ha actualizado a ${threshold}%.`
  });
};

export const showManualUpdateSuccess = (): void => {
  toast({
    title: "Paquete actualizado",
    description: "Datos del paquete actualizados manualmente.",
  });
};
