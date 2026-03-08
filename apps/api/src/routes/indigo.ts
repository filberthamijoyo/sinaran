import express from 'express';
import { prisma } from '../lib/prisma';
import { serializeBigInt } from '../utils/serialization';

const indigoRouter = express.Router();

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

const toDecimal = (value: any) =>
  value !== null && value !== undefined && value !== '' ? parseFloat(value) : null;

const toInt = (value: any) => {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
};

// Note: frontend sends YYYY-MM-DD strings; we validate minimally here.
const parseDate = (value: any): Date | null => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    return null;
  }
  return d;
};

const buildIndigoWhere = (query: any) => {
  const { startDate, endDate, dateFrom, dateTo, code, countDescriptionCode } = query;
  const where: any = {};

  const from = startDate || dateFrom;
  const to = endDate || dateTo;

  if (from || to) {
    where.tanggal = {};
    if (from) {
      const d = parseDate(from);
      if (d) where.tanggal.gte = d;
    }
    if (to) {
      const d = parseDate(to);
      if (d) where.tanggal.lte = d;
    }
  }

  if (code) {
    where.code = { contains: String(code), mode: 'insensitive' };
  }

  if (countDescriptionCode) {
    const codeNum = parseInt(String(countDescriptionCode), 10);
    if (!Number.isNaN(codeNum)) {
      where.countDescriptionCode = codeNum;
    }
  }

  return where;
};

// ----------------------------------------------------------------------------
// LIST / DETAIL
// ----------------------------------------------------------------------------

// GET all Indigo division records (with simple pagination and filters)
indigoRouter.get('/records', async (req, res) => {
  try {
    const { page = '1', limit = '200' } = req.query;

    const where = buildIndigoWhere(req.query);

    const [records, total] = await Promise.all([
      prisma.indigoDivisionRecord.findMany({
        where,
        orderBy: { tanggal: 'desc' },
        take: parseInt(limit as string, 10),
        skip: (parseInt(page as string, 10) - 1) * parseInt(limit as string, 10)
      }),
      prisma.indigoDivisionRecord.count({ where })
    ]);

    res.json(
      serializeBigInt({
        records,
        pagination: {
          page: parseInt(page as string, 10),
          limit: parseInt(limit as string, 10),
          total,
          totalPages: Math.ceil(total / parseInt(limit as string, 10)) || 1
        }
      })
    );
  } catch (error: any) {
    console.error('Error fetching Indigo division records:', error);
    res.status(500).json({ error: 'Failed to fetch Indigo division records' });
  }
});

// GET single Indigo division record
indigoRouter.get('/records/:id', async (req, res) => {
  try {
    const id = BigInt(req.params.id);
    const record = await prisma.indigoDivisionRecord.findUnique({
      where: { id }
    });
    if (!record) {
      return res.status(404).json({ error: 'Indigo division record not found' });
    }
    res.json(serializeBigInt(record));
  } catch (error: any) {
    console.error('Error fetching Indigo division record:', error);
    res.status(500).json({ error: 'Failed to fetch Indigo division record' });
  }
});

// ----------------------------------------------------------------------------
// CREATE / UPDATE
// ----------------------------------------------------------------------------

const buildIndigoDataFromBody = (body: any) => {
  const tanggal = parseDate(body.tanggal);
  if (!tanggal) {
    throw new Error('Invalid or missing tanggal (expected YYYY-MM-DD)');
  }

  return {
    tanggal,
    mc: toInt(body.mc),
    kp: body.kp || null,
    code: body.code || null,
    // Optional link to CountDescription via code, not currently used by frontend
    ne: body.ne || null,

    // P, TE, BB
    p: toDecimal(body.p),
    te: toDecimal(body.te),
    bb: toDecimal(body.bb),

    // Base machine / bath settings
    speed: toDecimal(body.speed),
    bakCelup: toDecimal(body.bakCelup),
    bakSulfur: toDecimal(body.bakSulfur),
    konstIdg: toDecimal(body.konstIdg),
    konstSulfur: toDecimal(body.konstSulfur),

    // PEMAKAIAN OBAT
    visc: toDecimal(body.visc),
    ref: toDecimal(body.ref),
    sizeBox: toDecimal(body.sizeBox),
    scoring: toDecimal(body.scoring),
    jetsize: toDecimal(body.jetsize),
    polisizeHs: toDecimal(body.polisizeHs),
    polisize12: toDecimal(body.polisize12),
    armosize: toDecimal(body.armosize),
    armosize11: toDecimal(body.armosize11),
    armosize12: toDecimal(body.armosize12),
    armosize13: toDecimal(body.armosize13),
    armosize15: toDecimal(body.armosize15),
    armosize17: toDecimal(body.armosize17),
    quqlaxe: toDecimal(body.quqlaxe),
    armoC: toDecimal(body.armoC),
    vitE: toDecimal(body.vitE),
    armoD: toDecimal(body.armoD),
    tapioca: toDecimal(body.tapioca),
    a308: toDecimal(body.a308),

    // PEMASAKAN INDIGO (AKTUAL)
    indigo: toDecimal(body.indigo),
    causticPemasakanIndigo: toDecimal(body.causticPemasakanIndigo),
    hydro: toDecimal(body.hydro),
    solopolPemasakanIndigo: toDecimal(body.solopolPemasakanIndigo),
    serawetPemasakanIndigo: toDecimal(body.serawetPemasakanIndigo),
    primasolPemasakanIndigo: toDecimal(body.primasolPemasakanIndigo),
    cottoclarinPemasakanIndigo: toDecimal(body.cottoclarinPemasakanIndigo),
    setamol: toDecimal(body.setamol),

    // Ungrouped chemicals
    granular: toDecimal(body.granular),
    granule: toDecimal(body.granule),
    grain: toDecimal(body.grain),
    wetMatic: toDecimal(body.wetMatic),
    fisat: toDecimal(body.fisat),
    breviol: toDecimal(body.breviol),
    csk: toDecimal(body.csk),
    comee: toDecimal(body.comee),

    // PEMASAKAN CAUSTIK
    dirsolRdp: toDecimal(body.dirsolRdp),
    primasolNf: toDecimal(body.primasolNf),
    zolopolPhtrZb: toDecimal(body.zolopolPhtrZb),
    cottoclarinPemasakanCaustik: toDecimal(body.cottoclarinPemasakanCaustik),
    sanwet: toDecimal(body.sanwet),

    // PEMASAKAN CAUSTIC
    marcerizeCoustic: toDecimal(body.marcerizeCoustic),
    sanmercer: toDecimal(body.sanmercer),
    sancomplex: toDecimal(body.sancomplex),

    // PEMASAKAN HYDRO AKSES
    exsessCaustic: toDecimal(body.exsessCaustic),
    exsessHydro: toDecimal(body.exsessHydro),

    // Ungrouped
    dextoor: toDecimal(body.dextoor),
    ltr: toDecimal(body.ltr),

    // PEMASAKAN SULFUR (FEEDING)
    diresolBlackKasRotkas: toDecimal(body.diresolBlackKasRotkas),
    sansulSdc: toDecimal(body.sansulSdc),
    causticPemasakanSulfur: toDecimal(body.causticPemasakanSulfur),
    dextros: toDecimal(body.dextros),
    solopolPemasakanSulfur: toDecimal(body.solopolPemasakanSulfur),
    primasolPemasakanSulfur: toDecimal(body.primasolPemasakanSulfur),
    serawetPemasakanSulfur: toDecimal(body.serawetPemasakanSulfur),
    cottoclarinPemasakanSulfur: toDecimal(body.cottoclarinPemasakanSulfur),

    // FEEDING
    saneutral: toDecimal(body.saneutral),
    dextroseAdjust: toDecimal(body.dextroseAdjust),

    // Ungrouped between FEEDING and SETINGAN INDIGO
    optifikRsl: toDecimal(body.optifikRsl),
    ekalinF: toDecimal(body.ekalinF),
    solopolPhtr: toDecimal(body.solopolPhtr),

    // SETINGAN INDIGO
    moitureMahlo: toDecimal(body.moitureMahlo),
    tempDryer: toDecimal(body.tempDryer),
    tempMidDryer: toDecimal(body.tempMidDryer),
    tempSizeBox1: toDecimal(body.tempSizeBox1),
    tempSizeBox2: toDecimal(body.tempSizeBox2),
    sizeBox1: toDecimal(body.sizeBox1),
    sizeBox2: toDecimal(body.sizeBox2),
    squeezingRoll1: toDecimal(body.squeezingRoll1),
    squeezingRoll2: toDecimal(body.squeezingRoll2),
    immersionRoll: toDecimal(body.immersionRoll),
    dryer: toDecimal(body.dryer),
    takeOff: toDecimal(body.takeOff),
    winding: toDecimal(body.winding),
    pressBeam: toDecimal(body.pressBeam),
    hydrolicPump1: toDecimal(body.hydrolicPump1),
    hydrolicPump2: toDecimal(body.hydrolicPump2),
    unwinder: toDecimal(body.unwinder),
    dyeingTensWash: toDecimal(body.dyeingTensWash),
    dyeingTensWarna: toDecimal(body.dyeingTensWarna),

    // Trailing KPIs
    mcIdg: toDecimal(body.mcIdg),
    strength: toDecimal(body.strength),
    elongasiIdg: toDecimal(body.elongasiIdg),
    cvPercent: toDecimal(body.cvPercent)
  };
};

// POST create Indigo division record
indigoRouter.post('/records', async (req, res) => {
  try {
    const data = buildIndigoDataFromBody(req.body);

    const record = await prisma.indigoDivisionRecord.create({
      data: data as any
    });

    res.status(201).json(serializeBigInt(record));
  } catch (error: any) {
    console.error('Error creating Indigo division record:', error);

    if (error.message && error.message.includes('tanggal')) {
      return res.status(400).json({ error: error.message });
    }

    if (error.code === 'P2003') {
      const fieldName = error.meta?.field_name || 'foreign key';
      return res.status(400).json({
        error: 'Invalid foreign key reference',
        details: `The ${fieldName} does not exist in the database. Please check your data.`
      });
    }

    res.status(500).json({ error: 'Failed to create Indigo division record', details: error.message });
  }
});

// PUT update Indigo division record
indigoRouter.put('/records/:id', async (req, res) => {
  try {
    const id = BigInt(req.params.id);
    const data = buildIndigoDataFromBody(req.body);

    const record = await prisma.indigoDivisionRecord.update({
      where: { id },
      data: data as any
    });

    res.json(serializeBigInt(record));
  } catch (error: any) {
    console.error('Error updating Indigo division record:', error);

    if (error.message && error.message.includes('tanggal')) {
      return res.status(400).json({ error: error.message });
    }

    if (error.code === 'P2003') {
      const fieldName = error.meta?.field_name || 'foreign key';
      return res.status(400).json({
        error: 'Invalid foreign key reference',
        details: `The ${fieldName} does not exist in the database. Please check your data.`
      });
    }

    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Indigo division record not found' });
    }

    res.status(500).json({ error: 'Failed to update Indigo division record', details: error.message });
  }
});

export default indigoRouter;

