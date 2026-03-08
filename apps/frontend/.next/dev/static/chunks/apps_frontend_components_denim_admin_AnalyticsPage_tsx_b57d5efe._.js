(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/apps/frontend/components/denim/admin/AnalyticsPage.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AnalyticsPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
(()=>{
    const e = new Error("Cannot find module '../../../../lib/authFetch'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
(()=>{
    const e = new Error("Cannot find module '../../../layout/PageHeader'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
(()=>{
    const e = new Error("Cannot find module '../../../ui/skeleton'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$BarChart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/chart/BarChart.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Bar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/Bar.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$XAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/XAxis.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$YAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/YAxis.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$CartesianGrid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/CartesianGrid.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Tooltip$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/component/Tooltip.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/component/ResponsiveContainer.js [app-client] (ecmascript)");
(()=>{
    const e = new Error("Cannot find module '../../../ui/table'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
const STAGE_CONFIG = {
    PENDING_APPROVAL: {
        label: 'Pending Approval',
        short: 'Pending',
        color: 'bg-amber-500'
    },
    WARPING: {
        label: 'In Warping',
        short: 'Warping',
        color: 'bg-violet-500'
    },
    INDIGO: {
        label: 'In Indigo',
        short: 'Indigo',
        color: 'bg-cyan-500'
    },
    WEAVING: {
        label: 'In Weaving',
        short: 'Weaving',
        color: 'bg-teal-500'
    },
    INSPECT_GRAY: {
        label: 'Inspect Gray',
        short: 'Inspect',
        color: 'bg-yellow-400'
    },
    COMPLETE: {
        label: 'Complete',
        short: 'Done',
        color: 'bg-green-500'
    },
    REJECTED: {
        label: 'Rejected',
        short: 'Rejected',
        color: 'bg-red-500'
    },
    DRAFT: {
        label: 'Draft',
        short: 'Draft',
        color: 'bg-zinc-400'
    }
};
function AnalyticsPage() {
    _s();
    const [data, setData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AnalyticsPage.useEffect": ()=>{
            authFetch('/denim/analytics/overview').then({
                "AnalyticsPage.useEffect": (r)=>setData(r)
            }["AnalyticsPage.useEffect"]).catch(console.error).finally({
                "AnalyticsPage.useEffect": ()=>setLoading(false)
            }["AnalyticsPage.useEffect"]);
        }
    }["AnalyticsPage.useEffect"], []);
    const getStageCount = (stage)=>data?.stageDistribution?.[stage] ?? 0;
    const totalInPipeline = Object.keys(STAGE_CONFIG).reduce((s, k)=>s + getStageCount(k), 0);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PageHeader, {
                title: "Analytics",
                subtitle: "Production insights and statistics"
            }, void 0, false, {
                fileName: "[project]/apps/frontend/components/denim/admin/AnalyticsPage.tsx",
                lineNumber: 52,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "px-8 pb-8 space-y-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-2 lg:grid-cols-4 gap-4",
                        children: [
                            {
                                label: 'Total SCs',
                                value: data?.totalSC ?? 0,
                                loading
                            },
                            {
                                label: 'Warping Runs',
                                value: data?.totalWarping ?? 0,
                                loading
                            },
                            {
                                label: 'Indigo Runs',
                                value: data?.totalIndigo ?? 0,
                                loading
                            },
                            {
                                label: 'Avg Warping Eff %',
                                value: loading ? '—' : `${(data?.avgEffWarping ?? 0).toFixed(1)}%`,
                                loading
                            }
                        ].map((k)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-white rounded-xl border border-zinc-200/80 shadow-sm p-5",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-zinc-500",
                                        children: k.label
                                    }, void 0, false, {
                                        fileName: "[project]/apps/frontend/components/denim/admin/AnalyticsPage.tsx",
                                        lineNumber: 74,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-2xl font-bold text-zinc-900 mt-1",
                                        children: loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Skeleton, {
                                            className: "h-8 w-20"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/frontend/components/denim/admin/AnalyticsPage.tsx",
                                            lineNumber: 76,
                                            columnNumber: 28
                                        }, this) : k.value
                                    }, void 0, false, {
                                        fileName: "[project]/apps/frontend/components/denim/admin/AnalyticsPage.tsx",
                                        lineNumber: 75,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, k.label, true, {
                                fileName: "[project]/apps/frontend/components/denim/admin/AnalyticsPage.tsx",
                                lineNumber: 71,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/apps/frontend/components/denim/admin/AnalyticsPage.tsx",
                        lineNumber: 60,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 lg:grid-cols-5 gap-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "lg:col-span-3 bg-white rounded-xl border border-zinc-200/80 shadow-sm p-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-sm font-semibold text-zinc-800 mb-4",
                                        children: "Monthly SC Volume"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/frontend/components/denim/admin/AnalyticsPage.tsx",
                                        lineNumber: 88,
                                        columnNumber: 13
                                    }, this),
                                    loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Skeleton, {
                                        className: "h-64 w-full"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/frontend/components/denim/admin/AnalyticsPage.tsx",
                                        lineNumber: 92,
                                        columnNumber: 15
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ResponsiveContainer"], {
                                        width: "100%",
                                        height: 260,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$BarChart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BarChart"], {
                                            data: data?.monthlyVolume ?? [],
                                            margin: {
                                                top: 10,
                                                right: 10,
                                                left: -10,
                                                bottom: 0
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$CartesianGrid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CartesianGrid"], {
                                                    strokeDasharray: "3 3",
                                                    stroke: "#f0f0f0"
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/frontend/components/denim/admin/AnalyticsPage.tsx",
                                                    lineNumber: 97,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$XAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["XAxis"], {
                                                    dataKey: "month",
                                                    tick: {
                                                        fontSize: 11,
                                                        fill: '#71717a'
                                                    },
                                                    tickFormatter: (v)=>v.slice(5)
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/frontend/components/denim/admin/AnalyticsPage.tsx",
                                                    lineNumber: 98,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$YAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["YAxis"], {
                                                    tick: {
                                                        fontSize: 11,
                                                        fill: '#71717a'
                                                    },
                                                    width: 30
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/frontend/components/denim/admin/AnalyticsPage.tsx",
                                                    lineNumber: 103,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Tooltip$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Tooltip"], {
                                                    contentStyle: {
                                                        borderRadius: 8,
                                                        border: '1px solid #e4e4e7',
                                                        fontSize: 12
                                                    },
                                                    formatter: (value)=>[
                                                            value,
                                                            'Orders'
                                                        ]
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/frontend/components/denim/admin/AnalyticsPage.tsx",
                                                    lineNumber: 107,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Bar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Bar"], {
                                                    dataKey: "count",
                                                    fill: "#3b82f6",
                                                    radius: [
                                                        4,
                                                        4,
                                                        0,
                                                        0
                                                    ],
                                                    name: "Orders"
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/frontend/components/denim/admin/AnalyticsPage.tsx",
                                                    lineNumber: 115,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/apps/frontend/components/denim/admin/AnalyticsPage.tsx",
                                            lineNumber: 95,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/apps/frontend/components/denim/admin/AnalyticsPage.tsx",
                                        lineNumber: 94,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/frontend/components/denim/admin/AnalyticsPage.tsx",
                                lineNumber: 86,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "lg:col-span-2 bg-white rounded-xl border border-zinc-200/80 shadow-sm p-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-sm font-semibold text-zinc-800 mb-4",
                                        children: "Pipeline Distribution"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/frontend/components/denim/admin/AnalyticsPage.tsx",
                                        lineNumber: 129,
                                        columnNumber: 13
                                    }, this),
                                    loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-2",
                                        children: Array.from({
                                            length: 6
                                        }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Skeleton, {
                                                className: "h-10 w-full"
                                            }, i, false, {
                                                fileName: "[project]/apps/frontend/components/denim/admin/AnalyticsPage.tsx",
                                                lineNumber: 135,
                                                columnNumber: 19
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/apps/frontend/components/denim/admin/AnalyticsPage.tsx",
                                        lineNumber: 133,
                                        columnNumber: 15
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-2",
                                        children: Object.entries(STAGE_CONFIG).map(([key, config])=>{
                                            const count = getStageCount(key);
                                            if (count === 0) return null;
                                            const maxCount = Math.max(...Object.values(data?.stageDistribution ?? {}), 1);
                                            const barPct = Math.max(count / maxCount * 100, 2);
                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-3",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: `w-2 h-2 rounded-full ${config.color}`
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/frontend/components/denim/admin/AnalyticsPage.tsx",
                                                        lineNumber: 148,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "w-24 text-xs text-zinc-600 truncate",
                                                        children: config.short
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/frontend/components/denim/admin/AnalyticsPage.tsx",
                                                        lineNumber: 149,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex-1 h-4 bg-zinc-100 rounded-md overflow-hidden",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: `h-full rounded-md ${config.color} opacity-80`,
                                                            style: {
                                                                width: `${barPct}%`
                                                            }
                                                        }, void 0, false, {
                                                            fileName: "[project]/apps/frontend/components/denim/admin/AnalyticsPage.tsx",
                                                            lineNumber: 153,
                                                            columnNumber: 25
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/frontend/components/denim/admin/AnalyticsPage.tsx",
                                                        lineNumber: 152,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "w-8 text-xs font-medium text-zinc-700 text-right",
                                                        children: count
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/frontend/components/denim/admin/AnalyticsPage.tsx",
                                                        lineNumber: 158,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, key, true, {
                                                fileName: "[project]/apps/frontend/components/denim/admin/AnalyticsPage.tsx",
                                                lineNumber: 147,
                                                columnNumber: 21
                                            }, this);
                                        })
                                    }, void 0, false, {
                                        fileName: "[project]/apps/frontend/components/denim/admin/AnalyticsPage.tsx",
                                        lineNumber: 139,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/frontend/components/denim/admin/AnalyticsPage.tsx",
                                lineNumber: 127,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/frontend/components/denim/admin/AnalyticsPage.tsx",
                        lineNumber: 83,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-white rounded-xl border border-zinc-200/80 shadow-sm",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "px-6 py-4 border-b border-zinc-100",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-sm font-semibold text-zinc-800",
                                        children: "Top 10 Fabric Codes"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/frontend/components/denim/admin/AnalyticsPage.tsx",
                                        lineNumber: 172,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-zinc-400 mt-0.5",
                                        children: "Most frequently produced fabric codes"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/frontend/components/denim/admin/AnalyticsPage.tsx",
                                        lineNumber: 175,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/frontend/components/denim/admin/AnalyticsPage.tsx",
                                lineNumber: 171,
                                columnNumber: 11
                            }, this),
                            loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-6",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Skeleton, {
                                    className: "h-64 w-full"
                                }, void 0, false, {
                                    fileName: "[project]/apps/frontend/components/denim/admin/AnalyticsPage.tsx",
                                    lineNumber: 182,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/apps/frontend/components/denim/admin/AnalyticsPage.tsx",
                                lineNumber: 181,
                                columnNumber: 13
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Table, {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TableHeader, {
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TableRow, {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TableHead, {
                                                    className: "w-16",
                                                    children: "Rank"
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/frontend/components/denim/admin/AnalyticsPage.tsx",
                                                    lineNumber: 188,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TableHead, {
                                                    children: "Code"
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/frontend/components/denim/admin/AnalyticsPage.tsx",
                                                    lineNumber: 189,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TableHead, {
                                                    className: "text-right",
                                                    children: "Count"
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/frontend/components/denim/admin/AnalyticsPage.tsx",
                                                    lineNumber: 190,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TableHead, {
                                                    className: "text-right",
                                                    children: "% of Total"
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/frontend/components/denim/admin/AnalyticsPage.tsx",
                                                    lineNumber: 191,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TableHead, {
                                                    className: "w-48",
                                                    children: "Bar"
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/frontend/components/denim/admin/AnalyticsPage.tsx",
                                                    lineNumber: 192,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/apps/frontend/components/denim/admin/AnalyticsPage.tsx",
                                            lineNumber: 187,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/apps/frontend/components/denim/admin/AnalyticsPage.tsx",
                                        lineNumber: 186,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TableBody, {
                                        children: [
                                            (data?.topFabricCodes ?? []).map((item, i)=>{
                                                const pct = data?.totalSC ? item.count / data.totalSC * 100 : 0;
                                                const maxCount = data?.topFabricCodes?.[0]?.count ?? 1;
                                                const barWidth = item.count / maxCount * 100;
                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TableRow, {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TableCell, {
                                                            className: "font-mono text-zinc-500",
                                                            children: i + 1
                                                        }, void 0, false, {
                                                            fileName: "[project]/apps/frontend/components/denim/admin/AnalyticsPage.tsx",
                                                            lineNumber: 203,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TableCell, {
                                                            className: "font-medium",
                                                            children: item.codename
                                                        }, void 0, false, {
                                                            fileName: "[project]/apps/frontend/components/denim/admin/AnalyticsPage.tsx",
                                                            lineNumber: 206,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TableCell, {
                                                            className: "text-right font-mono",
                                                            children: item.count
                                                        }, void 0, false, {
                                                            fileName: "[project]/apps/frontend/components/denim/admin/AnalyticsPage.tsx",
                                                            lineNumber: 209,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TableCell, {
                                                            className: "text-right text-zinc-500",
                                                            children: [
                                                                pct.toFixed(1),
                                                                "%"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/apps/frontend/components/denim/admin/AnalyticsPage.tsx",
                                                            lineNumber: 212,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TableCell, {
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "h-2 bg-zinc-100 rounded-full overflow-hidden",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "h-full bg-blue-500 rounded-full",
                                                                    style: {
                                                                        width: `${barWidth}%`
                                                                    }
                                                                }, void 0, false, {
                                                                    fileName: "[project]/apps/frontend/components/denim/admin/AnalyticsPage.tsx",
                                                                    lineNumber: 217,
                                                                    columnNumber: 27
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/apps/frontend/components/denim/admin/AnalyticsPage.tsx",
                                                                lineNumber: 216,
                                                                columnNumber: 25
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/apps/frontend/components/denim/admin/AnalyticsPage.tsx",
                                                            lineNumber: 215,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, item.codename, true, {
                                                    fileName: "[project]/apps/frontend/components/denim/admin/AnalyticsPage.tsx",
                                                    lineNumber: 202,
                                                    columnNumber: 21
                                                }, this);
                                            }),
                                            (data?.topFabricCodes?.length ?? 0) === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TableRow, {
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TableCell, {
                                                    colSpan: 5,
                                                    className: "text-center text-zinc-400 py-8",
                                                    children: "No data available"
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/frontend/components/denim/admin/AnalyticsPage.tsx",
                                                    lineNumber: 228,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/apps/frontend/components/denim/admin/AnalyticsPage.tsx",
                                                lineNumber: 227,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/frontend/components/denim/admin/AnalyticsPage.tsx",
                                        lineNumber: 195,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/frontend/components/denim/admin/AnalyticsPage.tsx",
                                lineNumber: 185,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/frontend/components/denim/admin/AnalyticsPage.tsx",
                        lineNumber: 170,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/frontend/components/denim/admin/AnalyticsPage.tsx",
                lineNumber: 57,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/frontend/components/denim/admin/AnalyticsPage.tsx",
        lineNumber: 51,
        columnNumber: 5
    }, this);
}
_s(AnalyticsPage, "Zn4cs3026OJRBhxLd0Oqj+bUOXY=");
_c = AnalyticsPage;
var _c;
__turbopack_context__.k.register(_c, "AnalyticsPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=apps_frontend_components_denim_admin_AnalyticsPage_tsx_b57d5efe._.js.map