
import React, { useState } from 'react';
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
import { X } from 'lucide-react';

const packageTypes: PackageType[] = ['bolsa', 'caja', 'sobre', 'otro'];
const companies: Company[] = ['Amazon', 'Mercado Libre', 'UPS', 'DHL', 'FedEx', 'Estafeta', 'otro'];

const formSchema = z.object({
  type: z.enum(packageTypes as [PackageType, ...PackageType[]]),
  received_date: z.string().min(1, { message: 'La fecha de recepción es requerida' }),
  received_time: z.string().min(1, { message: 'La hora de recepción es requerida' }),
  delivered_date: z.string().nullable(),
  company: z.enum(companies as [Company, ...Company[]]),
  neighbor_id: z.string().min(1, { message: 'El vecino es requerido' }),
  images: z.array(z.string()).default([]),
});

type FormValues = z.infer<typeof formSchema>;

interface PackageFormProps {
  initialData?: Package;
  onSubmit: (data: PackageFormData) => void;
}

// Convert base64 to blob for display
const base64ToBlob = (base64: string): string => {
  return base64;
};

const PackageForm: React.FC<PackageFormProps> = ({ initialData, onSubmit }) => {
  const { neighbors } = useNeighbors();
  const [previewImages, setPreviewImages] = useState<string[]>(initialData?.images || []);
  
  // Split ISO date string into date and time parts
  const getDateParts = (isoString?: string | null) => {
    if (!isoString) return { date: '', time: '' };
    try {
      const date = new Date(isoString);
      return {
        date: date.toISOString().split('T')[0],
        time: date.toTimeString().split(' ')[0].substring(0, 5)
      };
    } catch (e) {
      return { date: '', time: '' };
    }
  };
  
  const receivedDateParts = getDateParts(initialData?.received_date);
  
  const defaultValues: Partial<FormValues> = {
    type: initialData?.type || 'caja',
    received_date: receivedDateParts.date || new Date().toISOString().split('T')[0],
    received_time: receivedDateParts.time || new Date().toTimeString().split(' ')[0].substring(0, 5),
    delivered_date: initialData?.delivered_date || null,
    company: initialData?.company || 'Amazon',
    neighbor_id: initialData?.neighbor_id || '',
    images: initialData?.images || [],
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          setPreviewImages(prev => [...prev, base64]);
          
          const currentImages = form.getValues('images') || [];
          form.setValue('images', [...currentImages, base64]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
    const currentImages = form.getValues('images') || [];
    form.setValue('images', currentImages.filter((_, i) => i !== index));
  };

  const handleFormSubmit = (data: FormValues) => {
    // Combine date and time into ISO string
    const receivedDateTime = new Date(`${data.received_date}T${data.received_time}`).toISOString();
    
    onSubmit({
      type: data.type,
      received_date: receivedDateTime,
      delivered_date: data.delivered_date,
      company: data.company,
      neighbor_id: data.neighbor_id,
      images: data.images,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
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

        <div className="grid grid-cols-2 gap-4">
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

          <FormField
            control={form.control}
            name="received_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hora de Recepción</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="image-upload">Fotografías del Paquete</Label>
          <Input
            id="image-upload"
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="cursor-pointer"
          />
          
          {previewImages.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
              {previewImages.map((img, index) => (
                <div key={index} className="relative rounded-md overflow-hidden h-24 bg-muted">
                  <img 
                    src={base64ToBlob(img)} 
                    alt={`Imagen ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

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
