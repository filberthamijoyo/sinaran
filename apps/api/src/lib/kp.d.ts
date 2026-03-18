/**
 * KP Code System for Sinaran ERP
 *
 * Format: 4 characters
 * - Positions 1 & 2: A-Z (A=0 ... Z=25)
 * - Positions 3 & 4: QSDTELNJPB cipher (Q=0, S=1, D=2, T=3, E=4, L=5, N=6, J=7, P=8, B=9)
 *
 * Total capacity: 26 × 26 × 10 × 10 = 67,600 contracts
 */
/**
 * Encode a number (0-67599) to a KP code
 */
export declare function encodeKP(n: number): string;
/**
 * Decode a KP code to its number (0-67599)
 */
export declare function decodeKP(kp: string): number;
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
export declare function generateNextKP(prisma: any): Promise<string>;
//# sourceMappingURL=kp.d.ts.map