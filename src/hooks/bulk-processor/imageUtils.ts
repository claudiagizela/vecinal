
export const getImageHash = (imageData: string): string => {
  const startIndex = imageData.indexOf('base64,') + 7;
  return imageData.substr(startIndex, 100);
};

// This function is kept for backward compatibility
// but now just returns a fixed value since we're using real processing
export const getConsistentConfidenceScore = (imageData: string): number => {
  return 80;
};

export const isDuplicateImage = (newImage: string, existingImages: string[]): boolean => {
  return existingImages.some(item => item === newImage);
};
