/**
 * KP Code System for Sinaran ERP
 * 
 * Format: 4 characters
 * - Positions 1 & 2: A-Z (A=0 ... Z=25)
 * - Positions 3 & 4: QSDTELNJPB cipher (Q=0, S=1, D=2, T=3, E=4, L=5, N=6, J=7, P=8, B=9)
 * 
 * Total capacity: 26 × 26 × 10 × 10 = 67,600 contracts
 */

// =============================================================================
// MODE CONFIGURATION - Switch between modes by changing this value
// =============================================================================
// MODE 1: "floor" - Find gaps in all historical KPs (legacy behavior)
// MODE 2: "capped" - Cap at BUEB (4610) and generate sequential KPs after that
const KP_GENERATION_MODE = 'capped' as const; // Change to 'floor' for legacy behavior

// For "capped" mode: The minimum sequence (BUEB = 4610)
// For "floor" mode: This value is calculated dynamically from the database
const BUEB_SEQUENCE = 4610; // BUEB = sequence 4610

// =============================================================================

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
 * MODE: "capped" (current default)
 * - Caps at BUEB (sequence 4610) as the minimum
 * - Finds the highest sequence at or above BUEB
 * - Returns the next sequential KP
 * - Simpler, no gap detection needed
 *
 * MODE: "floor" (legacy - commented out below)
 * - Find the floor — the lowest kp_sequence ever assigned in the DB.
 * - Find the ceiling — the highest kp_sequence currently in use.
 * - Get all sequences currently held by ACTIVE contracts
 * - Find the lowest gap at or above the floor.
 * - If no gaps found, go one above the ceiling.
 */
export async function generateNextKP(prisma: any): Promise<string> {
  if (KP_GENERATION_MODE === 'capped') {
    // =============================================================================
    // MODE: CAPPED (Simplified - caps at BUEB)
    // =============================================================================
    
    // Step 1: Find the highest sequence at or above BUEB (4610)
    const ceilResult = await prisma.salesContract.aggregate({
      _max: { kp_sequence: true },
      where: { 
        kp_sequence: { gte: BUEB_SEQUENCE },
      },
    });
    const highestSequence = ceilResult._max.kp_sequence ?? BUEB_SEQUENCE;

    // Step 2: Generate the next sequential KP
    const nextSequence = highestSequence + 1;
    if (nextSequence > 67599) throw new Error('KP sequence exhausted');
    
    return encodeKP(nextSequence);
  } else {
    // =============================================================================
    // MODE: FLOOR (Legacy - gap detection)
    // =============================================================================
    /*
    // Step 1: Find the floor — the lowest kp_sequence for ACTIVE contracts.
    // New KPs must never go below the lowest active sequence (archived slots can be recycled).
    const floorResult = await prisma.salesContract.aggregate({
      _min: { kp_sequence: true },
      where: { 
        kp_sequence: { not: null },
        kp_status: 'ACTIVE',
      },
    });
    const floor = floorResult._min.kp_sequence ?? 0;

    // Step 2: Find the ceiling — the highest kp_sequence for ACTIVE contracts.
    const ceilResult = await prisma.salesContract.aggregate({
      _max: { kp_sequence: true },
      where: { 
        kp_sequence: { not: null },
        kp_status: 'ACTIVE',
      },
    });
    const ceiling = ceilResult._max.kp_sequence ?? floor;

    // Step 3: Get ALL sequences currently in the database (including archived)
    // This ensures we don't try to reuse a sequence that's already taken
    // by any record, whether active, rejected, or archived
    const allSeqs = await prisma.salesContract.findMany({
      where: { kp_sequence: { not: null } },
      select: { kp_sequence: true },
    });
    const occupiedSet = new Set(allSeqs.map((r: any) => r.kp_sequence));

    // Step 4: Find the lowest gap at or above the floor
    for (let seq = floor; seq <= ceiling; seq++) {
      if (!occupiedSet.has(seq)) {
        if (seq > 67599) throw new Error('KP sequence exhausted');
        return encodeKP(seq);
      }
    }

    // Step 5: No gaps found — go one above the ceiling
    const next = ceiling + 1;
    if (next > 67599) throw new Error('KP sequence exhausted');
    return encodeKP(next);
    */
   
    // Fallback for floor mode if not uncommented above
    const ceilResult = await prisma.salesContract.aggregate({
      _max: { kp_sequence: true },
      where: { kp_sequence: { not: null } },
    });
    const highestSequence = ceilResult._max.kp_sequence ?? 0;
    const nextSequence = highestSequence + 1;
    if (nextSequence > 67599) throw new Error('KP sequence exhausted');
    return encodeKP(nextSequence);
  }
}
