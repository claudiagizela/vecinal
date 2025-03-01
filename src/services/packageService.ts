
import { supabase } from '@/integrations/supabase/client';
import { Package, PackageFormData, PackageType, Company, RawPackageData } from '@/types/package';

export const fetchPackagesWithImages = async (): Promise<Package[]> => {
  // Fetch packages
  const { data: packagesData, error: packagesError } = await supabase
    .from('packages')
    .select('*')
    .order('received_date', { ascending: false });
  
  if (packagesError) {
    throw packagesError;
  }
  
  // Fetch images for each package
  const packagesWithImages = await Promise.all(
    (packagesData || []).map(async (pkg: RawPackageData) => {
      const { data: imagesData, error: imagesError } = await supabase
        .from('package_images')
        .select('image_url')
        .eq('package_id', pkg.id);
      
      if (imagesError) {
        console.error('Error fetching images for package:', imagesError);
        return { 
          ...pkg, 
          type: pkg.type as PackageType,
          company: pkg.company as Company,
          images: [] 
        } as Package;
      }
      
      return { 
        ...pkg, 
        type: pkg.type as PackageType,
        company: pkg.company as Company,
        images: imagesData ? imagesData.map(img => img.image_url) : [] 
      } as Package;
    })
  );
  
  return packagesWithImages;
};

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
  
  return newPackage.id;
};

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

export const deletePackageData = async (id: string): Promise<void> => {
  // Delete the package (cascades to images due to foreign key)
  const { error } = await supabase
    .from('packages')
    .delete()
    .eq('id', id);
  
  if (error) {
    throw error;
  }
};

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
  
  return delivered_date;
};

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
