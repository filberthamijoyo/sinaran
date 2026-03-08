import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import './YarnTestForm.css';
import { API_ENDPOINTS, apiCall } from '../config/api';

const API_BASE_URL = API_ENDPOINTS.quality;

const pad2 = (n) => String(n).padStart(2, '0');
const toYMD = (value) => {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};

const toStr = (value) => {
  if (value === null || value === undefined) return '';
  return String(value);
};

const makeBlankFormData = () => ({
  // Date Information
  testDate: '',
  testMonth: '',
  testYear: new Date().getFullYear(),
  
  // Dimension Fields (Foreign Keys)
  countDescriptionCode: '', // Count Description CODE is the PRIMARY KEY (1-36)
  countNeId: '',
  nominalCount: '',
  lotId: '',
  spkId: '',
  yarnTypeId: '',
  slubCodeId: '',
  supplierId: '',
  millsUnitId: '',
  processStepId: '',
  testTypeId: '',
  machineNo: '',
  sideId: '',
  
  // Spinning Parameters
  sliverRovingNe: '',
  totalDraft: '',
  twistMultiplier: '',
  tpi: '',
  tpm: '',
  actualTwist: '',
  rotorSpindleSpeed: '',
  
  // Count Variation
  meanNe: '',
  minNe: '',
  maxNe: '',
  cvCountPercent: '',
  
  // Strength Properties
  meanStrengthCn: '',
  minStrengthCn: '',
  maxStrengthCn: '',
  cvStrengthPercent: '',
  tenacityCnTex: '',
  elongationPercent: '',
  clsp: '',
  
  // Evenness / Uster Data
  uPercent: '',
  cvB: '',
  cvm: '',
  cvm1m: '',
  cvm3m: '',
  cvm10m: '',
  
  // IPI Faults (Ring Spinning)
  thin50Percent: '',
  thick50Percent: '',
  neps200Percent: '',
  neps280Percent: '',
  ipis: '',
  
  // IPI Faults (Open End)
  oeIpi: '',
  thin30Percent: '',
  thin40Percent: '',
  thick35Percent: '',
  neps140Percent: '',
  shortIpi: '',
  
  // Hairiness & Spectrogram
  hairiness: '',
  sh: '',
  s1uPlusS2u: '',
  s3u: '',
  dr1_5m5Percent: '',
  
  // Remarks
  remarks: ''
});

const normalizeInitialDataToFormData = (initialData) => {
  const blank = makeBlankFormData();
  if (!initialData) return blank;

  // Support both raw DB fields and included relation objects from list endpoint
  return {
    ...blank,
    testDate: toYMD(initialData.testDate),
    testMonth: initialData.testMonth ?? blank.testMonth,
    testYear: initialData.testYear ?? blank.testYear,

    countDescriptionCode: toStr(initialData.countDescriptionCode ?? initialData.countDescription?.code),
    countNeId: toStr(initialData.countNeId ?? initialData.countNe?.id),
    nominalCount: toStr(initialData.nominalCount),
    lotId: toStr(initialData.lotId ?? initialData.lot?.id),
    spkId: toStr(initialData.spkId ?? initialData.spk?.id),
    yarnTypeId: toStr(initialData.yarnTypeId ?? initialData.yarnType?.id),
    slubCodeId: toStr(initialData.slubCodeId ?? initialData.slubCode?.id),
    supplierId: toStr(initialData.supplierId ?? initialData.supplier?.id),
    millsUnitId: toStr(initialData.millsUnitId ?? initialData.millsUnit?.id),
    processStepId: toStr(initialData.processStepId ?? initialData.processStep?.id),
    testTypeId: toStr(initialData.testTypeId ?? initialData.testType?.id),
    machineNo: toStr(initialData.machineNo),
    sideId: toStr(initialData.sideId ?? initialData.side?.id),

    sliverRovingNe: toStr(initialData.sliverRovingNe),
    totalDraft: toStr(initialData.totalDraft),
    twistMultiplier: toStr(initialData.twistMultiplier),
    tpi: toStr(initialData.tpi),
    tpm: toStr(initialData.tpm),
    actualTwist: toStr(initialData.actualTwist),
    rotorSpindleSpeed: toStr(initialData.rotorSpindleSpeed),

    meanNe: toStr(initialData.meanNe),
    minNe: toStr(initialData.minNe),
    maxNe: toStr(initialData.maxNe),
    cvCountPercent: toStr(initialData.cvCountPercent),

    meanStrengthCn: toStr(initialData.meanStrengthCn),
    minStrengthCn: toStr(initialData.minStrengthCn),
    maxStrengthCn: toStr(initialData.maxStrengthCn),
    cvStrengthPercent: toStr(initialData.cvStrengthPercent),
    tenacityCnTex: toStr(initialData.tenacityCnTex),
    elongationPercent: toStr(initialData.elongationPercent),
    clsp: toStr(initialData.clsp),

    uPercent: toStr(initialData.uPercent),
    cvB: toStr(initialData.cvB),
    cvm: toStr(initialData.cvm),
    cvm1m: toStr(initialData.cvm1m),
    cvm3m: toStr(initialData.cvm3m),
    cvm10m: toStr(initialData.cvm10m),

    thin50Percent: toStr(initialData.thin50Percent),
    thick50Percent: toStr(initialData.thick50Percent),
    neps200Percent: toStr(initialData.neps200Percent),
    neps280Percent: toStr(initialData.neps280Percent),
    ipis: toStr(initialData.ipis),

    oeIpi: toStr(initialData.oeIpi),
    thin30Percent: toStr(initialData.thin30Percent),
    thin40Percent: toStr(initialData.thin40Percent),
    thick35Percent: toStr(initialData.thick35Percent),
    neps140Percent: toStr(initialData.neps140Percent),
    shortIpi: toStr(initialData.shortIpi),

    hairiness: toStr(initialData.hairiness),
    sh: toStr(initialData.sh),
    s1uPlusS2u: toStr(initialData.s1uPlusS2u),
    s3u: toStr(initialData.s3u),
    dr1_5m5Percent: toStr(initialData.dr1_5m5Percent),

    remarks: toStr(initialData.remarks)
  };
};

const YarnTestForm = ({ mode = 'create', initialData = null, onSuccess, onCancel, embedded = false }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const duplicateId = searchParams.get('duplicate');
  
  // Determine mode from URL params or props
  const actualMode = editId ? 'edit' : duplicateId ? 'duplicate' : mode;
  const testId = editId || duplicateId || initialData?.id;
  const isEdit = actualMode === 'edit';
  const isDuplicate = actualMode === 'duplicate';
  
  const [formData, setFormData] = useState(() =>
    initialData ? normalizeInitialDataToFormData(initialData) : makeBlankFormData()
  );
  const [loadingTestData, setLoadingTestData] = useState(false);

  // Fetch test data if edit/duplicate ID is in URL
  useEffect(() => {
    const fetchTestData = async () => {
      if (!testId || initialData) return; // Skip if we already have initialData
      
      setLoadingTestData(true);
      try {
        const data = await apiCall(`${API_BASE_URL}/yarn-tests/${testId}`);
        setFormData(normalizeInitialDataToFormData(data));
      } catch (error) {
        console.error('Error fetching test data:', error);
        alert(`Error loading test data: ${error.message || 'Failed to load'}`);
        // Clear URL params on error
        setSearchParams({});
      } finally {
        setLoadingTestData(false);
      }
    };
    
    fetchTestData();
  }, [testId, initialData, setSearchParams]);

  // Keep form state in sync when opening the form with different initial data (e.g., Edit/Duplicate).
  useEffect(() => {
    if (initialData) {
      setFormData(normalizeInitialDataToFormData(initialData));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, testId, initialData]);

  // State for dropdown data (loaded from API)
  const [countDescriptions, setCountDescriptions] = useState([]);
  const [countNe, setCountNe] = useState([]);
  const [lots, setLots] = useState([]);
  const [spks, setSpks] = useState([]);
  const [yarnTypes, setYarnTypes] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [millsUnits, setMillsUnits] = useState([]);
  const [processSteps, setProcessSteps] = useState([]);
  const [testTypes, setTestTypes] = useState([]);
  const [sides, setSides] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Fetch dropdown data from API
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [
          countDescRes,
          countNeRes,
          lotsRes,
          spksRes,
          yarnTypesRes,
          suppliersRes,
          millsUnitsRes,
          processStepsRes,
          testTypesRes,
          sidesRes
        ] = await Promise.all([
          fetch(`${API_BASE_URL}/count-descriptions`),
          fetch(`${API_ENDPOINTS.production}/counts`),
          fetch(`${API_BASE_URL}/lots`),
          fetch(`${API_BASE_URL}/spks`),
          fetch(`${API_BASE_URL}/yarn-types`),
          fetch(`${API_BASE_URL}/suppliers`),
          fetch(`${API_BASE_URL}/mills-units`),
          fetch(`${API_BASE_URL}/process-steps`),
          fetch(`${API_BASE_URL}/test-types`),
          fetch(`${API_BASE_URL}/sides`)
        ]);
        
        const countDescData = await countDescRes.json();
        const countNeData = await countNeRes.json();
        const lotsData = await lotsRes.json();
        const spksData = await spksRes.json();
        const yarnTypesData = await yarnTypesRes.json();
        const suppliersData = await suppliersRes.json();
        const millsUnitsData = await millsUnitsRes.json();
        const processStepsData = await processStepsRes.json();
        const testTypesData = await testTypesRes.json();
        const sidesData = await sidesRes.json();
        
        setCountDescriptions(countDescData);
        setCountNe(countNeData);
        setLots(lotsData);
        setSpks(spksData);
        setYarnTypes(yarnTypesData);
        setSuppliers(suppliersData);
        setMillsUnits(millsUnitsData);
        setProcessSteps(processStepsData);
        setTestTypes(testTypesData);
        setSides(sidesData);
      } catch (error) {
        console.error('Error fetching dropdown data:', error);
        // Fallback to empty arrays on error
        setCountDescriptions([]);
        setCountNe([]);
        setLots([]);
        setSpks([]);
        setYarnTypes([]);
        setSuppliers([]);
        setMillsUnits([]);
        setProcessSteps([]);
        setTestTypes([]);
        setSides([]);
      }
    };

    fetchDropdownData();
  }, []);

  // When editing, re-populate form when selected record changes
  useEffect(() => {
    if (!isEdit) return;
    setFormData(normalizeInitialDataToFormData(initialData));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, initialData?.id]);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Calculation functions
  const calculateTotalDraft = (nominal, sliver) => {
    if (nominal && sliver && sliver !== 0) {
      return (nominal / sliver).toFixed(2);
    }
    return '';
  };

  const calculateTPI = (nominal, tm) => {
    if (nominal && tm) {
      return (Math.sqrt(nominal) * tm).toFixed(2);
    }
    return '';
  };

  const calculateTPM = (tpi) => {
    if (tpi) {
      return (tpi * 39.37).toFixed(2);
    }
    return '';
  };

  const calculateTenacity = (meanNe, meanStrength) => {
    if (meanNe && meanStrength) {
      return (meanNe * meanStrength * 0.001693).toFixed(2);
    }
    return '';
  };

  const calculateCLSP = (meanStrength, meanNe) => {
    if (meanStrength && meanNe) {
      return (((meanStrength / 0.9807) * 1.6934 * meanNe * 156.2) / 1000).toFixed(2);
    }
    return '';
  };

  const calculateIPIs = (thin50, thick50, neps200) => {
    const result = (parseInt(thin50) || 0) + (parseInt(thick50) || 0) + (parseInt(neps200) || 0);
    return result || '';
  };

  const calculateOEIPI = (thin50, thick50, neps280) => {
    const result = (parseInt(thin50) || 0) + (parseInt(thick50) || 0) + (parseInt(neps280) || 0);
    return result || '';
  };

  const calculateShortIPI = (thin40, thick35, neps140) => {
    const result = (parseInt(thin40) || 0) + (parseInt(thick35) || 0) + (parseInt(neps140) || 0);
    return result || '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedData = {
      ...formData,
      [name]: value
    };
    setFormData(updatedData);

    // Auto-calculate dependent fields
    if (name === 'nominalCount' || name === 'sliverRovingNe') {
      const totalDraft = calculateTotalDraft(
        name === 'nominalCount' ? parseFloat(value) : parseFloat(updatedData.nominalCount),
        name === 'sliverRovingNe' ? parseFloat(value) : parseFloat(updatedData.sliverRovingNe)
      );
      if (totalDraft) {
        setFormData(prev => ({ ...prev, [name]: value, totalDraft }));
      }
    }
    
    if (name === 'nominalCount' || name === 'twistMultiplier') {
      const tpi = calculateTPI(
        name === 'nominalCount' ? parseFloat(value) : parseFloat(updatedData.nominalCount),
        name === 'twistMultiplier' ? parseFloat(value) : parseFloat(updatedData.twistMultiplier)
      );
      if (tpi) {
        const tpm = calculateTPM(parseFloat(tpi));
        setFormData(prev => ({ ...prev, [name]: value, tpi, tpm }));
      }
    }
    
    if (name === 'tpi') {
      const tpm = calculateTPM(parseFloat(value));
      if (tpm) {
        setFormData(prev => ({ ...prev, tpm }));
      }
    }
    
    if (name === 'meanNe' || name === 'meanStrengthCn') {
      const tenacity = calculateTenacity(
        name === 'meanNe' ? parseFloat(value) : parseFloat(updatedData.meanNe),
        name === 'meanStrengthCn' ? parseFloat(value) : parseFloat(updatedData.meanStrengthCn)
      );
      const clsp = calculateCLSP(
        name === 'meanStrengthCn' ? parseFloat(value) : parseFloat(updatedData.meanStrengthCn),
        name === 'meanNe' ? parseFloat(value) : parseFloat(updatedData.meanNe)
      );
      if (tenacity || clsp) {
        setFormData(prev => ({ ...prev, [name]: value, tenacityCnTex: tenacity, clsp }));
      }
    }
    
    if (name === 'thin50Percent' || name === 'thick50Percent' || name === 'neps200Percent') {
      const ipis = calculateIPIs(
        name === 'thin50Percent' ? value : updatedData.thin50Percent,
        name === 'thick50Percent' ? value : updatedData.thick50Percent,
        name === 'neps200Percent' ? value : updatedData.neps200Percent
      );
      setFormData(prev => ({ ...prev, [name]: value, ipis }));
    }
    
    if (name === 'thin50Percent' || name === 'thick50Percent' || name === 'neps280Percent') {
      const oeIpi = calculateOEIPI(
        name === 'thin50Percent' ? value : updatedData.thin50Percent,
        name === 'thick50Percent' ? value : updatedData.thick50Percent,
        name === 'neps280Percent' ? value : updatedData.neps280Percent
      );
      setFormData(prev => ({ ...prev, [name]: value, oeIpi }));
    }
    
    if (name === 'thin40Percent' || name === 'thick35Percent' || name === 'neps140Percent') {
      const shortIpi = calculateShortIPI(
        name === 'thin40Percent' ? value : updatedData.thin40Percent,
        name === 'thick35Percent' ? value : updatedData.thick35Percent,
        name === 'neps140Percent' ? value : updatedData.neps140Percent
      );
      setFormData(prev => ({ ...prev, [name]: value, shortIpi }));
    }
  };

  const handleDateChange = (e) => {
    const date = new Date(e.target.value);
    setFormData(prev => ({
      ...prev,
      testDate: e.target.value,
      testMonth: months[date.getMonth()],
      testYear: date.getFullYear()
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      if (isEdit && !testId) {
        throw new Error('Missing test id for edit');
      }

      // For duplicate mode, create a new entry (don't include id)
      const submitData = isDuplicate ? { ...formData, id: undefined } : formData;
      const url = isEdit ? `${API_BASE_URL}/yarn-tests/${testId}` : `${API_BASE_URL}/yarn-tests`;
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData)
      });
      
      if (response.ok) {
        const data = await response.json();
        // Clear URL params after successful submission
        if (editId || duplicateId) {
          setSearchParams({});
        }
        if (isEdit) {
          alert('Test data updated successfully!');
          if (typeof onSuccess === 'function') onSuccess(data);
        } else {
          alert(isDuplicate ? 'Test data duplicated successfully!' : 'Test data saved successfully!');
          handleReset();
          if (typeof onSuccess === 'function') onSuccess(data);
        }
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to save data'}`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to save data. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset the form?')) {
      setFormData(initialData ? normalizeInitialDataToFormData(initialData) : makeBlankFormData());
    }
  };

  if (loadingTestData) {
    return (
      <div className={`yarn-test-form-container${embedded ? ' embedded' : ''}`}>
        <div className="form-header">
          <h2>Loading...</h2>
          <p>Loading test data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`yarn-test-form-container${embedded ? ' embedded' : ''}`}>
      <div className="form-header">
        <h2>{isEdit ? 'Edit Yarn Test Entry' : isDuplicate ? 'Duplicate Yarn Test Entry' : 'New Yarn Test Entry'}</h2>
        <p>{isEdit ? 'Update yarn quality test data below' : isDuplicate ? 'Create a copy of this yarn quality test data below' : 'Enter yarn quality test data below'}</p>
      </div>

      <form onSubmit={handleSubmit} className="yarn-test-form">
        {/* Section 1: Identification */}
        <div className="form-section">
          <h3 className="section-title">1. Identification</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="testDate">Test Date <span className="required">*</span></label>
              <input
                type="date"
                id="testDate"
                name="testDate"
                value={formData.testDate}
                onChange={handleDateChange}
                required
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="countDescriptionCode">Count Description <span className="required">*</span></label>
              <select
                id="countDescriptionCode"
                name="countDescriptionCode"
                value={formData.countDescriptionCode}
                onChange={handleChange}
                required
                className="form-control"
              >
                <option value="">Select Count Description</option>
                {countDescriptions.map(item => (
                  <option key={item.code} value={item.code}>{item.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="nominalCount">Nominal Count</label>
              <input
                type="number"
                id="nominalCount"
                name="nominalCount"
                value={formData.nominalCount}
                onChange={handleChange}
                step="0.01"
                className="form-control"
                placeholder="e.g., 7, 10, 16"
              />
            </div>

            <div className="form-group">
              <label htmlFor="countNeId">Count NE (Optional)</label>
              <select
                id="countNeId"
                name="countNeId"
                value={formData.countNeId}
                onChange={handleChange}
                className="form-control"
              >
                <option value="">Choose Count NE</option>
                {countNe.map(item => (
                  <option key={item.id} value={item.id}>{item.value}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="lotId">Lot <span className="required">*</span></label>
              <select
                id="lotId"
                name="lotId"
                value={formData.lotId}
                onChange={handleChange}
                required
                className="form-control"
              >
                <option value="">Select Lot</option>
                {lots.map(item => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="spkId">SPK <span className="required">*</span></label>
              <select
                id="spkId"
                name="spkId"
                value={formData.spkId}
                onChange={handleChange}
                required
                className="form-control"
              >
                <option value="">Select SPK</option>
                {spks.map(item => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="yarnTypeId">Yarn Type <span className="required">*</span></label>
              <select
                id="yarnTypeId"
                name="yarnTypeId"
                value={formData.yarnTypeId}
                onChange={handleChange}
                required
                className="form-control"
              >
                <option value="">Select Yarn Type</option>
                {yarnTypes.map(item => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="slubCodeId">Slub Code</label>
              <input
                type="text"
                id="slubCodeId"
                name="slubCodeId"
                value={formData.slubCodeId}
                onChange={handleChange}
                className="form-control"
                placeholder="e.g., 107"
              />
            </div>

            <div className="form-group">
              <label htmlFor="supplierId">Supplier <span className="required">*</span></label>
              <select
                id="supplierId"
                name="supplierId"
                value={formData.supplierId}
                onChange={handleChange}
                required
                className="form-control"
              >
                <option value="">Select Supplier</option>
                {suppliers.map(item => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="millsUnitId">Mills Unit <span className="required">*</span></label>
              <select
                id="millsUnitId"
                name="millsUnitId"
                value={formData.millsUnitId}
                onChange={handleChange}
                required
                className="form-control"
              >
                <option value="">Select Mills Unit</option>
                {millsUnits.map(item => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="processStepId">Process Step <span className="required">*</span></label>
              <select
                id="processStepId"
                name="processStepId"
                value={formData.processStepId}
                onChange={handleChange}
                required
                className="form-control"
              >
                <option value="">Select Process Step</option>
                {processSteps.map(item => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="testTypeId">Test Type <span className="required">*</span></label>
              <select
                id="testTypeId"
                name="testTypeId"
                value={formData.testTypeId}
                onChange={handleChange}
                required
                className="form-control"
              >
                <option value="">Select Test Type</option>
                {testTypes.map(item => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="machineNo">Machine No.</label>
              <input
                type="number"
                id="machineNo"
                name="machineNo"
                value={formData.machineNo}
                onChange={handleChange}
                className="form-control"
                placeholder="e.g., 1"
              />
            </div>

            <div className="form-group">
              <label htmlFor="sideId">Side <span className="required">*</span></label>
              <select
                id="sideId"
                name="sideId"
                value={formData.sideId}
                onChange={handleChange}
                required
                className="form-control"
              >
                <option value="">Select Side</option>
                {sides.map(item => (
                  <option key={item.id || item.code} value={item.id}>{item.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Spinning Parameters */}
        <div className="form-section">
          <h3 className="section-title">2. Spinning Parameters</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="sliverRovingNe">Sliver / Roving (Ne)</label>
              <input
                type="number"
                id="sliverRovingNe"
                name="sliverRovingNe"
                value={formData.sliverRovingNe}
                onChange={handleChange}
                step="0.001"
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="totalDraft">Total Draft (Auto-calculated)</label>
              <input
                type="number"
                id="totalDraft"
                name="totalDraft"
                value={formData.totalDraft}
                readOnly
                className="form-control"
                style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="twistMultiplier">Twist Multiplier (TM)</label>
              <input
                type="number"
                id="twistMultiplier"
                name="twistMultiplier"
                value={formData.twistMultiplier}
                onChange={handleChange}
                step="0.01"
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="tpi">TPI (Twists Per Inch) (Auto-calculated)</label>
              <input
                type="number"
                id="tpi"
                name="tpi"
                value={formData.tpi}
                readOnly
                className="form-control"
                style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="tpm">TPM (Twists Per Meter) (Auto-calculated)</label>
              <input
                type="number"
                id="tpm"
                name="tpm"
                value={formData.tpm}
                readOnly
                className="form-control"
                style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="actualTwist">Actual Twist</label>
              <input
                type="number"
                id="actualTwist"
                name="actualTwist"
                value={formData.actualTwist}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="rotorSpindleSpeed">Rotor / Spindle Speed</label>
              <input
                type="number"
                id="rotorSpindleSpeed"
                name="rotorSpindleSpeed"
                value={formData.rotorSpindleSpeed}
                onChange={handleChange}
                className="form-control"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Count Variation */}
        <div className="form-section">
          <h3 className="section-title">3. Count Variation (Evenness)</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="meanNe">Mean Ne</label>
              <input
                type="number"
                id="meanNe"
                name="meanNe"
                value={formData.meanNe}
                onChange={handleChange}
                step="0.01"
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="minNe">Min Ne</label>
              <input
                type="number"
                id="minNe"
                name="minNe"
                value={formData.minNe}
                onChange={handleChange}
                step="0.01"
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="maxNe">Max Ne</label>
              <input
                type="number"
                id="maxNe"
                name="maxNe"
                value={formData.maxNe}
                onChange={handleChange}
                step="0.01"
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="cvCountPercent">CV% Count</label>
              <input
                type="number"
                id="cvCountPercent"
                name="cvCountPercent"
                value={formData.cvCountPercent}
                onChange={handleChange}
                step="0.01"
                className="form-control"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Strength Properties */}
        <div className="form-section">
          <h3 className="section-title">4. Strength Properties</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="meanStrengthCn">Mean Strength (CN)</label>
              <input
                type="number"
                id="meanStrengthCn"
                name="meanStrengthCn"
                value={formData.meanStrengthCn}
                onChange={handleChange}
                step="0.01"
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="minStrengthCn">Min Strength (CN)</label>
              <input
                type="number"
                id="minStrengthCn"
                name="minStrengthCn"
                value={formData.minStrengthCn}
                onChange={handleChange}
                step="0.01"
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="maxStrengthCn">Max Strength (CN)</label>
              <input
                type="number"
                id="maxStrengthCn"
                name="maxStrengthCn"
                value={formData.maxStrengthCn}
                onChange={handleChange}
                step="0.01"
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="cvStrengthPercent">CV% Strength</label>
              <input
                type="number"
                id="cvStrengthPercent"
                name="cvStrengthPercent"
                value={formData.cvStrengthPercent}
                onChange={handleChange}
                step="0.01"
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="tenacityCnTex">Tenacity (CN/Tex) (Auto-calculated)</label>
              <input
                type="number"
                id="tenacityCnTex"
                name="tenacityCnTex"
                value={formData.tenacityCnTex}
                readOnly
                className="form-control"
                style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="elongationPercent">Elongation (%)</label>
              <input
                type="number"
                id="elongationPercent"
                name="elongationPercent"
                value={formData.elongationPercent}
                onChange={handleChange}
                step="0.01"
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="clsp">CLSP (Auto-calculated)</label>
              <input
                type="number"
                id="clsp"
                name="clsp"
                value={formData.clsp}
                readOnly
                className="form-control"
                style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
              />
            </div>
          </div>
        </div>

        {/* Section 5: Evenness / Uster Data */}
        <div className="form-section">
          <h3 className="section-title">5. Evenness / Uster Data</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="uPercent">U%</label>
              <input
                type="number"
                id="uPercent"
                name="uPercent"
                value={formData.uPercent}
                onChange={handleChange}
                step="0.01"
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="cvB">CVb</label>
              <input
                type="number"
                id="cvB"
                name="cvB"
                value={formData.cvB}
                onChange={handleChange}
                step="0.01"
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="cvm">CVm</label>
              <input
                type="number"
                id="cvm"
                name="cvm"
                value={formData.cvm}
                onChange={handleChange}
                step="0.01"
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="cvm1m">CVm 1m</label>
              <input
                type="number"
                id="cvm1m"
                name="cvm1m"
                value={formData.cvm1m}
                onChange={handleChange}
                step="0.01"
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="cvm3m">CVm 3m</label>
              <input
                type="number"
                id="cvm3m"
                name="cvm3m"
                value={formData.cvm3m}
                onChange={handleChange}
                step="0.01"
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="cvm10m">CVm 10m</label>
              <input
                type="number"
                id="cvm10m"
                name="cvm10m"
                value={formData.cvm10m}
                onChange={handleChange}
                step="0.01"
                className="form-control"
              />
            </div>
          </div>
        </div>

        {/* Section 6: IPI Faults (Ring Spinning) */}
        <div className="form-section">
          <h3 className="section-title">6. IPI Faults (Ring Spinning)</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="thin50Percent">Thin-50%</label>
              <input
                type="number"
                id="thin50Percent"
                name="thin50Percent"
                value={formData.thin50Percent}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="thick50Percent">Thick+50%</label>
              <input
                type="number"
                id="thick50Percent"
                name="thick50Percent"
                value={formData.thick50Percent}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="neps200Percent">Neps+200%</label>
              <input
                type="number"
                id="neps200Percent"
                name="neps200Percent"
                value={formData.neps200Percent}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="neps280Percent">Neps+280%</label>
              <input
                type="number"
                id="neps280Percent"
                name="neps280Percent"
                value={formData.neps280Percent}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="ipis">IPIs (Auto-calculated)</label>
              <input
                type="number"
                id="ipis"
                name="ipis"
                value={formData.ipis}
                readOnly
                className="form-control"
                style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
              />
            </div>
          </div>
        </div>

        {/* Section 7: IPI Faults (Open End) */}
        <div className="form-section">
          <h3 className="section-title">7. IPI Faults (Open End)</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="oeIpi">OE IPI (Auto-calculated)</label>
              <input
                type="number"
                id="oeIpi"
                name="oeIpi"
                value={formData.oeIpi}
                readOnly
                className="form-control"
                style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="thin30Percent">Thin-30%</label>
              <input
                type="number"
                id="thin30Percent"
                name="thin30Percent"
                value={formData.thin30Percent}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="thin40Percent">Thin-40%</label>
              <input
                type="number"
                id="thin40Percent"
                name="thin40Percent"
                value={formData.thin40Percent}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="thick35Percent">Thick+35%</label>
              <input
                type="number"
                id="thick35Percent"
                name="thick35Percent"
                value={formData.thick35Percent}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="neps140Percent">Neps+140%</label>
              <input
                type="number"
                id="neps140Percent"
                name="neps140Percent"
                value={formData.neps140Percent}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="shortIpi">Short IPI (Auto-calculated)</label>
              <input
                type="number"
                id="shortIpi"
                name="shortIpi"
                value={formData.shortIpi}
                readOnly
                className="form-control"
                style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
              />
            </div>
          </div>
        </div>

        {/* Section 8: Hairiness & Spectrogram */}
        <div className="form-section">
          <h3 className="section-title">8. Hairiness & Spectrogram</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="hairiness">Hairiness</label>
              <input
                type="number"
                id="hairiness"
                name="hairiness"
                value={formData.hairiness}
                onChange={handleChange}
                step="0.01"
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="sh">Sh</label>
              <input
                type="number"
                id="sh"
                name="sh"
                value={formData.sh}
                onChange={handleChange}
                step="0.01"
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="s1uPlusS2u">S1u + S2u</label>
              <input
                type="number"
                id="s1uPlusS2u"
                name="s1uPlusS2u"
                value={formData.s1uPlusS2u}
                onChange={handleChange}
                step="0.01"
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="s3u">S3u</label>
              <input
                type="number"
                id="s3u"
                name="s3u"
                value={formData.s3u}
                onChange={handleChange}
                step="0.01"
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="dr1_5m5Percent">DR 1.5m 5% (%)</label>
              <input
                type="number"
                id="dr1_5m5Percent"
                name="dr1_5m5Percent"
                value={formData.dr1_5m5Percent}
                onChange={handleChange}
                step="0.01"
                className="form-control"
              />
            </div>
          </div>
        </div>

        {/* Section 9: Remarks */}
        <div className="form-section">
          <h3 className="section-title">9. Remarks</h3>
          <div className="form-group full-width">
            <label htmlFor="remarks">Remarks</label>
            <textarea
              id="remarks"
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              rows="4"
              className="form-control"
              placeholder="Enter any additional remarks or notes..."
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          {embedded && typeof onCancel === 'function' && (
            <button type="button" onClick={onCancel} className="btn btn-secondary" disabled={submitting}>
              Cancel
            </button>
          )}
          <button type="button" onClick={handleReset} className="btn btn-secondary" disabled={submitting}>
            Reset Form
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Submitting...' : isEdit ? 'Update Test Data' : 'Submit Test Data'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default YarnTestForm;

