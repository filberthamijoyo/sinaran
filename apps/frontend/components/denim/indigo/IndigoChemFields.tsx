'use client';

import { Input } from '../../ui/input';
import { SectionCard } from '../../ui/erp/SectionCard';
import { IndigoFormState } from './types';

interface Props {
  form: IndigoFormState;
  setField: (key: keyof IndigoFormState, value: string) => void;
  // Section collapse state
  sectionSizingOpen: boolean;
  sectionDyeingOpen: boolean;
  sectionMachineParamsOpen: boolean;
  sectionLabOpen: boolean;
  onToggleSizing: () => void;
  onToggleDyeing: () => void;
  onToggleMachineParams: () => void;
  onToggleLab: () => void;
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

function Field3({ label, form, setField, fieldKey }: {
  label: string; form: IndigoFormState;
  setField: (key: keyof IndigoFormState, value: string) => void;
  fieldKey: keyof IndigoFormState;
}) {
  return (
    <Field label={label}>
      <Input type="number" step="0.01"
        value={form[fieldKey] as string}
        onChange={e => setField(fieldKey, e.target.value)}
        style={FIELD_STYLE}
      />
    </Field>
  );
}

function ToggleButton({
  label,
  isOpen,
  onClick,
}: {
  label: string;
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: 'none', border: 'none', cursor: 'pointer',
        padding: 0, display: 'flex', alignItems: 'center', gap: 6,
      }}
    >
      <span style={{ fontSize: 12, color: '#9CA3AF' }}>
        {isOpen ? 'Hide' : 'Show'}
      </span>
      <span style={{
        fontSize: 13, color: '#9CA3AF',
        transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
        transition: 'transform 200ms ease',
        display: 'inline-block',
      }}>
        ▼
      </span>
    </button>
  );
}

export function IndigoChemFields({
  form, setField,
  sectionSizingOpen, sectionDyeingOpen, sectionMachineParamsOpen, sectionLabOpen,
  onToggleSizing, onToggleDyeing, onToggleMachineParams, onToggleLab,
}: Props) {
  return (
    <>
      {/* ── Section 2: Sizing Chemicals (collapsed by default) ───────────── */}
      <SectionCard
        title="Sizing Chemicals"
        action={<ToggleButton label="Sizing Chemicals" isOpen={sectionSizingOpen} onClick={onToggleSizing} />}
      >
        {sectionSizingOpen && (
          <div style={GRID}>
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
        )}
      </SectionCard>

      {/* ── Section 3: Dyeing Chemicals (collapsed by default) ───────────── */}
      <SectionCard
        title="Dyeing Chemicals"
        action={<ToggleButton label="Dyeing Chemicals" isOpen={sectionDyeingOpen} onClick={onToggleDyeing} />}
      >
        {sectionDyeingOpen && (
          <div style={GRID}>
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
        )}
      </SectionCard>

      {/* ── Section 4: Machine Parameters — All (collapsed by default) ───── */}
      <SectionCard
        title="Machine Parameters"
        action={<ToggleButton label="Machine Parameters" isOpen={sectionMachineParamsOpen} onClick={onToggleMachineParams} />}
      >
        {sectionMachineParamsOpen && (
          <div style={GRID}>
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
        )}
      </SectionCard>

      {/* ── Section 5: Lab Results (open by default) ──────────────────────── */}
      <SectionCard
        title="Lab Results"
        action={<ToggleButton label="Lab Results" isOpen={sectionLabOpen} onClick={onToggleLab} />}
      >
        {sectionLabOpen && (
          <div style={GRID}>
            <Field label="MC IDG">
              <Input type="text" value={form.mc_idg}
                onChange={e => setField('mc_idg', e.target.value)}
                placeholder="e.g. M-001"
                style={FIELD_STYLE} />
            </Field>
            <Field3 label="Strength" form={form} setField={setField} fieldKey="strength_val" />
            <Field3 label="Elongasi IDG (%)" form={form} setField={setField} fieldKey="elongasi_idg" />
            <Field3 label="CV% (%)" form={form} setField={setField} fieldKey="cv_pct" />
            <Field3 label="Tenacity" form={form} setField={setField} fieldKey="tenacity" />
          </div>
        )}
      </SectionCard>
    </>
  );
}
