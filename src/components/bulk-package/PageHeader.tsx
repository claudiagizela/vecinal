
import React from 'react';
import { Package as PackageIcon, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const PageHeader: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="sticky top-0 z-10 backdrop-blur-md bg-background/80 border-b py-4 px-6 mb-6">
      <div className="max-w-4xl mx-auto">
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
  );
};

export default PageHeader;
