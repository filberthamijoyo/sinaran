"use strict";
/**
 * Query functions for Indigo/Weaving (Denim) Division
 *
 * These are ready-to-use typed query functions that wrap Prisma's query engine.
 * Import and use these functions in your API routes or services.
 *
 * Usage:
 *   import { getFullPipeline, getWeavingByDateRange, ... } from './queries-denim';
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
exports.getFullPipeline = getFullPipeline;
exports.getWeavingByDateRange = getWeavingByDateRange;
exports.getInspectGrayByBeam = getInspectGrayByBeam;
exports.getMetersByKp = getMetersByKp;
exports.getActiveLoomStatus = getActiveLoomStatus;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.prisma = prisma;
/**
 * a) getFullPipeline
 *
 * Fetches the full pipeline for a KP by manually joining:
 * - SalesContract
 * - WarpingRun (via KP match)
 * - WarpingBeam (via WarpingRun)
 * - IndigoRun (via KP match)
 * - WeavingRecord (via KP match)
 *
 * @param kp - The KP (contract number) to search for
 * @returns Object with all pipeline data, or null if not found
 */
async function getFullPipeline(kp) {
    // Fetch from each table by KP (case-insensitive)
    const sc = await prisma.salesContract.findFirst({
        where: { kp: { equals: kp, mode: 'insensitive' } },
    });
    const warping = await prisma.warpingRun.findFirst({
        where: { kp: { equals: kp, mode: 'insensitive' } },
        include: {
            beams: true,
        },
    });
    const indigo = await prisma.indigoRun.findFirst({
        where: { kp: { equals: kp, mode: 'insensitive' } },
    });
    const weaving = await prisma.weavingRecord.findMany({
        where: { kp: { equals: kp, mode: 'insensitive' } },
        include: {
            warping_beam: true,
        },
    });
    const inspection = await prisma.inspectGrayRecord.findMany({
        where: { kp: { equals: kp, mode: 'insensitive' } },
        orderBy: { no_roll: 'asc' },
    });
    const bbsf = await prisma.bBSFRecord.findFirst({
        where: { kp: { equals: kp, mode: 'insensitive' } },
    });
    const inspectFinish = await prisma.inspectFinishRecord.findMany({
        where: { kp: { equals: kp, mode: 'insensitive' } },
        orderBy: { no_roll: 'asc' },
    });
    if (!sc) {
        return null;
    }
    return {
        sc,
        warping,
        indigo,
        weaving,
        inspection,
        bbsf,
        inspectFinish,
    };
}
/**
 * b) getWeavingByDateRange
 *
 * Fetches all WeavingRecords between two dates.
 *
 * @param startDate - Start of date range
 * @param endDate - End of date range
 * @returns Array of WeavingRecords with warping_beam relations
 */
async function getWeavingByDateRange(startDate, endDate) {
    return await prisma.weavingRecord.findMany({
        where: {
            tanggal: {
                gte: startDate,
                lte: endDate,
            },
        },
        include: {
            warping_beam: true,
        },
        orderBy: [
            { tanggal: 'asc' },
            { machine: 'asc' },
        ],
    });
}
/**
 * c) getInspectGrayByBeam
 *
 * Fetches all InspectGrayRecords for a given beam number.
 *
 * @param beamNumber - The beam number to search for
 * @returns Array of InspectGrayRecords with weaving_record relations
 */
async function getInspectGrayByBeam(beamNumber) {
    return await prisma.inspectGrayRecord.findMany({
        where: {
            bm: beamNumber,
        },
        include: {
            weaving_record: {
                select: {
                    machine: true,
                    shift: true,
                },
            },
        },
        orderBy: [
            { tg: 'asc' },
            { no_pot: 'asc' },
        ],
    });
}
/**
 * d) getMetersByKp
 *
 * Returns total actual_meters produced for a KP, plus count of rolls.
 *
 * @param kp - The KP (contract number)
 * @returns Object with total_meters (sum of actual_meters) and roll_count
 */
async function getMetersByKp(kp) {
    const result = await prisma.inspectGrayRecord.aggregate({
        where: {
            kp,
        },
        _sum: {
            actual_meters: true,
        },
        _count: {
            id: true,
        },
    });
    return {
        total_meters: result._sum.actual_meters ?? 0,
        roll_count: result._count.id,
    };
}
/**
 * e) getActiveLoomStatus
 *
 * Returns the latest WeavingRecord per machine.
 * Shows: machine, beam, kp, meters, tanggal, shift
 *
 * @returns Array of latest WeavingRecords per machine
 */
async function getActiveLoomStatus() {
    // Get the latest record ID per machine
    const latestRecords = await prisma.$queryRaw `
    SELECT wr.id, wr.machine
    FROM "WeavingRecord" wr
    INNER JOIN (
      SELECT machine, MAX(tanggal) as max_tanggal
      FROM "WeavingRecord"
      GROUP BY machine
    ) latest ON wr.machine = latest.machine AND wr.tanggal = latest.max_tanggal
    ORDER BY wr.machine ASC
  `;
    if (latestRecords.length === 0) {
        return [];
    }
    // Fetch full records for those IDs
    const latestIds = latestRecords.map((r) => r.id);
    return await prisma.weavingRecord.findMany({
        where: {
            id: {
                in: latestIds,
            },
        },
        select: {
            machine: true,
            beam: true,
            kp: true,
            meters: true,
            tanggal: true,
            shift: true,
        },
        orderBy: {
            machine: 'asc',
        },
    });
}
