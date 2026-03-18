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
// Check DATALOG sheet more carefully
const datalogSheet = workbook.Sheets[workbook.SheetNames[4]];
const datalogData = XLSX.utils.sheet_to_json(datalogSheet, { header: 1 });
console.log('=== DATALOG Sheet ===');
console.log('Total rows:', datalogData.length);
console.log('\nRow 0:', datalogData[0]?.slice(0, 10));
console.log('Row 1:', datalogData[1]?.slice(0, 10));
console.log('Row 2:', datalogData[2]?.slice(0, 10));
console.log('Row 3:', datalogData[3]?.slice(0, 10));
// Try to find where real data starts
for (let i = 0; i < Math.min(30, datalogData.length); i++) {
    const row = datalogData[i];
    if (row && row[3] && typeof row[3] === 'string' && row[3].trim().length > 0) {
        console.log('\nFirst data row found at index', i);
        console.log('Full row:', row.slice(0, 15));
        break;
    }
}
