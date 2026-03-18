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
const fs = __importStar(require("fs"));
const buffer = fs.readFileSync('/Users/filberthamijoyo/Downloads/erp/csv/Indigo.csv');
const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: false }); // WITHOUT cellDates
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
// Use array mode to see raw rows WITHOUT date conversion
const raw = XLSX.utils.sheet_to_json(worksheet, {
    defval: null,
    header: 1,
});
console.log('First 5 data rows (without cellDates):');
for (let i = 2; i < 7; i++) {
    console.log(`\nRow ${i}:`);
    const rowArr = raw[i];
    console.log('  Col 0 (TANGGAL):', rowArr[0], typeof rowArr[0]);
    console.log('  Col 1 (MC):', rowArr[1], typeof rowArr[1]);
    console.log('  Col 2 (KP):', rowArr[2], typeof rowArr[2]);
}
