'use client';

import { useState } from 'react';
import { SectionCard } from '../../../ui/erp/SectionCard';
import { IndigoRun } from './types';
import { format } from 'date-fns';

interface IndigoSectionProps {
  indigo: IndigoRun | null;
  kp: string;
  onEdit?: () => void;
}

const formatDate = (iso: string | null) => {
  if (!iso) return '—';
  try { return format(new Date(iso), 'd MMM yyyy'); }
  catch { return '—'; }
};

export function IndigoSection({ indigo, onEdit }: IndigoSectionProps) {
  const [showFormula, setShowFormula] = useState(false);
  const hasData = indigo != null;

  const action = hasData && onEdit ? (
    <button
      onClick={onEdit}
      style={{
        background:    '#FFFFFF',
        border:       '1px solid #E5E7EB',
        borderRadius:  8,
        height:       32,
        padding:      '0 12px',
        fontSize:     12,
        color:        '#374151',
        cursor:       'pointer',
        display:      'flex',
        alignItems:   'center',
        transition:   'background 150ms',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F9FAFB'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#FFFFFF'; }}
    >Edit</button>
  ) : undefined;

  return (
    <SectionCard
      title="Indigo"
      action={action}
      variant={hasData ? 'default' : 'dimmed'}
    >
      {!hasData ? (
        <>
          <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 8 }}>
            This stage has not started yet
          </p>
          <span style={{
            background:   '#F3F4F6',
            color:      '#9CA3AF',
            borderRadius: 6,
            padding:   '2px 8px',
            fontSize:   11,
            fontWeight: 500,
          }}>Indigo</span>
        </>
      ) : (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 16,
          }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9CA3AF', marginBottom: 4 }}>Date</p>
              <p style={{ fontSize: 14, fontWeight: 500, color: '#0F1E2E' }}>{formatDate(indigo.tgl) || '—'}</p>
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9CA3AF', marginBottom: 4 }}>Machine</p>
              <p style={{ fontSize: 14, fontWeight: 500, color: '#0F1E2E' }}>{indigo.mc || '—'}</p>
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9CA3AF', marginBottom: 4 }}>Speed (m/min)</p>
              <p style={{ fontSize: 14, fontWeight: 500, color: '#0F1E2E' }}>{indigo.speed || '—'}</p>
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9CA3AF', marginBottom: 4 }}>Bak Celup</p>
              <p style={{ fontSize: 14, fontWeight: 500, color: '#0F1E2E' }}>{indigo.bak_celup || '—'}</p>
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9CA3AF', marginBottom: 4 }}>Indigo (g/L)</p>
              <p style={{ fontSize: 14, fontWeight: 500, color: '#0F1E2E' }}>{indigo.indigo || '—'}</p>
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9CA3AF', marginBottom: 4 }}>Caustic (g/L)</p>
              <p style={{ fontSize: 14, fontWeight: 500, color: '#0F1E2E' }}>{indigo.caustic || '—'}</p>
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9CA3AF', marginBottom: 4 }}>Hydro (g/L)</p>
              <p style={{ fontSize: 14, fontWeight: 500, color: '#0F1E2E' }}>{indigo.hydro || '—'}</p>
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9CA3AF', marginBottom: 4 }}>Temp Dryer (°C)</p>
              <p style={{ fontSize: 14, fontWeight: 500, color: '#0F1E2E' }}>{indigo.temp_dryer || '—'}</p>
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9CA3AF', marginBottom: 4 }}>Moisture Mahlo</p>
              <p style={{ fontSize: 14, fontWeight: 500, color: '#0F1E2E' }}>{indigo.moisture_mahlo || '—'}</p>
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9CA3AF', marginBottom: 4 }}>Strength</p>
              <p style={{ fontSize: 14, fontWeight: 500, color: '#0F1E2E' }}>{indigo.strength || '—'}</p>
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9CA3AF', marginBottom: 4 }}>Elongasi</p>
              <p style={{ fontSize: 14, fontWeight: 500, color: '#0F1E2E' }}>{indigo.elongasi_idg || '—'}</p>
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9CA3AF', marginBottom: 4 }}>BB</p>
              <p style={{ fontSize: 14, fontWeight: 500, color: '#0F1E2E' }}>{indigo.bb || '—'}</p>
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9CA3AF', marginBottom: 4 }}>P</p>
              <p style={{ fontSize: 14, fontWeight: 500, color: '#0F1E2E' }}>{indigo.p || '—'}</p>
            </div>
          </div>

          <button
            onClick={() => setShowFormula(v => !v)}
            style={{
              background: 'transparent',
              border:    'none',
              color:     '#4A7A9B',
              fontSize:  13,
              cursor:    'pointer',
              padding:   0,
              marginTop: 12,
            }}
          >
            {showFormula ? '▼ Hide' : '▶ Full Formula'}
          </button>

          {showFormula && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 16,
              marginTop: 12,
            }}>
              {[
                ['Bak Sulfur', indigo.bak_sulfur],
                ['Konst Indigo', indigo.konst_idg],
                ['Konst Sulfur', indigo.konst_sulfur],
                ['Viscosity', indigo.visc],
                ['Refraktometer', indigo.ref],
                ['Scoring', indigo.scoring],
                ['Size Box', indigo.size_box],
                ['Jetsize', indigo.jetsize],
                ['Temp Mid Dryer', indigo.temp_mid_dryer],
                ['Temp Size Box 1', indigo.temp_size_box_1],
                ['Temp Size Box 2', indigo.temp_size_box_2],
                ['Size Box 1', indigo.size_box_1],
                ['Size Box 2', indigo.size_box_2],
                ['Squeezing Roll 1', indigo.squeezing_roll_1],
                ['Squeezing Roll 2', indigo.squeezing_roll_2],
                ['Immersion Roll', indigo.immersion_roll],
                ['Dryer', indigo.dryer],
                ['Take Off', indigo.take_off],
                ['Winding', indigo.winding],
                ['Press Beam', indigo.press_beam],
                ['Hardness', indigo.hardness],
                ['Unwinder', indigo.unwinder],
                ['Dyeing Tens Wash', indigo.dyeing_tens_wash],
                ['Dyeing Tens Warna', indigo.dyeing_tens_warna],
                ['MC IDG', indigo.mc_idg],
                ['Tenacity', indigo.tenacity],
                ['Polisize HS', indigo.polisize_hs],
                ['Polisize 1/2', indigo.polisize_1_2],
                ['Armosize', indigo.armosize],
                ['Solopol', indigo.solopol],
                ['Serawet', indigo.serawet],
                ['Primasol', indigo.primasol],
                ['Cottoclarin', indigo.cottoclarin],
                ['Setamol', indigo.setamol],
                ['Granular', indigo.granular],
                ['Indigo Conc', indigo.indigo_conc],
                ['Sulfur Bak', indigo.sulfur_bak],
                ['Sulfur Conc', indigo.sulfur_conc],
                ['Keterangan', indigo.keterangan],
              ].map(([label, value]) => (
                <div key={label as string}>
                  <p style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9CA3AF', marginBottom: 4 }}>{label as string}</p>
                  <p style={{ fontSize: 14, fontWeight: 500, color: '#0F1E2E' }}>{value != null ? value : '—'}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </SectionCard>
  );
}
