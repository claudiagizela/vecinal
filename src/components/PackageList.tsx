
import React, { useState } from 'react';
import { Package } from '@/types/package';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Package as PackageIcon,
  Pencil, 
  Trash2, 
  Check,
  Calendar,
  Building2,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PackageListProps {
  packages: Package[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onMarkDelivered: (id: string) => void;
  onMarkPending?: (id: string) => void;
  className?: string;
}

const PackageList: React.FC<PackageListProps> = ({
  packages,
  onEdit,
  onDelete,
  onMarkDelivered,
  onMarkPending,
  className,
}) => {
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredPackages = packages.filter((pkg) =>
    `${pkg.neighbor?.name || ''} ${pkg.neighbor?.last_name || ''} ${pkg.neighbor?.second_last_name || ''} ${pkg.neighbor?.apartment || ''} ${pkg.company} ${pkg.type}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const confirmDelete = (id: string) => {
    setDeleteId(id);
  };

  const handleDelete = () => {
    if (deleteId) {
      onDelete(deleteId);
      setDeleteId(null);
    }
  };

  const cancelDelete = () => {
    setDeleteId(null);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP', { locale: es });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  const getPackageTypeIcon = (type: string) => {
    switch (type) {
      case 'caja':
        return <PackageIcon size={14} className="mr-1" />;
      case 'sobre':
        return <PackageIcon size={14} className="mr-1" />;
      case 'bolsa':
        return <PackageIcon size={14} className="mr-1" />;
      default:
        return <PackageIcon size={14} className="mr-1" />;
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
        <Input
          placeholder="Buscar paquetes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>
      
      {filteredPackages.length > 0 ? (
        <ScrollArea className="h-[60vh] pr-4 -mr-4">
          <div className="space-y-3">
            {filteredPackages.map((pkg) => (
              <Card key={pkg.id} className="overflow-hidden transition-all duration-200 hover:shadow-md animate-fade-in">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="w-full">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="rounded-full bg-primary/10 p-2 text-primary">
                            <PackageIcon size={16} />
                          </div>
                          <div>
                            <h3 className="font-medium">
                              {pkg.neighbor?.name} {pkg.neighbor?.last_name} {pkg.neighbor?.second_last_name}
                            </h3>
                            <span className="text-xs text-muted-foreground">
                              Apto {pkg.neighbor?.apartment}
                            </span>
                          </div>
                        </div>
                        <div>
                          {pkg.delivered_date ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Entregado
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                              Pendiente
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3 text-sm">
                        <div className="flex items-center text-muted-foreground">
                          {getPackageTypeIcon(pkg.type)}
                          <span className="capitalize">{pkg.type}</span>
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <Building2 size={14} className="mr-1" />
                          <span>{pkg.company}</span>
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <Calendar size={14} className="mr-1" />
                          <span>Recibido: {formatDate(pkg.received_date)}</span>
                        </div>
                        {pkg.delivered_date && (
                          <div className="flex items-center text-muted-foreground">
                            <Check size={14} className="mr-1" />
                            <span>Entregado: {formatDate(pkg.delivered_date)}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex justify-end gap-2 mt-3">
                        {pkg.delivered_date ? (
                          onMarkPending && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onMarkPending(pkg.id)}
                              className="h-8 text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700"
                            >
                              <RefreshCw size={14} className="mr-1" /> Marcar como pendiente
                            </Button>
                          )
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onMarkDelivered(pkg.id)}
                            className="h-8 text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                          >
                            <Check size={14} className="mr-1" /> Marcar entregado
                          </Button>
                        )}
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => onEdit(pkg.id)}
                          className="h-8 w-8 transition-all hover:text-primary"
                        >
                          <Pencil size={16} />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => confirmDelete(pkg.id)}
                          className="h-8 w-8 transition-all hover:text-destructive"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-fade-in">
          <PackageIcon size={48} className="text-muted-foreground mb-4 opacity-30" />
          <h3 className="text-lg font-medium">No se encontraron paquetes</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {search ? 'Prueba con otros términos de búsqueda' : 'Agrega paquetes a la base de datos'}
          </p>
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && cancelDelete()}>
        <AlertDialogContent className="animate-fade-in">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el paquete de la base de datos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PackageList;
