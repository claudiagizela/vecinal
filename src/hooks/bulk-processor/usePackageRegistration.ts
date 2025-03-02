
import { useNeighbors } from '@/context/NeighborContext';
import type { PackageFormData } from '@/types/package';
import type { ProcessedImage } from './types';
import { processLabelImages } from './labelProcessingService';
import { showPackagesRegistered, showProcessingResults } from './notificationHandler';

interface UsePackageRegistrationProps {
  processedImages: ProcessedImage[];
  setProcessedImages: React.Dispatch<React.SetStateAction<ProcessedImage[]>>;
  setUploadedCount: React.Dispatch<React.SetStateAction<number>>;
  addPackage: (data: PackageFormData) => Promise<string | undefined>;
  setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>;
  confidenceThreshold: number;
}

export function usePackageRegistration({
  processedImages,
  setProcessedImages,
  setUploadedCount,
  addPackage,
  setIsProcessing,
  confidenceThreshold
}: UsePackageRegistrationProps) {
  const { neighbors } = useNeighbors();
  
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
      processItems(failedItems);
    }
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
      processItems(itemsToProcess);
    }
  };

  // This function processes images with the current confidence threshold
  const processItems = async (items: ProcessedImage[]) => {
    const processedResults = await processLabelImages(items, neighbors, confidenceThreshold);
    
    setProcessedImages(prev => 
      prev.map(item => {
        const updated = processedResults.find(r => r.id === item.id);
        return updated || item;
      })
    );
    
    setIsProcessing(false);
    showProcessingResults(processedResults);
  };

  const clearAll = () => {
    setProcessedImages([]);
  };

  return {
    registerPackages,
    retryFailedItems,
    handleRetryItem,
    clearAll
  };
}
