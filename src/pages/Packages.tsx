
import React, { useState, useEffect } from 'react';
import { usePackages } from '@/context/PackageContext';
import { useAuth } from '@/context/auth';
import { useNeighbors } from '@/context/NeighborContext';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import PackageForm from '@/components/PackageForm';
import PackageList from '@/components/PackageList';
import { PackageFormData } from '@/types/package';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package as PackageIcon, PackageCheck, PackagePlus, ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Packages = () => {
  const { 
    packages, 
    addPackage, 
    updatePackage, 
    deletePackage, 
    getPackage, 
    markAsDelivered, 
    markAsPending,
    getNeighborPackages,
    resendNotification,
    loading 
  } = usePackages();
  const { user } = useAuth();
  const { getCurrentUserNeighbor } = useNeighbors();
  const [formOpen, setFormOpen] = useState(false);
  const [currentPackageId, setCurrentPackageId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'delivered'>('pending');
  const [userPackages, setUserPackages] = useState(packages);

  const isVecino = user?.user_metadata?.role === 'vecino';
  
  useEffect(() => {
    if (isVecino && user?.id) {
      const currentNeighbor = getCurrentUserNeighbor();
      console.log("Vecino actual encontrado:", currentNeighbor);
      
      if (currentNeighbor) {
        // Use the neighbor_id from the current neighbor to get packages
        const vecinoPaquetes = getNeighborPackages(currentNeighbor.id);
        console.log("Paquetes del vecino:", vecinoPaquetes);
        setUserPackages(vecinoPaquetes);
      } else {
        console.log("No se encontró perfil de vecino para:", user.email);
        setUserPackages([]);
      }
    } else {
      setUserPackages(packages);
    }
  }, [isVecino, user, packages, getCurrentUserNeighbor, getNeighborPackages]);

  const filteredPackages = userPackages.filter(pkg => {
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
      </div>
    );
  }

  const pendingCount = userPackages.filter(p => !p.delivered_date).length;
  const deliveredCount = userPackages.filter(p => !!p.delivered_date).length;

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="sticky top-0 z-10 backdrop-blur-md bg-background/80 border-b py-4 px-6 mb-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="rounded-full bg-primary/10 p-2 text-primary">
                  <PackageIcon size={24} />
                </div>
                <div>
                  <h1 className="text-xl font-medium">
                    {isVecino ? 'Mis Paquetes' : 'Registro de Paquetes'}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {userPackages.length} {userPackages.length === 1 ? 'paquete' : 'paquetes'} 
                    {isVecino ? ' registrados a tu nombre' : ' registrados'}
                  </p>
                </div>
              </div>
              
              {!isVecino && (
                <div className="flex space-x-2">
                  <Button 
                    onClick={handleOpenForm}
                    variant="outline"
                    className="gap-2"
                  >
                    <PackagePlus size={16} />
                    Registrar Paquete
                  </Button>
                  <Link 
                    to="/bulk-packages"
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium gap-2 ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                  >
                    <ImageIcon size={16} />
                    Registro por Foto
                  </Link>
                </div>
              )}
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
              onEdit={!isVecino ? handleEditPackage : undefined}
              onDelete={!isVecino ? deletePackage : undefined}
              onMarkDelivered={isVecino || !isVecino ? markAsDelivered : undefined}
              onMarkPending={!isVecino ? markAsPending : undefined}
              onResendNotification={!isVecino ? resendNotification : undefined}
            />
          </div>
        </main>

        {!isVecino && (
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
        )}
      </div>
    </div>
  );
};

export default Packages;
