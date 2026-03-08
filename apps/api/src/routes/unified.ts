import express from 'express';
import { prisma } from '../lib/prisma';

const unifiedRouter = express.Router();

// ============================================================================
// UNIFIED ROUTES FOR OVERLAPPING ENTITIES
// These entities exist in both Quality and Production modules
// Quality service is the master data source
// ============================================================================

// ============================================================================
// COUNT DESCRIPTIONS ROUTES
// Shared dimension: used by Quality (master) and Production
// ============================================================================
const countDescriptionsRouter = express.Router();

// GET all count descriptions
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
    if (!code || !name || !letterCode) {
      return res.status(400).json({ error: 'Code, name, and letterCode are required' });
    }
    const yarnType = await prisma.yarnType.create({
      data: { 
        code: parseInt(code), 
        name,
        letterCode,
        isActive: isActive !== undefined ? isActive : false 
      }
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
    const { code, name, letterCode, isActive } = req.body;
    if (letterCode === undefined || letterCode === null || letterCode === '') {
      return res.status(400).json({ error: 'letterCode is required' });
    }
    const yarnType = await prisma.yarnType.update({
      where: { id },
      data: { 
        code: code ? parseInt(code) : undefined, 
        name,
        letterCode,
        isActive 
      }
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
// BLENDS ROUTES
// ============================================================================
const blendsRouter = express.Router();

// GET all blends
blendsRouter.get('/', async (req, res) => {
  try {
    const all = req.query.all === 'true';
    const blends = await prisma.blend.findMany({
      where: all ? {} : { isActive: true },
      orderBy: { name: 'asc' }
    });
    res.json(blends);
  } catch (error) {
    console.error('Error fetching blends:', error);
    res.status(500).json({ error: 'Failed to fetch blends' });
  }
});

// GET single blend
blendsRouter.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const blend = await prisma.blend.findUnique({ where: { id } });
    if (!blend) {
      return res.status(404).json({ error: 'Blend not found' });
    }
    res.json(blend);
  } catch (error) {
    console.error('Error fetching blend:', error);
    res.status(500).json({ error: 'Failed to fetch blend' });
  }
});

// POST create new blend
blendsRouter.post('/', async (req, res) => {
  try {
    const { name, letterCode, isActive } = req.body;
    if (!name || !letterCode) {
      return res.status(400).json({ error: 'Name and letterCode are required' });
    }
    const blend = await prisma.blend.create({
      data: { name, letterCode, isActive: isActive !== undefined ? isActive : false }
    });
    res.status(201).json(blend);
  } catch (error: any) {
    console.error('Error creating blend:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Blend name already exists' });
    }
    res.status(500).json({ error: 'Failed to create blend' });
  }
});

// PUT update blend
blendsRouter.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, letterCode, isActive } = req.body;
    if (letterCode === undefined || letterCode === null || letterCode === '') {
      return res.status(400).json({ error: 'letterCode is required' });
    }
    const blend = await prisma.blend.update({
      where: { id },
      data: { name, letterCode, isActive }
    });
    res.json(blend);
  } catch (error) {
    console.error('Error updating blend:', error);
    res.status(500).json({ error: 'Failed to update blend' });
  }
});

// DELETE blend (soft delete)
blendsRouter.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const blend = await prisma.blend.update({
      where: { id },
      data: { isActive: false }
    });
    res.json({ message: 'Blend deactivated', blend });
  } catch (error) {
    console.error('Error deleting blend:', error);
    res.status(500).json({ error: 'Failed to delete blend' });
  }
});

// ============================================================================
// MOUNT ALL ROUTES
// ============================================================================
unifiedRouter.use('/lots', lotsRouter);
unifiedRouter.use('/spks', spksRouter);
unifiedRouter.use('/yarn-types', yarnTypesRouter);
unifiedRouter.use('/blends', blendsRouter);
unifiedRouter.use('/count-descriptions', countDescriptionsRouter);

export default unifiedRouter;
