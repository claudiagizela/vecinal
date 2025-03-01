
import React, { useState } from 'react';
import { Neighbor } from '@/types/neighbor';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  User, 
  Pencil, 
  Trash2, 
  Search, 
  Home, 
  Phone, 
  Layers3
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

interface NeighborListProps {
  neighbors: Neighbor[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  className?: string;
}

const NeighborList: React.FC<NeighborListProps> = ({
  neighbors,
  onEdit,
  onDelete,
  className,
}) => {
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredNeighbors = neighbors.filter((neighbor) =>
    `${neighbor.name} ${neighbor.last_name} ${neighbor.second_last_name} ${neighbor.apartment}`
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

  return (
    <div className={cn("space-y-4", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
        <Input
          placeholder="Buscar vecinos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>
      
      {filteredNeighbors.length > 0 ? (
        <ScrollArea className="h-[60vh] pr-4 -mr-4">
          <div className="space-y-3">
            {filteredNeighbors.map((neighbor) => (
              <Card key={neighbor.id} className="overflow-hidden transition-all duration-200 hover:shadow-md animate-fade-in">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-primary/10 p-2 text-primary">
                        <User size={22} />
                      </div>
                      <div>
                        <h3 className="font-medium">
                          {neighbor.name} {neighbor.last_name} {neighbor.second_last_name}
                        </h3>
                        <div className="flex flex-wrap mt-2 gap-3">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Home size={14} className="mr-1" />
                            <span>{neighbor.apartment}</span>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Phone size={14} className="mr-1" />
                            <span>{neighbor.mobile_number}</span>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Layers3 size={14} className="mr-1" />
                            <span>{neighbor.id.slice(0, 8)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => onEdit(neighbor.id)}
                        className="h-8 w-8 transition-all hover:text-primary"
                      >
                        <Pencil size={16} />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => confirmDelete(neighbor.id)}
                        className="h-8 w-8 transition-all hover:text-destructive"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-fade-in">
          <User size={48} className="text-muted-foreground mb-4 opacity-30" />
          <h3 className="text-lg font-medium">No se encontraron vecinos</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {search ? 'Prueba con otros términos de búsqueda' : 'Agrega vecinos a la base de datos'}
          </p>
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && cancelDelete()}>
        <AlertDialogContent className="animate-fade-in">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente al vecino de la base de datos.
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

export default NeighborList;
