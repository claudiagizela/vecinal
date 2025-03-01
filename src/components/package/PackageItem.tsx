
import React from 'react';
import { Package as PackageIcon, Building2, Calendar, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatDateTime } from '@/utils/dateFormatters';
import { Package } from '@/types/package';
import PackageStatusBadge from './PackageStatusBadge';
import PackageTypeIcon from './PackageTypeIcon';
import PackageActions from './PackageActions';

interface PackageItemProps {
  pkg: Package;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onMarkDelivered: (id: string) => void;
  onMarkPending?: (id: string) => void;
}

const PackageItem: React.FC<PackageItemProps> = ({
  pkg,
  onEdit,
  onDelete,
  onMarkDelivered,
  onMarkPending,
}) => {
  return (
    <Card key={pkg.id} className="overflow-hidden transition-all duration-200 hover:shadow-md animate-fade-in">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="w-full">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-primary/10 p-2 text-primary">
                  <PackageIcon size={16} />
                </div>
                <div>
                  <h3 className="font-medium">
                    {pkg.neighbor?.name} {pkg.neighbor?.last_name} {pkg.neighbor?.second_last_name}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    Apto {pkg.neighbor?.apartment}
                  </span>
                </div>
              </div>
              <div>
                <PackageStatusBadge isDelivered={!!pkg.delivered_date} />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3 text-sm">
              <div className="flex items-center text-muted-foreground">
                <PackageTypeIcon type={pkg.type} />
                <span className="capitalize">{pkg.type}</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <Building2 size={14} className="mr-1" />
                <span>{pkg.company}</span>
              </div>
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
            
            <PackageActions 
              isDelivered={!!pkg.delivered_date}
              onMarkDelivered={() => onMarkDelivered(pkg.id)}
              onMarkPending={onMarkPending ? () => onMarkPending(pkg.id) : undefined}
              onEdit={() => onEdit(pkg.id)}
              onDelete={() => onDelete(pkg.id)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PackageItem;
