
import { useState } from 'react';
import { usePackages } from '@/context/PackageContext';
import { useNeighbors } from '@/context/NeighborContext';
import { toast } from '@/components/ui/use-toast';
import { PackageFormData } from '@/types/package';

interface ProcessedImage {
  id: number;
  image: string;
  status: 'processing' | 'success' | 'error';
  packageData?: PackageFormData;
  errorMessage?: string;
  confidenceScore?: number;
}

export function useBulkPackageProcessor() {
  const { addPackage } = usePackages();
  const { neighbors } = useNeighbors();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [manualItemId, setManualItemId] = useState<number | null>(null);
  const [showManualForm, setShowManualForm] = useState(false);

  const getImageFromItemId = (id: number | null): string => {
    if (!id) return '';
    return processedImages.find(i => i.id === id)?.image || '';
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
          
          newProcessedImages.push({
            id: Date.now() + index,
            image: base64,
            status: 'processing'
          });
          
          if (newProcessedImages.length === newFiles.length) {
            setProcessedImages(prev => [...prev, ...newProcessedImages]);
            processLabelImages(newProcessedImages);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const processLabelImages = async (images: ProcessedImage[]) => {
    const processedResults = await Promise.all(images.map(async (img) => {
      // Simulate API call to label recognition service
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
      const now = new Date();
      const confidenceScore = Math.round((0.3 + Math.random() * 0.7) * 100);
      const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
      
      if (!randomNeighbor || Math.random() < 0.2) {
        return {
          ...img,
          status: 'error' as const,
          errorMessage: 'No se pudo reconocer la información del paquete',
          confidenceScore: Math.round(Math.random() * 40)
        };
      }
      
      const packageData: PackageFormData = {
        type: Math.random() > 0.5 ? 'caja' : Math.random() > 0.5 ? 'sobre' : 'bolsa',
        received_date: now.toISOString(),
        delivered_date: null,
        company: Math.random() > 0.7 ? 'Amazon' : 
                 Math.random() > 0.5 ? 'Mercado Libre' : 
                 Math.random() > 0.5 ? 'DHL' : 'FedEx',
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
    
    setProcessedImages(prev => 
      prev.map(item => {
        const updated = processedResults.find(r => r.id === item.id);
        return updated || item;
      })
    );
    
    setIsProcessing(false);
    
    const successCount = processedResults.filter(item => item.status === 'success').length;
    if (successCount > 0) {
      toast({
        title: "Procesamiento completado",
        description: `${successCount} de ${processedResults.length} paquetes fueron procesados correctamente.`,
      });
    }
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
      toast({
        title: "Paquetes registrados",
        description: `${registeredCount} paquetes han sido registrados exitosamente.`,
      });
      
      setProcessedImages(prev => 
        prev.filter(item => item.status !== 'success')
      );
    }
  };

  const retryFailedItems = () => {
    const failedItems = processedImages.filter(item => item.status === 'error');
    if (failedItems.length > 0) {
      setIsProcessing(true);
      processLabelImages(failedItems);
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
      processLabelImages(itemsToProcess);
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
    
    toast({
      title: "Paquete actualizado",
      description: "Datos del paquete actualizados manualmente.",
    });
  };

  return {
    isProcessing,
    processedImages,
    uploadedCount,
    manualItemId,
    showManualForm,
    getImageFromItemId,
    handleImageUpload,
    registerPackages,
    retryFailedItems,
    clearAll,
    handleRetryItem,
    openManualForm,
    handleManualSubmit,
    setShowManualForm
  };
}
