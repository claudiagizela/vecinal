
import React, { useState } from 'react';
import { usePackages } from '@/context/PackageContext';
import { useNeighbors } from '@/context/NeighborContext';
import { Package as PackageIcon, Upload, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { PackageFormData } from '@/types/package';
import { useNavigate } from 'react-router-dom';

const BulkPackageRegistration = () => {
  const { addPackage } = usePackages();
  const { neighbors } = useNeighbors();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedImages, setProcessedImages] = useState<Array<{
    id: number;
    image: string;
    status: 'processing' | 'success' | 'error';
    packageData?: PackageFormData;
    errorMessage?: string;
  }>>([]);
  const [uploadedCount, setUploadedCount] = useState(0);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsProcessing(true);
      const newFiles = Array.from(e.target.files);
      const newProcessedImages: typeof processedImages = [];
      
      newFiles.forEach((file, index) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          
          // Add image to processing queue
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

  // Simulate processing images and extracting data
  const processLabelImages = async (images: typeof processedImages) => {
    // In a real implementation, this would call an API for image processing
    // For now, we'll simulate the process with random neighbor assignments

    const processedResults = await Promise.all(images.map(async (img) => {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
      
      // Get timestamp from now (in a real implementation, this would come from image metadata)
      const now = new Date();
      
      // Randomly select a neighbor
      const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
      
      if (!randomNeighbor || Math.random() < 0.2) { // 20% chance of error for demo
        return {
          ...img,
          status: 'error' as const,
          errorMessage: 'No se pudo reconocer la información del paquete'
        };
      }
      
      // Create package data
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
        packageData
      };
    }));
    
    setProcessedImages(prev => 
      prev.map(item => {
        const updated = processedResults.find(r => r.id === item.id);
        return updated || item;
      })
    );
    
    setIsProcessing(false);
    
    // Count successful packages
    const successCount = processedResults.filter(item => item.status === 'success').length;
    if (successCount > 0) {
      setUploadedCount(prev => prev + successCount);
      toast({
        title: "Procesamiento completado",
        description: `${successCount} de ${processedResults.length} paquetes fueron procesados correctamente.`,
      });
    }
  };

  const registerPackages = () => {
    const successfulItems = processedImages.filter(item => 
      item.status === 'success' && item.packageData
    );
    
    successfulItems.forEach(item => {
      if (item.packageData) {
        addPackage(item.packageData);
      }
    });
    
    toast({
      title: "Paquetes registrados",
      description: `${successfulItems.length} paquetes han sido registrados exitosamente.`,
    });
    
    // Clear registered packages from the list
    setProcessedImages(prev => 
      prev.filter(item => item.status !== 'success')
    );
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

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 backdrop-blur-md bg-background/80 border-b py-4 px-6 mb-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="rounded-full bg-primary/10 p-2 text-primary">
                <PackageIcon size={24} />
              </div>
              <div>
                <h1 className="text-xl font-medium">Registro Masivo de Paquetes</h1>
                <p className="text-sm text-muted-foreground">
                  Registra múltiples paquetes con fotos de etiquetas
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={() => navigate('/packages')}
                className="gap-2"
              >
                <ArrowLeft size={16} />
                Volver a Paquetes
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <main className="max-w-7xl mx-auto px-6 pb-16 animate-fade-in">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/2">
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-lg">
                  <Upload className="h-12 w-12 text-muted-foreground mb-3" />
                  <h3 className="text-lg font-medium mb-1">Subir fotografías de etiquetas</h3>
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    Sube fotografías de las etiquetas de los paquetes para procesarlas automáticamente
                  </p>
                  <input 
                    type="file" 
                    id="bulk-images" 
                    className="hidden" 
                    multiple 
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isProcessing}
                  />
                  <Button 
                    onClick={() => document.getElementById('bulk-images')?.click()}
                    disabled={isProcessing}
                    className="gap-2"
                  >
                    <Upload size={16} />
                    Seleccionar Imágenes
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {uploadedCount > 0 && (
              <Alert className="mb-6 bg-green-50 text-green-700 border-green-200">
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Paquetes registrados</AlertTitle>
                <AlertDescription>
                  Has registrado exitosamente {uploadedCount} paquetes en esta sesión.
                </AlertDescription>
              </Alert>
            )}
          </div>
          
          <div className="w-full md:w-1/2">
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Paquetes procesados</h3>
                  <div className="flex gap-2">
                    {processedImages.filter(i => i.status === 'error').length > 0 && (
                      <Button variant="outline" size="sm" onClick={retryFailedItems} disabled={isProcessing}>
                        Reintentar fallidos
                      </Button>
                    )}
                    {processedImages.length > 0 && (
                      <Button variant="outline" size="sm" onClick={clearAll} disabled={isProcessing}>
                        Limpiar
                      </Button>
                    )}
                  </div>
                </div>
                
                {processedImages.length > 0 ? (
                  <div className="space-y-4">
                    {processedImages.map((item) => (
                      <div key={item.id} className="border rounded-lg overflow-hidden">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="col-span-1 h-24 relative">
                            <img 
                              src={item.image} 
                              alt="Package label" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="col-span-2 p-3">
                            <div className="flex justify-between items-start">
                              <div>
                                {item.status === 'processing' && (
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                    Procesando...
                                  </Badge>
                                )}
                                {item.status === 'success' && item.packageData && (
                                  <>
                                    <div className="font-medium">
                                      {neighbors.find(n => n.id === item.packageData?.neighbor_id)?.name}{' '}
                                      {neighbors.find(n => n.id === item.packageData?.neighbor_id)?.last_name}{' '}
                                      {neighbors.find(n => n.id === item.packageData?.neighbor_id)?.second_last_name}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      Apto {neighbors.find(n => n.id === item.packageData?.neighbor_id)?.apartment} | {item.packageData.company}
                                    </div>
                                  </>
                                )}
                                {item.status === 'error' && (
                                  <div className="text-destructive text-sm font-medium">
                                    {item.errorMessage || 'Error al procesar'}
                                  </div>
                                )}
                              </div>
                              {item.status === 'success' && (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  Listo para registrar
                                </Badge>
                              )}
                              {item.status === 'error' && (
                                <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                                  Error
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <Separator className="my-4" />
                    
                    <div className="flex justify-end">
                      <Button 
                        onClick={registerPackages}
                        disabled={isProcessing || !processedImages.some(i => i.status === 'success')}
                        className="gap-2"
                      >
                        <CheckCircle2 size={16} />
                        Registrar {processedImages.filter(i => i.status === 'success').length} Paquetes
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mb-3" />
                    <h3 className="text-lg font-medium mb-1">No hay paquetes procesados</h3>
                    <p className="text-sm text-muted-foreground max-w-md">
                      Sube fotografías de las etiquetas de los paquetes para comenzar a procesarlos y registrarlos automáticamente
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BulkPackageRegistration;
