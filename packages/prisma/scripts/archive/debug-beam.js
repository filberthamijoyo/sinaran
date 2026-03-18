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
const EXCEL_PATH = '/Users/filberthamijoyo/Downloads/erp/CSV/ERP SCRATCH.xlsx';
const wb = XLSX.readFile(EXCEL_PATH, { raw: false, cellDates: false });
const sheet = wb.Sheets['WARPING'];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false });
// Check if KP is undefined/invalid at error rows
console.log('=== Check rows with missing/undefined KP ===');
const badRows = [2505, 2506, 2507, 3006, 3016, 3092]; // error rows from log
for (const idx of badRows) {
    const row = data[idx];
    if (row) {
        const kp = row[2];
        const tgl = row[0];
        console.log(`Row ${idx + 1}: KP="${kp}", Date="${tgl}"`);
    }
}
// Find duplicate KPs (excluding obvious bad data)
console.log('\n=== Real duplicate KPs (excluding time strings) ===');
const kpCount = {};
const timePattern = /^\d{1,2}:\d{2}:\d{2}\s*(AM|PM)$/i;
for (let i = 2; i < data.length; i++) {
    const kp = data[i]?.[2];
    // Skip if KP is empty, undefined, or looks like a time
    if (kp && typeof kp === 'string' && kp.trim() && !timePattern.test(kp.trim())) {
        kpCount[kp] = (kpCount[kp] || 0) + 1;
    }
}
const dups = Object.entries(kpCount).filter(([_, c]) => c > 1).sort((a, b) => b[1] - a[1]);
console.log('Found', dups.length, 'duplicate KPs with real values');
dups.slice(0, 20).forEach(([kp, count]) => console.log(`  ${kp}: ${count} times`));
// Show the first few duplicate KPs' data
if (dups.length > 0) {
    console.log('\n=== First duplicate KP data ===');
    const firstDup = dups[0][0];
    for (let i = 2; i < Math.min(data.length, 100); i++) {
        if (data[i]?.[2] === firstDup) {
            console.log(`Row ${i + 1}: Date=${data[i][0]}, Beams=${data[i][44]}`);
        }
    }
}
