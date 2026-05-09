import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface PerfumeRow {
  id: string;
  name: string;
  preorder_enabled: boolean;
  product_type: string;
}

const ButtonModeToggle: React.FC = () => {
  const [perfumes, setPerfumes] = useState<PerfumeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('perfumes')
      .select('id, name, preorder_enabled, product_type')
      .order('name');
    if (error) toast.error(error.message);
    else setPerfumes(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const toggle = async (p: PerfumeRow, enabled: boolean) => {
    setSavingId(p.id);
    const { error } = await supabase
      .from('perfumes')
      .update({
        preorder_enabled: enabled,
        product_type: enabled ? 'preorder' : 'in_stock',
      })
      .eq('id', p.id);
    setSavingId(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    setPerfumes((prev) =>
      prev.map((x) =>
        x.id === p.id
          ? { ...x, preorder_enabled: enabled, product_type: enabled ? 'preorder' : 'in_stock' }
          : x
      )
    );
    toast.success(`${p.name}: button set to ${enabled ? 'PREORDER' : 'BUY'}`);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-1">Button Mode</h2>
      <p className="text-sm text-gray-600 mb-4">
        Toggle to switch each product's button between <strong>BUY</strong> and <strong>PREORDER</strong>.
      </p>

      {loading ? (
        <div className="text-gray-600">Loading...</div>
      ) : (
        <div className="divide-y divide-gray-200">
          {perfumes.map((p) => (
            <div key={p.id} className="flex items-center justify-between py-3">
              <div>
                <div className="font-medium text-gray-900">{p.name}</div>
                <div className="text-xs text-gray-500">
                  Current: {p.preorder_enabled ? 'PREORDER' : 'BUY'}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-sm ${p.preorder_enabled ? 'text-gray-400' : 'text-gray-900 font-semibold'}`}>BUY</span>
                <Switch
                  checked={p.preorder_enabled}
                  disabled={savingId === p.id}
                  onCheckedChange={(v) => toggle(p, v)}
                />
                <span className={`text-sm ${p.preorder_enabled ? 'text-gray-900 font-semibold' : 'text-gray-400'}`}>PREORDER</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ButtonModeToggle;
