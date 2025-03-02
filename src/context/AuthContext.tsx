import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { toast } from '@/components/ui/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, userType: 'vecino' | 'guardia') => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  devModeEnabled: boolean;
  toggleDevMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [devModeEnabled, setDevModeEnabled] = useState(() => {
    const saved = localStorage.getItem('devModeEnabled');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('devModeEnabled', JSON.stringify(devModeEnabled));
  }, [devModeEnabled]);

  useEffect(() => {
    const setInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          throw error;
        }
        setSession(session);
        setUser(session?.user || null);
      } catch (error) {
        console.error('Error al recuperar la sesión:', error);
      } finally {
        setLoading(false);
      }
    };

    setInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user || null);
      setLoading(false);
    });

    const handleRecoveryToken = async () => {
      const hash = window.location.hash;
      if (hash && (hash.includes('type=recovery') || hash.includes('type=signup'))) {
        window.location.hash = '';
        try {
          setLoading(true);
          const { data, error } = await supabase.auth.refreshSession();
          
          if (error) {
            throw error;
          }

          toast({
            title: "Sesión verificada",
            description: hash.includes('type=recovery') 
              ? "Ahora puedes establecer una nueva contraseña" 
              : "Correo verificado correctamente",
          });
        } catch (error: any) {
          console.error("Error al procesar token:", error);
          toast({
            title: "Error de verificación",
            description: error.message || "Error al procesar el enlace",
            variant: "destructive"
          });
        } finally {
          setLoading(false);
        }
      }
    };

    handleRecoveryToken();

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, userType: 'vecino' | 'guardia') => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: userType
          }
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Registro exitoso",
        description: "Se ha enviado un correo de confirmación a tu dirección de email.",
      });
    } catch (error: any) {
      toast({
        title: "Error al registrarse",
        description: error.message || "Ha ocurrido un error al crear la cuenta.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Inicio de sesión exitoso",
        description: "Has iniciado sesión correctamente.",
      });
    } catch (error: any) {
      toast({
        title: "Error al iniciar sesión",
        description: error.message || "Email o contraseña incorrectos.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente.",
      });
    } catch (error: any) {
      toast({
        title: "Error al cerrar sesión",
        description: error.message || "Ha ocurrido un error al cerrar sesión.",
        variant: "destructive"
      });
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Correo enviado",
        description: "Se ha enviado un correo con instrucciones para restablecer tu contraseña.",
      });
    } catch (error: any) {
      toast({
        title: "Error al enviar el correo",
        description: error.message || "Ha ocurrido un error al enviar el correo de recuperación.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        throw error;
      }

      window.location.hash = '';
      toast({
        title: "Contraseña actualizada",
        description: "Tu contraseña ha sido actualizada correctamente.",
      });
    } catch (error: any) {
      toast({
        title: "Error al actualizar la contraseña",
        description: error.message || "Ha ocurrido un error al actualizar la contraseña.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const toggleDevMode = () => {
    setDevModeEnabled(prev => !prev);
    toast({
      title: devModeEnabled ? "Modo desarrollo desactivado" : "Modo desarrollo activado",
      description: devModeEnabled 
        ? "La autenticación está habilitada normalmente."
        : "La autenticación ha sido temporalmente deshabilitada para desarrollo.",
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updatePassword,
        devModeEnabled,
        toggleDevMode
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
