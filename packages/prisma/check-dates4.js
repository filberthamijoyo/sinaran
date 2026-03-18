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
console.log('=== Find minimum Excel serial number ===');
let minSerial = Infinity;
let minRow = -1;
for (let i = 2; i < data.length; i++) {
    const row = data[i];
    if (row && typeof row[0] === 'number' && row[0] < minSerial) {
        minSerial = row[0];
        minRow = i;
    }
}
console.log('Minimum Excel serial:', minSerial, 'at row', minRow);
if (minSerial !== Infinity) {
    const date = new Date(Math.round((minSerial - 25569) * 86400 * 1000));
    console.log('Converted date:', date.toISOString().split('T')[0]);
}
// Check first 50 rows for date patterns
console.log('\n=== First 50 rows dates ===');
for (let i = 2; i < Math.min(52, data.length); i++) {
    const row = data[i];
    if (row) {
        const dateVal = row[0];
        let dateStr = 'N/A';
        if (typeof dateVal === 'number') {
            dateStr = new Date(Math.round((dateVal - 25569) * 86400 * 1000)).toISOString().split('T')[0];
        }
        else if (typeof dateVal === 'string') {
            dateStr = 'string: ' + dateVal;
        }
        console.log(`Row ${i}: KP=${row[3]}, Date=${dateStr}`);
    }
}
