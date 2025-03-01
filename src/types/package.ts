
import { Neighbor } from "./neighbor";

export type PackageType = "bolsa" | "caja" | "sobre" | "otro";
export type Company = "Amazon" | "Mercado Libre" | "UPS" | "DHL" | "FedEx" | "Estafeta" | "otro";

export interface Package {
  id: string;
  type: PackageType;
  received_date: string;
  delivered_date: string | null;
  company: Company;
  neighbor_id: string;
  neighbor?: Neighbor;
}

export type PackageFormData = Omit<Package, 'id' | 'neighbor'>;
