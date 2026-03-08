import express from 'express';
import { prisma } from '../lib/prisma';
import { calculateFields } from '../utils/calculations';
import { serializeBigInt } from '../utils/serialization';

const qualityRouter = express.Router();

// ============================================================================
// COUNT DESCRIPTIONS ROUTES
// ============================================================================
const countDescriptionsRouter = express.Router();

// GET all count descriptions (for dropdowns)
countDescriptionsRouter.get('/', async (req, res) => {
  try {
    const all = req.query.all === 'true';
    const countDescriptions = await prisma.countDescription.findMany({
      where: all ? {} : { isActive: true },
      orderBy: { code: 'asc' }
    });
    res.json(countDescriptions);
  } catch (error) {
    console.error('Error fetching count descriptions:', error);
    res.status(500).json({ error: 'Failed to fetch count descriptions' });
  }
});

// GET single count description
countDescriptionsRouter.get('/:code', async (req, res) => {
  try {
    const code = parseInt(req.params.code);
    const countDescription = await prisma.countDescription.findUnique({
      where: { code }
    });
    if (!countDescription) {
      return res.status(404).json({ error: 'Count description not found' });
    }
    res.json(countDescription);
  } catch (error) {
    console.error('Error fetching count description:', error);
    res.status(500).json({ error: 'Failed to fetch count description' });
  }
});

// POST create new count description
countDescriptionsRouter.post('/', async (req, res) => {
  try {
    const { code, name, isActive } = req.body;
    if (!code || !name) {
      return res.status(400).json({ error: 'Code and name are required' });
    }
    const countDescription = await prisma.countDescription.create({
      data: { code: parseInt(code), name, isActive: isActive !== undefined ? isActive : false }
    });
    res.status(201).json(countDescription);
  } catch (error: any) {
    console.error('Error creating count description:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Count description code already exists' });
    }
    res.status(500).json({ error: 'Failed to create count description' });
  }
});

// PUT update count description
countDescriptionsRouter.put('/:code', async (req, res) => {
  try {
    const code = parseInt(req.params.code);
    const { name, isActive } = req.body;
    const countDescription = await prisma.countDescription.update({
      where: { code },
      data: { name, isActive }
    });
    res.json(countDescription);
  } catch (error) {
    console.error('Error updating count description:', error);
    res.status(500).json({ error: 'Failed to update count description' });
  }
});

// DELETE count description (soft delete)
countDescriptionsRouter.delete('/:code', async (req, res) => {
  try {
    const code = parseInt(req.params.code);
    const countDescription = await prisma.countDescription.update({
      where: { code },
      data: { isActive: false }
    });
    res.json({ message: 'Count description deactivated', countDescription });
  } catch (error) {
    console.error('Error deleting count description:', error);
    res.status(500).json({ error: 'Failed to delete count description' });
  }
});

// ============================================================================
// LOTS ROUTES
// ============================================================================
const lotsRouter = express.Router();

// GET all lots
lotsRouter.get('/', async (req, res) => {
  try {
    const all = req.query.all === 'true';
    const lots = await prisma.lot.findMany({
      where: all ? {} : { isActive: true },
      orderBy: { code: 'asc' }
    });
    res.json(lots);
  } catch (error) {
    console.error('Error fetching lots:', error);
    res.status(500).json({ error: 'Failed to fetch lots' });
  }
});

// LOOKUP lot by value (code or name) – used by frontend validation
lotsRouter.get('/lookup/by-value/:value', async (req, res) => {
  try {
    const raw = String(req.params.value || '').trim();
    if (!raw) {
      return res.status(400).json({ error: 'Value is required' });
    }

    const numeric = Number(raw);
    const codeFilter = !Number.isNaN(numeric) ? { code: numeric } : undefined;

    const lot = await prisma.lot.findFirst({
      where: {
        OR: [
          codeFilter,
          { name: raw }
        ].filter(Boolean) as any
      }
    });

    if (!lot) {
      return res.status(404).json({ error: 'Lot not found' });
    }

    res.json(lot);
  } catch (error) {
    console.error('Error looking up lot:', error);
    res.status(500).json({ error: 'Failed to lookup lot' });
  }
});

// GET single lot
lotsRouter.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const lot = await prisma.lot.findUnique({ where: { id } });
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
    const { code, name, isActive } = req.body;
    if (!code || !name) {
      return res.status(400).json({ error: 'Code and name are required' });
    }
    const lot = await prisma.lot.create({
      data: { code: parseInt(code), name, isActive: isActive !== undefined ? isActive : false }
    });
    res.status(201).json(lot);
  } catch (error: any) {
    console.error('Error creating lot:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Lot code already exists' });
    }
    res.status(500).json({ error: 'Failed to create lot' });
  }
});

// PUT update lot
lotsRouter.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { code, name, isActive } = req.body;
    const lot = await prisma.lot.update({
      where: { id },
      data: { code: code ? parseInt(code) : undefined, name, isActive }
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
      orderBy: { code: 'asc' }
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
    const spk = await prisma.spk.findUnique({ where: { id } });
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
    const { code, name, isActive } = req.body;
    if (!code || !name) {
      return res.status(400).json({ error: 'Code and name are required' });
    }
    const spk = await prisma.spk.create({
      data: { code: parseInt(code), name, isActive: isActive !== undefined ? isActive : false }
    });
    res.status(201).json(spk);
  } catch (error: any) {
    console.error('Error creating SPK:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'SPK code already exists' });
    }
    res.status(500).json({ error: 'Failed to create SPK' });
  }
});

// PUT update SPK
spksRouter.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { code, name, isActive } = req.body;
    const spk = await prisma.spk.update({
      where: { id },
      data: { code: code ? parseInt(code) : undefined, name, isActive }
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
// YARN TYPES ROUTES
// ============================================================================
const yarnTypesRouter = express.Router();

// GET all yarn types
yarnTypesRouter.get('/', async (req, res) => {
  try {
    const all = req.query.all === 'true';
    const yarnTypes = await prisma.yarnType.findMany({
      where: all ? {} : { isActive: true },
      orderBy: { code: 'asc' }
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
    const yarnType = await prisma.yarnType.findUnique({ where: { id } });
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
    const { code, name, letterCode, isActive } = req.body;
    if (!code || !name) {
      return res.status(400).json({ error: 'Code and name are required' });
    }
    const yarnType = await prisma.yarnType.create({
      data: { code: parseInt(code), name, letterCode: letterCode || String(name).slice(0, 10), isActive: isActive !== undefined ? isActive : false }
    });
    res.status(201).json(yarnType);
  } catch (error: any) {
    console.error('Error creating yarn type:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Yarn type code already exists' });
    }
    res.status(500).json({ error: 'Failed to create yarn type' });
  }
});

// PUT update yarn type
yarnTypesRouter.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { code, name, isActive } = req.body;
    const yarnType = await prisma.yarnType.update({
      where: { id },
      data: { code: code ? parseInt(code) : undefined, name, isActive }
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
// SUPPLIERS ROUTES
// ============================================================================
const suppliersRouter = express.Router();

// GET all suppliers
suppliersRouter.get('/', async (req, res) => {
  try {
    const all = req.query.all === 'true';
    const suppliers = await prisma.supplier.findMany({
      where: all ? {} : { isActive: true },
      orderBy: { code: 'asc' }
    });
    res.json(suppliers);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ error: 'Failed to fetch suppliers' });
  }
});

// GET single supplier
suppliersRouter.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const supplier = await prisma.supplier.findUnique({ where: { id } });
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    res.json(supplier);
  } catch (error) {
    console.error('Error fetching supplier:', error);
    res.status(500).json({ error: 'Failed to fetch supplier' });
  }
});

// POST create new supplier
suppliersRouter.post('/', async (req, res) => {
  try {
    const { code, name, isActive } = req.body;
    if (!code || !name) {
      return res.status(400).json({ error: 'Code and name are required' });
    }
    const supplier = await prisma.supplier.create({
      data: { code: parseInt(code), name, isActive: isActive !== undefined ? isActive : false }
    });
    res.status(201).json(supplier);
  } catch (error: any) {
    console.error('Error creating supplier:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Supplier code already exists' });
    }
    res.status(500).json({ error: 'Failed to create supplier' });
  }
});

// PUT update supplier
suppliersRouter.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { code, name, isActive } = req.body;
    const supplier = await prisma.supplier.update({
      where: { id },
      data: { code: code ? parseInt(code) : undefined, name, isActive }
    });
    res.json(supplier);
  } catch (error) {
    console.error('Error updating supplier:', error);
    res.status(500).json({ error: 'Failed to update supplier' });
  }
});

// DELETE supplier (soft delete)
suppliersRouter.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const supplier = await prisma.supplier.update({
      where: { id },
      data: { isActive: false }
    });
    res.json({ message: 'Supplier deactivated', supplier });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    res.status(500).json({ error: 'Failed to delete supplier' });
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
// PROCESS STEPS ROUTES
// ============================================================================
const processStepsRouter = express.Router();

// GET all process steps
processStepsRouter.get('/', async (req, res) => {
  try {
    const all = req.query.all === 'true';
    const processSteps = await prisma.processStep.findMany({
      where: all ? {} : { isActive: true },
      orderBy: { code: 'asc' }
    });
    res.json(processSteps);
  } catch (error) {
    console.error('Error fetching process steps:', error);
    res.status(500).json({ error: 'Failed to fetch process steps' });
  }
});

// GET single process step
processStepsRouter.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const processStep = await prisma.processStep.findUnique({ where: { id } });
    if (!processStep) {
      return res.status(404).json({ error: 'Process step not found' });
    }
    res.json(processStep);
  } catch (error) {
    console.error('Error fetching process step:', error);
    res.status(500).json({ error: 'Failed to fetch process step' });
  }
});

// POST create new process step
processStepsRouter.post('/', async (req, res) => {
  try {
    const { code, name, isActive } = req.body;
    if (!code || !name) {
      return res.status(400).json({ error: 'Code and name are required' });
    }
    const processStep = await prisma.processStep.create({
      data: { code: parseInt(code), name, isActive: isActive !== undefined ? isActive : false }
    });
    res.status(201).json(processStep);
  } catch (error: any) {
    console.error('Error creating process step:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Process step code already exists' });
    }
    res.status(500).json({ error: 'Failed to create process step' });
  }
});

// PUT update process step
processStepsRouter.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { code, name, isActive } = req.body;
    const processStep = await prisma.processStep.update({
      where: { id },
      data: { code: code ? parseInt(code) : undefined, name, isActive }
    });
    res.json(processStep);
  } catch (error) {
    console.error('Error updating process step:', error);
    res.status(500).json({ error: 'Failed to update process step' });
  }
});

// DELETE process step (soft delete)
processStepsRouter.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const processStep = await prisma.processStep.update({
      where: { id },
      data: { isActive: false }
    });
    res.json({ message: 'Process step deactivated', processStep });
  } catch (error) {
    console.error('Error deleting process step:', error);
    res.status(500).json({ error: 'Failed to delete process step' });
  }
});

// ============================================================================
// TEST TYPES ROUTES
// ============================================================================
const testTypesRouter = express.Router();

// GET all test types
testTypesRouter.get('/', async (req, res) => {
  try {
    const all = req.query.all === 'true';
    const testTypes = await prisma.testType.findMany({
      where: all ? {} : { isActive: true },
      orderBy: { code: 'asc' }
    });
    res.json(testTypes);
  } catch (error) {
    console.error('Error fetching test types:', error);
    res.status(500).json({ error: 'Failed to fetch test types' });
  }
});

// GET single test type
testTypesRouter.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const testType = await prisma.testType.findUnique({ where: { id } });
    if (!testType) {
      return res.status(404).json({ error: 'Test type not found' });
    }
    res.json(testType);
  } catch (error) {
    console.error('Error fetching test type:', error);
    res.status(500).json({ error: 'Failed to fetch test type' });
  }
});

// POST create new test type
testTypesRouter.post('/', async (req, res) => {
  try {
    const { code, name, isActive } = req.body;
    if (!code || !name) {
      return res.status(400).json({ error: 'Code and name are required' });
    }
    const testType = await prisma.testType.create({
      data: { code: parseInt(code), name, isActive: isActive !== undefined ? isActive : false }
    });
    res.status(201).json(testType);
  } catch (error: any) {
    console.error('Error creating test type:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Test type code already exists' });
    }
    res.status(500).json({ error: 'Failed to create test type' });
  }
});

// PUT update test type
testTypesRouter.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { code, name, isActive } = req.body;
    const testType = await prisma.testType.update({
      where: { id },
      data: { code: code ? parseInt(code) : undefined, name, isActive }
    });
    res.json(testType);
  } catch (error) {
    console.error('Error updating test type:', error);
    res.status(500).json({ error: 'Failed to update test type' });
  }
});

// DELETE test type (soft delete)
testTypesRouter.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const testType = await prisma.testType.update({
      where: { id },
      data: { isActive: false }
    });
    res.json({ message: 'Test type deactivated', testType });
  } catch (error) {
    console.error('Error deleting test type:', error);
    res.status(500).json({ error: 'Failed to delete test type' });
  }
});

// ============================================================================
// SIDES ROUTES
// ============================================================================
const sidesRouter = express.Router();

// GET all sides
sidesRouter.get('/', async (req, res) => {
  try {
    const all = req.query.all === 'true';
    const sides = await prisma.side.findMany({
      where: all ? {} : { isActive: true },
      orderBy: { code: 'asc' }
    });
    res.json(sides);
  } catch (error) {
    console.error('Error fetching sides:', error);
    res.status(500).json({ error: 'Failed to fetch sides' });
  }
});

// GET single side
sidesRouter.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const side = await prisma.side.findUnique({ where: { id } });
    if (!side) {
      return res.status(404).json({ error: 'Side not found' });
    }
    res.json(side);
  } catch (error) {
    console.error('Error fetching side:', error);
    res.status(500).json({ error: 'Failed to fetch side' });
  }
});

// POST create new side
sidesRouter.post('/', async (req, res) => {
  try {
    const { code, name, isActive } = req.body;
    if (!code || !name) {
      return res.status(400).json({ error: 'Code and name are required' });
    }
    const side = await prisma.side.create({
      data: { code, name, isActive: isActive !== undefined ? isActive : false }
    });
    res.status(201).json(side);
  } catch (error: any) {
    console.error('Error creating side:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Side code already exists' });
    }
    res.status(500).json({ error: 'Failed to create side' });
  }
});

// PUT update side
sidesRouter.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { code, name, isActive } = req.body;
    const side = await prisma.side.update({
      where: { id },
      data: { code, name, isActive }
    });
    res.json(side);
  } catch (error) {
    console.error('Error updating side:', error);
    res.status(500).json({ error: 'Failed to update side' });
  }
});

// DELETE side (soft delete)
sidesRouter.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const side = await prisma.side.update({
      where: { id },
      data: { isActive: false }
    });
    res.json({ message: 'Side deactivated', side });
  } catch (error) {
    console.error('Error deleting side:', error);
    res.status(500).json({ error: 'Failed to delete side' });
  }
});

// ============================================================================
// YARN TESTS ROUTES
// ============================================================================
const yarnTestsRouter = express.Router();

function parseYMD(dateStr: string): { year: number; month: number; day: number } | null {
  // Expected: YYYY-MM-DD
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return null;
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;
  return { year, month, day };
}

function parseYM(monthStr: string): { year: number; month: number } | null {
  // Expected: YYYY-MM
  const m = /^(\d{4})-(\d{2})$/.exec(monthStr);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  if (!Number.isInteger(year) || !Number.isInteger(month)) return null;
  if (month < 1 || month > 12) return null;
  return { year, month };
}

function parseYear(yearStr: string): number | null {
  // Expected: YYYY
  const m = /^(\d{4})$/.exec(yearStr);
  if (!m) return null;
  const year = Number(m[1]);
  if (!Number.isInteger(year)) return null;
  return year;
}

function addDateRange(where: any, start: Date, endExclusive: Date) {
  where.testDate = { gte: start, lt: endExclusive };
}

function buildYarnTestsWhere(query: any) {
  const {
    countDescriptionCode,
    lotId,
    startDate,
    endDate,
    machineNo,
    period,
    day,
    month,
    year
  } = query;

  const where: any = {};
  if (countDescriptionCode) where.countDescriptionCode = parseInt(countDescriptionCode as string);
  if (lotId) where.lotId = parseInt(lotId as string);
  if (machineNo) where.machineNo = parseInt(machineNo as string);

  // Period-based filters
  if (period) {
    const p = String(period);
    if (p === 'daily') {
      if (!day) throw new Error('Missing required query param: day (YYYY-MM-DD)');
      const parsed = parseYMD(String(day));
      if (!parsed) throw new Error('Invalid day format. Expected YYYY-MM-DD');
      const start = new Date(parsed.year, parsed.month - 1, parsed.day, 0, 0, 0, 0);
      const end = new Date(parsed.year, parsed.month - 1, parsed.day + 1, 0, 0, 0, 0);
      addDateRange(where, start, end);
    } else if (p === 'monthly') {
      if (!month) throw new Error('Missing required query param: month (YYYY-MM)');
      const parsed = parseYM(String(month));
      if (!parsed) throw new Error('Invalid month format. Expected YYYY-MM');
      const start = new Date(parsed.year, parsed.month - 1, 1, 0, 0, 0, 0);
      const end = new Date(parsed.year, parsed.month, 1, 0, 0, 0, 0);
      addDateRange(where, start, end);
    } else if (p === 'yearly') {
      if (!year) throw new Error('Missing required query param: year (YYYY)');
      const parsed = parseYear(String(year));
      if (parsed === null) throw new Error('Invalid year format. Expected YYYY');
      const start = new Date(parsed, 0, 1, 0, 0, 0, 0);
      const end = new Date(parsed + 1, 0, 1, 0, 0, 0, 0);
      addDateRange(where, start, end);
    } else if (p === 'range') {
      if (startDate || endDate) {
        where.testDate = {};
        if (startDate) where.testDate.gte = new Date(startDate as string);
        if (endDate) where.testDate.lte = new Date(endDate as string);
      }
    } else {
      throw new Error("Invalid period. Expected one of: 'daily' | 'monthly' | 'yearly' | 'range'");
    }
  } else if (startDate || endDate) {
    // Backwards-compatible range filter
    where.testDate = {};
    if (startDate) where.testDate.gte = new Date(startDate as string);
    if (endDate) where.testDate.lte = new Date(endDate as string);
  }

  return where;
}

const yarnTestInclude = {
  countDescription: true,
  countNe: true,
  lot: true,
  spk: true,
  yarnType: true,
  blend: true,
  slubCode: true,
  supplier: true,
  millsUnit: true,
  processStep: true,
  testType: true,
  side: true
} as const;

// GET all yarn tests (with pagination and filters)
yarnTestsRouter.get('/', async (req, res) => {
  try {
    const {
      page = '1',
      limit = '50'
    } = req.query;
    
    let where: any;
    try {
      where = buildYarnTestsWhere(req.query);
    } catch (e: any) {
      return res.status(400).json({ error: e.message });
    }

    const [tests, total, groupedCounts] = await Promise.all([
      prisma.yarnTest.findMany({
        where,
        include: yarnTestInclude,
        orderBy: { testDate: 'desc' },
        take: parseInt(limit as string),
        skip: (parseInt(page as string) - 1) * parseInt(limit as string)
      }),
      prisma.yarnTest.count({ where }),
      prisma.yarnTest.groupBy({
        by: ['countDescriptionCode'],
        where,
        _count: { _all: true }
      })
    ]);

    const codes = groupedCounts
      .map((g) => g.countDescriptionCode)
      .filter((c): c is number => typeof c === 'number');
    const countDescriptionRows = codes.length
      ? await prisma.countDescription.findMany({
          where: { code: { in: codes } },
          select: { code: true, name: true }
        })
      : [];
    const cdMap = new Map(countDescriptionRows.map((r) => [r.code, r.name]));
    const byCountDescription = groupedCounts
      .filter((g) => typeof g.countDescriptionCode === 'number')
      .map((g) => ({
        code: g.countDescriptionCode as number,
        description: cdMap.get(g.countDescriptionCode as number) || String(g.countDescriptionCode),
        count: g._count._all
      }))
      .sort((a, b) => b.count - a.count);

    res.json(serializeBigInt({
      tests,
      summary: {
        total,
        byCountDescription
      },
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / parseInt(limit as string))
      }
    }));
  } catch (error) {
    console.error('Error fetching yarn tests:', error);
    res.status(500).json({ error: 'Failed to fetch yarn tests' });
  }
});

// GET monthly breakdown for a year - returns per-month aggregates for Excel-style tables
// (Std IPIs, OE IPIs, CLSP).
// Step 1 - Monthly average: SUM(all values in month) / COUNT(non-null values in month) per group.
// Step 2 - Yearly average (frontend): average of monthly averages = sum(monthly avgs) / count(months with data).
yarnTestsRouter.get('/summary/monthly-breakdown', async (req, res) => {
  try {
    const yearStr = req.query.year as string;
    if (!yearStr) {
      return res.status(400).json({ error: 'Missing required query param: year (YYYY)' });
    }
    const year = parseYear(yearStr);
    if (year === null) {
      return res.status(400).json({ error: 'Invalid year format. Expected YYYY' });
    }

    let where: any = {};
    try {
      where = buildYarnTestsWhere({ ...req.query, period: 'yearly', year: yearStr });
    } catch (e: any) {
      return res.status(400).json({ error: e.message });
    }

    const groupBy: any[] = [
      'testMonth',
      'countDescriptionCode',
      'countNeId',
      'lotId',
      'yarnTypeId',
      'slubCodeId',
      'supplierId',
      'millsUnitId',
      'processStepId',
      'testTypeId'
    ];

    const grouped = await prisma.yarnTest.groupBy({
      by: groupBy,
      where,
      _count: { _all: true },
      _avg: {
        ipis: true,
        oeIpi: true,
        clsp: true,
        tenacityCnTex: true
      }
    });

    const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const monthToIdx = Object.fromEntries(monthOrder.map((m, i) => [m, i]));

    const countNeIds = [...new Set(grouped.map((g) => g.countNeId).filter((id): id is number => id !== null))];
    const countNeMap = new Map();
    if (countNeIds.length > 0) {
      const countNeRecords = await prisma.countNe.findMany({
        where: { id: { in: countNeIds } },
        select: { id: true, value: true }
      });
      countNeRecords.forEach((cn) => {
        countNeMap.set(cn.id, cn.value);
      });
    }

    const dimIds = {
      lot: [...new Set(grouped.map((g) => g.lotId).filter((id): id is number => id !== null))],
      yarnType: [...new Set(grouped.map((g) => g.yarnTypeId).filter((id): id is number => id !== null))],
      slubCode: [...new Set(grouped.map((g) => g.slubCodeId).filter((id): id is number => id !== null))],
      supplier: [...new Set(grouped.map((g) => g.supplierId).filter((id): id is number => id !== null))],
      millsUnit: [...new Set(grouped.map((g) => g.millsUnitId).filter((id): id is number => id !== null))],
      processStep: [...new Set(grouped.map((g) => g.processStepId).filter((id): id is number => id !== null))],
      testType: [...new Set(grouped.map((g) => g.testTypeId).filter((id): id is number => id !== null))]
    };

    const [lots, yarnTypes, slubCodes, suppliers, millsUnits, processSteps, testTypes] = await Promise.all([
      dimIds.lot.length ? prisma.lot.findMany({ where: { id: { in: dimIds.lot } }, select: { id: true, name: true } }) : [],
      dimIds.yarnType.length ? prisma.yarnType.findMany({ where: { id: { in: dimIds.yarnType } }, select: { id: true, name: true } }) : [],
      dimIds.slubCode.length ? prisma.slubCode.findMany({ where: { id: { in: dimIds.slubCode } }, select: { id: true, name: true, code: true } }) : [],
      dimIds.supplier.length ? prisma.supplier.findMany({ where: { id: { in: dimIds.supplier } }, select: { id: true, name: true } }) : [],
      dimIds.millsUnit.length ? prisma.millsUnit.findMany({ where: { id: { in: dimIds.millsUnit } }, select: { id: true, name: true } }) : [],
      dimIds.processStep.length ? prisma.processStep.findMany({ where: { id: { in: dimIds.processStep } }, select: { id: true, name: true } }) : [],
      dimIds.testType.length ? prisma.testType.findMany({ where: { id: { in: dimIds.testType } }, select: { id: true, name: true } }) : []
    ]);

    const nameMap = (arr: { id: number; name?: string; code?: string }[]) =>
      new Map(arr.map((r: any) => [r.id, r.name || r.code || String(r.id)]));

    const lotMap = nameMap(lots as any);
    const yarnTypeMap = nameMap(yarnTypes as any);
    const slubMap = nameMap(slubCodes as any);
    const supplierMap = nameMap(suppliers as any);
    const millsUnitMap = nameMap(millsUnits as any);
    const processStepMap = nameMap(processSteps as any);
    const testTypeMap = nameMap(testTypes as any);

    const rows = grouped.map((g) => {
      const month = g.testMonth || '';
      const idx = monthToIdx[month] ?? (parseInt(month, 10) >= 1 && parseInt(month, 10) <= 12 ? parseInt(month, 10) - 1 : -1);
      return {
        monthIdx: idx >= 0 ? idx : null,
        month,
        countDescriptionCode: g.countDescriptionCode,
        countNeId: g.countNeId,
        countNeValue: g.countNeId ? (() => { const v = countNeMap.get(g.countNeId!); return v != null ? parseFloat(v.toString()) : null; })() : null,
        lotId: g.lotId,
        lotName: g.lotId ? lotMap.get(g.lotId) || '-' : '-',
        yarnTypeId: g.yarnTypeId,
        yarnTypeName: g.yarnTypeId ? yarnTypeMap.get(g.yarnTypeId) || '-' : '-',
        slubCodeId: g.slubCodeId,
        slubCodeName: g.slubCodeId ? slubMap.get(g.slubCodeId) || '-' : '-',
        supplierId: g.supplierId,
        supplierName: g.supplierId ? supplierMap.get(g.supplierId) || '-' : '-',
        millsUnitId: g.millsUnitId,
        millsUnitName: g.millsUnitId ? millsUnitMap.get(g.millsUnitId) || '-' : '-',
        processStepId: g.processStepId,
        processStepName: g.processStepId ? processStepMap.get(g.processStepId) || '-' : '-',
        testTypeId: g.testTypeId,
        testTypeName: g.testTypeId ? testTypeMap.get(g.testTypeId) || '-' : '-',
        samples: (g as any)._count?._all ?? 0,
        ipis: (g as any)._avg?.ipis != null ? Number((g as any)._avg.ipis) : null,
        oeIpi: (g as any)._avg?.oeIpi != null ? Number((g as any)._avg.oeIpi) : null,
        clsp: (g as any)._avg?.clsp != null ? Number((g as any)._avg.clsp) : null,
        tenacityCnTex: (g as any)._avg?.tenacityCnTex != null ? Number((g as any)._avg.tenacityCnTex) : null
      };
    });

    res.json(serializeBigInt({ year, rows }));
  } catch (error) {
    console.error('Error fetching monthly breakdown:', error);
    res.status(500).json({ error: 'Failed to fetch monthly breakdown' });
  }
});

// GET aggregated summary (means/min/max) for yarn tests
// This applies the same filters as the list/export endpoints,
// but returns grouped aggregates similar to the Excel summary sheets.
// Supports monthly and yearly aggregation via period parameter.
yarnTestsRouter.get('/summary', async (req, res) => {
  try {
    let where: any;
    try {
      where = buildYarnTestsWhere(req.query);
    } catch (e: any) {
      return res.status(400).json({ error: e.message });
    }

    const period = req.query.period as string | undefined; // 'monthly' | 'yearly' | undefined

    // For monthly period, aggregate ALL rows in the month into a single row per count description
    if (period === 'monthly') {
      // Group only by time period + count description,
      // so there is exactly one row per count description for the selected month.
      // All other dimensions (lot, SPK, yarn type, etc.) are aggregated over.
      const groupBy: any[] = [
        'testYear',
        'testMonth',
        'countDescriptionCode'
      ];

      const grouped = await prisma.yarnTest.groupBy({
        by: groupBy,
        where,
        _count: { _all: true },
        _avg: {
          // Spinning parameters
          sliverRovingNe: true,
          totalDraft: true,
          twistMultiplier: true,
          tpi: true,
          tpm: true,
          actualTwist: true,
          rotorSpindleSpeed: true,
          // Count variation & strength (mean-type metrics)
          meanNe: true,
          cvCountPercent: true,
          meanStrengthCn: true,
          cvStrengthPercent: true,
          tenacityCnTex: true,
          elongationPercent: true,
          clsp: true,
          // Evenness / Uster
          uPercent: true,
          cvB: true,
          cvm: true,
          cvm1m: true,
          cvm3m: true,
          cvm10m: true,
          // IPI faults (ring)
          thin50Percent: true,
          thick50Percent: true,
          neps200Percent: true,
          neps280Percent: true,
          ipis: true,
          // IPI faults (OE)
          oeIpi: true,
          thin30Percent: true,
          thin40Percent: true,
          thick35Percent: true,
          neps140Percent: true,
          shortIpi: true,
          // Hairiness & spectrogram
          hairiness: true,
          sh: true,
          s1uPlusS2u: true,
        s3u: true,
        dr1_5m5Percent: true,
        // Min/max columns use avg = SUM(column) / COUNT(non-null) like other fact columns
        minNe: true,
        maxNe: true,
        minStrengthCn: true,
        maxStrengthCn: true
      }
    });

      // Shape response so it's easy to consume on the frontend / for CSV export
      const result = grouped.map((g) => ({
        // Grouping keys
        year: g.testYear || null,
        month: g.testMonth || null,
        countDescriptionCode: g.countDescriptionCode,
        // For monthly aggregation we collapse across all Count NE values for a given count description.
        // The nominal Count NE column is therefore not meaningful and is returned as null.
        countNeId: null,
        countNeValue: null,
        // For monthly aggregation we are averaging across all lots / SPKs / yarn types, etc.
        // Those ID fields are therefore not meaningful and are returned as null.
        lotId: null,
        spkId: null,
        yarnTypeId: null,
        slubCodeId: null,
        supplierId: null,
        millsUnitId: null,
        processStepId: null,
        testTypeId: null,
        samples: g._count._all,

        // Spinning parameters (means)
        sliverRovingNe: g._avg.sliverRovingNe,
        totalDraft: g._avg.totalDraft,
        twistMultiplier: g._avg.twistMultiplier,
        tpi: g._avg.tpi,
        tpm: g._avg.tpm,
        actualTwist: g._avg.actualTwist,
        rotorSpindleSpeed: g._avg.rotorSpindleSpeed,

        // Count variation
        meanNe: g._avg.meanNe,
        minNe: g._avg.minNe,
        maxNe: g._avg.maxNe,
        cvCountPercent: g._avg.cvCountPercent,

        // Strength properties
        meanStrengthCn: g._avg.meanStrengthCn,
        minStrengthCn: g._avg.minStrengthCn,
        maxStrengthCn: g._avg.maxStrengthCn,
        cvStrengthPercent: g._avg.cvStrengthPercent,
        tenacityCnTex: g._avg.tenacityCnTex,
        elongationPercent: g._avg.elongationPercent,
        clsp: g._avg.clsp,

        // Evenness / Uster
        uPercent: g._avg.uPercent,
        cvB: g._avg.cvB,
        cvm: g._avg.cvm,
        cvm1m: g._avg.cvm1m,
        cvm3m: g._avg.cvm3m,
        cvm10m: g._avg.cvm10m,

        // IPI (ring)
        thin50Percent: g._avg.thin50Percent,
        thick50Percent: g._avg.thick50Percent,
        neps200Percent: g._avg.neps200Percent,
        neps280Percent: g._avg.neps280Percent,
        ipis: g._avg.ipis,

        // IPI (OE)
        oeIpi: g._avg.oeIpi,
        thin30Percent: g._avg.thin30Percent,
        thin40Percent: g._avg.thin40Percent,
        thick35Percent: g._avg.thick35Percent,
        neps140Percent: g._avg.neps140Percent,
        shortIpi: g._avg.shortIpi,

        // Hairiness & spectrogram
        hairiness: g._avg.hairiness,
        sh: g._avg.sh,
        s1uPlusS2u: g._avg.s1uPlusS2u,
        s3u: g._avg.s3u,
        dr1_5m5Percent: g._avg.dr1_5m5Percent
      }));

      return res.json(result);
    }

    // Determine grouping fields based on period (for yearly and default)
    // For yearly summaries, only group by countDescriptionCode, countNeId, and time period
    // ID fields are not used for grouping to get true yearly aggregates
    const groupBy: any[] = [
      'countDescriptionCode',
      'countNeId'
    ];

    if (period === 'yearly') {
      // For yearly, group by year only (aggregate all months)
      groupBy.push('testYear');
    } else {
      // Default: group by both year and month, and include ID fields for detailed breakdown
      groupBy.push('testYear', 'testMonth', 'lotId', 'spkId', 'yarnTypeId', 'slubCodeId', 'supplierId', 'millsUnitId', 'processStepId', 'testTypeId');
    }

    const grouped = await prisma.yarnTest.groupBy({
      by: groupBy,
      where,
      _count: { _all: true },
      _avg: {
        // Spinning parameters
        sliverRovingNe: true,
        totalDraft: true,
        twistMultiplier: true,
        tpi: true,
        tpm: true,
        actualTwist: true,
        rotorSpindleSpeed: true,
        // Count variation & strength (mean-type metrics)
        meanNe: true,
        cvCountPercent: true,
        meanStrengthCn: true,
        cvStrengthPercent: true,
        tenacityCnTex: true,
        elongationPercent: true,
        clsp: true,
        // Evenness / Uster
        uPercent: true,
        cvB: true,
        cvm: true,
        cvm1m: true,
        cvm3m: true,
        cvm10m: true,
        // IPI faults (ring)
        thin50Percent: true,
        thick50Percent: true,
        neps200Percent: true,
        neps280Percent: true,
        ipis: true,
        // IPI faults (OE)
        oeIpi: true,
        thin30Percent: true,
        thin40Percent: true,
        thick35Percent: true,
        neps140Percent: true,
        shortIpi: true,
        // Hairiness & spectrogram
        hairiness: true,
        sh: true,
        s1uPlusS2u: true,
        s3u: true,
        dr1_5m5Percent: true,
        // Min/max columns use avg = SUM(column) / COUNT(non-null) like other fact columns
        minNe: true,
        maxNe: true,
        minStrengthCn: true,
        maxStrengthCn: true
      }
    });

    // Fetch countNe values for the grouped results
    const countNeIds = [...new Set(grouped.map((g) => g.countNeId).filter((id): id is number => id !== null))];
    const countNeMap = new Map();
    if (countNeIds.length > 0) {
      const countNeRecords = await prisma.countNe.findMany({
        where: { id: { in: countNeIds } },
        select: { id: true, value: true }
      });
      countNeRecords.forEach((cn) => {
        countNeMap.set(cn.id, cn.value);
      });
    }

    // Shape response so it's easy to consume on the frontend / for CSV export
    let result = grouped.map((g) => ({
      // Grouping keys
      year: g.testYear || null,
      month: g.testMonth || null,
      countDescriptionCode: g.countDescriptionCode,
      countNeId: g.countNeId,
      countNeValue: g.countNeId ? (countNeMap.get(g.countNeId) ? parseFloat(countNeMap.get(g.countNeId).toString()) : null) : null,
      // ID fields are only available when not doing yearly aggregation
      lotId: (g as any).lotId || null,
      spkId: (g as any).spkId || null,
      yarnTypeId: (g as any).yarnTypeId || null,
      slubCodeId: (g as any).slubCodeId || null,
      supplierId: (g as any).supplierId || null,
      millsUnitId: (g as any).millsUnitId || null,
      processStepId: (g as any).processStepId || null,
      testTypeId: (g as any).testTypeId || null,
      samples: g._count._all,

      // Spinning parameters (means)
      sliverRovingNe: g._avg.sliverRovingNe,
      totalDraft: g._avg.totalDraft,
      twistMultiplier: g._avg.twistMultiplier,
      tpi: g._avg.tpi,
      tpm: g._avg.tpm,
      actualTwist: g._avg.actualTwist,
      rotorSpindleSpeed: g._avg.rotorSpindleSpeed,

      // Count variation
      meanNe: g._avg.meanNe,
      minNe: g._avg.minNe,
      maxNe: g._avg.maxNe,
      cvCountPercent: g._avg.cvCountPercent,

      // Strength properties
      meanStrengthCn: g._avg.meanStrengthCn,
      minStrengthCn: g._avg.minStrengthCn,
      maxStrengthCn: g._avg.maxStrengthCn,
      cvStrengthPercent: g._avg.cvStrengthPercent,
      tenacityCnTex: g._avg.tenacityCnTex,
      elongationPercent: g._avg.elongationPercent,
      clsp: g._avg.clsp,

      // Evenness / Uster
      uPercent: g._avg.uPercent,
      cvB: g._avg.cvB,
      cvm: g._avg.cvm,
      cvm1m: g._avg.cvm1m,
      cvm3m: g._avg.cvm3m,
      cvm10m: g._avg.cvm10m,

      // IPI (ring)
      thin50Percent: g._avg.thin50Percent,
      thick50Percent: g._avg.thick50Percent,
      neps200Percent: g._avg.neps200Percent,
      neps280Percent: g._avg.neps280Percent,
      ipis: g._avg.ipis,

      // IPI (OE)
      oeIpi: g._avg.oeIpi,
      thin30Percent: g._avg.thin30Percent,
      thin40Percent: g._avg.thin40Percent,
      thick35Percent: g._avg.thick35Percent,
      neps140Percent: g._avg.neps140Percent,
      shortIpi: g._avg.shortIpi,

      // Hairiness & spectrogram
      hairiness: g._avg.hairiness,
      sh: g._avg.sh,
      s1uPlusS2u: g._avg.s1uPlusS2u,
      s3u: g._avg.s3u,
      dr1_5m5Percent: g._avg.dr1_5m5Percent
    }));

    // For yearly period, aggregate by year (combine all months)
    if (period === 'yearly') {
      const yearlyMap = new Map();
      result.forEach((r) => {
        // For yearly aggregation, only group by year, countDescriptionCode, and countNeId
        const key = `${r.year}-${r.countDescriptionCode}-${r.countNeId}`;
        if (!yearlyMap.has(key)) {
          yearlyMap.set(key, {
            year: r.year,
            countDescriptionCode: r.countDescriptionCode,
            countNeId: r.countNeId,
            countNeValue: r.countNeValue,
            lotId: null,
            spkId: null,
            yarnTypeId: null,
            slubCodeId: null,
            supplierId: null,
            millsUnitId: null,
            processStepId: null,
            testTypeId: null,
            samples: 0,
            avgCount: 0,
            // Accumulators for weighted averages
            sliverRovingNeSum: 0,
            totalDraftSum: 0,
            twistMultiplierSum: 0,
            tpiSum: 0,
            tpmSum: 0,
            actualTwistSum: 0,
            rotorSpindleSpeedSum: 0,
            meanNeSum: 0,
            cvCountPercentSum: 0,
            meanStrengthCnSum: 0,
            cvStrengthPercentSum: 0,
            tenacityCnTexSum: 0,
            elongationPercentSum: 0,
            clspSum: 0,
            uPercentSum: 0,
            cvBSum: 0,
            cvmSum: 0,
            cvm1mSum: 0,
            cvm3mSum: 0,
            cvm10mSum: 0,
            thin50PercentSum: 0,
            thick50PercentSum: 0,
            neps200PercentSum: 0,
            neps280PercentSum: 0,
            ipisSum: 0,
            oeIpiSum: 0,
            thin30PercentSum: 0,
            thin40PercentSum: 0,
            thick35PercentSum: 0,
            neps140PercentSum: 0,
            shortIpiSum: 0,
            hairinessSum: 0,
            shSum: 0,
            s1uPlusS2uSum: 0,
            s3uSum: 0,
            dr1_5m5PercentSum: 0,
            minNeSum: 0,
            maxNeSum: 0,
            minStrengthCnSum: 0,
            maxStrengthCnSum: 0,
          });
        }
        const agg = yearlyMap.get(key);
        agg.samples += r.samples;
        agg.avgCount += r.samples;

        // Accumulate weighted averages
        const addAvg = (field: string, sumField: string) => {
          const val = (r as any)[field];
          if (val !== null && val !== undefined) {
            (agg as any)[sumField] += Number(val) * r.samples;
          }
        };

        addAvg('sliverRovingNe', 'sliverRovingNeSum');
        addAvg('totalDraft', 'totalDraftSum');
        addAvg('twistMultiplier', 'twistMultiplierSum');
        addAvg('tpi', 'tpiSum');
        addAvg('tpm', 'tpmSum');
        addAvg('actualTwist', 'actualTwistSum');
        addAvg('rotorSpindleSpeed', 'rotorSpindleSpeedSum');
        addAvg('meanNe', 'meanNeSum');
        addAvg('cvCountPercent', 'cvCountPercentSum');
        addAvg('meanStrengthCn', 'meanStrengthCnSum');
        addAvg('cvStrengthPercent', 'cvStrengthPercentSum');
        addAvg('tenacityCnTex', 'tenacityCnTexSum');
        addAvg('elongationPercent', 'elongationPercentSum');
        addAvg('clsp', 'clspSum');
        addAvg('uPercent', 'uPercentSum');
        addAvg('cvB', 'cvBSum');
        addAvg('cvm', 'cvmSum');
        addAvg('cvm1m', 'cvm1mSum');
        addAvg('cvm3m', 'cvm3mSum');
        addAvg('cvm10m', 'cvm10mSum');
        addAvg('thin50Percent', 'thin50PercentSum');
        addAvg('thick50Percent', 'thick50PercentSum');
        addAvg('neps200Percent', 'neps200PercentSum');
        addAvg('neps280Percent', 'neps280PercentSum');
        addAvg('ipis', 'ipisSum');
        addAvg('oeIpi', 'oeIpiSum');
        addAvg('thin30Percent', 'thin30PercentSum');
        addAvg('thin40Percent', 'thin40PercentSum');
        addAvg('thick35Percent', 'thick35PercentSum');
        addAvg('neps140Percent', 'neps140PercentSum');
        addAvg('shortIpi', 'shortIpiSum');
        addAvg('hairiness', 'hairinessSum');
        addAvg('sh', 'shSum');
        addAvg('s1uPlusS2u', 's1uPlusS2uSum');
        addAvg('s3u', 's3uSum');
        addAvg('dr1_5m5Percent', 'dr1_5m5PercentSum');
        addAvg('minNe', 'minNeSum');
        addAvg('maxNe', 'maxNeSum');
        addAvg('minStrengthCn', 'minStrengthCnSum');
        addAvg('maxStrengthCn', 'maxStrengthCnSum');
      });

      // Calculate final averages
      result = Array.from(yearlyMap.values()).map(agg => ({
        year: agg.year,
        month: null,
        countDescriptionCode: agg.countDescriptionCode,
        countNeId: agg.countNeId,
        countNeValue: agg.countNeValue,
        lotId: agg.lotId,
        spkId: agg.spkId,
        yarnTypeId: agg.yarnTypeId,
        slubCodeId: agg.slubCodeId,
        supplierId: agg.supplierId,
        millsUnitId: agg.millsUnitId,
        processStepId: agg.processStepId,
        testTypeId: agg.testTypeId,
        samples: agg.samples,
        sliverRovingNe: agg.avgCount > 0 ? agg.sliverRovingNeSum / agg.avgCount : null,
        totalDraft: agg.avgCount > 0 ? agg.totalDraftSum / agg.avgCount : null,
        twistMultiplier: agg.avgCount > 0 ? agg.twistMultiplierSum / agg.avgCount : null,
        tpi: agg.avgCount > 0 ? agg.tpiSum / agg.avgCount : null,
        tpm: agg.avgCount > 0 ? agg.tpmSum / agg.avgCount : null,
        actualTwist: agg.avgCount > 0 ? agg.actualTwistSum / agg.avgCount : null,
        rotorSpindleSpeed: agg.avgCount > 0 ? agg.rotorSpindleSpeedSum / agg.avgCount : null,
        meanNe: agg.avgCount > 0 ? agg.meanNeSum / agg.avgCount : null,
        minNe: agg.avgCount > 0 ? agg.minNeSum / agg.avgCount : null,
        maxNe: agg.avgCount > 0 ? agg.maxNeSum / agg.avgCount : null,
        cvCountPercent: agg.avgCount > 0 ? agg.cvCountPercentSum / agg.avgCount : null,
        meanStrengthCn: agg.avgCount > 0 ? agg.meanStrengthCnSum / agg.avgCount : null,
        minStrengthCn: agg.avgCount > 0 ? agg.minStrengthCnSum / agg.avgCount : null,
        maxStrengthCn: agg.avgCount > 0 ? agg.maxStrengthCnSum / agg.avgCount : null,
        cvStrengthPercent: agg.avgCount > 0 ? agg.cvStrengthPercentSum / agg.avgCount : null,
        tenacityCnTex: agg.avgCount > 0 ? agg.tenacityCnTexSum / agg.avgCount : null,
        elongationPercent: agg.avgCount > 0 ? agg.elongationPercentSum / agg.avgCount : null,
        clsp: agg.avgCount > 0 ? agg.clspSum / agg.avgCount : null,
        uPercent: agg.avgCount > 0 ? agg.uPercentSum / agg.avgCount : null,
        cvB: agg.avgCount > 0 ? agg.cvBSum / agg.avgCount : null,
        cvm: agg.avgCount > 0 ? agg.cvmSum / agg.avgCount : null,
        cvm1m: agg.avgCount > 0 ? agg.cvm1mSum / agg.avgCount : null,
        cvm3m: agg.avgCount > 0 ? agg.cvm3mSum / agg.avgCount : null,
        cvm10m: agg.avgCount > 0 ? agg.cvm10mSum / agg.avgCount : null,
        thin50Percent: agg.avgCount > 0 ? agg.thin50PercentSum / agg.avgCount : null,
        thick50Percent: agg.avgCount > 0 ? agg.thick50PercentSum / agg.avgCount : null,
        neps200Percent: agg.avgCount > 0 ? agg.neps200PercentSum / agg.avgCount : null,
        neps280Percent: agg.avgCount > 0 ? agg.neps280PercentSum / agg.avgCount : null,
        ipis: agg.avgCount > 0 ? agg.ipisSum / agg.avgCount : null,
        oeIpi: agg.avgCount > 0 ? agg.oeIpiSum / agg.avgCount : null,
        thin30Percent: agg.avgCount > 0 ? agg.thin30PercentSum / agg.avgCount : null,
        thin40Percent: agg.avgCount > 0 ? agg.thin40PercentSum / agg.avgCount : null,
        thick35Percent: agg.avgCount > 0 ? agg.thick35PercentSum / agg.avgCount : null,
        neps140Percent: agg.avgCount > 0 ? agg.neps140PercentSum / agg.avgCount : null,
        shortIpi: agg.avgCount > 0 ? agg.shortIpiSum / agg.avgCount : null,
        hairiness: agg.avgCount > 0 ? agg.hairinessSum / agg.avgCount : null,
        sh: agg.avgCount > 0 ? agg.shSum / agg.avgCount : null,
        s1uPlusS2u: agg.avgCount > 0 ? agg.s1uPlusS2uSum / agg.avgCount : null,
        s3u: agg.avgCount > 0 ? agg.s3uSum / agg.avgCount : null,
        dr1_5m5Percent: agg.avgCount > 0 ? agg.dr1_5m5PercentSum / agg.avgCount : null,
      })) as any;
    }

    res.json(serializeBigInt(result));
  } catch (error) {
    console.error('Error fetching yarn test summary:', error);
    res.status(500).json({ error: 'Failed to fetch yarn test summary' });
  }
});

// Export yarn tests as CSV (using same filters, no pagination)
yarnTestsRouter.get('/export', async (req, res) => {
  try {
    let where: any;
    try {
      where = buildYarnTestsWhere(req.query);
    } catch (e: any) {
      return res.status(400).json({ error: e.message });
    }

    const tests = await prisma.yarnTest.findMany({
      where,
      include: yarnTestInclude,
      orderBy: { testDate: 'desc' }
    });

    const header = [
      'Test Date',
      'Month',
      'Year',
      'Count Description',
      'Count NE',
      'Lot',
      'SPK',
      'Yarn Type',
      'Slub Code',
      'Supplier',
      'Mills Unit',
      'Process Step',
      'Test Type',
      'Machine No',
      'Side',
      'Sliver / Roving (Ne)',
      'Total Draft',
      'Twist Multiplier',
      'TPI',
      'TPM',
      'Actual Twist',
      'Rotor / Spindle Speed',
      'Mean Ne',
      'Min Ne',
      'Max Ne',
      'CV% Count',
      'Mean Strength CN',
      'Min Strength CN',
      'Max Strength CN',
      'CV% Strength',
      'Tenacity (CN/Tex)',
      'Elongation%',
      'CLSP',
      'U%',
      'CV b',
      'CVm',
      'CVm 1m',
      'CVm 3m',
      'CVm 10m',
      'Thin-50%',
      'Thick+50%',
      'Neps+200%',
      'Neps+280%',
      'IPIs',
      'OE IPI',
      'Thin-30%',
      'Thin-40%',
      'Thick+35%',
      'Neps+140%',
      'Short IPI',
      'Hairiness',
      'Sh',
      'S1u + S2u',
      'S3u',
      'DR 1.5m 5% (%)',
      'Remarks'
    ];

    const escapeCsv = (value: any) => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      if (/[",\n;]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = tests.map((t) => [
      t.testDate ? new Date(t.testDate).toISOString().slice(0, 10) : '',
      t.testMonth ?? '',
      t.testYear ?? '',
      t.countDescription?.name ?? '',
      t.countNe?.value ?? '',
      t.lot?.name ?? '',
      t.spk?.name ?? '',
      t.yarnType?.name ?? '',
      t.slubCode?.code ?? t.slubCode?.description ?? '',
      t.supplier?.name ?? '',
      t.millsUnit?.name ?? '',
      t.processStep?.name ?? '',
      t.testType?.name ?? '',
      t.machineNo ?? '',
      t.side?.name ?? '',
      t.sliverRovingNe ?? '',
      t.totalDraft ?? '',
      t.twistMultiplier ?? '',
      t.tpi ?? '',
      t.tpm ?? '',
      t.actualTwist ?? '',
      t.rotorSpindleSpeed ?? '',
      t.meanNe ?? '',
      t.minNe ?? '',
      t.maxNe ?? '',
      t.cvCountPercent ?? '',
      t.meanStrengthCn ?? '',
      t.minStrengthCn ?? '',
      t.maxStrengthCn ?? '',
      t.cvStrengthPercent ?? '',
      t.tenacityCnTex ?? '',
      t.elongationPercent ?? '',
      t.clsp ?? '',
      t.uPercent ?? '',
      t.cvB ?? '',
      t.cvm ?? '',
      t.cvm1m ?? '',
      t.cvm3m ?? '',
      t.cvm10m ?? '',
      t.thin50Percent ?? '',
      t.thick50Percent ?? '',
      t.neps200Percent ?? '',
      t.neps280Percent ?? '',
      t.ipis ?? '',
      t.oeIpi ?? '',
      t.thin30Percent ?? '',
      t.thin40Percent ?? '',
      t.thick35Percent ?? '',
      t.neps140Percent ?? '',
      t.shortIpi ?? '',
      t.hairiness ?? '',
      t.sh ?? '',
      t.s1uPlusS2u ?? '',
      t.s3u ?? '',
      t.dr1_5m5Percent ?? '',
      t.remarks ?? ''
    ]);

    const csvLines = [
      header.map(escapeCsv).join(';'),
      ...rows.map((row) => row.map(escapeCsv).join(';'))
    ];

    const csvContent = csvLines.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="yarn-tests-export.csv"');
    res.send(csvContent);
  } catch (error) {
    console.error('Error exporting yarn tests:', error);
    res.status(500).json({ error: 'Failed to export yarn tests' });
  }
});

// GET single yarn test
yarnTestsRouter.get('/:id', async (req, res) => {
  try {
    const id = BigInt(req.params.id);
    const test = await prisma.yarnTest.findUnique({
      where: { id },
      include: {
        countDescription: true,
        countNe: true,
        lot: true,
        spk: true,
        yarnType: true,
        blend: true,
        supplier: true,
        millsUnit: true,
        processStep: true,
        testType: true,
        side: true,
        slubCode: true
      }
    });
    if (!test) {
      return res.status(404).json({ error: 'Yarn test not found' });
    }
    res.json(serializeBigInt(test));
  } catch (error) {
    console.error('Error fetching yarn test:', error);
    res.status(500).json({ error: 'Failed to fetch yarn test' });
  }
});

// Helper function to generate count description from related fields
async function generateCountDescription(
  millsUnitId: number | null | undefined,
  blendId: number | null | undefined,
  yarnTypeId: number | null | undefined,
  lotId: number | null | undefined,
  countNeId: number | null | undefined
): Promise<number | null> {
  // If any required field is missing, return null
  if (!millsUnitId || !yarnTypeId || !lotId || !countNeId) {
    return null;
  }

  // Fetch related records to get letter codes and countNe value
  const [millsUnit, blend, yarnType, lot, countNe] = await Promise.all([
    millsUnitId ? prisma.millsUnit.findUnique({ where: { id: millsUnitId }, select: { letterCode: true } }) : null,
    blendId ? prisma.blend.findUnique({ where: { id: blendId }, select: { letterCode: true } }) : null,
    yarnTypeId ? prisma.yarnType.findUnique({ where: { id: yarnTypeId }, select: { letterCode: true } }) : null,
    lotId ? prisma.lot.findUnique({ where: { id: lotId }, select: { name: true } }) : null,
    countNeId ? prisma.countNe.findUnique({ where: { id: countNeId }, select: { value: true } }) : null,
  ]);

  // Build count description parts
  const parts: string[] = [];
  
  // Mill code
  if (millsUnit?.letterCode) {
    parts.push(millsUnit.letterCode);
  }
  
  // Blend code (cotton code)
  if (blend?.letterCode) {
    parts.push(blend.letterCode);
  }
  
  // Yarn type code
  if (yarnType?.letterCode) {
    parts.push(yarnType.letterCode);
  }
  
  // Lot name
  if (lot?.name) {
    parts.push(lot.name);
  }
  
  // Count (NE) - use countNe value
  if (countNe?.value !== null && countNe?.value !== undefined) {
    parts.push(String(countNe.value));
  }

  // If we don't have enough parts, return null
  // Minimum required: mill code, yarn type code, lot, count (4 parts)
  // Blend code is optional, so with blend it would be 5 parts
  if (parts.length < 4) {
    return null;
  }

  // Generate count description string
  const countDescriptionName = parts.join(' ');

  // Find existing count description with this name
  let countDescription = await prisma.countDescription.findFirst({
    where: { name: countDescriptionName },
    select: { code: true }
  });

  // If not found, create a new one (using next available code > 36)
  if (!countDescription) {
    // Find the highest code
    const maxCode = await prisma.countDescription.findFirst({
      orderBy: { code: 'desc' },
      select: { code: true }
    });
    
    const nextCode = maxCode ? maxCode.code + 1 : 37;
    
    countDescription = await prisma.countDescription.create({
      data: {
        code: nextCode,
        name: countDescriptionName,
        isActive: true
      },
      select: { code: true }
    });
  }

  return countDescription.code;
}

// POST create new yarn test
yarnTestsRouter.post('/', async (req, res) => {
  try {
    const testData = req.body;
    
    // Fetch countNe value for calculations if countNeId is provided
    let countNeValue: number | undefined = undefined;
    if (testData.countNeId) {
      const countNe = await prisma.countNe.findUnique({
        where: { id: parseInt(testData.countNeId) },
        select: { value: true }
      });
      if (countNe?.value) {
        countNeValue = parseFloat(countNe.value.toString());
      }
    }
    
    // Calculate auto-calculated fields
    const calculated = calculateFields({
      countNeValue: countNeValue,
      sliverRovingNe: testData.sliverRovingNe ? parseFloat(testData.sliverRovingNe) : undefined,
      twistMultiplier: testData.twistMultiplier ? parseFloat(testData.twistMultiplier) : undefined,
      meanNe: testData.meanNe ? parseFloat(testData.meanNe) : undefined,
      meanStrengthCn: testData.meanStrengthCn ? parseFloat(testData.meanStrengthCn) : undefined,
      thin50Percent: testData.thin50Percent ? parseInt(testData.thin50Percent) : undefined,
      thick50Percent: testData.thick50Percent ? parseInt(testData.thick50Percent) : undefined,
      neps200Percent: testData.neps200Percent ? parseInt(testData.neps200Percent) : undefined,
      neps280Percent: testData.neps280Percent ? parseInt(testData.neps280Percent) : undefined,
      thin40Percent: testData.thin40Percent ? parseInt(testData.thin40Percent) : undefined,
      thick35Percent: testData.thick35Percent ? parseInt(testData.thick35Percent) : undefined,
      neps140Percent: testData.neps140Percent ? parseInt(testData.neps140Percent) : undefined,
    });

    // Helper function to convert to Decimal or null
    const toDecimal = (value: any) => value !== null && value !== undefined && value !== '' ? parseFloat(value) : null;
    const toInt = (value: any) => value !== null && value !== undefined && value !== '' ? parseInt(value) : null;
    
    // Helper function to safely parse and validate slubCodeId
    const parseSlubCodeId = async (value: any): Promise<number | null> => {
      if (!value || value === '' || value === null || value === undefined) return null;
      const id = parseInt(value);
      if (isNaN(id)) return null;
      
      // Validate that the slub code exists in the database
      // If it doesn't exist, return null (slub codes are optional)
      const slubCode = await prisma.slubCode.findUnique({
        where: { id },
        select: { id: true }
      });
      
      // Return null if slub code doesn't exist (optional field)
      if (!slubCode) {
        return null;
      }
      
      return id;
    };

    const slubCodeId = await parseSlubCodeId(testData.slubCodeId);

    // Auto-generate count description from related fields
    const millsUnitId = testData.millsUnitId ? parseInt(testData.millsUnitId) : null;
    const blendId = testData.blendId ? parseInt(testData.blendId) : null;
    const yarnTypeId = testData.yarnTypeId ? parseInt(testData.yarnTypeId) : null;
    const lotId = testData.lotId ? parseInt(testData.lotId) : null;
    const countNeId = testData.countNeId ? parseInt(testData.countNeId) : null;
    
    const countDescriptionCode = await generateCountDescription(
      millsUnitId,
      blendId,
      yarnTypeId,
      lotId,
      countNeId
    );

    const test = await prisma.yarnTest.create({
      data: {
        testDate: new Date(testData.testDate),
        testMonth: testData.testMonth || null,
        testYear: testData.testYear ? parseInt(testData.testYear) : null,
        countDescriptionCode: countDescriptionCode,
        lotId: testData.lotId ? parseInt(testData.lotId) : null,
        spkId: testData.spkId ? parseInt(testData.spkId) : null,
        yarnTypeId: testData.yarnTypeId ? parseInt(testData.yarnTypeId) : null,
        blendId: testData.blendId ? parseInt(testData.blendId) : null,
        slubCodeId: slubCodeId,
        supplierId: testData.supplierId ? parseInt(testData.supplierId) : null,
        millsUnitId: testData.millsUnitId ? parseInt(testData.millsUnitId) : null,
        processStepId: testData.processStepId ? parseInt(testData.processStepId) : null,
        testTypeId: testData.testTypeId ? parseInt(testData.testTypeId) : null,
        machineNo: toInt(testData.machineNo),
        sideId: testData.sideId ? parseInt(testData.sideId) : null,
        countNeId: testData.countNeId ? parseInt(testData.countNeId) : null,
        
        // Spinning Parameters
        sliverRovingNe: toDecimal(testData.sliverRovingNe),
        totalDraft: calculated.totalDraft ? calculated.totalDraft : toDecimal(testData.totalDraft),
        twistMultiplier: toDecimal(testData.twistMultiplier),
        tpi: calculated.tpi ? calculated.tpi : toDecimal(testData.tpi),
        tpm: calculated.tpm ? calculated.tpm : toDecimal(testData.tpm),
        actualTwist: toInt(testData.actualTwist),
        rotorSpindleSpeed: toInt(testData.rotorSpindleSpeed),
        
        // Count Variation
        meanNe: toDecimal(testData.meanNe),
        minNe: toDecimal(testData.minNe),
        maxNe: toDecimal(testData.maxNe),
        cvCountPercent: toDecimal(testData.cvCountPercent),
        
        // Strength Properties
        meanStrengthCn: toDecimal(testData.meanStrengthCn),
        minStrengthCn: toDecimal(testData.minStrengthCn),
        maxStrengthCn: toDecimal(testData.maxStrengthCn),
        cvStrengthPercent: toDecimal(testData.cvStrengthPercent),
        tenacityCnTex: calculated.tenacityCnTex ? calculated.tenacityCnTex : toDecimal(testData.tenacityCnTex),
        elongationPercent: toDecimal(testData.elongationPercent),
        clsp: calculated.clsp ? calculated.clsp : toDecimal(testData.clsp),
        
        // Evenness / Uster Data
        uPercent: toDecimal(testData.uPercent),
        cvB: toDecimal(testData.cvB),
        cvm: toDecimal(testData.cvm),
        cvm1m: toDecimal(testData.cvm1m),
        cvm3m: toDecimal(testData.cvm3m),
        cvm10m: toDecimal(testData.cvm10m),
        
        // IPI Faults (Ring Spinning)
        thin50Percent: toInt(testData.thin50Percent),
        thick50Percent: toInt(testData.thick50Percent),
        neps200Percent: toInt(testData.neps200Percent),
        neps280Percent: toInt(testData.neps280Percent),
        ipis: calculated.ipis !== undefined ? calculated.ipis : toInt(testData.ipis),
        
        // IPI Faults (Open End)
        oeIpi: calculated.oeIpi !== undefined ? calculated.oeIpi : toInt(testData.oeIpi),
        thin30Percent: toInt(testData.thin30Percent),
        thin40Percent: toInt(testData.thin40Percent),
        thick35Percent: toInt(testData.thick35Percent),
        neps140Percent: toInt(testData.neps140Percent),
        shortIpi: calculated.shortIpi !== undefined ? calculated.shortIpi : toInt(testData.shortIpi),
        
        // Hairiness & Spectrogram
        hairiness: toDecimal(testData.hairiness),
        sh: toDecimal(testData.sh),
        s1uPlusS2u: toDecimal(testData.s1uPlusS2u),
        s3u: toDecimal(testData.s3u),
        dr1_5m5Percent: toDecimal(testData.dr1_5m5Percent),
        
        // Remarks
        remarks: testData.remarks || null
      },
      include: {
        countDescription: true,
        countNe: true,
        lot: true,
        spk: true,
        yarnType: true,
        blend: true,
        supplier: true,
        millsUnit: true,
        processStep: true,
        testType: true,
        side: true
      }
    });
    
    res.status(201).json(serializeBigInt(test));
  } catch (error: any) {
    console.error('Error creating yarn test:', error);
    
    // Handle custom validation errors (e.g., invalid slubCodeId)
    if (error.message && error.message.includes('does not exist in the database')) {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: error.message 
      });
    }
    
    // Handle Prisma foreign key constraint errors
    if (error.code === 'P2003') {
      const fieldName = error.meta?.field_name || 'foreign key';
      return res.status(400).json({ 
        error: 'Invalid foreign key reference', 
        details: `The ${fieldName} does not exist in the database. Please check your data.` 
      });
    }
    
    // Handle connection pool exhaustion
    if (error.code === 'P2024') {
      return res.status(503).json({ 
        error: 'Database connection timeout', 
        details: 'The server is experiencing high load. Please try again in a moment.' 
      });
    }
    
    res.status(500).json({ error: 'Failed to create yarn test', details: error.message });
  }
});

// PUT update yarn test
yarnTestsRouter.put('/:id', async (req, res) => {
  try {
    const id = BigInt(req.params.id);
    const testData = req.body;
    
    // Fetch countNe value for calculations if countNeId is provided or changed
    let countNeValue: number | undefined = undefined;
    if (testData.countNeId !== undefined) {
      const countNeId = testData.countNeId ? parseInt(testData.countNeId) : null;
      if (countNeId) {
        const countNe = await prisma.countNe.findUnique({
          where: { id: countNeId },
          select: { value: true }
        });
        if (countNe?.value) {
          countNeValue = parseFloat(countNe.value.toString());
        }
      }
    } else {
      // If countNeId not provided, try to get from current test
      const currentTest = await prisma.yarnTest.findUnique({
        where: { id },
        select: { countNeId: true }
      });
      if (currentTest?.countNeId) {
        const countNe = await prisma.countNe.findUnique({
          where: { id: currentTest.countNeId },
          select: { value: true }
        });
        if (countNe?.value) {
          countNeValue = parseFloat(countNe.value.toString());
        }
      }
    }
    
    // Recalculate fields if inputs changed
    const calculated = calculateFields({
      countNeValue: countNeValue,
      sliverRovingNe: testData.sliverRovingNe ? parseFloat(testData.sliverRovingNe) : undefined,
      twistMultiplier: testData.twistMultiplier ? parseFloat(testData.twistMultiplier) : undefined,
      meanNe: testData.meanNe ? parseFloat(testData.meanNe) : undefined,
      meanStrengthCn: testData.meanStrengthCn ? parseFloat(testData.meanStrengthCn) : undefined,
      thin50Percent: testData.thin50Percent ? parseInt(testData.thin50Percent) : undefined,
      thick50Percent: testData.thick50Percent ? parseInt(testData.thick50Percent) : undefined,
      neps200Percent: testData.neps200Percent ? parseInt(testData.neps200Percent) : undefined,
      neps280Percent: testData.neps280Percent ? parseInt(testData.neps280Percent) : undefined,
      thin40Percent: testData.thin40Percent ? parseInt(testData.thin40Percent) : undefined,
      thick35Percent: testData.thick35Percent ? parseInt(testData.thick35Percent) : undefined,
      neps140Percent: testData.neps140Percent ? parseInt(testData.neps140Percent) : undefined,
    });

    const toDecimal = (value: any) => value !== null && value !== undefined && value !== '' ? parseFloat(value) : null;
    const toInt = (value: any) => value !== null && value !== undefined && value !== '' ? parseInt(value) : null;
    const toFk = (value: any) => value !== null && value !== undefined && value !== '' ? parseInt(value) : null;
    
    // Helper function to safely parse and validate slubCodeId
    const parseSlubCodeId = async (value: any): Promise<number | null | undefined> => {
      if (value === undefined) return undefined; // Don't update if not provided
      if (!value || value === '' || value === null) return null; // Set to null if explicitly cleared
      const id = parseInt(value);
      if (isNaN(id)) return null;
      
      // Validate that the slub code exists in the database
      // If it doesn't exist, return null (slub codes are optional)
      const slubCode = await prisma.slubCode.findUnique({
        where: { id },
        select: { id: true }
      });
      
      // Return null if slub code doesn't exist (optional field)
      if (!slubCode) {
        return null;
      }
      
      return id;
    };

    const updateData: any = {};
    // Date / dimension fields
    if (testData.testDate !== undefined && testData.testDate !== null && testData.testDate !== '') {
      updateData.testDate = new Date(testData.testDate);
    }
    if (testData.testMonth !== undefined) updateData.testMonth = testData.testMonth || null;
    if (testData.testYear !== undefined) updateData.testYear = testData.testYear !== '' && testData.testYear !== null ? parseInt(testData.testYear) : null;

    if (testData.lotId !== undefined) updateData.lotId = toFk(testData.lotId);
    if (testData.spkId !== undefined) updateData.spkId = toFk(testData.spkId);
    if (testData.yarnTypeId !== undefined) updateData.yarnTypeId = toFk(testData.yarnTypeId);
    if (testData.blendId !== undefined) updateData.blendId = toFk(testData.blendId);
    if (testData.slubCodeId !== undefined) updateData.slubCodeId = await parseSlubCodeId(testData.slubCodeId);
    if (testData.supplierId !== undefined) updateData.supplierId = toFk(testData.supplierId);
    if (testData.millsUnitId !== undefined) updateData.millsUnitId = toFk(testData.millsUnitId);
    if (testData.processStepId !== undefined) updateData.processStepId = toFk(testData.processStepId);
    if (testData.testTypeId !== undefined) updateData.testTypeId = toFk(testData.testTypeId);
    if (testData.machineNo !== undefined) updateData.machineNo = toInt(testData.machineNo);
    if (testData.sideId !== undefined) updateData.sideId = toFk(testData.sideId);
    if (testData.countNeId !== undefined) updateData.countNeId = toFk(testData.countNeId);

    // Spinning parameters
    if (testData.sliverRovingNe !== undefined) updateData.sliverRovingNe = toDecimal(testData.sliverRovingNe);
    if (testData.twistMultiplier !== undefined) updateData.twistMultiplier = toDecimal(testData.twistMultiplier);
    if (testData.actualTwist !== undefined) updateData.actualTwist = toInt(testData.actualTwist);
    if (testData.rotorSpindleSpeed !== undefined) updateData.rotorSpindleSpeed = toInt(testData.rotorSpindleSpeed);

    // Count variation
    if (testData.meanNe !== undefined) updateData.meanNe = toDecimal(testData.meanNe);
    if (testData.minNe !== undefined) updateData.minNe = toDecimal(testData.minNe);
    if (testData.maxNe !== undefined) updateData.maxNe = toDecimal(testData.maxNe);
    if (testData.cvCountPercent !== undefined) updateData.cvCountPercent = toDecimal(testData.cvCountPercent);

    // Strength properties
    if (testData.meanStrengthCn !== undefined) updateData.meanStrengthCn = toDecimal(testData.meanStrengthCn);
    if (testData.minStrengthCn !== undefined) updateData.minStrengthCn = toDecimal(testData.minStrengthCn);
    if (testData.maxStrengthCn !== undefined) updateData.maxStrengthCn = toDecimal(testData.maxStrengthCn);
    if (testData.cvStrengthPercent !== undefined) updateData.cvStrengthPercent = toDecimal(testData.cvStrengthPercent);
    if (testData.elongationPercent !== undefined) updateData.elongationPercent = toDecimal(testData.elongationPercent);

    // Evenness / Uster
    if (testData.uPercent !== undefined) updateData.uPercent = toDecimal(testData.uPercent);
    if (testData.cvB !== undefined) updateData.cvB = toDecimal(testData.cvB);
    if (testData.cvm !== undefined) updateData.cvm = toDecimal(testData.cvm);
    if (testData.cvm1m !== undefined) updateData.cvm1m = toDecimal(testData.cvm1m);
    if (testData.cvm3m !== undefined) updateData.cvm3m = toDecimal(testData.cvm3m);
    if (testData.cvm10m !== undefined) updateData.cvm10m = toDecimal(testData.cvm10m);

    // IPI (ring)
    if (testData.thin50Percent !== undefined) updateData.thin50Percent = toInt(testData.thin50Percent);
    if (testData.thick50Percent !== undefined) updateData.thick50Percent = toInt(testData.thick50Percent);
    if (testData.neps200Percent !== undefined) updateData.neps200Percent = toInt(testData.neps200Percent);
    if (testData.neps280Percent !== undefined) updateData.neps280Percent = toInt(testData.neps280Percent);

    // IPI (OE)
    if (testData.thin30Percent !== undefined) updateData.thin30Percent = toInt(testData.thin30Percent);
    if (testData.thin40Percent !== undefined) updateData.thin40Percent = toInt(testData.thin40Percent);
    if (testData.thick35Percent !== undefined) updateData.thick35Percent = toInt(testData.thick35Percent);
    if (testData.neps140Percent !== undefined) updateData.neps140Percent = toInt(testData.neps140Percent);

    // Hairiness & spectrogram
    if (testData.hairiness !== undefined) updateData.hairiness = toDecimal(testData.hairiness);
    if (testData.sh !== undefined) updateData.sh = toDecimal(testData.sh);
    if (testData.s1uPlusS2u !== undefined) updateData.s1uPlusS2u = toDecimal(testData.s1uPlusS2u);
    if (testData.s3u !== undefined) updateData.s3u = toDecimal(testData.s3u);
    if (testData.dr1_5m5Percent !== undefined) updateData.dr1_5m5Percent = toDecimal(testData.dr1_5m5Percent);

    // Remarks
    if (testData.remarks !== undefined) updateData.remarks = testData.remarks || null;

    // Calculated fields (prefer recalculation, fallback to provided values)
    if (testData.totalDraft !== undefined) updateData.totalDraft = calculated.totalDraft !== undefined ? calculated.totalDraft : toDecimal(testData.totalDraft);
    if (testData.tpi !== undefined) updateData.tpi = calculated.tpi !== undefined ? calculated.tpi : toDecimal(testData.tpi);
    if (testData.tpm !== undefined) updateData.tpm = calculated.tpm !== undefined ? calculated.tpm : toDecimal(testData.tpm);
    if (testData.tenacityCnTex !== undefined) {
      updateData.tenacityCnTex = calculated.tenacityCnTex !== undefined ? calculated.tenacityCnTex : toDecimal(testData.tenacityCnTex);
    }
    if (testData.clsp !== undefined) updateData.clsp = calculated.clsp !== undefined ? calculated.clsp : toDecimal(testData.clsp);
    if (testData.ipis !== undefined) updateData.ipis = calculated.ipis !== undefined ? calculated.ipis : toInt(testData.ipis);
    if (testData.oeIpi !== undefined) updateData.oeIpi = calculated.oeIpi !== undefined ? calculated.oeIpi : toInt(testData.oeIpi);
    if (testData.shortIpi !== undefined) updateData.shortIpi = calculated.shortIpi !== undefined ? calculated.shortIpi : toInt(testData.shortIpi);

    // Auto-generate count description if any related field changed
    const needsCountDescriptionUpdate = 
      testData.millsUnitId !== undefined ||
      testData.blendId !== undefined ||
      testData.yarnTypeId !== undefined ||
      testData.lotId !== undefined ||
      testData.countNeId !== undefined;

    if (needsCountDescriptionUpdate) {
      // Get current test to use existing values for fields not being updated
      const currentTest = await prisma.yarnTest.findUnique({
        where: { id },
        select: {
          millsUnitId: true,
          blendId: true,
          yarnTypeId: true,
          lotId: true,
          countNeId: true
        }
      });

      if (currentTest) {
        const millsUnitId = updateData.millsUnitId !== undefined ? updateData.millsUnitId : currentTest.millsUnitId;
        const blendId = updateData.blendId !== undefined ? updateData.blendId : currentTest.blendId;
        const yarnTypeId = updateData.yarnTypeId !== undefined ? updateData.yarnTypeId : currentTest.yarnTypeId;
        const lotId = updateData.lotId !== undefined ? updateData.lotId : currentTest.lotId;
        const countNeId = updateData.countNeId !== undefined ? updateData.countNeId : currentTest.countNeId;

        const countDescriptionCode = await generateCountDescription(
          millsUnitId,
          blendId,
          yarnTypeId,
          lotId,
          countNeId
        );

        if (countDescriptionCode !== null) {
          updateData.countDescriptionCode = countDescriptionCode;
        }
      }
    }

    const test = await prisma.yarnTest.update({
      where: { id },
      data: updateData,
      include: yarnTestInclude
    });
    res.json(serializeBigInt(test));
  } catch (error: any) {
    console.error('Error updating yarn test:', error);
    
    // Handle custom validation errors (e.g., invalid slubCodeId)
    if (error.message && error.message.includes('does not exist in the database')) {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: error.message 
      });
    }
    
    // Handle Prisma foreign key constraint errors
    if (error.code === 'P2003') {
      const fieldName = error.meta?.field_name || 'foreign key';
      return res.status(400).json({ 
        error: 'Invalid foreign key reference', 
        details: `The ${fieldName} does not exist in the database. Please check your data.` 
      });
    }
    
    // Handle connection pool exhaustion
    if (error.code === 'P2024') {
      return res.status(503).json({ 
        error: 'Database connection timeout', 
        details: 'The server is experiencing high load. Please try again in a moment.' 
      });
    }
    
    res.status(500).json({ error: 'Failed to update yarn test', details: error.message });
  }
});

// DELETE yarn test
yarnTestsRouter.delete('/:id', async (req, res) => {
  try {
    let id: bigint;
    try {
      id = BigInt(req.params.id);
    } catch {
      return res.status(400).json({ error: 'Invalid id' });
    }
    await prisma.yarnTest.delete({
      where: { id }
    });
    res.json({ message: 'Yarn test deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting yarn test:', error);
    // Prisma throws P2025 when the record is not found for delete/update operations
    if (error?.code === 'P2025') {
      return res.status(404).json({ error: 'Yarn test not found' });
    }
    res.status(500).json({ error: 'Failed to delete yarn test' });
  }
});

// ============================================================================
// MOUNT ALL ROUTES
// ============================================================================
qualityRouter.use('/count-descriptions', countDescriptionsRouter);
qualityRouter.use('/lots', lotsRouter);
qualityRouter.use('/spks', spksRouter);
qualityRouter.use('/yarn-types', yarnTypesRouter);
qualityRouter.use('/suppliers', suppliersRouter);
qualityRouter.use('/mills-units', millsUnitsRouter);
qualityRouter.use('/process-steps', processStepsRouter);
qualityRouter.use('/test-types', testTypesRouter);
qualityRouter.use('/sides', sidesRouter);
qualityRouter.use('/yarn-tests', yarnTestsRouter);

export default qualityRouter;
