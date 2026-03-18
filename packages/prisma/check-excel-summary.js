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
console.log('=== Summary ===');
console.log('Total data rows (excluding header):', data.length - 2);
// Count numeric dates vs string dates
let numericCount = 0;
let stringCount = 0;
for (let i = 2; i < data.length; i++) {
    const row = data[i];
    if (!row || !row[0])
        continue;
    if (typeof row[0] === 'number')
        numericCount++;
    else if (typeof row[0] === 'string')
        stringCount++;
}
console.log('Rows with numeric dates:', numericCount);
console.log('Rows with string dates:', stringCount);
// What dates do the numeric ones represent?
const numericDates = [];
for (let i = 2; i < data.length; i++) {
    const row = data[i];
    if (row && typeof row[0] === 'number')
        numericDates.push(row[0]);
}
numericDates.sort((a, b) => a - b);
console.log('\nDate range from NUMERIC cells:');
const minD = new Date(Math.round((numericDates[0] - 25569) * 86400 * 1000));
const maxD = new Date(Math.round((numericDates[numericDates.length - 1] - 25569) * 86400 * 1000));
console.log('  Min:', numericDates[0], '->', minD.toISOString().split('T')[0]);
console.log('  Max:', numericDates[numericDates.length - 1], '->', maxD.toISOString().split('T')[0]);
