/**
 * TRIPUTRA Data Extractor using Puppeteer
 * 
 * This module uses a headless browser to extract data from TRIPUTRA's
 * JavaScript-rendered pages.
 */

const puppeteer = require('puppeteer');

const CONFIG = {
  baseUrl: process.env.TRIPUTRA_BASE_URL || 'http://coffeeandjeans.net/tpti',
  credentials: {
    username: process.env.TRIPUTRA_USER,
    password: process.env.TRIPUTRA_PASS
  },
  headless: true,
  timeout: 60000
};

class TriputraExtractor {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  async initialize() {
    console.log('Initializing Puppeteer...');
    
    this.browser = await puppeteer.launch({
      headless: CONFIG.headless,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });
    
    this.page = await this.browser.newPage();
    
    // Set viewport
    await this.page.setViewport({ width: 1920, height: 1080 });
    
    console.log('Puppeteer initialized');
  }

  async login() {
    console.log('Logging into TRIPUTRA...');
    
    // Go to login page
    await this.page.goto(`${CONFIG.baseUrl}/login.php`, {
      waitUntil: 'networkidle0',
      timeout: CONFIG.timeout
    });
    
    // Fill in credentials
    await this.page.type('input[name="username"]', CONFIG.credentials.username);
    await this.page.type('input[name="password"]', CONFIG.credentials.password);
    
    // Select English language
    const langRadio = await this.page.$('input[name="lang"][value="en"]');
    if (langRadio) {
      await langRadio.click();
    }
    
    // Submit form
    await Promise.all([
      this.page.waitForNavigation({ waitUntil: 'networkidle0', timeout: CONFIG.timeout }),
      this.page.click('button[type="submit"]')
    ]);
    
    console.log('Login successful');
  }

  async extractEfficiencyData() {
    console.log('Fetching efficiency page...');
    
    // Go to efficiency page
    await this.page.goto(`${CONFIG.baseUrl}/efficiency.php`, {
      waitUntil: 'networkidle0',
      timeout: CONFIG.timeout
    });
    
    // Wait for the page to fully render
    await this.page.waitForTimeout(3000);
    
    // Try to fill the form if it exists
    try {
      await this.page.evaluate(() => {
        // Try to find and submit the efficiency form
        const form = document.getElementById('onlineefffrm');
        if (form) {
          // Reset any filter fields
          const selects = form.querySelectorAll('select');
          selects.forEach(select => {
            select.value = '';
          });
        }
      });
      
      // Wait for data to load
      await this.page.waitForTimeout(5000);
    } catch (e) {
      console.log('Form handling:', e.message);
    }
    
    // Extract data from the page
    const data = await this.page.evaluate(() => {
      const results = [];
      
      // Look for tables with loom data
      const tables = document.querySelectorAll('table');
      
      tables.forEach(table => {
        const rows = table.querySelectorAll('tr');
        if (rows.length < 3) return; // Skip empty tables
        
        // Get headers
        const headers = [];
        const headerCells = rows[0].querySelectorAll('th, td');
        headerCells.forEach(cell => {
          headers.push(cell.textContent.trim().toLowerCase());
        });
        
        // Check if this looks like loom data
        const firstRowText = rows[1]?.textContent || '';
        const hasMachineData = /R-\d+|AH-\d+/i.test(firstRowText);
        
        if (hasMachineData) {
          // Extract data rows
          for (let i = 1; i < rows.length; i++) {
            const cells = rows[i].querySelectorAll('td');
            const rowData = {};
            
            cells.forEach((cell, index) => {
              rowData[`col_${index}`] = cell.textContent.trim();
            });
            
            if (Object.keys(rowData).length > 0) {
              results.push({ headers, row: rowData });
            }
          }
        }
      });
      
      // Also try to find data in JavaScript variables
      // Look for any element that contains data
      const dataDivs = document.querySelectorAll('[id*="data"], [class*="data"], [id*="content"]');
      dataDivs.forEach(div => {
        const text = div.textContent.trim();
        if (/R-\d+|AH-\d+/i.test(text)) {
          results.push({ type: 'div', content: text });
        }
      });
      
      return results;
    });
    
    console.log(`Found ${data.length} data sections`);
    return data;
  }

  async extractProductionData() {
    console.log('Fetching production page...');
    
    await this.page.goto(`${CONFIG.baseUrl}/production.php`, {
      waitUntil: 'networkidle0',
      timeout: CONFIG.timeout
    });
    
    await this.page.waitForTimeout(3000);
    
    const data = await this.page.evaluate(() => {
      const results = [];
      
      // Look for tables
      const tables = document.querySelectorAll('table');
      
      tables.forEach(table => {
        const rows = table.querySelectorAll('tr');
        if (rows.length < 3) return;
        
        rows.forEach(row => {
          const cells = row.querySelectorAll('td');
          const rowData = [];
          cells.forEach(cell => {
            rowData.push(cell.textContent.trim());
          });
          if (rowData.length > 0 && /R-\d+|AH-\d+/i.test(rowData.join(' '))) {
            results.push(rowData);
          }
        });
      });
      
      return results;
    });
    
    console.log(`Found ${data.length} production rows`);
    return data;
  }

  async extractOverallOnlineData() {
    console.log('Fetching overall online page...');
    
    await this.page.goto(`${CONFIG.baseUrl}/overall_online.php`, {
      waitUntil: 'networkidle0',
      timeout: CONFIG.timeout
    });
    
    await this.page.waitForTimeout(3000);
    
    const data = await this.page.evaluate(() => {
      const results = [];
      
      // Get all text content and look for patterns
      const body = document.body;
      const text = body.textContent;
      
      // Look for machine patterns
      const machinePattern = /([A-Z]+-\d+)\s+([A-Z0-9]+)?\s*(\d+\.?\d*)?/g;
      let match;
      
      while ((match = machinePattern.exec(text)) !== null) {
        if (match[1]) {
          results.push({
            machine: match[1],
            kp: match[2] || null,
            value: match[3] || null
          });
        }
      }
      
      return results;
    });
    
    console.log(`Found ${data.length} online entries`);
    return data;
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      console.log('Browser closed');
    }
  }
}

/**
 * Main function to extract all weaving data from TRIPUTRA
 */
async function extractAllData() {
  const extractor = new TriputraExtractor();
  
  try {
    await extractor.initialize();
    await extractor.login();
    
    // Try multiple pages for data
    const efficiencyData = await extractor.extractEfficiencyData();
    const productionData = await extractor.extractProductionData();
    const onlineData = await extractor.extractOverallOnlineData();
    
    return {
      efficiency: efficiencyData,
      production: productionData,
      online: onlineData
    };
    
  } finally {
    await extractor.close();
  }
}

// Export for use in sync.js
module.exports = { TriputraExtractor, extractAllData };

// Run if called directly
if (require.main === module) {
  extractAllData()
    .then(data => {
      console.log('\n=== Extracted Data ===');
      console.log('Efficiency:', JSON.stringify(data.efficiency, null, 2).substring(0, 1000));
      console.log('\nProduction:', JSON.stringify(data.production, null, 2).substring(0, 1000));
      console.log('\nOnline:', JSON.stringify(data.online, null, 2).substring(0, 1000));
      process.exit(0);
    })
    .catch(error => {
      console.error('Error:', error);
      process.exit(1);
    });
}
