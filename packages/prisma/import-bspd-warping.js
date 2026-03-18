const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');
const fs = require('fs');
const prisma = new PrismaClient();
async function main() {
    // Read the Warping CSV
    const buf = fs.readFileSync('/Users/filberthamijoyo/Downloads/erp/csv/Warping.csv');
    const wb = XLSX.read(buf, { type: 'buffer' });
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: null });
    const row = rows.find((r) => r['KP'] === 'BSPD');
    if (!row) {
        console.log('BSPD not found in Warping CSV');
        return;
    }
    console.log('Found BSPD in CSV, importing...');
    // Parse fields
    function toNum(val) {
        if (val === null || val === undefined || val === '')
            return null;
        if (typeof val === 'number')
            return val;
        const n = parseFloat(String(val).replace(/,/g, ''));
        return isNaN(n) ? null : n;
    }
    function toStr(val) {
        if (val === null || val === undefined)
            return null;
        return String(val).trim() || null;
    }
    function toDate(val) {
        if (val === null || val === undefined || val === '')
            return null;
        if (val instanceof Date)
            return isNaN(val.getTime()) ? null : val;
        if (typeof val === 'number') {
            const excelEpoch = new Date(1899, 11, 30);
            const date = new Date(excelEpoch.getTime() + val * 86400000);
            return isNaN(date.getTime()) ? null : date;
        }
        const str = String(val).trim();
        if (!str)
            return null;
        const direct = new Date(str);
        if (!isNaN(direct.getTime()))
            return direct;
        const ddmmMatch = str.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})$/);
        if (ddmmMatch) {
            const day = parseInt(ddmmMatch[1]);
            const month = parseInt(ddmmMatch[2]) - 1;
            let year = parseInt(ddmmMatch[3]);
            if (year < 100)
                year += 2000;
            const d = new Date(year, month, day);
            if (!isNaN(d.getTime()))
                return d;
        }
        return null;
    }
    const kp = toStr(row['KP']);
    const tgl = toDate(row['TGL']);
    console.log('KP:', kp, '| Date:', tgl);
    // Create WarpingRun
    let effRaw = row['EFF WARPING'];
    let effWarping = null;
    if (effRaw !== null && effRaw !== undefined) {
        const effStr = String(effRaw).replace('%', '').trim();
        const effNum = parseFloat(effStr);
        if (!isNaN(effNum)) {
            effWarping = effNum > 1 ? effNum / 100 : effNum;
        }
    }
    const warpingRun = await prisma.warpingRun.create({
        data: {
            kp,
            tgl,
            start_time: toStr(row['START']),
            stop_time: toStr(row['STOP']),
            kode_full: toStr(row['KODE']),
            benang: toStr(row['BENANG']),
            lot: toStr(row['LOT']),
            sp: toStr(row['SP']),
            pt: toNum(row['PT']) ? Math.round(toNum(row['PT'])) : null,
            te: toNum(row['TE']),
            rpm: toNum(row['RPM']) ? Math.round(toNum(row['RPM'])) : null,
            mtr_min: toNum(row['MTR/MIN']),
            total_putusan: toNum(row['TOTAL\n PUTUSAN']) ? Math.round(toNum(row['TOTAL\n PUTUSAN'])) : null,
            data_putusan: toStr(row['DATA\nPUTUSAN']),
            total_beam: toNum(row['Total\nBeam']) ? Math.round(toNum(row['Total\nBeam'])) : null,
            cn_1: toNum(row['1 CN']),
            jam: toNum(row['Jam']),
            total_waktu: toNum(row['Total\nWaktu']),
            eff_warping: effWarping,
            no_mc: toNum(row['NO MC']) ? Math.round(toNum(row['NO MC'])) : null,
            elongasi: toNum(row['ELONGASI']),
            strength: toNum(row['STRENGTH']),
            cv_pct: toNum(row['CV%']),
            tension_badan: toNum(row['TENSION\nBADAN']) ? Math.round(toNum(row['TENSION\nBADAN'])) : null,
            tension_pinggir: toNum(row['TENSION\nPINGGIR']) ? Math.round(toNum(row['TENSION\nPINGGIR'])) : null,
            lebar_creel: toNum(row['LEBAR\nCREEL']) ? Math.round(toNum(row['LEBAR\nCREEL'])) : null,
        },
    });
    console.log('Created WarpingRun ID:', warpingRun.id);
    // Create WarpingBeams
    const beamData = [];
    for (let b = 1; b <= 15; b++) {
        const beamNum = toNum(row[`No\nbeam ${b}`]);
        if (beamNum === null)
            continue;
        beamData.push({
            warping_run_id: warpingRun.id,
            kp,
            position: b,
            beam_number: Math.round(beamNum),
            putusan: toNum(row[`PUTUSAN ${b}`]) ? Math.round(toNum(row[`PUTUSAN ${b}`])) : null,
        });
    }
    console.log('Creating', beamData.length, 'beams...');
    if (beamData.length > 0) {
        await prisma.warpingBeam.createMany({
            data: beamData,
            skipDuplicates: true,
        });
    }
    console.log('Done! BSPD WarpingRun and beams created.');
}
main().catch(console.error).finally(() => prisma.$disconnect());
