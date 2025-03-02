
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/context/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';

const loginSchema = z.object({
  email: z.string().email({ message: 'Email inválido' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres' }),
});

const resetPasswordSchema = z.object({
  email: z.string().email({ message: 'Email inválido' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

const LoginForm: React.FC = () => {
  const { signIn, resetPassword, loading } = useAuth();
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const resetForm = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await signIn(data.email, data.password);
    } catch (error) {
      console.error('Error de inicio de sesión:', error);
      // El error ya es manejado por el contexto de autenticación
    }
  };

  const onResetPassword = async (data: ResetPasswordFormValues) => {
    setResetLoading(true);
    try {
      await resetPassword(data.email);
      setIsResetPasswordOpen(false);
      resetForm.reset();
      toast({
        title: "Correo enviado",
        description: "Se ha enviado un correo con instrucciones para restablecer tu contraseña.",
      });
    } catch (error) {
      console.error('Error al restablecer contraseña:', error);
      // El error ya es manejado por el contexto de autenticación
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <>
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
                    {...field} 
                    autoComplete="email"
                  />
                </FormControl>
                <FormMessage />
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
                    {...field} 
                    autoComplete="current-password"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end">
            <Button 
              type="button" 
              variant="link" 
              className="px-0 text-sm"
              onClick={() => setIsResetPasswordOpen(true)}
            >
              ¿Olvidaste tu contraseña?
            </Button>
          </div>
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Spinner className="mr-2 h-4 w-4" /> : null}
            Iniciar Sesión
          </Button>
        </form>
      </Form>

      <Dialog open={isResetPasswordOpen} onOpenChange={setIsResetPasswordOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Restablecer contraseña</DialogTitle>
            <DialogDescription>
              Ingresa tu correo electrónico para recibir instrucciones sobre cómo restablecer tu contraseña.
            </DialogDescription>
          </DialogHeader>
          <Form {...resetForm}>
            <form onSubmit={resetForm.handleSubmit(onResetPassword)} className="space-y-4">
              <FormField
                control={resetForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo Electrónico</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="tu@email.com" 
                        {...field} 
                        autoComplete="email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsResetPasswordOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={resetLoading}>
                  {resetLoading ? <Spinner className="mr-2 h-4 w-4" /> : null}
                  Enviar instrucciones
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LoginForm;
