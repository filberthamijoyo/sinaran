# Denim Fabric Inspection Excel Files Analysis

This document provides a comprehensive analysis of three Excel inspection files used in the denim manufacturing process:

1. **InspectGray_LAPORAN IP GREIGE 26.xlsx** - Grey Fabric Inspection
2. **DATA BBSF.xlsx** - BBSF Process Data (Washing + Sanforizing)
3. **Data INSPECT FINISH.xlsx** - Finished Fabric Inspection

---

## 1. InspectGrey - Grey Fabric Inspection

### File Overview
- **File**: `InspectGray_LAPORAN IP GREIGE 26.xlsx`
- **Sheet**: Sheet1 (single sheet)
- **Total Rows**: 8,486 data rows
- **Total Columns**: 72 columns

### Purpose
Grey fabric (greige) inspection performed before any processing/finishing. This is the first quality control check after weaving, where raw denim fabric is examined for defects before any treatment.

### Color Coding & Field Importance

Based on the Excel structure:
- **Row 3**: Contains section headers with **severity ratings** (1-4) for defect types
  - `4` = High severity (critical defects like BMC, BR, BTL, etc.)
  - `2` = Medium severity
  - `1` = Low severity
  - `FUL` = Full evaluation required
- **Row 4**: Main headers (all **BOLD**) - Identity fields
- **Row 5**: Sub-headers - Defect type codes (all **BOLD**)

---

### Column Structure

#### Identity Fields (Columns 0-14)

| Column | Name | Description | Input/Calculated |
|--------|------|-------------|------------------|
| 0 | N | Sequence Number | AUTO (calculated) |
| 1 | TG | Tanggal (Date) - Inspection Date | **INPUT** |
| 2 | KP | Kode Produksi (Production Code) | **INPUT** |
| 3 | D | Description - Fabric Description | **INPUT** |
| 4 | MC | Machine Code | **INPUT** |
| 5 | BM | Beam Number | **INPUT** |
| 6 | SN | Serial Number (short) | **INPUT** |
| 7 | SN.1 | Full Serial Number | CALCULATED |
| 8 | GD | Grade (A/B/C/D) | **INPUT** (assigned by QC) |
| 9 | BME | BME (Beam Meter End) | **INPUT** |
| 10 | SJ | Surat Jalan (Delivery Note) | **INPUT** |
| 11 | W | Width | **INPUT** (measured) |
| 12 | G | Group/Type | **INPUT** |
| 13 | OPG | (Related to order) | **INPUT** |
| 14 | TGL POTONG | Tanggal Potong (Cut Date) | **INPUT** |

#### Defect Type Fields (Columns 15-71)

**SEVERITY RATINGS** (from Row 3 - critical for understanding importance):

| Severity 4 (Critical) | Severity 2 (Medium) | Severity 1 (Low) |
|----------------------|---------------------|------------------|
| BMC (Total Defects) | LM, LKC, LKS, LD | BR (Bulu) |
| BTL (Beltel) | PTS, PD | PTS |
| BTS (Batas) | LKT | PSS |
| PP | PK | LUPER |
| PKS | LP | PTN |
| KO (Kotor) | PLC | B (Bercak) |
| DB | J (Jarum) | R (Rusak) |
| BL (Belang) | KK | SL |
| PTR | BTA | P.TIMBUL |
| PKT | PJ | B.CELUP |
| FLY | RP | P.TUMPUK |
| LS | PB | B.BAR |
| LPB | XPD | SML |
| P.BULU | | P.SLUB |
| SMG | | P.BELANG |
| SMS | | CROSSING |
| AW | | X.SAMBUNG |
| PL | | P.JELEK |
| NA | | LIPATAN |

**All 56 defect columns are INPUT fields** - inspectors count/record each defect type.

**CALCULATED**: BMC appears to be auto-calculated from sum of defect counts.

---

### Sample Data

| Field | Value |
|-------|-------|
| TG | 2026-01-01 |
| KP | BRNS |
| D | DTL 1396 CR L5 LOT P7 |
| MC | AU07 |
| BM | 1052 |
| SN | D28L |
| SN.1 | AU071052D28L |
| GD | A (Grade) |
| BME | 440 |
| SJ | 693 |
| W | 699.1 (Width) |
| G | AN |

---

### Field Classification

**Identity/Input Fields:**
- N, TG, KP, D, MC, BM, SN, SN.1, GD, BME, SJ, W, G, OPG, TGL POTONG, NO POT

**Calculated/Auto Fields:**
- BMC - Appears to be calculated from sum of defects
- Various defect counts

---

## 2. DATA BBSF - BBSF Process Data

### File Overview
- **File**: `DATA BBSF.xlsx`
- **Sheets**: 5 sheets
- **Total Rows**: ~26,000+ rows

### Purpose
BBSF stands for **Bleaching, Brightening, Sanforizing, Finishing**. This data tracks the processing parameters at each stage of the finishing line.

---

### Sheet 1: WASHING (10,542 rows, 35 columns)

This sheet tracks the chemical washing/bleaching process.

#### Column Groups:

| Group | Columns | Description |
|-------|---------|-------------|
| **Identity** | TGL, SHIFT, MC | Date, Shift, Machine |
| **Fabric ID** | KODE 1, KODE 2, KATEGORI, BENDERA, KP | Fabric type, lot, category, flag color |
| **Process** | PROSES, SPEED, JAM PROSES | Process type, speed, duration |
| **Chemical Bath 1** | LARUTAN, TEMPERATUR, PRESS PADDER, PRESS DANCING | First chemical bath settings |
| **Chemical Bath 2** | LARUTAN, TEMPERATUR, PRESS PADDER, PRESS DANCING | Second chemical bath settings |
| **Skew/Steam** | SKEW, TEKANAN BOILER | Skew adjustment, boiler pressure |
| **Dancing Rolls** | PRESS DANCING 1, 2, 3 | Multiple pressure zones |
| **Temperature Zones** | TEMPERATUR 1-6 | 6 temperature monitoring points |
| **Measurements** | LEBAR AWAL, PANJANG AWAL | Initial width and length |
| **Quality** | PERMASALAHAN | Issues/problems noted |
| **Personnel** | PELAKSANA, MENGETAHUI | Operator, Supervisor |

#### Field Classification (WASHING):

| Field Type | Columns |
|------------|---------|
| **IDENTITY** | TGL, SHIFT, MC, KODE 1, KODE 2, KATEGORI, BENDERA, KP |
| **INPUT (Measured)** | SPEED, JAM PROSES, LARUTAN, TEMPERATUR, PRESS PADDER, PRESS DANCING, SKEW, TEKANAN BOILER, LEBAR AWAL, PANJANG AWAL |
| **INPUT (Settings)** | PROSES |
| **OUTPUT** | PERMASALAHAN |

#### Sample Data (WASHING):
| TGL | SHIFT | MC | KODE 1 | KODE 2 | KATEGORI | BENDERA | SPEED | TEMPERATUR 1 | LEBAR AWAL | PANJANG AWAL |
|-----|-------|----|--------|--------|----------|---------|-------|--------------|------------|--------------|
| 2025-05-26 | B | 2 | DTR | 1688 | SC | ORANGE | 37 | 105 | 909.2 | |
| 2025-05-27 | B | 1 | DTR | 1069 | SP | BIRU | 27/28 | 100 | 1728.4 | |

---

### Sheet 2: SANFOR PERTAMA (10,417 rows, 20 columns)

First pass sanforizing (pre-shrink) process.

#### Column Groups:

| Group | Columns |
|-------|---------|
| **Identity** | TGL, SHIFT, KODE 1, KODE 2, KATEGORI, KP, MC |
| **Process Time** | JAM |
| **Machine Settings** | SPEED, DAMPING, PRESS, TENSION, TEMPERATUR |
| **Control Limits** | TENSION LIMIT |
| **Output** | SUSUT (%) |
| **Quality** | PERMASALAHAN |
| **Personnel** | PELAKSANA, MENGETAHUI |

#### Field Classification (SANFOR PERTAMA):

| Field Type | Columns |
|------------|---------|
| **IDENTITY** | TGL, SHIFT, KODE 1, KODE 2, KATEGORI, KP, MC |
| **INPUT (Measured)** | SPEED, DAMPING, PRESS, TENSION, TEMPERATUR |
| **INPUT (Settings)** | TENSION LIMIT |
| **OUTPUT** | SUSUT (%) |
| **OUTPUT (Text)** | PERMASALAHAN |

#### Sample Data (SANFOR PERTAMA):
| TGL | SHIFT | KODE 1 | KODE 2 | SPEED | DAMPING | PRESS | TENSION | TEMPERATUR | SUSUT (%) |
|------|-------|--------|--------|-------|---------|-------|---------|------------|-----------|
| 2025-05-27 | C | DTR | 1664.6 | 39-40 | -8.5 | 1.3 | 6 | 80 | 120 |
| 2025-05-27 | C | DTR | 1664.6 | 38-39 | -8.5 | 1.3 | 6 | 80 | 120 |

---

### Sheet 3: SANFOR KEDUA (9,964 rows, 23 columns)

Second pass sanforizing process.

#### Column Groups:

| Group | Columns |
|-------|---------|
| **Identity** | TGL, SHIFT, KODE 1, KODE 2, KATEGORI, KP, MC |
| **Process Time** | JAM |
| **Machine Settings** | SPEED, DAMPING, PRESS, TENSION, TEMPERATUR |
| **Shrinkage** | SUSUT |
| **Measurements** | AWAL, AKHIR, PANJANG |
| **Quality** | PERMASALAHAN |
| **Personnel** | PELAKSANA, MENGETAHUI |

#### Sample Data (SANFOR KEDUA):
| TGL | SHIFT | KODE 1 | KODE 2 | SPEED | DAMPING | TEMPERATUR | SUSUT |
|------|-------|--------|--------|-------|---------|------------|-------|
| 2025-05-27 | A | MTR | 1565 | 20-21 | -130 | 70 | 20-21 |
| 2025-05-27 | A | MTR | 1565 | 20-21 | -130 | 70 | 20-21 |

---

### Sheet 4: SANFOR 5 (533 rows, 23 columns)

Additional sanforizing pass.

---

### Sheet 5: SERVICE DAN PREVENTIVE (112 rows, 5 columns)

Maintenance records.

| Column | Type |
|--------|------|
| TGL | IDENTITY |
| KETERANGAN | INPUT (service type) |
| MC | IDENTITY |
| NO MC | IDENTITY |
| TINDAKAN | INPUT (action) |

---

## 3. InspectFinish - Finished Fabric Inspection

### File Overview
- **File**: `Data INSPECT FINISH.xlsx`
- **Sheet**: RAW (single sheet)
- **Total Rows**: 182,847 rows
- **Total Columns**: 62 columns

### Purpose
Final inspection after BBSF (Bleaching, Brightening, Sanforizing, Finishing) process. This is the last quality control check before fabric is shipped to customers.

---

### Data Structure
**ROLL-BY-ROLL data** - Each row represents one roll of finished fabric. Multiple rolls from the same order (KP) are inspected individually.

---

### Column Structure

| # | Column | Description | Field Type |
|---|--------|-------------|------------|
| 0 | TGL | Date | **IDENTITY** (often empty, see column 3) |
| 1 | PT | Plant (usually empty) | - |
| 2 | (blank) | Empty column | - |
| 3 | T | Type = "IF" (Inspect Finish) | **IDENTITY** (constant) |
| 4 | SN | Serial/Invoice Number (KP) | **IDENTITY** |
| 5 | TGL POTONG | Cut Date | **IDENTITY** |
| 6 | SHIFT | Work Shift (A, B, C) | **IDENTITY** |
| 7 | OPR | Operator | **IDENTITY** |
| 8 | LEBAR | Width | **MEASUREMENT INPUT** |
| 9 | P | Fabric Code Part 1 | **IDENTITY** |
| 10 | I | Fabric Code Part 2 | **IDENTITY** |
| 11 | KI | Fabric Code Part 3 | **IDENTITY** |
| 12 | Y | (appears to be number data) | **MEASUREMENT INPUT** |
| 13 | GR | Grade | **OUTPUT** (assigned by QC) |
| 14 | KG | Weight (Kg) | **MEASUREMENT INPUT** |
| 15 | K | (numeric - possibly calculation) | CALCULATED |
| 16 | BR | (appears all zeros) | - |
| 17 | BTL | Beltel (Narrow Width) | **DEFECT INPUT** |
| 18 | BTS | Batas (Edge) | **DEFECT INPUT** |
| 19 | KET | Notes | **INPUT** |
| 20 | SLUB | Slub Defect | **DEFECT INPUT** |
| 21 | SNL | Sonal Defect | **DEFECT INPUT** |
| 22 | LOSP | Lost Point | **DEFECT INPUT** |
| 23 | LB | Lubang (Hole) | **DEFECT INPUT** |
| 24 | PTR | Peter Defect | **DEFECT INPUT** |
| 25 | P.SLUB | Primary Slub | **DEFECT INPUT** |
| 26 | PB | Primary Bubble | **DEFECT INPUT** |
| 27 | LM | Defect Code | **DEFECT INPUT** |
| 28 | K2 | Defect Code | **DEFECT INPUT** |
| 29 | AW | Defect Code | **DEFECT INPUT** |
| 30 | PTM | Defect Code | **DEFECT INPUT** |
| 31 | J | Jarum (Needle) | **DEFECT INPUT** |
| 32 | BTA | Bintik (Dot/Spot) | **DEFECT INPUT** |
| 33 | PTS | Defect Code | **DEFECT INPUT** |
| 34 | PD | Defect Code | **DEFECT INPUT** |
| 35 | PP | Defect Code | **DEFECT INPUT** |
| 36 | PKS | Defect Code | **DEFECT INPUT** |
| 37 | PSS | Defect Code | **DEFECT INPUT** |
| 38 | PKL | Defect Code | **DEFECT INPUT** |
| 39 | PK | Defect Code | **DEFECT INPUT** |
| 40 | PLC | Defect Code | **DEFECT INPUT** |
| 41 | LP | Defect Code | **DEFECT INPUT** |
| 42 | LKS | Lobang Kertas | **DEFECT INPUT** |
| 43 | LKC | Lobang Kain | **DEFECT INPUT** |
| 44 | LD | Lobang Diameter | **DEFECT INPUT** |
| 45 | LKT | Luka Tipis | **DEFECT INPUT** |
| 46 | LKI | Luka Kain | **DEFECT INPUT** |
| 47 | BMC | Beam Count | **INPUT** |
| 48 | EXST | Existing | **INPUT** |
| 49 | SMG | Sumur Generator | **INPUT** |
| 50 | BLPT GREY | Blueprint Grey | **REFERENCE** |
| 51 | BL WS | Blueprint Width Standard | **REFERENCE** |
| 52 | BL BB | Blueprint Brightness | **REFERENCE** |
| 53 | BLPT | Blueprint | **REFERENCE** |
| 54 | BTTS | Batas (Tolerance) | **REFERENCE** |
| 55 | NODA | Noda (Stain) | **QUALITY INPUT** |
| 56 | KOTOR | Kotor (Dirty) | **QUALITY INPUT** |
| 57 | BKRT | Bau Kering (Dry Smell) | **QUALITY INPUT** |
| 58 | LPTD | Defect Code | **DEFECT INPUT** |
| 59 | SUSUT LUSI | Shrinkage Warp | **MEASUREMENT INPUT** |
| 60 | POINT | Total Defect Points | **CALCULATED** |
| 61 | Column3 | Lot/Code | **IDENTITY** |

---

### Field Classification Summary

| Category | Columns | Count |
|----------|---------|-------|
| **IDENTITY** | T, SN, TGL POTONG, SHIFT, OPR, P, I, KI, Column3 | 9 |
| **MEASUREMENT INPUT** | LEBAR, KG, SUSUT LUSI | 3 |
| **QUALITY INPUT** | NODA, KOTOR, BKRT | 3 |
| **DEFECT INPUT** | SLUB, SNL, LOSP, LB, PTR, P.SLUB, PB, LM, K2, AW, PTM, J, BTA, PTS, PD, PP, PKS, PSS, PKL, PK, PLC, LP, LKS, LKC, LD, LKT, LKI, LPTD, BTL, BTS | 30 |
| **OUTPUT** | GR (Grade) | 1 |
| **CALCULATED** | POINT, K | 2 |
| **REFERENCE** | BLPT GREY, BL WS, BL BB, BLPT, BTTS | 5 |
| **OTHER** | PT, (blank), BR, BMC, EXST, SMG, KET | 7 |

---

### Sample Data

| Field | Row 1 | Row 2 | Row 3 |
|-------|-------|-------|-------|
| T | IF | IF | IF |
| SN | Y04156F08L | Y04156F08L | Y04132F21L |
| TGL POTONG | | | 2025-02-23 |
| SHIFT | B | B | C |
| OPR | SM/EL | SM/EL | NJ/RS |
| LEBAR | 60 | 60 | 60.5 |
| P | BHQE | BHQE | BHJT |
| I | DDR 626.2 CR KF | DDR 626.2 CR KF | SDR 638.1 CR LOT P5 N |
| GR | JD | JD | AXP 1 |
| KG | 9.7 | 15.6 | 40.8 |
| SUSUT LUSI | 13 | 13 | 10 |
| POINT | 0.85 | 0.85 | (0.08) |
| Column3 | FL22/2-3 | FL22/2-3 | FL27/2-3 |

---

### Key Observations

1. **Same order, multiple rolls**: SN `Y04156F08L` appears in multiple rows with different KG values (9.7, 15.6) - this confirms roll-by-roll inspection.

2. **POINT can be negative**: Some POINT values show like `(0.08)` - likely indicates bonus points or negative defect score.

3. **Many empty columns**: Many defect columns have sparse data - inspectors only fill relevant defects.

4. **K column appears calculated**: Column K shows decimal values (3.09, 3.17, etc.) - possibly shrinkage ratio or efficiency metric.

---

## 4. Key Differences: InspectGrey vs BBSF vs InspectFinish

| Aspect | InspectGrey | BBSF (Processing) | InspectFinish |
|--------|-------------|-------------------|---------------|
| **Stage** | Before processing (grey/greige) | During BBSF processing | After BBSF (finished) |
| **Rows** | ~8,500 | ~26,000 | ~182,000 |
| **Columns** | 72 | 20-35 | 62 |
| **Purpose** | Raw fabric QC | Process parameters tracking | Final product QC |
| **Key Fields** | BMC (total defects), GD (grade) | Speed, Temperature, Pressure, Damping | POINT (defect points), GR (grade) |
| **Measurements** | Width (W), BME | LEBAR AWAL/PANJANG AWAL | LEBAR (width), KG (weight), SUSUT LUSI |
| **Data Type** | Inspection results | Process parameters | Inspection results |

---

## 5. Typical Denim Fabric Final Inspection (Inspect Finish)

Based on the InspectFinish Excel, here's what a typical final inspection involves:

### Physical Measurements
- **LEBAR (Width)**: Measured width of finished fabric (typically 58-64 inches for denim)
- **KG (Weight)**: Roll weight in kilograms
- **SUSUT LUSI**: Warp shrinkage percentage - critical for garment making

### Defect Scoring
The inspection uses a point system where each defect type has a severity rating:
- **SLUB**: Slub irregularities (thick/thin yarn)
- **NODA**: Stains (oil, dirt, chemical marks)
- **KOTOR**: Dirty marks
- **BKRT**: Dry smell (chemical残留)
- Various defect counts for holes, tears, needle marks, etc.

### Point System
- **POINT**: Total calculated defect score per roll
- Rolls with POINT above threshold are rejected or downgraded
- Grade is assigned based on POINT total

### Blueprint Reference
- **BLPT GREY**: Reference to original grey fabric blueprint
- **BL WS**: Width standard (target width)
- **BL BB**: Brightness standard (color consistency)

### Quality Output
- **GR (Grade)**: Final grade (A, B, C, etc.)
- Multiple rolls from same order get individual inspection
- Same order may have different grades per roll

---

## 6. Recommendations for ERP Implementation

### InspectGrey Record Model
Should include:
- Date, KP (order code), fabric description
- Machine code, beam number
- Grade (GD), Width (W), BME
- 56 defect type counts
- BMC (total defect count - calculated)

### BBSF Record Model
Each stage (Washing, Sanfor 1, Sanfor 2) should track:
- Date, Shift, Machine Number
- Fabric codes (KODE 1, KODE 2), Category, KP
- Process parameters: Speed, Temperature, Pressure, Damping
- Measurements: LEBAR AWAL, PANJANG AWAL
- Shrinkage (SUSUT %)
- Operator, Supervisor
- Issues/Problems noted

### InspectFinish Record Model
Should include:
- Date, SN (invoice/roll number), Type="IF"
- Shift, Operator
- Fabric codes (P, I, KI, Y), Grade (GR)
- Width, Weight (KG)
- All defect counts
- POINT (calculated total)
- Shrinkage (SUSUT LUSI)
- Quality flags: NODA, KOTOR, BKRT
- Blueprint references
