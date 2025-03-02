
import { supabase } from '@/integrations/supabase/client';
import { RawPackageData } from '@/types/package';
import { toast } from '@/components/ui/use-toast';

type NotificationType = 'received' | 'delivered';

/**
 * Sends a notification for a package event
 */
export const sendPackageNotification = async (
  packageData: RawPackageData, 
  delivered_date: string | null,
  notificationType: NotificationType
): Promise<void> => {
  try {
    // Get neighbor details
    const { data: neighborData, error: neighborError } = await supabase
      .from('neighbors')
      .select('name, last_name, mobile_number, email')
      .eq('id', packageData.neighbor_id)
      .single();
    
    if (neighborError) {
      console.error('Error fetching neighbor data for email:', neighborError);
      throw new Error(`No se pudo obtener la información del vecino: ${neighborError.message}`);
    }
    
    if (!neighborData) {
      throw new Error('No se encontró información del vecino');
    }
    
    // Use email if available, or mobile_number as fallback
    const contactEmail = neighborData.email || `${neighborData.mobile_number}@example.com`;
    
    console.log(`Enviando notificación de paquete (${notificationType}) a:`, contactEmail);
    
    // Call edge function using supabase.functions.invoke
    const { data: responseData, error: responseError } = await supabase.functions.invoke(
      'send-package-notification',
      {
        body: JSON.stringify({
          neighbor: {
            name: neighborData.name,
            last_name: neighborData.last_name,
            email: contactEmail,
          },
          package: {
            id: packageData.id,
            type: packageData.type,
            company: packageData.company,
            received_date: packageData.received_date,
            delivered_date: delivered_date,
          },
          notificationType: notificationType,
        }),
      }
    );
    
    if (responseError) {
      console.error(`Error sending ${notificationType} notification email:`, responseError);
      throw new Error(`Error al enviar la notificación por correo: ${responseError.message}`);
    }
    
    console.log(`Notificación de paquete (${notificationType}) enviada con éxito:`, responseData);
    
    return responseData;
  } catch (error) {
    console.error(`Error sending ${notificationType} notification email:`, error);
    toast({
      title: "Error al enviar notificación",
      description: error instanceof Error ? error.message : "Ocurrió un error al enviar la notificación por correo",
      variant: "destructive"
    });
    throw error;
  }
};
