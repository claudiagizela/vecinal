
import { useState } from 'react';
import { usePackages } from '@/context/PackageContext';
import { useNeighbors } from '@/context/NeighborContext';
import type { PackageFormData } from '@/types/package';
import type { ProcessedImage, ProcessingErrorType } from './bulk-processor/types';
import { processLabelImages } from './bulk-processor/labelProcessingService';
import { showProcessingResults } from './bulk-processor/notificationHandler';
import { useImageUploadProcessor } from './bulk-processor/useImageUploadProcessor';
import { useConfidenceThreshold } from './bulk-processor/useConfidenceThreshold';
import { usePackageRegistration } from './bulk-processor/usePackageRegistration';
import { useManualPackageForm } from './bulk-processor/useManualPackageForm';

export type { ProcessingErrorType } from './bulk-processor/types';

export function useBulkPackageProcessor() {
  const { addPackage } = usePackages();
  const { neighbors } = useNeighbors();
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Process images function shared between components
  const processImages = async (images: ProcessedImage[], threshold: number) => {
    const processedResults = await processLabelImages(images, neighbors, threshold);
    
    setProcessedImages(prev => 
      prev.map(item => {
        const updated = processedResults.find(r => r.id === item.id);
        return updated || item;
      })
    );
    
    setIsProcessing(false);
    showProcessingResults(processedResults);
  };

  // Confidence threshold management
  const { confidenceThreshold, updateConfidenceThreshold } = useConfidenceThreshold({
    processedImages,
    setProcessedImages
  });

  // Image upload processing
  const { handleImageUpload } = useImageUploadProcessor({
    processedImages,
    setProcessedImages,
    setIsProcessing,
    neighbors
  });

  // Package registration
  const { registerPackages, retryFailedItems, handleRetryItem, clearAll } = usePackageRegistration({
    processedImages,
    setProcessedImages,
    setUploadedCount,
    addPackage,
    setIsProcessing,
    confidenceThreshold
  });

  // Manual package form
  const { 
    manualItemId,
    showManualForm,
    getImageFromItemId,
    openManualForm,
    handleManualSubmit,
    setShowManualForm
  } = useManualPackageForm({
    processedImages,
    setProcessedImages
  });

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
