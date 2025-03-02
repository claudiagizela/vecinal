
import React, { useState } from 'react';
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
import { useNavigate } from 'react-router-dom';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const resetSchema = z.object({
  email: z.string().email({ message: 'Email inválido' }),
});

type ResetFormValues = z.infer<typeof resetSchema>;

const ResetPassword = () => {
  const { resetPassword, loading } = useAuth();
  const [isResetSent, setIsResetSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const form = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ResetFormValues) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      console.log("Iniciando proceso de recuperación para:", data.email);
      
      await resetPassword(data.email);
      
      toast({
        title: "Correo enviado",
        description: "Se ha enviado un enlace de restablecimiento a tu correo electrónico.",
      });
      
      console.log("Correo enviado exitosamente, actualizando UI");
      setIsResetSent(true);
      
    } catch (error) {
      console.error("Error al enviar correo de restablecimiento:", error);
      
      toast({
        title: "Error al enviar correo",
        description: error instanceof Error ? error.message : "Ha ocurrido un error al enviar el correo de restablecimiento.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Restablecer Contraseña</h1>
          <p className="text-muted-foreground mt-2">
            Ingresa tu correo electrónico para recibir un enlace de restablecimiento
          </p>
        </div>
        
        {isResetSent ? (
          <div className="space-y-4">
            <Alert variant="success">
              <AlertTitle>Correo Enviado</AlertTitle>
              <AlertDescription>
                Se ha enviado un enlace de restablecimiento a tu correo electrónico.
                Por favor revisa tu bandeja de entrada.
              </AlertDescription>
            </Alert>
            <Button onClick={() => navigate('/auth')} className="w-full">
              Volver a Iniciar Sesión
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              
              <Button type="submit" className="w-full" disabled={isSubmitting || loading}>
                {(isSubmitting || loading) ? <Spinner className="mr-2 h-4 w-4" /> : null}
                Enviar Correo de Restablecimiento
              </Button>
            </form>
          </Form>
        )}
        
        <div className="text-center">
          {!isResetSent && (
            <Button variant="link" onClick={() => navigate('/auth')}>
              Volver a Iniciar Sesión
            </Button>
          )}
        </div>
      </div>
    </AuthLayout>
  );
};

export default ResetPassword;
