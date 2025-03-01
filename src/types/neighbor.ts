
export interface Neighbor {
  id: string;
  name: string;
  last_name: string;
  second_last_name: string;
  apartment: string;
  mobile_number: string;
}

export type NeighborFormData = Omit<Neighbor, 'id'>;
