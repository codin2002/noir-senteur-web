import React from 'react';
import { HeatmapCell } from '@/hooks/useAnalyticsData';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const ActivityHeatmap: React.FC<{ data: HeatmapCell[] }> = ({ data }) => {
  const max = Math.max(0, ...data.map((c) => c.count));
  const total = data.reduce((s, c) => s + c.count, 0);
  const cellAt = (day: number, hour: number) =>
    data.find((c) => c.day === day && c.hour === hour)?.count ?? 0;

  return (
    <div className="rounded-lg border border-gold/20 bg-darker p-5">
      <h3 className="mb-1 font-serif text-xl text-gold">Activity Heatmap</h3>
      <p className="mb-4 text-xs text-muted-foreground">
        Inventory movements by weekday × hour
      </p>
      {total === 0 ? (
        <div className="py-16 text-center text-sm text-muted-foreground">No activity recorded yet</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <div className="inline-block">
              <div className="flex">
                <div className="w-10" />
                {Array.from({ length: 24 }, (_, h) => (
                  <div key={h} className="w-5 text-center text-[9px] text-gold/60">
                    {h % 3 === 0 ? h : ''}
                  </div>
                ))}
              </div>
              {DAYS.map((d, di) => (
                <div key={d} className="flex items-center">
                  <div className="w-10 pr-2 text-right text-[10px] font-medium text-gold/80">{d}</div>
                  {Array.from({ length: 24 }, (_, h) => {
                    const v = cellAt(di, h);
                    const intensity = max > 0 ? v / max : 0;
                    const bg = v === 0
                      ? 'hsl(0 0% 12%)'
                      : `hsl(45 90% ${65 - intensity * 35}% / ${0.35 + intensity * 0.65})`;
                    return (
                      <div
                        key={h}
                        title={v === 0 ? `${d} ${h}:00 — no activity` : `${d} ${h}:00 — ${v} events`}
                        className="m-[1px] h-5 w-5 rounded-sm border border-white/5 transition-transform hover:scale-125"
                        style={{ backgroundColor: bg }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-[10px] text-gold/60">
            <span>Less</span>
            {[0.1, 0.3, 0.55, 0.8, 1].map((i) => (
              <div
                key={i}
                className="h-3 w-3 rounded-sm"
                style={{ backgroundColor: `hsl(45 90% ${65 - i * 35}% / ${0.35 + i * 0.65})` }}
              />
            ))}
            <span>More</span>
          </div>
        </>
      )}
    </div>
  );
};

export default ActivityHeatmap;
