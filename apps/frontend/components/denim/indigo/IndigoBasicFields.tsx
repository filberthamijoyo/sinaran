'use client';

import { Input } from '../../ui/input';
import { SectionCard } from '../../ui/erp/SectionCard';
import { IndigoFormState } from './types';
import { SCData } from '../../../lib/types';

interface Props {
  form: IndigoFormState;
  setField: (key: keyof IndigoFormState, value: string) => void;
  sc: SCData | null;
  // Section collapse state
  sectionRunDetailsOpen: boolean;
  sectionDyeBathOpen: boolean;
  sectionMachineOpen: boolean;
  onToggleRunDetails: () => void;
  onToggleDyeBath: () => void;
  onToggleMachine: () => void;
}

const LABEL_STYLE: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 500,
  color: '#374151',
  marginBottom: 6,
};

const FIELD_STYLE: React.CSSProperties = {
  height: 38,
  borderRadius: 8,
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: '#E5E7EB',
  background: '#FFFFFF',
  padding: '0 12px',
  fontSize: 14,
  color: '#0F1E2E',
  width: '100%',
  fontFamily: 'inherit',
  outline: 'none',
  boxSizing: 'border-box',
};

const GRID: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: 16,
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={LABEL_STYLE}>{label}</label>
      {children}
    </div>
  );
}

function AutoField({ label, value }: { label: string; value: string }) {
  return (
    <Field label={label}>
      <div style={{
        backgroundColor: '#F9FAFB',
        border: '1px solid #F3F4F6',
        borderRadius: 8,
        padding: '9px 12px',
        fontSize: 14,
        color: '#6B7280',
        fontStyle: 'italic',
      }}>
        {value || '—'}
      </div>
    </Field>
  );
}

export function IndigoBasicFields({
  form, setField, sc,
  sectionRunDetailsOpen, sectionDyeBathOpen, sectionMachineOpen,
  onToggleRunDetails, onToggleDyeBath, onToggleMachine,
}: Props) {
  return (
    <>
      {/* ── Section 1: Run Details (open by default) ───────────────────── */}
      <SectionCard
        title="Run Details"
        action={
          <button
            type="button"
            onClick={onToggleRunDetails}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: 0, display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>
              {sectionRunDetailsOpen ? 'Hide' : 'Show'}
            </span>
            <span style={{
              fontSize: 13, color: '#9CA3AF',
              transform: sectionRunDetailsOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
              transition: 'transform 200ms ease',
              display: 'inline-block',
            }}>
              ▼
            </span>
          </button>
        }
      >
        {sectionRunDetailsOpen && (
          <>
            <div style={GRID}>
              <AutoField label="NE (Lusi)" value={sc ? `${sc.ne_lusi ?? ''}${sc.ne_k_lusi ? '/' + sc.ne_k_lusi : ''}` : ''} />
              <AutoField label="P (Panjang Tarikan)" value={sc?.p_kons ?? ''} />
              <AutoField label="TE" value={sc?.te != null ? String(sc.te) : ''} />
            </div>
            <div style={{ ...GRID, marginTop: 16 }}>
            <Field label="Date">
              <Input type="date" value={form.tgl}
                onChange={e => setField('tgl', e.target.value)}
                style={FIELD_STYLE} />
            </Field>
            <Field label="Start Time">
              <Input type="time" value={form.start}
                onChange={e => setField('start', e.target.value)}
                style={FIELD_STYLE} />
            </Field>
            <Field label="Stop Time">
              <Input type="time" value={form.stop}
                onChange={e => setField('stop', e.target.value)}
                style={FIELD_STYLE} />
            </Field>
            <Field label="Machine No. (MC)">
              <Input type="number" value={form.mc}
                onChange={e => setField('mc', e.target.value)}
                placeholder="e.g. 1"
                style={FIELD_STYLE} />
            </Field>
            <Field label="Speed">
              <Input type="number" step="0.01" value={form.speed}
                onChange={e => setField('speed', e.target.value)}
                placeholder="e.g. 50"
                style={FIELD_STYLE} />
            </Field>
            <Field label="BB">
              <Input type="number" step="0.01" value={form.bb}
                onChange={e => setField('bb', e.target.value)}
                placeholder="e.g. 10"
                style={FIELD_STYLE} />
            </Field>
            <Field label="BAK CELUP">
              <Input type="number" value={form.bak_celup}
                onChange={e => setField('bak_celup', e.target.value)}
                placeholder="e.g. 4"
                style={FIELD_STYLE} />
            </Field>
            <Field label="Total Meters Output">
              <Input type="number" value={form.total_meters}
                onChange={e => setField('total_meters', e.target.value)}
                placeholder="e.g. 15000"
                style={FIELD_STYLE} />
            </Field>
            </div>
          </>
        )}
      </SectionCard>

      {/* ── Section 2: Process Parameters (collapsed by default) ────────── */}
      <SectionCard
        title="Process Parameters"
        action={
          <button
            type="button"
            onClick={onToggleDyeBath}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: 0, display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>
              {sectionDyeBathOpen ? 'Hide' : 'Show'}
            </span>
            <span style={{
              fontSize: 13, color: '#9CA3AF',
              transform: sectionDyeBathOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
              transition: 'transform 200ms ease',
              display: 'inline-block',
            }}>
              ▼
            </span>
          </button>
        }
      >
        {sectionDyeBathOpen && (
          <div style={GRID}>
            <Field label="P">
              <Input type="number" step="0.01" value={form.p}
                onChange={e => setField('p', e.target.value)}
                placeholder="e.g. 0.8"
                style={FIELD_STYLE} />
            </Field>
            <Field label="TE">
              <Input type="number" step="0.01" value={form.te}
                onChange={e => setField('te', e.target.value)}
                placeholder="e.g. 4.5"
                style={FIELD_STYLE} />
            </Field>
            <Field label="Number of Baths (Bak)">
              <Input type="number" value={form.bak_count}
                onChange={e => setField('bak_count', e.target.value)}
                placeholder="e.g. 16"
                style={FIELD_STYLE} />
            </Field>
            <Field label="Indigo Concentration (g/L)">
              <Input type="number" step="0.01" value={form.indigo_conc}
                onChange={e => setField('indigo_conc', e.target.value)}
                placeholder="e.g. 20"
                style={FIELD_STYLE} />
            </Field>
            <Field label="Indigo Bath Number">
              <Input type="number" value={form.indigo_bak}
                onChange={e => setField('indigo_bak', e.target.value)}
                placeholder="e.g. 1"
                style={FIELD_STYLE} />
            </Field>
            <div>
              <label style={LABEL_STYLE}>Has Sulfur Bath?</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 38 }}>
                <input
                  type="checkbox"
                  checked={form.has_sulfur}
                  onChange={e => setField('has_sulfur', (e.target.checked as unknown) as string)}
                  style={{ width: 16, height: 16, accentColor: '#1D4ED8' }}
                />
                <span style={{ fontSize: 14, color: '#374151' }}>Yes</span>
              </div>
            </div>
            {form.has_sulfur && (
              <>
                <Field label="Sulfur Concentration">
                  <Input type="number" step="0.01" value={form.sulfur_conc}
                    onChange={e => setField('sulfur_conc', e.target.value)}
                    placeholder="e.g. 50"
                    style={FIELD_STYLE} />
                </Field>
                <Field label="Sulfur Bath Number">
                  <Input type="number" value={form.sulfur_bak}
                    onChange={e => setField('sulfur_bak', e.target.value)}
                    placeholder="e.g. 1"
                    style={FIELD_STYLE} />
                </Field>
              </>
            )}
          </div>
        )}
      </SectionCard>

      {/* ── Section 3: Machine Parameters (collapsed by default) ─────── */}
      <SectionCard
        title="Machine Parameters"
        action={
          <button
            type="button"
            onClick={onToggleMachine}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: 0, display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>
              {sectionMachineOpen ? 'Hide' : 'Show'}
            </span>
            <span style={{
              fontSize: 13, color: '#9CA3AF',
              transform: sectionMachineOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
              transition: 'transform 200ms ease',
              display: 'inline-block',
            }}>
              ▼
            </span>
          </button>
        }
      >
        {sectionMachineOpen && (
          <>
            <div style={GRID}>
              <Field label="Konst IDG">
                <Input type="number" step="0.01" value={form.konst_idg}
                  onChange={e => setField('konst_idg', e.target.value)}
                  placeholder="e.g. 1.0"
                  style={FIELD_STYLE} />
              </Field>
              <Field label="Konst Sulfur">
                <Input type="number" step="0.01" value={form.konst_sulfur}
                  onChange={e => setField('konst_sulfur', e.target.value)}
                  placeholder="e.g. 1.2"
                  style={FIELD_STYLE} />
              </Field>
              <Field label="Visc">
                <Input type="number" step="0.01" value={form.visc}
                  onChange={e => setField('visc', e.target.value)}
                  placeholder="e.g. 12"
                  style={FIELD_STYLE} />
              </Field>
              <Field label="REF">
                <Input type="number" step="0.01" value={form.ref}
                  onChange={e => setField('ref', e.target.value)}
                  placeholder="e.g. 0.85"
                  style={FIELD_STYLE} />
              </Field>
              <Field label="Size Box">
                <Input type="number" step="0.01" value={form.size_box}
                  onChange={e => setField('size_box', e.target.value)}
                  placeholder="e.g. 60"
                  style={FIELD_STYLE} />
              </Field>
              <Field label="Scoring">
                <Input type="number" step="0.01" value={form.scoring}
                  onChange={e => setField('scoring', e.target.value)}
                  placeholder="e.g. 45"
                  style={FIELD_STYLE} />
              </Field>
              <Field label="JetSize">
                <Input type="number" step="0.01" value={form.jetsize}
                  onChange={e => setField('jetsize', e.target.value)}
                  placeholder="e.g. 3.5"
                  style={FIELD_STYLE} />
              </Field>
            </div>

            {/* Bak Temperatures sub-section */}
            <div style={{ marginTop: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
                Bak Temperatures (Bak 1 – 16)
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 12 }}>
                {([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16] as const).map(i => (
                  <Field key={`bak_${i}`} label={`Bak ${i}`}>
                    <Input type="number" step="0.01"
                      value={form[`bak_${i}` as keyof IndigoFormState] as string}
                      onChange={e => setField(`bak_${i}` as keyof IndigoFormState, e.target.value)}
                      placeholder="°C"
                      style={FIELD_STYLE} />
                  </Field>
                ))}
              </div>
            </div>
          </>
        )}
      </SectionCard>

      {/* ── Notes (always visible, not a numbered section) ──────────────── */}
      <SectionCard title="Notes">
        <div>
          <label style={LABEL_STYLE}>Notes</label>
          <textarea
            value={form.keterangan}
            onChange={e => setField('keterangan', e.target.value)}
            placeholder="Additional notes..."
            style={{
              width: '100%',
              minHeight: 80,
              padding: '9px 12px',
              fontSize: 14,
              color: '#0F1E2E',
              borderRadius: 8,
              border: '1px solid #E5E7EB',
              background: '#FFFFFF',
              fontFamily: 'inherit',
              resize: 'vertical',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </SectionCard>
    </>
  );
}
