
export interface Neighbor {
  id: string;
  name: string;
  last_name: string;
  second_last_name: string;
  apartment: string;
  mobile_number: string;
  email?: string;
  user_id?: string;
  packages?: Package[];
}

export type NeighborFormData = Omit<Neighbor, 'id' | 'packages' | 'user_id'>;

import { Package } from "./package";
