
import { Neighbor } from '@/types/neighbor';
import type { ProcessedImage } from './types';
import { isDuplicateImage } from './imageUtils';
import { processLabelImages } from './labelProcessingService';
import { showProcessingResults } from './notificationHandler';

interface UseImageUploadProcessorProps {
  processedImages: ProcessedImage[];
  setProcessedImages: React.Dispatch<React.SetStateAction<ProcessedImage[]>>;
  setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>;
  neighbors: Neighbor[];
}

export function useImageUploadProcessor({
  processedImages,
  setProcessedImages,
  setIsProcessing,
  neighbors
}: UseImageUploadProcessorProps) {
  
  const isDuplicateImageInCurrentSet = (newImage: string): boolean => {
    return processedImages.some(item => item.image === newImage);
  };

  const processImages = async (images: ProcessedImage[], confidenceThreshold = 80) => {
    const processedResults = await processLabelImages(images, neighbors, confidenceThreshold);
    
    setProcessedImages(prev => 
      prev.map(item => {
        const updated = processedResults.find(r => r.id === item.id);
        return updated || item;
      })
    );
    
    setIsProcessing(false);
    showProcessingResults(processedResults);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsProcessing(true);
      const newFiles = Array.from(e.target.files);
      const newProcessedImages: ProcessedImage[] = [];
      
      newFiles.forEach((file, index) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          
          if (isDuplicateImageInCurrentSet(base64)) {
            newProcessedImages.push({
              id: Date.now() + index,
              image: base64,
              status: 'error',
              errorMessage: 'Esta etiqueta está repetida',
              errorType: 'duplicate_image'
            });
          } else {
            newProcessedImages.push({
              id: Date.now() + index,
              image: base64,
              status: 'processing'
            });
          }
          
          if (newProcessedImages.length === newFiles.length) {
            setProcessedImages(prev => [...prev, ...newProcessedImages]);
            const nonDuplicates = newProcessedImages.filter(img => img.status === 'processing');
            if (nonDuplicates.length > 0) {
              processImages(nonDuplicates);
            } else {
              setIsProcessing(false);
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  return {
    handleImageUpload
  };
}
