'use client';

import { useState, useEffect, useRef } from 'react';
import PageHeader from '../../../components/layout/PageHeader';
import { Search, CheckCircle, Minus, Loader2, Box, Scissors, Droplets, Layers, Scale, Activity, X } from 'lucide-react';
import { authFetch } from '../../../lib/authFetch';

interface DecodedSN {
  machine: string;
  beam: number;
  lot: string;
}

interface SalesContract {
  kp: string;
  kons_kode: string;
  kode: string;
  item: string;
  quantity: number;
  delivery_date: string;
}

interface WeavingRecord {
  id: number;
  kp: string;
  machine: string;
  tanggal: string;
  shift: string;
  efficiency: number;
  total_picks: number;
}

interface InspectGrayRecord {
  id: number;
  kp: string;
  mc: string;
  bm: number;
  sn: string;
  sn_combined: string;
  tg: string;
  grade: string;
  lebar: number;
  berat: number;
  panjang: number;
}

interface InspectFinishRecord {
  id: number;
  kp: string;
  sn_combined: string;
  tgl: string;
  grade: string;
  lebar: number;
  kg: number;
  susut_lusi: number;
  point: number;
}

interface SearchResult {
  sn: string;
  source: 'gray' | 'finish';
  kp: string;
  grade: string;
}

interface RollTraceData {
  sn: string;
  decoded: DecodedSN | null;
  salesContract: SalesContract | null;
  warping: any;
  beam: any;
  weavingRecords: WeavingRecord[];
  indigoRun: any;
  inspectGray: InspectGrayRecord | null;
  bbsfWashing: any[];
  bbsfSanfor: any[];
  inspectFinish: InspectFinishRecord[];
}

function StageCard({ 
  title, 
  icon: Icon, 
  data, 
  details 
}: { 
  title: string; 
  icon: any; 
  data: any; 
  details: { label: string; value: string | number | null; highlight?: boolean }[];
}) {
  const hasData = data !== null && Object.keys(data).length > 0;
  
  return (
    <div 
      className="relative rounded-[32px] p-6"
      style={{
        background: hasData ? '#E0E5EC' : '#E0E5EC',
        boxShadow: hasData 
          ? '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5), inset 0 0 0 1px rgb(22 163 74 / 0.3)'
          : '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
      }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div 
          className="p-2 rounded-[16px]"
          style={{
            background: '#E0E5EC',
            boxShadow: 'inset 4px 4px 8px rgb(163 177 198 / 0.6), inset -4px -4px 8px rgba(255,255,255,0.5)',
            color: hasData ? '#16A34A' : '#9CA3AF',
          }}
        >
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="font-semibold text-lg" style={{ color: '#3D4852' }}>{title}</h3>
        {hasData ? (
          <CheckCircle className="w-5 h-5 ml-auto" style={{ color: '#16A34A' }} />
        ) : (
          <Minus className="w-5 h-5 ml-auto" style={{ color: '#9CA3AF' }} />
        )}
      </div>
      
      {hasData ? (
        <div className="space-y-2">
          {details.map((detail, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span style={{ color: '#6B7280' }}>{detail.label}</span>
              <span className={detail.highlight ? 'font-medium' : ''}
                style={{ 
                  color: detail.highlight ? '#D97706' : '#3D4852',
                }}>
                {detail.value ?? '—'}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm" style={{ color: '#9CA3AF' }}>No data available</p>
      )}
    </div>
  );
}

export default function RollTracePage() {
  const [sn, setSn] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<RollTraceData | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Search for SNs when typing
  useEffect(() => {
    const search = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }
      
      setSearching(true);
      try {
        const result = await authFetch(`/denim/roll-trace/search?q=${encodeURIComponent(searchQuery)}`);
        setSearchResults(result.results || []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    };

    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelectResult = (result: SearchResult) => {
    setSn(result.sn);
    setSearchQuery(result.sn);
    setShowDropdown(false);
    setSearchResults([]);
  };

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!sn.trim()) return;
    
    setLoading(true);
    setError('');
    setData(null);
    
    try {
      const result = await authFetch(`/denim/roll-trace/${encodeURIComponent(sn.trim())}`);
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch roll trace');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#E0E5EC', minHeight: '100vh' }}>
      <PageHeader 
        title="Roll Trace" 
        subtitle="Trace fabric through the entire production pipeline"
      />
      
      <div className="px-4 sm:px-8 pb-8">
        {/* Search with autocomplete */}
        <div className="mb-8" ref={searchRef}>
          <form onSubmit={handleSearch}>
            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#9CA3AF' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value.toUpperCase());
                  setSn(e.target.value.toUpperCase());
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Search SN (e.g. AE04, 182, D03L)"
                className="w-full rounded-[16px] py-3 pl-12 pr-12 text-lg"
                style={{
                  background: '#E0E5EC',
                  color: '#3D4852',
                  boxShadow: 'inset 6px 6px 10px rgb(163 177 198 / 0.6), inset -6px -6px 10px rgba(255,255,255,0.5)',
                  border: 'none',
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSn('');
                    setSearchResults([]);
                    setData(null);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  style={{ color: '#9CA3AF' }}
                >
                  <X className="w-5 h-5" />
                </button>
              )}
              {searching && (
                <Loader2 className="absolute right-12 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin" style={{ color: '#9CA3AF' }} />
              )}
            </div>
          </form>

          {/* Search Results Dropdown */}
          {showDropdown && searchResults.length > 0 && (
            <div 
              className="absolute z-50 mt-2 w-full max-w-2xl rounded-[16px] shadow-lg max-h-80 overflow-y-auto"
              style={{
                background: '#E0E5EC',
                boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
              }}
            >
              {searchResults.map((result, i) => (
                <button
                  key={`${result.sn}-${i}`}
                  onClick={() => handleSelectResult(result)}
                  className="w-full px-4 py-3 text-left flex items-center justify-between"
                  style={{ 
                    borderBottom: '1px solid rgb(163 177 198 / 0.3)',
                    color: '#3D4852',
                  }}
                >
                  <div>
                    <span className="font-mono" style={{ color: '#3D4852' }}>{result.sn}</span>
                    <span className="ml-2 text-xs" style={{ color: '#9CA3AF' }}>via {result.source === 'gray' ? 'Inspect Gray' : 'Inspect Finish'}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm" style={{ color: '#6B7280' }}>{result.kp || 'No KP'}</span>
                    <span className={`ml-2 text-xs px-2 py-0.5 rounded-[9999px]`} style={{ 
                      background: result.grade === 'A' ? '#16A34A' : result.grade === 'B' ? '#D97706' : '#9CA3AF',
                      color: '#fff',
                    }}>
                      {result.grade || 'No grade'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Search Button */}
        <button
          onClick={() => handleSearch()}
          disabled={loading || !sn.trim()}
          className="mb-6 px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed font-medium rounded-[16px] transition-all flex items-center gap-2"
          style={{ 
            background: '#6C63FF', 
            color: '#fff',
            boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
          }}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
          Trace Roll
        </button>
        
        {/* Error */}
        {error && (
          <div 
            className="px-4 py-3 rounded-[16px] mb-6"
            style={{
              background: '#E0E5EC',
              boxShadow: 'inset 6px 6px 10px rgb(220 38 38 / 0.1), inset -6px -6px 10px rgba(255,255,255,0.5)',
              color: '#DC2626',
            }}
          >
            {error}
          </div>
        )}
        
        {/* Results */}
        {data && (
          <div className="space-y-6">
            {/* SN Info */}
            <div 
              className="rounded-[32px] p-6"
              style={{
                background: '#E0E5EC',
                boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
              }}
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="text-sm" style={{ color: '#6B7280' }}>Serial Number</p>
                  <p className="text-2xl font-mono" style={{ color: '#3D4852' }}>{data.sn}</p>
                </div>
                {data.decoded && (
                  <div className="text-right">
                    <p className="text-sm" style={{ color: '#6B7280' }}>Decoded</p>
                    <p className="text-lg" style={{ color: '#D97706' }}>
                      Machine: {data.decoded.machine} | Beam: {data.decoded.beam} | Lot: {data.decoded.lot}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Timeline */}
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-8 top-8 bottom-8 w-0.5" style={{ background: 'rgb(163 177 198 / 0.3)' }} />
              
              <div className="space-y-4">
                {/* Sales Contract */}
                <div className="flex gap-4">
                  <div className="relative z-10">
                    <StageCard
                      title="Sales Contract"
                      icon={Box}
                      data={data.salesContract}
                      details={[
                        { label: 'KP', value: data.salesContract?.kp },
                        { label: 'Item', value: data.salesContract?.item },
                        { label: 'Quantity', value: data.salesContract?.quantity },
                        { label: 'Delivery', value: data.salesContract?.delivery_date ? new Date(data.salesContract.delivery_date).toLocaleDateString() : null },
                      ]}
                    />
                  </div>
                </div>
                
                {/* Warping */}
                <div className="flex gap-4">
                  <div className="relative z-10">
                    <StageCard
                      title="Warping"
                      icon={Layers}
                      data={data.warping}
                      details={[
                        { label: 'KP', value: data.warping?.kp },
                        { label: 'Date', value: data.warping?.tgl ? new Date(data.warping.tgl).toLocaleDateString() : null },
                        { label: 'Total Beam', value: data.warping?.total_beams },
                      ]}
                    />
                  </div>
                </div>
                
                {/* Warping Beam */}
                {data.beam && (
                  <div className="flex gap-4">
                    <div className="relative z-10">
                      <StageCard
                        title="Warping Beam"
                        icon={Scale}
                        data={data.beam}
                        details={[
                          { label: 'Beam Number', value: data.beam?.beam_number },
                          { label: 'Weight (kg)', value: data.beam?.weight_kg, highlight: true },
                          { label: 'Length (m)', value: data.beam?.length_meters },
                        ]}
                      />
                    </div>
                  </div>
                )}
                
                {/* Indigo */}
                <div className="flex gap-4">
                  <div className="relative z-10">
                    <StageCard
                      title="Indigo"
                      icon={Droplets}
                      data={data.indigoRun}
                      details={[
                        { label: 'KP', value: data.indigoRun?.kp },
                        { label: 'Date', value: data.indigoRun?.tanggal ? new Date(data.indigoRun.tanggal).toLocaleDateString() : null },
                        { label: 'BB (kg)', value: data.indigoRun?.bb, highlight: true },
                      ]}
                    />
                  </div>
                </div>
                
                {/* Weaving */}
                <div className="flex gap-4">
                  <div className="relative z-10">
                    <StageCard
                      title="Weaving"
                      icon={Activity}
                      data={data.weavingRecords.length > 0 ? data.weavingRecords[0] : null}
                      details={[
                        { label: 'Machines', value: data.weavingRecords.length },
                        { label: 'Best Efficiency', value: data.weavingRecords[0]?.efficiency ? `${data.weavingRecords[0].efficiency.toFixed(1)}%` : null },
                      ]}
                    />
                  </div>
                </div>
                
                {/* Inspect Gray */}
                <div className="flex gap-4">
                  <div className="relative z-10">
                    <StageCard
                      title="Inspect Gray"
                      icon={Scissors}
                      data={data.inspectGray}
                      details={[
                        { label: 'Machine', value: data.inspectGray?.mc },
                        { label: 'Beam', value: data.inspectGray?.bm },
                        { label: 'Width (cm)', value: data.inspectGray?.lebar, highlight: true },
                        { label: 'Weight (kg)', value: data.inspectGray?.berat },
                        { label: 'Grade', value: data.inspectGray?.grade },
                      ]}
                    />
                  </div>
                </div>
                
                {/* BBSF Washing */}
                {data.bbsfWashing.length > 0 && (
                  <div className="flex gap-4">
                    <div className="relative z-10">
                      <StageCard
                        title="BBSF Washing"
                        icon={Droplets}
                        data={data.bbsfWashing[0]}
                        details={[
                          { label: 'Date', value: data.bbsfWashing[0]?.tgl ? new Date(data.bbsfWashing[0].tgl).toLocaleDateString() : null },
                          { label: 'Speed', value: data.bbsfWashing[0]?.speed },
                          { label: 'Temp', value: data.bbsfWashing[0]?.temp_1 ? `${data.bbsfWashing[0].temp_1}°C` : null },
                        ]}
                      />
                    </div>
                  </div>
                )}
                
                {/* Inspect Finish */}
                <div className="flex gap-4">
                  <div className="relative z-10">
                    <StageCard
                      title="Inspect Finish"
                      icon={CheckCircle}
                      data={data.inspectFinish.length > 0 ? data.inspectFinish[0] : null}
                      details={[
                        { label: 'Rolls Found', value: data.inspectFinish.length },
                        { label: 'Width (cm)', value: data.inspectFinish[0]?.lebar, highlight: true },
                        { label: 'Weight (kg)', value: data.inspectFinish[0]?.kg, highlight: true },
                        { label: 'Shrinkage (%)', value: data.inspectFinish[0]?.susut_lusi, highlight: true },
                        { label: 'Grade', value: data.inspectFinish[0]?.grade },
                        { label: 'Points', value: data.inspectFinish[0]?.point },
                      ]}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
