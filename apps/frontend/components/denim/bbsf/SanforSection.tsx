'use client';

import { Input } from '../../ui/input';
import { SectionCard } from '../../ui/erp/SectionCard';
import { BBSFFormState } from './types';
import { Ruler, Gauge } from 'lucide-react';

interface Props {
  form: BBSFFormState;
  setField: (key: keyof BBSFFormState, value: string) => void;
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
  border: '1px solid var(--border)',
  background: 'var(--page-bg)',
  padding: '0 12px',
  fontSize: 14,
  color: 'var(--text-primary)',
  width: '100%',
  fontFamily: 'inherit',
  outline: 'none',
  boxSizing: 'border-box',
};

const SELECT_STYLE: React.CSSProperties = {
  ...FIELD_STYLE,
  appearance: 'none',
  cursor: 'pointer',
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={LABEL_STYLE}>{label}</label>
      {children}
    </div>
  );
}

function SectionLabel({ icon: Icon, text }: { icon: React.ComponentType<{ size?: number | string; style?: React.CSSProperties }>; text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
      <Icon size={13} style={{ color: 'var(--text-muted)' }} />
      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {text}
      </span>
    </div>
  );
}

function Sanfor1Section({ form, setField }: Props) {
  return (
    <>
      <SectionCard title="Sanfor 1 — Identity">
        <SectionLabel icon={Ruler} text="Identity" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Shift">
            <select
              value={form.sf1_shift}
              onChange={e => setField('sf1_shift', e.target.value)}
              style={SELECT_STYLE}
            >
              <option value="">Select...</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
          </Field>
          <Field label="Machine No.">
            <Input type="text" value={form.sf1_mc}
              onChange={e => setField('sf1_mc', e.target.value)}
              placeholder="e.g. 1"
              style={FIELD_STYLE} />
          </Field>
          <Field label="Jam">
            <Input type="text" value={form.sf1_jam}
              onChange={e => setField('sf1_jam', e.target.value)}
              placeholder="Time"
              style={FIELD_STYLE} />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="Sanfor 1 — Settings">
        <SectionLabel icon={Gauge} text="Settings" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {([
            { key: 'sf1_speed',        label: 'Speed',          placeholder: 'e.g. 39-40' },
            { key: 'sf1_damping',      label: 'Damping (%)',    placeholder: 'e.g. -8.5' },
            { key: 'sf1_press',        label: 'Press',           placeholder: 'e.g. 1.3' },
            { key: 'sf1_tension',      label: 'Tension',         placeholder: 'e.g. 6' },
            { key: 'sf1_tension_limit',label: 'Tension Limit',  placeholder: 'Limit value' },
            { key: 'sf1_temperatur',   label: 'Temperature (°C)',placeholder: 'e.g. 80' },
          ] as const).map(({ key, label, placeholder }) => (
            <Field key={key} label={label}>
              <Input type="text" value={form[key as keyof BBSFFormState] as string}
                onChange={e => setField(key as keyof BBSFFormState, e.target.value)}
                placeholder={placeholder}
                style={FIELD_STYLE} />
            </Field>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Sanfor 1 — Output">
        <SectionLabel icon={Gauge} text="Output" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Susut (%)">
            <Input type="text" value={form.sf1_susut}
              onChange={e => setField('sf1_susut', e.target.value)}
              placeholder="e.g. 120"
              style={FIELD_STYLE} />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="Sanfor 1 — Notes">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Permasalahan (Problems)">
            <Input type="text" value={form.sf1_permasalahan}
              onChange={e => setField('sf1_permasalahan', e.target.value)}
              placeholder="Any issues noted..."
              style={FIELD_STYLE} />
          </Field>
          <Field label="Pelaksana (Operator)">
            <Input type="text" value={form.sf1_pelaksana}
              onChange={e => setField('sf1_pelaksana', e.target.value)}
              placeholder="Operator name"
              style={FIELD_STYLE} />
          </Field>
        </div>
      </SectionCard>
    </>
  );
}

function Sanfor2Section({ form, setField }: Props) {
  return (
    <>
      <SectionCard title="Sanfor 2 — Identity">
        <SectionLabel icon={Ruler} text="Identity" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Shift">
            <select
              value={form.sf2_shift}
              onChange={e => setField('sf2_shift', e.target.value)}
              style={SELECT_STYLE}
            >
              <option value="">Select...</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
          </Field>
          <Field label="Machine No.">
            <Input type="text" value={form.sf2_mc}
              onChange={e => setField('sf2_mc', e.target.value)}
              placeholder="e.g. 1"
              style={FIELD_STYLE} />
          </Field>
          <Field label="Jam">
            <Input type="text" value={form.sf2_jam}
              onChange={e => setField('sf2_jam', e.target.value)}
              placeholder="Time"
              style={FIELD_STYLE} />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="Sanfor 2 — Settings">
        <SectionLabel icon={Gauge} text="Settings" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {([
            { key: 'sf2_speed',    label: 'Speed',          placeholder: 'e.g. 20-21' },
            { key: 'sf2_damping',  label: 'Damping (%)',    placeholder: 'e.g. -130' },
            { key: 'sf2_press',    label: 'Press',          placeholder: 'e.g. 1.2' },
            { key: 'sf2_tension', label: 'Tension',        placeholder: 'e.g. 5' },
            { key: 'sf2_temperatur',label: 'Temperature (°C)',placeholder: 'e.g. 70' },
          ] as const).map(({ key, label, placeholder }) => (
            <Field key={key} label={label}>
              <Input type="text" value={form[key as keyof BBSFFormState] as string}
                onChange={e => setField(key as keyof BBSFFormState, e.target.value)}
                placeholder={placeholder}
                style={FIELD_STYLE} />
            </Field>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Sanfor 2 — Output">
        <SectionLabel icon={Gauge} text="Output" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {([
            { key: 'sf2_susut',  label: 'Susut (%)',  placeholder: 'e.g. 20-21' },
            { key: 'sf2_awal',   label: 'Awal',       placeholder: 'Initial' },
            { key: 'sf2_akhir',  label: 'Akhir',      placeholder: 'Final' },
            { key: 'sf2_panjang', label: 'Panjang',    placeholder: 'Length' },
          ] as const).map(({ key, label, placeholder }) => (
            <Field key={key} label={label}>
              <Input type="text" value={form[key as keyof BBSFFormState] as string}
                onChange={e => setField(key as keyof BBSFFormState, e.target.value)}
                placeholder={placeholder}
                style={FIELD_STYLE} />
            </Field>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Sanfor 2 — Notes">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Permasalahan (Problems)">
            <Input type="text" value={form.sf2_permasalahan}
              onChange={e => setField('sf2_permasalahan', e.target.value)}
              placeholder="Any issues noted..."
              style={FIELD_STYLE} />
          </Field>
          <Field label="Pelaksana (Operator)">
            <Input type="text" value={form.sf2_pelaksana}
              onChange={e => setField('sf2_pelaksana', e.target.value)}
              placeholder="Operator name"
              style={FIELD_STYLE} />
          </Field>
        </div>
      </SectionCard>
    </>
  );
}

export default function SanforSection({ form, setField }: Props) {
  return (
    <>
      <Sanfor1Section form={form} setField={setField} />
      <Sanfor2Section form={form} setField={setField} />
    </>
  );
}
