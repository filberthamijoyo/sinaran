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
// First, read WITHOUT cellDates to see raw serials
const wb1 = XLSX.readFile('/Users/filberthamijoyo/Downloads/ERP SCRATCH.xlsx');
const ws1 = wb1.Sheets[wb1.SheetNames[1]];
console.log('=== WITHOUT cellDates (raw serials) ===');
console.log('A1837 (BSLL):', ws1['A1837']?.v, 'formatted:', ws1['A1837']?.w);
console.log('A1871 (BSPB):', ws1['A1871']?.v, 'formatted:', ws1['A1871']?.w);
console.log('A1988 (BUQD):', ws1['A1988']?.v, 'formatted:', ws1['A1988']?.w);
// Then WITH cellDates
const wb2 = XLSX.readFile('/Users/filberthamijoyo/Downloads/ERP SCRATCH.xlsx', { cellDates: true });
const ws2 = wb2.Sheets[wb2.SheetNames[1]];
console.log('\n=== WITH cellDates: true (Date objects) ===');
console.log('A1837 (BSLL):', ws2['A1837']?.v);
console.log('A1871 (BSPB):', ws2['A1871']?.v);
console.log('A1988 (BUQD):', ws2['A1988']?.v);
// The issue: let's see what dates should be
console.log('\n=== What SHOULD the dates be? ===');
console.log('If Excel serial 46143 is May 1, 2026...');
const may1 = new Date(Math.round((46143 - 25569) * 86400 * 1000));
console.log('Serial 46143 ->', may1.toISOString().split('T')[0]);
