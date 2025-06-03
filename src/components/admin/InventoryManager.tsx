
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { AlertTriangle, Package, Plus, Minus } from 'lucide-react';
import { useInventoryUpdate } from '@/hooks/useInventoryUpdate';

interface InventoryItem {
  id: string;
  perfume_id: string;
  stock_quantity: number;
  low_stock_threshold: number;
  created_at: string;
  updated_at: string;
  perfumes: {
    id: string;
    name: string;
    price: string;
  };
}

const InventoryManager: React.FC = () => {
  const [adjustmentAmount, setAdjustmentAmount] = useState<number>(1);
  const [adjustmentReason, setAdjustmentReason] = useState<string>('');
  const queryClient = useQueryClient();
  const { manualAdjustment, isUpdating } = useInventoryUpdate();

  // Fetch inventory data
  const { data: inventory, isLoading } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory')
        .select(`
          *,
          perfumes (
            id,
            name,
            price
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching inventory:', error);
        throw error;
      }

      return data as InventoryItem[];
    }
  });

  const handleStockAdjustment = async (item: InventoryItem, isIncrease: boolean) => {
    if (!adjustmentReason.trim()) {
      toast.error('Please provide a reason for the inventory adjustment');
      return;
    }

    const adjustment = isIncrease ? adjustmentAmount : -adjustmentAmount;
    const newQuantity = Math.max(0, item.stock_quantity + adjustment);
    
    try {
      await manualAdjustment({
        perfumeId: item.perfume_id,
        newQuantity,
        reason: adjustmentReason
      });
      
      // Clear the reason after successful adjustment
      setAdjustmentReason('');
    } catch (error) {
      console.error('Failed to adjust inventory:', error);
    }
  };

  const isLowStock = (item: InventoryItem) => item.stock_quantity <= item.low_stock_threshold;
  const isOutOfStock = (item: InventoryItem) => item.stock_quantity === 0;

  if (isLoading) {
    return (
      <Card className="bg-darker border-gold/20">
        <CardContent className="p-6">
          <div className="text-center">Loading inventory...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-darker border-gold/20">
      <CardHeader>
        <CardTitle className="text-gold flex items-center gap-2">
          <Package className="w-5 h-5" />
          Inventory Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stock Adjustment Controls */}
        <div className="bg-dark/50 p-4 rounded-lg border border-gold/10 space-y-3">
          <div>
            <label className="text-sm font-medium mb-2 block text-gold/80">
              Adjustment Amount
            </label>
            <Input
              type="number"
              min="1"
              value={adjustmentAmount}
              onChange={(e) => setAdjustmentAmount(Number(e.target.value))}
              className="w-24 bg-dark border-gold/30"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block text-gold/80">
              Reason for Adjustment (Required)
            </label>
            <Textarea
              value={adjustmentReason}
              onChange={(e) => setAdjustmentReason(e.target.value)}
              placeholder="e.g., Stock received from supplier, Damaged goods removed, etc."
              className="bg-dark border-gold/30"
              rows={2}
            />
          </div>
        </div>

        {/* Inventory Items */}
        <div className="space-y-3">
          {inventory?.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-lg border ${
                isOutOfStock(item)
                  ? 'border-red-500/50 bg-red-500/10'
                  : isLowStock(item)
                  ? 'border-yellow-500/50 bg-yellow-500/10'
                  : 'border-gold/20 bg-dark/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{item.perfumes.name}</h3>
                    {isOutOfStock(item) && (
                      <span className="text-red-400 text-xs bg-red-500/20 px-2 py-1 rounded">
                        OUT OF STOCK
                      </span>
                    )}
                    {isLowStock(item) && !isOutOfStock(item) && (
                      <span className="text-yellow-400 text-xs bg-yellow-500/20 px-2 py-1 rounded flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        LOW STOCK
                      </span>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-400 mt-1">
                    Price: {item.perfumes.price} | Low Stock Alert: {item.low_stock_threshold} units
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gold">{item.stock_quantity}</div>
                    <div className="text-xs text-gray-400">units in stock</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStockAdjustment(item, false)}
                      disabled={isUpdating || item.stock_quantity === 0 || !adjustmentReason.trim()}
                      className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStockAdjustment(item, true)}
                      disabled={isUpdating || !adjustmentReason.trim()}
                      className="border-green-500/50 text-green-400 hover:bg-green-500/10"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {(!inventory || inventory.length === 0) && (
          <div className="text-center text-gray-400 py-8">
            No inventory items found. Add products to start managing inventory.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InventoryManager;
