import { notFound } from 'next/navigation'
import WarpingFormPage from '@/components/denim/WarpingFormPage'
import IndigoFormPage from '@/components/denim/IndigoFormPage'
import InspectGrayFormPage from '@/components/denim/InspectGrayFormPage'
import BBSFFormPage from '@/components/denim/BBSFFormPage'
import InspectFinishFormPage from '@/components/denim/InspectFinishFormPage'
import WeavingDetailPage from '@/components/denim/WeavingDetailPage'

interface Props {
  params: Promise<{ stage: string; kp: string }>
}

export default async function StageFormPage({ params }: Props) {
  const { stage, kp } = await params

  if (stage === 'warping')        return <WarpingFormPage kp={kp} />
  if (stage === 'indigo')         return <IndigoFormPage kp={kp} />
  if (stage === 'inspect-gray')   return <InspectGrayFormPage kp={kp} />
  if (stage === 'bbsf')           return <BBSFFormPage kp={kp} />
  if (stage === 'inspect-finish') return <InspectFinishFormPage kp={kp} />
  if (stage === 'weaving')        return <WeavingDetailPage kp={kp} />

  notFound()
}
