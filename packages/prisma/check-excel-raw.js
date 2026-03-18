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
const ws = wb.Sheets[wb.SheetNames[1]]; // SACON
const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
// KPs with wrong dates
const wrongKPs = new Set([
    'BUQD', 'BUQE', 'BSPB', 'BSBQ', 'BSBS', 'BTBN', 'BTBP', 'BTBL', 'BTBE', 'BTBB', 'BTBJ',
    'BTBD', 'BTBS', 'BTBQ', 'BTPJ', 'BTPE', 'BTBT', 'BSPT', 'BSPQ', 'BSPD', 'BSPE', 'BSPL',
    'BSPN', 'BSPJ', 'BSPP', 'BSPS', 'BTPB', 'BTPP', 'BSJB', 'BSJP', 'BSJN', 'BSJJ', 'BTPN',
    'BTPD', 'BTPS', 'BTPT', 'BSJE', 'BSJD', 'BSJS', 'BSJQ', 'BSNB', 'BSNP', 'BSJT', 'BSJL',
    'BTJB', 'BTPQ', 'BSNT', 'BSNN', 'BSNL', 'BSNE', 'BSND', 'BSNJ', 'BTJL', 'BTJN', 'BTJS',
    'BTJJ', 'BTJP', 'BTJE', 'BSLB', 'BSLJ', 'BSNS', 'BSNQ', 'BSLN', 'BSLP', 'BSLL', 'BTJQ',
    'BTJT', 'BTJD'
]);
console.log('=== Raw Excel values for wrong-date KPs ===\n');
for (let i = 2; i < data.length; i++) {
    const row = data[i];
    if (!row?.[3])
        continue;
    const kp = String(row[3]).trim();
    if (wrongKPs.has(kp)) {
        const raw = row[0];
        const type = typeof raw;
        let converted = null;
        if (type === 'number') {
            converted = new Date(Math.round((raw - 25569) * 86400 * 1000)).toISOString();
        }
        else if (raw instanceof Date) {
            converted = raw.toISOString();
        }
        else if (type === 'string') {
            converted = `string: "${raw}"`;
        }
        console.log(`KP: ${kp} | raw: ${JSON.stringify(raw)} | type: ${type} | converted: ${converted}`);
    }
}
