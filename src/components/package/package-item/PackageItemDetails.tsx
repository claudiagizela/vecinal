
import React from 'react';
import { Building2, Calendar, Check } from 'lucide-react';
import { Package } from '@/types/package';
import { formatDateTime } from '@/utils/dateFormatters';
import PackageTypeIcon from '../PackageTypeIcon';

interface PackageItemDetailsProps {
  pkg: Package;
  isReadOnly: boolean;
  isVecinoView: boolean | undefined;
}

const PackageItemDetails: React.FC<PackageItemDetailsProps> = ({
  pkg,
  isReadOnly,
  isVecinoView
}) => {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3 text-sm">
      {!isReadOnly && !isVecinoView && (
        <>
          <div className="flex items-center text-muted-foreground">
            <PackageTypeIcon type={pkg.type} />
            <span className="capitalize">{pkg.type}</span>
          </div>
          <div className="flex items-center text-muted-foreground">
            <Building2 size={14} className="mr-1" />
            <span>{pkg.company}</span>
          </div>
        </>
      )}
      <div className="flex items-center text-muted-foreground col-span-2">
        <Calendar size={14} className="mr-1" />
        <span>
          Recibido: {formatDateTime(pkg.received_date).date} a las {formatDateTime(pkg.received_date).time}
        </span>
      </div>
      {pkg.delivered_date && (
        <div className="flex items-center text-muted-foreground col-span-2">
          <Check size={14} className="mr-1" />
          <span>
            Entregado: {formatDateTime(pkg.delivered_date).date} a las {formatDateTime(pkg.delivered_date).time}
          </span>
        </div>
      )}
    </div>
  );
};

export default PackageItemDetails;
