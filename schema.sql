-- ============================================
-- YARN QUALITY ERP - DATABASE SCHEMA
-- ============================================
-- Created for: PT Triputra Textile Industry (Spinning Division)
-- Based on: Yarn Quality Report SSM Excel files
-- ============================================
-- NOTE: Count Description CODE is the PRIMARY KEY (1-36)
-- ============================================

-- Drop existing tables if needed (uncomment for fresh start)
-- DROP TABLE IF EXISTS yarn_tests;
-- DROP TABLE IF EXISTS count_descriptions;
-- DROP TABLE IF EXISTS lots;
-- DROP TABLE IF EXISTS spks;
-- DROP TABLE IF EXISTS yarn_types;
-- DROP TABLE IF EXISTS suppliers;
-- DROP TABLE IF EXISTS mills_units;
-- DROP TABLE IF EXISTS process_steps;
-- DROP TABLE IF EXISTS test_types;
-- DROP TABLE IF EXISTS sides;
-- DROP TABLE IF EXISTS slub_codes;

-- ============================================
-- DIMENSION TABLES (Lookup Tables)
-- ============================================

-- Count Descriptions (e.g., "E 7s 4600,0 LL28 D2")
-- CODE (1-36) is the PRIMARY KEY
CREATE TABLE count_descriptions (
    code INT PRIMARY KEY COMMENT 'Primary key - Original code from Excel (1-36)',
    name VARCHAR(255) NOT NULL COMMENT 'Full count description',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Lots (e.g., "4600,0", "1000,0", "4006,0")
CREATE TABLE lots (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code INT UNIQUE NOT NULL COMMENT 'Original code from Excel (101-136)',
    name VARCHAR(100) NOT NULL COMMENT 'Lot number/identifier',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SPKs (e.g., "LL23 D2", "LL28 D2", "NL04 AX D2")
CREATE TABLE spks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code INT UNIQUE NOT NULL COMMENT 'Original code from Excel (201-236)',
    name VARCHAR(100) NOT NULL COMMENT 'SPK identifier',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Yarn Types (e.g., "Normal", "Fancy")
CREATE TABLE yarn_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code INT UNIQUE NOT NULL COMMENT 'Original code from Excel (301-336)',
    name VARCHAR(100) NOT NULL COMMENT 'Yarn type name',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Suppliers (e.g., "SSM")
CREATE TABLE suppliers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code INT UNIQUE NOT NULL COMMENT 'Original code from Excel (401-436)',
    name VARCHAR(100) NOT NULL COMMENT 'Supplier name',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Mills Units (e.g., "OE", "RS")
CREATE TABLE mills_units (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code INT UNIQUE NOT NULL COMMENT 'Original code from Excel (501-536)',
    name VARCHAR(50) NOT NULL COMMENT 'Mills unit name (OE, RS, etc.)',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Process Steps (e.g., "Rotor", "Ring", "Winding")
CREATE TABLE process_steps (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code INT UNIQUE NOT NULL COMMENT 'Original code from Excel (601-636)',
    name VARCHAR(100) NOT NULL COMMENT 'Process step name',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Test Types (e.g., "Routine", "Sample", "Experiment")
CREATE TABLE test_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code INT UNIQUE NOT NULL COMMENT 'Original code from Excel (701-736)',
    name VARCHAR(100) NOT NULL COMMENT 'Test type name',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sides (e.g., "kanan", "Kiri", "N/A")
CREATE TABLE sides (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(10) UNIQUE NOT NULL COMMENT 'Original code from Excel (I1-I36)',
    name VARCHAR(50) NOT NULL COMMENT 'Side name (kanan, kiri, N/A)',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Slub Codes (optional - for fancy yarns)
CREATE TABLE slub_codes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) UNIQUE COMMENT 'Slub code (e.g., 107, or NULL for none)',
    description VARCHAR(255) COMMENT 'Description of slub pattern',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- MAIN FACT TABLE - Yarn Test Results
-- ============================================

CREATE TABLE yarn_tests (
    -- Primary Key
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    
    -- Date/Time Information
    test_date DATE NOT NULL COMMENT 'Date of test (Tanggal)',
    test_month VARCHAR(20) COMMENT 'Month name (Bulan)',
    test_year INT COMMENT 'Year (Tahun)',
    
    -- Foreign Keys to Dimension Tables
    -- NOTE: count_description_code uses the CODE directly as FK (not an auto-increment ID)
    count_description_code INT COMMENT 'FK to count_descriptions.code (PRIMARY KEY)',
    nominal_count DECIMAL(10,2) COMMENT 'Nom. Count',
    lot_id INT COMMENT 'FK to lots',
    spk_id INT COMMENT 'FK to spks',
    yarn_type_id INT COMMENT 'FK to yarn_types',
    slub_code_id INT COMMENT 'FK to slub_codes (nullable)',
    supplier_id INT COMMENT 'FK to suppliers',
    mills_unit_id INT COMMENT 'FK to mills_units',
    process_step_id INT COMMENT 'FK to process_steps',
    test_type_id INT COMMENT 'FK to test_types',
    machine_no INT COMMENT 'MC. No.',
    side_id INT COMMENT 'FK to sides',
    
    -- Spinning Parameters
    sliver_roving_ne DECIMAL(10,3) COMMENT 'Sliver / Roving (Ne)',
    total_draft DECIMAL(10,2) COMMENT 'Total Draft',
    twist_multiplier DECIMAL(10,2) COMMENT 'TM ?',
    tpi DECIMAL(10,2) COMMENT 'TPI (Twists Per Inch)',
    tpm DECIMAL(10,2) COMMENT 'TPM (Twists Per Meter)',
    actual_twist INT COMMENT 'Actual Twist',
    rotor_spindle_speed INT COMMENT 'Rotor / Spindle Speed',
    
    -- Count Variation (Evenness)
    mean_ne DECIMAL(10,2) COMMENT 'Mean Ne',
    min_ne DECIMAL(10,2) COMMENT 'Min Ne',
    max_ne DECIMAL(10,2) COMMENT 'Max Ne',
    cv_count_percent DECIMAL(10,2) COMMENT 'CV% Count',
    
    -- Strength Properties
    mean_strength_cn DECIMAL(10,2) COMMENT 'Mean Strength CN',
    min_strength_cn DECIMAL(10,2) COMMENT 'Min Strength CN',
    max_strength_cn DECIMAL(10,2) COMMENT 'Max Strength CN',
    cv_strength_percent DECIMAL(10,2) COMMENT 'CV% Strength',
    tenacity_cn_tex DECIMAL(10,2) COMMENT 'Tenacity (CN/Tex)',
    elongation_percent DECIMAL(10,2) COMMENT 'Elongation%',
    clsp DECIMAL(10,2) COMMENT 'CLSP',
    
    -- Evenness / Uster Data
    u_percent DECIMAL(10,2) COMMENT 'U%',
    cv_b DECIMAL(10,2) COMMENT 'CVb',
    cvm DECIMAL(10,2) COMMENT 'CVm',
    cvm_1m DECIMAL(10,2) COMMENT 'CVm 1m',
    cvm_3m DECIMAL(10,2) COMMENT 'CVm 3m',
    cvm_10m DECIMAL(10,2) COMMENT 'CVm 10m',
    
    -- IPI Faults (Ring Spinning)
    thin_50_percent INT COMMENT 'Thin-50%',
    thick_50_percent INT COMMENT 'Thick+50%',
    neps_200_percent INT COMMENT 'Neps+200%',
    neps_280_percent INT COMMENT 'Neps+280%',
    ipis INT COMMENT 'IPIs',
    
    -- IPI Faults (Open End)
    oe_ipi INT COMMENT 'OE IPI',
    thin_30_percent INT COMMENT 'Thin-30%',
    thin_40_percent INT COMMENT 'Thin-40%',
    thick_35_percent INT COMMENT 'Thick+35%',
    neps_140_percent INT COMMENT 'Neps+140%',
    short_ipi INT COMMENT 'Short IPI',
    
    -- Hairiness & Spectrogram
    hairiness DECIMAL(10,2) COMMENT 'Hairiness',
    sh DECIMAL(10,2) COMMENT 'Sh',
    s1u_plus_s2u DECIMAL(10,2) COMMENT 'S1u + S2u',
    s3u DECIMAL(10,2) COMMENT 'S3u',
    dr_1_5m_5_percent DECIMAL(10,2) COMMENT 'DR 1.5m 5% (%)',
    
    -- Remarks
    remarks TEXT COMMENT 'Remarks',
    
    -- Audit Fields
    created_by INT COMMENT 'User ID who created this record',
    updated_by INT COMMENT 'User ID who last updated this record',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Key Constraints
    -- NOTE: count_description_code references the CODE directly (which is the PRIMARY KEY)
    CONSTRAINT fk_yarn_test_count_description FOREIGN KEY (count_description_code) 
        REFERENCES count_descriptions(code) ON DELETE SET NULL,
    CONSTRAINT fk_yarn_test_lot FOREIGN KEY (lot_id) 
        REFERENCES lots(id) ON DELETE SET NULL,
    CONSTRAINT fk_yarn_test_spk FOREIGN KEY (spk_id) 
        REFERENCES spks(id) ON DELETE SET NULL,
    CONSTRAINT fk_yarn_test_yarn_type FOREIGN KEY (yarn_type_id) 
        REFERENCES yarn_types(id) ON DELETE SET NULL,
    CONSTRAINT fk_yarn_test_slub_code FOREIGN KEY (slub_code_id) 
        REFERENCES slub_codes(id) ON DELETE SET NULL,
    CONSTRAINT fk_yarn_test_supplier FOREIGN KEY (supplier_id) 
        REFERENCES suppliers(id) ON DELETE SET NULL,
    CONSTRAINT fk_yarn_test_mills_unit FOREIGN KEY (mills_unit_id) 
        REFERENCES mills_units(id) ON DELETE SET NULL,
    CONSTRAINT fk_yarn_test_process_step FOREIGN KEY (process_step_id) 
        REFERENCES process_steps(id) ON DELETE SET NULL,
    CONSTRAINT fk_yarn_test_test_type FOREIGN KEY (test_type_id) 
        REFERENCES test_types(id) ON DELETE SET NULL,
    CONSTRAINT fk_yarn_test_side FOREIGN KEY (side_id) 
        REFERENCES sides(id) ON DELETE SET NULL,
    
    -- Indexes for Performance
    INDEX idx_test_date (test_date),
    INDEX idx_test_year_month (test_year, test_month),
    INDEX idx_count_description_code (count_description_code),
    INDEX idx_lot (lot_id),
    INDEX idx_spk (spk_id),
    INDEX idx_supplier (supplier_id),
    INDEX idx_mills_unit (mills_unit_id),
    INDEX idx_process_step (process_step_id),
    INDEX idx_test_type (test_type_id),
    INDEX idx_machine_no (machine_no),
    INDEX idx_created_at (created_at)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SAMPLE DATA INSERTION
-- ============================================
-- Insert Count Descriptions (using CODE as PRIMARY KEY)
INSERT INTO count_descriptions (code, name) VALUES
(1, 'E 7s 4600,0 LL28 D2'),
(2, 'E 10s 4600,0 LL28 D2'),
(3, 'E 16s 4600,0 LL28 D2'),
(4, 'RSM 10,7 1000,0 LL23 D2'),
(5, 'RS 10,7 4006,0 NL04 AX D2'),
(6, 'RS 10,8 4006,0 NL04 AX D2')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Example: Insert Lots
-- INSERT INTO lots (code, name) VALUES
-- (101, '1000,0'),
-- (102, '4006,0'),
-- (103, '4600,0');

-- Example: Insert SPKs
-- INSERT INTO spks (code, name) VALUES
-- (201, 'LL23 D2'),
-- (202, 'LL28 D2'),
-- (203, 'NL04 AX D2');

-- Example: Insert Yarn Types
-- INSERT INTO yarn_types (code, name) VALUES
-- (301, 'Normal'),
-- (302, 'Fancy');

-- Example: Insert Suppliers
-- INSERT INTO suppliers (code, name) VALUES
-- (401, 'SSM');

-- Example: Insert Mills Units
-- INSERT INTO mills_units (code, name) VALUES
-- (501, 'OE'),
-- (502, 'RS');

-- Example: Insert Process Steps
-- INSERT INTO process_steps (code, name) VALUES
-- (601, 'Rotor'),
-- (602, 'Ring'),
-- (603, 'Winding');

-- Example: Insert Test Types
-- INSERT INTO test_types (code, name) VALUES
-- (701, 'Routine'),
-- (702, 'Sample'),
-- (703, 'Experiment');

-- Example: Insert Sides
-- INSERT INTO sides (code, name) VALUES
-- ('I1', 'kanan'),
-- ('I2', 'Kiri'),
-- ('I3', 'N/A');

-- ============================================
-- END OF SCHEMA
-- ============================================
