export interface CalculationInputs {
  countNeValue?: number;
  sliverRovingNe?: number;
  twistMultiplier?: number;
  meanNe?: number;
  meanStrengthCn?: number;
  thin50Percent?: number;
  thick50Percent?: number;
  neps200Percent?: number;
  neps280Percent?: number;
  thin40Percent?: number;
  thick35Percent?: number;
  neps140Percent?: number;
}

export interface CalculatedFields {
  totalDraft?: number;
  tpi?: number;
  tpm?: number;
  tenacityCnTex?: number;
  clsp?: number;
  ipis?: number;
  oeIpi?: number;
  shortIpi?: number;
}

export function calculateFields(inputs: CalculationInputs): CalculatedFields {
  const calculated: CalculatedFields = {};

  // Total Draft = Count NE / Sliver Roving Ne
  if (inputs.countNeValue && inputs.sliverRovingNe && inputs.sliverRovingNe !== 0) {
    calculated.totalDraft = inputs.countNeValue / inputs.sliverRovingNe;
  }

  // TPI = sqrt(Count NE) * Twist Multiplier
  if (inputs.countNeValue && inputs.twistMultiplier) {
    calculated.tpi = Math.sqrt(inputs.countNeValue) * inputs.twistMultiplier;
  }

  // TPM = TPI * 39.37
  if (calculated.tpi) {
    calculated.tpm = calculated.tpi * 39.37;
  }

  // Tenacity = Mean Ne * Mean Strength CN * 0.001693
  if (inputs.meanNe && inputs.meanStrengthCn) {
    calculated.tenacityCnTex = inputs.meanNe * inputs.meanStrengthCn * 0.001693;
  }

  // CLSP = ((Mean Strength CN / 0.9807) * 1.6934 * Mean Ne * 156.2) / 1000
  if (inputs.meanStrengthCn && inputs.meanNe) {
    calculated.clsp = ((inputs.meanStrengthCn / 0.9807) * 1.6934 * inputs.meanNe * 156.2) / 1000;
  }

  // IPIs = Thin-50% + Thick+50% + Neps+200%
  if (
    inputs.thin50Percent !== undefined ||
    inputs.thick50Percent !== undefined ||
    inputs.neps200Percent !== undefined
  ) {
    calculated.ipis = (inputs.thin50Percent || 0) + (inputs.thick50Percent || 0) + (inputs.neps200Percent || 0);
  }

  // OE IPI = Thin-50% + Thick+50% + Neps+280%
  if (
    inputs.thin50Percent !== undefined ||
    inputs.thick50Percent !== undefined ||
    inputs.neps280Percent !== undefined
  ) {
    calculated.oeIpi = (inputs.thin50Percent || 0) + (inputs.thick50Percent || 0) + (inputs.neps280Percent || 0);
  }

  // Short IPI = Thin-40% + Thick+35% + Neps+140%
  if (
    inputs.thin40Percent !== undefined ||
    inputs.thick35Percent !== undefined ||
    inputs.neps140Percent !== undefined
  ) {
    calculated.shortIpi = (inputs.thin40Percent || 0) + (inputs.thick35Percent || 0) + (inputs.neps140Percent || 0);
  }

  return calculated;
}
