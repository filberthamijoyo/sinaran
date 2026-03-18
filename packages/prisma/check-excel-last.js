"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const XLSX = __importStar(require("xlsx"));
const wb = XLSX.readFile('/Users/filberthamijoyo/Downloads/ERP SCRATCH.xlsx');
const ws = wb.Sheets[wb.SheetNames[1]];
const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
console.log('=== Last 20 rows of SACON sheet (checking raw dates) ===');
const start = Math.max(2, data.length - 20);
for (let i = start; i < data.length; i++) {
    const row = data[i];
    if (!row)
        continue;
    const kp = row[3];
    const raw = row[0];
    if (typeof raw === 'number') {
        const d = new Date(Math.round((raw - 25569) * 86400 * 1000));
        console.log(`Row ${i + 1}: KP=${kp} raw=${raw} -> ${d.toISOString().split('T')[0]}`);
    }
}
console.log('\n=== Rows with highest serial numbers ===');
let highRows = [];
for (let i = 2; i < data.length; i++) {
    const row = data[i];
    if (row && typeof row[0] === 'number') {
        highRows.push({ idx: i + 1, kp: row[3], serial: row[0] });
    }
}
highRows.sort((a, b) => b.serial - a.serial);
console.log('Top 10 highest:');
highRows.slice(0, 10).forEach(r => {
    const d = new Date(Math.round((r.serial - 25569) * 86400 * 1000));
    console.log(`Row ${r.idx}: KP=${r.kp} serial=${r.serial} -> ${d.toISOString().split('T')[0]}`);
});
// Also check what the max serial should be for Feb 28 2026
console.log('\n=== What serial should Feb 28 2026 be? ===');
const feb28_2026 = new Date(2026, 1, 28);
const serial = Math.round((feb28_2026.getTime() / 86400000) + 25569);
console.log('Feb 28, 2026 -> Excel serial:', serial);
