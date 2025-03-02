
import React from 'react';
import { MoreVertical, Edit, Trash, Check, ArrowLeft, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PackageActionsProps {
  isDelivered: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onMarkDelivered?: () => void;
  onMarkPending?: () => void;
  onResendNotification?: () => void;
}

const PackageActions = ({
  isDelivered,
  onEdit,
  onDelete,
  onMarkDelivered,
  onMarkPending,
  onResendNotification,
}: PackageActionsProps) => {
  return (
    <div className="flex justify-end mt-3">
      {!isDelivered && onMarkDelivered && (
        <Button
          size="sm"
          variant="outline"
          onClick={onMarkDelivered}
          className="mr-2 h-8 text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
        >
          <Check size={14} className="mr-1" /> Marcar entregado
        </Button>
      )}

      {isDelivered && onMarkPending && (
        <Button
          size="sm"
          variant="outline"
          onClick={onMarkPending}
          className="mr-2 h-8 text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700"
        >
          <ArrowLeft size={14} className="mr-1" /> Marcar pendiente
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menú</span>
            <MoreVertical size={14} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          
          {onEdit && (
            <DropdownMenuItem onClick={onEdit}>
              <Edit size={14} className="mr-2" />
              Editar
            </DropdownMenuItem>
          )}
          
          {!isDelivered && onMarkDelivered && (
            <DropdownMenuItem onClick={onMarkDelivered}>
              <Check size={14} className="mr-2" />
              Marcar entregado
            </DropdownMenuItem>
          )}
          
          {isDelivered && onMarkPending && (
            <DropdownMenuItem onClick={onMarkPending}>
              <ArrowLeft size={14} className="mr-2" />
              Marcar pendiente
            </DropdownMenuItem>
          )}
          
          {isDelivered && onResendNotification && (
            <DropdownMenuItem onClick={onResendNotification}>
              <Send size={14} className="mr-2" />
              Reenviar notificación
            </DropdownMenuItem>
          )}
          
          <DropdownMenuSeparator />
          
          {onDelete && (
            <DropdownMenuItem
              onClick={onDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash size={14} className="mr-2" />
              Eliminar
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default PackageActions;
