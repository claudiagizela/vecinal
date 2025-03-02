import React, { useState, useEffect } from 'react';
import { Package, PackageFormData } from '@/types/package';
import { toast } from '@/components/ui/use-toast';
import { useNeighbors } from './NeighborContext';
import { PackageContext, PackageContextType } from '@/hooks/usePackageContext';
import {
  fetchPackagesWithImages,
  createPackage,
  updatePackageData,
  deletePackageData,
  markPackageAsDelivered,
  markPackageAsPending,
  resendDeliveryNotification
} from '@/services/packageService';

export { usePackages } from '@/hooks/usePackageContext';

export const PackageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const { neighbors } = useNeighbors();

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      setLoading(true);
      const packagesWithImages = await fetchPackagesWithImages();
      setPackages(packagesWithImages);
    } catch (error) {
      console.error('Error fetching packages:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los paquetes.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const enrichedPackages = packages.map(pkg => {
    const neighbor = neighbors.find(n => n.id === pkg.neighbor_id);
    return {
      ...pkg,
      neighbor
    };
  });

  const addPackage = async (data: PackageFormData) => {
    try {
      const newPackageId = await createPackage(data);
      
      if (!newPackageId) return;
      
      const packagesData = await fetchPackagesWithImages();
      const newPackage = packagesData.find(p => p.id === newPackageId);
      
      if (newPackage) {
        setPackages((prev) => [newPackage, ...prev]);
        
        const neighbor = neighbors.find(n => n.id === data.neighbor_id);
        const neighborName = neighbor ? `${neighbor.name} ${neighbor.last_name}` : 'Vecino';
        
        toast({
          title: "Paquete registrado",
          description: `Paquete de ${data.company} para ${neighborName} ha sido registrado.`,
        });
      }
      
      return newPackageId;
    } catch (error) {
      console.error('Error adding package:', error);
      toast({
        title: "Error",
        description: "No se pudo registrar el paquete.",
        variant: "destructive"
      });
    }
  };

  const updatePackage = async (id: string, data: PackageFormData) => {
    try {
      await updatePackageData(id, data);
      
      setPackages((prev) => 
        prev.map((pkg) => 
          pkg.id === id ? { ...pkg, ...data, id } : pkg
        )
      );
      
      toast({
        title: "Paquete actualizado",
        description: `El paquete ha sido actualizado correctamente.`,
      });
    } catch (error) {
      console.error('Error updating package:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el paquete.",
        variant: "destructive"
      });
    }
  };

  const deletePackage = async (id: string) => {
    try {
      const pkg = packages.find(p => p.id === id);
      
      await deletePackageData(id);
      
      setPackages((prev) => prev.filter((p) => p.id !== id));
      
      if (pkg) {
        const neighbor = neighbors.find(n => n.id === pkg.neighbor_id);
        const neighborName = neighbor ? `${neighbor.name} ${neighbor.last_name}` : 'Vecino';
        
        toast({
          title: "Paquete eliminado",
          description: `El paquete de ${pkg.company} para ${neighborName} ha sido eliminado.`,
        });
      }
    } catch (error) {
      console.error('Error deleting package:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el paquete.",
        variant: "destructive"
      });
    }
  };

  const getPackage = (id: string) => {
    return enrichedPackages.find((pkg) => pkg.id === id);
  };

  const getNeighborPackages = (userId: string) => {
    const neighbor = neighbors.find(n => n.id === userId);
    
    if (!neighbor) {
      const neighborByEmail = neighbors.find(
        n => n.email && n.email.toLowerCase() === userId.toLowerCase()
      );
      
      if (neighborByEmail) {
        return enrichedPackages.filter((pkg) => pkg.neighbor_id === neighborByEmail.id);
      }
      
      return [];
    }
    
    return enrichedPackages.filter((pkg) => pkg.neighbor_id === neighbor.id);
  };

  const markAsDelivered = async (id: string) => {
    try {
      const delivered_date = await markPackageAsDelivered(id);
      
      setPackages((prev) => 
        prev.map((pkg) => 
          pkg.id === id ? { ...pkg, delivered_date } : pkg
        )
      );
      
      const pkg = packages.find(p => p.id === id);
      if (pkg) {
        const neighbor = neighbors.find(n => n.id === pkg.neighbor_id);
        const neighborName = neighbor ? `${neighbor.name} ${neighbor.last_name}` : 'Vecino';
        
        toast({
          title: "Paquete entregado",
          description: `El paquete de ${pkg.company} para ${neighborName} ha sido marcado como entregado.`,
        });
      }
    } catch (error) {
      console.error('Error marking package as delivered:', error);
      toast({
        title: "Error",
        description: "No se pudo marcar el paquete como entregado.",
        variant: "destructive"
      });
    }
  };

  const markAsPending = async (id: string) => {
    try {
      await markPackageAsPending(id);
      
      setPackages((prev) => 
        prev.map((pkg) => 
          pkg.id === id ? { ...pkg, delivered_date: null } : pkg
        )
      );
      
      const pkg = packages.find(p => p.id === id);
      if (pkg) {
        const neighbor = neighbors.find(n => n.id === pkg.neighbor_id);
        const neighborName = neighbor ? `${neighbor.name} ${neighbor.last_name}` : 'Vecino';
        
        toast({
          title: "Paquete pendiente",
          description: `El paquete de ${pkg.company} para ${neighborName} ha sido marcado como pendiente nuevamente.`,
        });
      }
    } catch (error) {
      console.error('Error marking package as pending:', error);
      toast({
        title: "Error",
        description: "No se pudo marcar el paquete como pendiente.",
        variant: "destructive"
      });
    }
  };

  const resendNotification = async (id: string) => {
    try {
      await resendDeliveryNotification(id);
      
      const pkg = packages.find(p => p.id === id);
      if (pkg) {
        const neighbor = neighbors.find(n => n.id === pkg.neighbor_id);
        const neighborName = neighbor ? `${neighbor.name} ${neighbor.last_name}` : 'Vecino';
        
        toast({
          title: "Notificación enviada",
          description: `Se ha enviado un correo de confirmación a ${neighborName}.`,
        });
      }
    } catch (error) {
      console.error('Error sending delivery notification:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar la notificación de entrega.",
        variant: "destructive"
      });
    }
  };

  const contextValue: PackageContextType = {
    packages: enrichedPackages,
    addPackage,
    updatePackage,
    deletePackage,
    getPackage,
    getNeighborPackages,
    markAsDelivered,
    markAsPending,
    resendNotification,
    loading,
  };

  return (
    <PackageContext.Provider value={contextValue}>
      {children}
    </PackageContext.Provider>
  );
};
