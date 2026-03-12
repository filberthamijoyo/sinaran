import { Router, Request, Response } from 'express';
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
  (req: Request, res: Response) => {
  const job = getJob(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  return res.json(job);
});

// GET /api/denim/jobs
// List the last 50 import jobs
router.get('/jobs',
  requireAuth,
  (_req: Request, res: Response) => {
  return res.json(listJobs());
});

// ─── FABRIC SPEC ROUTES ─────────────────────────────────────────────────────

// GET /api/denim/fabric-specs/search?q=...
// Search fabric specs by kode (for autocomplete)
router.get('/fabric-specs/search',
  requireAuth,
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
router.get('/fabric-specs', requireAuth, async (req: Request, res: Response) => {
  try {
    const { q, kat_kode } = req.query as any;
    const specs = await prisma.fabricSpec.findMany({
      where: {
        ...(kat_kode ? { kat_kode } : {}),
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
    const spec = await prisma.fabricSpec.update({
      where: { id: Number(req.params.id) },
      data: req.body,
    });
    return res.json(spec);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/denim/sales-contracts
// Create a new sales contract (from New Order form)
router.post('/sales-contracts', requireAuth,
  async (req: Request, res: Response) => {
    try {
      const {
        tgl, permintaan, status, kat_kode, codename, kode,
        kons_kode, ket_warna, proses, te, catatan,
        pipeline_status, ne_lusi, ne_pakan, sisir, pick,
        anyaman, arah, oz_g, oz_f,
      } = req.body;

      if (!tgl || !kode) {
        return res.status(400).json({
          error: 'tgl and kode are required'
        });
      }

      // Auto-generate KP using the new KP code system
      const kp = await generateNextKP(prisma);
      const kp_sequence = decodeKP(kp);

      const sc = await prisma.salesContract.create({
        data: {
          kp,
          kp_sequence,
          kp_status: 'ACTIVE',
          tgl: new Date(tgl),
          permintaan: permintaan || null,
          status: status || 'SCN',
          kat_kode: kat_kode || null,
          codename: codename || null,
          kons_kode: kons_kode || null,
          ket_warna: ket_warna || null,
          proses: proses || 'PROSES',
          te: te ? parseInt(te) : null,
          pipeline_status: pipeline_status || 'PENDING_APPROVAL',
          acc: null,
        },
      });

      return res.status(201).json(sc);
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
      const { decision } = req.body as {
        decision: 'approve' | 'reject';
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
          }
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
      const sc = await prisma.salesContract.update({
        where: { kp },
        data: {
          pipeline_status: newStatus,
          acc: accValue,
          kp_status: 'ACTIVE',  // Mark as ACTIVE when approved
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

// ─── PRODUCTION INBOX ROUTES ──────────────────────────────────────────────────

// GET /api/denim/warping-inbox
// Returns sales contracts ready for warping (pipeline_status = 'WARPING')
router.get('/warping-inbox',
  requireAuth,
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
router.post('/weaving', requireAuth, async (req: Request, res: Response) => {
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

    return res.json({ ok: true, kp, pipeline_status: 'INSPECT_GRAY' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/denim/inspect-gray-inbox
// Returns sales contracts ready for inspect gray (pipeline_status = 'INSPECT_GRAY')
router.get('/inspect-gray-inbox',
  requireAuth,
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

// POST /api/denim/inspect-gray
// Creates inspect gray records (one per roll) and advances pipeline to 'COMPLETE'
router.post('/inspect-gray', requireAuth,
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

      // Mark as COMPLETE
      await prisma.salesContract.update({
        where: { kp },
        data: { pipeline_status: 'COMPLETE' },
      });

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
        topCustomers,
        avgCycleTime,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
);

// GET /api/denim/admin/pipeline/:kp
// Returns full pipeline detail for a single KP (admin only)
router.get('/admin/pipeline/:kp',
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const { kp } = req.params;
      const kpUpper = kp.toUpperCase();

      // Use case-insensitive search using where clause with contains
      // First try exact match (case-insensitive)
      const [sc, warping, indigo, weaving, weavingAll, inspection] =
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
            orderBy: { no_roll: 'asc' },
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

      return res.json({ sc, warping, indigo, weaving, weavingSummary, inspection });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
);

// GET /api/denim/admin/kp-search
// Search KPs with filters, returns results with pipeline status
router.get('/admin/kp-search',
  requireAuth,
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

      return res.json({
        weeklyEfficiency,
        weeklyProduction,
        monthlyChemicals,
        cycleTimeDistribution,
        machineList,
        efficiencyByMachine,
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
        orderBy: { tgl: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          kp: true,
          tgl: true,
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

export default router;
