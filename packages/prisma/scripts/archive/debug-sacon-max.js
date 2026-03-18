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
const ws = wb.Sheets[wb.SheetNames[1]]; // SACON sheet
const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
let maxVal = -Infinity;
let rows = [];
for (let i = 2; i < data.length; i++) {
    const row = data[i];
    if (!row)
        continue;
    const raw = row[0];
    const kp = row[3];
    if (typeof raw === 'number') {
        if (raw > maxVal) {
            maxVal = raw;
            rows = [{ idx: i, raw, kp }];
        }
        else if (raw === maxVal) {
            rows.push({ idx: i, raw, kp });
        }
    }
    else if (typeof raw === 'string') {
        // keep string dates for later but not used in max
    }
}
console.log('Max numeric raw date (Excel serial):', maxVal);
console.log('Rows with max serial:');
for (const r of rows.slice(0, 20)) {
    const d = new Date(Math.round((r.raw - 25569) * 86400 * 1000));
    console.log(`Row ${r.idx}: raw=${r.raw} KP=${r.kp} -> ${d.toISOString()}`);
}
console.log('\nAlso showing top 10 highest numeric serials:');
const numericRows = [];
for (let i = 2; i < data.length; i++) {
    const row = data[i];
    if (row && typeof row[0] === 'number')
        numericRows.push({ idx: i, raw: row[0], kp: row[3] });
}
numericRows.sort((a, b) => b.raw - a.raw);
for (const r of numericRows.slice(0, 10)) {
    const d = new Date(Math.round((r.raw - 25569) * 86400 * 1000));
    console.log(`Row ${r.idx}: raw=${r.raw} KP=${r.kp} -> ${d.toISOString()}`);
}
