
// In-memory cache for consistent confidence scores
const imageConfidenceCache = new Map<string, number>();

export const getImageHash = (imageData: string): string => {
  const startIndex = imageData.indexOf('base64,') + 7;
  return imageData.substr(startIndex, 100);
};

export const getConsistentConfidenceScore = (imageData: string): number => {
  const imageHash = getImageHash(imageData);
  
  if (!imageConfidenceCache.has(imageHash)) {
    const confidenceScore = Math.round((0.4 + Math.random() * 0.6) * 100);
    imageConfidenceCache.set(imageHash, confidenceScore);
  }
  
  return imageConfidenceCache.get(imageHash) || 0;
};

export const isDuplicateImage = (newImage: string, existingImages: string[]): boolean => {
  return existingImages.some(item => item === newImage);
};
