
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Package } from '@/types/package';
import PackageActions from './PackageActions';
import { 
  PackageItemHeader, 
  PackageItemDetails, 
  PackageItemVecinoActions,
  PackageDetailsDialog
} from './package-item';

interface PackageItemProps {
  pkg: Package;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onMarkDelivered?: (id: string) => void;
  onMarkPending?: (id: string) => void;
  onResendNotification?: (id: string) => void;
  isVecinoView?: boolean;
}

const PackageItem: React.FC<PackageItemProps> = ({
  pkg,
  onEdit,
  onDelete,
  onMarkDelivered,
  onMarkPending,
  onResendNotification,
  isVecinoView,
}) => {
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  // Determine if we're showing this in read-only mode (for vecinos)
  const isReadOnly = !onEdit && !onDelete && !isVecinoView;

  return (
    <>
      <Card key={pkg.id} className="overflow-hidden transition-all duration-200 hover:shadow-md animate-fade-in">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="w-full">
              <PackageItemHeader 
                pkg={pkg}
                isReadOnly={isReadOnly}
                isVecinoView={isVecinoView}
              />
              
              <PackageItemDetails 
                pkg={pkg}
                isReadOnly={isReadOnly}
                isVecinoView={isVecinoView}
              />
              
              {/* Vecino View Actions */}
              {isVecinoView && (
                <PackageItemVecinoActions 
                  isDelivered={!!pkg.delivered_date}
                  onViewDetails={() => setDetailsOpen(true)}
                  onMarkDelivered={onMarkDelivered ? () => onMarkDelivered(pkg.id) : undefined}
                />
              )}
              
              {/* Guard Actions */}
              {!isReadOnly && !isVecinoView && (
                <PackageActions 
                  isDelivered={!!pkg.delivered_date}
                  onMarkDelivered={onMarkDelivered ? () => onMarkDelivered(pkg.id) : undefined}
                  onMarkPending={onMarkPending ? () => onMarkPending(pkg.id) : undefined}
                  onEdit={onEdit ? () => onEdit(pkg.id) : undefined}
                  onDelete={onDelete ? () => onDelete(pkg.id) : undefined}
                  onResendNotification={onResendNotification ? () => onResendNotification(pkg.id) : undefined}
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Package Details Dialog */}
      <PackageDetailsDialog 
        pkg={pkg}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onMarkDelivered={onMarkDelivered}
      />
    </>
  );
};

export default PackageItem;
