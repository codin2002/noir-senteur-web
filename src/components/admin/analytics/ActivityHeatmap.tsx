import React from 'react';
import { HeatmapCell } from '@/hooks/useAnalyticsData';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const ActivityHeatmap: React.FC<{ data: HeatmapCell[] }> = ({ data }) => {
  const max = Math.max(1, ...data.map((c) => c.count));
  const cellAt = (day: number, hour: number) =>
    data.find((c) => c.day === day && c.hour === hour)?.count ?? 0;

  return (
    <div className="rounded-lg border border-gold/20 bg-dark/50 p-5">
      <h3 className="mb-1 font-serif text-xl text-gold">Activity Heatmap</h3>
      <p className="mb-4 text-xs text-muted-foreground">
        Inventory movements by weekday × hour (peak = darkest gold)
      </p>
      <div className="overflow-x-auto">
        <div className="inline-block">
          <div className="flex">
            <div className="w-10" />
            {Array.from({ length: 24 }, (_, h) => (
              <div key={h} className="w-4 text-center text-[9px] text-muted-foreground">
                {h % 3 === 0 ? h : ''}
              </div>
            ))}
          </div>
          {DAYS.map((d, di) => (
            <div key={d} className="flex items-center">
              <div className="w-10 pr-2 text-right text-[10px] text-gold/70">{d}</div>
              {Array.from({ length: 24 }, (_, h) => {
                const v = cellAt(di, h);
                const intensity = v / max;
                return (
                  <div
                    key={h}
                    title={`${d} ${h}:00 — ${v} events`}
                    className="m-[1px] h-4 w-4 rounded-sm transition-transform hover:scale-125"
                    style={{
                      backgroundColor:
                        v === 0
                          ? 'hsl(var(--gold) / 0.05)'
                          : `hsl(var(--gold) / ${0.15 + intensity * 0.85})`,
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActivityHeatmap;
