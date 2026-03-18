import AdminOrdersPage from '../../../../components/denim/admin/AdminOrdersPage';
import { prisma } from '../../../../lib/server-prisma';

export const metadata = { title: 'All Orders — Sinaran ERP' };

async function getOrders() {
  const page = 1;
  const limit = 50;
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.salesContract.findMany({
      orderBy: { tgl: 'desc' },
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
    prisma.salesContract.count(),
  ]);

  // Serialize Prisma types to plain JS objects
  const serializedItems = JSON.parse(JSON.stringify(items));

  return {
    items: serializedItems,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

export default async function Page() {
  const initialData = await getOrders();
  return <AdminOrdersPage initialData={initialData} />;
}
