import { Router, Request, Response } from 'express';
import multer from 'multer';
import { requireAuth, requireRole, requireApiKey } from '../middleware/auth';
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
router.get('/pipeline/:kp', async (req: Request, res: Response) => {
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
router.get('/weaving', async (req: Request, res: Response) => {
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
router.get('/sales-contracts', async (req: Request, res: Response) => {
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
router.get('/sales-contracts/:kp', async (req: Request, res: Response) => {
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
router.get('/inspect-gray/beam/:bm', async (req: Request, res: Response) => {
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
router.get('/meters/:kp', async (req: Request, res: Response) => {
  try {
    const result = await getMetersByKp(req.params.kp);
    return res.json({ kp: req.params.kp, ...result });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/denim/looms/status
// Returns the latest record per loom machine
router.get('/looms/status', async (_req: Request, res: Response) => {
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
router.get('/jobs/:id', (req: Request, res: Response) => {
  const job = getJob(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  return res.json(job);
});

// GET /api/denim/jobs
// List the last 50 import jobs
router.get('/jobs', (_req: Request, res: Response) => {
  return res.json(listJobs());
});

// ─── FABRIC SPEC ROUTES ─────────────────────────────────────────────────────

// GET /api/denim/fabric-specs/search?q=...
// Search fabric specs by kode (for autocomplete)
router.get('/fabric-specs/search', async (req: Request, res: Response) => {
  try {
    const q = String(req.query.q || '').trim().toUpperCase();
    if (!q || q.length < 2) return res.json({ items: [] });

    const items = await prisma.fabricSpec.findMany({
      where: {
        OR: [
          { kode: { contains: q, mode: 'insensitive' } },
          { item: { contains: q, mode: 'insensitive' } },
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
    return res.json({ items });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/denim/fabric-specs/:item
// Get full fabric spec by item key
router.get('/fabric-specs/:item', async (req: Request, res: Response) => {
  try {
    const item = decodeURIComponent(req.params.item);
    const spec = await prisma.fabricSpec.findUnique({ where: { item } });
    if (!spec) return res.status(404).json({ error: 'Not found' });
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

        // Archive the old record
        await prisma.salesContract.update({
          where: { kp },
          data: {
            kp_status: 'ARCHIVED',
            archived_at: new Date(),
            archived_kp: existing?.kp,
            pipeline_status: newStatus,
            acc: accValue,
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
        },
      });

      // Emit WebSocket notification to the creator
      // (In production, store creator userId on SC —
      //  for now broadcast to all connected bandung users)

      // Since we don't store creator_id yet, emit to user id '1'
      // (the bandung user). This will be replaced when we add
      // user management.
      notifyUser(
        '1', // bandung user id
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
router.get('/warping-inbox', async (req: Request, res: Response) => {
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
router.get('/indigo-inbox', async (req: Request, res: Response) => {
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
router.get('/weaving-inbox', async (req: Request, res: Response) => {
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
// Creates weaving records (one per loom) and advances pipeline to 'INSPECT_GRAY'
router.post('/weaving', requireAuth,
  async (req: Request, res: Response) => {
    try {
      const { kp, tgl, shift, looms, total_meter_out } = req.body;

      // WeavingRecord is many per KP — create one record per loom
      // First delete existing records for this KP+tgl combo
      const tglDate = tgl ? new Date(tgl) : new Date();
      await prisma.weavingRecord.deleteMany({
        where: { kp, tanggal: tglDate },
      });

      if (looms && Array.isArray(looms) && looms.length > 0) {
        await prisma.weavingRecord.createMany({
          data: looms.map((l: any) => ({
            kp,
            tanggal: tglDate,
            shift: shift || null,
            machine: l.no_mesin
              ? String(l.no_mesin)
              : null,
            beam: l.beam_no
              ? parseInt(l.beam_no)
              : null,
            kpicks: l.pick_actual
              ? parseInt(l.pick_actual)
              : null,
            meters: l.meter_out
              ? parseFloat(l.meter_out)
              : null,
            a_pct: l.efficiency
              ? parseFloat(l.efficiency)
              : null,
            operator: l.keterangan || null,
          })),
        });
      }

      await prisma.salesContract.update({
        where: { kp },
        data: { pipeline_status: 'INSPECT_GRAY' },
      });

      return res.json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
);

// GET /api/denim/inspect-gray-inbox
// Returns sales contracts ready for inspect gray (pipeline_status = 'INSPECT_GRAY')
router.get('/inspect-gray-inbox', async (req: Request, res: Response) => {
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

      // Most recent 5 orders at each active stage
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

      return res.json({
        total,
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
      const [sc, warping, indigo, weaving, inspection] =
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

      return res.json({ sc, warping, indigo, weaving, inspection });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
);

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
    for (const r of records) {
      // Try to find matching WarpingBeam by kp + beam_number
      let warping_beam_id: number | null = null;
      if (r.beam_id && typeof r.beam_id === 'number') {
        const beam = await prisma.warpingBeam.findFirst({
          where: { kp: r.kp, beam_number: r.beam_id }
        });
        if (beam) warping_beam_id = beam.id;
      }

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

export default router;
