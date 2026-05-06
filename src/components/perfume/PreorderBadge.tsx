import React, { useEffect, useState } from 'react';
import { Clock, Truck } from 'lucide-react';
import type { PreorderInfo } from '@/hooks/usePreorderInfo';

const formatDate = (iso?: string | null) => {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
};

const useCountdown = (target?: string | null) => {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!target) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [target]);
  if (!target) return null;
  const diff = new Date(target).getTime() - now;
  if (diff <= 0) return null;
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return `${d}d ${h}h ${m}m`;
};

interface Props {
  info: PreorderInfo;
}

const PreorderBadge: React.FC<Props> = ({ info }) => {
  const ship = formatDate(info.expected_shipping_date);
  const countdown = useCountdown(info.preorder_end_date);
  const seatsLeft = info.preorder_limit != null ? Math.max(info.preorder_limit - info.preorder_count, 0) : null;

  return (
    <div className="rounded-lg border border-gold/40 bg-gold/5 p-4 space-y-2">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 bg-gold text-darker text-[10px] uppercase tracking-widest font-semibold px-2 py-1 rounded">
          <Clock className="w-3 h-3" /> Preorder Available
        </span>
        {countdown && (
          <span className="text-xs text-gold/80">Closes in {countdown}</span>
        )}
      </div>
      {ship && (
        <p className="text-sm text-gray-200 flex items-center gap-2">
          <Truck className="w-4 h-4 text-gold" />
          Ships on <span className="text-gold font-medium">{ship}</span>
        </p>
      )}
      <p className="text-xs text-gray-400">
        This item is available for preorder and will be shipped on the date above.
      </p>
      {seatsLeft != null && seatsLeft <= 20 && (
        <p className="text-xs text-gold">{seatsLeft} preorder spots left</p>
      )}
    </div>
  );
};

export default PreorderBadge;
