'use client';

import { useState } from 'react';
import { FabricSpecPicker } from './new-order/FabricSpecPicker';
import { OrderFormFields } from './new-order/OrderFormFields';
import type { FabricSpec } from './new-order/types';
import PageHeader from '../layout/PageHeader';

export default function NewOrderPage() {
  const [spec, setSpec] = useState<FabricSpec | null>(null);

  return (
    <div>
      <PageHeader
        title="New Order"
        subtitle="Create a new sales contract and send it for approval"
      />
      <div className="px-4 sm:px-8 pb-8">
        <FabricSpecPicker
          selectedSpec={spec}
          onSelect={setSpec}
          onClear={() => setSpec(null)}
        />
        <div className="mt-3">
          <OrderFormFields spec={spec} />
        </div>
      </div>
    </div>
  );
}
