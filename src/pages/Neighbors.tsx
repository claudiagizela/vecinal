
import React, { useState } from 'react';
import { useNeighbors } from '@/context/NeighborContext';
import { useAuth } from '@/context/auth';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import NeighborForm from '@/components/NeighborForm';
import NeighborList from '@/components/NeighborList';
import { NeighborFormData } from '@/types/neighbor';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const Index = () => {
  const { neighbors, addNeighbor, updateNeighbor, deleteNeighbor, getNeighbor, loading } = useNeighbors();
  const { user } = useAuth();
  const [formOpen, setFormOpen] = useState(false);
  const [currentNeighborId, setCurrentNeighborId] = useState<string | null>(null);

  const isVecino = user?.user_metadata?.role === 'vecino';

  const handleOpenForm = () => {
    setCurrentNeighborId(null);
    setFormOpen(true);
  };

  const handleEditNeighbor = (id: string) => {
    setCurrentNeighborId(id);
    setFormOpen(true);
  };

  const handleSubmit = (data: NeighborFormData) => {
    if (currentNeighborId) {
      updateNeighbor(currentNeighborId, data);
    } else {
      addNeighbor(data);
    }
    setFormOpen(false);
  };

  const currentNeighbor = currentNeighborId ? getNeighbor(currentNeighborId) : undefined;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex">
        <Sidebar />
        <div className="flex-1">
          <div className="sticky top-0 z-10 backdrop-blur-md bg-background/80 border-b py-4 px-6 mb-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div>
                    <Skeleton className="h-6 w-36" />
                    <Skeleton className="h-4 w-24 mt-1" />
                  </div>
                </div>
                <Skeleton className="h-10 w-36" />
              </div>
            </div>
          </div>
          
          <main className="max-w-7xl mx-auto px-6 pb-16 animate-fade-in">
            <div className="grid grid-cols-1 gap-8">
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div>
                            <Skeleton className="h-5 w-40" />
                            <div className="flex flex-wrap mt-2 gap-3">
                              <Skeleton className="h-4 w-20" />
                              <Skeleton className="h-4 w-24" />
                              <Skeleton className="h-4 w-16" />
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Skeleton className="h-8 w-8" />
                          <Skeleton className="h-8 w-8" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Header onAddNew={handleOpenForm} />
        
        <main className="max-w-7xl mx-auto px-6 pb-16 animate-fade-in">
          <div className="grid grid-cols-1 gap-8">
            <NeighborList 
              neighbors={neighbors}
              onEdit={handleEditNeighbor}
              onDelete={deleteNeighbor}
            />
          </div>
        </main>

        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent className="max-w-md animate-slide-up">
            <DialogHeader>
              <DialogTitle>
                {currentNeighborId ? 'Editar Vecino' : 'Agregar Nuevo Vecino'}
              </DialogTitle>
            </DialogHeader>
            <NeighborForm
              initialData={currentNeighbor}
              onSubmit={handleSubmit}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Index;
