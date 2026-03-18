import { TableSkeleton } from '@/components/denim/Skeletons';

export default function Loading() {
  return (
    <div className="p-8">
      <TableSkeleton rows={8} cols={8} />
    </div>
  );
}
