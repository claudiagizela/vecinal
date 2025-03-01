
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Neighbor, NeighborFormData } from '@/types/neighbor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  last_name: z.string().min(1, 'El apellido paterno es requerido'),
  second_last_name: z.string().optional(),
  apartment: z.string().min(1, 'El número de apartamento es requerido'),
  mobile_number: z.string()
    .min(10, 'El número debe tener al menos 10 dígitos')
    .regex(/^\d+$/, 'Solo se permiten números'),
});

interface NeighborFormProps {
  initialData?: Neighbor;
  onSubmit: (data: NeighborFormData) => void;
  className?: string;
}

const NeighborForm: React.FC<NeighborFormProps> = ({
  initialData,
  onSubmit,
  className,
}) => {
  const form = useForm<NeighborFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      last_name: initialData.last_name,
      second_last_name: initialData.second_last_name,
      apartment: initialData.apartment,
      mobile_number: initialData.mobile_number,
    } : {
      name: '',
      last_name: '',
      second_last_name: '',
      apartment: '',
      mobile_number: '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn("space-y-6", className)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="Juan" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apellido Paterno</FormLabel>
                <FormControl>
                  <Input placeholder="Pérez" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="second_last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apellido Materno</FormLabel>
                <FormControl>
                  <Input placeholder="García" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="apartment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apartamento</FormLabel>
                <FormControl>
                  <Input placeholder="101A" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="mobile_number"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Número de Teléfono</FormLabel>
                <FormControl>
                  <Input placeholder="5512345678" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <Button type="submit" className="w-full md:w-auto">
          {initialData ? 'Actualizar Vecino' : 'Agregar Vecino'}
        </Button>
      </form>
    </Form>
  );
};

export default NeighborForm;
