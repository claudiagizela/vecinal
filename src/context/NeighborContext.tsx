
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Neighbor, NeighborFormData } from '@/types/neighbor';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface NeighborContextType {
  neighbors: Neighbor[];
  addNeighbor: (data: NeighborFormData) => Promise<void>;
  updateNeighbor: (id: string, data: NeighborFormData) => Promise<void>;
  deleteNeighbor: (id: string) => Promise<void>;
  getNeighbor: (id: string) => Neighbor | undefined;
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
      
      setNeighbors((prev) => [...prev, newNeighbor]);
      
      toast({
        title: "Vecino agregado",
        description: `${data.name} ${data.last_name} ha sido agregado correctamente.`,
      });
      
      return newNeighbor;
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
          neighbor.id === id ? { ...data, id } : neighbor
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

  return (
    <NeighborContext.Provider
      value={{
        neighbors,
        addNeighbor,
        updateNeighbor,
        deleteNeighbor,
        getNeighbor,
        loading,
      }}
    >
      {children}
    </NeighborContext.Provider>
  );
};
