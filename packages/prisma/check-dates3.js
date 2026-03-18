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
console.log('=== Converting highest Excel serial numbers ===');
const highSerials = [46358, 46357, 46356, 46355, 46354];
for (const serial of highSerials) {
    // Standard Excel conversion
    const date = new Date(Math.round((serial - 25569) * 86400 * 1000));
    console.log(`Excel ${serial} -> ${date.toISOString().split('T')[0]}`);
}
console.log('\n=== Check rows with high serial numbers ===');
for (let i = 2; i < Math.min(data.length, 2000); i++) {
    const row = data[i];
    if (row && typeof row[0] === 'number' && row[0] > 46300) {
        const date = new Date(Math.round((row[0] - 25569) * 86400 * 1000));
        console.log(`Row ${i}: KP=${row[3]}, Excel=${row[0]}, Converted=${date.toISOString().split('T')[0]}`);
    }
}
// Let's also check what XLSX library returns
console.log('\n=== Using XLSX utility to parse dates ===');
for (let i = 2; i < 5; i++) {
    const cell = ws['A' + (i + 1)];
    console.log(`Cell A${i + 1}:`, cell?.v, cell?.t);
}
