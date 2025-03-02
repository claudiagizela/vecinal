
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export const authService = {
  signUp: async (email: string, password: string, userType: 'vecino' | 'guardia') => {
    try {
      console.log(`Intentando registrar usuario: ${email}, tipo: ${userType}`);
      
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
        console.error("Error en signUp:", error);
        throw error;
      }

      console.log("Respuesta de signUp:", data);

      // Check if user needs to confirm email
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        // This indicates the user already exists but hasn't confirmed their email
        console.log("Usuario ya existe pero no ha confirmado email");
        toast({
          title: "Email ya registrado",
          description: "Esta dirección de correo ya está registrada pero no confirmada. Se ha enviado un nuevo correo de verificación.",
          variant: "destructive"
        });
      } else {
        console.log("Registro exitoso, correo de confirmación enviado");
        toast({
          title: "Registro exitoso",
          description: "Se ha enviado un correo de confirmación a tu dirección de email.",
        });
      }
      
      return data;
    } catch (error: any) {
      console.error("Error detallado en signUp:", error);
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
      console.log(`Intentando iniciar sesión: ${email}`);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error("Error en signIn:", error);
        throw error;
      }

      console.log("Inicio de sesión exitoso");
      toast({
        title: "Inicio de sesión exitoso",
        description: "Has iniciado sesión correctamente.",
      });
      
      return data;
    } catch (error: any) {
      console.error("Error detallado en signIn:", error);
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
      console.log("Intentando cerrar sesión");
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error en signOut:", error);
        throw error;
      }
      
      console.log("Sesión cerrada exitosamente");
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente.",
      });
    } catch (error: any) {
      console.error("Error detallado en signOut:", error);
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
      
      // URL de redirección configurada correctamente
      const redirectUrl = `${window.location.origin}/reset`;
      console.log("URL de redirección:", redirectUrl);
      
      // Usamos el método correcto de Supabase para enviar correo de recuperación
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      console.log("Respuesta detallada de resetPasswordForEmail:", { data, error });

      if (error) {
        console.error("Error en resetPassword:", error);
        throw error;
      }

      // En el entorno de desarrollo, Supabase no enviará correos reales, pero la operación debe completarse sin errores
      console.log("Solicitud de correo de recuperación procesada correctamente");
      toast({
        title: "Correo enviado",
        description: "Se ha enviado un correo con instrucciones para restablecer tu contraseña.",
      });
      
      return { success: true, data };
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
      console.log("Intentando actualizar contraseña");
      
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        console.error("Error en updatePassword:", error);
        throw error;
      }

      console.log("Contraseña actualizada exitosamente");
      window.location.hash = '';
      toast({
        title: "Contraseña actualizada",
        description: "Tu contraseña ha sido actualizada correctamente.",
      });
    } catch (error: any) {
      console.error("Error detallado en updatePassword:", error);
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
      console.log("Obteniendo sesión actual");
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error al obtener sesión:", error);
        throw error;
      }
      console.log("Sesión obtenida:", session ? "Activa" : "No hay sesión");
      return session;
    } catch (error) {
      console.error('Error al recuperar la sesión:', error);
      return null;
    }
  }
};
