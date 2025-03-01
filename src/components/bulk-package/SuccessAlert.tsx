
import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface SuccessAlertProps {
  count: number;
}

const SuccessAlert: React.FC<SuccessAlertProps> = ({ count }) => {
  if (count <= 0) return null;
  
  return (
    <Alert className="bg-green-50 text-green-700 border-green-200">
      <CheckCircle2 className="h-4 w-4" />
      <AlertTitle>Paquetes registrados</AlertTitle>
      <AlertDescription>
        Has registrado exitosamente {count} paquetes en esta sesión.
      </AlertDescription>
    </Alert>
  );
};

export default SuccessAlert;
