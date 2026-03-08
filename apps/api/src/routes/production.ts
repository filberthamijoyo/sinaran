import express from 'express';
import { Decimal } from '@prisma/client/runtime/library';
import { prisma } from '../lib/prisma';

const productionRouter = express.Router();

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------
const deriveRayonBrandLetterCode = (name?: string | null): string | null => {
  if (!name) return null;
  const trimmed = String(name).trim();
  const match = trimmed.match(/([A-Za-z])\s*$/);
  return match ? match[1].toUpperCase() : null;
};

// ============================================================================
// UNITS (UNIT PABRIK) ROUTES
// ============================================================================
const unitsRouter = express.Router();

// GET all units (alias for mills units)
unitsRouter.get('/', async (req, res) => {
  try {
    const all = req.query.all === 'true';
    const units = await prisma.millsUnit.findMany({
      where: all ? {} : { isActive: true },
      orderBy: { name: 'asc' }
    });
    res.json(units);
  } catch (error) {
    console.error('Error fetching units:', error);
    res.status(500).json({ error: 'Failed to fetch units' });
  }
});

// GET single unit (alias for mills unit)
unitsRouter.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const unit = await prisma.millsUnit.findUnique({
      where: { id }
    });
    if (!unit) {
      return res.status(404).json({ error: 'Unit not found' });
    }
    res.json(unit);
  } catch (error) {
    console.error('Error fetching unit:', error);
    res.status(500).json({ error: 'Failed to fetch unit' });
  }
});

// POST create new unit (alias for mills unit)
unitsRouter.post('/', async (req, res) => {
  try {
    const { code, name, letterCode, isActive } = req.body;
    if (!name || !code || !letterCode) {
      return res.status(400).json({ error: 'Code, name, and letterCode are required' });
    }
    const unit = await prisma.millsUnit.create({
      data: { 
        code: parseInt(code),
        name, 
        letterCode,
        isActive: isActive !== undefined ? isActive : false 
      }
    });
    res.status(201).json(unit);
  } catch (error: any) {
    console.error('Error creating unit:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Unit code or name already exists' });
    }
    res.status(500).json({ error: 'Failed to create unit' });
  }
});

// PUT update unit (alias for mills unit)
unitsRouter.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { code, name, letterCode, isActive } = req.body;
    const updateData: any = {};
    if (code !== undefined) updateData.code = parseInt(code);
    if (name !== undefined) updateData.name = name;
    if (letterCode !== undefined) updateData.letterCode = letterCode;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    const unit = await prisma.millsUnit.update({
      where: { id },
      data: updateData
    });
    res.json(unit);
  } catch (error) {
    console.error('Error updating unit:', error);
    res.status(500).json({ error: 'Failed to update unit' });
  }
});

// DELETE unit (soft delete) (alias for mills unit)
unitsRouter.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const unit = await prisma.millsUnit.update({
      where: { id },
      data: { isActive: false }
    });
    res.json({ message: 'Unit deactivated', unit });
  } catch (error) {
    console.error('Error deleting unit:', error);
    res.status(500).json({ error: 'Failed to delete unit' });
  }
});

// ============================================================================
// YARN TYPES (YARN JENIS BENANG) ROUTES
// ============================================================================
const yarnTypesRouter = express.Router();

// GET all yarn types
yarnTypesRouter.get('/', async (req, res) => {
  try {
    const all = req.query.all === 'true';
    const yarnTypes = await prisma.yarnType.findMany({
      where: all ? {} : { isActive: true },
      orderBy: { name: 'asc' }
    });
    res.json(yarnTypes);
  } catch (error) {
    console.error('Error fetching yarn types:', error);
    res.status(500).json({ error: 'Failed to fetch yarn types' });
  }
});

// GET single yarn type
yarnTypesRouter.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const yarnType = await prisma.yarnType.findUnique({
      where: { id }
    });
    if (!yarnType) {
      return res.status(404).json({ error: 'Yarn type not found' });
    }
    res.json(yarnType);
  } catch (error) {
    console.error('Error fetching yarn type:', error);
    res.status(500).json({ error: 'Failed to fetch yarn type' });
  }
});

// POST create new yarn type
yarnTypesRouter.post('/', async (req, res) => {
  try {
    const { name, letterCode, isActive } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    const yarnType = await prisma.yarnType.create({
      data: { name, letterCode: letterCode || String(name).slice(0, 10), isActive: isActive !== undefined ? isActive : false }
    });
    res.status(201).json(yarnType);
  } catch (error: any) {
    console.error('Error creating yarn type:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Yarn type name already exists' });
    }
    res.status(500).json({ error: 'Failed to create yarn type' });
  }
});

// PUT update yarn type
yarnTypesRouter.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, isActive } = req.body;
    const yarnType = await prisma.yarnType.update({
      where: { id },
      data: { name, isActive }
    });
    res.json(yarnType);
  } catch (error) {
    console.error('Error updating yarn type:', error);
    res.status(500).json({ error: 'Failed to update yarn type' });
  }
});

// DELETE yarn type (soft delete)
yarnTypesRouter.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const yarnType = await prisma.yarnType.update({
      where: { id },
      data: { isActive: false }
    });
    res.json({ message: 'Yarn type deactivated', yarnType });
  } catch (error) {
    console.error('Error deleting yarn type:', error);
    res.status(500).json({ error: 'Failed to delete yarn type' });
  }
});

// ============================================================================
// COUNTS (COUNT NE) ROUTES
// ============================================================================
const countsRouter = express.Router();

// GET all counts
countsRouter.get('/', async (req, res) => {
  try {
    const all = req.query.all === 'true';
    const counts = await prisma.countNe.findMany({
      where: all ? {} : { isActive: true },
      orderBy: { value: 'asc' }
    });
    res.json(counts);
  } catch (error) {
    console.error('Error fetching counts:', error);
    res.status(500).json({ error: 'Failed to fetch counts' });
  }
});

// GET single count
countsRouter.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const count = await prisma.countNe.findUnique({
      where: { id }
    });
    if (!count) {
      return res.status(404).json({ error: 'Count not found' });
    }
    res.json(count);
  } catch (error) {
    console.error('Error fetching count:', error);
    res.status(500).json({ error: 'Failed to fetch count' });
  }
});

// POST create new count
countsRouter.post('/', async (req, res) => {
  try {
    const { value, isActive } = req.body;
    if (value === undefined) {
      return res.status(400).json({ error: 'Value is required' });
    }
    const count = await prisma.countNe.create({
      data: { value: parseFloat(value), isActive: isActive !== undefined ? isActive : false }
    });
    res.status(201).json(count);
  } catch (error: any) {
    console.error('Error creating count:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Count value already exists' });
    }
    res.status(500).json({ error: 'Failed to create count' });
  }
});

// PUT update count
countsRouter.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { value, isActive } = req.body;
    const updateData: any = {};
    if (value !== undefined) updateData.value = parseFloat(value);
    if (isActive !== undefined) updateData.isActive = isActive;
    
    const count = await prisma.countNe.update({
      where: { id },
      data: updateData
    });
    res.json(count);
  } catch (error) {
    console.error('Error updating count:', error);
    res.status(500).json({ error: 'Failed to update count' });
  }
});

// DELETE count (soft delete)
countsRouter.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const count = await prisma.countNe.update({
      where: { id },
      data: { isActive: false }
    });
    res.json({ message: 'Count deactivated', count });
  } catch (error) {
    console.error('Error deleting count:', error);
    res.status(500).json({ error: 'Failed to delete count' });
  }
});

// ============================================================================
// SLUB CODES ROUTES
// ============================================================================
const slubCodesRouter = express.Router();

// GET all slub codes
slubCodesRouter.get('/', async (req, res) => {
  try {
    const all = req.query.all === 'true';
    const slubCodes = await prisma.slubCode.findMany({
      where: all ? {} : { isActive: true },
      orderBy: { code: 'asc' }
    });
    res.json(slubCodes);
  } catch (error) {
    console.error('Error fetching slub codes:', error);
    res.status(500).json({ error: 'Failed to fetch slub codes' });
  }
});

// GET single slub code
slubCodesRouter.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const slubCode = await prisma.slubCode.findUnique({
      where: { id }
    });
    if (!slubCode) {
      return res.status(404).json({ error: 'Slub code not found' });
    }
    res.json(slubCode);
  } catch (error) {
    console.error('Error fetching slub code:', error);
    res.status(500).json({ error: 'Failed to fetch slub code' });
  }
});

// POST create new slub code
slubCodesRouter.post('/', async (req, res) => {
  try {
    const { code, name, isActive } = req.body;
    const slubCode = await prisma.slubCode.create({
      data: { code, name, isActive: isActive !== undefined ? isActive : false }
    });
    res.status(201).json(slubCode);
  } catch (error: any) {
    console.error('Error creating slub code:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Slub code already exists' });
    }
    res.status(500).json({ error: 'Failed to create slub code' });
  }
});

// PUT update slub code
slubCodesRouter.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { code, name, isActive } = req.body;
    const slubCode = await prisma.slubCode.update({
      where: { id },
      data: { code, name, isActive }
    });
    res.json(slubCode);
  } catch (error) {
    console.error('Error updating slub code:', error);
    res.status(500).json({ error: 'Failed to update slub code' });
  }
});

// DELETE slub code (soft delete)
slubCodesRouter.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const slubCode = await prisma.slubCode.update({
      where: { id },
      data: { isActive: false }
    });
    res.json({ message: 'Slub code deactivated', slubCode });
  } catch (error) {
    console.error('Error deleting slub code:', error);
    res.status(500).json({ error: 'Failed to delete slub code' });
  }
});

// ============================================================================
// LOTS (LOT BENANG) ROUTES
// ============================================================================
const lotsRouter = express.Router();

// GET all lots
lotsRouter.get('/', async (req, res) => {
  try {
    const all = req.query.all === 'true';
    const lots = await prisma.lot.findMany({
      where: all ? {} : { isActive: true },
      orderBy: { name: 'asc' }
    });
    res.json(lots);
  } catch (error) {
    console.error('Error fetching lots:', error);
    res.status(500).json({ error: 'Failed to fetch lots' });
  }
});

// GET single lot
lotsRouter.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const lot = await prisma.lot.findUnique({
      where: { id }
    });
    if (!lot) {
      return res.status(404).json({ error: 'Lot not found' });
    }
    res.json(lot);
  } catch (error) {
    console.error('Error fetching lot:', error);
    res.status(500).json({ error: 'Failed to fetch lot' });
  }
});

// POST create new lot
lotsRouter.post('/', async (req, res) => {
  try {
    const { name, isActive } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    const lot = await prisma.lot.create({
      data: { name, isActive: isActive !== undefined ? isActive : false }
    });
    res.status(201).json(lot);
  } catch (error: any) {
    console.error('Error creating lot:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Lot name already exists' });
    }
    res.status(500).json({ error: 'Failed to create lot' });
  }
});

// PUT update lot
lotsRouter.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, isActive } = req.body;
    const lot = await prisma.lot.update({
      where: { id },
      data: { name, isActive }
    });
    res.json(lot);
  } catch (error) {
    console.error('Error updating lot:', error);
    res.status(500).json({ error: 'Failed to update lot' });
  }
});

// DELETE lot (soft delete)
lotsRouter.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const lot = await prisma.lot.update({
      where: { id },
      data: { isActive: false }
    });
    res.json({ message: 'Lot deactivated', lot });
  } catch (error) {
    console.error('Error deleting lot:', error);
    res.status(500).json({ error: 'Failed to delete lot' });
  }
});

// ============================================================================
// SPKS ROUTES
// ============================================================================
const spksRouter = express.Router();

// GET all SPKs
spksRouter.get('/', async (req, res) => {
  try {
    const all = req.query.all === 'true';
    const spks = await prisma.spk.findMany({
      where: all ? {} : { isActive: true },
      orderBy: { name: 'asc' }
    });
    res.json(spks);
  } catch (error) {
    console.error('Error fetching SPKs:', error);
    res.status(500).json({ error: 'Failed to fetch SPKs' });
  }
});

// GET single SPK
spksRouter.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const spk = await prisma.spk.findUnique({
      where: { id }
    });
    if (!spk) {
      return res.status(404).json({ error: 'SPK not found' });
    }
    res.json(spk);
  } catch (error) {
    console.error('Error fetching SPK:', error);
    res.status(500).json({ error: 'Failed to fetch SPK' });
  }
});

// POST create new SPK
spksRouter.post('/', async (req, res) => {
  try {
    const { name, isActive } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    const spk = await prisma.spk.create({
      data: { name, isActive: isActive !== undefined ? isActive : false }
    });
    res.status(201).json(spk);
  } catch (error: any) {
    console.error('Error creating SPK:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'SPK name already exists' });
    }
    res.status(500).json({ error: 'Failed to create SPK' });
  }
});

// PUT update SPK
spksRouter.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, isActive } = req.body;
    const spk = await prisma.spk.update({
      where: { id },
      data: { name, isActive }
    });
    res.json(spk);
  } catch (error) {
    console.error('Error updating SPK:', error);
    res.status(500).json({ error: 'Failed to update SPK' });
  }
});

// DELETE SPK (soft delete)
spksRouter.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const spk = await prisma.spk.update({
      where: { id },
      data: { isActive: false }
    });
    res.json({ message: 'SPK deactivated', spk });
  } catch (error) {
    console.error('Error deleting SPK:', error);
    res.status(500).json({ error: 'Failed to delete SPK' });
  }
});

// ============================================================================
// COLORS (WARNA CONE/CHEESE) ROUTES
// ============================================================================
const colorsRouter = express.Router();

// GET all colors
colorsRouter.get('/', async (req, res) => {
  try {
    const all = req.query.all === 'true';
    const colors = await prisma.warnaConeCheese.findMany({
      where: all ? {} : { isActive: true },
      orderBy: { name: 'asc' }
    });
    res.json(colors);
  } catch (error) {
    console.error('Error fetching colors:', error);
    res.status(500).json({ error: 'Failed to fetch colors' });
  }
});

// GET single color
colorsRouter.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const color = await prisma.warnaConeCheese.findUnique({
      where: { id }
    });
    if (!color) {
      return res.status(404).json({ error: 'Color not found' });
    }
    res.json(color);
  } catch (error) {
    console.error('Error fetching color:', error);
    res.status(500).json({ error: 'Failed to fetch color' });
  }
});

// POST create new color
colorsRouter.post('/', async (req, res) => {
  try {
    const { name, isActive } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    const color = await prisma.warnaConeCheese.create({
      data: { name, isActive: isActive !== undefined ? isActive : false }
    });
    res.status(201).json(color);
  } catch (error: any) {
    console.error('Error creating color:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Color name already exists' });
    }
    res.status(500).json({ error: 'Failed to create color' });
  }
});

// PUT update color
colorsRouter.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, isActive } = req.body;
    const color = await prisma.warnaConeCheese.update({
      where: { id },
      data: { name, isActive }
    });
    res.json(color);
  } catch (error) {
    console.error('Error updating color:', error);
    res.status(500).json({ error: 'Failed to update color' });
  }
});

// DELETE color (soft delete)
colorsRouter.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const color = await prisma.warnaConeCheese.update({
      where: { id },
      data: { isActive: false }
    });
    res.json({ message: 'Color deactivated', color });
  } catch (error) {
    console.error('Error deleting color:', error);
    res.status(500).json({ error: 'Failed to delete color' });
  }
});

// ============================================================================
// PRODUCTION RECORDS ROUTES
// ============================================================================
const recordsRouter = express.Router();

// GET all production records with optional filters
recordsRouter.get('/', async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      period,
      day,
      month,
      year,
      filterMonth,
      millsUnitId,
      yarnTypeId,
      countNeId,
      lotId,
      spkId,
      slubCodeId,
      colorId,
      produksiKgsMin,
      produksiKgsMax,
      aktualBalesMin,
      aktualBalesMax,
      effProduksiMin,
      effProduksiMax,
      page,
      limit
    } = req.query;

    const where: any = {};

    // Handle period-based date filtering
    if (period) {
      if (period === 'daily' && day) {
        const dayDate = new Date(String(day));
        const startOfDay = new Date(dayDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(dayDate);
        endOfDay.setHours(23, 59, 59, 999);
        where.productionDate = {
          gte: startOfDay,
          lte: endOfDay
        };
      } else if (period === 'monthly' && month) {
        const [yearStr, monthStr] = String(month).split('-');
        const startDate = new Date(parseInt(yearStr), parseInt(monthStr) - 1, 1);
        const endDate = new Date(parseInt(yearStr), parseInt(monthStr), 0, 23, 59, 59, 999);
        where.productionDate = {
          gte: startDate,
          lte: endDate
        };
      } else if (period === 'yearly' && year) {
        const startDate = new Date(parseInt(String(year)), 0, 1);
        const endDate = new Date(parseInt(String(year)), 11, 31, 23, 59, 59, 999);
        where.productionDate = {
          gte: startDate,
          lte: endDate
        };
      } else if (period === 'range') {
        if (startDate || endDate) {
          where.productionDate = {};
          if (startDate) {
            where.productionDate.gte = new Date(String(startDate));
          }
          if (endDate) {
            where.productionDate.lte = new Date(String(endDate));
          }
        }
      }
    } else if (startDate || endDate) {
      // Fallback to direct date range if no period specified
      where.productionDate = {};
      if (startDate) {
        where.productionDate.gte = new Date(String(startDate));
      }
      if (endDate) {
        where.productionDate.lte = new Date(String(endDate));
      }
    }

    // Handle month filter (if not already handled by period)
    if (month && period !== 'monthly') {
      where.month = String(month);
    }

    // Handle independent month filter
    if (filterMonth) {
      where.month = String(filterMonth);
    }

    if (millsUnitId) {
      where.millsUnitId = Number(millsUnitId);
    }
    if (yarnTypeId) {
      where.yarnTypeId = Number(yarnTypeId);
    }
    if (countNeId) {
      where.countNeId = Number(countNeId);
    }
    if (lotId) {
      where.lotId = Number(lotId);
    }
    if (spkId) {
      where.spkId = Number(spkId);
    }
    if (slubCodeId) {
      where.slubCodeId = Number(slubCodeId);
    }
    if (colorId) {
      where.warnaConeCheeseId = Number(colorId);
    }

    // Handle numeric range filters
    if (produksiKgsMin || produksiKgsMax) {
      where.produksiKgs = {};
      if (produksiKgsMin) {
        where.produksiKgs.gte = parseFloat(String(produksiKgsMin));
      }
      if (produksiKgsMax) {
        where.produksiKgs.lte = parseFloat(String(produksiKgsMax));
      }
    }
    if (aktualBalesMin || aktualBalesMax) {
      where.aktualProduksiBales = {};
      if (aktualBalesMin) {
        where.aktualProduksiBales.gte = parseFloat(String(aktualBalesMin));
      }
      if (aktualBalesMax) {
        where.aktualProduksiBales.lte = parseFloat(String(aktualBalesMax));
      }
    }
    if (effProduksiMin || effProduksiMax) {
      where.produksiEffisiensiPercent = {};
      if (effProduksiMin) {
        where.produksiEffisiensiPercent.gte = parseFloat(String(effProduksiMin));
      }
      if (effProduksiMax) {
        where.produksiEffisiensiPercent.lte = parseFloat(String(effProduksiMax));
      }
    }

    const pageNum = page ? parseInt(page as string) : 1;
    const limitNum = limit ? parseInt(limit as string) : 100;
    const skip = (pageNum - 1) * limitNum;

    const [records, total] = await Promise.all([
      prisma.productionRecord.findMany({
        where,
        orderBy: { productionDate: 'desc' },
        include: {
          millsUnit: true,
          yarnType: true,
          countNe: true,
          countDescription: true,
          blend: true,
          slubCode: true,
          lot: true,
          spk: true,
          warnaConeCheese: true,
          rayonBrand: true,
        },
        skip,
        take: limitNum,
      }),
      prisma.productionRecord.count({ where })
    ]);

    // Serialize BigInt IDs
    const serializedRecords = records.map((record) => ({
      ...record,
      id: record.id.toString()
    }));

    res.json({
      data: serializedRecords,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching production records:', error);
    res.status(500).json({ error: 'Failed to fetch production records' });
  }
});

// GET single production record
recordsRouter.get('/:id', async (req, res) => {
  try {
    const id = BigInt(req.params.id);
    const record = await prisma.productionRecord.findUnique({
      where: { id },
      include: {
        millsUnit: true,
        yarnType: true,
        countNe: true,
        countDescription: true,
        slubCode: true,
        lot: true,
        spk: true,
        warnaConeCheese: true,
        rayonBrand: true,
      },
    });

    if (!record) {
      return res.status(404).json({ error: 'Production record not found' });
    }

    // Convert BigInt to string for JSON serialization
    const serialized = {
      ...record,
      id: record.id.toString()
    };

    res.json(serialized);
  } catch (error) {
    console.error('Error fetching production record:', error);
    res.status(500).json({ error: 'Failed to fetch production record' });
  }
});

// POST create new production record
recordsRouter.post('/', async (req, res) => {
  try {
    const data = req.body;

    // Ensure date is a Date and numeric IDs are numbers
    const payload: any = {
      ...data,
      productionDate: data.productionDate ? new Date(data.productionDate) : undefined,
      // Extract year from productionDate if not provided
      year: data.year ? Number(data.year) : (data.productionDate ? new Date(data.productionDate).getFullYear() : undefined),
      millsUnitId: data.millsUnitId ? Number(data.millsUnitId) : undefined,
      yarnTypeId: data.yarnTypeId
        ? Number(data.yarnTypeId)
        : undefined,
      countNeId: data.countNeId ? Number(data.countNeId) : undefined,
      countDescriptionCode:
        data.countDescriptionCode !== undefined &&
        data.countDescriptionCode !== null &&
        data.countDescriptionCode !== ''
          ? Number(data.countDescriptionCode)
          : null,
      slubCodeId: data.slubCodeId ? Number(data.slubCodeId) : null,
      lotId: data.lotId ? Number(data.lotId) : null,
      spkId: data.spkId ? Number(data.spkId) : null,
      blendId: data.blendId ? Number(data.blendId) : null,
      warnaConeCheeseId: data.warnaConeCheeseId
        ? Number(data.warnaConeCheeseId)
        : null,
      rayonBrandId: data.rayonBrandId ? Number(data.rayonBrandId) : null,
    };

    // Fetch countNeValue from CountNe relation if countNeId is provided
    if (payload.countNeId) {
      const countNe = await prisma.countNe.findUnique({
        where: { id: payload.countNeId },
      });
      if (countNe) {
        payload.countNeValue = countNe.value;
      } else {
        return res.status(400).json({ error: `CountNe with id ${payload.countNeId} not found` });
      }
    }

    // Convert numeric fields
    if (payload.beratConeCheeseKg !== undefined) {
      payload.beratConeCheeseKg = parseFloat(payload.beratConeCheeseKg);
    }
    if (payload.tm !== undefined) {
      payload.tm = parseFloat(payload.tm);
    }
    if (payload.tpi !== undefined) {
      payload.tpi = parseFloat(payload.tpi);
    }
    if (payload.speed !== undefined) {
      payload.speed = parseInt(payload.speed);
    }
    if (payload.jumlahSpindelRotorTerpasang !== undefined) {
      payload.jumlahSpindelRotorTerpasang = parseInt(payload.jumlahSpindelRotorTerpasang);
    }
    if (payload.jumlahConesCheese !== undefined) {
      payload.jumlahConesCheese = parseInt(payload.jumlahConesCheese);
    }

    // Calculate TPI if not provided but TM and countNeValue are available
    // Formula: TPI = TM * sqrt(countNeValue)
    if (!payload.tpi && payload.tm !== undefined && payload.countNeValue) {
      const tm = Number(payload.tm);
      const countNeValue = Number(payload.countNeValue);
      if (tm >= 0 && countNeValue > 0) {
        payload.tpi = new Decimal(tm).mul(Math.sqrt(countNeValue));
      }
    }

    // Calculate required fields based on formulas from schema
    const beratConeCheeseKg = payload.beratConeCheeseKg;
    const jumlahConesCheese = payload.jumlahConesCheese;
    const jumlahSpindelRotorTerpasang = payload.jumlahSpindelRotorTerpasang;
    const speed = payload.speed;
    const countNeValue = payload.countNeValue ? Number(payload.countNeValue) : null;
    const tpi = payload.tpi ? Number(payload.tpi) : null;

    // Calculate produksiKgs if not provided
    if (!payload.produksiKgs && beratConeCheeseKg !== undefined && jumlahConesCheese !== undefined) {
      payload.produksiKgs = new Decimal(beratConeCheeseKg).mul(jumlahConesCheese);
    } else if (payload.produksiKgs !== undefined) {
      payload.produksiKgs = new Decimal(payload.produksiKgs);
    }

    // Calculate produksiLbs if not provided
    if (!payload.produksiLbs && beratConeCheeseKg !== undefined && jumlahConesCheese !== undefined) {
      payload.produksiLbs = new Decimal(beratConeCheeseKg).mul(jumlahConesCheese).mul(2.2046);
    } else if (payload.produksiLbs !== undefined) {
      payload.produksiLbs = new Decimal(payload.produksiLbs);
    }

    const produksiLbs = payload.produksiLbs ? Number(payload.produksiLbs) : null;

    // Calculate aktualProduksiBales if not provided
    if (!payload.aktualProduksiBales && produksiLbs !== null) {
      payload.aktualProduksiBales = new Decimal(produksiLbs).div(400);
    } else if (payload.aktualProduksiBales !== undefined) {
      payload.aktualProduksiBales = new Decimal(payload.aktualProduksiBales);
    }

    const aktualProduksiBales = payload.aktualProduksiBales ? Number(payload.aktualProduksiBales) : null;

    // Calculate produksi100PercentBales (required)
    // Formula: (jumlahSpindelRotorTerpasang * speed * 1440) / (countNeValue * tpi * 840 * 36 * 400)
    if (jumlahSpindelRotorTerpasang !== undefined && speed !== undefined && countNeValue !== null && tpi !== null && tpi > 0) {
      const numerator = new Decimal(jumlahSpindelRotorTerpasang).mul(speed).mul(1440);
      const denominator = new Decimal(countNeValue).mul(tpi).mul(840).mul(36).mul(400);
      payload.produksi100PercentBales = numerator.div(denominator);
    } else if (payload.produksi100PercentBales !== undefined) {
      payload.produksi100PercentBales = new Decimal(payload.produksi100PercentBales);
    }

    const produksi100PercentBales = payload.produksi100PercentBales ? Number(payload.produksi100PercentBales) : null;

    // Calculate targetOpsOpr (required)
    // Formula: 0.254 * speed * 0.9 / tpi / countNeValue
    if (speed !== undefined && tpi !== null && tpi > 0 && countNeValue !== null && countNeValue > 0) {
      payload.targetOpsOpr = new Decimal(0.254).mul(speed).mul(0.9).div(tpi).div(countNeValue);
    } else if (payload.targetOpsOpr !== undefined) {
      payload.targetOpsOpr = new Decimal(payload.targetOpsOpr);
    }

    const targetOpsOpr = payload.targetOpsOpr ? Number(payload.targetOpsOpr) : null;

    // Calculate opsOprAktual (required)
    // Formula: (produksiLbs * 16) / 3 / jumlahSpindelRotorTerpasang
    if (produksiLbs !== null && jumlahSpindelRotorTerpasang !== undefined && jumlahSpindelRotorTerpasang > 0) {
      payload.opsOprAktual = new Decimal(produksiLbs).mul(16).div(3).div(jumlahSpindelRotorTerpasang);
    }

    // -----------------------------------------------------------------------
    // Stoppages, spindles/rotors
    // -----------------------------------------------------------------------
    const powerElectricMin = payload.powerElectricMin ?? 0;
    const countMengubahMin = payload.countMengubahMin ?? 0;
    const creelMengubahMin = payload.creelMengubahMin ?? 0;
    const preventiveMtcMin = payload.preventiveMtcMin ?? 0;
    const creelShortStoppageMin = payload.creelShortStoppageMin ?? 0;

    const totalPenghentianMin =
      powerElectricMin +
      countMengubahMin +
      creelMengubahMin +
      preventiveMtcMin +
      creelShortStoppageMin;

    payload.totalPenghentianMin = totalPenghentianMin;

    let spindlesWorkingNumber: number | null = null;

    if (jumlahSpindelRotorTerpasang !== undefined && totalPenghentianMin !== null) {
      const installedDec = new Decimal(jumlahSpindelRotorTerpasang);
      const totalStopDec = new Decimal(totalPenghentianMin);

      // Spindles / rotors bekerja (average running spindles over 1440 minutes):
      // ((jumlahSpindelRotorTerpasang * 1440) -
      //  (jumlahSpindelRotorTerpasang * totalPenghentianMin)) / 1440
      const spindlesWorking = installedDec
        .mul(1440)
        .sub(installedDec.mul(totalStopDec))
        .div(1440);

      payload.spindlesRotorsBekerja = spindlesWorking;
      spindlesWorkingNumber = Number(spindlesWorking);

      // Spindles / rotors effisiensi = spindles/rotors bekerja / jumlah spindel/rotor terpasang
      payload.spindlesRotorsEffisiensi = spindlesWorking.div(installedDec);
    }

    // OPS/OPR Worked is calculated (not input):
    // (produksiLbs * 16) / 3 / spindles/rotors bekerja
    if (produksiLbs !== null && spindlesWorkingNumber !== null && spindlesWorkingNumber > 0) {
      payload.opsOprWorked = new Decimal(produksiLbs).mul(16).div(3).div(spindlesWorkingNumber);
    } else if (payload.opsOprWorked !== undefined) {
      // Fallback in case it's already set (e.g. legacy data)
      payload.opsOprWorked = new Decimal(payload.opsOprWorked);
    }

    const opsOprWorked = payload.opsOprWorked ? Number(payload.opsOprWorked) : null;

    // Calculate targetProduksiOnTargetOprBales (required)
    // Formula: jumlahSpindelRotorTerpasang * targetOpsOpr * 3 / 16 / 400
    if (jumlahSpindelRotorTerpasang !== undefined && targetOpsOpr !== null) {
      payload.targetProduksiOnTargetOprBales = new Decimal(jumlahSpindelRotorTerpasang)
        .mul(targetOpsOpr)
        .mul(3)
        .div(16)
        .div(400);
    } else if (payload.targetProduksiOnTargetOprBales !== undefined) {
      payload.targetProduksiOnTargetOprBales = new Decimal(payload.targetProduksiOnTargetOprBales);
    }

    // Calculate keuntunganKerugianEfisiensiBalesOnTargetOpsOpr (required)
    // Formula: (opsOprWorked - targetOpsOpr) * jumlahSpindelRotorTerpasang * 3 / 16 / 400
    if (opsOprWorked !== null && targetOpsOpr !== null && jumlahSpindelRotorTerpasang !== undefined) {
      payload.keuntunganKerugianEfisiensiBalesOnTargetOpsOpr = new Decimal(opsOprWorked)
        .sub(targetOpsOpr)
        .mul(jumlahSpindelRotorTerpasang)
        .mul(3)
        .div(16)
        .div(400);
    } else if (payload.keuntunganKerugianEfisiensiBalesOnTargetOpsOpr !== undefined) {
      payload.keuntunganKerugianEfisiensiBalesOnTargetOpsOpr = new Decimal(payload.keuntunganKerugianEfisiensiBalesOnTargetOpsOpr);
    }

    // Calculate produksiEffisiensiPercent (required)
    // Formula: aktualProduksiBales / produksi100PercentBales
    if (aktualProduksiBales !== null && produksi100PercentBales !== null && produksi100PercentBales > 0) {
      payload.produksiEffisiensiPercent = new Decimal(aktualProduksiBales).div(produksi100PercentBales);
    } else if (payload.produksiEffisiensiPercent !== undefined) {
      payload.produksiEffisiensiPercent = new Decimal(payload.produksiEffisiensiPercent);
    }

    // Calculate effisiensiKerjaPercent (required)
    // Formula: (opsOprWorked * jumlahSpindelRotorTerpasang * 3 / 1600 / 4) / produksi100PercentBales
    if (opsOprWorked !== null && jumlahSpindelRotorTerpasang !== undefined && produksi100PercentBales !== null && produksi100PercentBales > 0) {
      const numerator = new Decimal(opsOprWorked)
        .mul(jumlahSpindelRotorTerpasang)
        .mul(3)
        .div(1600)
        .div(4);
      payload.effisiensiKerjaPercent = numerator.div(produksi100PercentBales);
    } else if (payload.effisiensiKerjaPercent !== undefined) {
      payload.effisiensiKerjaPercent = new Decimal(payload.effisiensiKerjaPercent);
    }

    // Loss calculations based on opsOprWorked
    if (opsOprWorked !== null && jumlahSpindelRotorTerpasang !== undefined) {
      const opsWorkedDec = new Decimal(opsOprWorked);
      const installedDec = new Decimal(jumlahSpindelRotorTerpasang);
      const baseFactor = opsWorkedDec.mul(3).mul(installedDec).div(1440).div(16).div(400);

      if (powerElectricMin !== null) {
        payload.powerPenghentian = baseFactor.mul(powerElectricMin).neg();
      }
      if (countMengubahMin !== null) {
        payload.countMengubahLoss = baseFactor.mul(countMengubahMin).neg();
      }
      if (creelMengubahMin !== null) {
        payload.creelMengubahLoss = baseFactor.mul(creelMengubahMin).neg();
      }
      if (preventiveMtcMin !== null) {
        payload.preventiveMtcLoss = baseFactor.mul(preventiveMtcMin).neg();
      }
      if (creelShortStoppageMin !== null) {
        payload.creelShortLoss = baseFactor.mul(creelShortStoppageMin).neg();
      }
      if (totalPenghentianMin !== null) {
        payload.kerugianTotal = baseFactor.mul(totalPenghentianMin).neg();
      }
    }

    // Backwards‑compat: accept either `yarnTypeId` or legacy `yarnJenisBenangId`
    if (
      (payload.yarnTypeId === undefined || payload.yarnTypeId === null) &&
      (data as any).yarnJenisBenangId !== undefined &&
      (data as any).yarnJenisBenangId !== null &&
      (data as any).yarnJenisBenangId !== ''
    ) {
      payload.yarnTypeId = Number((data as any).yarnJenisBenangId);
    }

    // Remove legacy field so Prisma doesn't see an unknown argument
    if ('yarnJenisBenangId' in payload) {
      delete (payload as any).yarnJenisBenangId;
    }

    // Backwards‑compat: legacy `lotBenangId` → `lotId`
    if (
      (payload.lotId === undefined || payload.lotId === null) &&
      (data as any).lotBenangId !== undefined &&
      (data as any).lotBenangId !== null &&
      (data as any).lotBenangId !== ''
    ) {
      payload.lotId = Number((data as any).lotBenangId);
    }

    if ('lotBenangId' in payload) {
      delete (payload as any).lotBenangId;
    }

    const created = await prisma.productionRecord.create({
      // We intentionally use the "unchecked" create input shape here:
      // all foreign keys (`millsUnitId`, `yarnTypeId`, `countNeId`, optional `*Id`
      // fields, and `countDescriptionCode`) are passed as scalar fields instead
      // of nested `connect` objects. This matches the Prisma
      // `ProductionRecordUncheckedCreateInput` type and avoids mixed checked/unchecked
      // shapes that cause "Unknown argument" validation errors.
      data: payload,
      include: {
        millsUnit: true,
        yarnType: true,
        countNe: true,
        countDescription: true,
        slubCode: true,
        lot: true,
        spk: true,
        warnaConeCheese: true,
        rayonBrand: true,
      },
    });

    // Convert BigInt to string
    const serialized = {
      ...created,
      id: created.id.toString()
    };

    res.status(201).json(serialized);
  } catch (error: any) {
    console.error('Error creating production record:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Production record already exists' });
    }
    res.status(500).json({ error: 'Failed to create production record' });
  }
});

// PUT update production record
recordsRouter.put('/:id', async (req, res) => {
  try {
    const id = BigInt(req.params.id);
    const data = req.body;

    const payload: any = { ...data };

    if (data.productionDate) {
      payload.productionDate = new Date(data.productionDate);
      // Extract year from productionDate if not explicitly provided
      if (data.year === undefined) {
        payload.year = new Date(data.productionDate).getFullYear();
      }
    }
    if (data.year !== undefined) {
      payload.year = Number(data.year);
    }
    if (data.month !== undefined) {
      payload.month = String(data.month);
    }
    if (data.millsUnitId !== undefined) {
      payload.millsUnitId = data.millsUnitId ? Number(data.millsUnitId) : undefined;
    }
    if (data.yarnTypeId !== undefined) {
      payload.yarnTypeId = data.yarnTypeId
        ? Number(data.yarnTypeId)
        : undefined;
    }
    if (data.countNeId !== undefined) {
      payload.countNeId = data.countNeId ? Number(data.countNeId) : undefined;
    }
    if (data.countDescriptionCode !== undefined) {
      payload.countDescriptionCode =
        data.countDescriptionCode !== null &&
        data.countDescriptionCode !== '' &&
        data.countDescriptionCode !== undefined
          ? Number(data.countDescriptionCode)
          : null;
    }
    if (data.slubCodeId !== undefined) {
      payload.slubCodeId = data.slubCodeId ? Number(data.slubCodeId) : null;
    }
    if (data.lotId !== undefined) {
      payload.lotId = data.lotId ? Number(data.lotId) : null;
    }
    if (data.spkId !== undefined) {
      payload.spkId = data.spkId ? Number(data.spkId) : null;
    }
    if (data.blendId !== undefined) {
      payload.blendId = data.blendId ? Number(data.blendId) : null;
    }
    if (data.warnaConeCheeseId !== undefined) {
      payload.warnaConeCheeseId = data.warnaConeCheeseId
        ? Number(data.warnaConeCheeseId)
        : null;
    }
    if (data.rayonBrandId !== undefined) {
      payload.rayonBrandId = data.rayonBrandId ? Number(data.rayonBrandId) : null;
    }

    // Fetch countNeValue from CountNe relation if countNeId is being updated
    if (payload.countNeId !== undefined) {
      const countNe = await prisma.countNe.findUnique({
        where: { id: payload.countNeId },
      });
      if (countNe) {
        payload.countNeValue = countNe.value;
      } else {
        return res.status(400).json({ error: `CountNe with id ${payload.countNeId} not found` });
      }
    }

    // Convert numeric fields
    if (payload.beratConeCheeseKg !== undefined) {
      payload.beratConeCheeseKg = parseFloat(payload.beratConeCheeseKg);
    }
    if (payload.tm !== undefined) {
      payload.tm = parseFloat(payload.tm);
    }
    if (payload.tpi !== undefined) {
      payload.tpi = parseFloat(payload.tpi);
    }
    if (payload.speed !== undefined) {
      payload.speed = parseInt(payload.speed);
    }
    if (payload.jumlahSpindelRotorTerpasang !== undefined) {
      payload.jumlahSpindelRotorTerpasang = parseInt(payload.jumlahSpindelRotorTerpasang);
    }
    if (payload.jumlahConesCheese !== undefined) {
      payload.jumlahConesCheese = parseInt(payload.jumlahConesCheese);
    }

    // Fetch existing record to get values for calculations if fields are not being updated
    const existing = await prisma.productionRecord.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Production record not found' });
    }

    // Calculate TPI if not provided but TM and countNeValue are available
    // Formula: TPI = TM * sqrt(countNeValue)
    if (payload.tm !== undefined && (payload.countNeValue || existing.countNeValue)) {
      const tm = payload.tm !== undefined ? Number(payload.tm) : Number(existing.tm);
      const countNeValue = payload.countNeValue !== undefined ? Number(payload.countNeValue) : Number(existing.countNeValue);
      if (tm >= 0 && countNeValue > 0 && !payload.tpi) {
        payload.tpi = new Decimal(tm).mul(Math.sqrt(countNeValue));
      }
    }

    // Use updated values or fall back to existing values for calculations
    const beratConeCheeseKg = payload.beratConeCheeseKg !== undefined ? payload.beratConeCheeseKg : Number(existing.beratConeCheeseKg);
    const jumlahConesCheese = payload.jumlahConesCheese !== undefined ? payload.jumlahConesCheese : existing.jumlahConesCheese;
    const jumlahSpindelRotorTerpasang = payload.jumlahSpindelRotorTerpasang !== undefined ? payload.jumlahSpindelRotorTerpasang : existing.jumlahSpindelRotorTerpasang;
    const speed = payload.speed !== undefined ? payload.speed : existing.speed;
    const countNeValue = payload.countNeValue !== undefined ? Number(payload.countNeValue) : Number(existing.countNeValue);
    const tpi = payload.tpi !== undefined ? Number(payload.tpi) : Number(existing.tpi);

    // Recalculate fields if any dependent field was updated
    const shouldRecalculate = 
      payload.beratConeCheeseKg !== undefined ||
      payload.jumlahConesCheese !== undefined ||
      payload.jumlahSpindelRotorTerpasang !== undefined ||
      payload.speed !== undefined ||
      payload.countNeId !== undefined ||
      payload.tpi !== undefined ||
      payload.tm !== undefined ||
      payload.opsOprWorked !== undefined ||
      payload.powerElectricMin !== undefined ||
      payload.countMengubahMin !== undefined ||
      payload.creelMengubahMin !== undefined ||
      payload.preventiveMtcMin !== undefined ||
      payload.creelShortStoppageMin !== undefined;

    if (shouldRecalculate) {
      // Calculate produksiKgs
      payload.produksiKgs = new Decimal(beratConeCheeseKg).mul(jumlahConesCheese);

      // Calculate produksiLbs
      payload.produksiLbs = new Decimal(beratConeCheeseKg).mul(jumlahConesCheese).mul(2.2046);

      const produksiLbs = Number(payload.produksiLbs);

      // Calculate aktualProduksiBales
      payload.aktualProduksiBales = new Decimal(produksiLbs).div(400);

      const aktualProduksiBales = Number(payload.aktualProduksiBales);

      // Calculate produksi100PercentBales
      if (jumlahSpindelRotorTerpasang !== undefined && speed !== undefined && countNeValue !== null && tpi !== null && tpi > 0) {
        const numerator = new Decimal(jumlahSpindelRotorTerpasang).mul(speed).mul(1440);
        const denominator = new Decimal(countNeValue).mul(tpi).mul(840).mul(36).mul(400);
        payload.produksi100PercentBales = numerator.div(denominator);
      }

      const produksi100PercentBales = payload.produksi100PercentBales ? Number(payload.produksi100PercentBales) : Number(existing.produksi100PercentBales);

      // Calculate targetOpsOpr
      if (speed !== undefined && tpi !== null && tpi > 0 && countNeValue !== null && countNeValue > 0) {
        payload.targetOpsOpr = new Decimal(0.254).mul(speed).mul(0.9).div(tpi).div(countNeValue);
      }

      const targetOpsOpr = payload.targetOpsOpr ? Number(payload.targetOpsOpr) : Number(existing.targetOpsOpr);

      // Calculate opsOprAktual
      if (produksiLbs !== null && jumlahSpindelRotorTerpasang !== undefined && jumlahSpindelRotorTerpasang > 0) {
        payload.opsOprAktual = new Decimal(produksiLbs).mul(16).div(3).div(jumlahSpindelRotorTerpasang);
      }

      // Calculate targetProduksiOnTargetOprBales
      if (jumlahSpindelRotorTerpasang !== undefined && targetOpsOpr !== null) {
        payload.targetProduksiOnTargetOprBales = new Decimal(jumlahSpindelRotorTerpasang)
          .mul(targetOpsOpr)
          .mul(3)
          .div(16)
          .div(400);
      }
      
      // -------------------------------------------------------------------
      // Stoppages and spindles/rotors
      // -------------------------------------------------------------------
      const powerElectricMin =
        payload.powerElectricMin !== undefined
          ? payload.powerElectricMin
          : existing.powerElectricMin ?? 0;
      const countMengubahMin =
        payload.countMengubahMin !== undefined
          ? payload.countMengubahMin
          : existing.countMengubahMin ?? 0;
      const creelMengubahMin =
        payload.creelMengubahMin !== undefined
          ? payload.creelMengubahMin
          : existing.creelMengubahMin ?? 0;
      const preventiveMtcMin =
        payload.preventiveMtcMin !== undefined
          ? payload.preventiveMtcMin
          : existing.preventiveMtcMin ?? 0;
      const creelShortStoppageMin =
        payload.creelShortStoppageMin !== undefined
          ? payload.creelShortStoppageMin
          : existing.creelShortStoppageMin ?? 0;

      const totalPenghentianMin =
        (powerElectricMin ?? 0) +
        (countMengubahMin ?? 0) +
        (creelMengubahMin ?? 0) +
        (preventiveMtcMin ?? 0) +
        (creelShortStoppageMin ?? 0);

      payload.totalPenghentianMin = totalPenghentianMin;

      let spindlesWorkingNumber: number | null = null;

      if (jumlahSpindelRotorTerpasang !== undefined && totalPenghentianMin !== null) {
        const installedDec = new Decimal(jumlahSpindelRotorTerpasang);
        const totalStopDec = new Decimal(totalPenghentianMin);

        // Spindles / rotors bekerja (average running spindles over 1440 minutes):
        // ((jumlahSpindelRotorTerpasang * 1440) -
        //  (jumlahSpindelRotorTerpasang * totalPenghentianMin)) / 1440
        const spindlesWorking = installedDec
          .mul(1440)
          .sub(installedDec.mul(totalStopDec))
          .div(1440);

        payload.spindlesRotorsBekerja = spindlesWorking;
        spindlesWorkingNumber = Number(spindlesWorking);

        // Spindles / rotors effisiensi = spindles/rotors bekerja / jumlah spindel/rotor terpasang
        payload.spindlesRotorsEffisiensi = spindlesWorking.div(installedDec);
      }

      // OPS/OPR Worked (calculated, not input):
      // (produksiLbs * 16) / 3 / spindles/rotors bekerja
      if (produksiLbs !== null && spindlesWorkingNumber !== null && spindlesWorkingNumber > 0) {
        payload.opsOprWorked = new Decimal(produksiLbs).mul(16).div(3).div(spindlesWorkingNumber);
      }

      const opsOprWorked = payload.opsOprWorked ? Number(payload.opsOprWorked) : null;

      // Calculate keuntunganKerugianEfisiensiBalesOnTargetOpsOpr
      if (opsOprWorked !== null && targetOpsOpr !== null && jumlahSpindelRotorTerpasang !== undefined) {
        payload.keuntunganKerugianEfisiensiBalesOnTargetOpsOpr = new Decimal(opsOprWorked)
          .sub(targetOpsOpr)
          .mul(jumlahSpindelRotorTerpasang)
          .mul(3)
          .div(16)
          .div(400);
      }

      // Calculate produksiEffisiensiPercent
      if (aktualProduksiBales !== null && produksi100PercentBales !== null && produksi100PercentBales > 0) {
        payload.produksiEffisiensiPercent = new Decimal(aktualProduksiBales).div(produksi100PercentBales);
      }

      // Calculate effisiensiKerjaPercent
      if (opsOprWorked !== null && jumlahSpindelRotorTerpasang !== undefined && produksi100PercentBales !== null && produksi100PercentBales > 0) {
        const numerator = new Decimal(opsOprWorked)
          .mul(jumlahSpindelRotorTerpasang)
          .mul(3)
          .div(1600)
          .div(4);
        payload.effisiensiKerjaPercent = numerator.div(produksi100PercentBales);
      }

      // Loss calculations
      if (opsOprWorked !== null && jumlahSpindelRotorTerpasang !== undefined) {
        const opsWorkedDec = new Decimal(opsOprWorked);
        const installedDec = new Decimal(jumlahSpindelRotorTerpasang);
        const baseFactor = opsWorkedDec.mul(3).mul(installedDec).div(1440).div(16).div(400);

        if (powerElectricMin !== null) {
          payload.powerPenghentian = baseFactor.mul(powerElectricMin).neg();
        }
        if (countMengubahMin !== null) {
          payload.countMengubahLoss = baseFactor.mul(countMengubahMin).neg();
        }
        if (creelMengubahMin !== null) {
          payload.creelMengubahLoss = baseFactor.mul(creelMengubahMin).neg();
        }
        if (preventiveMtcMin !== null) {
          payload.preventiveMtcLoss = baseFactor.mul(preventiveMtcMin).neg();
        }
        if (creelShortStoppageMin !== null) {
          payload.creelShortLoss = baseFactor.mul(creelShortStoppageMin).neg();
        }
        if (totalPenghentianMin !== null) {
          payload.kerugianTotal = baseFactor.mul(totalPenghentianMin).neg();
        }
      }
    }

    const updated = await prisma.productionRecord.update({
      where: { id },
      data: payload,
      include: {
        millsUnit: true,
        yarnType: true,
        countNe: true,
        countDescription: true,
        slubCode: true,
        lot: true,
        spk: true,
        warnaConeCheese: true,
        rayonBrand: true,
      },
    });

    // Convert BigInt to string
    const serialized = {
      ...updated,
      id: updated.id.toString()
    };

    res.json(serialized);
  } catch (error: any) {
    console.error('Error updating production record:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Production record not found' });
    }
    res.status(500).json({ error: 'Failed to update production record' });
  }
});

// GET production summary (monthly/yearly aggregates)
recordsRouter.get('/summary', async (req, res) => {
  try {
    const {
      period, // 'monthly' | 'yearly'
      month, // YYYY-MM format for monthly
      year, // YYYY format for yearly
      millsUnitId,
      yarnTypeId,
      countNeId,
    } = req.query;

    const where: any = {};

    // Handle date filtering based on period
    if (period === 'monthly' && month) {
      const [yearStr, monthStr] = String(month).split('-');
      const startDate = new Date(parseInt(yearStr), parseInt(monthStr) - 1, 1);
      const endDate = new Date(parseInt(yearStr), parseInt(monthStr), 0, 23, 59, 59, 999);
      where.productionDate = {
        gte: startDate,
        lte: endDate
      };
    } else if (period === 'yearly' && year) {
      const startDate = new Date(parseInt(String(year)), 0, 1);
      const endDate = new Date(parseInt(String(year)), 11, 31, 23, 59, 59, 999);
      where.productionDate = {
        gte: startDate,
        lte: endDate
      };
    }

    // Apply additional filters
    if (millsUnitId) {
      where.millsUnitId = Number(millsUnitId);
    }
    if (yarnTypeId) {
      where.yarnTypeId = Number(yarnTypeId);
    }
    if (countNeId) {
      where.countNeId = Number(countNeId);
    }

    // Determine grouping fields based on period
    const groupBy: any[] = ['millsUnitId', 'yarnTypeId', 'countNeId'];
    if (period === 'monthly') {
      groupBy.push('month');
    } else if (period === 'yearly') {
      groupBy.push('month'); // We'll aggregate by month first, then combine
    }

    const grouped = await prisma.productionRecord.groupBy({
      by: groupBy,
      where,
      _count: { _all: true },
      _sum: {
        jumlahConesCheese: true,
        produksiKgs: true,
        produksiLbs: true,
        aktualProduksiBales: true,
        produksi100PercentBales: true,
        targetProduksiOnTargetOprBales: true,
        keuntunganKerugianEfisiensiBalesOnTargetOpsOpr: true,
        targetOpsOpr: true,
        opsOprAktual: true,
        opsOprWorked: true,
        totalPenghentianMin: true,
        kerugianTotal: true,
      },
      _avg: {
        produksiEffisiensiPercent: true,
        effisiensiKerjaPercent: true,
      },
    });

    // Fetch related data for labels
    const unitIds = [...new Set(grouped.map((g) => g.millsUnitId))];
    const yarnTypeIds = [...new Set(grouped.map((g) => g.yarnTypeId))];
    const countIds = [...new Set(grouped.map((g) => g.countNeId))];

    const [units, yarnTypes, counts] = await Promise.all([
      prisma.millsUnit.findMany({ where: { id: { in: unitIds } } }),
      prisma.yarnType.findMany({ where: { id: { in: yarnTypeIds } } }),
      prisma.countNe.findMany({ where: { id: { in: countIds } } }),
    ]);

    const unitMap = new Map(units.map((u) => [u.id, u.name]));
    const yarnTypeMap = new Map(yarnTypes.map((yt) => [yt.id, yt.name]));
    const countMap = new Map(counts.map((c) => [c.id, c.value]));

    // Process results
    let result = grouped.map((g) => {
      const monthValue = g.month || '';
      const yearFromMonth = monthValue ? (() => {
        const match = monthValue.match(/(\d{4})/);
        if (match) return match[1];
        return new Date().getFullYear().toString();
      })() : '';

      return {
        month: monthValue,
        year: yearFromMonth,
        millsUnitId: g.millsUnitId,
        millsUnitName: unitMap.get(g.millsUnitId) || '',
        yarnTypeId: g.yarnTypeId,
        yarnTypeName: yarnTypeMap.get(g.yarnTypeId) || '',
        countNeId: g.countNeId,
        countNeValue: countMap.get(g.countNeId) || null,
        recordCount: g._count._all,
        jumlahConesCheese: g._sum.jumlahConesCheese,
        produksiKgs: g._sum.produksiKgs,
        produksiLbs: g._sum.produksiLbs,
        aktualProduksiBales: g._sum.aktualProduksiBales,
        produksi100PercentBales: g._sum.produksi100PercentBales,
        targetProduksiOnTargetOprBales: g._sum.targetProduksiOnTargetOprBales,
        keuntunganKerugianEfisiensiBalesOnTargetOpsOpr: g._sum.keuntunganKerugianEfisiensiBalesOnTargetOpsOpr,
        targetOpsOpr: g._sum.targetOpsOpr,
        opsOprAktual: g._sum.opsOprAktual,
        opsOprWorked: g._sum.opsOprWorked,
        totalPenghentianMin: g._sum.totalPenghentianMin,
        kerugianTotal: g._sum.kerugianTotal,
        produksiEffisiensiPercentAvg: g._avg.produksiEffisiensiPercent,
        effisiensiKerjaPercentAvg: g._avg.effisiensiKerjaPercent,
      };
    });

    // For yearly period, aggregate by year (combine all months)
    if (period === 'yearly') {
      const yearlyMap = new Map();
      result.forEach((r) => {
        const key = `${r.year}-${r.millsUnitId}-${r.yarnTypeId}-${r.countNeId}`;
        if (!yearlyMap.has(key)) {
          yearlyMap.set(key, {
            year: r.year,
            millsUnitId: r.millsUnitId,
            millsUnitName: r.millsUnitName,
            yarnTypeId: r.yarnTypeId,
            yarnTypeName: r.yarnTypeName,
            countNeId: r.countNeId,
            countNeValue: r.countNeValue,
            recordCount: 0,
            jumlahConesCheese: 0,
            produksiKgs: 0,
            produksiLbs: 0,
            aktualProduksiBales: 0,
            produksi100PercentBales: 0,
            targetProduksiOnTargetOprBales: 0,
            keuntunganKerugianEfisiensiBalesOnTargetOpsOpr: 0,
            targetOpsOpr: 0,
            opsOprAktual: 0,
            opsOprWorked: 0,
            totalPenghentianMin: 0,
            kerugianTotal: 0,
            produksiEffisiensiPercentSum: 0,
            effisiensiKerjaPercentSum: 0,
            avgCount: 0,
          });
        }
        const agg = yearlyMap.get(key);
        agg.recordCount += r.recordCount;
        agg.avgCount += r.recordCount;
        
        const addSum = (field: string) => {
          const val = r[field];
          if (val !== null && val !== undefined) {
            agg[field] = (agg[field] || 0) + Number(val);
          }
        };
        
        addSum('jumlahConesCheese');
        addSum('produksiKgs');
        addSum('produksiLbs');
        addSum('aktualProduksiBales');
        addSum('produksi100PercentBales');
        addSum('targetProduksiOnTargetOprBales');
        addSum('keuntunganKerugianEfisiensiBalesOnTargetOpsOpr');
        addSum('targetOpsOpr');
        addSum('opsOprAktual');
        addSum('opsOprWorked');
        addSum('totalPenghentianMin');
        addSum('kerugianTotal');
        
        if (r.produksiEffisiensiPercentAvg !== null) {
          agg.produksiEffisiensiPercentSum += Number(r.produksiEffisiensiPercentAvg) * r.recordCount;
        }
        if (r.effisiensiKerjaPercentAvg !== null) {
          agg.effisiensiKerjaPercentSum += Number(r.effisiensiKerjaPercentAvg) * r.recordCount;
        }
      });

      result = Array.from(yearlyMap.values()).map(agg => ({
        month: '',
        year: agg.year,
        millsUnitId: agg.millsUnitId,
        millsUnitName: agg.millsUnitName,
        yarnTypeId: agg.yarnTypeId,
        yarnTypeName: agg.yarnTypeName,
        countNeId: agg.countNeId,
        countNeValue: agg.countNeValue,
        recordCount: agg.recordCount,
        jumlahConesCheese: agg.jumlahConesCheese,
        produksiKgs: agg.produksiKgs,
        produksiLbs: agg.produksiLbs,
        aktualProduksiBales: agg.aktualProduksiBales,
        produksi100PercentBales: agg.produksi100PercentBales,
        targetProduksiOnTargetOprBales: agg.targetProduksiOnTargetOprBales,
        keuntunganKerugianEfisiensiBalesOnTargetOpsOpr: agg.keuntunganKerugianEfisiensiBalesOnTargetOpsOpr,
        targetOpsOpr: agg.targetOpsOpr,
        opsOprAktual: agg.opsOprAktual,
        opsOprWorked: agg.opsOprWorked,
        totalPenghentianMin: agg.totalPenghentianMin,
        kerugianTotal: agg.kerugianTotal,
        produksiEffisiensiPercentAvg: agg.avgCount > 0 ? agg.produksiEffisiensiPercentSum / agg.avgCount : null,
        effisiensiKerjaPercentAvg: agg.avgCount > 0 ? agg.effisiensiKerjaPercentSum / agg.avgCount : null,
      })) as typeof result;
    }

    // Serialize Decimal values
    const serialized = result.map((r) => ({
      ...r,
      produksiKgs: r.produksiKgs ? Number(r.produksiKgs) : null,
      produksiLbs: r.produksiLbs ? Number(r.produksiLbs) : null,
      aktualProduksiBales: r.aktualProduksiBales ? Number(r.aktualProduksiBales) : null,
      produksi100PercentBales: r.produksi100PercentBales ? Number(r.produksi100PercentBales) : null,
      targetProduksiOnTargetOprBales: r.targetProduksiOnTargetOprBales ? Number(r.targetProduksiOnTargetOprBales) : null,
      keuntunganKerugianEfisiensiBalesOnTargetOpsOpr: r.keuntunganKerugianEfisiensiBalesOnTargetOpsOpr ? Number(r.keuntunganKerugianEfisiensiBalesOnTargetOpsOpr) : null,
      targetOpsOpr: r.targetOpsOpr ? Number(r.targetOpsOpr) : null,
      opsOprAktual: r.opsOprAktual ? Number(r.opsOprAktual) : null,
      opsOprWorked: r.opsOprWorked ? Number(r.opsOprWorked) : null,
      produksiEffisiensiPercentAvg: r.produksiEffisiensiPercentAvg ? Number(r.produksiEffisiensiPercentAvg) : null,
      effisiensiKerjaPercentAvg: r.effisiensiKerjaPercentAvg ? Number(r.effisiensiKerjaPercentAvg) : null,
    }));

    res.json(serialized);
  } catch (error) {
    console.error('Error fetching production summary:', error);
    res.status(500).json({ error: 'Failed to fetch production summary' });
  }
});

// DELETE production record (hard delete)
recordsRouter.delete('/:id', async (req, res) => {
  try {
    const id = BigInt(req.params.id);

    const deleted = await prisma.productionRecord.delete({
      where: { id },
    });

    // Convert BigInt to string
    const serialized = {
      ...deleted,
      id: deleted.id.toString()
    };

    res.json({ message: 'Production record deleted', deleted: serialized });
  } catch (error: any) {
    console.error('Error deleting production record:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Production record not found' });
    }
    res.status(500).json({ error: 'Failed to delete production record' });
  }
});

// ============================================================================
// MILLS UNITS ROUTES
// ============================================================================
const millsUnitsRouter = express.Router();

// GET all mills units
millsUnitsRouter.get('/', async (req, res) => {
  try {
    const all = req.query.all === 'true';
    const millsUnits = await prisma.millsUnit.findMany({
      where: all ? {} : { isActive: true },
      orderBy: { code: 'asc' }
    });
    res.json(millsUnits);
  } catch (error) {
    console.error('Error fetching mills units:', error);
    res.status(500).json({ error: 'Failed to fetch mills units' });
  }
});

// GET single mills unit
millsUnitsRouter.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const millsUnit = await prisma.millsUnit.findUnique({ where: { id } });
    if (!millsUnit) {
      return res.status(404).json({ error: 'Mills unit not found' });
    }
    res.json(millsUnit);
  } catch (error) {
    console.error('Error fetching mills unit:', error);
    res.status(500).json({ error: 'Failed to fetch mills unit' });
  }
});

// POST create new mills unit
millsUnitsRouter.post('/', async (req, res) => {
  try {
    const { code, name, letterCode, isActive } = req.body;
    if (!code || !name || !letterCode) {
      return res.status(400).json({ error: 'Code, name, and letterCode are required' });
    }
    const millsUnit = await prisma.millsUnit.create({
      data: { code: parseInt(code), name, letterCode, isActive: isActive !== undefined ? isActive : false }
    });
    res.status(201).json(millsUnit);
  } catch (error: any) {
    console.error('Error creating mills unit:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Mills unit code already exists' });
    }
    res.status(500).json({ error: 'Failed to create mills unit' });
  }
});

// PUT update mills unit
millsUnitsRouter.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { code, name, letterCode, isActive } = req.body;
    if (letterCode === undefined || letterCode === null || letterCode === '') {
      return res.status(400).json({ error: 'letterCode is required' });
    }
    const millsUnit = await prisma.millsUnit.update({
      where: { id },
      data: { code: code ? parseInt(code) : undefined, name, letterCode, isActive }
    });
    res.json(millsUnit);
  } catch (error) {
    console.error('Error updating mills unit:', error);
    res.status(500).json({ error: 'Failed to update mills unit' });
  }
});

// DELETE mills unit (soft delete)
millsUnitsRouter.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const millsUnit = await prisma.millsUnit.update({
      where: { id },
      data: { isActive: false }
    });
    res.json({ message: 'Mills unit deactivated', millsUnit });
  } catch (error) {
    console.error('Error deleting mills unit:', error);
    res.status(500).json({ error: 'Failed to delete mills unit' });
  }
});

// ============================================================================
// MOUNT ALL ROUTES
// ============================================================================
productionRouter.use('/units', unitsRouter);
productionRouter.use('/yarn-types', yarnTypesRouter);
productionRouter.use('/counts', countsRouter);
productionRouter.use('/slub-codes', slubCodesRouter);
productionRouter.use('/lots', lotsRouter);
productionRouter.use('/spks', spksRouter);
productionRouter.use('/colors', colorsRouter);
productionRouter.use('/records', recordsRouter);
productionRouter.use('/mills-units', millsUnitsRouter);

// ============================================================================
// RAYON BRANDS ROUTES
// ============================================================================
const rayonBrandsRouter = express.Router();

// GET all rayon brands
rayonBrandsRouter.get('/', async (req, res) => {
  try {
    const all = req.query.all === 'true';
    const brands = await prisma.rayonBrand.findMany({
      where: all ? {} : { isActive: true },
      orderBy: { name: 'asc' }
    });
    res.json(brands);
  } catch (error) {
    console.error('Error fetching rayon brands:', error);
    res.status(500).json({ error: 'Failed to fetch rayon brands' });
  }
});

// GET single rayon brand
rayonBrandsRouter.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const brand = await prisma.rayonBrand.findUnique({
      where: { id }
    });
    if (!brand) {
      return res.status(404).json({ error: 'Rayon brand not found' });
    }
    res.json(brand);
  } catch (error) {
    console.error('Error fetching rayon brand:', error);
    res.status(500).json({ error: 'Failed to fetch rayon brand' });
  }
});

// POST create new rayon brand
rayonBrandsRouter.post('/', async (req, res) => {
  try {
    const { name, isActive, letterCode } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    const derived = deriveRayonBrandLetterCode(name);
    const normalizedLetterCode =
      letterCode !== undefined && letterCode !== null && String(letterCode).trim() !== ''
        ? String(letterCode).trim().toUpperCase().slice(0, 1)
        : derived;
    const brand = await prisma.rayonBrand.create({
      data: {
        name,
        letterCode: normalizedLetterCode,
        isActive: isActive !== undefined ? isActive : false
      }
    });
    res.status(201).json(brand);
  } catch (error: any) {
    console.error('Error creating rayon brand:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Rayon brand name already exists' });
    }
    res.status(500).json({ error: 'Failed to create rayon brand' });
  }
});

// PUT update rayon brand
rayonBrandsRouter.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, isActive, letterCode } = req.body;
    const derived = deriveRayonBrandLetterCode(name);
    const normalizedLetterCode =
      letterCode !== undefined && letterCode !== null && String(letterCode).trim() !== ''
        ? String(letterCode).trim().toUpperCase().slice(0, 1)
        : derived;
    const brand = await prisma.rayonBrand.update({
      where: { id },
      data: { name, letterCode: normalizedLetterCode, isActive }
    });
    res.json(brand);
  } catch (error) {
    console.error('Error updating rayon brand:', error);
    res.status(500).json({ error: 'Failed to update rayon brand' });
  }
});

// DELETE rayon brand (soft delete)
rayonBrandsRouter.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const brand = await prisma.rayonBrand.update({
      where: { id },
      data: { isActive: false }
    });
    res.json({ message: 'Rayon brand deactivated', brand });
  } catch (error) {
    console.error('Error deleting rayon brand:', error);
    res.status(500).json({ error: 'Failed to delete rayon brand' });
  }
});

productionRouter.use('/rayon-brands', rayonBrandsRouter);

export default productionRouter;
