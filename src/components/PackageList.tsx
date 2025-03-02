
import React, { useState } from 'react';
import { Package } from '@/types/package';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import PackageItem from './package/PackageItem';
import PackageEmptyState from './package/PackageEmptyState';
import DeletePackageDialog from './package/DeletePackageDialog';

interface PackageListProps {
  packages: Package[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onMarkDelivered?: (id: string) => void;
  onMarkPending?: (id: string) => void;
  onResendNotification?: (id: string) => void;
  className?: string;
}

const PackageList: React.FC<PackageListProps> = ({
  packages,
  onEdit,
  onDelete,
  onMarkDelivered,
  onMarkPending,
  onResendNotification,
  className,
}) => {
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredPackages = packages.filter((pkg) =>
    `${pkg.neighbor?.name || ''} ${pkg.neighbor?.last_name || ''} ${pkg.neighbor?.second_last_name || ''} ${pkg.neighbor?.apartment || ''} ${pkg.company} ${pkg.type}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const confirmDelete = (id: string) => {
    setDeleteId(id);
  };

  const handleDelete = () => {
    if (deleteId && onDelete) {
      onDelete(deleteId);
      setDeleteId(null);
    }
  };

  const cancelDelete = () => {
    setDeleteId(null);
  };

  // Check if we're in read-only mode (vecino view)
  const isReadOnly = !onEdit && !onDelete;
  // Check if we're in vecino mode (can mark as received but can't edit/delete)
  const isVecinoView = !onEdit && !onDelete && onMarkDelivered !== undefined;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
        <Input
          placeholder={isReadOnly ? "Buscar en mis paquetes..." : "Buscar paquetes..."}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>
      
      {filteredPackages.length > 0 ? (
        <ScrollArea className="h-[60vh] pr-4 -mr-4">
          <div className="space-y-3">
            {filteredPackages.map((pkg) => (
              <PackageItem
                key={pkg.id}
                pkg={pkg}
                onEdit={onEdit}
                onDelete={onDelete ? confirmDelete : undefined}
                onMarkDelivered={onMarkDelivered}
                onMarkPending={onMarkPending}
                onResendNotification={onResendNotification}
                isVecinoView={isVecinoView}
              />
            ))}
          </div>
        </ScrollArea>
      ) : (
        <PackageEmptyState 
          hasSearchFilter={search !== ''} 
          isReadOnly={isReadOnly}
        />
      )}

      {onDelete && (
        <DeletePackageDialog
          open={!!deleteId}
          onOpenChange={(open) => !open && cancelDelete()}
          onConfirm={handleDelete}
          onCancel={cancelDelete}
        />
      )}
    </div>
  );
};

export default PackageList;
