
import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/context/auth';

const signupSchema = z.object({
  fullName: z.string().min(3, { message: 'El nombre completo debe tener al menos 3 caracteres' }),
  email: z.string().email({ message: 'Email inválido' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres' }),
  confirmPassword: z.string(),
  userType: z.enum(['guardia', 'vecino'], { 
    required_error: 'Por favor selecciona el tipo de usuario' 
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

type SignupFormValues = z.infer<typeof signupSchema>;

const SignupForm: React.FC = () => {
  const { signUp, loading, session } = useAuth();
  const [selectedUserType, setSelectedUserType] = React.useState<'guardia' | 'vecino' | undefined>(undefined);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      userType: undefined,
    },
  });

  const onSubmit = (data: SignupFormValues) => {
    console.log("Signup form data:", data); // Log form data for debugging
    // Usamos el email como nombre de usuario y el fullName para el nombre completo
    signUp(data.email, data.password, data.userType, data.email, data.fullName);
  };

  const isVerificationMode = session?.user && window.location.hash.includes('type=signup');

  const handleUserTypeChange = (value: 'guardia' | 'vecino') => {
    setSelectedUserType(value);
    form.setValue('userType', value);
  };

  if (isVerificationMode) {
    return (
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">¡Correo verificado!</h2>
          <p className="text-muted-foreground">Tu correo electrónico ha sido verificado correctamente.</p>
          <p className="text-muted-foreground">Ya puedes iniciar sesión con tus credenciales.</p>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre Completo</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Juan Pérez" 
                  autoComplete="name"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correo Electrónico</FormLabel>
              <FormControl>
                <Input 
                  type="email" 
                  placeholder="tu@email.com" 
                  autoComplete="email"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="userType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Usuario</FormLabel>
              <Select
                onValueChange={(value) => handleUserTypeChange(value as 'guardia' | 'vecino')}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tipo de usuario" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="guardia">Guardia</SelectItem>
                  <SelectItem value="vecino">Vecino</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
              {selectedUserType === 'vecino' && (
                <p className="text-xs text-muted-foreground mt-1">
                  Como vecino, se creará automáticamente un perfil básico. Podrás completar tus datos después de iniciar sesión.
                </p>
              )}
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <Input 
                  type="password" 
                  placeholder="******" 
                  autoComplete="new-password"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmar Contraseña</FormLabel>
              <FormControl>
                <Input 
                  type="password" 
                  placeholder="******" 
                  autoComplete="new-password"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Spinner className="mr-2 h-4 w-4" /> : null}
          Registrarse
        </Button>
      </form>
    </Form>
  );
};

export default SignupForm;
