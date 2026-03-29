'use client';

import { Input } from '../../ui/input';
import { SectionCard } from '../../ui/erp/SectionCard';
import { IndigoFormState } from './types';

interface Props {
  form: IndigoFormState;
  setField: (key: keyof IndigoFormState, value: string) => void;
  showChemistry: boolean;
  setShowChemistry: (v: boolean) => void;
}

const LABEL_STYLE: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 500,
  color: 'var(--text-secondary)',
  marginBottom: 6,
};

const FIELD_STYLE: React.CSSProperties = {
  height: 36,
  borderRadius: 'var(--input-radius)',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'var(--border)',
  background: 'var(--page-bg)',
  padding: '0 12px',
  fontSize: 14,
  color: 'var(--text-primary)',
  width: '100%',
  fontFamily: 'inherit',
  outline: 'none',
  boxSizing: 'border-box',
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={LABEL_STYLE}>{label}</label>
      {children}
    </div>
  );
}

export function IndigoBasicFields({ form, setField, showChemistry, setShowChemistry }: Props) {
  return (
    <>
      {/* Section 1 — Run Details */}
      <SectionCard title="Run Details" subtitle="Date and time for this production run">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>
      </SectionCard>

      {/* Section 2 — Rope Details */}
      <SectionCard title="Rope Details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Number of Ropes">
            <Input type="number" value={form.jumlah_rope}
              onChange={e => setField('jumlah_rope', e.target.value)}
              placeholder="e.g. 12"
              style={FIELD_STYLE} />
          </Field>
          <Field label="Length per Rope (m)">
            <Input type="number" step="0.01" value={form.panjang_rope}
              onChange={e => setField('panjang_rope', e.target.value)}
              placeholder="e.g. 1500"
              style={FIELD_STYLE} />
          </Field>
        </div>
      </SectionCard>

      {/* Section 3 — Process Parameters */}
      <SectionCard title="Process Parameters">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Machine No.">
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
          <Field label="Bak Celup">
            <Input type="number" value={form.bak_celup}
              onChange={e => setField('bak_celup', e.target.value)}
              placeholder="e.g. 4"
              style={FIELD_STYLE} />
          </Field>
          <Field label="BB">
            <Input type="number" step="0.01" value={form.bb}
              onChange={e => setField('bb', e.target.value)}
              placeholder="e.g. 10"
              style={FIELD_STYLE} />
          </Field>
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
        </div>
      </SectionCard>

      {/* Section 4 — Dye Bath Indigo */}
      <SectionCard title="Dye Bath — Indigo">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>
      </SectionCard>

      {/* Section 5 — Dye Bath Sulfur */}
      <SectionCard title="Dye Bath — Sulfur">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <input
            type="checkbox"
            checked={form.has_sulfur}
            onChange={e => setField('has_sulfur', e.target.checked as unknown as string)}
            style={{ width: 16, height: 16, accentColor: 'var(--primary)' }}
          />
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Has Sulfur Bath?</span>
        </div>

        {form.has_sulfur && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6 border-l-2 border-[var(--border)]">
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
          </div>
        )}
      </SectionCard>

      {/* Section 6 — Machine Parameters (from spectro / production settings) */}
      <SectionCard title="Machine Parameters">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </SectionCard>

      {/* Section 7 — Output */}
      <SectionCard title="Output">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Total Meters Output">
            <Input type="number" value={form.total_meters}
              onChange={e => setField('total_meters', e.target.value)}
              placeholder="e.g. 15000"
              style={FIELD_STYLE} />
          </Field>
          {/* Notes — full width */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={LABEL_STYLE}>Notes</label>
            <textarea
              value={form.keterangan}
              onChange={e => setField('keterangan', e.target.value)}
              placeholder="Additional notes..."
              style={{
                width: '100%',
                minHeight: 80,
                padding: '8px 12px',
                fontSize: 14,
                color: 'var(--text-primary)',
                borderRadius: 'var(--input-radius)',
                border: '1px solid var(--border)',
                background: 'var(--page-bg)',
                fontFamily: 'inherit',
                resize: 'vertical',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>
      </SectionCard>

      {/* Section 8 — Full Chemistry (collapsible header) */}
      <SectionCard title="Full Chemistry">
        <button
          type="button"
          onClick={() => setShowChemistry(!showChemistry)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <span style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 500 }}>
            {showChemistry ? 'Hide chemistry fields' : 'Show chemistry fields'}
          </span>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {showChemistry ? '\u25B2' : '\u25BC'}
          </span>
        </button>
      </SectionCard>
    </>
  );
}
