/**
 * Backfill script for KP sequence numbers
 *
 * This script:
 * 1. Fetches all SalesContract records with a kp value
 * 2. Decodes each KP using decodeKP()
 * 3. Updates kp_sequence with the decoded integer
 * 4. Sets kp_status = 'ACTIVE' for all existing records
 * 5. Logs any KP codes that fail to decode (invalid format) — does NOT crash, just skips and logs
 *
 * Run: npx ts-node packages/prisma/backfill-kp-sequence.ts
 */
export {};
//# sourceMappingURL=backfill-kp-sequence.d.ts.map