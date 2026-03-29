'use client';

import type { PipelineData } from '../order-detail/types';
import { DrawerProps, fmtDate } from './utils';

export function DrawerBBSFSection({ data }: DrawerProps & { data: PipelineData }) {
  const bbsfWashing = data.bbsfWashing || [];
  const bbsfSanfor = data.bbsfSanfor || [];

  const sanforByType: Record<string, { count: number; totalSusut: number; nullSusut: number }> = {};
  bbsfSanfor.forEach(s => {
    if (s.sanfor_type) {
      if (!sanforByType[s.sanfor_type]) sanforByType[s.sanfor_type] = { count: 0, totalSusut: 0, nullSusut: 0 };
      sanforByType[s.sanfor_type]!.count += 1;
      if (s.susut != null) {
        sanforByType[s.sanfor_type]!.totalSusut += s.susut;
      } else {
        sanforByType[s.sanfor_type]!.nullSusut += 1;
      }
    }
  });

  return (
    <section>
      <h3 className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#71787E' }}>
        BBSF
      </h3>
      <p className="text-[10px] italic mb-3" style={{ color: '#71787E' }}>
        Order-level data — no beam tracking in BBSF
      </p>

      {/* Washing */}
      <div className="mb-3">
        <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#71787E' }}>Washing</p>
        <div className="rounded-[10px] p-3" style={{}}>
          <p className="text-sm font-semibold" style={{ color: '#181C20' }}>
            {bbsfWashing.length} record{bbsfWashing.length !== 1 ? 's' : ''}
          </p>
          {bbsfWashing.length > 0 && (
            <p className="text-xs mt-0.5" style={{ color: '#41474D' }}>
              {fmtDate(bbsfWashing[0].tgl)}
              {bbsfWashing.length > 1 ? ` – ${fmtDate(bbsfWashing[bbsfWashing.length - 1].tgl)}` : ''}
            </p>
          )}
        </div>
      </div>

      {/* Sanfor by type */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#71787E' }}>Sanfor</p>
        {Object.keys(sanforByType).length > 0 ? (
          <div className="space-y-1.5">
            {Object.entries(sanforByType).sort().map(([type, info]) => {
              const avg = info.nullSusut === 0
                ? (info.totalSusut / info.count).toFixed(2)
                : null;
              return (
                <div key={type} className="rounded-[10px] p-3 flex items-center justify-between" style={{}}>
                  <span className="text-sm font-semibold" style={{ color: '#181C20' }}>{type}</span>
                  <span className="text-xs" style={{ color: '#41474D' }}>
                    {info.count} record{info.count !== 1 ? 's' : ''}
                    {avg != null
                      ? ` · avg susut ${avg}%`
                      : ` · ${info.nullSusut} with missing susut`}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[10px] p-3" style={{}}>
            <p className="text-sm" style={{ color: '#71787E' }}>No sanfor records</p>
          </div>
        )}
      </div>
    </section>
  );
}
