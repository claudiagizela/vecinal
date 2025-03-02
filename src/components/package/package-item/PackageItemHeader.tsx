
import React from 'react';
import { Package as PackageIcon } from 'lucide-react';
import { Package } from '@/types/package';
import PackageStatusBadge from '../PackageStatusBadge';

interface PackageItemHeaderProps {
  pkg: Package;
  isReadOnly: boolean;
  isVecinoView: boolean | undefined;
}

const PackageItemHeader: React.FC<PackageItemHeaderProps> = ({
  pkg,
  isReadOnly,
  isVecinoView
}) => {
  return (
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <div className="rounded-full bg-primary/10 p-2 text-primary">
          <PackageIcon size={16} />
        </div>
        {isReadOnly || isVecinoView ? (
          <div>
            <h3 className="font-medium">
              Paquete de {pkg.company}
            </h3>
            <span className="text-xs text-muted-foreground capitalize">
              {pkg.type}
            </span>
          </div>
        ) : (
          <div>
            <h3 className="font-medium">
              {pkg.neighbor?.name} {pkg.neighbor?.last_name} {pkg.neighbor?.second_last_name}
            </h3>
            <span className="text-xs text-muted-foreground">
              Apto {pkg.neighbor?.apartment}
            </span>
          </div>
        )}
      </div>
      <div>
        <PackageStatusBadge isDelivered={!!pkg.delivered_date} />
      </div>
    </div>
  );
};

export default PackageItemHeader;
