import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { requireAuth, requireRole, requireApiKey } from '../middleware/auth';
import { Prisma } from '@prisma/client';
import {
  importSalesContracts,
  importWarping,
  importIndigo,
  importWeaving,
} from '../services/denim-import.service';
import {
  getFullPipeline,
  getWeavingByDateRange,
  getInspectGrayByBeam,
  getMetersByKp,
  getActiveLoomStatus,
} from '@erp-sinaran/prisma';
import {
  createJob,
  getJob,
  updateJob,
  listJobs,
} from '../services/job-queue.service';
import { notifyUser } from '../socket';
import { prisma } from '../lib/prisma';
import { encodeKP, decodeKP, generateNextKP } from '../lib/kp';

const router = Router();

router.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Multer: store uploads in memory (files are processed immediately, not saved to disk)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
      'text/plain',           // some systems send CSV as text/plain
      'application/csv',
      'application/octet-stream', // some systems send any file as this
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only .xlsx, .xls, and .csv files are allowed'));
    }
  },
});

// ─── IMPORT ROUTES ──────────────────────────────────────────────────────────

// POST /api/denim/import/sales-contract
// Body: multipart/form-data with field "file" containing the Excel file
// Query: ?sheet=0 (default) — specify which Excel sheet to read
router.post(
  '/import/sales-contract',
  requireAuth,
  requireRole('admin'),
  upload.single('file'),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
      const sheetIndex = req.query.sheet ? parseInt(req.query.sheet as string) : 0;
      const job = createJob('import-sales-contract');
      // Return immediately with job ID
      res.json({ jobId: job.id, message: 'Import started — poll /api/denim/jobs/:id for status' });
      // Run import in background (do not await)
      setImmediate(async () => {
        updateJob(job.id, { status: 'running', startedAt: new Date() });
        try {
          const result = await importSalesContracts(req.file!.buffer, sheetIndex);
          updateJob(job.id, { status: 'done', completedAt: new Date(), result });
        } catch (err: any) {
          updateJob(job.id, { status: 'failed', completedAt: new Date(), error: err.message });
        }
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
);

// POST /api/denim/import/warping
// Query: ?sheet=0 (default) — specify which Excel sheet to read
router.post(
  '/import/warping',
  requireAuth,
  requireRole('admin'),
  upload.single('file'),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
      const sheetIndex = req.query.sheet ? parseInt(req.query.sheet as string) : 0;
      const job = createJob('import-warping');
      res.json({ jobId: job.id, message: 'Import started — poll /api/denim/jobs/:id for status' });
      setImmediate(async () => {
        updateJob(job.id, { status: 'running', startedAt: new Date() });
        try {
          const result = await importWarping(req.file!.buffer, sheetIndex);
          updateJob(job.id, { status: 'done', completedAt: new Date(), result });
        } catch (err: any) {
          updateJob(job.id, { status: 'failed', completedAt: new Date(), error: err.message });
        }
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
);

// POST /api/denim/import/indigo
// Query: ?sheet=0 (default) — specify which Excel sheet to read
router.post(
  '/import/indigo',
  requireAuth,
  requireRole('admin'),
  upload.single('file'),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
      const sheetIndex = req.query.sheet ? parseInt(req.query.sheet as string) : 0;
      const job = createJob('import-indigo');
      res.json({ jobId: job.id, message: 'Import started — poll /api/denim/jobs/:id for status' });
      setImmediate(async () => {
        updateJob(job.id, { status: 'running', startedAt: new Date() });
        try {
          const result = await importIndigo(req.file!.buffer, sheetIndex);
          updateJob(job.id, { status: 'done', completedAt: new Date(), result });
        } catch (err: any) {
          updateJob(job.id, { status: 'failed', completedAt: new Date(), error: err.message });
        }
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
);

// POST /api/denim/import/weaving
// This endpoint is called daily — accepts the day's loom data
// Query: ?sheet=0 (default) — specify which Excel sheet to read
router.post(
  '/import/weaving',
  requireAuth,
  requireRole('admin'),
  upload.single('file'),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
      const sheetIndex = req.query.sheet ? parseInt(req.query.sheet as string) : 0;
      const job = createJob('import-weaving');
      res.json({ jobId: job.id, message: 'Import started — poll /api/denim/jobs/:id for status' });
      setImmediate(async () => {
        updateJob(job.id, { status: 'running', startedAt: new Date() });
        try {
          const result = await importWeaving(req.file!.buffer, sheetIndex);
          updateJob(job.id, { status: 'done', completedAt: new Date(), result });
        } catch (err: any) {
          updateJob(job.id, { status: 'failed', completedAt: new Date(), error: err.message });
        }
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
);

// ─── QUERY ROUTES ───────────────────────────────────────────────────────────

// GET /api/denim/pipeline/:kp
// Returns full order pipeline for a KP code
router.get('/pipeline/:kp',
  requireAuth,
  requireRole('admin', 'jakarta'),
  async (req: Request, res: Response) => {
  try {
    const result = await getFullPipeline(req.params.kp);
    if (!result) return res.status(404).json({ error: `KP ${req.params.kp} not found` });
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/denim/weaving?start=YYYY-MM-DD&end=YYYY-MM-DD
// Returns weaving records in a date range
router.get('/weaving',
  requireAuth,
  requireRole('admin', 'factory', 'jakarta'),
  async (req: Request, res: Response) => {
  try {
    const { start, end } = req.query;
    if (!start || !end) {
      return res.status(400).json({ error: 'start and end query params required (YYYY-MM-DD)' });
    }
    const startDate = new Date(start as string);
    const endDate = new Date(end as string);
    endDate.setHours(23, 59, 59, 999); // include the full end day
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format — use YYYY-MM-DD' });
    }
    const result = await getWeavingByDateRange(startDate, endDate);
    return res.json({ count: result.length, data: result });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/denim/sales-contracts?page=1&limit=50&kp=...&codename=...&acc=...&dateFrom=...&dateTo=...
// Returns paginated list of sales contracts
router.get('/sales-contracts',
  requireAuth,
  requireRole('admin', 'jakarta', 'factory'),
  async (req: Request, res: Response) => {
  try {
    const page  = parseInt(String(req.query.page  || '1'));
    const limit = parseInt(String(req.query.limit || '50'));
    const skip  = (page - 1) * limit;

    const where: any = {};

    // KP search: startsWith OR contains (case insensitive)
    if (req.query.kp) {
      const kpVal = String(req.query.kp).toUpperCase();
      where.kp = { contains: kpVal, mode: 'insensitive' };
    }

    // pipeline_status filter
    if (req.query.pipeline_status &&
        req.query.pipeline_status !== 'ALL') {
      where.pipeline_status = String(req.query.pipeline_status);
    }

    // decided=true → acc IS NOT NULL (approved or rejected)
    if (req.query.decided === 'true') {
      where.acc = { not: null };
    }

    // acc filter (approved/rejected)
    if (req.query.acc) {
      where.acc = String(req.query.acc);
    }

    // kat_kode / type filter
    if (req.query.type && req.query.type !== 'ALL') {
      where.status = String(req.query.type);
    }

    // Sort
    const sortFieldMap: Record<string, string> = {
      tgl:        'tgl',
      kp:         'kp',
      codename:   'codename',
      permintaan: 'permintaan',
      te:         'te',
    };
    const sortField =
      sortFieldMap[String(req.query.sortField || 'tgl')] || 'tgl';
    const sortDir =
      req.query.sortDir === 'asc' ? 'asc' : 'desc';

    const orderBy: any = { [sortField]: sortDir };

    const [items, total] = await Promise.all([
      prisma.salesContract.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          kp: true,
          tgl: true,
          codename: true,
          permintaan: true,
          kat_kode: true,
          ket_warna: true,
          status: true,
          acc: true,
          te: true,
          pipeline_status: true,
          kons_kode: true,
          kode_number: true,
          ket_ct_ws: true,
          sisir: true,
          p_kons: true,
          ne_k_lusi: true,
          ne_lusi: true,
          sp_lusi: true,
          lot_lusi: true,
          ne_k_pakan: true,
          ne_pakan: true,
          sp_pakan: true,
          j: true,
          j_c: true,
          b_c: true,
          tb: true,
          tb_real: true,
          bale_lusi: true,
          total_pakan: true,
          bale_pakan: true,
          ts: true,
          proses: true,
          remarks: true,
        },
      }),
      prisma.salesContract.count({ where }),
    ]);

    return res.json({
      items,
      pagination: { page, limit, total,
        pages: Math.ceil(total / limit) },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/denim/sales-contracts/:kp
// Returns a single sales contract by KP
router.get('/sales-contracts/:kp',
  requireAuth,
  requireRole('admin', 'jakarta', 'factory'),
  async (req: Request, res: Response) => {
  try {
    const { kp } = req.params;
    const kpUpper = kp.toUpperCase();
    // Use case-insensitive search: try both exact match and uppercase match
    const sc = await prisma.salesContract.findFirst({
      where: {
        OR: [
          { kp: { equals: kp, mode: 'insensitive' } },
          { kp: { equals: kpUpper } }
        ]
      },
    });
    if (!sc) {
      return res.status(404).json({ error: `KP ${kp} not found` });
    }
    return res.json(sc);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/denim/inspect-gray/beam/:bm
// Returns all gray inspection records for a beam number
router.get('/inspect-gray/beam/:bm',
  requireAuth,
  requireRole('admin', 'factory', 'jakarta'),
  async (req: Request, res: Response) => {
  try {
    const bm = parseInt(req.params.bm);
    if (isNaN(bm)) return res.status(400).json({ error: 'Beam number must be an integer' });
    const result = await getInspectGrayByBeam(bm);
    return res.json({ count: result.length, data: result });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/denim/meters/:kp
// Returns total meters produced and roll count for a KP
router.get('/meters/:kp',
  requireAuth,
  requireRole('admin', 'factory', 'jakarta'),
  async (req: Request, res: Response) => {
  try {
    const result = await getMetersByKp(req.params.kp);
    return res.json({ kp: req.params.kp, ...result });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/denim/looms/status
// Returns the latest record per loom machine
router.get('/looms/status',
  requireAuth,
  requireRole('admin', 'jakarta'),
  async (_req: Request, res: Response) => {
  try {
    const result = await getActiveLoomStatus();
    return res.json({ count: result.length, data: result });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── JOB STATUS ROUTES ─────────────────────────────────────────────────────

// GET /api/denim/jobs/:id
// Poll this after starting an import to check progress
router.get('/jobs/:id',
  requireAuth,
  requireRole('admin', 'factory', 'jakarta'),
  (req: Request, res: Response) => {
  const job = getJob(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  return res.json(job);
});

// GET /api/denim/jobs
// List the last 50 import jobs
router.get('/jobs',
  requireAuth,
  requireRole('admin', 'factory', 'jakarta'),
  (_req: Request, res: Response) => {
  return res.json(listJobs());
});

// ─── FABRIC SPEC ROUTES ─────────────────────────────────────────────────────

// GET /api/denim/fabric-specs/search?q=...
// Search fabric specs by kode (for autocomplete)
router.get('/fabric-specs/search',
  requireAuth,
  requireRole('admin', 'jakarta'),
  async (req: Request, res: Response) => {
  try {
    const q = String(req.query.q || '').trim().toUpperCase();
    if (!q || q.length < 2) return res.json({ items: [] });

    const items = await prisma.fabricSpec.findMany({
      where: {
        OR: [
          { kode: { contains: q, mode: 'insensitive' } },
          { item: { contains: q, mode: 'insensitive' } },
          { kons_kode: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        item: true,
        kons_kode: true,
        kode: true,
        kat_kode: true,
        te: true,
        lusi_ne: true,
        pakan_ne: true,
        sisir: true,
        pick: true,
        warna: true,
        oz_g: true,
        oz_f: true,
        arah: true,
        anyaman: true,
      },
      take: 20,
      orderBy: { kode: 'asc' },
    });

    // Get usage counts from sales contracts (match on both kons_kode and kode_number)
    const usageRaw = await prisma.salesContract.groupBy({
      by: ['kons_kode', 'kode_number'],
      _count: { kp: true },
    });
    const usageMap = Object.fromEntries(
      usageRaw.map(u => [`${u.kons_kode}|${u.kode_number}`, u._count.kp])
    );
    const itemsWithUsage = items.map(s => ({
      ...s,
      usage_count: usageMap[`${s.kons_kode}|${s.kode}`] ?? 0,
    }));

    return res.json({ items: itemsWithUsage });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/denim/fabric-specs/:item
// Get full fabric spec by item key
router.get('/fabric-specs/:item',
  requireAuth,
  requireRole('admin', 'jakarta'),
  async (req: Request, res: Response) => {
  try {
    const item = decodeURIComponent(req.params.item);
    const spec = await prisma.fabricSpec.findUnique({ where: { item } });
    if (!spec) return res.status(404).json({ error: 'Not found' });
    return res.json(spec);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/denim/fabric-specs — full list with usage counts (admin)
//   ?q=...          — text search across item, kons_kode, kode
//   ?kat_kode=...  — filter by kat_kode
//   ?kons_kode=... — filter by kons_kode
//   ?kode=...      — filter by kode (e.g. "DALLAS 3")
// Returns one match when kons_kode + kode + kat_kode are all provided.
router.get('/fabric-specs', requireAuth, requireRole('admin', 'jakarta', 'factory'), async (req: Request, res: Response) => {
  try {
    const { q, kat_kode, kons_kode, kode } = req.query as Record<string, string>;
    const specs = await prisma.fabricSpec.findMany({
      where: {
        ...(kons_kode ? { kons_kode } : {}),
        ...(kode      ? { kode }      : {}),
        ...(kat_kode  ? { kat_kode }  : {}),
        ...(q ? {
          OR: [
            { item: { contains: q, mode: 'insensitive' } },
            { kons_kode: { contains: q, mode: 'insensitive' } },
            { kode: { contains: q, mode: 'insensitive' } },
          ]
        } : {}),
      },
      orderBy: { item: 'asc' },
    });
    const usageRaw = await prisma.salesContract.groupBy({
      by: ['kons_kode', 'kode_number'],
      _count: { kp: true },
    });
    const usageMap = Object.fromEntries(
      usageRaw.map(u => [`${u.kons_kode}|${u.kode_number}`, u._count.kp])
    );
    return res.json(specs.map(s => ({ ...s, usage_count: usageMap[`${s.kons_kode}|${s.kode}`] ?? 0 })));
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/denim/fabric-specs — create new spec (admin only)
router.post('/fabric-specs', requireAuth, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const spec = await prisma.fabricSpec.create({ data: req.body });
    return res.json(spec);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/denim/fabric-specs/:id — update spec (admin only)
router.put('/fabric-specs/:id', requireAuth, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { id: _id, usage_count: _uc, ...updateData } = req.body;
    const spec = await prisma.fabricSpec.update({
      where: { id: Number(req.params.id) },
      data: updateData,
    });
    return res.json(spec);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/denim/sales-contracts
// Create a new sacon order directly (factory clicks New Order → order lands in sacon inbox)
router.post('/sales-contracts', requireAuth,
  requireRole('admin', 'factory'),
  async (req: Request, res: Response) => {
    try {
      const {
        tgl, permintaan, status, kat_kode, codename, kode,
        kons_kode, ket_warna, ket_ct_ws, kode_number,
        proses, catatan,
        // Fabric spec fields — only those mapped to SalesContract schema
        te, sisir, p_kons,
        lusi_type, lusi_ne,
        pakan_type, pakan_ne,
        // SACON / measurement fields
        j, j_c, b_c, tb, tb_real,
        bale_lusi, total_pakan, bale_pakan,
        lot_lusi, delivery_time, remarks, foto_sacon,
      } = req.body as Record<string, unknown>;

      if (!tgl || !kode) {
        return res.status(400).json({ error: 'tgl and kode are required' });
      }

      const sc = await prisma.$transaction(async (tx: any) => {
        const kp = await generateNextKP(tx);
        const kp_sequence = decodeKP(kp);
        return tx.salesContract.create({
          data: {
            kp,
            kp_sequence,
            kp_status: 'ACTIVE',
            tgl: new Date(tgl as string),
            permintaan:   permintaan   as string ?? null,
            status:       status       as string ?? 'SCN',
            kat_kode:     kat_kode     as string ?? null,
            codename:     codename     as string ?? null,
            kons_kode:    kons_kode    as string ?? null,
            ket_warna:    ket_warna    as string ?? null,
            ket_ct_ws:    ket_ct_ws    as string ?? null,
            kode_number:  kode_number  as string ?? null,
            proses:       proses       as string ?? 'PROSES',
            // Fabric spec fields — map frontend names to SalesContract schema fields
            // SalesContract only stores: te, sisir, p_kons, ne_k_lusi, ne_lusi,
            //   sp_lusi, ne_k_pakan, ne_pakan, sp_pakan
            // All other FabricSpec fields (anyaman, arah, lg_inches, warna, etc.)
            // are display-only in the modal and NOT persisted to SalesContract.
            te:            te            ? parseFloat(te as string) : null,
            sisir:         sisir         as string ?? null,
            p_kons:        p_kons        as string ?? null,
            ne_k_lusi:     lusi_type     as string ?? null,
            ne_lusi:       lusi_ne       ? parseFloat(lusi_ne as string) : null,
            sp_lusi:       null,          // yarn supplier — filled by factory in Warping form
            ne_k_pakan:    pakan_type    as string ?? null,
            ne_pakan:      pakan_ne      ? parseFloat(pakan_ne as string) : null,
            sp_pakan:      null,          // yarn supplier — filled by factory in Warping form
            // SACON fields
            lot_lusi:      lot_lusi     as string ?? null,
            remarks:       remarks      as string ?? null,
            // Yarn parameters
            j:             j            ? parseFloat(j as string) : null,
            j_c:           j_c          ? parseFloat(j_c as string) : null,
            b_c:           b_c          ? parseFloat(b_c as string) : null,
            tb:            tb           ? parseFloat(tb as string) : null,
            tb_real:       tb_real      ? parseFloat(tb_real as string) : null,
            bale_lusi:     bale_lusi    ? parseFloat(bale_lusi as string) : null,
            total_pakan:   total_pakan  ? parseFloat(total_pakan as string) : null,
            bale_pakan:    bale_pakan   ? parseFloat(bale_pakan as string) : null,
            foto_sacon:    foto_sacon   as string ?? null,
            // New order → awaiting Jakarta approval
            sacon:            false,
            pipeline_status:  'PENDING_APPROVAL',
            ts:              new Date(),
            acc:             null,
          },
        });
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

      return res.status(201).json(sc);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
);

// POST /api/denim/sales-contracts/bulk-decision
// Approve or reject multiple sales contracts in one request (Jakarta / admin only)
router.post(
  '/sales-contracts/bulk-decision',
  requireAuth,
  requireRole('jakarta', 'admin'),
  async (req: Request, res: Response) => {
    try {
      const { kps, decision, rejection_reason } = req.body as {
        kps: string[];
        decision: 'approve' | 'reject';
        rejection_reason?: string;
      };

      if (!Array.isArray(kps) || kps.length === 0) {
        return res.status(400).json({ error: 'kps must be a non-empty array' });
      }
      if (kps.length > 100) {
        return res.status(400).json({ error: 'Cannot process more than 100 KPs at once' });
      }
      if (decision !== 'approve' && decision !== 'reject') {
        return res.status(400).json({ error: 'Invalid decision' });
      }

      const succeeded: string[] = [];
      const failed: { kp: string; error: string }[] = [];

      // Best-effort: process each KP independently so partial failures don't block the rest.
      for (const kp of kps) {
        try {
          if (decision === 'reject') {
            const existing = await prisma.salesContract.findUnique({ where: { kp } });
            if (!existing) { failed.push({ kp, error: 'Not found' }); continue; }
            await prisma.salesContract.update({
              where: { kp },
              data: {
                kp_status: 'ARCHIVED',
                archived_at: new Date(),
                archived_kp: existing.kp,
                pipeline_status: 'REJECTED',
                acc: 'TIDAK ACC',
                kp: `kp_archived_${kp}`,
                rejection_reason: rejection_reason || null,
              },
            });
            await prisma.pipelineEvent.create({
              data: {
                kp,
                from_stage: existing.pipeline_status,
                to_stage: 'REJECTED',
              },
            });
            notifyUser('1', 'sc_rejected', {
              kp,
              message: `KP ${kp} was not approved — KP slot has been archived and will be recycled`,
            });
          } else {
            const existing = await prisma.salesContract.findUnique({ where: { kp }, select: { pipeline_status: true } });
            await prisma.salesContract.update({
              where: { kp },
              data: { pipeline_status: 'WARPING', acc: 'ACC', kp_status: 'ACTIVE' },
            });
            await prisma.pipelineEvent.create({
              data: {
                kp,
                from_stage: existing?.pipeline_status ?? null,
                to_stage: 'WARPING',
              },
            });
            notifyUser('1', 'sc_approved', {
              kp,
              message: `KP ${kp} has been approved ✓ — moved to warping queue`,
            });
          }
          succeeded.push(kp);
        } catch (e: any) {
          failed.push({ kp, error: e?.message || 'Unknown error' });
        }
      }

      return res.json({ succeeded, failed });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
);

// POST /api/denim/sales-contracts/:kp/decision
// Approve or reject a sales contract (Jakarta only)
router.post(
  '/sales-contracts/:kp/decision',
  requireAuth,
  requireRole('jakarta', 'admin'),
  async (req: Request, res: Response) => {
    try {
      const { kp } = req.params;
      const { decision, rejection_reason } = req.body as {
        decision: 'approve' | 'reject';
        rejection_reason?: string;
      };

      if (decision !== 'approve' && decision !== 'reject') {
        return res.status(400).json({ error: 'Invalid decision' });
      }

      const newStatus =
        decision === 'approve' ? 'WARPING' : 'REJECTED';
      const accValue =
        decision === 'approve' ? 'ACC' : 'TIDAK ACC';

      // When rejecting, archive the contract so the KP slot can be recycled
      if (decision === 'reject') {
        // Get existing record first
        const existing = await prisma.salesContract.findUnique({
          where: { kp }
        });

        // Archive the old record - rename KP to free up the code for reuse
        await prisma.salesContract.update({
          where: { kp },
          data: {
            kp_status: 'ARCHIVED',
            archived_at: new Date(),
            archived_kp: existing?.kp,
            pipeline_status: newStatus,
            acc: accValue,
            kp: `kp_archived_${kp}`,  // free up the KP code for reuse
            rejection_reason: rejection_reason || null,
          }
        });

        await prisma.pipelineEvent.create({
          data: {
            kp,
            from_stage: existing?.pipeline_status ?? null,
            to_stage: newStatus,
          },
        });

        // The kp_sequence stays on the archived record so generateNextKP() can find it as a recyclable gap
        
        notifyUser(
          '1',
          'sc_rejected',
          {
            kp,
            message: `KP ${kp} was not approved — KP slot has been archived and will be recycled`,
          }
        );

        return res.json({ success: true, message: 'Contract rejected and archived. KP slot will be recycled.' });
      }

      // When approving, just update as normal
      const existing = await prisma.salesContract.findUnique({ where: { kp }, select: { pipeline_status: true } });
      const sc = await prisma.salesContract.update({
        where: { kp },
        data: {
          pipeline_status: newStatus,
          acc: accValue,
          kp_status: 'ACTIVE',  // Mark as ACTIVE when approved
        },
      });

      await prisma.pipelineEvent.create({
        data: {
          kp,
          from_stage: existing?.pipeline_status ?? null,
          to_stage: newStatus,
        },
      });

      // Emit WebSocket notification to the creator
      // (In production, store creator userId on SC —
      //  for now broadcast to all connected factory users)

      // Since we don't store creator_id yet, emit to user id '1'
      // (the factory user). This will be replaced when we add
      // user management.
      notifyUser(
        '1', // factory user id
        decision === 'approve' ? 'sc_approved' : 'sc_rejected',
        {
          kp,
          message:
            decision === 'approve'
              ? `KP ${kp} has been approved ✓ — moved to warping queue`
              : `KP ${kp} was not approved — please review and resubmit`,
        }
      );

      return res.json({ success: true, sc });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
);

// POST /api/denim/sales-contracts/:kp/sacon-submit
// Submits SACON form data for a sales contract in PENDING_APPROVAL stage
router.post(
  '/sales-contracts/:kp/sacon-submit',
  requireAuth,
  requireRole('admin', 'factory'),
  async (req: Request, res: Response) => {
    try {
      const { kp } = req.params;
      const {
        j, j_c, b_c, tb, tb_real,
        bale_lusi, total_pakan, bale_pakan,
        foto_sacon,
      } = req.body as {
        j?: number;
        j_c?: number;
        b_c?: number;
        tb?: number;
        tb_real?: number;
        bale_lusi?: number;
        total_pakan?: number;
        bale_pakan?: number;
        foto_sacon?: string;
      };

      const sc = await prisma.salesContract.findUnique({ where: { kp } });
      if (!sc) return res.status(404).json({ error: `KP ${kp} not found` });

      if (sc.pipeline_status !== 'PENDING_APPROVAL') {
        return res.status(400).json({ error: 'Order is not in PENDING_APPROVAL stage' });
      }

      const updateData: any = {
        sacon: true,
        ts: new Date(),
        pipeline_status: 'SACON',
      };
      if (j !== undefined)         updateData.j = j;
      if (j_c !== undefined)        updateData.j_c = j_c;
      if (b_c !== undefined)       updateData.b_c = b_c;
      if (tb !== undefined)        updateData.tb = tb;
      if (tb_real !== undefined)   updateData.tb_real = tb_real;
      if (bale_lusi !== undefined) updateData.bale_lusi = bale_lusi;
      if (total_pakan !== undefined) updateData.total_pakan = total_pakan;
      if (bale_pakan !== undefined) updateData.bale_pakan = bale_pakan;
      if (foto_sacon !== undefined) updateData.foto_sacon = foto_sacon;

      const updated = await prisma.salesContract.update({
        where: { kp },
        data: updateData,
      });

      await prisma.pipelineEvent.create({
        data: {
          kp,
          from_stage: sc.pipeline_status,
          to_stage: 'SACON',
        },
      });

      return res.json(updated);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
);

// POST /api/denim/sales-contracts/:kp/sacon-decision
// ACC or reject a sales contract in SACON stage
router.post(
  '/sales-contracts/:kp/sacon-decision',
  requireAuth,
  requireRole('admin', 'jakarta'),
  async (req: Request, res: Response) => {
    try {
      const { kp } = req.params;
      const { decision, rejection_reason } = req.body as {
        decision: 'ACC' | 'TIDAK ACC';
        rejection_reason?: string;
      };

      if (!decision) {
        return res.status(400).json({ error: 'decision is required' });
      }
      if (decision !== 'ACC' && decision !== 'TIDAK ACC') {
        return res.status(400).json({ error: "decision must be 'ACC' or 'TIDAK ACC'" });
      }

      const sc = await prisma.salesContract.findUnique({ where: { kp } });
      if (!sc) return res.status(404).json({ error: `KP ${kp} not found` });

      if (sc.pipeline_status !== 'SACON') {
        return res.status(400).json({ error: 'Order is not in SACON stage' });
      }

      const updateData: any = {
        acc: decision,
        pipeline_status: decision === 'ACC' ? 'WARPING' : 'REJECTED',
        rejection_reason: decision === 'TIDAK ACC' ? (rejection_reason ?? null) : null,
      };

      const updated = await prisma.salesContract.update({
        where: { kp },
        data: updateData,
      });

      await prisma.pipelineEvent.create({
        data: {
          kp,
          from_stage: sc.pipeline_status,
          to_stage: updateData.pipeline_status,
        },
      });

      return res.json(updated);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
);

// GET /api/denim/sacon-inbox
// Returns sales contracts for the sacon inbox in two sections:
//   pending  — orders ready to submit sacon (SACON+sacon=false OR WARPING+acc=ACC+sacon=false)
//   awaiting — orders submitted to Jakarta, waiting for decision (sacon=true AND acc IS NULL)
router.get('/sacon-inbox',
  requireAuth,
  requireRole('admin', 'factory'),
  async (req: Request, res: Response) => {
    try {
      const pendingWhere: any = {
        OR: [
          // In SACON stage, sacon not yet submitted
          { pipeline_status: 'SACON', sacon: false },
          // Approved (WARPING), sacon form not yet submitted
          { pipeline_status: 'WARPING', acc: 'ACC', sacon: false },
        ],
      };

      const awaitingWhere: any = {
        sacon: true,
        acc: null,
      };

      const [pendingItems, awaitingItems] = await Promise.all([
        prisma.salesContract.findMany({
          where: pendingWhere,
          orderBy: { tgl: 'desc' },
          take: 200,
          select: {
            id: true,
            kp: true,
            codename: true,
            tgl: true,
            permintaan: true,
            pipeline_status: true,
            sacon: true,
            acc: true,
            ts: true,
            foto_sacon: true,
            j: true,
            j_c: true,
            b_c: true,
            tb: true,
            tb_real: true,
            bale_lusi: true,
            total_pakan: true,
            bale_pakan: true,
            rejection_reason: true,
          },
        }),
        prisma.salesContract.findMany({
          where: awaitingWhere,
          orderBy: { tgl: 'desc' },
          take: 200,
          select: {
            id: true,
            kp: true,
            codename: true,
            tgl: true,
            permintaan: true,
            pipeline_status: true,
            sacon: true,
            acc: true,
            ts: true,
            foto_sacon: true,
            j: true,
            j_c: true,
            b_c: true,
            tb: true,
            tb_real: true,
            bale_lusi: true,
            total_pakan: true,
            bale_pakan: true,
            rejection_reason: true,
          },
        }),
      ]);

      return res.json({ pending: pendingItems, awaiting: awaitingItems });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
);

// GET /api/denim/sacon-inbox/awaiting
// Returns orders submitted to Jakarta, waiting for decision
// (pipeline_status: PENDING_APPROVAL, sacon: false, acc: null)
router.get('/sacon-inbox/awaiting',
  requireAuth,
  requireRole('admin', 'factory'),
  async (req: Request, res: Response) => {
    try {
      const items = await prisma.salesContract.findMany({
        where: { pipeline_status: 'PENDING_APPROVAL', sacon: false, acc: null },
        orderBy: { tgl: 'desc' },
        take: 200,
        select: {
          id:          true,
          kp:          true,
          tgl:         true,
          codename:    true,
          kons_kode:   true,
          kat_kode:    true,
          permintaan:  true,
          ts:          true,
          acc:         true,
        },
      });
      return res.json(items);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
);

// ─── PRODUCTION INBOX ROUTES ──────────────────────────────────────────────────

// GET /api/denim/warping-inbox
// Returns sales contracts ready for warping (pipeline_status = 'WARPING')
router.get('/warping-inbox',
  requireAuth,
  requireRole('admin', 'factory', 'jakarta'),
  async (req: Request, res: Response) => {
  try {
    const items = await prisma.salesContract.findMany({
      where: { pipeline_status: 'WARPING' },
      orderBy: { tgl: 'desc' },
      select: {
        id: true, kp: true, tgl: true, codename: true, permintaan: true,
        kat_kode: true, ket_warna: true, status: true, acc: true,
        proses: true, te: true, tb: true, pipeline_status: true,
      },
    });
    return res.json({ count: items.length, items });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/denim/warping
// Creates/updates warping run and advances pipeline to 'INDIGO'
router.post('/warping', requireAuth,
  requireRole('admin', 'factory'),
  async (req: Request, res: Response) => {
    try {
      const {
        kp, tgl, start, stop, rpm, mtr_per_min,
        total_putusan, beams,
      } = req.body;

      // Upsert WarpingRun (1 per KP)
      const run = await prisma.warpingRun.upsert({
        where: { kp },
        create: {
          kp,
          tgl: tgl ? new Date(tgl) : new Date(),
          start_time: start || null,
          stop_time: stop || null,
          rpm: rpm ? parseFloat(rpm) : null,
          mtr_min: mtr_per_min ? parseFloat(mtr_per_min) : null,
          total_putusan: total_putusan
            ? parseInt(total_putusan) : null,
        },
        update: {
          tgl: tgl ? new Date(tgl) : new Date(),
          start_time: start || null,
          stop_time: stop || null,
          rpm: rpm ? parseFloat(rpm) : null,
          mtr_min: mtr_per_min ? parseFloat(mtr_per_min) : null,
          total_putusan: total_putusan
            ? parseInt(total_putusan) : null,
        },
      });

      // Delete old beams and re-insert
      await prisma.warpingBeam.deleteMany({
        where: { warping_run_id: run.id },
      });

      if (beams && Array.isArray(beams) && beams.length > 0) {
        await prisma.warpingBeam.createMany({
          data: beams.map((b: any, index: number) => ({
            warping_run_id: run.id,
            kp,
            position: index + 1,
            beam_number: b.beam_number,
            panjang_beam: b.panjang_beam ?? null,
            jumlah_ends: b.jumlah_ends ?? null,
            putusan: b.putusan ?? null,
          })),
        });
      }

      // Advance pipeline
      await prisma.salesContract.update({
        where: { kp },
        data: { pipeline_status: 'INDIGO' },
      });

      await prisma.pipelineEvent.create({
        data: {
          kp,
          from_stage: 'WARPING',
          to_stage: 'INDIGO',
        },
      });

      return res.json({ success: true, run });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
);

// GET /api/denim/indigo-inbox
// Returns sales contracts ready for indigo (pipeline_status = 'INDIGO')
router.get('/indigo-inbox',
  requireAuth,
  requireRole('admin', 'factory', 'jakarta'),
  async (req: Request, res: Response) => {
  try {
    const items = await prisma.salesContract.findMany({
      where: { pipeline_status: 'INDIGO' },
      orderBy: { tgl: 'desc' },
      select: {
        id: true, kp: true, tgl: true, codename: true, permintaan: true,
        kat_kode: true, ket_warna: true, status: true, acc: true,
        proses: true, te: true, tb: true, pipeline_status: true,
      },
    });
    return res.json({ count: items.length, items });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/denim/indigo
// Creates/updates indigo run and advances pipeline to 'WEAVING'
router.post('/indigo', requireAuth,
  requireRole('admin', 'factory'),
  async (req: Request, res: Response) => {
    try {
      const {
        kp, tgl, start, stop, jumlah_rope, panjang_rope,
        bak_count, indigo_conc, indigo_bak,
        has_sulfur, sulfur_conc, sulfur_bak,
        total_meters, keterangan,
      } = req.body;

      const run = await prisma.indigoRun.upsert({
        where: { kp },
        create: {
          kp,
          tanggal: tgl ? new Date(tgl) : new Date(),
          tgl: tgl ? new Date(tgl) : new Date(),
          start: start || null,
          stop: stop || null,
          jumlah_rope: jumlah_rope
            ? parseInt(jumlah_rope) : null,
          panjang_rope: panjang_rope
            ? parseFloat(panjang_rope) : null,
          bak_count: bak_count ? parseInt(bak_count) : null,
          indigo_conc: indigo_conc
            ? parseFloat(indigo_conc) : null,
          indigo_bak: indigo_bak ? parseInt(indigo_bak) : null,
          sulfur_conc: has_sulfur && sulfur_conc
            ? parseFloat(sulfur_conc) : null,
          sulfur_bak: has_sulfur && sulfur_bak
            ? parseInt(sulfur_bak) : null,
          total_meters: total_meters
            ? parseFloat(total_meters) : null,
          keterangan: keterangan || null,
        },
        update: {
          tanggal: tgl ? new Date(tgl) : new Date(),
          tgl: tgl ? new Date(tgl) : new Date(),
          start: start || null,
          stop: stop || null,
          jumlah_rope: jumlah_rope
            ? parseInt(jumlah_rope) : null,
          panjang_rope: panjang_rope
            ? parseFloat(panjang_rope) : null,
          bak_count: bak_count ? parseInt(bak_count) : null,
          indigo_conc: indigo_conc
            ? parseFloat(indigo_conc) : null,
          indigo_bak: indigo_bak ? parseInt(indigo_bak) : null,
          sulfur_conc: has_sulfur && sulfur_conc
            ? parseFloat(sulfur_conc) : null,
          sulfur_bak: has_sulfur && sulfur_bak
            ? parseInt(sulfur_bak) : null,
          total_meters: total_meters
            ? parseFloat(total_meters) : null,
          keterangan: keterangan || null,
        },
      });

      await prisma.salesContract.update({
        where: { kp },
        data: { pipeline_status: 'WEAVING' },
      });

      await prisma.pipelineEvent.create({
        data: {
          kp,
          from_stage: 'INDIGO',
          to_stage: 'WEAVING',
        },
      });

      return res.json({ success: true, run });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
);

// GET /api/denim/weaving-inbox
// Returns sales contracts ready for weaving (pipeline_status = 'WEAVING')
router.get('/weaving-inbox',
  requireAuth,
  requireRole('admin', 'factory', 'jakarta'),
  async (req: Request, res: Response) => {
  try {
    const items = await prisma.salesContract.findMany({
      where: { pipeline_status: 'WEAVING' },
      orderBy: { tgl: 'desc' },
      select: {
        id: true, kp: true, tgl: true, codename: true, permintaan: true,
        kat_kode: true, ket_warna: true, status: true, acc: true,
        proses: true, te: true, tb: true, pipeline_status: true,
      },
    });
    return res.json({ count: items.length, items });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/denim/weaving
// Confirms weaving completion and advances pipeline to 'INSPECT_GRAY'
router.post('/weaving', requireAuth, requireRole('admin', 'factory'), async (req: Request, res: Response) => {
  try {
    const { kp } = req.body;
    if (!kp) return res.status(400).json({ error: 'kp is required' });

    const sc = await prisma.salesContract.findUnique({ where: { kp } });
    if (!sc) return res.status(404).json({ error: 'Sales contract not found' });
    if (sc.pipeline_status !== 'WEAVING') {
      return res.status(400).json({ error: `Cannot confirm: SC is in ${sc.pipeline_status}` });
    }

    await prisma.salesContract.update({
      where: { kp },
      data: {
        pipeline_status: 'INSPECT_GRAY',
        weaving_confirmed_at: new Date(),
      },
    });

    await prisma.pipelineEvent.create({
      data: {
        kp,
        from_stage: sc.pipeline_status,
        to_stage: 'INSPECT_GRAY',
      },
    });

    return res.json({ ok: true, kp, pipeline_status: 'INSPECT_GRAY' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/denim/inspect-gray-inbox
// Returns sales contracts ready for inspect gray (pipeline_status = 'INSPECT_GRAY')
router.get('/inspect-gray-inbox',
  requireAuth,
  requireRole('admin', 'factory', 'jakarta'),
  async (req: Request, res: Response) => {
  try {
    const items = await prisma.salesContract.findMany({
      where: { pipeline_status: 'INSPECT_GRAY' },
      orderBy: { tgl: 'desc' },
      select: {
        id: true, kp: true, tgl: true, codename: true, permintaan: true,
        kat_kode: true, ket_warna: true, status: true, acc: true,
        proses: true, te: true, tb: true, pipeline_status: true,
      },
    });
    return res.json({ count: items.length, items });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/denim/inspect-gray — update existing inspection records
router.put('/inspect-gray', requireAuth,
  requireRole('admin', 'factory'),
  async (req: Request, res: Response) => {
    try {
      const {
        kp, tgl, inspector_name, rolls,
      } = req.body;

      // Delete existing records for this KP
      await prisma.inspectGrayRecord.deleteMany({
        where: { kp },
      });

      // InspectGrayRecord — create one per roll
      const tglDate = tgl ? new Date(tgl) : new Date();

      if (rolls && Array.isArray(rolls) && rolls.length > 0) {
        await prisma.inspectGrayRecord.createMany({
          data: rolls.map((r: any) => ({
            kp,
            tg: tglDate,
            mc: inspector_name || null,
            no_roll: r.no_roll ? parseInt(r.no_roll) : null,
            panjang: r.panjang ? parseFloat(r.panjang) : null,
            lebar: r.lebar ? parseFloat(r.lebar) : null,
            berat: r.berat ? parseFloat(r.berat) : null,
            gd: r.grade || null,
            cacat: r.cacat || null,
            // Store additional defect counts
            bmc: r.bmc || null,
          })),
        });
      }

      return res.json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
);

// POST /api/denim/inspect-gray — create new inspection records
router.post('/inspect-gray', requireAuth,
  requireRole('admin', 'factory'),
  async (req: Request, res: Response) => {
    try {
      const {
        kp, tgl, inspector_name, rolls,
        total_rolls, total_panjang, total_berat,
      } = req.body;

      // InspectGrayRecord — create one per roll
      const tglDate = tgl ? new Date(tgl) : new Date();
      await prisma.inspectGrayRecord.deleteMany({
        where: { kp, tg: tglDate },
      });

      if (rolls && Array.isArray(rolls) && rolls.length > 0) {
        await prisma.inspectGrayRecord.createMany({
          data: rolls.map((r: any) => ({
            kp,
            tg: tglDate,
            mc: inspector_name || null,
            no_roll: r.no_roll ? parseInt(r.no_roll) : null,
            panjang: r.panjang ? parseFloat(r.panjang) : null,
            lebar: r.lebar ? parseFloat(r.lebar) : null,
            berat: r.berat ? parseFloat(r.berat) : null,
            gd: r.grade || null,
            cacat: r.cacat || null,
          })),
        });
      }

      // Fetch previous stage before updating
      const prev = await prisma.salesContract.findUnique({
        where: { kp },
        select: { pipeline_status: true },
      });

      // Advance pipeline to BBSF
      await prisma.salesContract.update({
        where: { kp },
        data: { pipeline_status: 'BBSF' },
      });

      await prisma.pipelineEvent.create({
        data: {
          kp,
          from_stage: prev?.pipeline_status ?? null,
          to_stage: 'BBSF',
        },
      });

      return res.json({ success: true, kp, pipeline_status: 'BBSF' });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
);

// POST /api/denim/bbsf — create new BBSF records
router.post('/bbsf', requireAuth,
  requireRole('admin', 'factory'),
  async (req: Request, res: Response) => {
    try {
      const { kp, tgl, ...bbsfData } = req.body;
      
      const tglDate = tgl ? new Date(tgl) : new Date();
      
      // Extract washing and sanfor fields
      const washingFields = [
        'ws_shift', 'ws_mc', 'ws_speed', 'ws_larutan_1', 'ws_temp_1', 'ws_padder_1',
        'ws_dancing_1', 'ws_larutan_2', 'ws_temp_2', 'ws_padder_2', 'ws_dancing_2',
        'ws_skala_skew', 'ws_tekanan_boiler', 'ws_press_dancing_1', 'ws_press_dancing_2', 'ws_press_dancing_3',
        'ws_temp_zone_1', 'ws_temp_zone_2', 'ws_temp_zone_3', 'ws_temp_zone_4', 'ws_temp_zone_5', 'ws_temp_zone_6',
        'ws_lebar_awal', 'ws_panjang_awal', 'ws_permasalahan', 'ws_pelaksana', 'ws_jam_proses'
      ];
      
      const sanforFields = [
        'sf1_sanfor_type', 'sf1_shift', 'sf1_mc', 'sf1_jam', 'sf1_speed', 'sf1_damping', 'sf1_press',
        'sf1_tension', 'sf1_tension_limit', 'sf1_temperatur', 'sf1_susut', 'sf1_permasalahan', 'sf1_pelaksana',
        'sf2_sanfor_type', 'sf2_shift', 'sf2_mc', 'sf2_jam', 'sf2_speed', 'sf2_damping', 'sf2_press',
        'sf2_tension', 'sf2_temperatur', 'sf2_susut', 'sf2_awal', 'sf2_akhir', 'sf2_panjang',
        'sf2_permasalahan', 'sf2_pelaksana'
      ];
      
      // Create washing record if any washing fields are present
      const washingData: any = { kp, tgl: tglDate };
      for (const field of washingFields) {
        const value = bbsfData[field];
        if (value !== undefined && value !== '') {
          const dbField = field.replace('ws_', '');
          washingData[dbField] = isNaN(Number(value)) ? value : Number(value);
        }
      }
      
      if (Object.keys(washingData).length > 2) {
        await prisma.bBSFWashingRun.create({ data: washingData });
      }
      
      // Create sanfor record if any sanfor fields are present
      const sanforData: any = { kp, tgl: tglDate };
      for (const field of sanforFields) {
        const value = bbsfData[field];
        if (value !== undefined && value !== '') {
          const dbField = field.replace(/^sf\d_/, '');
          sanforData[dbField] = isNaN(Number(value)) ? value : Number(value);
        }
      }
      
      if (Object.keys(sanforData).length > 2) {
        await prisma.bBSFSanforRun.create({ data: sanforData });
      }

      // Fetch previous stage before updating
      const prev = await prisma.salesContract.findUnique({
        where: { kp },
        select: { pipeline_status: true },
      });

      // Advance pipeline to INSPECT_FINISH
      await prisma.salesContract.update({
        where: { kp },
        data: { pipeline_status: 'INSPECT_FINISH' },
      });

      await prisma.pipelineEvent.create({
        data: {
          kp,
          from_stage: prev?.pipeline_status ?? null,
          to_stage: 'INSPECT_FINISH',
        },
      });

      return res.json({ success: true, kp, pipeline_status: 'INSPECT_FINISH' });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
);

// POST /api/denim/inspect-finish — create new inspection records
router.post('/inspect-finish', requireAuth,
  requireRole('admin', 'factory'),
  async (req: Request, res: Response) => {
    try {
      const { kp, shift, operator, rolls } = req.body;
      
      // Create records
      if (rolls && Array.isArray(rolls) && rolls.length > 0) {
        await prisma.inspectFinishRecord.createMany({
          data: rolls.map((r: any) => ({
            kp,
            tgl: new Date(),
            shift: shift || null,
            mc: operator || null,
            no_roll: r.no_roll ? parseInt(r.no_roll) : null,
            sn: r.sn || null,
            sn_combined: r.sn_combined || null,
            sn_full: r.sn_full || null,
            lebar: r.lebar ? parseFloat(r.lebar) : null,
            kg: r.kg ? parseFloat(r.kg) : null,
            grade: r.grade || null,
            point: r.point ? parseFloat(r.point) : null,
            susut_lusi: r.susut_lusi ? parseFloat(r.susut_lusi) : null,
            susut_pakan: r.susut_pakan ? parseFloat(r.susut_pakan) : null,
            bmc: r.bmc || null,
          })),
        });
        
        // Fetch previous stage before updating
        const prev = await prisma.salesContract.findUnique({
          where: { kp },
          select: { pipeline_status: true },
        });

        // Update pipeline status to COMPLETE
        await prisma.salesContract.update({
          where: { kp },
          data: { pipeline_status: 'COMPLETE' },
        });

        await prisma.pipelineEvent.create({
          data: {
            kp,
            from_stage: prev?.pipeline_status ?? null,
            to_stage: 'COMPLETE',
          },
        });
      }

      return res.json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
);

// PUT /api/denim/bbsf — update existing BBSF records
router.put('/bbsf', requireAuth,
  requireRole('admin', 'factory'),
  async (req: Request, res: Response) => {
    try {
      const { kp, tgl, ...bbsfData } = req.body;
      
      const tglDate = tgl ? new Date(tgl) : new Date();
      
      // Delete existing BBSF records for this KP
      await prisma.bBSFWashingRun.deleteMany({ where: { kp } });
      await prisma.bBSFSanforRun.deleteMany({ where: { kp } });
      
      // Extract washing and sanfor fields
      const washingFields = [
        'ws_shift', 'ws_mc', 'ws_speed', 'ws_larutan_1', 'ws_temp_1', 'ws_padder_1',
        'ws_dancing_1', 'ws_larutan_2', 'ws_temp_2', 'ws_padder_2', 'ws_dancing_2',
        'ws_skala_skew', 'ws_tekanan_boiler', 'ws_press_dancing_1', 'ws_press_dancing_2', 'ws_press_dancing_3',
        'ws_temp_zone_1', 'ws_temp_zone_2', 'ws_temp_zone_3', 'ws_temp_zone_4', 'ws_temp_zone_5', 'ws_temp_zone_6',
        'ws_lebar_awal', 'ws_panjang_awal', 'ws_permasalahan', 'ws_pelaksana', 'ws_jam_proses'
      ];
      
      const sanforFields = [
        'sf1_sanfor_type', 'sf1_shift', 'sf1_mc', 'sf1_jam', 'sf1_speed', 'sf1_damping', 'sf1_press',
        'sf1_tension', 'sf1_tension_limit', 'sf1_temperatur', 'sf1_susut', 'sf1_permasalahan', 'sf1_pelaksana',
        'sf2_sanfor_type', 'sf2_shift', 'sf2_mc', 'sf2_jam', 'sf2_speed', 'sf2_damping', 'sf2_press',
        'sf2_tension', 'sf2_temperatur', 'sf2_susut', 'sf2_awal', 'sf2_akhir', 'sf2_panjang',
        'sf2_permasalahan', 'sf2_pelaksana'
      ];
      
      // Create washing record if any washing fields are present
      const washingData: any = { kp, tgl: tglDate };
      for (const field of washingFields) {
        const value = bbsfData[field];
        if (value !== undefined && value !== '') {
          const dbField = field.replace('ws_', '');
          washingData[dbField] = isNaN(Number(value)) ? value : Number(value);
        }
      }
      
      if (Object.keys(washingData).length > 2) { // kp and tgl
        await prisma.bBSFWashingRun.create({ data: washingData });
      }
      
      // Create sanfor record if any sanfor fields are present
      const sanforData: any = { kp, tgl: tglDate };
      for (const field of sanforFields) {
        const value = bbsfData[field];
        if (value !== undefined && value !== '') {
          const dbField = field.replace(/^sf\d_/, '');
          sanforData[dbField] = isNaN(Number(value)) ? value : Number(value);
        }
      }
      
      if (Object.keys(sanforData).length > 2) {
        await prisma.bBSFSanforRun.create({ data: sanforData });
      }
      
      return res.json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
);

// GET /denim/bbsf-production?kp=:kp
router.get('/bbsf-production', requireAuth, requireRole('admin', 'factory', 'jakarta'), async (req, res) => {
  try {
    const { kp } = req.query
    if (!kp || typeof kp !== 'string') {
      return res.status(400).json({ error: 'kp required' })
    }
    const records = await prisma.bBSFProductionRecord.findMany({
      where: { kp: kp.toUpperCase() },
      orderBy: [{ tanggal: 'desc' }, { line: 'asc' }],
      take: 500,
    })
    res.json(records)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Internal error' })
  }
})

// GET /denim/bbsf-susut?kp=:kp
router.get('/bbsf-susut', requireAuth, requireRole('admin', 'factory', 'jakarta'), async (req, res) => {
  try {
    const { kp } = req.query
    if (!kp || typeof kp !== 'string') {
      return res.status(400).json({ error: 'kp required' })
    }
    const records = await prisma.bBSFSusutRecord.findMany({
      where: { kp: kp.toUpperCase() },
      orderBy: [{ tanggal: 'desc' }, { kereta: 'asc' }],
      take: 200,
    })
    res.json(records)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Internal error' })
  }
})

// PUT /api/denim/inspect-finish — update existing inspection records
router.put('/inspect-finish', requireAuth,
  requireRole('admin', 'factory'),
  async (req: Request, res: Response) => {
    try {
      const { kp, shift, operator, rolls } = req.body;
      
      // Delete existing records for this KP
      await prisma.inspectFinishRecord.deleteMany({ where: { kp } });
      
      // Create new records
      if (rolls && Array.isArray(rolls) && rolls.length > 0) {
        await prisma.inspectFinishRecord.createMany({
          data: rolls.map((r: any) => ({
            kp,
            tgl: new Date(),
            shift: shift || null,
            mc: operator || null,
            no_roll: r.no_roll ? parseInt(r.no_roll) : null,
            sn: r.sn || null,
            sn_combined: r.sn_combined || null,
            sn_full: r.sn_full || null,
            lebar: r.lebar ? parseFloat(r.lebar) : null,
            kg: r.kg ? parseFloat(r.kg) : null,
            grade: r.grade || null,
            point: r.point ? parseFloat(r.point) : null,
            susut_lusi: r.susut_lusi ? parseFloat(r.susut_lusi) : null,
            susut_pakan: r.susut_pakan ? parseFloat(r.susut_pakan) : null,
            bmc: r.bmc || null,
          })),
        });
      }
      
      return res.json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
);

// ─── ADMIN DASHBOARD ROUTES ─────────────────────────────────────────────────

// GET /api/denim/admin/summary
// Returns factory-wide summary statistics (admin/jakarta only)
router.get('/admin/summary',
  requireAuth,
  requireRole('admin', 'jakarta'),
  async (req: Request, res: Response) => {
    try {
      // Count SCs at each pipeline stage
      const stageCounts = await prisma.salesContract.groupBy({
        by: ['pipeline_status'],
        _count: { pipeline_status: true },
      });

      // Count by order type (status field = PO1/RP/SCN)
      const typeCounts = await prisma.salesContract.groupBy({
        by: ['status'],
        _count: { status: true },
      });

      // Total
      const total = await prisma.salesContract.count();

      // Recently completed (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentlyCompleted = await prisma.salesContract.count({
        where: {
          pipeline_status: 'COMPLETE',
          tgl: { gte: thirtyDaysAgo },
        },
      });

      // Blocked = PENDING_APPROVAL older than 3 days
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      const blockedCount = await prisma.salesContract.count({
        where: {
          pipeline_status: 'PENDING_APPROVAL',
          tgl: { lte: threeDaysAgo },
        },
      });

      // NEW: Weekly Efficiency (last 8 weeks)
      const eightWeeksAgo = new Date();
      eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);
      const weeklyEfficiencyRaw = await prisma.$queryRaw<Array<{
        week: Date;
        avg_efficiency: number;
        record_count: bigint;
      }>>`
        SELECT
          DATE_TRUNC('week', tanggal) as week,
          ROUND(AVG(a_pct)::numeric, 1) as avg_efficiency,
          COUNT(*) as record_count
        FROM "WeavingRecord"
        WHERE tanggal >= ${eightWeeksAgo}
        GROUP BY DATE_TRUNC('week', tanggal)
        ORDER BY week ASC
      `;
      const weeklyEfficiency = weeklyEfficiencyRaw.map(w => ({
        week: w.week.toISOString(),
        avg_efficiency: Number(w.avg_efficiency),
        record_count: Number(w.record_count),
      }));

      // NEW: Machine Efficiency Today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const machineEfficiencyTodayRaw = await prisma.$queryRaw<Array<{
        machine: string;
        avg_efficiency: number;
        record_count: bigint;
      }>>`
        SELECT
          machine,
          ROUND(AVG(a_pct)::numeric, 1) as avg_efficiency,
          COUNT(*) as record_count
        FROM "WeavingRecord"
        WHERE tanggal >= ${today} AND tanggal < ${tomorrow}
        GROUP BY machine
        ORDER BY machine ASC
      `;
      const machineEfficiencyToday = machineEfficiencyTodayRaw.map(m => ({
        machine: m.machine,
        avg_efficiency: Number(m.avg_efficiency),
        record_count: Number(m.record_count),
      }));

      // NEW: Low Efficiency Machines (last 7 days, avg < 70%)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const lowEfficiencyMachinesRaw = await prisma.$queryRaw<Array<{
        machine: string;
        avg_efficiency: number;
      }>>`
        SELECT
          machine,
          ROUND(AVG(a_pct)::numeric, 1) as avg_efficiency
        FROM "WeavingRecord"
        WHERE tanggal >= ${sevenDaysAgo}
        GROUP BY machine
        HAVING AVG(a_pct) < 70
        ORDER BY avg_efficiency ASC
      `;
      const lowEfficiencyMachines = lowEfficiencyMachinesRaw.map(m => ({
        machine: m.machine,
        avg_efficiency: Number(m.avg_efficiency),
      }));

      // NEW: Warping Queue (PENDING_APPROVAL count)
      const warpingQueue = await prisma.salesContract.count({
        where: { pipeline_status: 'PENDING_APPROVAL' },
      });

      // NEW: Stale Orders (active stage, tgl > 7 days ago — top 5 oldest)
      const staleOrders = await prisma.salesContract.findMany({
        where: {
          pipeline_status: {
            notIn: ['PENDING_APPROVAL', 'COMPLETE', 'REJECTED'],
          },
          tgl: { lte: sevenDaysAgo },
        },
        orderBy: { tgl: 'asc' },
        take: 5,
        select: { kp: true, pipeline_status: true, tgl: true },
      });

      // NEW: Top Customers
      const topCustomersRaw = await prisma.$queryRaw<Array<{
        customer: string;
        count: bigint;
      }>>`
        SELECT permintaan as customer, COUNT(*) as count
        FROM "SalesContract"
        WHERE permintaan IS NOT NULL AND permintaan != ''
        GROUP BY permintaan
        ORDER BY count DESC
        LIMIT 5
      `;
      const topCustomers = topCustomersRaw.map(c => ({
        customer: c.customer,
        count: Number(c.count),
      }));

      // NEW: Avg Cycle Time
      const avgCycleTimeRaw = await prisma.$queryRaw<Array<{
        contract_to_warping: number | null;
        warping_to_indigo: number | null;
        indigo_to_weaving: number | null;
      }>>`
        WITH 
        sc_warp AS (
          SELECT sc.kp, sc.tgl as sc_tgl, wr.tgl as warp_tgl
          FROM "SalesContract" sc
          JOIN "WarpingRun" wr ON LOWER(TRIM(sc.kp)) = LOWER(TRIM(wr.kp))
          WHERE sc.pipeline_status = 'COMPLETE'
        ),
        warp_indigo AS (
          SELECT sc.kp, wr.tgl as warp_tgl, ir.tgl as indigo_tgl
          FROM "SalesContract" sc
          JOIN "WarpingRun" wr ON LOWER(TRIM(sc.kp)) = LOWER(TRIM(wr.kp))
          JOIN "IndigoRun" ir ON LOWER(TRIM(sc.kp)) = LOWER(TRIM(ir.kp))
          WHERE sc.pipeline_status = 'COMPLETE'
        ),
        indigo_weave AS (
          SELECT sc.kp, ir.tgl as indigo_tgl, MIN(wr.tgl) as weave_tgl
          FROM "SalesContract" sc
          JOIN "IndigoRun" ir ON LOWER(TRIM(sc.kp)) = LOWER(TRIM(ir.kp))
          JOIN "WeavingRecord" wr ON LOWER(TRIM(sc.kp)) = LOWER(TRIM(wr.kp))
          WHERE sc.pipeline_status = 'COMPLETE'
          GROUP BY sc.kp, ir.tgl
        )
        SELECT 
          (SELECT AVG(DATE_PART('day', warp_tgl - sc_tgl)) FROM sc_warp) as contract_to_warping,
          (SELECT AVG(DATE_PART('day', indigo_tgl - warp_tgl)) FROM warp_indigo) as warping_to_indigo,
          (SELECT AVG(DATE_PART('day', weave_tgl - indigo_tgl)) FROM indigo_weave) as indigo_to_weaving
      `;
      const avgCycleTime = {
        contract_to_warping: avgCycleTimeRaw[0]?.contract_to_warping != null 
          ? Number(avgCycleTimeRaw[0].contract_to_warping) 
          : null,
        warping_to_indigo: avgCycleTimeRaw[0]?.warping_to_indigo != null 
          ? Number(avgCycleTimeRaw[0].warping_to_indigo) 
          : null,
        indigo_to_weaving: avgCycleTimeRaw[0]?.indigo_to_weaving != null 
          ? Number(avgCycleTimeRaw[0].indigo_to_weaving) 
          : null,
      };

      // Most recent 5 orders at each active stage (kept for backward compat)
      const activeStages = ['PENDING_APPROVAL', 'WARPING',
        'INDIGO', 'WEAVING', 'INSPECT_GRAY'];

      const recentByStage: Record<string, any[]> = {};
      for (const stage of activeStages) {
        recentByStage[stage] = await prisma.salesContract.findMany({
          where: { pipeline_status: stage },
          orderBy: { tgl: 'desc' },
          take: 5,
          select: {
            kp: true,
            tgl: true,
            codename: true,
            permintaan: true,
            kat_kode: true,
            te: true,
          },
        });
      }

      // Calculate in-progress (not COMPLETE/REJECTED)
      const inProgress = total - (stageCounts.find(s => s.pipeline_status === 'COMPLETE')?._count.pipeline_status ?? 0)
        - (stageCounts.find(s => s.pipeline_status === 'REJECTED')?._count.pipeline_status ?? 0);

      // NEW: Recent Activity — last 5 SalesContracts by updated_at
      const recentActivityRaw = await prisma.salesContract.findMany({
        orderBy: { updated_at: 'desc' },
        take: 5,
        select: {
          kp: true,
          pipeline_status: true,
          updated_at: true,
          codename: true,
        },
      });
      const recentActivity = recentActivityRaw.map(sc => ({
        kp: sc.kp,
        pipeline_status: sc.pipeline_status,
        updatedAt: sc.updated_at.toISOString(),
        codename: sc.codename,
      }));

      return res.json({
        total,
        inProgress,
        recentlyCompleted,
        blockedCount,
        stageCounts: Object.fromEntries(
          stageCounts.map(s => [
            s.pipeline_status,
            s._count.pipeline_status,
          ])
        ),
        typeCounts: Object.fromEntries(
          typeCounts.map(t => [
            t.status ?? 'UNKNOWN',
            t._count.status,
          ])
        ),
        recentByStage,
        weeklyEfficiency,
        machineEfficiencyToday,
        lowEfficiencyMachines,
        warpingQueue,
        staleOrders,
        topCustomers,
        avgCycleTime,
        recentActivity,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
);

// GET /api/denim/admin/throughput
// Returns pipeline stage transition counts grouped by period bucket
router.get('/admin/throughput',
  requireAuth,
  requireRole('admin', 'jakarta'),
  async (req: Request, res: Response) => {
    try {
      const { period = 'week', from, to } = req.query as {
        period?: 'day' | 'week' | 'month';
        from?: string;
        to?: string;
      };

      if (!['day', 'week', 'month'].includes(period)) {
        return res.status(400).json({ error: "period must be 'day', 'week', or 'month'" });
      }

      // Determine date range
      let fromDate: Date;
      let toDate: Date;

      if (from && to) {
        fromDate = new Date(from);
        toDate = new Date(to);
      } else if (period === 'day') {
        fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - 29);
        toDate = new Date();
      } else if (period === 'week') {
        fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - 12 * 7);
        toDate = new Date();
      } else {
        fromDate = new Date();
        fromDate.setMonth(fromDate.getMonth() - 11);
        fromDate.setDate(1);
        toDate = new Date();
      }

      // Map period to PostgreSQL date_trunc unit
      const truncUnit = period === 'day' ? 'day' : period === 'week' ? 'week' : 'month';

      const raw = await prisma.$queryRaw<Array<{
        bucket: Date;
        to_stage: string;
        count: bigint;
      }>>`
        SELECT
          DATE_TRUNC(${truncUnit}, created_at) AS bucket,
          to_stage,
          COUNT(*)::bigint AS count
        FROM "PipelineEvent"
        WHERE created_at >= ${fromDate} AND created_at <= ${toDate}
        GROUP BY DATE_TRUNC(${truncUnit}, created_at), to_stage
        ORDER BY bucket ASC, to_stage ASC
      `;

      if (!raw || raw.length === 0) {
        return res.json({ period, data: [] });
      }

      const data = raw.map(row => ({
        bucket: row.bucket.toISOString(),
        stage: row.to_stage,
        count: Number(row.count),
      }));

      return res.json({ period, data });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
);

// GET /api/denim/admin/pipeline/:kp
// Returns full pipeline detail for a single KP (admin only)
router.get('/admin/pipeline/:kp',
  requireAuth,
  requireRole('admin', 'jakarta', 'factory'),
  async (req: Request, res: Response) => {
    try {
      const { kp } = req.params;
      const kpUpper = kp.toUpperCase();

      // Use case-insensitive search using where clause with contains
      // First try exact match (case-insensitive)
      const [sc, warping, indigo, weaving, weavingAll, inspectGray, bbsfWashing, bbsfSanfor, inspectFinish] =
        await Promise.all([
          prisma.salesContract.findFirst({
            where: {
              OR: [
                { kp: { equals: kp, mode: 'insensitive' } },
                { kp: { equals: kpUpper } }
              ]
            }
          }),
          prisma.warpingRun.findFirst({
            where: {
              OR: [
                { kp: { equals: kp, mode: 'insensitive' } },
                { kp: { equals: kpUpper } }
              ]
            },
            include: { beams: true },
          }),
          prisma.indigoRun.findFirst({
            where: {
              OR: [
                { kp: { equals: kp, mode: 'insensitive' } },
                { kp: { equals: kpUpper } }
              ]
            },
          }),
          prisma.weavingRecord.findMany({
            where: {
              OR: [
                { kp: { equals: kp, mode: 'insensitive' } },
                { kp: { equals: kpUpper } }
              ]
            },
            orderBy: { tanggal: 'desc' },
            take: 50,
          }),
          prisma.weavingRecord.findMany({
            where: {
              OR: [
                { kp: { equals: kp, mode: 'insensitive' } },
                { kp: { equals: kpUpper } }
              ]
            },
            select: { a_pct: true, meters: true, machine: true, tanggal: true },
            orderBy: { tanggal: 'asc' },
          }),
          prisma.inspectGrayRecord.findMany({
            where: {
              OR: [
                { kp: { equals: kp, mode: 'insensitive' } },
                { kp: { equals: kpUpper } }
              ]
            },
            orderBy: { tg: 'asc' },
          }),
          prisma.bBSFWashingRun.findMany({
            where: {
              OR: [
                { kp: { equals: kp, mode: 'insensitive' } },
                { kp: { equals: kpUpper } }
              ]
            },
            orderBy: { tgl: 'asc' },
          }),
          prisma.bBSFSanforRun.findMany({
            where: {
              OR: [
                { kp: { equals: kp, mode: 'insensitive' } },
                { kp: { equals: kpUpper } }
              ]
            },
            orderBy: [{ tgl: 'asc' }, { sanfor_type: 'asc' }],
          }),
          prisma.inspectFinishRecord.findMany({
            where: {
              OR: [
                { kp: { equals: kp, mode: 'insensitive' } },
                { kp: { equals: kpUpper } }
              ]
            },
            orderBy: { tgl: 'asc' },
          }),
        ]);

      if (!sc) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Compute weaving summary from all records
      // Note: a_pct and meters may be stored as strings, so we parse them
      const validEff = weavingAll.filter(r => {
        const val = r.a_pct != null ? parseFloat(String(r.a_pct)) : null;
        return val != null && !isNaN(val);
      });
      const weavingSummary = weavingAll.length === 0 ? null : {
        totalRecords: weavingAll.length,
        avgEfficiency: validEff.length > 0
          ? validEff.reduce((s, r) => s + (parseFloat(String(r.a_pct)) ?? 0), 0) / validEff.length
          : null,
        totalMeters: weavingAll.reduce((s, r) => s + (parseFloat(String(r.meters)) ?? 0), 0),
        uniqueMachines: new Set(weavingAll.map(r => r.machine).filter(Boolean)).size,
        firstDate: weavingAll[0].tanggal,
        lastDate: weavingAll[weavingAll.length - 1].tanggal,
      };

      return res.json({ sc, warping, indigo, weaving, weavingSummary, inspectGray, bbsfWashing, bbsfSanfor, inspectFinish });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
);

// GET /api/denim/admin/kp-search
// Search KPs with filters, returns results with pipeline status
router.get('/admin/kp-search',
  requireAuth,
  requireRole('admin'),
  requireRole('admin'),
  async (req: Request, res: Response) => {
    try {
      const { q, codename, kat_kode, from, to, limit = '20' } = req.query;
      const limitNum = parseInt(limit as string) || 20;
      const searchTerm = q ? (q as string).toLowerCase() : null;
      const codenameFilter = codename && codename !== 'all' ? codename as string : null;
      const katKodeFilter = kat_kode && kat_kode !== 'all' ? kat_kode as string : null;

      // Build search condition
      const searchCondition = searchTerm 
        ? Prisma.sql`AND (LOWER(sc.kp) LIKE ${'%' + searchTerm + '%'} 
           OR LOWER(sc.codename) LIKE ${'%' + searchTerm + '%'} 
           OR LOWER(sc.ket_warna) LIKE ${'%' + searchTerm + '%'})`
        : Prisma.empty;
      
      const codenameCondition = codenameFilter 
        ? Prisma.sql`AND sc.codename = ${codenameFilter}`
        : Prisma.empty;
      
      const katKodeCondition = katKodeFilter 
        ? Prisma.sql`AND sc.kat_kode = ${katKodeFilter}`
        : Prisma.empty;

      // Date range condition
      const fromDate = from ? new Date(from as string) : null;
      const toDate = to ? new Date(to as string) : null;
      const fromCondition = fromDate 
        ? Prisma.sql`AND sc.tgl >= ${fromDate}::date`
        : Prisma.empty;
      const toCondition = toDate 
        ? Prisma.sql`AND sc.tgl <= ${toDate}::date`
        : Prisma.empty;

      // Main query with LEFT JOINs - use DISTINCT to avoid duplicate KPs
      const resultsRaw = await prisma.$queryRaw<Array<{
        kp: string;
        codename: string;
        kat_kode: string;
        ket_warna: string | null;
        tgl: Date;
        pipeline_status: string;
        has_warping: boolean;
        has_indigo: boolean;
        weaving_count: bigint;
        avg_efficiency: number | null;
      }>>`
        SELECT DISTINCT
          sc.kp,
          sc.codename,
          sc.kat_kode,
          sc.ket_warna,
          sc.tgl,
          sc.pipeline_status,
          CASE WHEN wr.kp IS NOT NULL THEN true ELSE false END as has_warping,
          CASE WHEN ir.kp IS NOT NULL THEN true ELSE false END as has_indigo,
          COALESCE(weave_cnt.cnt, 0)::bigint as weaving_count,
          weave_cnt.avg_eff as avg_efficiency
        FROM "SalesContract" sc
        LEFT JOIN "WarpingRun" wr ON LOWER(TRIM(wr.kp)) = LOWER(TRIM(sc.kp))
        LEFT JOIN "IndigoRun" ir ON LOWER(TRIM(ir.kp)) = LOWER(TRIM(sc.kp))
        LEFT JOIN (
          SELECT kp, COUNT(*) as cnt, AVG(a_pct) as avg_eff 
          FROM "WeavingRecord" GROUP BY kp
        ) weave_cnt ON LOWER(TRIM(weave_cnt.kp)) = LOWER(TRIM(sc.kp))
        WHERE 1=1 ${searchCondition} ${codenameCondition} ${katKodeCondition} ${fromCondition} ${toCondition}
        ORDER BY sc.tgl DESC
        LIMIT ${limitNum}
      `;

      // Get distinct codenames for dropdown
      const codenamesRaw = await prisma.$queryRaw<Array<{ codename: string }>>`
        SELECT DISTINCT codename FROM "SalesContract" WHERE codename IS NOT NULL ORDER BY codename
      `;

      // Get distinct kat_kode for dropdown
      const katKodesRaw = await prisma.$queryRaw<Array<{ kat_kode: string }>>`
        SELECT DISTINCT kat_kode FROM "SalesContract" WHERE kat_kode IS NOT NULL ORDER BY kat_kode
      `;

      const results = resultsRaw.map(r => ({
        kp: r.kp,
        codename: r.codename,
        kat_kode: r.kat_kode,
        ket_warna: r.ket_warna,
        tgl: r.tgl.toISOString(),
        pipeline_status: r.pipeline_status,
        has_warping: r.has_warping,
        has_indigo: r.has_indigo,
        weaving_count: Number(r.weaving_count),
        avg_efficiency: r.avg_efficiency != null ? Number(r.avg_efficiency) : null,
      }));

      return res.json({
        results,
        codenameOptions: codenamesRaw.map(c => c.codename),
        katKodeOptions: katKodesRaw.map(k => k.kat_kode),
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
);

// GET /api/denim/admin/kp-archive
// Returns archived (rejected) KP codes with optional search
router.get('/admin/kp-archive', requireAuth, requireRole('admin', 'jakarta'), async (req, res) => {
  try {
    const q = req.query.q as string | undefined;
    const where: any = {
      kp: { startsWith: 'kp_archived_' },
    };
    if (q) {
      where.kp = { startsWith: 'kp_archived_', contains: q.toUpperCase() };
    }
    const archived = await prisma.salesContract.findMany({
      where,
      orderBy: { tgl: 'desc' },
    });
    // Strip the prefix for display
    const result = archived.map(sc => ({
      ...sc,
      original_kp: sc.kp.replace('kp_archived_', ''),
    }));
    res.json(result);
  } catch (err) {
    console.error('kp-archive error:', err);
    res.status(500).json({ error: 'Failed to fetch archive' });
  }
});

// ─── ANALYTICS ROUTES ─────────────────────────────────────────────────────

// GET /api/denim/analytics/overview
// Returns factory-wide analytics (admin/jakarta only)
router.get('/analytics/overview',
  requireAuth,
  requireRole('admin', 'jakarta'),
  async (req: Request, res: Response) => {
    try {
      // Total counts
      const [totalSC, totalWarping, totalIndigo] = await Promise.all([
        prisma.salesContract.count(),
        prisma.warpingRun.count(),
        prisma.indigoRun.count(),
      ]);

      // Average warping efficiency
      const warpingAvg = await prisma.warpingRun.aggregate({
        _avg: { eff_warping: true },
      });

      // Average putusan per beam
      const beamStats = await prisma.warpingBeam.aggregate({
        _avg: { putusan: true },
      });

      // Top 10 fabric codes by count
      const topFabricCodes = await prisma.salesContract.groupBy({
        by: ['codename'],
        _count: true,
        orderBy: { _count: { codename: 'desc' } },
        take: 10,
        where: { codename: { not: null } },
      });

      // Monthly volume - last 12 months
      const monthlyVolumeRaw = await prisma.$queryRaw<{ month: Date; count: bigint }[]>`
        SELECT DATE_TRUNC('month', tgl) as month, COUNT(*)::bigint as count
        FROM "SalesContract"
        GROUP BY DATE_TRUNC('month', tgl)
        ORDER BY month DESC
        LIMIT 12
      `;

      const monthlyVolume = monthlyVolumeRaw.map(m => ({
        month: m.month.toISOString().slice(0, 7), // YYYY-MM format
        count: Number(m.count),
      })).reverse(); // Oldest first for chart

      // Stage distribution
      const stageCounts = await prisma.salesContract.groupBy({
        by: ['pipeline_status'],
        _count: { pipeline_status: true },
      });

      const stageDistribution = Object.fromEntries(
        stageCounts.map(s => [s.pipeline_status, s._count.pipeline_status])
      );

      return res.json({
        totalSC,
        totalWarping,
        totalIndigo,
        avgEffWarping: warpingAvg._avg.eff_warping ?? 0,
        avgPutusanPerBeam: beamStats._avg.putusan ?? 0,
        topFabricCodes: topFabricCodes.map(f => ({
          codename: f.codename ?? 'Unknown',
          count: f._count,
        })),
        monthlyVolume,
        stageDistribution,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
);

// GET /api/denim/analytics/warping-quality
// Returns per-fabric average putusan rate (admin/jakarta only)
router.get('/analytics/warping-quality',
  requireAuth,
  requireRole('admin', 'jakarta'),
  async (req: Request, res: Response) => {
    try {
      // Query to get top 20 fabrics with avg putusan per beam
      const result = await prisma.$queryRaw<{
        codename: string;
        run_count: bigint;
        total_beams: bigint;
        total_putusan: bigint;
        avg_putusan_per_beam: number;
      }[]>`
        SELECT 
          sc.codename,
          COUNT(DISTINCT wr.id)::bigint as run_count,
          COUNT(wb.id)::bigint as total_beams,
          COALESCE(SUM(wb.putusan), 0)::bigint as total_putusan,
          CASE 
            WHEN COUNT(wb.id) > 0 
            THEN SUM(wb.putusan)::float / COUNT(wb.id)::float 
            ELSE 0 
          END as avg_putusan_per_beam
        FROM "SalesContract" sc
        LEFT JOIN "WarpingRun" wr ON wr.kp = sc.kp
        LEFT JOIN "WarpingBeam" wb ON wb.warping_run_id = wr.id
        WHERE sc.codename IS NOT NULL
        GROUP BY sc.codename
        ORDER BY run_count DESC
        LIMIT 20
      `;

      return res.json({
        data: result.map(r => ({
          codename: r.codename,
          runCount: Number(r.run_count),
          totalBeams: Number(r.total_beams),
          totalPutusan: Number(r.total_putusan),
          avgPutusanPerBeam: r.avg_putusan_per_beam,
        })),
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
);

// GET /api/denim/analytics/full
// Returns full analytics data with filters (admin/jakarta only)
router.get('/analytics/full',
  requireAuth,
  requireRole('admin', 'jakarta'),
  async (req: Request, res: Response) => {
    try {
      const { from, to, machine, kp } = req.query;

      // Default date range
      const fromDate = from ? new Date(from as string) : new Date('2025-01-01');
      const toDate = to ? new Date(to as string) : new Date();
      toDate.setHours(23, 59, 59, 999);

      // Build filter conditions using Prisma.sql
      const machineFilter = machine && machine !== 'all' ? Prisma.sql`AND machine = ${machine}` : Prisma.empty;
      const kpFilter = kp ? Prisma.sql`AND kp = ${kp}` : Prisma.empty;

      // 1. Weekly Efficiency
      const weeklyEfficiencyRaw = await prisma.$queryRaw<Array<{
        week: Date;
        avg_efficiency: number;
        record_count: bigint;
      }>>`
        SELECT
          DATE_TRUNC('week', tanggal) as week,
          ROUND(AVG(a_pct)::numeric, 1) as avg_efficiency,
          COUNT(*) as record_count
        FROM "WeavingRecord"
        WHERE tanggal >= ${fromDate} AND tanggal <= ${toDate} ${machineFilter} ${kpFilter}
        GROUP BY DATE_TRUNC('week', tanggal)
        ORDER BY week ASC
      `;
      const weeklyEfficiency = weeklyEfficiencyRaw.map(w => ({
        week: w.week.toISOString(),
        avg_efficiency: Number(w.avg_efficiency),
        record_count: Number(w.record_count),
      }));

      // 2. Weekly Production
      const weeklyProductionRaw = await prisma.$queryRaw<Array<{
        week: Date;
        total_meters: number;
        total_picks: number;
        record_count: bigint;
      }>>`
        SELECT
          DATE_TRUNC('week', tanggal) as week,
          ROUND(SUM(meters)::numeric, 0) as total_meters,
          ROUND(SUM(kpicks)::numeric, 0) as total_picks,
          COUNT(*) as record_count
        FROM "WeavingRecord"
        WHERE tanggal >= ${fromDate} AND tanggal <= ${toDate} ${machineFilter} ${kpFilter}
        GROUP BY DATE_TRUNC('week', tanggal)
        ORDER BY week ASC
      `;
      const weeklyProduction = weeklyProductionRaw.map(w => ({
        week: w.week.toISOString(),
        total_meters: Number(w.total_meters),
        total_picks: Number(w.total_picks),
        record_count: Number(w.record_count),
      }));

      // 3. Monthly Chemicals (IndigoRun)
      const monthlyChemicalsRaw = await prisma.$queryRaw<Array<{
        month: Date;
        avg_indigo: number;
        avg_caustic: number;
        avg_hydro: number;
        record_count: bigint;
      }>>`
        SELECT
          DATE_TRUNC('month', tgl) as month,
          ROUND(AVG(indigo)::numeric, 2) as avg_indigo,
          ROUND(AVG(caustic)::numeric, 2) as avg_caustic,
          ROUND(AVG(hydro)::numeric, 2) as avg_hydro,
          COUNT(*) as record_count
        FROM "IndigoRun"
        WHERE tgl >= ${fromDate} AND tgl <= ${toDate}
        GROUP BY DATE_TRUNC('month', tgl)
        ORDER BY month ASC
      `;
      const monthlyChemicals = monthlyChemicalsRaw.map(m => ({
        month: m.month.toISOString(),
        avg_indigo: Number(m.avg_indigo),
        avg_caustic: Number(m.avg_caustic),
        avg_hydro: Number(m.avg_hydro),
        record_count: Number(m.record_count),
      }));

      // 4. Cycle Time Distribution (fixed: can't nest aggregates, handle interval)
      const kpFilterForSc = kp ? Prisma.sql`AND sc.kp = ${kp}` : Prisma.empty;
      const cycleTimeRaw = await prisma.$queryRaw<Array<{
        kp: string;
        days_contract_to_weaving: number | null;
      }>>`
        SELECT 
          sc.kp,
          AVG(EXTRACT(EPOCH FROM (first_weave.tgl - sc.tgl))/86400) as days_contract_to_weaving
        FROM "SalesContract" sc
        JOIN (
          SELECT kp, MIN(tgl) as tgl FROM "WeavingRecord" WHERE tgl IS NOT NULL GROUP BY kp
        ) first_weave ON LOWER(TRIM(sc.kp)) = LOWER(TRIM(first_weave.kp))
        WHERE sc.tgl >= ${fromDate} AND sc.tgl <= ${toDate} ${kpFilterForSc}
          AND first_weave.tgl IS NOT NULL
        GROUP BY sc.kp
        ORDER BY sc.kp ASC
      `;
      const cycleTimeDistribution = cycleTimeRaw.map(c => ({
        kp: c.kp,
        days_contract_to_weaving: c.days_contract_to_weaving != null 
          ? Number(c.days_contract_to_weaving) 
          : null,
      }));

      // 5. Machine List
      const machineListRaw = await prisma.$queryRaw<Array<{ machine: string }>>`
        SELECT DISTINCT machine FROM "WeavingRecord"
        WHERE machine IS NOT NULL
        ORDER BY machine ASC
      `;
      const machineList = machineListRaw.map(m => m.machine);

      // 6. Efficiency by Machine
      const efficiencyByMachineRaw = await prisma.$queryRaw<Array<{
        machine: string;
        avg_efficiency: number;
        record_count: bigint;
      }>>`
        SELECT
          machine,
          ROUND(AVG(a_pct)::numeric, 1) as avg_efficiency,
          COUNT(*) as record_count
        FROM "WeavingRecord"
        WHERE tanggal >= ${fromDate} AND tanggal <= ${toDate} ${kpFilter}
        GROUP BY machine
        ORDER BY machine ASC
      `;
      const efficiencyByMachine = efficiencyByMachineRaw.map(m => ({
        machine: m.machine,
        avg_efficiency: Number(m.avg_efficiency),
        record_count: Number(m.record_count),
      }));

      // 7. BBSF Stats — per week for last 8 weeks
      // Sanfor susut by week and sanfor_type (handle non-numeric values)
      const bbsfSanforStatsRaw = await prisma.$queryRaw<Array<{
        week: Date;
        sanfor_type: string;
        avg_susut: number | null;
        record_count: bigint;
      }>>`
        SELECT
          week,
          sanfor_type,
          ROUND(AVG(susut_nullfree)::numeric, 2) as avg_susut,
          COUNT(*) as record_count
        FROM (
          SELECT
            DATE_TRUNC('week', tgl)::date as week,
            sanfor_type,
            NULLIF(SUBSTRING(REGEXP_REPLACE(susut::text, '[^0-9.]', '', 'g') FROM '^[0-9]+'), '')::float as susut_nullfree
          FROM "BBSFSanforRun"
          WHERE tgl >= NOW() - INTERVAL '8 weeks'
            AND tgl IS NOT NULL
            AND susut IS NOT NULL
        ) sub
        WHERE susut_nullfree IS NOT NULL
        GROUP BY 1, 2
        ORDER BY 1, 2
      `;
      const bbsfSanforStats = bbsfSanforStatsRaw.map(s => ({
        week: s.week.toISOString(),
        sanfor_type: s.sanfor_type,
        avg_susut: s.avg_susut != null ? Number(s.avg_susut) : null,
        record_count: Number(s.record_count),
      }));

      // Washing avg speed by week (handle non-numeric speed values)
      const bbsfWashingStatsRaw = await prisma.$queryRaw<Array<{
        week: Date;
        avg_speed: number | null;
        record_count: bigint;
      }>>`
        SELECT
          week,
          ROUND(AVG(speed_nullfree)::numeric, 1) as avg_speed,
          COUNT(*) as record_count
        FROM (
          SELECT
            DATE_TRUNC('week', tgl)::date as week,
            NULLIF(SUBSTRING(REGEXP_REPLACE(speed, '[^0-9.]', '', 'g') FROM '^[0-9]+'), '')::float as speed_nullfree
          FROM "BBSFWashingRun"
          WHERE tgl >= NOW() - INTERVAL '8 weeks'
            AND tgl IS NOT NULL
            AND speed IS NOT NULL
        ) sub
        WHERE speed_nullfree IS NOT NULL
        GROUP BY 1
        ORDER BY 1
      `;
      const bbsfWashingStats = bbsfWashingStatsRaw.map(s => ({
        week: s.week.toISOString(),
        avg_speed: s.avg_speed != null ? Number(s.avg_speed) : null,
        record_count: Number(s.record_count),
      }));

      return res.json({
        weeklyEfficiency,
        weeklyProduction,
        monthlyChemicals,
        cycleTimeDistribution,
        machineList,
        efficiencyByMachine,
        bbsfSanforStats,
        bbsfWashingStats,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
);

// POST /api/denim/weaving-sync
// Receives weaving data from Python cron script every 8 hours
router.post('/weaving-sync', requireApiKey, async (req: Request, res: Response) => {
  const records = req.body;
  if (!Array.isArray(records) || records.length === 0) {
    res.status(400).json({ error: 'Expected non-empty array' });
    return;
  }
  try {
    let inserted = 0;
    let updated = 0;

    // Batch fetch all WarpingBeams for KPs in this batch
    const kpsInBatch = [...new Set(records.map((r: any) => r.kp))];
    const warpingBeams = await prisma.warpingBeam.findMany({
      where: { kp: { in: kpsInBatch } },
      select: { id: true, kp: true, beam_number: true }
    });
    const beamLookup = new Map(
      warpingBeams.map(b => [`${b.kp}::${b.beam_number}`, b.id])
    );

    for (const r of records) {
      // Fast lookup from Map (no DB call per record)
      const warping_beam_id = (r.beam_id && typeof r.beam_id === 'number')
        ? (beamLookup.get(`${r.kp}::${r.beam_id}`) ?? null)
        : null;

      const existing = await prisma.weavingRecord.findFirst({
        where: {
          kp: r.kp,
          tanggal: new Date(r.tanggal),
          shift: String(r.shift),
          machine: r.machine,
        }
      });
      await prisma.weavingRecord.upsert({
        where: { id: existing?.id ?? 0 },
        update: {
          warp_supplier: r.warp_supplier,
          sizing: r.sizing,
          kode_kain: r.kode_kain,
          operator: r.operator,
          a_pct: r.a_pct,
          p_pct: r.p_pct,
          rpm: r.rpm,
          kpicks: r.kpicks,
          meters: r.meters,
          warp_no: r.warp_no,
          warp_stop_hr: r.warp_stop_hr,
          warp_per_stop: r.warp_per_stop,
          weft_no: r.weft_no,
          weft_stop_hr: r.weft_stop_hr,
          weft_per_stop: r.weft_per_stop,
          bobbin_no: r.bobbin_no,
          bobbin_stop_hr: r.bobbin_stop_hr,
          bobbin_per_stop: r.bobbin_per_stop,
          stattempt_no: r.stattempt_no,
          stattempt_stop_hr: r.stattempt_stop_hr,
          stattempt_per_stop: r.stattempt_per_stop,
          other_stops_no: r.other_stops_no,
          other_stops_time: r.other_stops_time,
          long_stops_no: r.long_stops_no,
          long_stops_time: r.long_stops_time,
          m_s: r.m_s,
          b_hr: r.b_hr,
          source: 'TRIPUTRA',
          synced_at: new Date(),
          warping_beam_id: warping_beam_id,
        },
        create: {
          kp: r.kp,
          tanggal: new Date(r.tanggal),
          shift: String(r.shift),
          machine: r.machine,
          warp_supplier: r.warp_supplier,
          sizing: r.sizing,
          kode_kain: r.kode_kain,
          operator: r.operator,
          a_pct: r.a_pct,
          p_pct: r.p_pct,
          rpm: r.rpm,
          kpicks: r.kpicks,
          meters: r.meters,
          warp_no: r.warp_no,
          warp_stop_hr: r.warp_stop_hr,
          warp_per_stop: r.warp_per_stop,
          weft_no: r.weft_no,
          weft_stop_hr: r.weft_stop_hr,
          weft_per_stop: r.weft_per_stop,
          bobbin_no: r.bobbin_no,
          bobbin_stop_hr: r.bobbin_stop_hr,
          bobbin_per_stop: r.bobbin_per_stop,
          stattempt_no: r.stattempt_no,
          stattempt_stop_hr: r.stattempt_stop_hr,
          stattempt_per_stop: r.stattempt_per_stop,
          other_stops_no: r.other_stops_no,
          other_stops_time: r.other_stops_time,
          long_stops_no: r.long_stops_no,
          long_stops_time: r.long_stops_time,
          m_s: r.m_s,
          b_hr: r.b_hr,
          source: 'TRIPUTRA',
          synced_at: new Date(),
          warping_beam_id: warping_beam_id,
        }
      });
      existing ? updated++ : inserted++;
    }
    res.json({ ok: true, inserted, updated, total: records.length });
  } catch (err) {
    console.error('weaving-sync error:', err);
    res.status(500).json({ error: 'Sync failed' });
  }
});

// ============================================================================
// LIST VIEWS - Warping, Indigo, Weaving Records
// ============================================================================

// GET /api/denim/warping/records
// Returns paginated warping runs with filtering
router.get('/warping/records',
  requireAuth,
  requireRole('admin', 'factory', 'jakarta'),
  async (req: Request, res: Response) => {
  try {
    const kp = req.query.kp as string | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (kp) {
      where.kp = { contains: kp.toUpperCase(), mode: 'insensitive' };
    }

    const [data, total] = await Promise.all([
      prisma.warpingRun.findMany({
        where,
        orderBy: { tgl: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          kp: true,
          tgl: true,
          no_mc: true,
          rpm: true,
          total_beam: true,
          total_putusan: true,
          elongasi: true,
          strength: true,
          cv_pct: true,
          tension_badan: true,
          tension_pinggir: true,
        },
      }),
      prisma.warpingRun.count({ where }),
    ]);

    res.json({
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/denim/indigo/records
// Returns paginated indigo runs with filtering
router.get('/indigo/records',
  requireAuth,
  requireRole('admin', 'factory', 'jakarta'),
  async (req: Request, res: Response) => {
  try {
    const kp = req.query.kp as string | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (kp) {
      where.kp = { contains: kp.toUpperCase(), mode: 'insensitive' };
    }

    const [data, total] = await Promise.all([
      prisma.indigoRun.findMany({
        where,
        orderBy: { tanggal: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          kp: true,
          tanggal: true,
          mc: true,
          speed: true,
          bak_celup: true,
          indigo: true,
          caustic: true,
          hydro: true,
          strength: true,
          elongasi_idg: true,
        },
      }),
      prisma.indigoRun.count({ where }),
    ]);

    res.json({
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/denim/weaving/records
// Returns weaving summary grouped by KP (not individual shifts)
router.get('/weaving/records',
  requireAuth,
  requireRole('admin', 'factory', 'jakarta'),
  async (req: Request, res: Response) => {
  try {
    const kp = req.query.kp as string | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    // Build filter condition
    const kpFilter = kp 
      ? Prisma.sql`AND LOWER(TRIM(wr.kp)) LIKE ${'%' + kp.toLowerCase() + '%'}`
      : Prisma.empty;

    // Get total distinct KP count
    const countResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(DISTINCT wr.kp) as count
      FROM "WeavingRecord" wr
      WHERE 1=1 ${kpFilter}
    `;
    const total = Number(countResult[0]?.count || 0);

    // Get grouped data with pagination
    const dataRaw = await prisma.$queryRaw<Array<{
      kp: string;
      record_count: bigint;
      avg_efficiency: number;
      total_meters: number;
      machine_count: bigint;
      first_date: Date;
      last_date: Date;
    }>>`
      SELECT 
        wr.kp,
        COUNT(*) as record_count,
        ROUND(AVG(wr.a_pct)::numeric, 1) as avg_efficiency,
        ROUND(SUM(wr.meters)::numeric, 0) as total_meters,
        COUNT(DISTINCT wr.machine) as machine_count,
        MIN(wr.tanggal) as first_date,
        MAX(wr.tanggal) as last_date
      FROM "WeavingRecord" wr
      WHERE 1=1 ${kpFilter}
      GROUP BY wr.kp
      ORDER BY MAX(wr.tanggal) DESC
      LIMIT ${limit} OFFSET ${skip}
    `;

    const data = dataRaw.map(row => ({
      kp: row.kp,
      record_count: Number(row.record_count),
      avg_efficiency: Number(row.avg_efficiency) || 0,
      total_meters: Number(row.total_meters),
      machine_count: Number(row.machine_count),
      first_date: row.first_date?.toISOString() || null,
      last_date: row.last_date?.toISOString() || null,
    }));

    res.json({
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/denim/weaving-summary/:kp
// Returns machine breakdown and recent logs for a KP's weaving data
router.get('/weaving-summary/:kp',
  requireAuth,
  requireRole('admin', 'factory', 'jakarta'),
  async (req: Request, res: Response) => {
    try {
      const { kp } = req.params;

      // Machine breakdown
      const machinesRaw = await prisma.$queryRaw<Array<{
        machine: string;
        record_count: bigint;
        avg_a_pct: number;
        avg_p_pct: number;
        total_meters: number;
        first_date: Date;
        last_date: Date;
      }>>`
        SELECT
          COALESCE(machine, 'Unknown') as machine,
          COUNT(*)::bigint as record_count,
          ROUND(AVG(a_pct)::numeric, 1)::float as avg_a_pct,
          ROUND(AVG(p_pct)::numeric, 1)::float as avg_p_pct,
          ROUND(SUM(meters)::numeric, 0)::float as total_meters,
          MIN(tanggal) as first_date,
          MAX(tanggal) as last_date
        FROM "WeavingRecord"
        WHERE kp = ${kp}
        GROUP BY COALESCE(machine, 'Unknown')
        ORDER BY total_meters DESC
      `;

      const machines = machinesRaw.map(r => ({
        machine: r.machine,
        recordCount: Number(r.record_count),
        avgA: r.avg_a_pct || 0,
        avgP: r.avg_p_pct || 0,
        totalMeters: Number(r.total_meters),
        firstDate: r.first_date?.toISOString() || null,
        lastDate: r.last_date?.toISOString() || null,
      }));

      // Recent 10 datalog records
      const recentLogs = await prisma.$queryRaw<Array<{
        tanggal: Date;
        shift: string;
        machine: string;
        meters: Prisma.Decimal;
        a_pct: Prisma.Decimal;
        p_pct: Prisma.Decimal;
      }>>`
        SELECT tanggal, COALESCE(shift, '') as shift, COALESCE(machine, 'Unknown') as machine,
               meters, a_pct, p_pct
        FROM "WeavingRecord"
        WHERE kp = ${kp}
        ORDER BY tanggal DESC
        LIMIT 10
      `;

      const recentLogsFormatted = recentLogs.map(r => ({
        tanggal: r.tanggal?.toISOString() || null,
        shift: r.shift,
        machine: r.machine,
        meters: r.meters ? parseFloat(r.meters.toString()) : 0,
        a: r.a_pct ? parseFloat(r.a_pct.toString()) : null,
        p: r.p_pct ? parseFloat(r.p_pct.toString()) : null,
      }));

      // Grand totals
      const totalsRaw = await prisma.$queryRaw<Array<{ total_meters: Prisma.Decimal; total_a: number; days_active: bigint }>>`
        SELECT
          ROUND(SUM(meters)::numeric, 0)::float as total_meters,
          ROUND(AVG(a_pct)::numeric, 1)::float as total_a,
          COUNT(DISTINCT DATE(tanggal))::bigint as days_active
        FROM "WeavingRecord"
        WHERE kp = ${kp}
      `;
      const totals = totalsRaw[0] || { total_meters: 0, total_a: 0, days_active: 0 };

      res.json({
        machines,
        recentLogs: recentLogsFormatted,
        totalMeters: parseFloat(totalsRaw[0]?.total_meters?.toString() || '0'),
        avgEfficiency: machinesRaw.length > 0
          ? machinesRaw.reduce((s, r) => s + (r.avg_a_pct || 0), 0) / machinesRaw.length
          : null,
        daysActive: Number(totals.days_active || 0),
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
);

// Catch-all error handler — catches anything that escapes a route's try/catch
// (unexpected sync throws, middleware errors, etc.)
router.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[denim router error]', err);
  res.status(500).json({ error: err?.message || 'Internal server error' });
});

export default router;
