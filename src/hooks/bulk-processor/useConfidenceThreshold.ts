
import { useState } from 'react';
import type { ProcessedImage } from './types';
import { showConfidenceThresholdUpdated } from './notificationHandler';

interface UseConfidenceThresholdProps {
  processedImages: ProcessedImage[];
  setProcessedImages: React.Dispatch<React.SetStateAction<ProcessedImage[]>>;
}

export function useConfidenceThreshold({
  processedImages,
  setProcessedImages
}: UseConfidenceThresholdProps) {
  const [confidenceThreshold, setConfidenceThreshold] = useState(80);

  const updateConfidenceThreshold = (newThreshold: number) => {
    setConfidenceThreshold(newThreshold);
    setProcessedImages(prev => 
      prev.map(item => {
        if (item.confidenceScore !== undefined) {
          if (item.confidenceScore >= newThreshold && item.errorType === 'low_confidence') {
            return {
              ...item,
              status: 'success',
              errorMessage: undefined,
              errorType: undefined
            };
          } else if (item.confidenceScore < newThreshold && item.status === 'success') {
            return {
              ...item,
              status: 'error',
              errorMessage: `Confianza insuficiente (${item.confidenceScore}%)`,
              errorType: 'low_confidence'
            };
          }
        }
        return item;
      })
    );
    
    showConfidenceThresholdUpdated(newThreshold);
  };

  return {
    confidenceThreshold,
    updateConfidenceThreshold
  };
}
