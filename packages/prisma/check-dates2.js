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
console.log('=== More Date Values from SACON ===');
for (let i = 2; i < 20; i++) {
    const row = data[i];
    if (row && row[0] !== undefined) {
        console.log(`Row ${i} col 0:`, row[0], '-> converted:', new Date(Math.round((row[0] - 25569) * 86400 * 1000)).toISOString().split('T')[0]);
    }
}
// Check if dates are strings (DD/MM/YYYY format)
console.log('\n=== Checking for string dates ===');
const stringDateRows = [];
for (let i = 2; i < Math.min(100, data.length); i++) {
    const row = data[i];
    if (row && typeof row[0] === 'string') {
        stringDateRows.push({ row: i, val: row[0] });
    }
}
console.log('Found', stringDateRows.length, 'string dates');
if (stringDateRows.length > 0) {
    console.log('First few:', stringDateRows.slice(0, 5));
}
// Check rows with highest date numbers
console.log('\n=== Rows with highest date numbers ===');
const rowsWithDates = [];
for (let i = 2; i < data.length; i++) {
    const row = data[i];
    if (row && typeof row[0] === 'number') {
        rowsWithDates.push({ row: i, val: row[0] });
    }
}
rowsWithDates.sort((a, b) => b.val - a.val);
console.log('Highest:', rowsWithDates.slice(0, 5));
console.log('Lowest:', rowsWithDates.slice(-5));
