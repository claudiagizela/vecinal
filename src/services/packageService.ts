
// This file re-exports all package service functionality from the new modular structure
// It maintains backward compatibility so existing imports will still work
export {
  fetchPackagesWithImages,
  createPackage,
  updatePackageData,
  deletePackageData,
  markPackageAsDelivered,
  markPackageAsPending,
  resendDeliveryNotification
} from './packages';
