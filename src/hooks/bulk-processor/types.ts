
import { PackageFormData, PackageType, Company } from '@/types/package';

export type ProcessingErrorType = 
  | 'neighbor_not_found' 
  | 'unclear_image' 
  | 'generic_error'
  | 'low_confidence'
  | 'duplicate_image';

export interface ProcessedImage {
  id: number;
  image: string;
  status: 'processing' | 'success' | 'error';
  packageData?: PackageFormData;
  errorMessage?: string;
  errorType?: ProcessingErrorType;
  confidenceScore?: number;
}
