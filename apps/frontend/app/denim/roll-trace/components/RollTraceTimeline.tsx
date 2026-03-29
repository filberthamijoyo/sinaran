'use client';

import { Box, Scissors, Droplets, Layers, Scale, Activity, CheckCircle } from 'lucide-react';
import { StageCard } from './StageCard';
import type { RollTraceData } from '../types';

interface RollTraceTimelineProps {
  data: RollTraceData | null;
}

export function RollTraceTimeline({ data }: RollTraceTimelineProps) {
  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* SN Info */}
      <div 
        className="rounded-[32px] p-6"
        style={{
        }}
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm" style={{ color: '#6B7280' }}>Serial Number</p>
            <p className="text-2xl font-mono" style={{ color: '#3D4852' }}>{data.sn}</p>
          </div>
          {data.decoded && (
            <div className="text-right">
              <p className="text-sm" style={{ color: '#6B7280' }}>Decoded</p>
              <p className="text-lg" style={{ color: '#D97706' }}>
                Machine: {data.decoded.machine} | Beam: {data.decoded.beam} | Lot: {data.decoded.lot}
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-8 top-8 bottom-8 w-0.5" style={{ background: 'rgb(163 177 198 / 0.3)' }} />
        
        <div className="space-y-4">
          {/* Sales Contract */}
          <div className="flex gap-4">
            <div className="relative z-10">
              <StageCard
                title="Sales Contract"
                icon={Box}
                data={data.salesContract as Record<string, unknown> | null}
                details={[
                  { label: 'KP', value: data.salesContract?.kp },
                  { label: 'Item', value: data.salesContract?.item },
                  { label: 'Quantity', value: data.salesContract?.quantity },
                  { label: 'Delivery', value: data.salesContract?.delivery_date ? new Date(data.salesContract.delivery_date).toLocaleDateString() : null },
                ]}
              />
            </div>
          </div>
          
          {/* Warping */}
          <div className="flex gap-4">
            <div className="relative z-10">
              <StageCard
                title="Warping"
                icon={Layers}
                data={data.warping as Record<string, unknown> | null}
                details={[
                  { label: 'KP', value: data.warping?.kp },
                  { label: 'Date', value: data.warping?.tgl ? new Date(data.warping.tgl).toLocaleDateString() : null },
                  { label: 'Total Beam', value: data.warping?.total_beams },
                ]}
              />
            </div>
          </div>
          
          {/* Warping Beam */}
          {data.beam && (
            <div className="flex gap-4">
              <div className="relative z-10">
                <StageCard
                  title="Warping Beam"
                  icon={Scale}
                  data={data.beam as unknown as Record<string, unknown>}
                  details={[
                    { label: 'Beam Number', value: data.beam?.beam_number },
                    { label: 'Weight (kg)', value: data.beam?.weight_kg, highlight: true },
                    { label: 'Length (m)', value: data.beam?.length_meters },
                  ]}
                />
              </div>
            </div>
          )}
          
          {/* Indigo */}
          <div className="flex gap-4">
            <div className="relative z-10">
              <StageCard
                title="Indigo"
                icon={Droplets}
                data={data.indigoRun as Record<string, unknown> | null}
                details={[
                  { label: 'KP', value: data.indigoRun?.kp },
                  { label: 'Date', value: data.indigoRun?.tanggal ? new Date(data.indigoRun.tanggal).toLocaleDateString() : null },
                  { label: 'BB (kg)', value: data.indigoRun?.bb, highlight: true },
                ]}
              />
            </div>
          </div>
          
          {/* Weaving */}
          <div className="flex gap-4">
            <div className="relative z-10">
              <StageCard
                title="Weaving"
                icon={Activity}
                data={(data.weavingRecords.length > 0 ? data.weavingRecords[0] : null) as Record<string, unknown> | null}
                details={[
                  { label: 'Machines', value: data.weavingRecords.length },
                  { label: 'Best Efficiency', value: data.weavingRecords[0]?.efficiency ? `${data.weavingRecords[0].efficiency.toFixed(1)}%` : null },
                ]}
              />
            </div>
          </div>
          
          {/* Inspect Gray */}
          <div className="flex gap-4">
            <div className="relative z-10">
              <StageCard
                title="Inspect Gray"
                icon={Scissors}
                data={data.inspectGray as Record<string, unknown> | null}
                details={[
                  { label: 'Machine', value: data.inspectGray?.mc },
                  { label: 'Beam', value: data.inspectGray?.bm },
                  { label: 'Width (cm)', value: data.inspectGray?.lebar, highlight: true },
                  { label: 'Weight (kg)', value: data.inspectGray?.berat },
                  { label: 'Grade', value: data.inspectGray?.grade },
                ]}
              />
            </div>
          </div>
          
          {/* BBSF Washing */}
          {data.bbsfWashing.length > 0 && (
            <div className="flex gap-4">
              <div className="relative z-10">
                <StageCard
                  title="BBSF Washing"
                  icon={Droplets}
                  data={data.bbsfWashing[0] as unknown as Record<string, unknown>}
                  details={[
                    { label: 'Date', value: data.bbsfWashing[0]?.tgl ? new Date(data.bbsfWashing[0].tgl).toLocaleDateString() : null },
                    { label: 'Speed', value: data.bbsfWashing[0]?.speed },
                    { label: 'Temp', value: data.bbsfWashing[0]?.temp_1 ? `${data.bbsfWashing[0].temp_1}°C` : null },
                  ]}
                />
              </div>
            </div>
          )}
          
          {/* Inspect Finish */}
          <div className="flex gap-4">
            <div className="relative z-10">
              <StageCard
                title="Inspect Finish"
                icon={CheckCircle}
                data={(data.inspectFinish.length > 0 ? data.inspectFinish[0] : null) as Record<string, unknown> | null}
                details={[
                  { label: 'Rolls Found', value: data.inspectFinish.length },
                  { label: 'Width (cm)', value: data.inspectFinish[0]?.lebar, highlight: true },
                  { label: 'Weight (kg)', value: data.inspectFinish[0]?.kg, highlight: true },
                  { label: 'Shrinkage (%)', value: data.inspectFinish[0]?.susut_lusi, highlight: true },
                  { label: 'Grade', value: data.inspectFinish[0]?.grade },
                  { label: 'Points', value: data.inspectFinish[0]?.point },
                ]}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
