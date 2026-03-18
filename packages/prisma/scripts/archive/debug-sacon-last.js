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
console.log('SACON total rows:', data.length);
// Find rows with the latest dates (last 10 rows in the sheet)
const lastRows = data.slice(-10);
lastRows.forEach((row, i) => {
    const idx = data.length - 10 + i;
    const raw = row?.[0];
    const kp = row?.[3];
    console.log(`Row ${idx}: raw date = ${raw}, type = ${typeof raw}, KP = ${kp}`);
    if (typeof raw === 'number') {
        const d = new Date(Math.round((raw - 25569) * 86400 * 1000));
        console.log(`  -> Converted (25569): ${d.toISOString()}`);
    }
});
// Also check first rows
console.log('\nFirst data rows (2-5):');
data.slice(2, 6).forEach((row, i) => {
    const idx = 2 + i;
    const raw = row?.[0];
    const kp = row?.[3];
    console.log(`Row ${idx}: raw = ${raw}, type = ${typeof raw}, KP = ${kp}`);
    if (typeof raw === 'number') {
        const d = new Date(Math.round((raw - 25569) * 86400 * 1000));
        console.log(`  -> Converted (25569): ${d.toISOString()}`);
    }
});
