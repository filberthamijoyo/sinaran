import type { PipelineData } from './types';

export async function exportPDF(kp: string, data: PipelineData) {
  const { sc, warping, indigo, weaving, inspectFinish = [] } = data;

  const { jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  doc.setFontSize(18); doc.setFont('helvetica', 'bold');
  doc.text(`Production Report — ${kp}`, 15, 20);
  doc.setFontSize(10); doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 15, 28);
  doc.line(15, 32, 195, 32);

  doc.setFontSize(12); doc.setFont('helvetica', 'bold');
  doc.text('Sales Contract', 15, 40);
  autoTable(doc, {
    startY: 44, margin: { left: 15, right: 15 },
    head: [['Field', 'Value']],
    body: [
      ['KP', sc?.kp || '—'], ['Codename', sc?.codename || '—'],
      ['Customer', sc?.permintaan || '—'],
      ['Date', sc?.tgl ? new Date(sc.tgl).toLocaleDateString() : '—'],
      ['Type', sc?.kat_kode || '—'], ['TE', sc?.te?.toString() || '—'],
      ['Color', sc?.ket_warna || '—'], ['Status', sc?.pipeline_status || '—'],
    ],
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 30, 40] },
    alternateRowStyles: { fillColor: [245, 245, 248] },
  });

  if (warping) {
    // jsPDF-autotable's lastAutoTable.finalY is not in the jsPDF types, so we cast.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const y = (doc as any).lastAutoTable.finalY + 8;
    doc.setFontSize(12); doc.setFont('helvetica', 'bold');
    doc.text('Warping', 15, y);
    autoTable(doc, {
      startY: y + 4, margin: { left: 15, right: 15 },
      head: [['Field', 'Value']],
      body: [
        ['Date', warping.tgl ? new Date(warping.tgl).toLocaleDateString() : '—'],
        ['Machine No', warping.no_mc?.toString() || '—'],
        ['RPM', warping.rpm?.toString() || '—'],
        ['Total Beam', warping.total_beam?.toString() || '—'],
        ['Elongasi', warping.elongasi?.toString() || '—'],
        ['Strength', warping.strength?.toString() || '—'],
        ['CV%', warping.cv_pct?.toString() || '—'],
        ['Eff Warping', warping.eff_warping?.toString() || '—'],
      ],
      styles: { fontSize: 9 },
      headStyles: { fillColor: [30, 30, 40] },
    });
  }

  if (indigo) {
    // jsPDF-autotable's lastAutoTable.finalY is not in the jsPDF types, so we cast.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const y = (doc as any).lastAutoTable.finalY + 8;
    doc.setFontSize(12); doc.setFont('helvetica', 'bold');
    doc.text('Indigo', 15, y);
    autoTable(doc, {
      startY: y + 4, margin: { left: 15, right: 15 },
      head: [['Field', 'Value']],
      body: [
        ['Date', indigo.tanggal ? new Date(indigo.tanggal).toLocaleDateString() : '—'],
        ['Machine', indigo.mc?.toString() || '—'],
        ['Speed', indigo.speed?.toString() || '—'],
        ['Indigo g/L', indigo.indigo?.toString() || '—'],
        ['Caustic g/L', indigo.caustic?.toString() || '—'],
        ['Hydro g/L', indigo.hydro?.toString() || '—'],
        ['BB', indigo.bb?.toString() || '—'],
        ['Strength', indigo.strength?.toString() || '—'],
        ['Elongasi', indigo.elongasi_idg?.toString() || '—'],
      ],
      styles: { fontSize: 9 },
      headStyles: { fillColor: [30, 30, 40] },
    });
  }

  if (weaving.length > 0) {
    // jsPDF-autotable's lastAutoTable.finalY is not in the jsPDF types, so we cast.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const y = (doc as any).lastAutoTable.finalY + 8;
    doc.setFontSize(12); doc.setFont('helvetica', 'bold');
    doc.text('Weaving Summary', 15, y);
    const machines = [...new Set(weaving.map(r => r.machine))];
    const machineRows = machines.map(m => {
      const recs = weaving.filter(r => r.machine === m);
      const avgEffRaw = recs.filter(r => r.a_pct != null && Number(r.a_pct) !== 0);
      const avgEff = avgEffRaw.length > 0
        ? avgEffRaw.reduce((s, r) => s + parseFloat(String(r.a_pct)), 0) / avgEffRaw.length
        : NaN;
      const totalM = recs.reduce((s, r) => s + parseFloat(String(r.meters || 0)), 0);
      return [m, recs.length.toString(), isNaN(avgEff) ? '—' : avgEff.toFixed(1) + '%', totalM.toFixed(0) + 'm'];
    });
    autoTable(doc, {
      startY: y + 4, margin: { left: 15, right: 15 },
      head: [['Machine', 'Shifts', 'Avg Efficiency', 'Total Meters']],
      body: machineRows,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [30, 30, 40] },
    });
  }

  if (inspectFinish.length > 0) {
    // jsPDF-autotable's lastAutoTable.finalY is not in the jsPDF types, so we cast.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const y = (doc as any).lastAutoTable.finalY + 8;
    doc.setFontSize(12); doc.setFont('helvetica', 'bold');
    doc.text('Inspect Finish Summary', 15, y);
    const avgPoint = inspectFinish.filter(r => r.point).reduce((s, r) => s + parseFloat(String(r.point)), 0) / inspectFinish.filter(r => r.point).length;
    const totalKg = inspectFinish.reduce((s, r) => s + parseFloat(String(r.kg || 0)), 0);
    autoTable(doc, {
      startY: y + 4, margin: { left: 15, right: 15 },
      head: [['SN', 'Shift', 'Lebar', 'KG', 'Susut', 'Grade', 'Point']],
      body: inspectFinish.slice(0, 100).map(r => [
        r.sn || '—', r.shift || '—',
        r.lebar?.toString() || '—', r.kg?.toString() || '—',
        r.susut_lusi ? r.susut_lusi + '%' : '—',
        r.grade || '—',
        parseFloat(String(r.point || 0)).toFixed(2),
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [30, 30, 40] },
      foot: [['', '', '', totalKg.toFixed(1) + ' kg total', '', '', isNaN(avgPoint) ? '—' : 'Avg: ' + avgPoint.toFixed(2)]],
    });
  }

  doc.save(`${kp}_production_report.pdf`);
}

export async function exportExcel(kp: string, data: PipelineData) {
  const { sc, warping, indigo, weaving, inspectGray = [], bbsfWashing = [], bbsfSanfor = [], inspectFinish = [] } = data;
  const XLSX = await import('xlsx');
  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
    ['Field', 'Value'],
    ['KP', sc?.kp], ['Codename', sc?.codename], ['Customer', sc?.permintaan],
    ['Date', sc?.tgl ? new Date(sc.tgl).toLocaleDateString() : ''],
    ['Type', sc?.kat_kode], ['TE', sc?.te], ['Color', sc?.ket_warna],
    ['Ne Lusi', sc?.ne_lusi], ['Ne Pakan', sc?.ne_pakan], ['Sisir', sc?.sisir],
    ['Pick', sc?.pick], ['Status', sc?.pipeline_status],
  ]), 'Sales Contract');

  if (warping) XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
    ['Field', 'Value'],
    ['Date', warping.tgl], ['Machine', warping.no_mc], ['RPM', warping.rpm],
    ['Total Beam', warping.total_beam], ['Elongasi', warping.elongasi],
    ['Strength', warping.strength], ['CV%', warping.cv_pct],
    ['Tension Badan', warping.tension_badan], ['Tension Pinggir', warping.tension_pinggir],
    ['Lebar Creel', warping.lebar_creel], ['Eff Warping', warping.eff_warping],
  ]), 'Warping');

  if (indigo) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([indigo]), 'Indigo');

  if (weaving.length) XLSX.utils.book_append_sheet(wb,
    XLSX.utils.json_to_sheet(weaving.map(r => ({
      Date: r.tanggal, Shift: r.shift, Machine: r.machine,
      Efficiency: r.a_pct, Meters: r.meters, KPicks: r.kpicks,
    }))), 'Weaving');

  if (inspectGray.length) XLSX.utils.book_append_sheet(wb,
    XLSX.utils.json_to_sheet(inspectGray.map(r => ({
      Date: r.tg, Machine: r.mc, Beam: r.bm, SN: r.sn,
      Grade: r.gd, Width: r.w, BME: r.bmc, BMC: r.bmc,
    }))), 'Inspect Gray');

  if (bbsfWashing.length) XLSX.utils.book_append_sheet(wb,
    XLSX.utils.json_to_sheet(bbsfWashing), 'BBSF Washing');

  if (bbsfSanfor.length) XLSX.utils.book_append_sheet(wb,
    XLSX.utils.json_to_sheet(bbsfSanfor), 'BBSF Sanfor');

  if (inspectFinish.length) XLSX.utils.book_append_sheet(wb,
    XLSX.utils.json_to_sheet(inspectFinish.map(r => ({
      SN: r.sn, Date: r.tgl, Shift: r.shift, Operator: r.operator,
      Lebar: r.lebar, KG: r.kg, SusutLusi: r.susut_lusi,
      Grade: r.grade, Point: r.point,
    }))), 'Inspect Finish');

  XLSX.writeFile(wb, `${kp}_production_report.xlsx`);
}
