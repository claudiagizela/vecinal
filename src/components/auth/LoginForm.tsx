import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/context/auth';

const loginSchema = z.object({
  email: z.string().email({ message: 'Email inválido' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginForm: React.FC = () => {
  const { signIn, resetPassword, loading, session } = useAuth();
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      if (isResetMode) {
        await resetPassword(data.email);
        setResetSent(true);
        setResetEmail(data.email);
      } else {
        await signIn(data.email, data.password);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const isRecoveryMode = session?.user && window.location.hash.includes('type=recovery');

  if (isRecoveryMode) {
    return (
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Establecer nueva contraseña</h2>
          <p className="text-muted-foreground">Ingresa tu nueva contraseña abajo.</p>
        </div>
        <PasswordResetForm />
      </div>
    );
  }

  if (resetSent) {
    return (
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Correo enviado</h2>
          <p className="text-muted-foreground">
            Se ha enviado un correo a <strong>{resetEmail}</strong> con instrucciones para restablecer tu contraseña.
          </p>
        </div>
        <Button onClick={() => {
          setIsResetMode(false);
          setResetSent(false);
          form.reset();
        }} className="w-full">
          Volver al inicio de sesión
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">
            {isResetMode ? 'Recuperar contraseña' : 'Iniciar sesión'}
          </h2>
          <p className="text-muted-foreground">
            {isResetMode 
              ? 'Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.' 
              : 'Ingresa tus credenciales para acceder a tu cuenta.'}
          </p>
        </div>

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
        
        {!isResetMode && (
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
                    autoComplete="current-password"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Spinner className="mr-2 h-4 w-4" /> : null}
          {isResetMode ? 'Enviar correo de recuperación' : 'Iniciar sesión'}
        </Button>
        
        <div className="text-center">
          <Button
            variant="link"
            type="button"
            onClick={() => {
              setIsResetMode(!isResetMode);
              form.reset();
            }}
            className="text-sm text-muted-foreground"
          >
            {isResetMode ? 'Volver al inicio de sesión' : '¿Olvidaste tu contraseña?'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

const PasswordResetForm: React.FC = () => {
  const { updatePassword, loading } = useAuth();
  const [success, setSuccess] = useState(false);

  const passwordSchema = z.object({
    password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres' }),
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'], 
  });

  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof passwordSchema>) => {
    try {
      await updatePassword(data.password);
      setSuccess(true);
    } catch (error) {
      console.error('Error updating password:', error);
    }
  };

  if (success) {
    return (
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">¡Contraseña actualizada!</h2>
          <p className="text-muted-foreground">Tu contraseña ha sido cambiada exitosamente.</p>
        </div>
      </div>
    );
  }

  return (
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
        
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Spinner className="mr-2 h-4 w-4" /> : null}
          Actualizar contraseña
        </Button>
      </form>
    </Form>
  );
};

export default LoginForm;
