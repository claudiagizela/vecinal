
import React, { useState } from 'react';
import { usePackages } from '@/context/PackageContext';
import Header from '@/components/Header';
import PackageForm from '@/components/PackageForm';
import PackageList from '@/components/PackageList';
import { Package, PackageFormData } from '@/types/package';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package as PackageIcon, PackageCheck, PackagePlus, ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Packages = () => {
  const { packages, addPackage, updatePackage, deletePackage, getPackage, markAsDelivered, markAsPending, loading } = usePackages();
  const [formOpen, setFormOpen] = useState(false);
  const [currentPackageId, setCurrentPackageId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'delivered'>('pending');

  const filteredPackages = packages.filter(pkg => {
    if (activeTab === 'pending') return !pkg.delivered_date;
    if (activeTab === 'delivered') return !!pkg.delivered_date;
    return true;
  });

  const handleOpenForm = () => {
    setCurrentPackageId(null);
    setFormOpen(true);
  };

  const handleEditPackage = (id: string) => {
    setCurrentPackageId(id);
    setFormOpen(true);
  };

  const handleSubmit = (data: PackageFormData) => {
    if (currentPackageId) {
      updatePackage(currentPackageId, data);
    } else {
      addPackage(data);
    }
    setFormOpen(false);
  };

  const currentPackage = currentPackageId ? getPackage(currentPackageId) : undefined;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
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
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    );
  }

  const pendingCount = packages.filter(p => !p.delivered_date).length;
  const deliveredCount = packages.filter(p => !!p.delivered_date).length;

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
                <h1 className="text-xl font-medium">Registro de Paquetes</h1>
                <p className="text-sm text-muted-foreground">
                  {packages.length} {packages.length === 1 ? 'paquete' : 'paquetes'} registrados
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Link to="/" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                Vecinos
              </Link>
              <Link 
                to="/bulk-packages"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium gap-2 ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
              >
                <ImageIcon size={16} />
                Registro por Foto
              </Link>
              <button 
                onClick={handleOpenForm}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium gap-2 ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                <PackagePlus size={16} />
                Registrar Paquete
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <main className="max-w-7xl mx-auto px-6 pb-16 animate-fade-in">
        <Tabs defaultValue="pending" className="mb-6" onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-flex">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <PackageIcon size={16} />
              <span>Pendientes ({pendingCount})</span>
            </TabsTrigger>
            <TabsTrigger value="delivered" className="flex items-center gap-2">
              <PackageCheck size={16} />
              <span>Entregados ({deliveredCount})</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-1 gap-8">
          <PackageList 
            packages={filteredPackages}
            onEdit={handleEditPackage}
            onDelete={deletePackage}
            onMarkDelivered={markAsDelivered}
            onMarkPending={markAsPending}
          />
        </div>
      </main>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md animate-slide-up">
          <DialogHeader>
            <DialogTitle>
              {currentPackageId ? 'Editar Paquete' : 'Registrar Nuevo Paquete'}
            </DialogTitle>
          </DialogHeader>
          <PackageForm
            initialData={currentPackage}
            onSubmit={handleSubmit}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Packages;
