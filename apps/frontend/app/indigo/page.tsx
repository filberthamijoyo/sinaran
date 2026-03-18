import type { Metadata } from 'next';
import IndigoListPage from '../../components/IndigoListPage';
import { prisma } from '../../lib/server-prisma';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Indigo',
  description: 'Indigo database',
};

async function getIndigoRecords() {
  const page = 1;
  const limit = 50;
  const skip = (page - 1) * limit;

  try {
    const [data, total] = await Promise.all([
      prisma.indigoRun.findMany({
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
      prisma.indigoRun.count(),
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

export default async function IndigoPage() {
  const initialData = await getIndigoRecords();
  return <IndigoListPage initialData={initialData} />;
}
