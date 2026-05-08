import React from 'react';
import { HeatmapCell, PeakActivity } from '@/hooks/useAnalyticsData';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface Props {
  data: HeatmapCell[];
  peak: PeakActivity;
}

const ActivityHeatmap: React.FC<Props> = ({ data, peak }) => {
  const max = Math.max(0, ...data.map((c) => c.count));
  const total = data.reduce((s, c) => s + c.count, 0);
  const cellAt = (day: number, hour: number) =>
    data.find((c) => c.day === day && c.hour === hour)?.count ?? 0;

  return (
    <div className="rounded-lg border border-gray-200 bg-darker p-5">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h3 className="font-serif text-xl text-gold">Activity Heatmap</h3>
          <p className="text-[11px] text-muted-foreground">Inventory events by weekday × hour</p>
        </div>
        {total > 0 && peak.busiestDay && peak.busiestHourBlock && (
          <div className="rounded-md border border-gray-200 bg-dark/50 px-3 py-1.5 text-right">
            <div className="text-[10px] uppercase tracking-wide text-gray-400">Peak window</div>
            <div className="text-xs font-semibold text-gold">{peak.busiestDay.name} · {peak.busiestHourBlock}</div>
          </div>
        )}
      </div>

      {total === 0 ? (
        <div className="py-16 text-center text-sm text-muted-foreground">No activity recorded yet</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <div className="inline-block">
              <div className="flex">
                <div className="w-12" />
                {Array.from({ length: 24 }, (_, h) => (
                  <div key={h} className="w-6 text-center text-[10px] font-medium text-gray-500">
                    {h % 2 === 0 ? h : ''}
                  </div>
                ))}
              </div>
              {DAYS.map((d, di) => (
                <div key={d} className="flex items-center">
                  <div className="w-12 pr-2 text-right text-xs font-semibold text-gold/85">{d}</div>
                  {Array.from({ length: 24 }, (_, h) => {
                    const v = cellAt(di, h);
                    const intensity = max > 0 ? v / max : 0;
                    const bg = v === 0
                      ? 'hsl(0 0% 12%)'
                      : `hsl(45 90% ${65 - intensity * 35}% / ${0.35 + intensity * 0.65})`;
                    return (
                      <div
                        key={h}
                        title={v === 0 ? `${d} ${h}:00 — no activity` : `${d} ${h}:00 — ${v} event${v === 1 ? '' : 's'}`}
                        className="m-[1.5px] h-6 w-6 rounded-sm border border-white/5 transition-transform hover:scale-125"
                        style={{ backgroundColor: bg }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-[11px] text-gray-400">
            <div>{total} total events tracked</div>
            <div className="flex items-center gap-2">
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
          </div>
        </>
      )}
    </div>
  );
};

export default ActivityHeatmap;
