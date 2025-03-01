
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Package, PackageFormData } from '@/types/package';
import { toast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { useNeighbors } from './NeighborContext';

interface PackageContextType {
  packages: Package[];
  addPackage: (data: PackageFormData) => void;
  updatePackage: (id: string, data: PackageFormData) => void;
  deletePackage: (id: string) => void;
  getPackage: (id: string) => Package | undefined;
  getNeighborPackages: (neighborId: string) => Package[];
  markAsDelivered: (id: string) => void;
  loading: boolean;
}

const PackageContext = createContext<PackageContextType | undefined>(undefined);

export const usePackages = () => {
  const context = useContext(PackageContext);
  if (!context) {
    throw new Error('usePackages must be used within a PackageProvider');
  }
  return context;
};

export const PackageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const { neighbors } = useNeighbors();

  // Load data from localStorage on mount
  useEffect(() => {
    const savedPackages = localStorage.getItem('packages');
    if (savedPackages) {
      try {
        setPackages(JSON.parse(savedPackages));
      } catch (error) {
        console.error('Failed to parse packages from localStorage:', error);
      }
    }
    setLoading(false);
  }, []);

  // Save to localStorage whenever packages change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('packages', JSON.stringify(packages));
    }
  }, [packages, loading]);

  // Enrich packages with neighbor data
  const enrichedPackages = packages.map(pkg => {
    const neighbor = neighbors.find(n => n.id === pkg.neighbor_id);
    return {
      ...pkg,
      neighbor
    };
  });

  const addPackage = (data: PackageFormData) => {
    const newPackage: Package = {
      ...data,
      id: uuidv4(),
      images: data.images || [], // Ensure images array exists
    };
    
    setPackages((prev) => [...prev, newPackage]);
    
    const neighbor = neighbors.find(n => n.id === data.neighbor_id);
    const neighborName = neighbor ? `${neighbor.name} ${neighbor.last_name}` : 'Vecino';
    
    toast({
      title: "Paquete registrado",
      description: `Paquete de ${data.company} para ${neighborName} ha sido registrado.`,
    });
  };

  const updatePackage = (id: string, data: PackageFormData) => {
    setPackages((prev) => 
      prev.map((pkg) => 
        pkg.id === id ? { ...data, id, images: data.images || [] } : pkg
      )
    );
    
    toast({
      title: "Paquete actualizado",
      description: `El paquete ha sido actualizado correctamente.`,
    });
  };

  const deletePackage = (id: string) => {
    const pkg = packages.find(p => p.id === id);
    setPackages((prev) => prev.filter((p) => p.id !== id));
    
    if (pkg) {
      const neighbor = neighbors.find(n => n.id === pkg.neighbor_id);
      const neighborName = neighbor ? `${neighbor.name} ${neighbor.last_name}` : 'Vecino';
      
      toast({
        title: "Paquete eliminado",
        description: `El paquete de ${pkg.company} para ${neighborName} ha sido eliminado.`,
      });
    }
  };

  const getPackage = (id: string) => {
    return enrichedPackages.find((pkg) => pkg.id === id);
  };

  const getNeighborPackages = (neighborId: string) => {
    return enrichedPackages.filter((pkg) => pkg.neighbor_id === neighborId);
  };

  const markAsDelivered = (id: string) => {
    setPackages((prev) => 
      prev.map((pkg) => 
        pkg.id === id ? { ...pkg, delivered_date: new Date().toISOString() } : pkg
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
  };

  return (
    <PackageContext.Provider
      value={{
        packages: enrichedPackages,
        addPackage,
        updatePackage,
        deletePackage,
        getPackage,
        getNeighborPackages,
        markAsDelivered,
        loading,
      }}
    >
      {children}
    </PackageContext.Provider>
  );
};
