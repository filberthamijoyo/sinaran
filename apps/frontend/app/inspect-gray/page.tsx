'use client';

import dynamic from 'next/dynamic';

const InspectGrayDivisionPage = dynamic(
  () => import('../../components/InspectGrayDivisionPage') as any,
  { ssr: false },
);

export default function InspectGrayPage() {
  return <InspectGrayDivisionPage />;
}
