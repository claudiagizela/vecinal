
import { supabase } from '@/integrations/supabase/client';
import { Package, RawPackageData, PackageType, Company } from '@/types/package';

/**
 * Fetches all packages with their associated images
 */
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

/**
 * Deletes a package by ID
 */
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
