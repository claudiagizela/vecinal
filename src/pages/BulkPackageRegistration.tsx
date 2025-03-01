
import React from 'react';
import { useNeighbors } from '@/context/NeighborContext';
import { useBulkPackageProcessor } from '@/hooks/useBulkPackageProcessor';
import PageHeader from '@/components/bulk-package/PageHeader';
import ImageUploader from '@/components/bulk-package/ImageUploader';
import SuccessAlert from '@/components/bulk-package/SuccessAlert';
import PackageList from '@/components/bulk-package/PackageList';
import ManualPackageDialog from '@/components/bulk-package/ManualPackageDialog';

const BulkPackageRegistration = () => {
  const { neighbors } = useNeighbors();
  const {
    isProcessing,
    processedImages,
    uploadedCount,
    manualItemId,
    showManualForm,
    getImageFromItemId,
    handleImageUpload,
    registerPackages,
    retryFailedItems,
    clearAll,
    handleRetryItem,
    openManualForm,
    handleManualSubmit,
    setShowManualForm
  } = useBulkPackageProcessor();

  return (
    <div className="min-h-screen bg-background">
      <PageHeader />
      
      <main className="max-w-4xl mx-auto px-6 pb-16 animate-fade-in space-y-6">
        <ImageUploader 
          isProcessing={isProcessing} 
          onImagesSelected={handleImageUpload} 
        />
            
        <SuccessAlert count={uploadedCount} />
        
        <PackageList 
          processedImages={processedImages}
          neighbors={neighbors}
          isProcessing={isProcessing}
          onRetryItem={handleRetryItem}
          onRetryFailed={retryFailedItems}
          onClearAll={clearAll}
          onManualEdit={openManualForm}
          onRegisterPackages={registerPackages}
        />
      </main>

      <ManualPackageDialog 
        open={showManualForm}
        onOpenChange={setShowManualForm}
        itemId={manualItemId}
        image={getImageFromItemId(manualItemId)}
        onSubmit={handleManualSubmit}
      />
    </div>
  );
};

export default BulkPackageRegistration;
