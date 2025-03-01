
import { supabase } from '@/integrations/supabase/client';
import { sendPackageNotification } from './packageNotificationService';

/**
 * Marks a package as delivered
 */
export const markPackageAsDelivered = async (id: string): Promise<string> => {
  const delivered_date = new Date().toISOString();
  
  // Update in database
  const { error } = await supabase
    .from('packages')
    .update({ delivered_date })
    .eq('id', id);
  
  if (error) {
    throw error;
  }
  
  // Send notification email
  try {
    // Get package details
    const { data: packageData, error: packageError } = await supabase
      .from('packages')
      .select('*')
      .eq('id', id)
      .single();
    
    if (packageError) {
      console.error('Error fetching package data for email:', packageError);
    } else if (packageData) {
      await sendPackageNotification(packageData, delivered_date, 'delivered');
    }
  } catch (error) {
    console.error('Error sending delivery notification email:', error);
    // Don't throw here since the package was marked as delivered successfully
  }
  
  return delivered_date;
};

/**
 * Marks a package as pending (not delivered)
 */
export const markPackageAsPending = async (id: string): Promise<void> => {
  // Update in database, setting delivered_date to null
  const { error } = await supabase
    .from('packages')
    .update({ delivered_date: null })
    .eq('id', id);
  
  if (error) {
    throw error;
  }
};

/**
 * Resends a delivery notification email for a package that has already been delivered
 */
export const resendDeliveryNotification = async (id: string): Promise<void> => {
  // Get package details
  const { data: packageData, error: packageError } = await supabase
    .from('packages')
    .select('*')
    .eq('id', id)
    .single();
  
  if (packageError) {
    console.error('Error fetching package data for email:', packageError);
    throw packageError;
  }
  
  if (!packageData) {
    throw new Error('Package not found');
  }
  
  if (!packageData.delivered_date) {
    throw new Error('Package has not been delivered yet');
  }
  
  // Resend notification email
  await sendPackageNotification(packageData, packageData.delivered_date, 'delivered');
};
