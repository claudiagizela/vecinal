
import React from 'react';
import { Package as PackageIcon } from 'lucide-react';

interface PackageTypeIconProps {
  type: string;
  className?: string;
}

const PackageTypeIcon: React.FC<PackageTypeIconProps> = ({ type, className = "mr-1" }) => {
  switch (type) {
    case 'caja':
    case 'sobre':
    case 'bolsa':
    default:
      return <PackageIcon size={14} className={className} />;
  }
};

export default PackageTypeIcon;
