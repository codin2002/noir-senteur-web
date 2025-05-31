
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface OrdersSearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const OrdersSearchBar: React.FC<OrdersSearchBarProps> = ({
  searchTerm,
  onSearchChange
}) => {
  return (
    <div className="relative mb-6">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gold h-4 w-4" />
      <Input
        type="text"
        placeholder="Search by customer name or order ID..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10 bg-dark border-gold/30 text-white placeholder:text-gray-400 focus:border-gold"
      />
    </div>
  );
};

export default OrdersSearchBar;
