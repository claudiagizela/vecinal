
import { supabase } from '@/integrations/supabase/client';
import { PackageFormData } from '@/types/package';
import { sendPackageNotification } from './packageNotificationService';

/**
 * Creates a new package
 */
export const createPackage = async (data: PackageFormData): Promise<string | undefined> => {
  // Insert the package
  const { data: newPackage, error: packageError } = await supabase
    .from('packages')
    .insert([{
      type: data.type,
      received_date: data.received_date,
      delivered_date: data.delivered_date,
      company: data.company,
      neighbor_id: data.neighbor_id
    }])
    .select()
    .single();
  
  if (packageError) {
    throw packageError;
  }
  
  // Insert the images
  if (data.images && data.images.length > 0) {
    const imagesForInsert = data.images.map(image => ({
      package_id: newPackage.id,
      image_url: image
    }));
    
    const { error: imagesError } = await supabase
      .from('package_images')
      .insert(imagesForInsert);
    
    if (imagesError) {
      console.error('Error inserting package images:', imagesError);
    }
  }
  
  // Send notification email if the package was created successfully
  if (newPackage && newPackage.id) {
    try {
      await sendPackageNotification(newPackage, null, 'received');
    } catch (error) {
      console.error('Error sending notification email:', error);
      // Don't throw here, just log the error since the package was created successfully
    }
  }
  
  return newPackage.id;
};

/**
 * Updates an existing package
 */
export const updatePackageData = async (id: string, data: PackageFormData): Promise<void> => {
  // Update the package
  const { error: packageError } = await supabase
    .from('packages')
    .update({
      type: data.type,
      received_date: data.received_date,
      delivered_date: data.delivered_date,
      company: data.company,
      neighbor_id: data.neighbor_id
    })
    .eq('id', id);
  
  if (packageError) {
    throw packageError;
  }
  
  // Delete existing images
  const { error: deleteImagesError } = await supabase
    .from('package_images')
    .delete()
    .eq('package_id', id);
  
  if (deleteImagesError) {
    console.error('Error deleting package images:', deleteImagesError);
  }
  
  // Insert new images
  if (data.images && data.images.length > 0) {
    const imagesForInsert = data.images.map(image => ({
      package_id: id,
      image_url: image
    }));
    
    const { error: insertImagesError } = await supabase
      .from('package_images')
      .insert(imagesForInsert);
    
    if (insertImagesError) {
      console.error('Error inserting package images:', insertImagesError);
    }
  }
};
