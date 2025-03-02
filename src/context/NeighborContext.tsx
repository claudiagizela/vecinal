
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Neighbor, NeighborFormData } from '@/types/neighbor';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth';

interface NeighborContextType {
  neighbors: Neighbor[];
  addNeighbor: (data: NeighborFormData) => Promise<void>;
  updateNeighbor: (id: string, data: NeighborFormData) => Promise<void>;
  deleteNeighbor: (id: string) => Promise<void>;
  getNeighbor: (id: string) => Neighbor | undefined;
  getCurrentUserNeighbor: () => Neighbor | undefined;
  loading: boolean;
}

const NeighborContext = createContext<NeighborContextType | undefined>(undefined);

export const useNeighbors = () => {
  const context = useContext(NeighborContext);
  if (!context) {
    throw new Error('useNeighbors must be used within a NeighborProvider');
  }
  return context;
};

export const NeighborProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [neighbors, setNeighbors] = useState<Neighbor[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load data from Supabase on mount
  useEffect(() => {
    fetchNeighbors();
  }, []);

  const fetchNeighbors = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('neighbors')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      setNeighbors(data || []);
    } catch (error) {
      console.error('Error fetching neighbors:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los vecinos.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addNeighbor = async (data: NeighborFormData) => {
    try {
      const { data: newNeighbor, error } = await supabase
        .from('neighbors')
        .insert([data])
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      setNeighbors((prev) => [...prev, newNeighbor as Neighbor]);
      
      toast({
        title: "Vecino agregado",
        description: `${data.name} ${data.last_name} ha sido agregado correctamente.`,
      });
      
      // Return void to match the interface
    } catch (error) {
      console.error('Error adding neighbor:', error);
      toast({
        title: "Error",
        description: "No se pudo agregar el vecino.",
        variant: "destructive"
      });
    }
  };

  const updateNeighbor = async (id: string, data: NeighborFormData) => {
    try {
      const { error } = await supabase
        .from('neighbors')
        .update(data)
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      setNeighbors((prev) => 
        prev.map((neighbor) => 
          neighbor.id === id ? { ...neighbor, ...data } : neighbor
        )
      );
      
      toast({
        title: "Vecino actualizado",
        description: `${data.name} ${data.last_name} ha sido actualizado correctamente.`,
      });
    } catch (error) {
      console.error('Error updating neighbor:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el vecino.",
        variant: "destructive"
      });
    }
  };

  const deleteNeighbor = async (id: string) => {
    try {
      const neighbor = neighbors.find(n => n.id === id);
      
      const { error } = await supabase
        .from('neighbors')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      setNeighbors((prev) => prev.filter((neighbor) => neighbor.id !== id));
      
      if (neighbor) {
        toast({
          title: "Vecino eliminado",
          description: `${neighbor.name} ${neighbor.last_name} ha sido eliminado correctamente.`,
        });
      }
    } catch (error) {
      console.error('Error deleting neighbor:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el vecino.",
        variant: "destructive"
      });
    }
  };

  const getNeighbor = (id: string) => {
    return neighbors.find((neighbor) => neighbor.id === id);
  };

  // Updated function to get the current user's neighbor profile
  const getCurrentUserNeighbor = () => {
    if (!user) return undefined;
    
    // First try to find by user_id (most accurate method)
    let neighbor = neighbors.find((neighbor) => neighbor.user_id === user.id);
    
    // If not found by user_id, try to find by email as a fallback
    if (!neighbor) {
      neighbor = neighbors.find((neighbor) => neighbor.email === user.email);
    }
    
    return neighbor;
  };

  return (
    <NeighborContext.Provider
      value={{
        neighbors,
        addNeighbor,
        updateNeighbor,
        deleteNeighbor,
        getNeighbor,
        getCurrentUserNeighbor,
        loading,
      }}
    >
      {children}
    </NeighborContext.Provider>
  );
};
