
import { createContext, useContext } from 'react';
import { Package, PackageFormData } from '@/types/package';

export interface PackageContextType {
  packages: Package[];
  addPackage: (data: PackageFormData) => Promise<string | undefined>;
  updatePackage: (id: string, data: PackageFormData) => Promise<void>;
  deletePackage: (id: string) => Promise<void>;
  getPackage: (id: string) => Package | undefined;
  getNeighborPackages: (neighborId: string) => Package[];
  markAsDelivered: (id: string) => Promise<void>;
  markAsPending: (id: string) => Promise<void>;
  resendNotification: (id: string) => Promise<void>;
  loading: boolean;
}

export const PackageContext = createContext<PackageContextType | undefined>(undefined);

export const usePackages = () => {
  const context = useContext(PackageContext);
  if (!context) {
    throw new Error('usePackages must be used within a PackageProvider');
  }
  return context;
};
