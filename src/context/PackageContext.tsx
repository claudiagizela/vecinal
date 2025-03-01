
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Package, PackageFormData } from '@/types/package';
import { toast } from '@/components/ui/use-toast';
import { useNeighbors } from './NeighborContext';
import { supabase } from '@/integrations/supabase/client';

interface PackageContextType {
  packages: Package[];
  addPackage: (data: PackageFormData) => Promise<string | undefined>;
  updatePackage: (id: string, data: PackageFormData) => Promise<void>;
  deletePackage: (id: string) => Promise<void>;
  getPackage: (id: string) => Package | undefined;
  getNeighborPackages: (neighborId: string) => Package[];
  markAsDelivered: (id: string) => Promise<void>;
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

  // Load data from Supabase on mount
  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      
      // Fetch packages
      const { data: packagesData, error: packagesError } = await supabase
        .from('packages')
        .select('*')
        .order('received_date', { ascending: false });
      
      if (packagesError) {
        throw packagesError;
      }
      
      // Fetch images for each package
      const packagesWithImages = await Promise.all(
        (packagesData || []).map(async (pkg) => {
          const { data: imagesData, error: imagesError } = await supabase
            .from('package_images')
            .select('image_url')
            .eq('package_id', pkg.id);
          
          if (imagesError) {
            console.error('Error fetching images for package:', imagesError);
            return { ...pkg, images: [] };
          }
          
          return { 
            ...pkg, 
            images: imagesData ? imagesData.map(img => img.image_url) : [] 
          };
        })
      );
      
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

  // Enrich packages with neighbor data
  const enrichedPackages = packages.map(pkg => {
    const neighbor = neighbors.find(n => n.id === pkg.neighbor_id);
    return {
      ...pkg,
      neighbor
    };
  });

  const addPackage = async (data: PackageFormData) => {
    try {
      // First, insert the package
      const { data: newPackage, error: packageError } = await supabase
        .from('packages')
        .insert([{
          type: data.type,
          received_date: data.received_date,
          delivered_date: data.delivered_date,
          company: data.company,
          neighbor_id: data.neighbor_id
        }])
        .select()
        .single();
      
      if (packageError) {
        throw packageError;
      }
      
      // Then, insert the images
      if (data.images && data.images.length > 0) {
        const imagesForInsert = data.images.map(image => ({
          package_id: newPackage.id,
          image_url: image
        }));
        
        const { error: imagesError } = await supabase
          .from('package_images')
          .insert(imagesForInsert);
        
        if (imagesError) {
          console.error('Error inserting package images:', imagesError);
        }
      }
      
      // Add to local state
      const packageWithImages = {
        ...newPackage,
        images: data.images || []
      };
      
      setPackages((prev) => [packageWithImages, ...prev]);
      
      const neighbor = neighbors.find(n => n.id === data.neighbor_id);
      const neighborName = neighbor ? `${neighbor.name} ${neighbor.last_name}` : 'Vecino';
      
      toast({
        title: "Paquete registrado",
        description: `Paquete de ${data.company} para ${neighborName} ha sido registrado.`,
      });
      
      return newPackage.id;
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
      // First, update the package
      const { error: packageError } = await supabase
        .from('packages')
        .update({
          type: data.type,
          received_date: data.received_date,
          delivered_date: data.delivered_date,
          company: data.company,
          neighbor_id: data.neighbor_id
        })
        .eq('id', id);
      
      if (packageError) {
        throw packageError;
      }
      
      // Then, delete existing images
      const { error: deleteImagesError } = await supabase
        .from('package_images')
        .delete()
        .eq('package_id', id);
      
      if (deleteImagesError) {
        console.error('Error deleting package images:', deleteImagesError);
      }
      
      // Finally, insert new images
      if (data.images && data.images.length > 0) {
        const imagesForInsert = data.images.map(image => ({
          package_id: id,
          image_url: image
        }));
        
        const { error: insertImagesError } = await supabase
          .from('package_images')
          .insert(imagesForInsert);
        
        if (insertImagesError) {
          console.error('Error inserting package images:', insertImagesError);
        }
      }
      
      // Update local state
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
      
      // Delete the package (cascades to images due to foreign key)
      const { error } = await supabase
        .from('packages')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      // Update local state
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

  const getNeighborPackages = (neighborId: string) => {
    return enrichedPackages.filter((pkg) => pkg.neighbor_id === neighborId);
  };

  const markAsDelivered = async (id: string) => {
    try {
      const delivered_date = new Date().toISOString();
      
      // Update in database
      const { error } = await supabase
        .from('packages')
        .update({ delivered_date })
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      // Update local state
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
