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
console.log('=== SACON Sheet Date Values ===');
console.log('Row 2 (first data) col 0:', data[2]?.[0], typeof data[2]?.[0]);
console.log('Row 3 col 0:', data[3]?.[0], typeof data[3]?.[0]);
console.log('Row 4 col 0:', data[4]?.[0], typeof data[4]?.[0]);
console.log('Row 5 col 0:', data[5]?.[0], typeof data[5]?.[0]);
console.log('Row 10 col 0:', data[10]?.[0], typeof data[10]?.[0]);
console.log('Row 100 col 0:', data[100]?.[0], typeof data[100]?.[0]);
// Test conversion
console.log('\n=== Testing toDate conversion ===');
function toDate(val) {
    if (!val || val === '')
        return new Date();
    if (val instanceof Date)
        return val;
    if (typeof val === 'number') {
        return new Date(Math.round((val - 25569) * 86400 * 1000));
    }
    if (typeof val === 'string') {
        const parts = val.split('/');
        if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const year = parseInt(parts[2], 10);
            if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                const d = new Date(year, month, day);
                if (!isNaN(d.getTime()))
                    return d;
            }
        }
        const d = new Date(val);
        if (!isNaN(d.getTime()))
            return d;
    }
    return new Date();
}
console.log('toDate(45450):', toDate(45450));
console.log('toDate("30/1/2024"):', toDate("30/1/2024"));
