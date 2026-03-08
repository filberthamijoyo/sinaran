module.exports = [
"[project]/apps/frontend/lib/api.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "API_ENDPOINTS",
    ()=>API_ENDPOINTS,
    "apiCall",
    ()=>apiCall,
    "default",
    ()=>__TURBOPACK__default__export__,
    "fetchJson",
    ()=>fetchJson
]);
const getApiUrl = ()=>{
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost";
    const port = process.env.NEXT_PUBLIC_API_PORT;
    // Production URLs (https://...) should not have port appended; localhost needs :3001
    const isProductionUrl = baseUrl.startsWith("https://") || baseUrl.startsWith("http://") && !baseUrl.includes("localhost");
    const effectivePort = port || (isProductionUrl ? "" : "3001");
    const base = baseUrl.replace(/\/$/, "");
    return effectivePort ? `${base}:${effectivePort}/api` : `${base}/api`;
};
const apiBase = getApiUrl();
const API_ENDPOINTS = {
    quality: `${apiBase}/quality`,
    production: `${apiBase}/production`,
    unified: `${apiBase}/unified`,
    indigo: `${apiBase}/indigo`,
    weaving: `${apiBase}/weaving`,
    warping: `${apiBase}/warping`,
    sacon: `${apiBase}/sacon`,
    denim: `${apiBase}/denim`,
    // Inspect Gray division (greige inspection) – defaults to /inspect-gray,
    // but the InspectGrayDivisionPage will also fall back to /quality/inspect-gray if needed.
    inspectGray: `${apiBase}/inspect-gray`
};
const safeParseJson = (text)=>{
    const trimmed = text.trim();
    if (!trimmed) return null;
    return JSON.parse(trimmed);
};
const formatBodySnippet = (text, maxLen = 280)=>{
    const oneLine = text.replace(/\s+/g, " ").trim();
    if (oneLine.length <= maxLen) return oneLine;
    return `${oneLine.slice(0, maxLen)}…`;
};
const fetchJson = async (url, options = {})=>{
    const response = await fetch(url, options);
    const contentType = response.headers.get("content-type") || "";
    const text = await response.text();
    if (!response.ok) {
        // Try to read `{ error: string }` style errors, otherwise include a snippet.
        try {
            const parsed = safeParseJson(text);
            const msg = parsed?.error || parsed?.message;
            throw new Error(msg || `HTTP ${response.status}: ${response.statusText}`);
        } catch (e) {
            const snippet = formatBodySnippet(text);
            const hint = snippet ? ` Body: ${snippet}` : "";
            throw new Error(`HTTP ${response.status}: ${response.statusText} (${url}).${hint}`);
        }
    }
    // Success: if server returns empty body (e.g., 204) treat as null.
    if (!text.trim()) return null;
    try {
        return safeParseJson(text);
    } catch (e) {
        const snippet = formatBodySnippet(text);
        const ctHint = contentType ? ` content-type=${contentType};` : "";
        throw new Error(`Expected JSON but could not parse (${url});${ctHint} body: ${snippet || "(empty)"}`);
    }
};
const apiCall = async (url, options = {})=>{
    const { body, headers = {}, ...fetchOptions } = options;
    const defaultOptions = {
        headers: {
            "Content-Type": "application/json",
            ...headers
        },
        ...fetchOptions
    };
    // Stringify body if it's a plain object
    if (body && typeof body === "object" && !(body instanceof FormData)) {
        defaultOptions.body = JSON.stringify(body);
    } else if (body) {
        // Allow callers to pass a pre-built BodyInit (string, FormData, etc.)
        defaultOptions.body = body;
    }
    try {
        return await fetchJson(url, defaultOptions);
    } catch (error) {
        // Handle network errors (server not running, CORS, etc.)
        if (error instanceof TypeError && error.message.includes("fetch")) {
            throw new Error(`Network error: Unable to connect to ${url}. Is the API server running?`);
        }
        // Re-throw if it's already an Error with a message
        if (error instanceof Error) {
            throw error;
        }
        // Fallback for unexpected error types
        throw new Error(error?.toString() || "Unknown error occurred");
    }
};
const __TURBOPACK__default__export__ = API_ENDPOINTS;
}),
"[project]/apps/frontend/lib/numberFormat.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "formatDecimal",
    ()=>formatDecimal,
    "formatDecimalInput",
    ()=>formatDecimalInput,
    "formatInteger",
    ()=>formatInteger,
    "formatIntegerInput",
    ()=>formatIntegerInput,
    "parseLocalizedNumber",
    ()=>parseLocalizedNumber
]);
const LOCALE = "id-ID";
const parseLocalizedNumber = (value)=>{
    if (value === null || value === undefined) return null;
    if (typeof value === "number") return value;
    const trimmed = value.toString().trim();
    if (!trimmed) return null;
    // If string already looks like a plain JS number, parse directly
    if (/^[+-]?\d+(\.\d+)?$/.test(trimmed)) {
        const direct = Number(trimmed);
        return Number.isNaN(direct) ? null : direct;
    }
    // Treat "." as thousands and "," as decimal for typical ID formatting
    const normalized = trimmed.replace(/\./g, "").replace(",", ".");
    const num = Number(normalized);
    return Number.isNaN(num) ? null : num;
};
const formatDecimal = (value, decimals = 2)=>{
    if (value === null || value === undefined || value === "") return "-";
    const num = typeof value === "number" ? value : parseLocalizedNumber(value);
    if (num === null) return "-";
    return num.toLocaleString(LOCALE, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
};
const formatInteger = (value)=>{
    if (value === null || value === undefined || value === "") return "-";
    const num = typeof value === "number" ? value : parseLocalizedNumber(value);
    if (num === null) return "-";
    return num.toLocaleString(LOCALE, {
        maximumFractionDigits: 0
    });
};
const formatDecimalInput = (value, decimals = 2)=>{
    if (value === null || value === undefined || value === "") return "";
    const num = typeof value === "number" ? value : parseLocalizedNumber(value);
    if (num === null) return "";
    return num.toLocaleString(LOCALE, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
};
const formatIntegerInput = (value)=>{
    if (value === null || value === undefined || value === "") return "";
    const num = typeof value === "number" ? value : parseLocalizedNumber(value);
    if (num === null) return "";
    return num.toLocaleString(LOCALE, {
        maximumFractionDigits: 0
    });
};
}),
"[project]/apps/frontend/components/YarnQualityFormPage.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>YarnQualityFormPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/frontend/lib/api.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$lib$2f$numberFormat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/frontend/lib/numberFormat.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
const API_BASE_URL = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["API_ENDPOINTS"].quality;
const pad2 = (n)=>String(n).padStart(2, '0');
const toYMD = (value)=>{
    if (!value) return '';
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};
const toStr = (value)=>{
    if (value === null || value === undefined) return '';
    return String(value);
};
// Mapping of text fields that should use dropdown UI instead of free text.
// We keep the existing `*Input` fields for display, but the actual selected
// value is the corresponding `*Id` field stored in the form row, similar to
// how the Production form works.
const DROPDOWN_FIELD_CONFIG = {
    countNeIdInput: {
        idField: 'countNeId',
        sourceKey: 'countNe'
    },
    lotInput: {
        idField: 'lotId',
        sourceKey: 'lots'
    },
    spkInput: {
        idField: 'spkId',
        sourceKey: 'spks'
    },
    yarnTypeInput: {
        idField: 'yarnTypeId',
        sourceKey: 'yarnTypes'
    },
    blendInput: {
        idField: 'blendId',
        sourceKey: 'blends'
    },
    slubCodeInput: {
        idField: 'slubCodeId',
        sourceKey: 'slubCodes'
    },
    supplierInput: {
        idField: 'supplierId',
        sourceKey: 'suppliers'
    },
    millsUnitInput: {
        idField: 'millsUnitId',
        sourceKey: 'millsUnits'
    },
    processStepInput: {
        idField: 'processStepId',
        sourceKey: 'processSteps'
    },
    testTypeInput: {
        idField: 'testTypeId',
        sourceKey: 'testTypes'
    },
    sideInput: {
        idField: 'sideId',
        sourceKey: 'sides'
    }
};
const YARN_COLUMNS = [
    // Identification / dimensions
    {
        id: 'testDate',
        label: 'Test Date',
        type: 'date',
        placeholder: 'YYYY-MM-DD'
    },
    {
        id: 'countDescriptionCode',
        label: 'Count Desc (Auto)',
        type: 'readonly'
    },
    {
        id: 'countNeIdInput',
        label: 'Count NE',
        type: 'text',
        placeholder: 'e.g. 30'
    },
    {
        id: 'lotInput',
        label: 'Lot',
        type: 'text',
        placeholder: 'Lot (e.g. 1000.0)'
    },
    {
        id: 'spkInput',
        label: 'SPK',
        type: 'text',
        placeholder: 'SPK name'
    },
    {
        id: 'yarnTypeInput',
        label: 'Yarn Type',
        type: 'text',
        placeholder: 'Yarn type'
    },
    {
        id: 'blendInput',
        label: 'Blend',
        type: 'text',
        placeholder: 'Blend (optional)'
    },
    {
        id: 'slubCodeInput',
        label: 'Slub Code',
        type: 'text',
        placeholder: 'Code (opt.)'
    },
    {
        id: 'supplierInput',
        label: 'Supplier',
        type: 'text',
        placeholder: 'Supplier'
    },
    {
        id: 'millsUnitInput',
        label: 'Mills Unit',
        type: 'text',
        placeholder: 'Unit'
    },
    {
        id: 'processStepInput',
        label: 'Process Step',
        type: 'text',
        placeholder: 'Process step'
    },
    {
        id: 'testTypeInput',
        label: 'Test Type',
        type: 'text',
        placeholder: 'Test type'
    },
    {
        id: 'machineNo',
        label: 'Machine No',
        type: 'number'
    },
    {
        id: 'sideInput',
        label: 'Side',
        type: 'text',
        placeholder: 'A/B/...'
    },
    // Spinning parameters
    {
        id: 'sliverRovingNe',
        label: 'Sliver/Roving Ne',
        type: 'number'
    },
    {
        id: 'totalDraft',
        label: 'Total Draft (Auto)',
        type: 'readonly'
    },
    {
        id: 'twistMultiplier',
        label: 'TM',
        type: 'number'
    },
    {
        id: 'tpi',
        label: 'TPI (Auto)',
        type: 'readonly'
    },
    {
        id: 'tpm',
        label: 'TPM (Auto)',
        type: 'readonly'
    },
    {
        id: 'actualTwist',
        label: 'Actual Twist',
        type: 'number'
    },
    {
        id: 'rotorSpindleSpeed',
        label: 'Rotor/Spindle Speed',
        type: 'number'
    },
    // Count variation
    {
        id: 'meanNe',
        label: 'Mean Ne',
        type: 'number'
    },
    {
        id: 'minNe',
        label: 'Min Ne',
        type: 'number'
    },
    {
        id: 'maxNe',
        label: 'Max Ne',
        type: 'number'
    },
    {
        id: 'cvCountPercent',
        label: 'CV% Count',
        type: 'number'
    },
    // Strength properties
    {
        id: 'meanStrengthCn',
        label: 'Mean Strength (CN)',
        type: 'number'
    },
    {
        id: 'minStrengthCn',
        label: 'Min Strength (CN)',
        type: 'number'
    },
    {
        id: 'maxStrengthCn',
        label: 'Max Strength (CN)',
        type: 'number'
    },
    {
        id: 'cvStrengthPercent',
        label: 'CV% Strength',
        type: 'number'
    },
    {
        id: 'tenacityCnTex',
        label: 'Tenacity CN/Tex (Auto)',
        type: 'readonly'
    },
    {
        id: 'elongationPercent',
        label: 'Elongation %',
        type: 'number'
    },
    {
        id: 'clsp',
        label: 'CLSP (Auto)',
        type: 'readonly'
    },
    // Evenness / Uster
    {
        id: 'uPercent',
        label: 'U%',
        type: 'number'
    },
    {
        id: 'cvB',
        label: 'CVb',
        type: 'number'
    },
    {
        id: 'cvm',
        label: 'CVm',
        type: 'number'
    },
    {
        id: 'cvm1m',
        label: 'CVm 1m',
        type: 'number'
    },
    {
        id: 'cvm3m',
        label: 'CVm 3m',
        type: 'number'
    },
    {
        id: 'cvm10m',
        label: 'CVm 10m',
        type: 'number'
    },
    // IPI Ring
    {
        id: 'thin50Percent',
        label: 'Thin-50%',
        type: 'number'
    },
    {
        id: 'thick50Percent',
        label: 'Thick+50%',
        type: 'number'
    },
    {
        id: 'neps200Percent',
        label: 'Neps+200%',
        type: 'number'
    },
    {
        id: 'neps280Percent',
        label: 'Neps+280%',
        type: 'number'
    },
    {
        id: 'ipis',
        label: 'IPIs (Auto)',
        type: 'readonly'
    },
    // IPI OE
    {
        id: 'oeIpi',
        label: 'OE IPI (Auto)',
        type: 'readonly'
    },
    {
        id: 'thin30Percent',
        label: 'Thin-30%',
        type: 'number'
    },
    {
        id: 'thin40Percent',
        label: 'Thin-40%',
        type: 'number'
    },
    {
        id: 'thick35Percent',
        label: 'Thick+35%',
        type: 'number'
    },
    {
        id: 'neps140Percent',
        label: 'Neps+140%',
        type: 'number'
    },
    {
        id: 'shortIpi',
        label: 'Short IPI (Auto)',
        type: 'readonly'
    },
    // Hairiness & spectrogram
    {
        id: 'hairiness',
        label: 'Hairiness',
        type: 'number'
    },
    {
        id: 'sh',
        label: 'SH',
        type: 'number'
    },
    {
        id: 's1uPlusS2u',
        label: 'S1u + S2u',
        type: 'number'
    },
    {
        id: 's3u',
        label: 'S3u',
        type: 'number'
    },
    {
        id: 'dr1_5m5Percent',
        label: 'DR 1.5m 5%',
        type: 'number'
    },
    // Remarks
    {
        id: 'remarks',
        label: 'Remarks',
        type: 'text'
    }
];
const makeBlankRow = ()=>{
    const now = new Date();
    return {
        // Local-only fields
        _localId: `new-${now.getTime()}-${Math.random().toString(16).slice(2)}`,
        _status: 'new',
        _error: '',
        id: null,
        // Identification
        testDate: '',
        testMonth: '',
        testYear: now.getFullYear(),
        countDescriptionCode: '',
        countNeId: '',
        countNeIdInput: '',
        lotId: '',
        lotInput: '',
        spkId: '',
        spkInput: '',
        yarnTypeId: '',
        yarnTypeInput: '',
        blendId: '',
        blendInput: '',
        slubCodeId: '',
        slubCodeInput: '',
        supplierId: '',
        supplierInput: '',
        millsUnitId: '',
        millsUnitInput: '',
        processStepId: '',
        processStepInput: '',
        testTypeId: '',
        testTypeInput: '',
        machineNo: '',
        sideId: '',
        sideInput: '',
        // Spinning parameters
        sliverRovingNe: '',
        totalDraft: '',
        twistMultiplier: '',
        tpi: '',
        tpm: '',
        actualTwist: '',
        rotorSpindleSpeed: '',
        // Count variation
        meanNe: '',
        minNe: '',
        maxNe: '',
        cvCountPercent: '',
        // Strength
        meanStrengthCn: '',
        minStrengthCn: '',
        maxStrengthCn: '',
        cvStrengthPercent: '',
        tenacityCnTex: '',
        elongationPercent: '',
        clsp: '',
        // Evenness
        uPercent: '',
        cvB: '',
        cvm: '',
        cvm1m: '',
        cvm3m: '',
        cvm10m: '',
        // IPI ring
        thin50Percent: '',
        thick50Percent: '',
        neps200Percent: '',
        neps280Percent: '',
        ipis: '',
        // IPI OE
        oeIpi: '',
        thin30Percent: '',
        thin40Percent: '',
        thick35Percent: '',
        neps140Percent: '',
        shortIpi: '',
        // Hairiness & spectrogram
        hairiness: '',
        sh: '',
        s1uPlusS2u: '',
        s3u: '',
        dr1_5m5Percent: '',
        // Remarks
        remarks: ''
    };
};
const calculateTotalDraft = (nominal, sliver)=>{
    if (nominal && sliver && sliver !== 0) {
        return (nominal / sliver).toFixed(2);
    }
    return '';
};
const calculateTPI = (nominal, tm)=>{
    if (nominal && tm) {
        return (Math.sqrt(nominal) * tm).toFixed(2);
    }
    return '';
};
const calculateTPM = (tpi)=>{
    if (tpi) {
        return (tpi * 39.37).toFixed(2);
    }
    return '';
};
const calculateTenacity = (meanNe, meanStrength)=>{
    if (meanNe && meanStrength) {
        return (meanNe * meanStrength * 0.001693).toFixed(2);
    }
    return '';
};
const calculateCLSP = (meanStrength, meanNe)=>{
    if (meanStrength && meanNe) {
        return (meanStrength / 0.9807 * 1.6934 * meanNe * 156.2 / 1000).toFixed(2);
    }
    return '';
};
const calculateIPIs = (thin50, thick50, neps200)=>{
    const result = (parseInt(thin50, 10) || 0) + (parseInt(thick50, 10) || 0) + (parseInt(neps200, 10) || 0);
    return result || '';
};
const calculateOEIPI = (thin50, thick50, neps280)=>{
    const result = (parseInt(thin50, 10) || 0) + (parseInt(thick50, 10) || 0) + (parseInt(neps280, 10) || 0);
    return result || '';
};
const calculateShortIPI = (thin40, thick35, neps140)=>{
    const result = (parseInt(thin40, 10) || 0) + (parseInt(thick35, 10) || 0) + (parseInt(neps140, 10) || 0);
    return result || '';
};
const FIELD_GROUPS = [
    {
        title: 'Identity & yarn',
        fields: [
            'testDate',
            'countDescriptionCode',
            'countNeIdInput',
            'lotInput',
            'spkInput',
            'yarnTypeInput',
            'blendInput',
            'slubCodeInput',
            'supplierInput',
            'millsUnitInput',
            'processStepInput',
            'testTypeInput',
            'machineNo',
            'sideInput'
        ]
    },
    {
        title: 'Spinning parameters',
        fields: [
            'sliverRovingNe',
            'totalDraft',
            'twistMultiplier',
            'tpi',
            'tpm',
            'actualTwist',
            'rotorSpindleSpeed'
        ]
    },
    {
        title: 'Count variation',
        fields: [
            'meanNe',
            'minNe',
            'maxNe',
            'cvCountPercent'
        ]
    },
    {
        title: 'Strength',
        fields: [
            'meanStrengthCn',
            'minStrengthCn',
            'maxStrengthCn',
            'cvStrengthPercent',
            'tenacityCnTex',
            'elongationPercent',
            'clsp'
        ]
    },
    {
        title: 'Evenness / Uster',
        fields: [
            'uPercent',
            'cvB',
            'cvm',
            'cvm1m',
            'cvm3m',
            'cvm10m'
        ]
    },
    {
        title: 'IPI (Ring)',
        fields: [
            'thin50Percent',
            'thick50Percent',
            'neps200Percent',
            'neps280Percent',
            'ipis'
        ]
    },
    {
        title: 'IPI (OE)',
        fields: [
            'oeIpi',
            'thin30Percent',
            'thin40Percent',
            'thick35Percent',
            'neps140Percent',
            'shortIpi'
        ]
    },
    {
        title: 'Hairiness & spectrogram',
        fields: [
            'hairiness',
            'sh',
            's1uPlusS2u',
            's3u',
            'dr1_5m5Percent'
        ]
    },
    {
        title: 'Remarks',
        fields: [
            'remarks'
        ]
    }
];
function YarnQualityFormPage() {
    const params = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useParams"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const rawId = params?.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    const isEdit = Boolean(id);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [saving, setSaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [dropdownsLoaded, setDropdownsLoaded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [dropdowns, setDropdowns] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        countNe: [],
        lots: [],
        spks: [],
        yarnTypes: [],
        blends: [],
        suppliers: [],
        millsUnits: [],
        processSteps: [],
        testTypes: [],
        sides: [],
        slubCodes: []
    });
    const [formRow, setFormRow] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>makeBlankRow());
    const loadDropdownsAndTests = async ()=>{
        try {
            setLoading(true);
            const reqs = [
                {
                    key: 'countNe',
                    url: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["API_ENDPOINTS"].production}/counts`
                },
                {
                    key: 'lots',
                    url: `${API_BASE_URL}/lots`
                },
                {
                    key: 'spks',
                    url: `${API_BASE_URL}/spks`
                },
                {
                    key: 'yarnTypes',
                    url: `${API_BASE_URL}/yarn-types`
                },
                {
                    key: 'blends',
                    url: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["API_ENDPOINTS"].unified}/blends`
                },
                {
                    key: 'suppliers',
                    url: `${API_BASE_URL}/suppliers`
                },
                {
                    key: 'millsUnits',
                    url: `${API_BASE_URL}/mills-units`
                },
                {
                    key: 'processSteps',
                    url: `${API_BASE_URL}/process-steps`
                },
                {
                    key: 'testTypes',
                    url: `${API_BASE_URL}/test-types`
                },
                {
                    key: 'sides',
                    url: `${API_BASE_URL}/sides`
                },
                {
                    key: 'slubCodes',
                    url: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["API_ENDPOINTS"].production}/slub-codes`
                }
            ];
            const results = await Promise.allSettled(reqs.map((r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiCall"])(r.url)));
            const nextDropdowns = {
                countNe: [],
                lots: [],
                spks: [],
                yarnTypes: [],
                blends: [],
                suppliers: [],
                millsUnits: [],
                processSteps: [],
                testTypes: [],
                sides: [],
                slubCodes: []
            };
            const errors = [];
            results.forEach((res, idx)=>{
                const { key, url } = reqs[idx];
                if (res.status === 'fulfilled') {
                    nextDropdowns[key] = res.value || [];
                } else {
                    errors.push(`${key}: ${res.reason?.message || String(res.reason)} (${url})`);
                }
            });
            setDropdowns(nextDropdowns);
            setDropdownsLoaded(true);
            if (errors.length) {
                setFormRow((prev)=>({
                        ...prev,
                        _status: 'error',
                        _error: `Failed to load some dropdowns. First error: ${errors[0]}`
                    }));
            }
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error('Error loading Quality dropdowns/tests:', err);
            setFormRow((prev)=>({
                    ...prev,
                    _status: 'error',
                    _error: err?.message || 'Failed to load dropdown data'
                }));
        } finally{
            setLoading(false);
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        loadDropdownsAndTests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const loadExisting = async ()=>{
            if (!isEdit) {
                setFormRow(makeBlankRow());
                return;
            }
            try {
                setLoading(true);
                const test = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiCall"])(`${API_BASE_URL}/yarn-tests/${id}`);
                loadTestIntoForm(test);
            } catch (err) {
                setFormRow((prev)=>({
                        ...prev,
                        _status: 'error',
                        _error: err?.message || 'Failed to load record'
                    }));
            } finally{
                setLoading(false);
            }
        };
        if (dropdownsLoaded) {
            loadExisting();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        id,
        isEdit,
        dropdownsLoaded
    ]);
    const recalcDerivedFields = (row)=>{
        const updated = {
            ...row
        };
        const getCountNeValue = ()=>{
            const id = updated.countNeId;
            if (!id) return null;
            const selected = dropdowns.countNe.find((c)=>c.id === parseInt(id, 10));
            return selected?.value ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$lib$2f$numberFormat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseLocalizedNumber"])(selected.value) : null;
        };
        const countNeValue = getCountNeValue();
        if (countNeValue && updated.sliverRovingNe) {
            const sliver = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$lib$2f$numberFormat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseLocalizedNumber"])(updated.sliverRovingNe);
            if (sliver) {
                updated.totalDraft = calculateTotalDraft(countNeValue, sliver);
            }
        }
        if (countNeValue && updated.twistMultiplier) {
            const tm = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$lib$2f$numberFormat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseLocalizedNumber"])(updated.twistMultiplier);
            if (tm) {
                const tpi = calculateTPI(countNeValue, tm);
                updated.tpi = tpi;
                updated.tpm = calculateTPM((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$lib$2f$numberFormat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseLocalizedNumber"])(tpi));
            }
        } else if (updated.tpi) {
            updated.tpm = calculateTPM((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$lib$2f$numberFormat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseLocalizedNumber"])(updated.tpi));
        }
        if (updated.meanNe || updated.meanStrengthCn) {
            const meanNeNum = updated.meanNe ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$lib$2f$numberFormat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseLocalizedNumber"])(updated.meanNe) : null;
            const meanStrengthNum = updated.meanStrengthCn ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$lib$2f$numberFormat$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseLocalizedNumber"])(updated.meanStrengthCn) : null;
            if (meanNeNum && meanStrengthNum) {
                updated.tenacityCnTex = calculateTenacity(meanNeNum, meanStrengthNum);
                updated.clsp = calculateCLSP(meanStrengthNum, meanNeNum);
            }
        }
        updated.ipis = calculateIPIs(updated.thin50Percent, updated.thick50Percent, updated.neps200Percent);
        updated.oeIpi = calculateOEIPI(updated.thin50Percent, updated.thick50Percent, updated.neps280Percent);
        updated.shortIpi = calculateShortIPI(updated.thin40Percent, updated.thick35Percent, updated.neps140Percent);
        return updated;
    };
    const buildCountDescription = (row, dd)=>{
        const parts = [];
        const millsUnit = dd.millsUnits.find((u)=>u.id === parseInt(row.millsUnitId || '', 10));
        if (millsUnit?.letterCode) parts.push(millsUnit.letterCode);
        const blend = dd.blends.find((b)=>b.id === parseInt(row.blendId || '', 10));
        if (blend?.letterCode) parts.push(blend.letterCode);
        const yarnType = dd.yarnTypes.find((yt)=>yt.id === parseInt(row.yarnTypeId || '', 10));
        if (yarnType?.letterCode) parts.push(yarnType.letterCode);
        const lot = dd.lots.find((l)=>l.id === parseInt(row.lotId || '', 10));
        if (lot?.name) parts.push(lot.name);
        const countNeItem = dd.countNe.find((c)=>c.id === parseInt(row.countNeId || '', 10));
        if (countNeItem?.value) parts.push(String(countNeItem.value));
        return parts.length >= 4 ? parts.join(' ') : '';
    };
    const handleChange = (name, value)=>{
        setFormRow((prev)=>{
            let updated = {
                ...prev,
                [name]: value,
                _error: ''
            };
            updated._status = prev._status === 'new' ? 'new' : 'dirty';
            if (name === 'countNeIdInput') {
                updated.countNeId = '';
            }
            if (name === 'testDate') {
                const date = new Date(value);
                if (!Number.isNaN(date.getTime())) {
                    updated.testMonth = date.toLocaleString('en-US', {
                        month: 'long'
                    });
                    updated.testYear = date.getFullYear();
                }
            }
            updated = recalcDerivedFields(updated);
            updated.countDescriptionCode = buildCountDescription(updated, dropdowns);
            return updated;
        });
    };
    const validateLookup = async (field)=>{
        const row = formRow;
        const setError = (msg)=>setFormRow((prev)=>({
                    ...prev,
                    _error: msg
                }));
        if (field === 'lotInput') {
            const value = (row.lotInput || '').trim();
            if (!value) {
                setError('Lot is required');
                setFormRow((prev)=>({
                        ...prev,
                        lotId: '',
                        blendId: ''
                    }));
                return;
            }
            try {
                const res = await fetch(`${API_BASE_URL}/lots/lookup/by-value/${encodeURIComponent(value)}`);
                if (!res.ok) {
                    setError('Lot not found in database');
                    setFormRow((prev)=>({
                            ...prev,
                            lotId: '',
                            blendId: ''
                        }));
                    return;
                }
                const lot = await res.json();
                setFormRow((prev)=>{
                    const updated = {
                        ...prev,
                        lotId: String(lot.id),
                        blendId: lot.blendId ? String(lot.blendId) : prev.blendId,
                        _error: ''
                    };
                    updated.countDescriptionCode = buildCountDescription(updated, dropdowns);
                    return updated;
                });
            } catch (err) {
                // eslint-disable-next-line no-console
                console.error('Error validating lot in form:', err);
                setError('Failed to validate lot, please try again');
            }
            return;
        }
        if (field === 'countNeIdInput') {
            const value = (row.countNeIdInput || '').trim();
            if (!value) {
                setFormRow((prev)=>({
                        ...prev,
                        countNeId: '',
                        countNeIdInput: ''
                    }));
                return;
            }
            const match = dropdowns.countNe.find((c)=>String(c.value) === value || String(c.value) === value.replace(',', '.'));
            if (!match) {
                setError('Count NE not found');
                setFormRow((prev)=>({
                        ...prev,
                        countNeId: '',
                        countNeIdInput: value
                    }));
                return;
            }
            setFormRow((prev)=>{
                const updated = {
                    ...prev,
                    countNeId: String(match.id),
                    countNeIdInput: String(match.value),
                    _error: ''
                };
                const recalced = recalcDerivedFields(updated);
                recalced.countDescriptionCode = buildCountDescription(recalced, dropdowns);
                return recalced;
            });
            return;
        }
        const map = {
            spkInput: {
                list: dropdowns.spks,
                idField: 'spkId'
            },
            yarnTypeInput: {
                list: dropdowns.yarnTypes,
                idField: 'yarnTypeId'
            },
            blendInput: {
                list: dropdowns.blends,
                idField: 'blendId'
            },
            slubCodeInput: {
                list: dropdowns.slubCodes,
                idField: 'slubCodeId'
            },
            supplierInput: {
                list: dropdowns.suppliers,
                idField: 'supplierId'
            },
            millsUnitInput: {
                list: dropdowns.millsUnits,
                idField: 'millsUnitId'
            },
            processStepInput: {
                list: dropdowns.processSteps,
                idField: 'processStepId'
            },
            testTypeInput: {
                list: dropdowns.testTypes,
                idField: 'testTypeId'
            },
            sideInput: {
                list: dropdowns.sides,
                idField: 'sideId'
            }
        };
        const cfg = map[field];
        if (!cfg) return;
        const value = (row[field] || '').trim();
        if (!value) {
            setFormRow((prev)=>({
                    ...prev,
                    [cfg.idField]: '',
                    [field]: ''
                }));
            return;
        }
        const match = cfg.list.find((item)=>item.name === value);
        if (!match) {
            setError('Value not found in dropdown options');
            return;
        }
        setFormRow((prev)=>{
            const updated = {
                ...prev,
                [cfg.idField]: String(match.id),
                [field]: match.name,
                _error: ''
            };
            updated.countDescriptionCode = buildCountDescription(updated, dropdowns);
            return updated;
        });
    };
    const buildSubmitPayload = (row)=>{
        const payload = {
            ...row
        };
        delete payload._localId;
        delete payload._status;
        delete payload._error;
        delete payload.countDescriptionCode;
        delete payload.countNeIdInput;
        delete payload.lotInput;
        delete payload.spkInput;
        delete payload.yarnTypeInput;
        delete payload.blendInput;
        delete payload.slubCodeInput;
        delete payload.supplierInput;
        delete payload.millsUnitInput;
        delete payload.processStepInput;
        delete payload.testTypeInput;
        delete payload.sideInput;
        return payload;
    };
    const handleSave = async ()=>{
        const row = formRow;
        if (row.countNeIdInput && !row.countNeId) {
            setFormRow((prev)=>({
                    ...prev,
                    _error: 'Count NE not found in dropdown options'
                }));
            return;
        }
        setSaving(true);
        setFormRow((prev)=>({
                ...prev,
                _status: 'saving',
                _error: ''
            }));
        try {
            const payload = buildSubmitPayload(row);
            const isNew = !row.id;
            const url = isNew ? `${API_BASE_URL}/yarn-tests` : `${API_BASE_URL}/yarn-tests/${row.id}`;
            const method = isNew ? 'POST' : 'PUT';
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            if (!res.ok) {
                const errorBody = await res.json().catch(()=>({}));
                throw new Error(errorBody.error || 'Failed to save');
            }
            await res.json().catch(()=>null);
            router.push('/quality');
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error('Error saving quality test:', err);
            setFormRow((prev)=>({
                    ...prev,
                    _status: 'error',
                    _error: err?.message || 'Failed to save'
                }));
        } finally{
            setSaving(false);
        }
    };
    const handleNew = ()=>{
        router.push('/quality/new');
        setFormRow(makeBlankRow());
    };
    const handleBack = ()=>{
        router.push('/quality');
    };
    const handleDelete = async ()=>{
        if (!isEdit) return;
        // eslint-disable-next-line no-alert
        const ok = window.confirm('Delete this yarn test? This action cannot be undone.');
        if (!ok) return;
        try {
            setSaving(true);
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiCall"])(`${API_BASE_URL}/yarn-tests/${id}`, {
                method: 'DELETE'
            });
            router.push('/quality');
        } catch (err) {
            setFormRow((prev)=>({
                    ...prev,
                    _status: 'error',
                    _error: err?.message || 'Failed to delete'
                }));
        } finally{
            setSaving(false);
        }
    };
    const loadTestIntoForm = (test)=>{
        const row = makeBlankRow();
        row._localId = `existing-${test.id}`;
        row._status = 'clean';
        row.id = test.id;
        row.testDate = toYMD(test.testDate);
        row.testMonth = test.testMonth || '';
        row.testYear = test.testYear || '';
        row.countDescriptionCode = toStr(test.countDescriptionCode || test.countDescription?.code);
        row.countNeId = toStr(test.countNeId || test.countNe?.id);
        row.countNeIdInput = test.countNe ? toStr(test.countNe.value) : '';
        row.lotId = toStr(test.lotId || test.lot?.id);
        row.lotInput = test.lot?.name || '';
        row.spkId = toStr(test.spkId || test.spk?.id);
        row.spkInput = test.spk?.name || '';
        row.yarnTypeId = toStr(test.yarnTypeId || test.yarnType?.id);
        row.yarnTypeInput = test.yarnType?.name || '';
        row.blendId = toStr(test.blendId || test.blend?.id);
        row.blendInput = test.blend?.name || '';
        row.slubCodeId = toStr(test.slubCodeId || test.slubCode?.id);
        row.slubCodeInput = test.slubCode?.name || test.slubCode?.code || '';
        row.supplierId = toStr(test.supplierId || test.supplier?.id);
        row.supplierInput = test.supplier?.name || '';
        row.millsUnitId = toStr(test.millsUnitId || test.millsUnit?.id);
        row.millsUnitInput = test.millsUnit?.name || '';
        row.processStepId = toStr(test.processStepId || test.processStep?.id);
        row.processStepInput = test.processStep?.name || '';
        row.testTypeId = toStr(test.testTypeId || test.testType?.id);
        row.testTypeInput = test.testType?.name || '';
        row.machineNo = toStr(test.machineNo);
        row.sideId = toStr(test.sideId || test.side?.id);
        row.sideInput = test.side?.name || '';
        row.sliverRovingNe = toStr(test.sliverRovingNe);
        row.totalDraft = toStr(test.totalDraft);
        row.twistMultiplier = toStr(test.twistMultiplier);
        row.tpi = toStr(test.tpi);
        row.tpm = toStr(test.tpm);
        row.actualTwist = toStr(test.actualTwist);
        row.rotorSpindleSpeed = toStr(test.rotorSpindleSpeed);
        row.meanNe = toStr(test.meanNe);
        row.minNe = toStr(test.minNe);
        row.maxNe = toStr(test.maxNe);
        row.cvCountPercent = toStr(test.cvCountPercent);
        row.meanStrengthCn = toStr(test.meanStrengthCn);
        row.minStrengthCn = toStr(test.minStrengthCn);
        row.maxStrengthCn = toStr(test.maxStrengthCn);
        row.cvStrengthPercent = toStr(test.cvStrengthPercent);
        row.tenacityCnTex = toStr(test.tenacityCnTex);
        row.elongationPercent = toStr(test.elongationPercent);
        row.clsp = toStr(test.clsp);
        row.uPercent = toStr(test.uPercent);
        row.cvB = toStr(test.cvB);
        row.cvm = toStr(test.cvm);
        row.cvm1m = toStr(test.cvm1m);
        row.cvm3m = toStr(test.cvm3m);
        row.cvm10m = toStr(test.cvm10m);
        row.thin50Percent = toStr(test.thin50Percent);
        row.thick50Percent = toStr(test.thick50Percent);
        row.neps200Percent = toStr(test.neps200Percent);
        row.neps280Percent = toStr(test.neps280Percent);
        row.ipis = toStr(test.ipis);
        row.oeIpi = toStr(test.oeIpi);
        row.thin30Percent = toStr(test.thin30Percent);
        row.thin40Percent = toStr(test.thin40Percent);
        row.thick35Percent = toStr(test.thick35Percent);
        row.neps140Percent = toStr(test.neps140Percent);
        row.shortIpi = toStr(test.shortIpi);
        row.hairiness = toStr(test.hairiness);
        row.sh = toStr(test.sh);
        row.s1uPlusS2u = toStr(test.s1uPlusS2u);
        row.s3u = toStr(test.s3u);
        row.dr1_5m5Percent = toStr(test.dr1_5m5Percent);
        row.remarks = toStr(test.remarks);
        setFormRow(recalcDerivedFields(row));
    };
    const colById = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const m = new Map();
        YARN_COLUMNS.forEach((c)=>m.set(c.id, c));
        return m;
    }, []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "production-module-container",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "production-module-content",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "form-header",
                    style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        flexWrap: 'wrap',
                        gap: '1rem'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    children: isEdit ? 'Edit Yarn Test' : 'New Yarn Test'
                                }, void 0, false, {
                                    fileName: "[project]/apps/frontend/components/YarnQualityFormPage.tsx",
                                    lineNumber: 893,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    children: "Keep this screen focused on one test record. The database view is on a separate page."
                                }, void 0, false, {
                                    fileName: "[project]/apps/frontend/components/YarnQualityFormPage.tsx",
                                    lineNumber: 894,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/frontend/components/YarnQualityFormPage.tsx",
                            lineNumber: 892,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: 'flex',
                                gap: 8,
                                alignItems: 'center'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    className: "btn btn-secondary",
                                    onClick: handleBack,
                                    disabled: saving,
                                    children: "Back to database"
                                }, void 0, false, {
                                    fileName: "[project]/apps/frontend/components/YarnQualityFormPage.tsx",
                                    lineNumber: 897,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    className: "btn btn-secondary",
                                    onClick: handleNew,
                                    disabled: saving,
                                    children: "New"
                                }, void 0, false, {
                                    fileName: "[project]/apps/frontend/components/YarnQualityFormPage.tsx",
                                    lineNumber: 900,
                                    columnNumber: 13
                                }, this),
                                isEdit ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    className: "btn btn-secondary",
                                    onClick: handleDelete,
                                    disabled: saving,
                                    children: "Delete"
                                }, void 0, false, {
                                    fileName: "[project]/apps/frontend/components/YarnQualityFormPage.tsx",
                                    lineNumber: 904,
                                    columnNumber: 15
                                }, this) : null,
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    className: "btn btn-primary",
                                    onClick: handleSave,
                                    disabled: saving,
                                    children: saving ? 'Saving...' : formRow?.id ? 'Save changes' : 'Save'
                                }, void 0, false, {
                                    fileName: "[project]/apps/frontend/components/YarnQualityFormPage.tsx",
                                    lineNumber: 908,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/frontend/components/YarnQualityFormPage.tsx",
                            lineNumber: 896,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/frontend/components/YarnQualityFormPage.tsx",
                    lineNumber: 882,
                    columnNumber: 9
                }, this),
                formRow?._error ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "production-alert production-alert--error",
                    children: formRow._error
                }, void 0, false, {
                    fileName: "[project]/apps/frontend/components/YarnQualityFormPage.tsx",
                    lineNumber: 915,
                    columnNumber: 11
                }, this) : null,
                loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "production-loading",
                    children: "Loading..."
                }, void 0, false, {
                    fileName: "[project]/apps/frontend/components/YarnQualityFormPage.tsx",
                    lineNumber: 919,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "production-form production-form--standalone",
                    children: FIELD_GROUPS.map((group)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "production-form-section",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                    children: group.title
                                }, void 0, false, {
                                    fileName: "[project]/apps/frontend/components/YarnQualityFormPage.tsx",
                                    lineNumber: 924,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "production-form-grid",
                                    children: group.fields.map((fieldId)=>{
                                        const col = colById.get(fieldId);
                                        if (!col) return null;
                                        const value = formRow?.[col.id] ?? '';
                                        const isReadOnly = col.type === 'readonly';
                                        const dropdownCfg = DROPDOWN_FIELD_CONFIG[col.id];
                                        // For dropdown-backed fields, render a <select> using the same
                                        // UI style as the production module, while still keeping the
                                        // `*Input` field in sync for display/derived values.
                                        if (dropdownCfg) {
                                            const options = dropdowns[dropdownCfg.sourceKey] || [];
                                            const selectedId = formRow?.[dropdownCfg.idField] || '';
                                            const getOptionLabel = (item)=>{
                                                if (col.id === 'countNeIdInput') {
                                                    return item.value ?? '';
                                                }
                                                if (col.id === 'slubCodeInput') {
                                                    return item.name || item.code || '';
                                                }
                                                return item.name ?? '';
                                            };
                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "form-group",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        children: col.label
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/frontend/components/YarnQualityFormPage.tsx",
                                                        lineNumber: 953,
                                                        columnNumber: 27
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                        name: dropdownCfg.idField,
                                                        className: "form-control",
                                                        value: selectedId,
                                                        onChange: (e)=>{
                                                            const newId = e.target.value;
                                                            const selected = options.find((opt)=>String(opt.id) === String(newId));
                                                            setFormRow((prev)=>{
                                                                let updated = {
                                                                    ...prev,
                                                                    [dropdownCfg.idField]: newId,
                                                                    _error: ''
                                                                };
                                                                if (selected) {
                                                                    if (col.id === 'countNeIdInput') {
                                                                        updated.countNeIdInput = selected.value !== undefined && selected.value !== null ? String(selected.value) : '';
                                                                    } else {
                                                                        updated[col.id] = getOptionLabel(selected);
                                                                    }
                                                                } else {
                                                                    updated[col.id] = '';
                                                                }
                                                                updated._status = prev._status === 'new' ? 'new' : 'dirty';
                                                                updated = recalcDerivedFields(updated);
                                                                updated.countDescriptionCode = buildCountDescription(updated, dropdowns);
                                                                return updated;
                                                            });
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: "",
                                                                children: "Select..."
                                                            }, void 0, false, {
                                                                fileName: "[project]/apps/frontend/components/YarnQualityFormPage.tsx",
                                                                lineNumber: 990,
                                                                columnNumber: 29
                                                            }, this),
                                                            options.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                    value: item.id,
                                                                    children: getOptionLabel(item)
                                                                }, item.id, false, {
                                                                    fileName: "[project]/apps/frontend/components/YarnQualityFormPage.tsx",
                                                                    lineNumber: 992,
                                                                    columnNumber: 31
                                                                }, this))
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/apps/frontend/components/YarnQualityFormPage.tsx",
                                                        lineNumber: 954,
                                                        columnNumber: 27
                                                    }, this)
                                                ]
                                            }, col.id, true, {
                                                fileName: "[project]/apps/frontend/components/YarnQualityFormPage.tsx",
                                                lineNumber: 952,
                                                columnNumber: 25
                                            }, this);
                                        }
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "form-group",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    children: col.label
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/frontend/components/YarnQualityFormPage.tsx",
                                                    lineNumber: 1003,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: col.type === 'date' ? 'date' : 'text',
                                                    name: col.id,
                                                    className: "form-control",
                                                    value: value,
                                                    placeholder: col.placeholder,
                                                    readOnly: isReadOnly,
                                                    inputMode: col.type === 'number' ? 'decimal' : undefined,
                                                    onChange: (e)=>handleChange(col.id, e.target.value)
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/frontend/components/YarnQualityFormPage.tsx",
                                                    lineNumber: 1004,
                                                    columnNumber: 25
                                                }, this)
                                            ]
                                        }, col.id, true, {
                                            fileName: "[project]/apps/frontend/components/YarnQualityFormPage.tsx",
                                            lineNumber: 1002,
                                            columnNumber: 23
                                        }, this);
                                    })
                                }, void 0, false, {
                                    fileName: "[project]/apps/frontend/components/YarnQualityFormPage.tsx",
                                    lineNumber: 925,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, group.title, true, {
                            fileName: "[project]/apps/frontend/components/YarnQualityFormPage.tsx",
                            lineNumber: 923,
                            columnNumber: 15
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/apps/frontend/components/YarnQualityFormPage.tsx",
                    lineNumber: 921,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/apps/frontend/components/YarnQualityFormPage.tsx",
            lineNumber: 881,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/apps/frontend/components/YarnQualityFormPage.tsx",
        lineNumber: 880,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=apps_frontend_e3322dec._.js.map