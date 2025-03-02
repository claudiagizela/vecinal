import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export const authService = {
  signUp: async (email: string, password: string, userType: 'vecino' | 'guardia') => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: userType
          },
          emailRedirectTo: window.location.origin + '/auth'
        }
      });

      if (error) {
        throw error;
      }

      // Check if user needs to confirm email
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        // This indicates the user already exists but hasn't confirmed their email
        toast({
          title: "Email ya registrado",
          description: "Esta dirección de correo ya está registrada pero no confirmada. Se ha enviado un nuevo correo de verificación.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Registro exitoso",
          description: "Se ha enviado un correo de confirmación a tu dirección de email.",
        });
      }
      
      return data;
    } catch (error: any) {
      console.error("Error en signUp:", error);
      toast({
        title: "Error al registrarse",
        description: error.message || "Ha ocurrido un error al crear la cuenta.",
        variant: "destructive"
      });
      throw error;
    }
  },

  signIn: async (email: string, password: string) => {
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
      
      return data;
    } catch (error: any) {
      toast({
        title: "Error al iniciar sesión",
        description: error.message || "Email o contraseña incorrectos.",
        variant: "destructive"
      });
      throw error;
    }
  },

  signOut: async () => {
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
      throw error;
    }
  },

  resetPassword: async (email: string) => {
    try {
      console.log("Enviando correo de recuperación a:", email);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/auth',
      });

      if (error) {
        console.error("Error en resetPassword:", error);
        throw error;
      }

      toast({
        title: "Correo enviado",
        description: "Se ha enviado un correo con instrucciones para restablecer tu contraseña.",
      });
    } catch (error: any) {
      console.error("Error detallado en resetPassword:", error);
      toast({
        title: "Error al enviar el correo",
        description: error.message || "Ha ocurrido un error al enviar el correo de recuperación.",
        variant: "destructive"
      });
      throw error;
    }
  },

  updatePassword: async (password: string) => {
    try {
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
    }
  },

  getSession: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        throw error;
      }
      return session;
    } catch (error) {
      console.error('Error al recuperar la sesión:', error);
      return null;
    }
  }
};
