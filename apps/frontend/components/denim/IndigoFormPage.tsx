'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authFetch } from '../../lib/authFetch';
import { toast } from 'sonner';
import { PageShell } from '../ui/erp/PageShell';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { IndigoBasicFields } from './indigo/IndigoBasicFields';
import { IndigoChemFields } from './indigo/IndigoChemFields';
import { IndigoFormState, emptyIndigoForm } from './indigo/types';
import { SCData } from '../../lib/types';

export default function IndigoFormPage({ kp }: { kp: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get('edit') === '1';
  const [sc, setSc] = useState<SCData | null>(null);
  const [loadingSc, setLoadingSc] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showChemistry, setShowChemistry] = useState(false);
  const [form, setForm] = useState<IndigoFormState>(emptyIndigoForm());

  const loadExisting = (w: Record<string, unknown>) => {
    setForm(f => ({
      ...f,
      tgl: w.tgl ? new Date(w.tgl as string).toISOString().split('T')[0] : f.tgl,
      start: (w.start as string) || '',
      stop: (w.stop as string) || '',
      jumlah_rope: (w.jumlah_rope as string)?.toString() || '',
      panjang_rope: (w.panjang_rope as string)?.toString() || '',
      bak_count: (w.bak_count as string)?.toString() || '',
      indigo_conc: (w.indigo_conc as string)?.toString() || '',
      indigo_bak: (w.indigo_bak as string)?.toString() || '',
      has_sulfur: !!(w.sulfur_conc || w.sulfur_bak),
      sulfur_conc: (w.sulfur_conc as string)?.toString() || '',
      sulfur_bak: (w.sulfur_bak as string)?.toString() || '',
      total_meters: (w.total_meters as string)?.toString() || '',
      keterangan: (w.keterangan as string) || '',
      mc: (w.mc as string)?.toString() || '',
      speed: (w.speed as string)?.toString() || '',
      bak_celup: (w.bak_celup as string)?.toString() || '',
      bb: (w.bb as string)?.toString() || '',
      p: (w.p as string)?.toString() || '',
      te: (w.te as string)?.toString() || '',
      strength: (w.strength as string)?.toString() || '',
      elongasi: (w.elongasi as string)?.toString() || '',
      moisture_mahlo: (w.moisture_mahlo as string)?.toString() || '',
      temp_dryer: (w.temp_dryer as string)?.toString() || '',
      temp_mid_dryer: (w.temp_mid_dryer as string)?.toString() || '',
      temp_size_box_1: (w.temp_size_box_1 as string)?.toString() || '',
      temp_size_box_2: (w.temp_size_box_2 as string)?.toString() || '',
      size_box_1: (w.size_box_1 as string)?.toString() || '',
      size_box_2: (w.size_box_2 as string)?.toString() || '',
      squeezing_roll_1: (w.squeezing_roll_1 as string)?.toString() || '',
      squeezing_roll_2: (w.squeezing_roll_2 as string)?.toString() || '',
      immersion_roll: (w.immersion_roll as string)?.toString() || '',
      dryer: (w.dryer as string)?.toString() || '',
      take_off: (w.take_off as string)?.toString() || '',
      winding: (w.winding as string)?.toString() || '',
      press_beam: (w.press_beam as string)?.toString() || '',
      hardness: (w.hardness as string)?.toString() || '',
      hydrolic_pump_1: (w.hydrolic_pump_1 as string)?.toString() || '',
      hydrolic_pump_2: (w.hydrolic_pump_2 as string)?.toString() || '',
      unwinder: (w.unwinder as string)?.toString() || '',
      dyeing_tens_wash: (w.dyeing_tens_wash as string)?.toString() || '',
      dyeing_tens_warna: (w.dyeing_tens_warna as string)?.toString() || '',
      indigo: (w.indigo as string)?.toString() || '',
      caustic: (w.caustic as string)?.toString() || '',
      hydro: (w.hydro as string)?.toString() || '',
      ne: (w.ne as string) || '',
      konst_idg: (w.konst_idg as string)?.toString() || '',
      konst_sulfur: (w.konst_sulfur as string)?.toString() || '',
      visc: (w.visc as string)?.toString() || '',
      ref: (w.ref as string)?.toString() || '',
      size_box: (w.size_box as string)?.toString() || '',
      scoring: (w.scoring as string)?.toString() || '',
      jetsize: (w.jetsize as string)?.toString() || '',
      mc_idg: (w.mc_idg as string) || '',
      strength_val: (w.strength_val as string)?.toString() || '',
      elongasi_idg: (w.elongasi_idg as string)?.toString() || '',
      cv_pct: (w.cv_pct as string)?.toString() || '',
      tenacity: (w.tenacity as string)?.toString() || '',
      polisize_hs: (w.polisize_hs as string)?.toString() || '',
      polisize_1_2: (w.polisize_1_2 as string)?.toString() || '',
      armosize: (w.armosize as string)?.toString() || '',
      armosize_1_1: (w.armosize_1_1 as string)?.toString() || '',
      armosize_1_2: (w.armosize_1_2 as string)?.toString() || '',
      armosize_1_3: (w.armosize_1_3 as string)?.toString() || '',
      armosize_1_5: (w.armosize_1_5 as string)?.toString() || '',
      armosize_1_7: (w.armosize_1_7 as string)?.toString() || '',
      quqlaxe: (w.quqlaxe as string)?.toString() || '',
      armo_c: (w.armo_c as string)?.toString() || '',
      vit_e: (w.vit_e as string)?.toString() || '',
      armo_d: (w.armo_d as string)?.toString() || '',
      tapioca: (w.tapioca as string)?.toString() || '',
      a_308: (w.a_308 as string)?.toString() || '',
      solopol: (w.solopol as string)?.toString() || '',
      serawet: (w.serawet as string)?.toString() || '',
      primasol: (w.primasol as string)?.toString() || '',
      cottoclarin: (w.cottoclarin as string)?.toString() || '',
      setamol: (w.setamol as string)?.toString() || '',
      granular: (w.granular as string)?.toString() || '',
      granule: (w.granule as string)?.toString() || '',
      grain: (w.grain as string)?.toString() || '',
      wet_matic: (w.wet_matic as string)?.toString() || '',
      fisat: (w.fisat as string)?.toString() || '',
      breviol: (w.breviol as string)?.toString() || '',
      csk: (w.csk as string)?.toString() || '',
      comee: (w.comee as string)?.toString() || '',
      dirsol_rdp: (w.dirsol_rdp as string)?.toString() || '',
      primasol_nf: (w.primasol_nf as string)?.toString() || '',
      zolopol_phtr: (w.zolopol_phtr as string)?.toString() || '',
      cottoclarin_2: (w.cottoclarin_2 as string)?.toString() || '',
      sanwet: (w.sanwet as string)?.toString() || '',
      marcerize_caustic: (w.marcerize_caustic as string)?.toString() || '',
      sanmercer: (w.sanmercer as string)?.toString() || '',
      sancomplex: (w.sancomplex as string)?.toString() || '',
      exsess_caustic: (w.exsess_caustic as string)?.toString() || '',
      exsess_hydro: (w.exsess_hydro as string)?.toString() || '',
      dextoor: (w.dextoor as string)?.toString() || '',
      ltr: (w.ltr as string)?.toString() || '',
      diresol_black_kas: (w.diresol_black_kas as string)?.toString() || '',
      sansul_sdc: (w.sansul_sdc as string)?.toString() || '',
      caustic_2: (w.caustic_2 as string)?.toString() || '',
      dextros: (w.dextros as string)?.toString() || '',
      solopol_2: (w.solopol_2 as string)?.toString() || '',
      primasol_2: (w.primasol_2 as string)?.toString() || '',
      serawet_2: (w.serawet_2 as string)?.toString() || '',
      cottoclarin_3: (w.cottoclarin_3 as string)?.toString() || '',
      saneutral: (w.saneutral as string)?.toString() || '',
      dextrose_adjust: (w.dextrose_adjust as string)?.toString() || '',
      optifik_rsl: (w.optifik_rsl as string)?.toString() || '',
      ekalin_f: (w.ekalin_f as string)?.toString() || '',
      solopol_phtr: (w.solopol_phtr as string)?.toString() || '',
      bak_1: (w.bak_1 as string)?.toString() || '',
      bak_2: (w.bak_2 as string)?.toString() || '',
      bak_3: (w.bak_3 as string)?.toString() || '',
      bak_4: (w.bak_4 as string)?.toString() || '',
      bak_5: (w.bak_5 as string)?.toString() || '',
      bak_6: (w.bak_6 as string)?.toString() || '',
      bak_7: (w.bak_7 as string)?.toString() || '',
      bak_8: (w.bak_8 as string)?.toString() || '',
      bak_9: (w.bak_9 as string)?.toString() || '',
      bak_10: (w.bak_10 as string)?.toString() || '',
      bak_11: (w.bak_11 as string)?.toString() || '',
      bak_12: (w.bak_12 as string)?.toString() || '',
      bak_13: (w.bak_13 as string)?.toString() || '',
      bak_14: (w.bak_14 as string)?.toString() || '',
      bak_15: (w.bak_15 as string)?.toString() || '',
      bak_16: (w.bak_16 as string)?.toString() || '',
    }));
    setShowChemistry(true);
  };

  const pNum = (v: string | undefined) => v ? parseFloat(v) : null;
  const pInt = (v: string | undefined) => v ? parseInt(v) : null;
  const pStr = (v: string | undefined) => v || null;

  const buildPayload = () => ({
    kp,
    tgl: pStr(form.tgl),
    start: pStr(form.start),
    stop: pStr(form.stop),
    jumlah_rope: pInt(form.jumlah_rope),
    panjang_rope: pNum(form.panjang_rope),
    bak_count: pInt(form.bak_count),
    indigo_conc: pNum(form.indigo_conc),
    indigo_bak: pInt(form.indigo_bak),
    has_sulfur: form.has_sulfur,
    sulfur_conc: form.has_sulfur ? pNum(form.sulfur_conc) : null,
    sulfur_bak: form.has_sulfur ? pInt(form.sulfur_bak) : null,
    total_meters: pNum(form.total_meters),
    keterangan: pStr(form.keterangan),
    mc: pInt(form.mc),
    speed: pNum(form.speed),
    bak_celup: pNum(form.bak_celup),
    bb: pNum(form.bb),
    p: pNum(form.p),
    te: pNum(form.te),
    strength: pNum(form.strength),
    elongasi: pNum(form.elongasi),
    moisture_mahlo: pNum(form.moisture_mahlo),
    temp_dryer: pNum(form.temp_dryer),
    temp_mid_dryer: pNum(form.temp_mid_dryer),
    temp_size_box_1: pNum(form.temp_size_box_1),
    temp_size_box_2: pNum(form.temp_size_box_2),
    size_box_1: pNum(form.size_box_1),
    size_box_2: pNum(form.size_box_2),
    squeezing_roll_1: pNum(form.squeezing_roll_1),
    squeezing_roll_2: pNum(form.squeezing_roll_2),
    immersion_roll: pNum(form.immersion_roll),
    dryer: pNum(form.dryer),
    take_off: pNum(form.take_off),
    winding: pNum(form.winding),
    press_beam: pNum(form.press_beam),
    hardness: pNum(form.hardness),
    hydrolic_pump_1: pNum(form.hydrolic_pump_1),
    hydrolic_pump_2: pNum(form.hydrolic_pump_2),
    unwinder: pNum(form.unwinder),
    dyeing_tens_wash: pNum(form.dyeing_tens_wash),
    dyeing_tens_warna: pNum(form.dyeing_tens_warna),
    indigo: pNum(form.indigo),
    caustic: pNum(form.caustic),
    hydro: pNum(form.hydro),
    solopol: pNum(form.solopol),
    serawet: pNum(form.serawet),
    primasol: pNum(form.primasol),
    cottoclarin: pNum(form.cottoclarin),
    setamol: pNum(form.setamol),
    granular: pNum(form.granular),
    granule: pNum(form.granule),
    grain: pNum(form.grain),
    wet_matic: pNum(form.wet_matic),
    fisat: pNum(form.fisat),
    breviol: pNum(form.breviol),
    csk: pNum(form.csk),
    comee: pNum(form.comee),
    dirsol_rdp: pNum(form.dirsol_rdp),
    primasol_nf: pNum(form.primasol_nf),
    zolopol_phtr: pNum(form.zolopol_phtr),
    cottoclarin_2: pNum(form.cottoclarin_2),
    sanwet: pNum(form.sanwet),
    marcerize_caustic: pNum(form.marcerize_caustic),
    sanmercer: pNum(form.sanmercer),
    sancomplex: pNum(form.sancomplex),
    exsess_caustic: pNum(form.exsess_caustic),
    exsess_hydro: pNum(form.exsess_hydro),
    dextoor: pNum(form.dextoor),
    ltr: pNum(form.ltr),
    diresol_black_kas: pNum(form.diresol_black_kas),
    sansul_sdc: pNum(form.sansul_sdc),
    caustic_2: pNum(form.caustic_2),
    dextros: pNum(form.dextros),
    solopol_2: pNum(form.solopol_2),
    primasol_2: pNum(form.primasol_2),
    serawet_2: pNum(form.serawet_2),
    cottoclarin_3: pNum(form.cottoclarin_3),
    saneutral: pNum(form.saneutral),
    dextrose_adjust: pNum(form.dextrose_adjust),
    optifik_rsl: pNum(form.optifik_rsl),
    ekalin_f: pNum(form.ekalin_f),
    solopol_phtr: pNum(form.solopol_phtr),
    polisize_hs: pNum(form.polisize_hs),
    polisize_1_2: pNum(form.polisize_1_2),
    armosize: pNum(form.armosize),
    armosize_1_1: pNum(form.armosize_1_1),
    armosize_1_2: pNum(form.armosize_1_2),
    armosize_1_3: pNum(form.armosize_1_3),
    armosize_1_5: pNum(form.armosize_1_5),
    armosize_1_7: pNum(form.armosize_1_7),
    quqlaxe: pNum(form.quqlaxe),
    armo_c: pNum(form.armo_c),
    vit_e: pNum(form.vit_e),
    armo_d: pNum(form.armo_d),
    tapioca: pNum(form.tapioca),
    a_308: pNum(form.a_308),
    ne: pStr(form.ne),
    konst_idg: pNum(form.konst_idg),
    konst_sulfur: pNum(form.konst_sulfur),
    visc: pNum(form.visc),
    ref: pNum(form.ref),
    size_box: pNum(form.size_box),
    scoring: pNum(form.scoring),
    jetsize: pNum(form.jetsize),
    mc_idg: pStr(form.mc_idg),
    strength_val: pNum(form.strength_val),
    elongasi_idg: pNum(form.elongasi_idg),
    cv_pct: pNum(form.cv_pct),
    tenacity: pNum(form.tenacity),
    bak_1: pNum(form.bak_1),
    bak_2: pNum(form.bak_2),
    bak_3: pNum(form.bak_3),
    bak_4: pNum(form.bak_4),
    bak_5: pNum(form.bak_5),
    bak_6: pNum(form.bak_6),
    bak_7: pNum(form.bak_7),
    bak_8: pNum(form.bak_8),
    bak_9: pNum(form.bak_9),
    bak_10: pNum(form.bak_10),
    bak_11: pNum(form.bak_11),
    bak_12: pNum(form.bak_12),
    bak_13: pNum(form.bak_13),
    bak_14: pNum(form.bak_14),
    bak_15: pNum(form.bak_15),
    bak_16: pNum(form.bak_16),
  });

  useEffect(() => {
    const load = async () => {
      try {
        const data = await authFetch<SCData>(`/denim/sales-contracts/${kp}`);
        setSc(data);

        if (isEditMode) {
          const pipelineData = await authFetch<{ indigo_run?: Record<string, unknown> }>(`/denim/admin/pipeline/${kp}`);
          if (pipelineData?.indigo_run) {
            loadExisting(pipelineData.indigo_run);
          }
        }
      } catch {
        toast.error('Failed to load order data.');
      } finally {
        setLoadingSc(false);
      }
    };
    load();
  }, [kp, isEditMode]);

  const setField = (key: keyof IndigoFormState, value: string) =>
    setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEditMode) {
        await authFetch(`/denim/indigo/${kp}`, { method: 'PUT', body: JSON.stringify(buildPayload()) });
        toast.success(`Indigo updated for KP ${kp}.`);
        router.push(`/denim/admin/orders/${kp}`);
      } else {
        await authFetch('/denim/indigo', { method: 'POST', body: JSON.stringify(buildPayload()) });
        toast.success(`Indigo saved for KP ${kp}. Moved to Weaving.`);
        router.push('/denim/inbox/indigo');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save indigo data.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingSc) {
    return (
      <div style={{ background: 'var(--page-bg)', minHeight: '100vh', padding: 32 }}>
        <Skeleton style={{ height: 32, width: 200, borderRadius: 6 }} />
        <Skeleton style={{ height: 80, borderRadius: 10, marginTop: 16 }} />
        <Skeleton style={{ height: 300, borderRadius: 10, marginTop: 12 }} />
      </div>
    );
  }

  const subtitleParts = [sc?.codename ?? null, sc?.permintaan ?? null].filter(Boolean);
  const subtitle = subtitleParts.length > 0 ? subtitleParts.join(' · ') : undefined;

  return (
    <PageShell
      title="Indigo Form"
      subtitle={subtitle}
      actions={
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          Cancel
        </Button>
      }
      noPadding
    >
      <form onSubmit={handleSubmit}>
        <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          <IndigoBasicFields
            form={form}
            setField={setField}
            showChemistry={showChemistry}
            setShowChemistry={setShowChemistry}
          />

          {showChemistry && <IndigoChemFields form={form} setField={setField} />}

        </div>

        {/* Sticky footer */}
        <div style={{
          position: 'sticky',
          bottom: 0,
          background: 'var(--content-bg)',
          borderTop: '1px solid var(--border)',
          padding: '14px 32px',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 12,
          zIndex: 10,
        }}>
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="lg" loading={submitting}>
            {isEditMode ? 'Save Changes' : 'Submit Indigo'}
          </Button>
        </div>
      </form>
    </PageShell>
  );
}
