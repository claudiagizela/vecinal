
import React from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ImageUploaderProps {
  isProcessing: boolean;
  onImagesSelected: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ isProcessing, onImagesSelected }) => {
  return (
    <Card className="w-full">
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
            onChange={onImagesSelected}
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
  );
};

export default ImageUploader;
