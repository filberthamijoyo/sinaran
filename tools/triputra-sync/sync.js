/**
 * TRIPUTRA Sync Script
 * 
 * This script synchronizes weaving data from TRIPUTRA to the Sinaran ERP.
 * 
 * Required environment variables:
 *   TRIPUTRA_USER=your_username
 *   TRIPUTRA_PASS=your_password
 *   TRIPUTRA_BASE_URL=http://coffeeandjeans.net/tpti
 *   DATABASE_URL=postgresql://user:password@localhost:5432/erp_sinaran
 * 
 * Usage:
 *   npm install
 *   cp .env.example .env  # Then fill in credentials
 *   node sync.js
 * 
 * Run on cron (every 30 minutes):
 *   [See setup guide for cron configuration]
 */

// Load environment variables FIRST, before any other imports
require('dotenv').config();

const axios = require('axios');
// Point to the root node_modules where Prisma client is generated
const { PrismaClient } = require('../../node_modules/.prisma/client');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const { decodeKP } = require('./kp-decoder');

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
  baseUrl: process.env.TRIPUTRA_BASE_URL || 'http://coffeeandjeans.net/tpti',
  credentials: {
    username: process.env.TRIPUTRA_USER,
    password: process.env.TRIPUTRA_PASS
  },
  // The main page to fetch for live loom data
  dataPage: 'efficiency.php',
  // Backup pages to try if efficiency.php fails
  fallbackPages: ['production.php', 'overall_online.php'],
  // Session timeout in ms (25 minutes)
  sessionTimeout: 25 * 60 * 1000
};

// ============================================
// GLOBAL STATE
// ============================================

let prisma = null;
let axiosInstance = null;
let lastAuthTime = 0;

// ============================================
// UTILITY FUNCTIONS
// ============================================

function getPrisma() {
  if (!prisma) {
    prisma = new PrismaClient({
      log: ['error', 'warn']
    });
  }
  return prisma;
}

function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}`;
  console.log(logMessage);
  
  // Also append to sync log file
  const logDir = path.join(__dirname, 'logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  const logFile = path.join(logDir, `sync_${new Date().toISOString().split('T')[0]}.log`);
  fs.appendFileSync(logFile, logMessage + '\n');
}

function parseNumber(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  // Remove commas, spaces, and any non-numeric characters except . and -
  const cleaned = String(value).replace(/[,\s]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function parseIntValue(value) {
  const num = parseNumber(value);
  return num === null ? null : Math.round(num);
}

function getCurrentShift() {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 14) return '1';
  if (hour >= 14 && hour < 22) return '2';
  return '3';
}

function getTodayDate() {
  return new Date();
}

// ============================================
// TRIPUTRA AUTHENTICATION
// ============================================

async function createAxiosInstance() {
  return axios.create({
    baseURL: CONFIG.baseUrl,
    timeout: 30000,
    withCredentials: true,
    validateStatus: (status) => status < 600,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
    }
  });
}

async function authenticate(force = false) {
  const now = Date.now();
  
  // Check if we have a valid session
  if (!force && (now - lastAuthTime) < CONFIG.sessionTimeout && axiosInstance) {
    log('Using existing session');
    return axiosInstance;
  }
  
  log('Authenticating with TRIPUTRA...');
  
  axiosInstance = await createAxiosInstance();
  
  try {
    // Get login page to extract any CSRF tokens or hidden fields
    const loginPage = await axiosInstance.get('/login.php');
    const $ = cheerio.load(loginPage.data);
    const hiddenFields = {};
    $('input[type="hidden"]').each((i, el) => {
      const name = $(el).attr('name');
      const value = $(el).attr('value');
      if (name) hiddenFields[name] = value;
    });
    
    // Submit login
    const loginData = {
      username: CONFIG.credentials.username,
      password: CONFIG.credentials.password,
      ...hiddenFields
    };
    
    const loginResponse = await axiosInstance.post('/login.php', loginData, {
      maxRedirects: 0,
      validateStatus: (status) => status === 302 || status === 200
    });
    
    // Verify authentication by accessing a protected page
    const testResponse = await axiosInstance.get('/efficiency.php').catch(() => null);
    
    if (testResponse && testResponse.status === 200) {
      lastAuthTime = now;
      log('Authentication successful');
      return axiosInstance;
    }
    
    // Try fallback pages
    for (const page of CONFIG.fallbackPages) {
      const fallbackResponse = await axiosInstance.get(`/${page}`).catch(() => null);
      if (fallbackResponse && fallbackResponse.status === 200) {
        lastAuthTime = now;
        log(`Authentication verified via ${page}`);
        return axiosInstance;
      }
    }
    
    log('Authentication may have failed, attempting to continue anyway', 'WARN');
    return axiosInstance;
    
  } catch (error) {
    log(`Authentication error: ${error.message}`, 'ERROR');
    throw error;
  }
}

// ============================================
// DATA FETCHING
// ============================================

async function fetchEfficiencyPage() {
  await authenticate();
  
  log(`Fetching efficiency data from ${CONFIG.dataPage}...`);
  
  try {
    // First, trigger a data refresh by posting to prod_stop_eff_action.php
    log('Triggering data refresh...');
    const refreshData = new URLSearchParams();
    refreshData.append('sortby', 'Machine');
    refreshData.append('type', 'All');
    refreshData.append('mtyp', '');
    
    try {
      const refreshResponse = await axiosInstance.post(
        '/action/prod_stop_eff_action.php',
        refreshData.toString(),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }
      );
      log(`Data refresh response: ${refreshResponse.data}`);
    } catch (refreshError) {
      log(`Data refresh warning: ${refreshError.message}`, 'WARN');
    }
    
    // Now fetch the efficiency page with refreshed data
    const response = await axiosInstance.get(`/${CONFIG.dataPage}`);
    
    if (response.status !== 200) {
      throw new Error(`Failed to fetch page: status ${response.status}`);
    }
    
    log(`Fetched ${response.data.length} bytes of HTML`);
    return response.data;
    
  } catch (error) {
    log(`Error fetching efficiency page: ${error.message}`, 'ERROR');
    
    // Try fallback pages
    for (const page of CONFIG.fallbackPages) {
      log(`Trying fallback page: ${page}`, 'WARN');
      try {
        const response = await axiosInstance.get(`/${page}`);
        if (response.status === 200) {
          log(`Successfully fetched data from ${page}`);
          return response.data;
        }
      } catch (fallbackError) {
        log(`Fallback ${page} also failed: ${fallbackError.message}`, 'WARN');
      }
    }
    
    throw error;
  }
}

// ============================================
// DATA PARSING
// ============================================

function parseEfficiencyTable(html) {
  const $ = cheerio.load(html);
  const records = [];
  
  // TRIPUTRA uses colored tile/div elements for each loom
  // Each tile shows: machine ID (AD-01, R-01), actual %, plan %, KP code, operator, style
  
  // Look for common tile/container patterns
  // The tiles may be in divs with specific classes or IDs
  const tileSelectors = [
    '[class*="tile"]',
    '[class*="loom"]',
    '[class*="machine"]',
    '[id*="tile"]',
    '[id*="loom"]',
    '[class*="card"]',
    'div[class*="col-"]',
    '.panel',
    '.box'
  ];
  
  // First, let's log sample HTML to understand structure
  log('Searching for loom tile divs...');
  
  // Try to find divs that contain machine IDs
  const machinePattern = /([A-Z]{1,2}-\d{2})/g;
  const kpPattern = /\b(B[A-Z]{3})\b/g;
  
  // Find all elements that contain machine IDs
  const possibleTileDivs = [];
  $('div').each((i, div) => {
    const text = $(div).text();
    const hasMachine = machinePattern.test(text);
    if (hasMachine) {
      machinePattern.lastIndex = 0; // Reset regex
      const htmlContent = $(div).html();
      possibleTileDivs.push({
        index: i,
        html: htmlContent.substring(0, 500), // First 500 chars
        text: text.substring(0, 200)
      });
    }
  });
  
  log(`Found ${possibleTileDivs.length} divs with machine IDs`);
  
  // Log first 3 tile divs for inspection
  if (possibleTileDivs.length > 0) {
    log('=== Sample Tile Div #1 ===');
    log(possibleTileDivs[0]?.html || 'N/A');
    log('=== Sample Tile Div #2 ===');
    log(possibleTileDivs[1]?.html || 'N/A');
    log('=== Sample Tile Div #3 ===');
    log(possibleTileDivs[2]?.html || 'N/A');
  }
  
  // Parse the tile divs
  // Each tile should contain:
  // - Machine ID (e.g., AD-01, R-01)
  // - Actual efficiency %
  // - Plan efficiency %
  // - KP code (BXXX pattern)
  // - Operator name
  // - Style code
  
  for (const tileDiv of possibleTileDivs) {
    try {
      // Create a temporary cheerio instance for this tile
      const tile$ = cheerio.load(tileDiv.html, null, false);
      const tileText = tile$.text();
      
      // Extract machine ID
      const machineMatch = tileText.match(/([A-Z]{1,2}-\d{2})/);
      if (!machineMatch) continue;
      
      const noMesin = machineMatch[1];
      
      // Extract efficiency percentages (look for numbers followed by %)
      const effMatches = tileText.match(/(\d+\.?\d*)\s*%/g);
      let effActual = null;
      let effPlan = null;
      
      if (effMatches && effMatches.length >= 1) {
        // First % is usually actual efficiency
        effActual = parseFloat(effMatches[0].replace('%', ''));
      }
      if (effMatches && effMatches.length >= 2) {
        // Second % is usually plan efficiency
        effPlan = parseFloat(effMatches[1].replace('%', ''));
      }
      
      // Extract KP code (pattern: B followed by 3 uppercase letters)
      const kpMatch = tileText.match(kpPattern);
      const kpCode = kpMatch ? kpMatch[1] : null;
      
      // Extract any other numbers (could be meters, RPM, etc.)
      const numbers = tileText.match(/\b\d+\.?\d*\b/g) || [];
      
      // Create record
      const record = {
        no_mesin: noMesin,
        kp_code: kpCode,
        beam_no: null,
        meters: null,
        eff_actual: effActual,
        eff_plan: effPlan,
        rpm: null,
        kpicks: null,
        warp_stops: null,
        weft_stops: null,
        bobbin_stops: null,
        stop_hours: null,
        shift: getCurrentShift()
      };
      
      records.push(record);
    } catch (parseError) {
      log(`Error parsing tile: ${parseError.message}`, 'WARN');
    }
  }
  
  // Remove duplicates based on machine number
  const uniqueRecords = [];
  const seenMachines = new Set();
  for (const record of records) {
    if (!seenMachines.has(record.no_mesin)) {
      seenMachines.add(record.no_mesin);
      uniqueRecords.push(record);
    }
  }
  
  log(`Parsed ${uniqueRecords.length} loom records from div tiles`);
  return uniqueRecords;
}

function parseRow(headers, row, $) {
  // Create a map of column index to header name
  const headerMap = {};
  headers.forEach((header, index) => {
    headerMap[index] = header.toLowerCase().trim();
  });
  
  // Try to find the machine number column
  let noMesin = null;
  let kpCode = null;
  let beamNo = null;
  let meters = null;
  let efficiency = null;
  let rpm = null;
  let warpStops = null;
  let weftStops = null;
  let bobbinStops = null;
  
  // Try to extract values based on column position and content
  row.forEach((cell, index) => {
    const header = headerMap[index] || '';
    const value = cell.text;
    
    // Machine number patterns: R-01, AH-03, etc.
    if (!noMesin && /^[A-Z]+-?\d+$/i.test(value)) {
      noMesin = value.toUpperCase();
    }
    
    // KP code pattern: starts with B followed by 3 chars (e.g., BUCJ)
    if (!kpCode && /^B[A-Z]{3}$/i.test(value)) {
      kpCode = value.toUpperCase();
    }
    
    // Beam number (integer)
    if (!beamNo && /^\d{3,5}$/.test(value)) {
      beamNo = parseIntValue(value);
    }
    
    // Meters (decimal number)
    if (!meters && /^\d+\.\d+$/.test(value)) {
      meters = parseNumber(value);
    }
    
    // Efficiency percentage
    if (!efficiency && /\d+\.?\d*%?$/.test(value) && header.includes('eff')) {
      const effValue = value.replace('%', '');
      efficiency = parseNumber(effValue);
    }
    
    // RPM (integer, usually 500-700)
    if (!rpm && /^\d{3}$/.test(value)) {
      rpm = parseIntValue(value);
    }
    
    // Stop counts
    if (header.includes('warp') && header.includes('stop') && !warpStops) {
      warpStops = parseIntValue(value);
    }
    if (header.includes('weft') && header.includes('stop') && !weftStops) {
      weftStops = parseIntValue(value);
    }
    if (header.includes('bobbin') && header.includes('stop') && !bobbinStops) {
      bobbinStops = parseIntValue(value);
    }
  });
  
  // If we have a machine number, we have a valid record
  if (!noMesin) {
    return null;
  }
  
  return {
    no_mesin: noMesin,
    kp_code: kpCode,
    beam_no: beamNo ? String(beamNo) : null,
    meters: meters,
    eff_actual: efficiency,
    eff_plan: null, // Not available from efficiency.php
    rpm: rpm,
    kpicks: null, // Not directly available
    warp_stops: warpStops,
    weft_stops: weftStops,
    bobbin_stops: bobbinStops,
    stop_hours: null, // Not directly available
    shift: getCurrentShift()
  };
}

// ============================================
// DATABASE OPERATIONS
// ============================================

async function findSalesContract(kpCode) {
  if (!kpCode) return null;
  
  try {
    const contractNumber = decodeKP(kpCode);
    
    // Build OR conditions - always try the raw kp code first
    const orConditions = [{ kp: kpCode }];
    
    // Only add decoded number if we got a valid result
    if (contractNumber !== null) {
      orConditions.push({ kp: String(contractNumber) });
    }
    
    // Try to find by any of the possible KP values
    const contract = await getPrisma().salesContract.findFirst({
      where: { OR: orConditions }
    });
    
    if (contract) {
      log(`Found contract ${contract.id} for KP ${kpCode}${contractNumber !== null ? ' (decoded: ' + contractNumber + ')' : ''}`);
      return contract;
    }
    
    log(`No contract found for KP ${kpCode}${contractNumber !== null ? ' (decoded: ' + contractNumber + ')' : ''}`, 'WARN');
    return null;
    
  } catch (error) {
    log(`Error finding contract for KP ${kpCode}: ${error.message}`, 'ERROR');
    return null;
  }
}

async function upsertWeavingRecord(record, contract) {
  const prisma = getPrisma();
  
  const data = {
    kp: record.kp_code || 'UNKNOWN',
    machine: record.no_mesin,
    no_mesin: parseIntValue(record.no_mesin.replace(/[^0-9]/g, '')) || null,
    shift: record.shift,
    tanggal: getTodayDate(),
    tgl: getTodayDate(),
    
    // Production data
    meters: record.meters ? parseFloat(record.meters) : null,
    meter_out: record.meters ? parseFloat(record.meters) : null,
    efficiency: record.eff_actual ? parseFloat(record.eff_actual) : null,
    rpm: record.rpm ? parseIntValue(record.rpm) : null,
    kpicks: record.kpicks ? parseFloat(record.kpicks) : null,
    
    // Beam info
    beam: record.beam_no ? parseIntValue(record.beam_no) : null,
    beam_no: record.beam_no ? parseIntValue(record.beam_no) : null,
    
    // Stoppages
    warp_stop_hr: record.stop_hours ? parseFloat(record.stop_hours) : null,
    warp_no: record.warp_stops ? parseIntValue(record.warp_stops) : null,
    weft_no: record.weft_stops ? parseIntValue(record.weft_stops) : null,
    bobbin_no: record.bobbin_stops ? parseIntValue(record.bobbin_stops) : null,
    
    // TRIPUTRA sync tracking
    synced_at: new Date(),
    source: 'TRIPUTRA',
    
    // Link to contract if found
    warping_beam_id: contract ? undefined : undefined, // Will be set if we can find beam
  };
  
  // If we have a contract, link it
  if (contract) {
    // Try to find a related warping beam
    const warpingBeam = await prisma.warpingBeam.findFirst({
      where: { kp: contract.kp }
    });
    
    if (warpingBeam) {
      data.warping_beam_id = warpingBeam.id;
    }
  }
  
  try {
    // Use upsert with unique constraint
    const result = await prisma.weavingRecord.upsert({
      where: {
        kp_tanggal_shift_machine: {
          kp: data.kp,
          tanggal: data.tanggal,
          shift: data.shift || '1',
          machine: data.machine || ''
        }
      },
      update: {
        ...data,
        updated_at: new Date()
      },
      create: data
    });
    
    return { success: true, id: result.id };
    
  } catch (error) {
    // Try without unique constraint if it fails
    try {
      const result = await prisma.weavingRecord.create({
        data: {
          ...data,
          // Use a fallback unique key
          kode_kain: `${data.machine}_${Date.now()}`
        }
      });
      return { success: true, id: result.id };
    } catch (createError) {
      log(`Failed to create weaving record: ${createError.message}`, 'ERROR');
      return { success: false, error: createError.message };
    }
  }
}

async function createImportLog(source, rowsOk, rowsError, errorDetail = null) {
  try {
    const prisma = getPrisma();
    
    const result = await prisma.importLog.create({
      data: {
        source,
        rowsOk,
        rowsError,
        errorDetail
      }
    });
    return result;
    
  } catch (error) {
    log(`Failed to create import log: ${error.message}`, 'ERROR');
    return null;
  }
}

// ============================================
// MAIN SYNC FUNCTION
// ============================================

async function sync() {
  log('='.repeat(50));
  log('Starting TRIPUTRA sync');
  log('='.repeat(50));
  
  const startTime = Date.now();
  let rowsOk = 0;
  let rowsError = 0;
  const errors = [];
  
  try {
    // 1. Fetch data from TRIPUTRA
    const html = await fetchEfficiencyPage();
    
    // Save raw HTML for debugging
    const outputDir = path.join(__dirname, 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    fs.writeFileSync(
      path.join(outputDir, `efficiency_${Date.now()}.html`),
      html
    );
    
    // 2. Parse the efficiency table
    const records = parseEfficiencyTable(html);
    
    if (records.length === 0) {
      log('No records found in efficiency table!', 'ERROR');
      await createImportLog('TRIPUTRA_SYNC', 0, 0, 'No records found in efficiency table');
      return;
    }
    
    log(`Processing ${records.length} records...`);
    
    // 3. Process each record
    for (const record of records) {
      try {
        // Find the sales contract for this KP code
        const contract = await findSalesContract(record.kp_code);
        
        // Upsert the weaving record
        const result = await upsertWeavingRecord(record, contract);
        
        if (result.success) {
          rowsOk++;
          log(`  ✓ ${record.no_mesin}: ${record.kp_code} -> Record ${result.id}`);
        } else {
          rowsError++;
          errors.push({ machine: record.no_mesin, error: result.error });
          log(`  ✗ ${record.no_mesin}: ${record.kp_code} -> ${result.error}`, 'ERROR');
        }
        
      } catch (recordError) {
        rowsError++;
        errors.push({ machine: record.no_mesin, error: recordError.message });
        log(`  ✗ ${record.no_mesin}: Error processing record: ${recordError.message}`, 'ERROR');
      }
    }
    
    // 4. Create import log
    const errorDetail = errors.length > 0 ? JSON.stringify(errors.slice(0, 10)) : null;
    await createImportLog('TRIPUTRA_SYNC', rowsOk, rowsError, errorDetail);
    
    // 5. Summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    log('='.repeat(50));
    log(`Sync complete in ${duration}s`);
    log(`  Records processed: ${records.length}`);
    log(`  Successful: ${rowsOk}`);
    log(`  Errors: ${rowsError}`);
    log('='.repeat(50));
    
  } catch (error) {
    log(`Sync failed: ${error.message}`, 'ERROR');
    await createImportLog('TRIPUTRA_SYNC', 0, 1, error.message);
    throw error;
  } finally {
    // Close Prisma connection
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

// ============================================
// RUN SYNC
// ============================================

// Export for use as module
module.exports = { sync, decodeKP };

// Run if called directly
if (require.main === module) {
  sync()
    .then(() => {
      console.log('Sync completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Sync failed:', error);
      process.exit(1);
    });
}
