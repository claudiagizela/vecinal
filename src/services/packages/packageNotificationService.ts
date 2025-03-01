
import { supabase } from '@/integrations/supabase/client';
import { RawPackageData } from '@/types/package';

type NotificationType = 'received' | 'delivered';

/**
 * Sends a notification for a package event
 */
export const sendPackageNotification = async (
  packageData: RawPackageData, 
  delivered_date: string | null,
  notificationType: NotificationType
): Promise<void> => {
  // Get neighbor details
  const { data: neighborData, error: neighborError } = await supabase
    .from('neighbors')
    .select('name, last_name, mobile_number, email')
    .eq('id', packageData.neighbor_id)
    .single();
  
  if (neighborError) {
    console.error('Error fetching neighbor data for email:', neighborError);
    return;
  }
  
  if (neighborData) {
    // Use email if available, or mobile_number as fallback
    const contactEmail = neighborData.email || `${neighborData.mobile_number}@example.com`;
    
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
    }
  }
};
