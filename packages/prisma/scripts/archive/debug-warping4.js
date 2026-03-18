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
const workbook = XLSX.readFile('/Users/filberthamijoyo/Downloads/ERP SCRATCH.xlsx');
// Check WARPING sheet more specifically
const warpingSheet = workbook.Sheets[workbook.SheetNames[2]];
const warpingData = XLSX.utils.sheet_to_json(warpingSheet, { header: 1 });
// Check rows around where the first error occurs
console.log('=== Checking WARPING rows around error point ===');
for (let i = 1108; i < 1115; i++) {
    if (warpingData[i]) {
        console.log(`\nRow ${i}:`);
        console.log('  All values:', JSON.stringify(warpingData[i]));
        console.log('  col 0 (TGL):', warpingData[i][0], typeof warpingData[i][0]);
        console.log('  col 1 (START):', warpingData[i][1], typeof warpingData[i][1]);
        console.log('  col 2 (STOP):', warpingData[i][2], typeof warpingData[i][2]);
        console.log('  col 3 (KP):', warpingData[i][3], typeof warpingData[i][3]);
        console.log('  col 4 (KODE):', warpingData[i][4], typeof warpingData[i][4]);
    }
}
