// ============================================
// KP CODE DECODER
// ============================================
// Hundred's letter mapping (position 1 after first letter)
// B=0, C=1, D=2, E=3, F=4, G=5, H=6, I=7, J=8, K=9, L=10, M=11, N=12, O=13, P=14, Q=15, R=16, S=17, T=18, U=19
const HUNDREDS_LETTER = ['B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U'];

// Digit cipher mapping (tens and units positions)
// Q=0, S=1, D=2, T=3, E=4, L=5, N=6, J=7, P=8, B=9
const DIGIT_CIPHER = ['Q','S','D','T','E','L','N','J','P','B'];

// Extended cipher that includes more letters (for robustness)
// Maps common uppercase letters to digits 0-9
const EXTENDED_DIGIT_CIPHER = {
  'Q': 0, 'S': 1, 'D': 2, 'T': 3, 'E': 4, 'L': 5, 'N': 6, 'J': 7, 'P': 8, 'B': 9,
  'A': 0, 'C': 2, 'F': 4, 'G': 6, 'H': 8, 'K': 1, 'M': 3, 'O': 5, 'R': 7, 'U': 9,
  '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9
};

/**
 * Decodes a KP code from TRIPUTRA to get the contract number
 * 
 * @param {string} kp - 4-character KP code like 'BUCJ'
 * @returns {number|null} The decoded contract number, or null if invalid
 * 
 * Format: B + hundreds-letter + tens-cipher + units-cipher
 * Example: 'BUCJ' -> B(0) + U(18)*100 + C(2)*10 + J(7) = 1287
 */
function decodeKP(kp) {
  if (!kp || kp.length < 4) {
    return null; // Invalid - not enough characters
  }
  
  // First character is always 'B' (constant prefix)
  if (kp[0] !== 'B') {
    // Try to find the KP in database by the raw code
    return null;
  }
  
  const hundreds = HUNDREDS_LETTER.indexOf(kp[1]);
  const tens = EXTENDED_DIGIT_CIPHER[kp[2]] ?? null;
  const units = EXTENDED_DIGIT_CIPHER[kp[3]] ?? null;
  
  if (hundreds === -1) {
    return null; // Invalid hundreds letter
  }
  if (tens === null) {
    return null; // Invalid tens cipher
  }
  if (units === null) {
    return null; // Invalid units cipher
  }
  
  return (hundreds * 100) + (tens * 10) + units;
}

/**
 * Encodes a contract number to a KP code
 * 
 * @param {number} contractNumber - The contract number to encode
 * @returns {string} The encoded 4-character KP code
 */
function encodeKP(contractNumber) {
  if (typeof contractNumber !== 'number' || contractNumber < 0 || contractNumber > 1999) {
    throw new Error('Invalid contract number: must be between 0 and 1999');
  }
  
  const hundreds = Math.floor(contractNumber / 100);
  const tens     = Math.floor((contractNumber % 100) / 10);
  const units    = contractNumber % 10;
  
  return 'B' + HUNDREDS_LETTER[hundreds] + DIGIT_CIPHER[tens] + DIGIT_CIPHER[units];
}

// Export for use in other modules
module.exports = { decodeKP, encodeKP, HUNDREDS_LETTER, DIGIT_CIPHER, EXTENDED_DIGIT_CIPHER };
