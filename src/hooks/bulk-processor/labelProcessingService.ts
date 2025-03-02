
import { ProcessedImage, ProcessingErrorType } from './types';
import { getConsistentConfidenceScore } from './imageUtils';
import { PackageType, Company, PackageFormData } from '@/types/package';
import { Neighbor } from '@/types/neighbor';

export const processLabelImages = async (
  images: ProcessedImage[], 
  neighbors: Neighbor[],
  confidenceThreshold: number
): Promise<ProcessedImage[]> => {
  return await Promise.all(images.map(async (img) => {
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
    const now = new Date();
    const confidenceScore = getConsistentConfidenceScore(img.image);
    
    const randomError = Math.random();
    
    if (randomError < 0.06) {
      return {
        ...img,
        status: 'error' as const,
        errorMessage: 'No se encuentra ese vecino en la base de datos',
        errorType: 'neighbor_not_found' as ProcessingErrorType,
        confidenceScore: Math.round(Math.random() * 40)
      };
    }
    
    if (randomError < 0.16) {
      return {
        ...img,
        status: 'error' as const,
        errorMessage: 'La imagen no es suficientemente clara para obtener información',
        errorType: 'unclear_image' as ProcessingErrorType,
        confidenceScore: Math.round(Math.random() * 30)
      };
    }
    
    if (randomError < 0.2) {
      return {
        ...img,
        status: 'error' as const,
        errorMessage: 'Ocurrió un error',
        errorType: 'generic_error' as ProcessingErrorType,
        confidenceScore: Math.round(Math.random() * 20)
      };
    }
    
    const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
    
    if (!randomNeighbor) {
      return {
        ...img,
        status: 'error' as const,
        errorMessage: 'No se encuentra ese vecino en la base de datos',
        errorType: 'neighbor_not_found' as ProcessingErrorType,
        confidenceScore: Math.round(Math.random() * 40)
      };
    }
    
    const randomPackageType: PackageType = Math.random() > 0.5 ? 'caja' : 
                                        Math.random() > 0.5 ? 'sobre' : 
                                        Math.random() > 0.5 ? 'bolsa' : 'otro';
    
    const randomCompany: Company = Math.random() > 0.7 ? 'Amazon' : 
                                  Math.random() > 0.5 ? 'Mercado Libre' : 
                                  Math.random() > 0.5 ? 'DHL' : 'FedEx';
    
    if (confidenceScore < confidenceThreshold) {
      return {
        ...img,
        status: 'error' as const,
        errorMessage: `Confianza insuficiente (${confidenceScore}%)`,
        errorType: 'low_confidence' as ProcessingErrorType,
        confidenceScore,
        packageData: {
          type: randomPackageType,
          received_date: now.toISOString(),
          delivered_date: null,
          company: randomCompany,
          neighbor_id: randomNeighbor.id,
          images: [img.image]
        }
      };
    }
    
    const packageData: PackageFormData = {
      type: randomPackageType,
      received_date: now.toISOString(),
      delivered_date: null,
      company: randomCompany,
      neighbor_id: randomNeighbor.id,
      images: [img.image]
    };
    
    return {
      ...img,
      status: 'success' as const,
      packageData,
      confidenceScore
    };
  }));
};
