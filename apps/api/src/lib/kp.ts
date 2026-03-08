/**
 * KP Code System for Sinaran ERP
 * 
 * Format: 4 characters
 * - Positions 1 & 2: A-Z (A=0 ... Z=25)
 * - Positions 3 & 4: QSDTELNJPB cipher (Q=0, S=1, D=2, T=3, E=4, L=5, N=6, J=7, P=8, B=9)
 * 
 * Total capacity: 26 × 26 × 10 × 10 = 67,600 contracts
 */

const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');       // A=0 ... Z=25
const DIGIT = ['Q', 'S', 'D', 'T', 'E', 'L', 'N', 'J', 'P', 'B'];  // Q=0 ... B=9

/**
 * Encode a number (0-67599) to a KP code
 */
export function encodeKP(n: number): string {
  if (n < 0 || n > 67599) throw new Error(`KP overflow: ${n}`);
  const p1 = Math.floor(n / 2600);        // 0–25
  const p2 = Math.floor((n % 2600) / 100); // 0–25
  const p3 = Math.floor((n % 100) / 10);   // 0–9
  const p4 = n % 10;                        // 0–9
  return ALPHA[p1] + ALPHA[p2] + DIGIT[p3] + DIGIT[p4];
}

/**
 * Decode a KP code to its number (0-67599)
 */
export function decodeKP(kp: string): number {
  if (!kp || kp.length !== 4) throw new Error(`Invalid KP: ${kp}`);
  const p1 = ALPHA.indexOf(kp[0].toUpperCase());
  const p2 = ALPHA.indexOf(kp[1].toUpperCase());
  const p3 = DIGIT.indexOf(kp[2].toUpperCase());
  const p4 = DIGIT.indexOf(kp[3].toUpperCase());
  if (p1 < 0 || p2 < 0 || p3 < 0 || p4 < 0) throw new Error(`Invalid KP: ${kp}`);
  return p1 * 2600 + p2 * 100 + p3 * 10 + p4;
}

// Test the encoder/decoder
function testKP() {
  console.log('=== KP Encoder/Decoder Tests ===');
  
  const testCases = [
    { input: 0, expected: 'AAQQ' },
    { input: 4620, expected: 'BUDQ' },
    { input: 4630, expected: 'BUTQ' },
    { input: 5199, expected: 'BZBB' },
    { input: 5200, expected: 'CAQQ' },
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const tc of testCases) {
    const result = encodeKP(tc.input);
    if (result === tc.expected) {
      console.log(`✓ encodeKP(${tc.input}) = ${result}`);
      passed++;
    } else {
      console.log(`✗ encodeKP(${tc.input}) = ${result}, expected ${tc.expected}`);
      failed++;
    }
  }
  
  const decodeCases = [
    { input: 'BUDQ', expected: 4620 },
    { input: 'BUDS', expected: 4621 },
    { input: 'BUDD', expected: 4622 },
    { input: 'AAQQ', expected: 0 },
    { input: 'CAQQ', expected: 5200 },
  ];
  
  for (const tc of decodeCases) {
    const result = decodeKP(tc.input);
    if (result === tc.expected) {
      console.log(`✓ decodeKP('${tc.input}') = ${result}`);
      passed++;
    } else {
      console.log(`✗ decodeKP('${tc.input}') = ${result}, expected ${tc.expected}`);
      failed++;
    }
  }
  
  console.log(`\nResults: ${passed} passed, ${failed} failed`);
}

// Run tests if this file is executed directly
if (require.main === module) {
  testKP();
}

/**
 * Returns the next available KP code for a new SalesContract.
 *
 * Rules:
 * 1. If there are any ARCHIVED slots with kp_sequence < current MAX,
 *    take the LOWEST one (fill the gap).
 * 2. Otherwise, take MAX(kp_sequence) + 1.
 *
 * This ensures:
 * - No gaps in the sequence
 * - Recycled KPs come from real rejected slots, not from sequence start
 * - The sequence always moves forward if no gaps exist
 */
export async function generateNextKP(prisma: any): Promise<string> {
  // Get the current maximum sequence number
  const maxResult = await prisma.salesContract.aggregate({
    _max: { kp_sequence: true },
    where: { 
      kp_status: { in: ['ACTIVE', 'ARCHIVED'] },
      kp_sequence: { not: null }
    }
  });
  const currentMax = maxResult._max.kp_sequence ?? -1;

  // Look for any archived (recycled) slot below the current max
  const recycled = await prisma.salesContract.findFirst({
    where: {
      kp_status: 'ARCHIVED',
      kp_sequence: { lt: currentMax }
    },
    orderBy: { kp_sequence: 'asc' }  // take the lowest gap first
  });

  const nextSequence = recycled ? recycled.kp_sequence! : currentMax + 1;

  if (nextSequence > 67599) throw new Error('KP sequence exhausted (max 67,600 reached)');

  return encodeKP(nextSequence);
}
