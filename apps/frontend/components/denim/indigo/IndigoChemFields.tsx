'use client';

import { Input } from '../../ui/input';
import { SectionCard } from '../../ui/erp/SectionCard';
import { IndigoFormState } from './types';

interface Props {
  form: IndigoFormState;
  setField: (key: keyof IndigoFormState, value: string) => void;
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

function num(key: keyof IndigoFormState, form: IndigoFormState): string {
  return form[key] as string;
}

function Field3({ label, form, setField, fieldKey }: {
  label: string; form: IndigoFormState;
  setField: (key: keyof IndigoFormState, value: string) => void;
  fieldKey: keyof IndigoFormState;
}) {
  return (
    <Field label={label}>
      <Input type="number" step="0.01"
        value={num(fieldKey, form)}
        onChange={e => setField(fieldKey, e.target.value)}
        style={FIELD_STYLE}
      />
    </Field>
  );
}

export function IndigoChemFields({ form, setField }: Props) {
  return (
    <>
      {/* Section A — Lab Results */}
      <SectionCard title="Lab Results">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="MC IDG">
            <Input type="text" value={form.mc_idg}
              onChange={e => setField('mc_idg', e.target.value)}
              placeholder="e.g. M-001"
              style={FIELD_STYLE} />
          </Field>
          <Field3 label="Strength" form={form} setField={setField} fieldKey="strength" />
          <Field3 label="Elongasi IDG (%)" form={form} setField={setField} fieldKey="elongasi_idg" />
          <Field3 label="CV% (%)" form={form} setField={setField} fieldKey="cv_pct" />
          <Field3 label="Tenacity" form={form} setField={setField} fieldKey="tenacity" />
        </div>
      </SectionCard>

      {/* Section B — Chemical Usage: Sizing */}
      <SectionCard title="Chemical Usage — Sizing">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field3 label="Polisize HS" form={form} setField={setField} fieldKey="polisize_hs" />
          <Field3 label="Polisize 1.2" form={form} setField={setField} fieldKey="polisize_1_2" />
          <Field3 label="Armosize" form={form} setField={setField} fieldKey="armosize" />
          <Field3 label="Armosize 1.1" form={form} setField={setField} fieldKey="armosize_1_1" />
          <Field3 label="Armosize 1.2" form={form} setField={setField} fieldKey="armosize_1_2" />
          <Field3 label="Armosize 1.3" form={form} setField={setField} fieldKey="armosize_1_3" />
          <Field3 label="Armosize 1.5" form={form} setField={setField} fieldKey="armosize_1_5" />
          <Field3 label="Armosize 1.7" form={form} setField={setField} fieldKey="armosize_1_7" />
          <Field3 label="QUQLAXE" form={form} setField={setField} fieldKey="quqlaxe" />
          <Field3 label="Armo C" form={form} setField={setField} fieldKey="armo_c" />
          <Field3 label="Vit E" form={form} setField={setField} fieldKey="vit_e" />
          <Field3 label="Armo D" form={form} setField={setField} fieldKey="armo_d" />
          <Field3 label="Tapioca" form={form} setField={setField} fieldKey="tapioca" />
          <Field3 label="A 308" form={form} setField={setField} fieldKey="a_308" />
        </div>
      </SectionCard>

      {/* Section C — Chemical Usage: Dyeing */}
      <SectionCard title="Chemical Usage — Dyeing">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field3 label="Indigo" form={form} setField={setField} fieldKey="indigo" />
          <Field3 label="Caustic" form={form} setField={setField} fieldKey="caustic" />
          <Field3 label="Hydro" form={form} setField={setField} fieldKey="hydro" />
          <Field3 label="Solopol" form={form} setField={setField} fieldKey="solopol" />
          <Field3 label="Serawet" form={form} setField={setField} fieldKey="serawet" />
          <Field3 label="Primasol" form={form} setField={setField} fieldKey="primasol" />
          <Field3 label="Cottoclarin" form={form} setField={setField} fieldKey="cottoclarin" />
          <Field3 label="Setamol" form={form} setField={setField} fieldKey="setamol" />
          <Field3 label="Granular" form={form} setField={setField} fieldKey="granular" />
          <Field3 label="Granule" form={form} setField={setField} fieldKey="granule" />
          <Field3 label="Grain" form={form} setField={setField} fieldKey="grain" />
          <Field3 label="Wet Matic" form={form} setField={setField} fieldKey="wet_matic" />
          <Field3 label="Fisat" form={form} setField={setField} fieldKey="fisat" />
          <Field3 label="Breviol" form={form} setField={setField} fieldKey="breviol" />
          <Field3 label="CSK" form={form} setField={setField} fieldKey="csk" />
          <Field3 label="Comee" form={form} setField={setField} fieldKey="comee" />
          <Field3 label="Dirsol RDP" form={form} setField={setField} fieldKey="dirsol_rdp" />
          <Field3 label="Primasol NF" form={form} setField={setField} fieldKey="primasol_nf" />
          <Field3 label="Zolopol PHTR/ZB" form={form} setField={setField} fieldKey="zolopol_phtr" />
          <Field3 label="Cottoclarin 2" form={form} setField={setField} fieldKey="cottoclarin_2" />
          <Field3 label="Sanwet" form={form} setField={setField} fieldKey="sanwet" />
          <Field3 label="Marcerize Caustic" form={form} setField={setField} fieldKey="marcerize_caustic" />
          <Field3 label="Sanmercer" form={form} setField={setField} fieldKey="sanmercer" />
          <Field3 label="Sancomplex" form={form} setField={setField} fieldKey="sancomplex" />
          <Field3 label="Exsess Caustic" form={form} setField={setField} fieldKey="exsess_caustic" />
          <Field3 label="Exsess Hydro" form={form} setField={setField} fieldKey="exsess_hydro" />
          <Field3 label="Dextoor" form={form} setField={setField} fieldKey="dextoor" />
          <Field3 label="LTR" form={form} setField={setField} fieldKey="ltr" />
          <Field3 label="Diresol Black Kas" form={form} setField={setField} fieldKey="diresol_black_kas" />
          <Field3 label="Sansul SDC" form={form} setField={setField} fieldKey="sansul_sdc" />
          <Field3 label="Caustic 2" form={form} setField={setField} fieldKey="caustic_2" />
          <Field3 label="Dextros" form={form} setField={setField} fieldKey="dextros" />
          <Field3 label="Solopol 2" form={form} setField={setField} fieldKey="solopol_2" />
          <Field3 label="Primasol 2" form={form} setField={setField} fieldKey="primasol_2" />
          <Field3 label="Serawet 2" form={form} setField={setField} fieldKey="serawet_2" />
          <Field3 label="Cottoclarin 3" form={form} setField={setField} fieldKey="cottoclarin_3" />
          <Field3 label="Saneutral" form={form} setField={setField} fieldKey="saneutral" />
          <Field3 label="Dextrose (Adjust)" form={form} setField={setField} fieldKey="dextrose_adjust" />
          <Field3 label="Optifik RSL" form={form} setField={setField} fieldKey="optifik_rsl" />
          <Field3 label="Ekalin F" form={form} setField={setField} fieldKey="ekalin_f" />
          <Field3 label="Solopol PHTR" form={form} setField={setField} fieldKey="solopol_phtr" />
        </div>
      </SectionCard>

      {/* Section D — Machine Parameters */}
      <SectionCard title="Machine Parameters">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field3 label="Moisture Mahlo" form={form} setField={setField} fieldKey="moisture_mahlo" />
          <Field3 label="Temp Dryer" form={form} setField={setField} fieldKey="temp_dryer" />
          <Field3 label="Temp Mid Dryer" form={form} setField={setField} fieldKey="temp_mid_dryer" />
          <Field3 label="Temp Size Box 1" form={form} setField={setField} fieldKey="temp_size_box_1" />
          <Field3 label="Temp Size Box 2" form={form} setField={setField} fieldKey="temp_size_box_2" />
          <Field3 label="Size Box 1" form={form} setField={setField} fieldKey="size_box_1" />
          <Field3 label="Size Box 2" form={form} setField={setField} fieldKey="size_box_2" />
          <Field3 label="Squeezing Roll 1" form={form} setField={setField} fieldKey="squeezing_roll_1" />
          <Field3 label="Squeezing Roll 2" form={form} setField={setField} fieldKey="squeezing_roll_2" />
          <Field3 label="Immersion Roll" form={form} setField={setField} fieldKey="immersion_roll" />
          <Field3 label="Dryer" form={form} setField={setField} fieldKey="dryer" />
          <Field3 label="Take Off" form={form} setField={setField} fieldKey="take_off" />
          <Field3 label="Winding" form={form} setField={setField} fieldKey="winding" />
          <Field3 label="Press Beam" form={form} setField={setField} fieldKey="press_beam" />
          <Field3 label="Hardness" form={form} setField={setField} fieldKey="hardness" />
          <Field3 label="Hydraulic Pump 1" form={form} setField={setField} fieldKey="hydrolic_pump_1" />
          <Field3 label="Hydraulic Pump 2" form={form} setField={setField} fieldKey="hydrolic_pump_2" />
          <Field3 label="Unwinder" form={form} setField={setField} fieldKey="unwinder" />
          <Field3 label="Dyeing Tens Wash" form={form} setField={setField} fieldKey="dyeing_tens_wash" />
          <Field3 label="Dyeing Tens Warna" form={form} setField={setField} fieldKey="dyeing_tens_warna" />
        </div>
      </SectionCard>

      {/* Section E — Bak Temperatures */}
      <SectionCard title="Bak Temperatures">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 12 }}>
          {([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16] as const).map(i => (
            <Field key={`bak_${i}`} label={`Bak ${i}`}>
              <Input type="number" step="0.01"
                value={form[`bak_${i}` as keyof IndigoFormState] as string}
                onChange={e => setField(`bak_${i}` as keyof IndigoFormState, e.target.value)}
                placeholder="°C"
                style={FIELD_STYLE}
              />
            </Field>
          ))}
        </div>
      </SectionCard>
    </>
  );
}
