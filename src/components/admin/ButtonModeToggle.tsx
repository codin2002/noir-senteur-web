import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface PerfumeRow {
  id: string;
  name: string;
  preorder_enabled: boolean;
  product_type: string;
}

const ButtonModeToggle: React.FC = () => {
  const [perfumes, setPerfumes] = useState<PerfumeRow[]>([]);
  const [draft, setDraft] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('perfumes')
      .select('id, name, preorder_enabled, product_type')
      .order('name');
    if (error) toast.error(error.message);
    else {
      setPerfumes(data || []);
      const d: Record<string, boolean> = {};
      (data || []).forEach((p) => (d[p.id] = !!p.preorder_enabled));
      setDraft(d);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const dirty = perfumes.some((p) => draft[p.id] !== p.preorder_enabled);

  const handleSave = async () => {
    setSaving(true);
    try {
      const changed = perfumes.filter((p) => draft[p.id] !== p.preorder_enabled);
      for (const p of changed) {
        const enabled = draft[p.id];
        const { error } = await supabase
          .from('perfumes')
          .update({
            preorder_enabled: enabled,
            product_type: enabled ? 'preorder' : 'in_stock',
          })
          .eq('id', p.id);
        if (error) throw error;
      }
      toast.success('Saved');
      await load();
    } catch (e: any) {
      toast.error(e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-start justify-between mb-4 gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Button Mode</h2>
          <p className="text-sm text-gray-600">
            Toggle to switch each product's button between <strong>BUY</strong> and <strong>PREORDER</strong>, then click Save.
          </p>
        </div>
        <Button onClick={handleSave} disabled={!dirty || saving}>
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </div>

      {loading ? (
        <div className="text-gray-600">Loading...</div>
      ) : (
        <div className="divide-y divide-gray-200">
          {perfumes.map((p) => {
            const value = draft[p.id] ?? p.preorder_enabled;
            const changed = value !== p.preorder_enabled;
            return (
              <div key={p.id} className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium text-gray-900">{p.name}</div>
                  <div className="text-xs text-gray-500">
                    Saved: {p.preorder_enabled ? 'PREORDER' : 'BUY'}
                    {changed && <span className="ml-2 text-amber-600">(unsaved)</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm ${value ? 'text-gray-400' : 'text-gray-900 font-semibold'}`}>BUY</span>
                  <Switch
                    checked={value}
                    onCheckedChange={(v) => setDraft((prev) => ({ ...prev, [p.id]: v }))}
                  />
                  <span className={`text-sm ${value ? 'text-gray-900 font-semibold' : 'text-gray-400'}`}>PREORDER</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ButtonModeToggle;
