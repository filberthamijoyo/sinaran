'use client';

import { Input } from '../../ui/input';
import { SectionCard } from '../../ui/erp/SectionCard';
import { BBSFFormState } from './types';
import { Droplet, Thermometer, Gauge, Ruler } from 'lucide-react';

type FormErrors = Partial<Record<string, string>>;

interface Props {
  form: BBSFFormState;
  setField: (key: keyof BBSFFormState, value: string) => void;
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

function SectionLabel({
  icon: Icon,
  text,
}: {
  icon: React.ComponentType<{ size?: number | string; style?: React.CSSProperties }>;
  text: string;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
      <Icon size={13} style={{ color: 'var(--text-muted)' }} />
      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {text}
      </span>
    </div>
  );
}

function InputWithError({
  fieldKey,
  value,
  onChange,
  placeholder,
  errors,
  registerRef,
}: {
  fieldKey: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  errors: FormErrors;
  registerRef?: (key: string, el: HTMLElement | null) => void;
}) {
  const hasError = Boolean(errors[fieldKey]);
  return (
    <Input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      ref={el => registerRef?.(fieldKey, el)}
      error={hasError}
      style={hasError ? {
        ...FIELD_STYLE,
        borderColor: '#DC2626',
        boxShadow: '0 0 0 3px rgba(220, 38, 38, 0.10)',
      } : FIELD_STYLE}
    />
  );
}

export default function WashingSection({ form, setField, line, errors = {}, registerRef }: Props) {
  const machineLabel = `Washing ${line}`;

  return (
    <>
      {/* Identity */}
      <SectionCard title={`Washing ${line} — Identity`}>
        <SectionLabel icon={Ruler} text="Identity" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Machine No.">
            <div style={READONLY_STYLE}>{machineLabel}</div>
          </Field>
          <Field label="Shift" required error={errors.ws_shift}>
            <select
              value={form.ws_shift}
              onChange={e => setField('ws_shift', e.target.value)}
              ref={el => registerRef?.('ws_shift', el as HTMLElement)}
              style={errors.ws_shift ? {
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
          <Field label="Speed" required error={errors.ws_speed}>
            <InputWithError
              fieldKey="ws_speed"
              value={form.ws_speed}
              onChange={v => setField('ws_speed', v)}
              placeholder="e.g. 37"
              errors={errors}
              registerRef={registerRef}
            />
          </Field>
          <Field label="Tekanan Boiler">
            <Input type="text" value={form.ws_tekanan_boiler}
              onChange={e => setField('ws_tekanan_boiler', e.target.value)}
              placeholder="e.g. 2.5"
              style={FIELD_STYLE} />
          </Field>
        </div>
      </SectionCard>

      {/* Chemical Bath 1 */}
      <SectionCard title={`Washing ${line} — Chemical Bath 1`}>
        <SectionLabel icon={Droplet} text="Chemical Bath 1" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Larutan">
            <Input type="text" value={form.ws_larutan_1}
              onChange={e => setField('ws_larutan_1', e.target.value)}
              placeholder="Solution type"
              style={FIELD_STYLE} />
          </Field>
          <Field label="Temperature" required error={errors.ws_temp_1}>
            <InputWithError
              fieldKey="ws_temp_1"
              value={form.ws_temp_1}
              onChange={v => setField('ws_temp_1', v)}
              placeholder="e.g. 95"
              errors={errors}
              registerRef={registerRef}
            />
          </Field>
          <Field label="Press Padder (kg/cm²)">
            <Input type="text" value={form.ws_padder_1}
              onChange={e => setField('ws_padder_1', e.target.value)}
              placeholder="e.g. 3"
              style={FIELD_STYLE} />
          </Field>
          <Field label="Press Dancing">
            <Input type="text" value={form.ws_dancing_1}
              onChange={e => setField('ws_dancing_1', e.target.value)}
              placeholder="e.g. 4"
              style={FIELD_STYLE} />
          </Field>
        </div>
      </SectionCard>

      {/* Chemical Bath 2 */}
      <SectionCard title={`Washing ${line} — Chemical Bath 2`}>
        <SectionLabel icon={Droplet} text="Chemical Bath 2" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Larutan">
            <Input type="text" value={form.ws_larutan_2}
              onChange={e => setField('ws_larutan_2', e.target.value)}
              placeholder="Solution type"
              style={FIELD_STYLE} />
          </Field>
          <Field label="Temperature">
            <Input type="text" value={form.ws_temp_2}
              onChange={e => setField('ws_temp_2', e.target.value)}
              placeholder="e.g. 100"
              style={FIELD_STYLE} />
          </Field>
          <Field label="Press Padder (kg/cm²)">
            <Input type="text" value={form.ws_padder_2}
              onChange={e => setField('ws_padder_2', e.target.value)}
              placeholder="e.g. 4"
              style={FIELD_STYLE} />
          </Field>
          <Field label="Press Dancing">
            <Input type="text" value={form.ws_dancing_2}
              onChange={e => setField('ws_dancing_2', e.target.value)}
              placeholder="e.g. 5"
              style={FIELD_STYLE} />
          </Field>
        </div>
      </SectionCard>

      {/* Machine Settings */}
      <SectionCard title={`Washing ${line} — Machine Settings`}>
        <SectionLabel icon={Gauge} text="Machine Settings" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Skew">
            <Input type="text" value={form.ws_skew}
              onChange={e => setField('ws_skew', e.target.value)}
              placeholder="e.g. 0"
              style={FIELD_STYLE} />
          </Field>
        </div>
      </SectionCard>

      {/* Temperature Zones */}
      <SectionCard title={`Washing ${line} — Temperature Zones`}>
        <SectionLabel icon={Thermometer} text="Temperature Zones (1–6)" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Field key={i} label={`Temp ${i}`}>
              <Input type="text"
                value={form[`ws_temp_${i}_zone` as keyof BBSFFormState] as string}
                onChange={e => setField(`ws_temp_${i}_zone` as keyof BBSFFormState, e.target.value)}
                placeholder="°C"
                style={FIELD_STYLE}
              />
            </Field>
          ))}
        </div>
      </SectionCard>

      {/* Measurements */}
      <SectionCard title={`Washing ${line} — Measurements`}>
        <SectionLabel icon={Ruler} text="Measurements" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Lebar Awal (cm)">
            <Input type="text" value={form.ws_lebar_awal}
              onChange={e => setField('ws_lebar_awal', e.target.value)}
              placeholder="e.g. 150"
              style={FIELD_STYLE} />
          </Field>
          <Field label="Panjang Awal (m)">
            <Input type="text" value={form.ws_panjang_awal}
              onChange={e => setField('ws_panjang_awal', e.target.value)}
              placeholder="e.g. 500"
              style={FIELD_STYLE} />
          </Field>
        </div>
      </SectionCard>

      {/* Problems & Operator */}
      <SectionCard title={`Washing ${line} — Notes`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Permasalahan (Problems)">
            <Input type="text" value={form.ws_permasalahan}
              onChange={e => setField('ws_permasalahan', e.target.value)}
              placeholder="Any issues noted..."
              style={FIELD_STYLE} />
          </Field>
          <Field label="Pelaksana (Operator)">
            <Input type="text" value={form.ws_pelaksana}
              onChange={e => setField('ws_pelaksana', e.target.value)}
              placeholder="Operator name"
              style={FIELD_STYLE} />
          </Field>
        </div>
      </SectionCard>
    </>
  );
}
