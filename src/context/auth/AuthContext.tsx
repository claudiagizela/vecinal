
import React, { createContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { authService } from './authService';
import { AuthContextType } from './types';
import { toast } from '@/components/ui/use-toast';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
        const session = await authService.getSession();
        setSession(session);
        setUser(session?.user || null);
      } finally {
        setLoading(false);
      }
    };

    setInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed:", _event);
      setSession(session);
      setUser(session?.user || null);
      setLoading(false);
    });

    const handleRecoveryToken = async () => {
      const hash = window.location.hash;
      console.log("Current hash:", hash);
      
      if (hash && (hash.includes('type=recovery') || hash.includes('type=signup'))) {
        try {
          setLoading(true);
          console.log("Processing token in hash");
          
          const { data, error } = await supabase.auth.refreshSession();
          
          if (error) {
            console.error("Error refreshing session:", error);
            throw error;
          }

          console.log("Session refreshed successfully:", data);

          // No eliminamos el hash inmediatamente para que la UI pueda detectar
          // el tipo de acción (recuperación o registro)
          setTimeout(() => {
            // We'll keep the hash for the UI to read it, but we have already processed it
          }, 100);

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

  const signUp = async (email: string, password: string, userType: 'vecino' | 'guardia', username: string, fullName: string) => {
    setLoading(true);
    try {
      await authService.signUp(email, password, userType, username, fullName);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      await authService.signIn(email, password);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await authService.signOut();
      // Ensure we clear the user state even if there was an issue with the Supabase call
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error("Error during sign out:", error);
      // Still clear user data on error to maintain UI consistency
      setUser(null);
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    try {
      await authService.resetPassword(email);
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (password: string) => {
    setLoading(true);
    try {
      await authService.updatePassword(password);
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
