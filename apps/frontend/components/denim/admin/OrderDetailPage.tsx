'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { authFetch } from '../../../lib/authFetch';
import { Button } from '../../ui/button';
import { Skeleton } from '../../ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { PipelineData, PipelineApiResponse } from './order-detail/types';
import { PipelineTimeline } from './order-detail/PipelineTimeline';
import { OrderKPHeader } from './order-detail/OrderKPHeader';
import { SalesContractSection } from './order-detail/SalesContractSection';
import { WarpingSection } from './order-detail/WarpingSection';
import { IndigoSection } from './order-detail/IndigoSection';
import { WeavingSection } from './order-detail/WeavingSection';
import { InspectGraySection } from './order-detail/InspectGraySection';
import { BBSFSection } from './order-detail/BBSFSection';
import { InspectFinishSection } from './order-detail/InspectFinishSection';
import { PageShell } from '../../ui/erp/PageShell';

export default function OrderDetailPage({ kp, initialData }: { kp: string; initialData?: PipelineApiResponse }) {
  const router = useRouter();
  const [data, setData] = useState<PipelineData | null>(
    initialData
      ? {
          sc:          initialData.sc,
          warping:     initialData.warping,
          indigo:      initialData.indigo,
          weaving:     initialData.weaving,
          inspectGray: initialData.inspectGray || [],
          bbsfWashing: initialData.bbsfWashing || [],
          bbsfSanfor:  initialData.bbsfSanfor || [],
          inspectFinish: initialData.inspectFinish || [],
        }
      : null
  );
  const [loading,   setLoading]   = useState(!initialData);
  const [error,      setError]     = useState<string | null>(null);
  const [editing,    setEditing]  = useState(false);
  const [editForm,   setEditForm] = useState<Record<string, unknown>>({});
  const [saving,    setSaving]   = useState(false);
  const [activeSection, setActiveSection] = useState<string | undefined>(undefined);

  // Scroll spy — IntersectionObserver on section wrappers
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-section');
            if (id) setActiveSection(id);
          }
        });
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
    );
    Object.values(sectionRefs.current).forEach(el => { if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, [data]);

  useEffect(() => {
    if (initialData) return;
    const load = async () => {
      try {
        const result = await authFetch<PipelineApiResponse>(`/denim/admin/pipeline/${kp}`);
        if (!result) {
          setError('No data returned from API');
        } else if (!result.sc) {
          setError('Order not found');
        } else {
          setData({
            sc:          result.sc,
            warping:     result.warping,
            indigo:      result.indigo,
            weaving:     result.weaving,
            inspectGray: result.inspectGray || [],
            bbsfWashing: result.bbsfWashing || [],
            bbsfSanfor:  result.bbsfSanfor || [],
            inspectFinish: result.inspectFinish || [],
          });
        }
      } catch (e: unknown) {
        setError('Error: ' + (e instanceof Error ? e.message : String(e)));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [kp]);

  const handleEdit = () => {
    if (data?.sc) {
      setEditForm({ ...data.sc });
      setEditing(true);
    }
  };

  const handleFieldChange = (field: string, value: unknown) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await authFetch(`/denim/sales-contracts/${kp}`, {
        method: 'PUT',
        body: JSON.stringify(editForm),
      });
      toast.success('Saved successfully');
      setEditing(false);
      const result = await authFetch<PipelineApiResponse>(`/denim/admin/pipeline/${kp}`);
      setData({
        sc:          result.sc,
        warping:     result.warping,
        indigo:      result.indigo,
        weaving:     result.weaving,
        inspectGray: result.inspectGray || [],
        bbsfWashing: result.bbsfWashing || [],
        bbsfSanfor:  result.bbsfSanfor || [],
        inspectFinish: result.inspectFinish || [],
      });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => { setEditing(false); setEditForm({}); };

  if (loading) {
    return (
      <div style={{ background: '#F0F4F8', minHeight: '100vh', padding: 24 }}>
        <Skeleton style={{ height: 32, width: 160, borderRadius: 6, marginBottom: 24 }} />
        <Skeleton style={{ height: 80, borderRadius: 10, marginBottom: 12 }} />
        <Skeleton style={{ height: 300, borderRadius: 10 }} />
      </div>
    );
  }

  if (error || !data?.sc) {
    return (
      <div style={{ background: '#F0F4F8', minHeight: '100vh', padding: 24 }}>
        <div style={{
          background:    '#FFFFFF',
          border:       '1px solid #E5E7EB',
          borderRadius: 12,
          padding:     24,
          maxWidth:    480,
          margin:      '48px auto',
        }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: '#991B1B', marginBottom: 8 }}>
            {error || 'Order not found'}
          </p>
          <Button variant="secondary" size="sm" onClick={() => router.back()} leftIcon={<ArrowLeft size={14} />}>
            Back
          </Button>
        </div>
      </div>
    );
  }

  const { sc, warping, indigo, weaving, inspectGray = [], bbsfWashing = [], bbsfSanfor = [], inspectFinish = [] } = data;

  const subtitleParts = [sc.codename, sc.permintaan].filter(Boolean);
  const subtitle = subtitleParts.length > 0 ? subtitleParts.join(' · ') : undefined;

  const actions = (
    <Button
      variant="secondary"
      size="sm"
      onClick={() => router.push(`/denim/admin/orders`)}
      leftIcon={<ArrowLeft size={13} />}
    >
      All Orders
    </Button>
  );

  return (
    <PageShell
      title={<span className="kp-code">{kp}</span>}
      subtitle={subtitle}
      actions={actions}
      noPadding
    >
      <div style={{ backgroundColor: '#F0F4F8', minHeight: '100vh', padding: '0 28px 28px' }}>

        {/* ── Sticky pipeline timeline ── */}
        <PipelineTimeline
          currentStage={sc.pipeline_status}
          activeSection={activeSection}
        />

        {/* ── Historical data warning ── */}
        {sc.pipeline_status === 'COMPLETE' && (!warping || !indigo || !weaving?.length) && (
          <div style={{
            background:   '#FFFBEB',
            border:      '1px solid #FDE68A',
            borderRadius: 8,
            padding:     '12px 16px',
            display:     'flex',
            alignItems:  'center',
            gap:         10,
            marginTop:   16,
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2L14 14H2L8 2Z" stroke="#D97706" strokeWidth="1.5" strokeLinejoin="round"/>
              <line x1="8" y1="6" x2="8" y2="9" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="8" cy="11" r="0.75" fill="#D97706"/>
            </svg>
            <div>
              <p style={{ fontSize: 13, fontWeight: 500, color: '#92400E' }}>Incomplete historical data</p>
              <p style={{ fontSize: 12, color: '#92400E' }}>
                This order is marked Complete but some stages were not captured in the historical import:
                {!warping && ' Warping'}{!indigo && ' · Indigo'}{(!weaving || weaving.length === 0) && ' · Weaving'}
              </p>
            </div>
          </div>
        )}

        {/* ── Order KP header (actions) ── */}
        <OrderKPHeader
          kp={kp}
          sc={sc}
          pipelineData={data}
          editing={editing}
          saving={saving}
          router={router}
          onEdit={handleEdit}
          onSave={handleSave}
          onCancel={handleCancel}
        />

        {/* ── Section: Sales Contract ── */}
        <div ref={el => { sectionRefs.current['sales_contract'] = el; }} data-section="sales_contract">
          <SalesContractSection
            sc={sc}
            editing={editing}
            editForm={editForm}
            onFieldChange={handleFieldChange}
          />
        </div>

        {/* ── Section: Warping ── */}
        <div ref={el => { sectionRefs.current['warping'] = el; }} data-section="warping">
          <WarpingSection
            warping={warping}
            kp={kp}
            onEdit={warping ? () => router.push('/denim/inbox/warping/' + kp + '?edit=1') : undefined}
          />
        </div>

        {/* ── Section: Indigo ── */}
        <div ref={el => { sectionRefs.current['indigo'] = el; }} data-section="indigo">
          <IndigoSection
            indigo={indigo}
            kp={kp}
            onEdit={indigo ? () => router.push('/denim/inbox/indigo/' + kp + '?edit=1') : undefined}
          />
        </div>

        {/* ── Section: Weaving ── */}
        <div ref={el => { sectionRefs.current['weaving'] = el; }} data-section="weaving">
          <WeavingSection weaving={weaving} />
        </div>

        {/* ── Section: Inspect Gray ── */}
        <div ref={el => { sectionRefs.current['inspect_gray'] = el; }} data-section="inspect_gray">
          <InspectGraySection
            inspectGray={inspectGray}
            kp={kp}
            onEdit={inspectGray.length > 0 ? () => router.push('/denim/inbox/inspect-gray/' + kp + '?edit=1') : undefined}
          />
        </div>

        {/* ── Section: BBSF ── */}
        <div ref={el => { sectionRefs.current['bbsf'] = el; }} data-section="bbsf">
          <BBSFSection
            bbsfWashing={bbsfWashing}
            bbsfSanfor={bbsfSanfor}
            kp={kp}
            onEdit={(bbsfWashing.length > 0 || bbsfSanfor.length > 0) ? () => router.push('/denim/inbox/bbsf/' + kp + '?edit=1') : undefined}
          />
        </div>

        {/* ── Section: Inspect Finish ── */}
        <div ref={el => { sectionRefs.current['inspect_finish'] = el; }} data-section="inspect_finish">
          <InspectFinishSection
            inspectFinish={inspectFinish}
            kp={kp}
            onEdit={inspectFinish.length > 0 ? () => router.push('/denim/inbox/inspect-finish/' + kp + '?edit=1') : undefined}
          />
        </div>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .od-timeline-circle { width: 24px !important; height: 24px !important; }
        }
      `}</style>
    </PageShell>
  );
}
