'use client';

import { Input } from '../../ui/input';
import { SectionCard } from '../../ui/erp/SectionCard';
import { BBSFFormState } from './types';
import { Ruler, Gauge } from 'lucide-react';

type FormErrors = Partial<Record<string, string>>;

interface Props {
  form: BBSFFormState;
  setField: (key: keyof BBSFFormState, value: string) => void;
  tab: 'sanfor1' | 'sanfor2';
  line: number;
  errors?: FormErrors;
  registerRef?: (key: string, el: HTMLElement | null) => void;
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
  borderColor: '#D0DDE6',
  background: 'var(--page-bg)',
  padding: '0 12px',
  fontSize: 14,
  color: 'var(--text-primary)',
  width: '100%',
  fontFamily: 'inherit',
  outline: 'none',
  boxSizing: 'border-box',
};

const READONLY_STYLE: React.CSSProperties = {
  height: 36,
  borderRadius: 'var(--input-radius)',
  border: '1px solid #F3F4F6',
  background: '#F9FAFB',
  padding: '0 12px',
  fontSize: 14,
  color: '#6B7280',
  fontStyle: 'italic',
  width: '100%',
  fontFamily: 'inherit',
  display: 'flex',
  alignItems: 'center',
};

const SELECT_STYLE: React.CSSProperties = {
  ...FIELD_STYLE,
  appearance: 'none',
  cursor: 'pointer',
};

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label style={LABEL_STYLE}>
        {label}
        {required && (
          <span style={{ color: '#DC2626', marginLeft: 3 }} aria-hidden="true">*</span>
        )}
      </label>
      {children}
      {error && (
        <p role="alert" style={{ fontSize: 12, color: '#DC2626', marginTop: 4 }}>
          {error}
        </p>
      )}
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

const SANFOR_MC: Record<number, { sanfor1: string; sanfor2: string }> = {
  1: { sanfor1: 'Sanfor 1', sanfor2: 'Sanfor 2' },
  2: { sanfor1: 'Sanfor 3', sanfor2: 'Sanfor 4' },
  3: { sanfor1: 'Sanfor 5', sanfor2: '' },
};

function Sanfor1Section({
  form,
  setField,
  line,
  errors = {},
  registerRef,
}: {
  form: BBSFFormState;
  setField: (key: keyof BBSFFormState, value: string) => void;
  line: number;
  errors?: FormErrors;
  registerRef?: (key: string, el: HTMLElement | null) => void;
}) {
  const mc = SANFOR_MC[line]?.sanfor1 ?? 'Sanfor';

  return (
    <>
      <SectionCard title={`${mc} — Identity`}>
        <SectionLabel icon={Ruler} text="Identity" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Machine No.">
            <div style={READONLY_STYLE}>{mc}</div>
          </Field>
          <Field label="Shift" required error={errors.sf1_shift}>
            <select
              value={form.sf1_shift}
              onChange={e => setField('sf1_shift', e.target.value)}
              ref={el => registerRef?.('sf1_shift', el as HTMLElement)}
              style={errors.sf1_shift ? {
                ...SELECT_STYLE,
                borderColor: '#DC2626',
                boxShadow: '0 0 0 3px rgba(220, 38, 38, 0.10)',
              } : SELECT_STYLE}
            >
              <option value="">Select...</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
          </Field>
          <Field label="Jam">
            <Input type="text" value={form.sf1_jam}
              onChange={e => setField('sf1_jam', e.target.value)}
              placeholder="Time"
              style={FIELD_STYLE} />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title={`${mc} — Settings`}>
        <SectionLabel icon={Gauge} text="Settings" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {([
            { key: 'sf1_speed',         label: 'Speed',            placeholder: 'e.g. 39-40',  required: true  },
            { key: 'sf1_damping',       label: 'Damping (%)',      placeholder: 'e.g. -8.5',   required: false },
            { key: 'sf1_press',         label: 'Press',            placeholder: 'e.g. 1.3',    required: false },
            { key: 'sf1_tension',       label: 'Tension',          placeholder: 'e.g. 6',      required: false },
            { key: 'sf1_tension_limit', label: 'Tension Limit',   placeholder: 'Limit value', required: false },
            { key: 'sf1_temperatur',    label: 'Temperature (°C)', placeholder: 'e.g. 80',    required: true  },
          ] as const).map(({ key, label, placeholder, required }) => {
            const hasError = Boolean(errors[key]);
            return (
              <Field key={key} label={label} required={required} error={errors[key]}>
                <Input type="text" value={form[key as keyof BBSFFormState] as string}
                  onChange={e => setField(key as keyof BBSFFormState, e.target.value)}
                  placeholder={placeholder}
                  ref={el => registerRef?.(key, el)}
                  error={hasError}
                  style={hasError ? {
                    ...FIELD_STYLE,
                    borderColor: '#DC2626',
                    boxShadow: '0 0 0 3px rgba(220, 38, 38, 0.10)',
                  } : FIELD_STYLE}
                />
              </Field>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard title={`${mc} — Output`}>
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

      <SectionCard title={`${mc} — Notes`}>
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

function Sanfor2Section({
  form,
  setField,
  line,
  errors = {},
  registerRef,
}: {
  form: BBSFFormState;
  setField: (key: keyof BBSFFormState, value: string) => void;
  line: number;
  errors?: FormErrors;
  registerRef?: (key: string, el: HTMLElement | null) => void;
}) {
  const mc = SANFOR_MC[line]?.sanfor2 ?? 'Sanfor';

  return (
    <>
      <SectionCard title={`${mc} — Identity`}>
        <SectionLabel icon={Ruler} text="Identity" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Machine No.">
            <div style={READONLY_STYLE}>{mc}</div>
          </Field>
          <Field label="Shift" required error={errors.sf2_shift}>
            <select
              value={form.sf2_shift}
              onChange={e => setField('sf2_shift', e.target.value)}
              ref={el => registerRef?.('sf2_shift', el as HTMLElement)}
              style={errors.sf2_shift ? {
                ...SELECT_STYLE,
                borderColor: '#DC2626',
                boxShadow: '0 0 0 3px rgba(220, 38, 38, 0.10)',
              } : SELECT_STYLE}
            >
              <option value="">Select...</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
          </Field>
          <Field label="Jam">
            <Input type="text" value={form.sf2_jam}
              onChange={e => setField('sf2_jam', e.target.value)}
              placeholder="Time"
              style={FIELD_STYLE} />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title={`${mc} — Settings`}>
        <SectionLabel icon={Gauge} text="Settings" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {([
            { key: 'sf2_speed',        label: 'Speed',            placeholder: 'e.g. 20-21', required: true  },
            { key: 'sf2_damping',      label: 'Damping (%)',      placeholder: 'e.g. -130',  required: false },
            { key: 'sf2_press',        label: 'Press',            placeholder: 'e.g. 1.2',   required: false },
            { key: 'sf2_tension',      label: 'Tension',          placeholder: 'e.g. 5',      required: false },
            { key: 'sf2_temperatur',    label: 'Temperature (°C)', placeholder: 'e.g. 70',  required: true  },
          ] as const).map(({ key, label, placeholder, required }) => {
            const hasError = Boolean(errors[key]);
            return (
              <Field key={key} label={label} required={required} error={errors[key]}>
                <Input type="text" value={form[key as keyof BBSFFormState] as string}
                  onChange={e => setField(key as keyof BBSFFormState, e.target.value)}
                  placeholder={placeholder}
                  ref={el => registerRef?.(key, el)}
                  error={hasError}
                  style={hasError ? {
                    ...FIELD_STYLE,
                    borderColor: '#DC2626',
                    boxShadow: '0 0 0 3px rgba(220, 38, 38, 0.10)',
                  } : FIELD_STYLE}
                />
              </Field>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard title={`${mc} — Output`}>
        <SectionLabel icon={Gauge} text="Output" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {([
            { key: 'sf2_susut',   label: 'Susut (%)', placeholder: 'e.g. 20-21' },
            { key: 'sf2_awal',    label: 'Awal',      placeholder: 'Initial' },
            { key: 'sf2_akhir',   label: 'Akhir',     placeholder: 'Final' },
            { key: 'sf2_panjang', label: 'Panjang',   placeholder: 'Length' },
          ] as const).map(({ key, label, placeholder }) => (
            <Field key={key} label={label}>
              <Input type="text" value={form[key as keyof BBSFFormState] as string}
                onChange={e => setField(key as keyof BBSFFormState, e.target.value)}
                placeholder={placeholder}
                style={FIELD_STYLE}
              />
            </Field>
          ))}
        </div>
      </SectionCard>

      <SectionCard title={`${mc} — Notes`}>
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

export default function SanforSection({ form, setField, tab, line, errors = {}, registerRef }: Props) {
  return tab === 'sanfor1'
    ? <Sanfor1Section form={form} setField={setField} line={line} errors={errors} registerRef={registerRef} />
    : <Sanfor2Section form={form} setField={setField} line={line} errors={errors} registerRef={registerRef} />;
}
