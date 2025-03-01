
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
  
  // Send notification email if the package was created successfully
  if (newPackage && newPackage.id) {
    try {
      // Get neighbor details for the email
      const { data: neighborData, error: neighborError } = await supabase
        .from('neighbors')
        .select('name, last_name, mobile_number, email')
        .eq('id', data.neighbor_id)
        .single();
      
      if (neighborError) {
        console.error('Error fetching neighbor data for email:', neighborError);
      } else if (neighborData) {
        // Use email if available, or mobile_number as fallback
        const contactEmail = neighborData.email || `${neighborData.mobile_number}@example.com`;
        
        const response = await fetch(
          `https://mhrbnafcdadsqkrsfwdr.supabase.co/functions/v1/send-package-notification`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ocmJuYWZjZGFkc3FrcnNmd2RyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4NTc5MzEsImV4cCI6MjA1NjQzMzkzMX0.2W4LMuDUWS4TLyZ7hClUn-Ukvs00hSn_Qyug9FTE3N8`,
            },
            body: JSON.stringify({
              neighbor: {
                name: neighborData.name,
                last_name: neighborData.last_name,
                email: contactEmail,
              },
              package: {
                id: newPackage.id,
                type: data.type,
                company: data.company,
                received_date: data.received_date,
                delivered_date: null,
              },
              notificationType: 'received',
            }),
          }
        );
        
        if (!response.ok) {
          console.error('Error sending notification email:', await response.json());
        }
      }
    } catch (error) {
      console.error('Error sending notification email:', error);
      // Don't throw here, just log the error since the package was created successfully
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
      // Get neighbor details
      const { data: neighborData, error: neighborError } = await supabase
        .from('neighbors')
        .select('name, last_name, mobile_number, email')
        .eq('id', packageData.neighbor_id)
        .single();
      
      if (neighborError) {
        console.error('Error fetching neighbor data for email:', neighborError);
      } else if (neighborData) {
        // Use email if available, or mobile_number as fallback
        const contactEmail = neighborData.email || `${neighborData.mobile_number}@example.com`;
        
        const response = await fetch(
          `https://mhrbnafcdadsqkrsfwdr.supabase.co/functions/v1/send-package-notification`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ocmJuYWZjZGFkc3FrcnNmd2RyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4NTc5MzEsImV4cCI6MjA1NjQzMzkzMX0.2W4LMuDUWS4TLyZ7hClUn-Ukvs00hSn_Qyug9FTE3N8`,
            },
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
              notificationType: 'delivered',
            }),
          }
        );
        
        if (!response.ok) {
          console.error('Error sending delivery notification email:', await response.json());
        }
      }
    }
  } catch (error) {
    console.error('Error sending delivery notification email:', error);
    // Don't throw here since the package was marked as delivered successfully
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
