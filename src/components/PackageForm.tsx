
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useNeighbors } from '@/context/NeighborContext';
import { Package, PackageFormData, PackageType, Company } from '@/types/package';

const packageTypes: PackageType[] = ['bolsa', 'caja', 'sobre', 'otro'];
const companies: Company[] = ['Amazon', 'Mercado Libre', 'UPS', 'DHL', 'FedEx', 'Estafeta', 'otro'];

const formSchema = z.object({
  type: z.enum(packageTypes as [PackageType, ...PackageType[]]),
  received_date: z.string().min(1, { message: 'La fecha de recepción es requerida' }),
  delivered_date: z.string().nullable(),
  company: z.enum(companies as [Company, ...Company[]]),
  neighbor_id: z.string().min(1, { message: 'El vecino es requerido' }),
});

interface PackageFormProps {
  initialData?: Package;
  onSubmit: (data: PackageFormData) => void;
}

const PackageForm: React.FC<PackageFormProps> = ({ initialData, onSubmit }) => {
  const { neighbors } = useNeighbors();
  
  const defaultValues: Partial<PackageFormData> = {
    type: initialData?.type || 'caja',
    received_date: initialData?.received_date || new Date().toISOString().split('T')[0],
    delivered_date: initialData?.delivered_date || null,
    company: initialData?.company || 'Amazon',
    neighbor_id: initialData?.neighbor_id || '',
  };

  const form = useForm<PackageFormData>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="neighbor_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vecino</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar vecino" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {neighbors.map((neighbor) => (
                    <SelectItem key={neighbor.id} value={neighbor.id}>
                      {neighbor.name} {neighbor.last_name} - Apto {neighbor.apartment}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Paquete</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {packageTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Compañía</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar compañía" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company} value={company}>
                      {company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="received_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha de Recepción</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 mt-6">
          <Button type="submit">
            {initialData ? 'Actualizar Paquete' : 'Registrar Paquete'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PackageForm;
