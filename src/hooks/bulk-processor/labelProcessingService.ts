import { ProcessedImage, ProcessingErrorType } from './types';
import { getConsistentConfidenceScore } from './imageUtils';
import { PackageType, Company, PackageFormData } from '@/types/package';
import { Neighbor } from '@/types/neighbor';
import { supabase } from '@/integrations/supabase/client';

const extractNeighborInfo = (text: string, neighbors: Neighbor[]): Neighbor | null => {
  // Convert text to lowercase for case-insensitive matching
  const lowerText = text.toLowerCase();
  
  // Try to find neighbors by name
  for (const neighbor of neighbors) {
    const fullName = `${neighbor.name} ${neighbor.last_name} ${neighbor.second_last_name || ''}`.toLowerCase();
    if (lowerText.includes(fullName) || 
        lowerText.includes(neighbor.name.toLowerCase()) && 
        lowerText.includes(neighbor.last_name.toLowerCase())) {
      return neighbor;
    }
    
    // Look for apartment number matches
    const apartmentText = `apto ${neighbor.apartment}`;
    const apartmentText2 = `apartamento ${neighbor.apartment}`;
    const apartmentText3 = `apt ${neighbor.apartment}`;
    if (lowerText.includes(apartmentText) || 
        lowerText.includes(apartmentText2) || 
        lowerText.includes(apartmentText3)) {
      return neighbor;
    }
  }
  
  return null;
};

const detectCompany = (text: string): Company => {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('amazon')) return 'Amazon';
  if (lowerText.includes('mercado libre') || lowerText.includes('mercadolibre')) return 'Mercado Libre';
  if (lowerText.includes('dhl')) return 'DHL';
  if (lowerText.includes('fedex')) return 'FedEx';
  
  return 'otro';
};

const detectPackageType = (text: string): PackageType => {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('caja') || lowerText.includes('box')) return 'caja';
  if (lowerText.includes('sobre') || lowerText.includes('envelope')) return 'sobre';
  if (lowerText.includes('bolsa') || lowerText.includes('bag')) return 'bolsa';
  
  return 'otro';
};

const processImageWithCloudVision = async (image: string): Promise<string> => {
  try {
    const { data, error } = await supabase.functions.invoke('process-label-image', {
      body: { imageBase64: image }
    });
    
    if (error) throw new Error(error.message);
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to process image');
    }
    
    return data.text;
  } catch (error) {
    console.error('Error calling Cloud Vision API:', error);
    throw error;
  }
};

export const processLabelImages = async (
  images: ProcessedImage[], 
  neighbors: Neighbor[],
  confidenceThreshold: number
): Promise<ProcessedImage[]> => {
  return await Promise.all(images.map(async (img) => {
    try {
      // Process the image with Google Cloud Vision
      const extractedText = await processImageWithCloudVision(img.image);
      console.log('Extracted text:', extractedText);
      
      // Find neighbor based on extracted text
      const neighbor = extractNeighborInfo(extractedText, neighbors);
      
      // If we couldn't find a neighbor, return error
      if (!neighbor) {
        return {
          ...img,
          status: 'error' as const,
          errorMessage: 'No se encuentra ese vecino en la base de datos',
          errorType: 'neighbor_not_found' as ProcessingErrorType,
          confidenceScore: 45
        };
      }
      
      // Detect other package information
      const company = detectCompany(extractedText);
      const packageType = detectPackageType(extractedText);
      const now = new Date();
      
      // Calculate confidence score based on amount of information extracted
      let confidenceScore = 75; // Base confidence
      
      // Adjust confidence based on completeness of data
      if (neighbor) confidenceScore += 10;
      if (company !== 'otro') confidenceScore += 5;
      if (packageType !== 'otro') confidenceScore += 10;
      
      // Confidence score capped at 95% to allow for human verification
      confidenceScore = Math.min(95, confidenceScore);
      
      const packageData: PackageFormData = {
        type: packageType,
        received_date: now.toISOString(),
        delivered_date: null,
        company: company,
        neighbor_id: neighbor.id,
        images: [img.image]
      };
      
      // Check if confidence score meets threshold
      if (confidenceScore < confidenceThreshold) {
        return {
          ...img,
          status: 'error' as const,
          errorMessage: `Confianza insuficiente (${confidenceScore}%)`,
          errorType: 'low_confidence' as ProcessingErrorType,
          confidenceScore,
          packageData
        };
      }
      
      return {
        ...img,
        status: 'success' as const,
        packageData,
        confidenceScore
      };
    } catch (error) {
      console.error('Error processing image:', error);
      return {
        ...img,
        status: 'error' as const,
        errorMessage: 'Ocurrió un error al procesar la imagen',
        errorType: 'generic_error' as ProcessingErrorType,
        confidenceScore: 20
      };
    }
  }));
};
