import { useState } from 'react';
import { usePackages } from '@/context/PackageContext';
import { useNeighbors } from '@/context/NeighborContext';
import { PackageFormData } from '@/types/package';
import { ProcessedImage, ProcessingErrorType } from './bulk-processor/types';
import { isDuplicateImage } from './bulk-processor/imageUtils';
import { processLabelImages } from './bulk-processor/labelProcessingService';
import { 
  showProcessingResults, 
  showPackagesRegistered, 
  showConfidenceThresholdUpdated,
  showManualUpdateSuccess
} from './bulk-processor/notificationHandler';

export type { ProcessingErrorType } from './bulk-processor/types';

export function useBulkPackageProcessor() {
  const { addPackage } = usePackages();
  const { neighbors } = useNeighbors();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [manualItemId, setManualItemId] = useState<number | null>(null);
  const [showManualForm, setShowManualForm] = useState(false);
  const [confidenceThreshold, setConfidenceThreshold] = useState(80);

  const getImageFromItemId = (id: number | null): string => {
    if (!id) return '';
    return processedImages.find(i => i.id === id)?.image || '';
  };

  const isDuplicateImageInCurrentSet = (newImage: string): boolean => {
    return processedImages.some(item => item.image === newImage);
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

  const processImages = async (images: ProcessedImage[]) => {
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

  const registerPackages = async () => {
    const successfulItems = processedImages.filter(item => 
      item.status === 'success' && item.packageData
    );
    
    let registeredCount = 0;
    
    for (const item of successfulItems) {
      if (item.packageData) {
        try {
          await addPackage(item.packageData);
          registeredCount++;
        } catch (error) {
          console.error('Error registering package:', error);
        }
      }
    }
    
    if (registeredCount > 0) {
      setUploadedCount(prev => prev + registeredCount);
      showPackagesRegistered(registeredCount);
      
      setProcessedImages(prev => 
        prev.filter(item => item.status !== 'success')
      );
    }
  };

  const retryFailedItems = () => {
    const failedItems = processedImages.filter(item => item.status === 'error');
    if (failedItems.length > 0) {
      setIsProcessing(true);
      processImages(failedItems);
    }
  };

  const clearAll = () => {
    setProcessedImages([]);
  };

  const handleRetryItem = (id: number) => {
    const itemToRetry = processedImages.find(item => item.id === id);
    if (itemToRetry) {
      const itemsToProcess = [{ ...itemToRetry, status: 'processing' as const }];
      
      setProcessedImages(prev => 
        prev.map(item => 
          item.id === id ? { ...item, status: 'processing' } : item
        )
      );
      
      setIsProcessing(true);
      processImages(itemsToProcess);
    }
  };

  const openManualForm = (id: number) => {
    setManualItemId(id);
    setShowManualForm(true);
  };

  const handleManualSubmit = (data: PackageFormData) => {
    if (manualItemId) {
      setProcessedImages(prev => 
        prev.map(item => 
          item.id === manualItemId ? {
            ...item,
            status: 'success',
            packageData: data,
            confidenceScore: 100
          } : item
        )
      );
    }
    
    setShowManualForm(false);
    setManualItemId(null);
    showManualUpdateSuccess();
  };

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
    isProcessing,
    processedImages,
    uploadedCount,
    manualItemId,
    showManualForm,
    confidenceThreshold,
    getImageFromItemId,
    handleImageUpload,
    registerPackages,
    retryFailedItems,
    clearAll,
    handleRetryItem,
    openManualForm,
    handleManualSubmit,
    setShowManualForm,
    updateConfidenceThreshold
  };
}
