
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export const authService = {
  signUp: async (
    email: string, 
    password: string, 
    userType: 'vecino' | 'guardia', 
    username: string,
    fullName: string
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: userType,
            username: username,
            full_name: fullName
          },
          emailRedirectTo: window.location.origin + '/auth'
        }
      });

      if (error) {
        console.error("Error during signup:", error.message);
        throw error;
      }

      console.log("Signup successful, user data:", data);
      console.log("User metadata:", data.user?.user_metadata);

      toast({
        title: "Registro exitoso",
        description: "Se ha enviado un correo de verificación. Por favor revisa tu bandeja de entrada.",
      });

      return data;
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({
        title: "Error de registro",
        description: error.message || "Ha ocurrido un error durante el registro",
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
      
      // Comprobar si hay una sesión activa antes de intentar cerrar sesión
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log("No hay sesión activa, realizando limpieza local");
        // No hay sesión activa, pero queremos limpiar el estado local de todas formas
        toast({
          title: "Sesión cerrada",
          description: "Has cerrado sesión correctamente.",
        });
        return;
      }
      
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
      console.log("[resetPassword] Iniciando solicitud para:", email);
      
      // Configuramos una URL de redirección absoluta
      const redirectTo = `${window.location.origin}/reset`;
      console.log("[resetPassword] URL de redirección configurada:", redirectTo);
      
      // Llamamos a la API de Supabase para restablecer contraseña
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectTo,
      });

      if (error) {
        console.error("[resetPassword] Error de Supabase:", error);
        throw new Error(error.message || "Error al enviar correo de recuperación");
      }

      console.log("[resetPassword] Respuesta de Supabase:", data);
      console.log("[resetPassword] Solicitud procesada correctamente");
      
      return { success: true };
    } catch (error: any) {
      console.error("[resetPassword] Error capturado:", error);
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
