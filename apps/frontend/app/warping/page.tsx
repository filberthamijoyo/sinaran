import React from 'react';
import WarpingListPage from '../../components/WarpingListPage';
import { prisma } from '../../lib/server-prisma';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Warping',
};

async function getWarpingRecords() {
  const page = 1;
  const limit = 50;
  const skip = (page - 1) * limit;

  try {
    const [data, total] = await Promise.all([
      prisma.warpingRun.findMany({
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
      prisma.warpingRun.count(),
    ]);

    const serializedData = JSON.parse(JSON.stringify(data));

    return {
      data: serializedData,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch {
    return { data: [], total: 0, page, totalPages: 0 };
  }
}

export default async function WarpingPage() {
  const initialData = await getWarpingRecords();
  return <WarpingListPage initialData={initialData} />;
}
