'use client';

import { useState, CSSProperties } from 'react';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Skeleton } from '../../../ui/skeleton';
import { Search, Plus, Edit3, Inbox } from 'lucide-react';
import type { FabricSpec } from './types';

const KAT_KODE_OPTIONS = ['SC', 'WS', 'Other'];

const CATEGORY_COLORS: Record<string, CSSProperties> = {
  SC:    { background: '#EFF6FF', color: '#1D4ED8' },
  WS:    { background: '#F0FDFA', color: '#0891B2' },
  Other: { background: '#F9FAFB', color: '#6B7280' },
};

function getCategoryColor(kat_kode: string | null): CSSProperties {
  if (!kat_kode) return CATEGORY_COLORS.Other;
  return CATEGORY_COLORS[kat_kode] || CATEGORY_COLORS.Other;
}

type Props = {
  rows: FabricSpec[];
  loading: boolean;
  search: string;
  katKode: string;
  onSearchChange: (v: string) => void;
  onKatKodeChange: (v: string) => void;
  onRefresh: () => void;
  onEdit: (spec: FabricSpec) => void;
  onNew: () => void;
  onRowClick?: (spec: FabricSpec) => void;
};

export function FabricSpecsTable({
  rows, loading, search, katKode, onSearchChange, onKatKodeChange, onRefresh, onEdit, onNew, onRowClick,
}: Props) {
  // grid: [stripe(3px)] [expand(36px)] [col widths...]
  const COLS = [
    { label: 'ITEM / KONS KODE', width: '1fr' },
    { label: 'CAT', width: '64px' },
    { label: 'TE', width: '72px' },
    { label: 'NE LUSI / NE PAKAN', width: '120px' },
    { label: 'SISIR / PICK', width: '100px' },
    { label: 'WARNA', width: '100px' },
    { label: 'USED IN', width: '72px' },
    { label: '', width: '48px' },
  ];

  const GRID_COLS = ['3px', '36px', ...COLS.map(c => c.width)];

  return (
    <>
      {/* ── Search + Filter Bar ── */}
      <div style={{
        display: 'flex',
        gap: 12,
        alignItems: 'center',
        marginBottom: 16,
      }}>
        {/* Search input */}
        <div style={{ position: 'relative', flex: 1, maxWidth: 340 }}>
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9CA3AF',
              pointerEvents: 'none',
            }}
          />
          <Input
            placeholder="Search by item, kons_kode…"
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            style={{
              height: 36,
              paddingLeft: 32,
              paddingRight: 12,
              borderRadius: 8,
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: '#E5E7EB',
              background: '#FFFFFF',
              fontSize: 13,
              color: '#0F1E2E',
              fontFamily: 'inherit',
              outline: 'none',
              width: '100%',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Category filter */}
        <Select value={katKode} onValueChange={onKatKodeChange}>
          <SelectTrigger
            style={{
              height: 36,
              borderRadius: 8,
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: '#E5E7EB',
              background: '#FFFFFF',
              fontSize: 13,
              color: '#0F1E2E',
              padding: '0 12px',
              width: 140,
              fontFamily: 'inherit',
            }}
          >
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {KAT_KODE_OPTIONS.map(opt => (
              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Refresh */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          style={{ height: 36, width: 36, padding: 0, borderRadius: 8 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
            <path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
            <path d="M8 16H3v5"/>
          </svg>
        </Button>

        {/* New Spec button */}
        <Button
          onClick={onNew}
          style={{
            height: 36,
            padding: '0 14px',
            borderRadius: 8,
            background: '#1D4ED8',
            border: 'none',
            color: '#FFFFFF',
            fontSize: 13,
            fontWeight: 600,
            fontFamily: 'inherit',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            flexShrink: 0,
          }}
        >
          <Plus size={14} />
          New Spec
        </Button>
      </div>

      {/* ── Table ── */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: 12,
        overflow: 'hidden',
      }}>
        {/* Column header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: GRID_COLS.join(' '),
          borderBottom: '1px solid rgba(255,255,255,0.12)',
          background: '#0F1E2E',
          alignItems: 'center',
        }}>
          {/* stripe placeholder */}
          <div />
          {/* expand placeholder */}
          <div />
          {COLS.map((col, i) => (
            <div
              key={i}
              style={{
                padding: '10px 12px',
                fontSize: 10,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'rgba(255,255,255,0.55)',
              }}
            >
              {col.label}
            </div>
          ))}
        </div>

        {/* Body */}
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              style={{
                display: 'grid',
                gridTemplateColumns: GRID_COLS.join(' '),
                borderBottom: '1px solid #F3F4F6',
                borderLeft: '3px solid transparent',
                alignItems: 'center',
                height: 44,
              }}
            >
              <div style={{ borderLeft: i % 5 === 4 ? '3px solid #1D4ED8' : '3px solid transparent' }} />
              <div />
              {Array.from({ length: COLS.length }).map((_, j) => (
                <div key={j} style={{ padding: '0 12px' }}>
                  <Skeleton style={{ height: 12, width: `${50 + (j * 17) % 40}%`, borderRadius: 4 }} />
                </div>
              ))}
            </div>
          ))
        ) : rows.length === 0 ? (
          <div style={{
            padding: '48px 16px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
          }}>
            <Inbox size={40} style={{ color: '#D1D5DB' }} />
            <p style={{ fontSize: 14, fontWeight: 600, color: '#6B7280', margin: 0 }}>
              No fabric specs found
            </p>
            <p style={{ fontSize: 13, color: '#9CA3AF', margin: 0 }}>
              Try adjusting your search
            </p>
          </div>
        ) : (
          rows.map((spec, rowIndex) => {
            const hasStripe = rowIndex % 5 === 4;
            return (
              <div
                key={spec.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: GRID_COLS.join(' '),
                  borderBottom: '1px solid #F3F4F6',
                  borderLeft: hasStripe ? '3px solid #1D4ED8' : '3px solid transparent',
                  alignItems: 'center',
                  minHeight: 44,
                  background: 'transparent',
                  transition: 'background 100ms',
                  cursor: 'pointer',
                }}
                onClick={() => onRowClick?.(spec)}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = '#F9FAFB';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
              >
                {/* stripe placeholder */}
                <div />

                {/* expand chevron */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#D1D5DB' }}>
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </div>

                {/* Item + Kons Kode */}
                <div style={{ padding: '0 12px' }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#0F1E2E', lineHeight: 1.4 }}>
                    {spec.item || '—'}
                  </div>
                  <div style={{ fontSize: 11, color: '#9CA3AF', lineHeight: 1.4 }}>
                    {spec.kons_kode || '—'}
                  </div>
                </div>

                {/* Category */}
                <div style={{ padding: '0 12px' }}>
                  <span
                    style={{
                      ...getCategoryColor(spec.kat_kode),
                      display: 'inline-flex',
                      padding: '2px 8px',
                      borderRadius: 12,
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {spec.kat_kode || '—'}
                  </span>
                </div>

                {/* TE */}
                <div style={{ padding: '0 12px', fontSize: 13, color: '#6B7280' }}>
                  {spec.te ?? '—'}
                </div>

                {/* Ne Lusi / Ne Pakan */}
                <div style={{ padding: '0 12px', fontSize: 13, color: '#6B7280' }}>
                  {spec.lusi_ne || '—'} / {spec.pakan_ne || '—'}
                </div>

                {/* Sisir / Pick */}
                <div style={{ padding: '0 12px', fontSize: 13, color: '#6B7280' }}>
                  {spec.sisir || '—'} / {spec.pick ?? '—'}
                </div>

                {/* Warna */}
                <div style={{ padding: '0 12px', fontSize: 13, color: '#6B7280' }}>
                  {spec.warna || '—'}
                </div>

                {/* Used In */}
                <div style={{ padding: '0 12px' }}>
                  {spec.usage_count > 0 ? (
                    <span style={{
                      backgroundColor: '#EFF6FF',
                      color: '#1D4ED8',
                      borderRadius: 12,
                      padding: '2px 8px',
                      fontSize: 12,
                      fontWeight: 600,
                    }}>
                      {spec.usage_count}
                    </span>
                  ) : (
                    <span style={{ fontSize: 13, color: '#D1D5DB' }}>0</span>
                  )}
                </div>

                {/* Edit button */}
                <div
                  style={{ padding: '0 8px', display: 'flex', justifyContent: 'center' }}
                  onClick={e => e.stopPropagation()}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(spec)}
                    style={{ height: 28, padding: '0 6px', borderRadius: 6, color: '#9CA3AF' }}
                  >
                    <Edit3 size={13} />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Row count footer ── */}
      {!loading && rows.length > 0 && (
        <div style={{
          padding: '10px 4px',
          fontSize: 12,
          color: '#9CA3AF',
        }}>
          Showing {rows.length} spec{rows.length !== 1 ? 's' : ''}
        </div>
      )}
    </>
  );
}
