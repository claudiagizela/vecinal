
import { useState } from 'react';
import type { PackageFormData } from '@/types/package';
import type { ProcessedImage } from './types';
import { showManualUpdateSuccess } from './notificationHandler';

interface UseManualPackageFormProps {
  processedImages: ProcessedImage[];
  setProcessedImages: React.Dispatch<React.SetStateAction<ProcessedImage[]>>;
}

export function useManualPackageForm({
  processedImages,
  setProcessedImages
}: UseManualPackageFormProps) {
  const [manualItemId, setManualItemId] = useState<number | null>(null);
  const [showManualForm, setShowManualForm] = useState(false);

  const getImageFromItemId = (id: number | null): string => {
    if (!id) return '';
    return processedImages.find(i => i.id === id)?.image || '';
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

  return {
    manualItemId,
    showManualForm,
    getImageFromItemId,
    openManualForm,
    handleManualSubmit,
    setShowManualForm
  };
}
