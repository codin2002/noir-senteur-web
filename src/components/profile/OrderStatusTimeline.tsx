import React from 'react';
import { Check, Clock, Package, Truck, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderStatusTimelineProps {
  status: string;
  createdAt: string;
}

type Step = {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const NORMAL_FLOW: Step[] = [
  { key: 'processing', label: 'Processing', icon: Clock },
  { key: 'ready_to_ship', label: 'Ready to Ship', icon: Package },
  { key: 'dispatched', label: 'Dispatched', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle2 },
];

const formatDate = (d: string) => {
  try {
    return new Date(d).toLocaleString(undefined, {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return d;
  }
};

const OrderStatusTimeline: React.FC<OrderStatusTimelineProps> = ({ status, createdAt }) => {
  const s = (status || '').toLowerCase();
  const isCancelled = s === 'cancelled';
  const isRefunded = s === 'refunded';

  // Build steps: normal flow + terminal exception (cancelled/refunded) appended
  const steps: Step[] = [...NORMAL_FLOW];
  if (isCancelled) steps.push({ key: 'cancelled', label: 'Cancelled', icon: XCircle });
  if (isRefunded) steps.push({ key: 'refunded', label: 'Refunded', icon: RotateCcw });

  const currentIndex = steps.findIndex(st => st.key === s);
  // For an unknown status, default to step 0
  const activeIdx = currentIndex === -1 ? 0 : currentIndex;

  return (
    <div className="bg-dark border border-gold/10 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4 flex items-center text-gold">
        <Clock className="w-5 h-5 mr-2" />
        Order Timeline
      </h3>
      <ol className="relative">
        {steps.map((step, i) => {
          const reached = i <= activeIdx;
          const isCurrent = i === activeIdx;
          const isException = step.key === 'cancelled' || step.key === 'refunded';
          const Icon = reached ? (isCurrent ? step.icon : Check) : step.icon;

          const dotColor = !reached
            ? 'bg-muted text-muted-foreground border-muted'
            : isException
              ? (step.key === 'refunded'
                  ? 'bg-pink-500/20 text-pink-400 border-pink-500/40'
                  : 'bg-red-500/20 text-red-400 border-red-500/40')
              : 'bg-gold/20 text-gold border-gold/50';

          const lineColor = i < activeIdx
            ? (isException ? 'bg-pink-500/40' : 'bg-gold/40')
            : 'bg-muted';

          return (
            <li key={step.key} className="flex gap-4 pb-6 last:pb-0 relative">
              {i < steps.length - 1 && (
                <span
                  className={cn('absolute left-[15px] top-8 w-px h-[calc(100%-1rem)]', lineColor)}
                  aria-hidden
                />
              )}
              <div
                className={cn(
                  'w-8 h-8 rounded-full border flex items-center justify-center shrink-0 z-10',
                  dotColor
                )}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 pt-1">
                <p className={cn(
                  'font-medium',
                  reached ? 'text-white' : 'text-muted-foreground'
                )}>
                  {step.label}
                  {isCurrent && (
                    <span className="ml-2 text-xs uppercase tracking-wide text-gold">Current</span>
                  )}
                </p>
                {i === 0 && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDate(createdAt)}
                  </p>
                )}
                {isCurrent && i !== 0 && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {isRefunded
                      ? 'This order has been refunded.'
                      : isCancelled
                        ? 'This order was cancelled.'
                        : 'In progress'}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default OrderStatusTimeline;
