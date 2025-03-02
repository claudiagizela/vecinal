
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/context/auth';
import AuthLayout from '@/components/auth/AuthLayout';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { toast } from '@/components/ui/use-toast';

const passwordSchema = z.object({
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres' }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

const SetupPassword = () => {
  const { updatePassword, loading, session } = useAuth();
  const [isConfiguring, setIsConfiguring] = useState(true);
  const navigate = useNavigate();

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    // Check if the user has a valid session with a setup token
    const checkSession = async () => {
      if (!session && !loading) {
        toast({
          title: "No autorizado",
          description: "No tienes autorización para configurar una contraseña",
          variant: "destructive"
        });
        navigate('/auth');
      }
    };
    
    checkSession();
  }, [session, loading, navigate]);

  const onSubmit = async (data: PasswordFormValues) => {
    setIsConfiguring(true);
    try {
      await updatePassword(data.password);
      toast({
        title: "Contraseña configurada",
        description: "Tu contraseña ha sido configurada exitosamente",
      });
      navigate('/auth');
    } catch (error) {
      console.error("Error al configurar contraseña:", error);
    } finally {
      setIsConfiguring(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Configurar Contraseña</h1>
          <p className="text-muted-foreground mt-2">
            Establece una nueva contraseña para tu cuenta
          </p>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nueva Contraseña</FormLabel>
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
            
            <Button type="submit" className="w-full" disabled={loading || isConfiguring}>
              {(loading || isConfiguring) ? <Spinner className="mr-2 h-4 w-4" /> : null}
              Configurar Contraseña
            </Button>
          </form>
        </Form>
      </div>
    </AuthLayout>
  );
};

export default SetupPassword;
