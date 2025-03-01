
import { Neighbor } from "./neighbor";

export type PackageType = "bolsa" | "caja" | "sobre" | "otro";
export type Company = "Amazon" | "Mercado Libre" | "UPS" | "DHL" | "FedEx" | "Estafeta" | "otro";

export interface Package {
  id: string;
  type: PackageType;
  received_date: string; // Will store full ISO date with time
  delivered_date: string | null;
  company: Company;
  neighbor_id: string;
  neighbor?: Neighbor;
  images: string[]; // Base64 encoded image strings or URLs
  created_at?: string;
}

export type PackageFormData = Omit<Package, 'id' | 'neighbor' | 'created_at'>;

// Type for data coming directly from Supabase before it's processed
export interface RawPackageData {
  id: string;
  type: string;
  received_date: string;
  delivered_date: string | null;
  company: string;
  neighbor_id: string;
  created_at: string;
}
