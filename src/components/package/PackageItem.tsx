
import React, { useState } from 'react';
import { Package as PackageIcon, Building2, Calendar, Check, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatDateTime } from '@/utils/dateFormatters';
import { Package } from '@/types/package';
import PackageStatusBadge from './PackageStatusBadge';
import PackageTypeIcon from './PackageTypeIcon';
import PackageActions from './PackageActions';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface PackageItemProps {
  pkg: Package;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onMarkDelivered?: (id: string) => void;
  onMarkPending?: (id: string) => void;
  onResendNotification?: (id: string) => void;
  isVecinoView?: boolean;
}

const PackageItem: React.FC<PackageItemProps> = ({
  pkg,
  onEdit,
  onDelete,
  onMarkDelivered,
  onMarkPending,
  onResendNotification,
  isVecinoView,
}) => {
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  // Determine if we're showing this in read-only mode (for vecinos)
  const isReadOnly = !onEdit && !onDelete && !isVecinoView;

  return (
    <>
      <Card key={pkg.id} className="overflow-hidden transition-all duration-200 hover:shadow-md animate-fade-in">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="w-full">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-primary/10 p-2 text-primary">
                    <PackageIcon size={16} />
                  </div>
                  {isReadOnly || isVecinoView ? (
                    <div>
                      <h3 className="font-medium">
                        Paquete de {pkg.company}
                      </h3>
                      <span className="text-xs text-muted-foreground capitalize">
                        {pkg.type}
                      </span>
                    </div>
                  ) : (
                    <div>
                      <h3 className="font-medium">
                        {pkg.neighbor?.name} {pkg.neighbor?.last_name} {pkg.neighbor?.second_last_name}
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        Apto {pkg.neighbor?.apartment}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <PackageStatusBadge isDelivered={!!pkg.delivered_date} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3 text-sm">
                {!isReadOnly && !isVecinoView && (
                  <>
                    <div className="flex items-center text-muted-foreground">
                      <PackageTypeIcon type={pkg.type} />
                      <span className="capitalize">{pkg.type}</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Building2 size={14} className="mr-1" />
                      <span>{pkg.company}</span>
                    </div>
                  </>
                )}
                <div className="flex items-center text-muted-foreground col-span-2">
                  <Calendar size={14} className="mr-1" />
                  <span>
                    Recibido: {formatDateTime(pkg.received_date).date} a las {formatDateTime(pkg.received_date).time}
                  </span>
                </div>
                {pkg.delivered_date && (
                  <div className="flex items-center text-muted-foreground col-span-2">
                    <Check size={14} className="mr-1" />
                    <span>
                      Entregado: {formatDateTime(pkg.delivered_date).date} a las {formatDateTime(pkg.delivered_date).time}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Vecino View Actions */}
              {isVecinoView && (
                <div className="flex justify-end gap-2 mt-3">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setDetailsOpen(true)}
                    className="h-8"
                  >
                    <Eye size={14} className="mr-1" /> Ver detalle
                  </Button>
                  
                  {!pkg.delivered_date && onMarkDelivered && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onMarkDelivered(pkg.id)}
                      className="h-8 text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                    >
                      <Check size={14} className="mr-1" /> Confirmar recepción
                    </Button>
                  )}
                </div>
              )}
              
              {/* Guard Actions */}
              {!isReadOnly && !isVecinoView && (
                <PackageActions 
                  isDelivered={!!pkg.delivered_date}
                  onMarkDelivered={onMarkDelivered ? () => onMarkDelivered(pkg.id) : undefined}
                  onMarkPending={onMarkPending ? () => onMarkPending(pkg.id) : undefined}
                  onEdit={onEdit ? () => onEdit(pkg.id) : undefined}
                  onDelete={onDelete ? () => onDelete(pkg.id) : undefined}
                  onResendNotification={onResendNotification ? () => onResendNotification(pkg.id) : undefined}
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Package Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalles del Paquete</DialogTitle>
            <DialogDescription>
              Información completa sobre su paquete
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="font-medium text-right">Tipo:</div>
              <div className="col-span-2 capitalize">{pkg.type}</div>
              
              <div className="font-medium text-right">Compañía:</div>
              <div className="col-span-2">{pkg.company}</div>
              
              <div className="font-medium text-right">Recibido:</div>
              <div className="col-span-2">
                {formatDateTime(pkg.received_date).date} a las {formatDateTime(pkg.received_date).time}
              </div>
              
              {pkg.delivered_date && (
                <>
                  <div className="font-medium text-right">Entregado:</div>
                  <div className="col-span-2">
                    {formatDateTime(pkg.delivered_date).date} a las {formatDateTime(pkg.delivered_date).time}
                  </div>
                </>
              )}
              
              <div className="font-medium text-right">Estado:</div>
              <div className="col-span-2">
                <PackageStatusBadge isDelivered={!!pkg.delivered_date} />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            {!pkg.delivered_date && onMarkDelivered && (
              <Button 
                onClick={() => {
                  onMarkDelivered(pkg.id);
                  setDetailsOpen(false);
                }}
                className="w-full sm:w-auto"
              >
                <Check size={16} className="mr-2" /> Confirmar recepción
              </Button>
            )}
            {pkg.delivered_date && (
              <Button 
                variant="outline" 
                onClick={() => setDetailsOpen(false)}
                className="w-full sm:w-auto"
              >
                Cerrar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PackageItem;
