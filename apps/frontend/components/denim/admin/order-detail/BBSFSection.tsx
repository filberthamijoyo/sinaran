'use client';

import { useState, useEffect } from 'react';
import { SectionCard } from '../../../ui/erp/SectionCard';
import { BBSFWashingRun, BBSFSanforRun } from './types';
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '../../../ui/table';
import { authFetch } from '../../../../lib/authFetch';

interface BBSFSectionProps {
  bbsfWashing: BBSFWashingRun[];
  bbsfSanfor: BBSFSanforRun[];
  kp: string;
  onEdit?: () => void;
}

interface BBSFProductionRecord {
  id: number;
  tanggal: string;
  shift: string | null;
  kp: string;
  kode: string | null;
  qty: string;
  line: string | null;
}

interface BBSFSusutRecord {
  id: number;
  tanggal: string;
  no: number | null;
  kp: string;
  kp_kode: string | null;
  kereta: number | null;
  susut_lusi_awal: string | null;
  set_lusi_awal: string | null;
  susut_lusi_tengah: string | null;
  set_lusi_tengah: string | null;
  susut_lusi_akhir: string | null;
  set_lusi_akhir: string | null;
  susut_pakan_awal: string | null;
  set_pakan_awal: string | null;
  susut_pakan_tengah: string | null;
  set_pakan_tengah: string | null;
  susut_pakan_akhir: string | null;
  set_pakan_akhir: string | null;
  skew_awal: string | null;
  skew_tengah: string | null;
  skew_akhir: string | null;
  set_skew: string | null;
  keterangan: string | null;
}

export function BBSFSection({ bbsfWashing, bbsfSanfor, kp, onEdit }: BBSFSectionProps) {
  const [production, setProduction] = useState<BBSFProductionRecord[]>([]);
  const [susut, setSusut] = useState<BBSFSusutRecord[]>([]);

  useEffect(() => {
    authFetch<BBSFProductionRecord[]>(`/denim/bbsf-production?kp=${kp}`)
      .then(d => setProduction(d || []))
      .catch(() => {});

    authFetch<BBSFSusutRecord[]>(`/denim/bbsf-susut?kp=${kp}`)
      .then(d => setSusut(d || []))
      .catch(() => {});
  }, [kp]);

  const hasData = bbsfWashing.length > 0 || bbsfSanfor.length > 0;

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
        transition:  'background 150ms',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F9FAFB'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#FFFFFF'; }}
    >Edit</button>
  ) : undefined;

  return (
    <SectionCard
      title="BBSF (Washing & Sanfor)"
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
            color:        '#9CA3AF',
            borderRadius:  6,
            padding:     '2px 8px',
            fontSize:     11,
            fontWeight:   500,
          }}>BBSF</span>
        </>
      ) : (
        <div>
          {bbsfWashing.length > 0 && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9CA3AF', marginBottom: 12 }}>Washing</p>
              <Table>
                <TableHeader>
                  <TableRow>
                    {['Date', 'Shift', 'Machine', 'Speed', 'Lebar Awal', 'Permasalahan'].map(h => (
                      <TableHead key={h}>{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bbsfWashing.map(record => (
                    <TableRow key={record.id}>
                      <TableCell>{record.tgl ? new Date(record.tgl).toLocaleDateString('en-GB') : '—'}</TableCell>
                      <TableCell>{record.shift || '—'}</TableCell>
                      <TableCell>{record.mc || '—'}</TableCell>
                      <TableCell>{record.speed || '—'}</TableCell>
                      <TableCell>{record.lebar_awal || '—'}</TableCell>
                      <TableCell>{record.permasalahan || '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {bbsfSanfor.length > 0 && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9CA3AF', marginBottom: 12 }}>Sanfor</p>
              <Table>
                <TableHeader>
                  <TableRow>
                    {['Date', 'Shift', 'Type', 'Speed', 'Susut %', 'Permasalahan'].map(h => (
                      <TableHead key={h}>{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bbsfSanfor.map(record => (
                    <TableRow key={record.id}>
                      <TableCell>{record.tgl ? new Date(record.tgl).toLocaleDateString('en-GB') : '—'}</TableCell>
                      <TableCell>{record.shift || '—'}</TableCell>
                      <TableCell>{record.sanfor_type || '—'}</TableCell>
                      <TableCell>{record.speed || '—'}</TableCell>
                      <TableCell>{record.susut != null ? record.susut + '%' : '—'}</TableCell>
                      <TableCell>{record.permasalahan || '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {production.length > 0 && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9CA3AF', marginBottom: 12 }}>Production Output</p>
              <Table>
                <TableHeader>
                  <TableRow>
                    {['Date', 'Shift', 'Construction', 'Line', 'Qty (m)'].map(h => (
                      <TableHead key={h}>{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {production.map(r => (
                    <TableRow key={r.id}>
                      <TableCell>{new Date(r.tanggal).toLocaleDateString('id-ID')}</TableCell>
                      <TableCell>{r.shift ?? '—'}</TableCell>
                      <TableCell>{r.kode ?? '—'}</TableCell>
                      <TableCell>{r.line ?? '—'}</TableCell>
                      <TableCell>{Number(r.qty).toLocaleString('id-ID', { maximumFractionDigits: 1 })}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <span>Total: {production.reduce((s, r) => s + Number(r.qty), 0)
                .toLocaleString('id-ID', { maximumFractionDigits: 1 })} m</span>
            </div>
          )}

          {susut.length > 0 && (
            <div>
              <span>Shrinkage Measurements (Susut)</span>
              <Table>
                <TableHeader>
                  <TableRow>
                    {['Date', 'Kereta', 'Construction',
                      'Lusi Awal', 'Lusi Mid', 'Lusi Akhir',
                      'Pakan Awal', 'Pakan Mid', 'Pakan Akhir',
                      'Skew Awal', 'Skew Mid', 'Skew Akhir'].map(h => (
                      <TableHead key={h}>{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {susut.map(r => (
                    <TableRow key={r.id}>
                      <TableCell>{new Date(r.tanggal).toLocaleDateString('id-ID')}</TableCell>
                      <TableCell>{r.kereta ?? '—'}</TableCell>
                      <TableCell>{r.kp_kode ?? '—'}</TableCell>
                      {[r.susut_lusi_awal, r.susut_lusi_tengah, r.susut_lusi_akhir,
                        r.susut_pakan_awal, r.susut_pakan_tengah, r.susut_pakan_akhir,
                        r.skew_awal, r.skew_tengah, r.skew_akhir].map((v, i) => (
                        <TableCell key={i}>{v != null ? Number(v).toFixed(2) : '—'}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}
    </SectionCard>
  );
}
