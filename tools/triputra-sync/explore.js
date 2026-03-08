/**
 * TRIPUTRA Exploration Script
 * 
 * This script explores the TRIPUTRA system and saves all relevant pages
 * and API responses to the output directory.
 * 
 * Required environment variables (copy to .env file in tools/triputra-sync/):
 *   TRIPUTRA_USER=your_username
 *   TRIPUTRA_PASS=your_password
 *   TRIPUTRA_BASE_URL=http://coffeeandjeans.net/tpti
 * 
 * Usage:
 *   npm install
 *   cp .env.example .env  # Then fill in credentials
 *   node explore.js
 */

require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
  baseUrl: process.env.TRIPUTRA_BASE_URL || 'http://coffeeandjeans.net/tpti',
  outputDir: path.join(__dirname, 'output'),
  loginUrl: `${process.env.TRIPUTRA_BASE_URL || 'http://coffeeandjeans.net/tpti'}/login.php`,
  credentials: {
    username: process.env.TRIPUTRA_USER,
    password: process.env.TRIPUTRA_PASS
  }
};

// Pages to explore
const PAGES = {
  // Login page
  login: 'login.php',
  
  // On Line Screens (live data)
  overall_online: 'overall_online.php',
  production: 'production.php',
  stoppage: 'stoppage.php',
  efficiency: 'efficiency.php',
  speed: 'speed.php',
  weaver_section: 'weaver_section.php',
  group_online: 'group_online.php',
  dashboard_analysis: 'dashboard_analysis.php',
  
  // Reports
  production_report_new2: 'production_report_new2.php',
  stoppage_report: 'stoppage_report.php',
  efficiency_report: 'efficiency_report.php',
  eff_trend: 'eff_trend.php',
  rolldoff_rep: 'rolldoff_rep.php',
  metersonloom: 'metersonloom.php',
  montho3ep: 'montho3ep.php',
  threeshift_nw: 'threeshift_nw.php',
  long_term: 'long_term.php',
  user_report1: 'user_report1.php',
  user_report2: 'user_report2.php',
  user_report3: 'user_report3.php',
  user_report4: 'user_report4.php',
  user_report5: 'user_report5.php',
  user_report6: 'user_report6.php',
  user_report7: 'user_report7.php',
  
  // Utilities
  production_excel: 'production_excel.php',
  
  // Assignments
  manual_entry: 'manual_entry.php',
  style_beam_assign: 'style_beam_assign.php',
  cur_men_assign: 'cur_men_assign.php',
  
  // Standards (reference/master data)
  machine_std_ae: 'machine_std_ae.php',
  style_std_ae: 'style_std_ae.php',
  beam_std_ae: 'beam_std_ae.php',
  scode_std_ae: 'scode_std_ae.php',
  men_std_ae: 'men_std_ae.php'
};

// API endpoints to probe
const API_ENDPOINTS = [
  // Dashboard API endpoints (GET)
  { url: 'dashboard.php?a=1', method: 'GET', desc: 'Efficiency current shift' },
  { url: 'dashboard.php?a=1cm', method: 'GET', desc: 'Efficiency current month' },
  { url: 'dashboard.php?a=2ps', method: 'GET', desc: 'Production previous shift' },
  { url: 'dashboard.php?a=2cs', method: 'GET', desc: 'Production current shift' },
  { url: 'dashboard.php?a=2cm', method: 'GET', desc: 'Production current month' },
  { url: 'dashboard.php?a=3', method: 'GET', desc: 'Stoppage breakdown' },
  { url: 'dashboard.php?a=4', method: 'GET', desc: 'Speed data' },
  
  // Production/Stoppage/Efficiency action endpoints (POST) - correct paths from AJAX discovery
  { url: 'action/prod_stop_eff_action.php', method: 'POST', desc: 'XHR endpoint for production/stoppage/efficiency' },
  { url: 'action/prod_stop_eff_action.php', method: 'POST', data: { action: 'get_production' }, desc: 'XHR get_production' },
  { url: 'action/prod_stop_eff_action.php', method: 'POST', data: { action: 'get_efficiency' }, desc: 'XHR get_efficiency' },
  { url: 'action/prod_stop_eff_action.php', method: 'POST', data: { action: 'get_stoppage' }, desc: 'XHR get_stoppage' },
  
  // Efficiency trend
  { url: 'action/efftrend_action.php', method: 'GET', desc: 'Efficiency trend' },
  
  // Machine data
  { url: 'ajax/machine_rel.php', method: 'GET', desc: 'Machine list' },
  { url: 'ajax/beam_rel.php', method: 'GET', desc: 'Beam list' },
  
  // Standards
  { url: 'includes/getStandards_details.php', method: 'GET', desc: 'Standards details' },
  { url: 'includes/getStandards_record.php', method: 'GET', desc: 'Standards record' },
];

// POST data combinations to try
const POST_COMBINATIONS = [
  {},
  { action: 'get_production' },
  { action: 'get_efficiency' },
  { action: 'get_stoppage' },
  { action: 'get_data' },
  { section: 'all' },
  { shift: '1' },
  { shift: '2' },
  { shift: '3' },
  { date: new Date().toISOString().split('T')[0] },
  { section: 'all', shift: '1' },
  { section: 'all', shift: '2' },
  { section: 'all', shift: '3' },
  { mode: 'live' }
];

// ============================================
// UTILITY FUNCTIONS
// ============================================

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function saveFile(filename, content) {
  const filepath = path.join(CONFIG.outputDir, filename);
  fs.writeFileSync(filepath, content);
  console.log(`  ✓ Saved: ${filename}`);
  return filepath;
}

function logError(message, error) {
  console.error(`  ✗ Error: ${message}`);
  if (error.response) {
    console.error(`    Status: ${error.response.status}`);
    console.error(`    StatusText: ${error.response.statusText}`);
  } else if (error.code) {
    console.error(`    Code: ${error.code}`);
  }
}

function extractAjaxCalls(html) {
  const ajaxCalls = [];
  const $ = cheerio.load(html);
  
  // jQuery ajax calls
  const jqueryPatterns = [
    /\$.ajax\s*\(\s*\{[^}]*url\s*:\s*['"]([^'"]+)['"]/g,
    /\$.get\s*\(\s*['"]([^'"]+)['"]/g,
    /\$.post\s*\(\s*['"]([^'"]+)['"]/g,
    /fetch\s*\(\s*['"]([^'"]+)['"]/g,
    /ajax\s*\(\s*\{[^}]*url\s*:\s*['"]([^'"]+)['"]/g
  ];
  
  // Scan script tags
  $('script').each((i, el) => {
    const scriptContent = $(el).html();
    if (scriptContent) {
      jqueryPatterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(scriptContent)) !== null) {
          ajaxCalls.push(match[1]);
        }
      });
    }
  });
  
  // Scan inline onclick handlers
  $('[onclick]').each((i, el) => {
    const onclick = $(el).attr('onclick');
    if (onclick) {
      const urlMatch = onclick.match(/['"]([^'"]+\.php[^'"]*)['"]/);
      if (urlMatch) {
        ajaxCalls.push(urlMatch[1]);
      }
    }
  });
  
  // Scan data-attributes for URLs
  $('[data-url]').each((i, el) => {
    ajaxCalls.push($(el).attr('data-url'));
  });
  $('[data-src]').each((i, el) => {
    ajaxCalls.push($(el).attr('data-src'));
  });
  $('[data-action]').each((i, el) => {
    const action = $(el).attr('data-action');
    if (action && action.endsWith('.php')) {
      ajaxCalls.push(action);
    }
  });
  
  return [...new Set(ajaxCalls)]; // Remove duplicates
}

function analyzeHtmlForTables(html, filename) {
  const $ = cheerio.load(html);
  const tables = [];
  
  $('table').each((i, table) => {
    const $table = $(table);
    const headers = [];
    const rows = [];
    
    // Get headers
    $table.find('thead th, thead td, tr:first-child th, tr:first-child td').each((j, th) => {
      headers.push($(th).text().trim());
    });
    
    // Get rows
    $table.find('tbody tr, tr').each((j, tr) => {
      const cells = [];
      $(tr).find('td, th').each((k, td) => {
        cells.push($(td).text().trim());
      });
      if (cells.length > 0) {
        rows.push(cells);
      }
    });
    
    if (rows.length > 0) {
      tables.push({ headers, rows: rows.slice(0, 10) }); // First 10 rows
    }
  });
  
  return tables;
}

// ============================================
// MAIN EXPLORATION FUNCTIONS
// ============================================

async function login() {
  console.log('\n🔐 Attempting to login to TRIPUTRA...');
  
  const axiosInstance = axios.create({
    baseURL: CONFIG.baseUrl,
    timeout: 30000,
    withCredentials: true,
    validateStatus: (status) => status < 600,
    // Don't follow redirects automatically - we want to see where we get sent
    maxRedirects: 0,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Content-Type': 'application/x-www-form-urlencoded',
    }
  });
  
  try {
    // First, get the login page to extract hidden fields and form action
    const loginPageResponse = await axiosInstance.get('/login.php');
    saveFile('login_page.html', loginPageResponse.data);
    
    // Parse the login form
    const $ = cheerio.load(loginPageResponse.data);
    const formAction = $('form').attr('action') || 'action/login_action.php';
    const hiddenFields = {};
    
    $('input[type="hidden"]').each((i, el) => {
      const name = $(el).attr('name');
      const value = $(el).attr('value');
      if (name) hiddenFields[name] = value || '';
    });
    
    console.log(`  Form action: ${formAction}`);
    console.log(`  Hidden fields: ${Object.keys(hiddenFields).join(', ')}`);
    
    // Submit login
    const loginData = new URLSearchParams();
    loginData.append('username', CONFIG.credentials.username);
    loginData.append('password', CONFIG.credentials.password);
    loginData.append('lang', 'en');
    
    // Add hidden fields
    Object.entries(hiddenFields).forEach(([key, value]) => {
      loginData.append(key, value);
    });
    
    console.log(`  Sending login request to ${formAction}...`);
    
    // Try to login - expect a redirect (302) on success
    try {
      const loginResponse = await axiosInstance.post(formAction, loginData.toString(), {
        maxRedirects: 0,
        validateStatus: (status) => status === 302 || status === 200
      });
      
      console.log(`  Login response status: ${loginResponse.status}`);
      
      // Check for redirect
      const redirectUrl = loginResponse.headers.location;
      if (redirectUrl) {
        console.log(`  Redirect to: ${redirectUrl}`);
      }
      
      // Get cookies from response
      const cookies = loginResponse.headers['set-cookie'];
      if (cookies) {
        console.log(`  ✓ Received session cookies`);
        // Parse and store cookies for subsequent requests
        const cookieString = cookies.map(c => c.split(';')[0]).join('; ');
        axiosInstance.defaults.headers.Cookie = cookieString;
      }
      
      // Try to follow redirect or access dashboard
      // Try common dashboard URLs
      const dashboardUrls = [
        '/overall_online.php',
        '/dashboard.php',
        '/efficiency.php',
        '/index.php',
        redirectUrl
      ].filter(Boolean);
      
      for (const url of dashboardUrls) {
        try {
          const testResponse = await axiosInstance.get(url, { maxRedirects: 5 });
          if (testResponse.status === 200 && testResponse.data.length > 100) {
            console.log(`  ✓ Successfully accessed: ${url}`);
            // Save this as evidence of successful login
            saveFile('after_login.html', testResponse.data);
            break;
          }
        } catch (e) {
          console.log(`    Tried ${url}: ${e.message}`);
        }
      }
      
    } catch (loginError) {
      console.log(`  Login request error: ${loginError.message}`);
    }
    
    // Re-enable redirects for subsequent requests
    axiosInstance.defaults.maxRedirects = 5;
    
    // Test if we can access the efficiency page
    const testResponse = await axiosInstance.get('/efficiency.php').catch(() => null);
    
    if (testResponse && testResponse.status === 200 && testResponse.data.length > 100) {
      console.log(`  ✓ Login verified! Can access protected pages`);
      return axiosInstance;
    } else {
      console.log(`  ⚠ Login may have failed - trying to continue anyway`);
    }
    
    return axiosInstance;
    
  } catch (error) {
    logError('Login failed', error);
    console.log(`  ⚠ Attempting to continue without authentication...`);
    axiosInstance.defaults.maxRedirects = 5;
    return axiosInstance;
  }
}

async function fetchPage(axiosInstance, pageName, url) {
  console.log(`\n📄 Fetching: ${pageName} (${url})`);
  
  try {
    // Special handling for efficiency.php - trigger data refresh first
    if (pageName === 'efficiency') {
      console.log('  Triggering data refresh via prod_stop_eff_action.php...');
      
      // POST to action/prod_stop_eff_action.php to trigger data load
      const refreshData = new URLSearchParams();
      refreshData.append('sortby', 'Machine');
      refreshData.append('type', 'All');
      refreshData.append('mtyp', '');
      
      try {
        const refreshResponse = await axiosInstance.post(
          'action/prod_stop_eff_action.php',
          refreshData.toString(),
          {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
          }
        );
        console.log(`  Data refresh response: ${refreshResponse.data}`);
      } catch (refreshError) {
        console.log(`  Data refresh warning: ${refreshError.message}`);
      }
    }
    
    const response = await axiosInstance.get(url);
    
    const filename = `${pageName}.html`;
    saveFile(filename, response.data);
    
    // For efficiency page, also save the raw HTML with data
    if (pageName === 'efficiency') {
      saveFile('efficiency_raw.html', response.data);
      console.log('  ✓ Saved efficiency_raw.html for div structure inspection');
    }
    
    // Analyze the page
    const ajaxCalls = extractAjaxCalls(response.data);
    const tables = analyzeHtmlForTables(response.data, filename);
    
    console.log(`  Found ${ajaxCalls.length} potential AJAX endpoints`);
    console.log(`  Found ${tables.length} tables`);
    
    return { ajaxCalls, tables };
  } catch (error) {
    logError(`Failed to fetch ${pageName}`, error);
    return { ajaxCalls: [], tables: [], error: error.message };
  }
}

async function probeApiEndpoint(axiosInstance, endpoint) {
  const { url, method, data, desc } = endpoint;
  console.log(`\n🔌 Probing API: ${desc} (${method} ${url})`);
  
  try {
    let response;
    
    if (method === 'GET') {
      response = await axiosInstance.get(url);
    } else if (method === 'POST') {
      response = await axiosInstance.post(url, data || {});
    }
    
    const filename = `api_${url.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
    const content = typeof response.data === 'object' 
      ? JSON.stringify(response.data, null, 2) 
      : response.data;
    saveFile(filename, content);
    
    console.log(`  ✓ Response saved (${response.data?.length || response.data?.length || response.data?.data?.length || 'N/A'} bytes)`);
    
    return { success: true, data: response.data };
  } catch (error) {
    logError(`API probe failed for ${url}`, error);
    return { success: false, error: error.message };
  }
}

async function probePostCombinations(axiosInstance, url) {
  console.log(`\n🔬 Probing POST combinations for: ${url}`);
  const results = [];
  
  for (const data of POST_COMBINATIONS) {
    try {
      const response = await axiosInstance.post(url, data);
      const filename = `api_post_${url.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.json`;
      saveFile(filename, JSON.stringify(response.data, null, 2));
      results.push({ data, success: true });
    } catch (error) {
      results.push({ data, success: false, error: error.message });
    }
  }
  
  return results;
}

// ============================================
// MAIN EXECUTION
// ============================================

async function main() {
  console.log('='.repeat(60));
  console.log('TRIPUTRA Exploration Script');
  console.log('='.repeat(60));
  console.log(`\n📡 Base URL: ${CONFIG.baseUrl}`);
  console.log(`📁 Output Directory: ${CONFIG.outputDir}`);
  console.log(`👤 Username: ${CONFIG.credentials.username || '(not set)'}`);
  
  // Check credentials
  if (!CONFIG.credentials.username || !CONFIG.credentials.password) {
    console.error('\n❌ ERROR: TRIPUTRA_USER and TRIPUTRA_PASS environment variables are required!');
    console.error('   Please create a .env file in tools/triputra-sync/ with:');
    console.error('   TRIPUTRA_USER=your_username');
    console.error('   TRIPUTRA_PASS=your_password');
    process.exit(1);
  }
  
  // Ensure output directory exists
  ensureDir(CONFIG.outputDir);
  
  // Track all discovered AJAX endpoints
  const allAjaxCalls = new Set();
  const summary = {
    pagesFetched: 0,
    apiProbed: 0,
    errors: [],
    tables: 0
  };
  
  // Login to TRIPUTRA
  const axiosInstance = await login();
  
  // Fetch all pages
  console.log('\n' + '='.repeat(60));
  console.log('FETCHING PAGES');
  console.log('='.repeat(60));
  
  for (const [pageName, url] of Object.entries(PAGES)) {
    const result = await fetchPage(axiosInstance, pageName, url);
    summary.pagesFetched++;
    summary.tables += result.tables.length;
    
    result.ajaxCalls.forEach(call => allAjaxCalls.add(call));
  }
  
  // Probe API endpoints
  console.log('\n' + '='.repeat(60));
  console.log('PROBING API ENDPOINTS');
  console.log('='.repeat(60));
  
  for (const endpoint of API_ENDPOINTS) {
    await probeApiEndpoint(axiosInstance, endpoint);
    summary.apiProbed++;
  }
  
  // Probe POST combinations on key endpoints
  await probePostCombinations(axiosInstance, 'prod_stop_eff_action.php');
  
  // Save discovered AJAX endpoints
  console.log('\n' + '='.repeat(60));
  console.log('SAVING DISCOVERED ENDPOINTS');
  console.log('='.repeat(60));
  
  const ajaxEndpointsList = Array.from(allAjaxCalls);
  saveFile('ajax_endpoints.txt', ajaxEndpointsList.join('\n'));
  console.log(`  ✓ Saved ${ajaxEndpointsList.length} AJAX endpoints to ajax_endpoints.txt`);
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('EXPLORATION COMPLETE');
  console.log('='.repeat(60));
  console.log(`\n📊 Summary:`);
  console.log(`   Pages fetched: ${summary.pagesFetched}`);
  console.log(`   API endpoints probed: ${summary.apiProbed}`);
  console.log(`   Tables found: ${summary.tables}`);
  console.log(`   AJAX endpoints discovered: ${ajaxEndpointsList.length}`);
  console.log(`\n📁 Output files saved to: ${CONFIG.outputDir}`);
  console.log('\n✅ Next steps:');
  console.log('   1. Review the HTML files in the output directory');
  console.log('   2. Identify the data structure from efficiency.php');
  console.log('   3. Run: npm run sync');
}

// Run the exploration
main().catch(console.error);
