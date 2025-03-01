
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Neighbor, NeighborFormData } from '@/types/neighbor';
import { toast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';

interface NeighborContextType {
  neighbors: Neighbor[];
  addNeighbor: (data: NeighborFormData) => void;
  updateNeighbor: (id: string, data: NeighborFormData) => void;
  deleteNeighbor: (id: string) => void;
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

  // Load data from localStorage on mount
  useEffect(() => {
    const savedNeighbors = localStorage.getItem('neighbors');
    if (savedNeighbors) {
      try {
        setNeighbors(JSON.parse(savedNeighbors));
      } catch (error) {
        console.error('Failed to parse neighbors from localStorage:', error);
      }
    }
    setLoading(false);
  }, []);

  // Save to localStorage whenever neighbors change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('neighbors', JSON.stringify(neighbors));
    }
  }, [neighbors, loading]);

  const addNeighbor = (data: NeighborFormData) => {
    const newNeighbor: Neighbor = {
      ...data,
      id: uuidv4(),
    };
    
    setNeighbors((prev) => [...prev, newNeighbor]);
    toast({
      title: "Vecino agregado",
      description: `${data.name} ${data.last_name} ha sido agregado correctamente.`,
    });
  };

  const updateNeighbor = (id: string, data: NeighborFormData) => {
    setNeighbors((prev) => 
      prev.map((neighbor) => 
        neighbor.id === id ? { ...data, id } : neighbor
      )
    );
    toast({
      title: "Vecino actualizado",
      description: `${data.name} ${data.last_name} ha sido actualizado correctamente.`,
    });
  };

  const deleteNeighbor = (id: string) => {
    const neighbor = neighbors.find(n => n.id === id);
    setNeighbors((prev) => prev.filter((neighbor) => neighbor.id !== id));
    if (neighbor) {
      toast({
        title: "Vecino eliminado",
        description: `${neighbor.name} ${neighbor.last_name} ha sido eliminado correctamente.`,
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
