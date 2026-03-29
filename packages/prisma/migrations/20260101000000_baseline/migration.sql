-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "count_descriptions" (
    "code" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "count_descriptions_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "count_ne" (
    "id" SERIAL NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "count_ne_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lots" (
    "id" SERIAL NOT NULL,
    "code" INTEGER,
    "name" VARCHAR(100) NOT NULL,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "blend_id" INTEGER,

    CONSTRAINT "lots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spks" (
    "id" SERIAL NOT NULL,
    "code" INTEGER,
    "name" VARCHAR(100) NOT NULL,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "ac" DECIMAL(14,2),
    "blow_room_clx_combine" DECIMAL(14,2),
    "blow_room_filter_combine" DECIMAL(14,2),
    "box_filter_oe" DECIMAL(14,2),
    "carding_filter_combine" DECIMAL(14,2),
    "comber_noil_pct_on_combed_yarn" DECIMAL(14,2),
    "dust" DECIMAL(14,2),
    "grand_total" DECIMAL(14,2),
    "hard_waste" DECIMAL(14,2),
    "imported_cotton_used_in_local" DECIMAL(6,2),
    "invisible" DECIMAL(14,2),
    "lot_id" INTEGER,
    "mills_unit_id" INTEGER,
    "rayon_brand_id" INTEGER,
    "total_soft_waste" DECIMAL(14,2),
    "total_waste_and_invisible" DECIMAL(14,2),
    "use_waste" DECIMAL(14,2),
    "weight_issued_to_blow_room" DECIMAL(14,2),
    "yarn_produced_yield_percent" DECIMAL(6,2),

    CONSTRAINT "spks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "yarn_types" (
    "id" SERIAL NOT NULL,
    "code" INTEGER,
    "name" VARCHAR(100) NOT NULL,
    "letter_code" VARCHAR(10) NOT NULL,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "yarn_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blends" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "letter_code" VARCHAR(10) NOT NULL,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blends_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "slub_codes" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(50),
    "description" VARCHAR(255),
    "name" VARCHAR(100),
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "slub_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kp" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kodes" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(100) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id" SERIAL NOT NULL,
    "code" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mills_units" (
    "id" SERIAL NOT NULL,
    "code" INTEGER NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "letter_code" VARCHAR(10) NOT NULL,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mills_units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "process_steps" (
    "id" SERIAL NOT NULL,
    "code" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "process_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_types" (
    "id" SERIAL NOT NULL,
    "code" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "test_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sides" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warna_cone_cheese" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "warna_cone_cheese_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rayon_brand" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "letter_code" VARCHAR(1),
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rayon_brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "yarn_tests" (
    "id" BIGSERIAL NOT NULL,
    "test_date" DATE NOT NULL,
    "test_month" VARCHAR(20),
    "test_year" INTEGER,
    "count_description_code" INTEGER,
    "count_ne_id" INTEGER,
    "lot_id" INTEGER,
    "spk_id" INTEGER,
    "yarn_type_id" INTEGER,
    "blend_id" INTEGER,
    "slub_code_id" INTEGER,
    "supplier_id" INTEGER,
    "mills_unit_id" INTEGER,
    "process_step_id" INTEGER,
    "test_type_id" INTEGER,
    "machine_no" INTEGER,
    "side_id" INTEGER,
    "sliver_roving_ne" DECIMAL(10,3),
    "total_draft" DECIMAL(10,2),
    "twist_multiplier" DECIMAL(10,2),
    "tpi" DECIMAL(10,2),
    "tpm" DECIMAL(10,2),
    "actual_twist" INTEGER,
    "rotor_spindle_speed" INTEGER,
    "mean_ne" DECIMAL(10,2),
    "min_ne" DECIMAL(10,2),
    "max_ne" DECIMAL(10,2),
    "cv_count_percent" DECIMAL(10,2),
    "mean_strength_cn" DECIMAL(10,2),
    "min_strength_cn" DECIMAL(10,2),
    "max_strength_cn" DECIMAL(10,2),
    "cv_strength_percent" DECIMAL(10,2),
    "tenacity_cn_tex" DECIMAL(10,2),
    "elongation_percent" DECIMAL(10,2),
    "clsp" DECIMAL(10,2),
    "u_percent" DECIMAL(10,2),
    "cv_b" DECIMAL(10,2),
    "cv_m" DECIMAL(10,2),
    "cvm_1m" DECIMAL(10,2),
    "cvm_3m" DECIMAL(10,2),
    "cvm_10m" DECIMAL(10,2),
    "thin_50_percent" INTEGER,
    "thick_50_percent" INTEGER,
    "neps_200_percent" INTEGER,
    "neps_280_percent" INTEGER,
    "ipis" INTEGER,
    "oe_ipi" INTEGER,
    "thin_30_percent" INTEGER,
    "thin_40_percent" INTEGER,
    "thick_35_percent" INTEGER,
    "neps_140_percent" INTEGER,
    "short_ipi" INTEGER,
    "hairiness" DECIMAL(10,2),
    "sh" DECIMAL(10,2),
    "s1u_plus_s2u" DECIMAL(10,2),
    "s3u" DECIMAL(10,2),
    "dr_1_5m_5_percent" DECIMAL(10,2),
    "remarks" TEXT,
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "yarn_tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_records" (
    "id" BIGSERIAL NOT NULL,
    "production_date" DATE NOT NULL,
    "month" VARCHAR(20) NOT NULL,
    "year" INTEGER,
    "mills_unit_id" INTEGER NOT NULL,
    "yarn_type_id" INTEGER NOT NULL,
    "count_ne_id" INTEGER NOT NULL,
    "count_ne_value" DECIMAL(10,2) NOT NULL,
    "count_description_code" INTEGER,
    "slub_code_id" INTEGER,
    "lot_id" INTEGER,
    "spk_id" INTEGER,
    "blend_id" INTEGER,
    "warna_cone_cheese_id" INTEGER,
    "rayon_brand_id" INTEGER,
    "berat_cone_cheese_kg" DECIMAL(10,3) NOT NULL,
    "tm" DECIMAL(10,2) NOT NULL,
    "tpi" DECIMAL(10,3) NOT NULL,
    "speed" INTEGER NOT NULL,
    "jumlah_spindel_rotor_terpasang" INTEGER NOT NULL,
    "jumlah_cones_cheese" INTEGER NOT NULL,
    "produksi_kgs" DECIMAL(14,3) NOT NULL,
    "produksi_lbs" DECIMAL(14,3) NOT NULL,
    "aktual_produksi_bales" DECIMAL(14,4) NOT NULL,
    "produksi_100_percent_bales" DECIMAL(14,4) NOT NULL,
    "target_produksi_on_target_opr_bales" DECIMAL(14,4) NOT NULL,
    "keuntungan_kerugian_efisiensi_bales_on_target_ops_opr" DECIMAL(14,4) NOT NULL,
    "target_ops_opr" DECIMAL(12,6) NOT NULL,
    "ops_opr_aktual" DECIMAL(12,6) NOT NULL,
    "ops_opr_worked" DECIMAL(12,6) NOT NULL,
    "produksi_effisiensi_percent" DECIMAL(8,4) NOT NULL,
    "effisiensi_kerja_percent" DECIMAL(8,4) NOT NULL,
    "power_electric_min" INTEGER,
    "count_mengubah_min" INTEGER,
    "creel_mengubah_min" INTEGER,
    "preventive_mtc_min" INTEGER,
    "creel_short_stoppage_min" INTEGER,
    "total_penghentian_min" INTEGER,
    "spindles_rotors_bekerja" DECIMAL(14,4),
    "spindles_rotors_effisiensi" DECIMAL(10,6),
    "power_penghentian" DECIMAL(14,4),
    "count_mengubah_loss" DECIMAL(14,4),
    "creel_mengubah_loss" DECIMAL(14,4),
    "preventive_mtc_loss" DECIMAL(14,4),
    "creel_short_loss" DECIMAL(14,4),
    "kerugian_total" DECIMAL(14,4),
    "harga_benang_per_bale" DECIMAL(12,2),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "production_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "indigo_division_records" (
    "id" BIGSERIAL NOT NULL,
    "tanggal" DATE NOT NULL,
    "mc" INTEGER NOT NULL,
    "kp" VARCHAR(50),
    "code" VARCHAR(100),
    "count_description_code" INTEGER,
    "ne" VARCHAR(50),
    "p" DECIMAL(10,3),
    "te" DECIMAL(10,3),
    "bb" DECIMAL(10,3),
    "speed" DECIMAL(10,3),
    "bak_celup" DECIMAL(10,3),
    "bak_sulfur" DECIMAL(10,3),
    "konst_idg" DECIMAL(10,3),
    "konst_sulfur" DECIMAL(10,3),
    "visc" DECIMAL(10,3),
    "ref" DECIMAL(10,3),
    "size_box" DECIMAL(10,3),
    "scoring" DECIMAL(10,3),
    "jetsize" DECIMAL(10,3),
    "polisize_hs" DECIMAL(10,3),
    "polisize_1_2" DECIMAL(10,3),
    "armosize" DECIMAL(10,3),
    "armosize_1_1" DECIMAL(10,3),
    "armosize_1_2" DECIMAL(10,3),
    "armosize_1_3" DECIMAL(10,3),
    "armosize_1_5" DECIMAL(10,3),
    "armosize_1_7" DECIMAL(10,3),
    "quqlaxe" DECIMAL(10,3),
    "armo_c" DECIMAL(10,3),
    "vit_e" DECIMAL(10,3),
    "armo_d" DECIMAL(10,3),
    "tapioca" DECIMAL(10,3),
    "a_308" DECIMAL(10,3),
    "indigo" DECIMAL(10,3),
    "caustic_pemasakan_indigo" DECIMAL(10,3),
    "hydro" DECIMAL(10,3),
    "solopol_pemasakan_indigo" DECIMAL(10,3),
    "serawet_pemasakan_indigo" DECIMAL(10,3),
    "primasol_pemasakan_indigo" DECIMAL(10,3),
    "cottoclarin_pemasakan_indigo" DECIMAL(10,3),
    "setamol" DECIMAL(10,3),
    "granular" DECIMAL(10,3),
    "granule" DECIMAL(10,3),
    "grain" DECIMAL(10,3),
    "wet_matic" DECIMAL(10,3),
    "fisat" DECIMAL(10,3),
    "breviol" DECIMAL(10,3),
    "csk" DECIMAL(10,3),
    "comee" DECIMAL(10,3),
    "dirsol_rdp" DECIMAL(10,3),
    "primasol_nf" DECIMAL(10,3),
    "zolopol_phtr_zb" DECIMAL(10,3),
    "cottoclarin_pemasakan_caustik" DECIMAL(10,3),
    "sanwet" DECIMAL(10,3),
    "marcerize_coustic" DECIMAL(10,3),
    "sanmercer" DECIMAL(10,3),
    "sancomplex" DECIMAL(10,3),
    "exsess_caustic" DECIMAL(10,3),
    "exsess_hydro" DECIMAL(10,3),
    "dextoor" DECIMAL(10,3),
    "ltr" DECIMAL(10,3),
    "diresol_black_kas_rotkas" DECIMAL(10,3),
    "sansul_sdc" DECIMAL(10,3),
    "caustic_pemasakan_sulfur" DECIMAL(10,3),
    "dextros" DECIMAL(10,3),
    "solopol_pemasakan_sulfur" DECIMAL(10,3),
    "primasol_pemasakan_sulfur" DECIMAL(10,3),
    "serawet_pemasakan_sulfur" DECIMAL(10,3),
    "cottoclarin_pemasakan_sulfur" DECIMAL(10,3),
    "saneutral" DECIMAL(10,3),
    "dextrose_adjust" DECIMAL(10,3),
    "optifik_rsl" DECIMAL(10,3),
    "ekalin_f" DECIMAL(10,3),
    "solopol_phtr" DECIMAL(10,3),
    "moiture_mahlo" DECIMAL(10,3),
    "temp_dryer" DECIMAL(10,3),
    "temp_mid_dryer" DECIMAL(10,3),
    "temp_size_box_1" DECIMAL(10,3),
    "temp_size_box_2" DECIMAL(10,3),
    "size_box_1" DECIMAL(10,3),
    "size_box_2" DECIMAL(10,3),
    "squeezing_roll_1" DECIMAL(10,3),
    "squeezing_roll_2" DECIMAL(10,3),
    "immersion_roll" DECIMAL(10,3),
    "dryer" DECIMAL(10,3),
    "take_off" DECIMAL(10,3),
    "winding" DECIMAL(10,3),
    "press_beam" DECIMAL(10,3),
    "hydrolic_pump_1" DECIMAL(10,3),
    "hydrolic_pump_2" DECIMAL(10,3),
    "unwinder" DECIMAL(10,3),
    "dyeing_tens_wash" DECIMAL(10,3),
    "dyeing_tens_warna" DECIMAL(10,3),
    "mc_idg" DECIMAL(10,3),
    "strength" DECIMAL(10,3),
    "elongasi_idg" DECIMAL(10,3),
    "cv_percent" DECIMAL(10,3),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "kode_id" INTEGER,
    "kp_id" INTEGER,

    CONSTRAINT "indigo_division_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesContract" (
    "id" SERIAL NOT NULL,
    "kp" TEXT NOT NULL,
    "tgl" TIMESTAMP(3) NOT NULL,
    "permintaan" TEXT,
    "codename" TEXT,
    "kons_kode" TEXT,
    "kode_number" TEXT,
    "kat_kode" TEXT,
    "ket_ct_ws" TEXT,
    "ket_warna" TEXT,
    "status" TEXT,
    "te" DECIMAL(65,30),
    "sisir" TEXT,
    "p_kons" TEXT,
    "ne_k_lusi" TEXT,
    "ne_lusi" DECIMAL(65,30),
    "sp_lusi" TEXT,
    "lot_lusi" TEXT,
    "ne_k_pakan" TEXT,
    "ne_pakan" DECIMAL(65,30),
    "sp_pakan" TEXT,
    "j" DECIMAL(65,30),
    "j_c" DECIMAL(65,30),
    "b_c" DECIMAL(65,30),
    "tb" DECIMAL(65,30),
    "tb_real" DECIMAL(65,30),
    "bale_lusi" DECIMAL(65,30),
    "total_pakan" DECIMAL(65,30),
    "bale_pakan" DECIMAL(65,30),
    "ts" TIMESTAMP(3),
    "sacon" BOOLEAN NOT NULL DEFAULT false,
    "acc" TEXT,
    "proses" TEXT,
    "foto_sacon" TEXT,
    "remarks" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "pipeline_status" TEXT NOT NULL DEFAULT 'DRAFT',
    "weaving_confirmed_at" TIMESTAMP(3),
    "kp_sequence" INTEGER,
    "kp_status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "archived_at" TIMESTAMP(3),
    "archived_kp" TEXT,
    "rejection_reason" TEXT,

    CONSTRAINT "SalesContract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WarpingRun" (
    "id" SERIAL NOT NULL,
    "kp" TEXT NOT NULL,
    "tgl" TIMESTAMP(3) NOT NULL,
    "start_time" TEXT,
    "stop_time" TEXT,
    "kode_full" TEXT,
    "benang" TEXT,
    "lot" TEXT,
    "sp" TEXT,
    "pt" INTEGER,
    "te" DECIMAL(65,30),
    "rpm" DOUBLE PRECISION,
    "mtr_min" DECIMAL(65,30),
    "total_putusan" INTEGER,
    "data_putusan" TEXT,
    "total_beam" INTEGER,
    "cn_1" DECIMAL(65,30),
    "jam" DECIMAL(65,30),
    "total_waktu" DECIMAL(65,30),
    "eff_warping" DECIMAL(65,30),
    "no_mc" INTEGER,
    "elongasi" DECIMAL(65,30),
    "strength" DECIMAL(65,30),
    "cv_pct" DECIMAL(65,30),
    "tension_badan" INTEGER,
    "tension_pinggir" INTEGER,
    "lebar_creel" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "mtr_per_min" DOUBLE PRECISION,
    "start" TEXT,
    "stop" TEXT,

    CONSTRAINT "WarpingRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WarpingBeam" (
    "id" SERIAL NOT NULL,
    "warping_run_id" INTEGER NOT NULL,
    "kp" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "beam_number" INTEGER NOT NULL,
    "putusan" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "jumlah_ends" INTEGER,
    "panjang_beam" DOUBLE PRECISION,

    CONSTRAINT "WarpingBeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndigoRun" (
    "id" SERIAL NOT NULL,
    "kp" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "mc" DECIMAL(65,30),
    "kode_full" TEXT,
    "ne" TEXT,
    "p" DECIMAL(65,30),
    "te" DECIMAL(65,30),
    "bb" DECIMAL(65,30),
    "speed" DECIMAL(65,30),
    "bak_celup" DECIMAL(65,30),
    "bak_sulfur" DECIMAL(65,30),
    "konst_idg" DECIMAL(65,30),
    "konst_sulfur" DECIMAL(65,30),
    "visc" DECIMAL(65,30),
    "ref" DECIMAL(65,30),
    "size_box" DECIMAL(65,30),
    "scoring" DECIMAL(65,30),
    "jetsize" DECIMAL(65,30),
    "polisize_hs" DECIMAL(65,30),
    "polisize_1_2" DECIMAL(65,30),
    "armosize" DECIMAL(65,30),
    "armosize_1_1" DECIMAL(65,30),
    "armosize_1_2" DECIMAL(65,30),
    "armosize_1_3" DECIMAL(65,30),
    "armosize_1_5" DECIMAL(65,30),
    "armosize_1_7" DECIMAL(65,30),
    "quqlaxe" DECIMAL(65,30),
    "armo_c" DECIMAL(65,30),
    "vit_e" DECIMAL(65,30),
    "armo_d" DECIMAL(65,30),
    "tapioca" DECIMAL(65,30),
    "a_308" DECIMAL(65,30),
    "indigo" DECIMAL(65,30),
    "caustic" DECIMAL(65,30),
    "hydro" DECIMAL(65,30),
    "solopol" DECIMAL(65,30),
    "serawet" DECIMAL(65,30),
    "primasol" DECIMAL(65,30),
    "cottoclarin" DECIMAL(65,30),
    "setamol" DECIMAL(65,30),
    "granular" DECIMAL(65,30),
    "granule" DECIMAL(65,30),
    "grain" DECIMAL(65,30),
    "wet_matic" DECIMAL(65,30),
    "fisat" DECIMAL(65,30),
    "breviol" DECIMAL(65,30),
    "csk" DECIMAL(65,30),
    "comee" DECIMAL(65,30),
    "dirsol_rdp" DECIMAL(65,30),
    "primasol_nf" DECIMAL(65,30),
    "zolopol_phtr" DECIMAL(65,30),
    "cottoclarin_2" DECIMAL(65,30),
    "sanwet" DECIMAL(65,30),
    "marcerize_caustic" DECIMAL(65,30),
    "sanmercer" DECIMAL(65,30),
    "sancomplex" DECIMAL(65,30),
    "exsess_caustic" DECIMAL(65,30),
    "exsess_hydro" DECIMAL(65,30),
    "dextoor" DECIMAL(65,30),
    "ltr" DECIMAL(65,30),
    "diresol_black_kas" DECIMAL(65,30),
    "sansul_sdc" DECIMAL(65,30),
    "caustic_2" DECIMAL(65,30),
    "dextros" DECIMAL(65,30),
    "solopol_2" DECIMAL(65,30),
    "primasol_2" DECIMAL(65,30),
    "serawet_2" DECIMAL(65,30),
    "cottoclarin_3" DECIMAL(65,30),
    "saneutral" DECIMAL(65,30),
    "dextrose_adjust" DECIMAL(65,30),
    "optifik_rsl" DECIMAL(65,30),
    "ekalin_f" DECIMAL(65,30),
    "solopol_phtr" DECIMAL(65,30),
    "moisture_mahlo" DECIMAL(65,30),
    "temp_dryer" DECIMAL(65,30),
    "temp_mid_dryer" DECIMAL(65,30),
    "temp_size_box_1" DECIMAL(65,30),
    "temp_size_box_2" DECIMAL(65,30),
    "size_box_1" DECIMAL(65,30),
    "size_box_2" DECIMAL(65,30),
    "squeezing_roll_1" DECIMAL(65,30),
    "squeezing_roll_2" DECIMAL(65,30),
    "immersion_roll" DECIMAL(65,30),
    "dryer" DECIMAL(65,30),
    "take_off" DECIMAL(65,30),
    "winding" DECIMAL(65,30),
    "press_beam" DECIMAL(65,30),
    "hardness" DECIMAL(65,30),
    "hydrolic_pump_1" DECIMAL(65,30),
    "hydrolic_pump_2" DECIMAL(65,30),
    "unwinder" DECIMAL(65,30),
    "dyeing_tens_wash" DECIMAL(65,30),
    "dyeing_tens_warna" DECIMAL(65,30),
    "mc_idg" TEXT,
    "strength" DECIMAL(65,30),
    "elongasi_idg" DECIMAL(65,30),
    "cv_pct" DECIMAL(65,30),
    "tenacity" DECIMAL(65,30),
    "bak_1" DECIMAL(65,30),
    "bak_2" DECIMAL(65,30),
    "bak_3" DECIMAL(65,30),
    "bak_4" DECIMAL(65,30),
    "bak_5" DECIMAL(65,30),
    "bak_6" DECIMAL(65,30),
    "bak_7" DECIMAL(65,30),
    "bak_8" DECIMAL(65,30),
    "bak_9" DECIMAL(65,30),
    "bak_10" DECIMAL(65,30),
    "bak_11" DECIMAL(65,30),
    "bak_12" DECIMAL(65,30),
    "bak_13" DECIMAL(65,30),
    "bak_14" DECIMAL(65,30),
    "bak_15" DECIMAL(65,30),
    "bak_16" DECIMAL(65,30),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "bak_count" INTEGER,
    "indigo_bak" INTEGER,
    "indigo_conc" DOUBLE PRECISION,
    "jumlah_rope" INTEGER,
    "keterangan" TEXT,
    "panjang_rope" DOUBLE PRECISION,
    "start" TEXT,
    "stop" TEXT,
    "sulfur_bak" INTEGER,
    "sulfur_conc" DOUBLE PRECISION,
    "tgl" TIMESTAMP(3),
    "total_meters" DOUBLE PRECISION,

    CONSTRAINT "IndigoRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeavingRecord" (
    "id" SERIAL NOT NULL,
    "kp" TEXT NOT NULL,
    "warping_beam_id" INTEGER,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "shift" TEXT,
    "machine" TEXT,
    "warp_supplier" TEXT,
    "sizing" TEXT,
    "beam" INTEGER,
    "kode_kain" TEXT,
    "operator" TEXT,
    "a_pct" DECIMAL(65,30),
    "p_pct" DECIMAL(65,30),
    "rpm" DECIMAL(65,30),
    "kpicks" DECIMAL(65,30),
    "meters" DECIMAL(65,30),
    "warp_no" INTEGER,
    "warp_stop_hr" DECIMAL(65,30),
    "warp_per_stop" DECIMAL(65,30),
    "weft_no" INTEGER,
    "weft_stop_hr" DECIMAL(65,30),
    "weft_per_stop" DECIMAL(65,30),
    "bobbin_no" INTEGER,
    "bobbin_stop_hr" DECIMAL(65,30),
    "bobbin_per_stop" DECIMAL(65,30),
    "stattempt_no" INTEGER,
    "stattempt_stop_hr" DECIMAL(65,30),
    "stattempt_per_stop" DECIMAL(65,30),
    "other_stops_no" INTEGER,
    "other_stops_time" TEXT,
    "long_stops_no" INTEGER,
    "long_stops_time" TEXT,
    "m_s" DECIMAL(65,30),
    "b_hr" DECIMAL(65,30),
    "merk" TEXT,
    "area" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "beam_no" INTEGER,
    "efficiency" DOUBLE PRECISION,
    "keterangan" TEXT,
    "meter_out" DOUBLE PRECISION,
    "no_mesin" INTEGER,
    "pick_actual" INTEGER,
    "tgl" TIMESTAMP(3),
    "synced_at" TIMESTAMP(6),
    "source" VARCHAR(20) DEFAULT 'MANUAL',

    CONSTRAINT "WeavingRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InspectGrayRecord" (
    "id" SERIAL NOT NULL,
    "kp" TEXT NOT NULL,
    "weaving_record_id" INTEGER,
    "tg" TIMESTAMP(3) NOT NULL,
    "d" TEXT,
    "mc" TEXT,
    "bm" INTEGER,
    "sn" TEXT,
    "sn_combined" TEXT,
    "gd" TEXT,
    "bme" DECIMAL(65,30),
    "sj" DECIMAL(65,30),
    "actual_meters" DECIMAL(65,30),
    "opg" TEXT,
    "tgl_potong" TIMESTAMP(3),
    "no_pot" INTEGER,
    "w" TEXT,
    "g" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "berat" DOUBLE PRECISION,
    "cacat" TEXT,
    "grade" TEXT,
    "inspector_name" TEXT,
    "lebar" DOUBLE PRECISION,
    "no_roll" INTEGER,
    "panjang" DOUBLE PRECISION,
    "tgl" TIMESTAMP(3),
    "bmc" INTEGER,
    "btl" INTEGER,
    "bts" INTEGER,
    "pp" INTEGER,
    "pks" INTEGER,
    "ko" INTEGER,
    "db" INTEGER,
    "bl" INTEGER,
    "ptr" INTEGER,
    "pkt" INTEGER,
    "fly" INTEGER,
    "ls" INTEGER,
    "lpb" INTEGER,
    "p_bulu" INTEGER,
    "smg" INTEGER,
    "sms" INTEGER,
    "aw" INTEGER,
    "pl" INTEGER,
    "na" INTEGER,
    "lm" INTEGER,
    "lkc" INTEGER,
    "lks" INTEGER,
    "ld" INTEGER,
    "pts" INTEGER,
    "pd" INTEGER,
    "lkt" INTEGER,
    "pk" INTEGER,
    "lp" INTEGER,
    "plc" INTEGER,
    "j" INTEGER,
    "kk" INTEGER,
    "bta" INTEGER,
    "pj" INTEGER,
    "rp" INTEGER,
    "pb" INTEGER,
    "xpd" INTEGER,
    "br" INTEGER,
    "pss" INTEGER,
    "luper" INTEGER,
    "ptn" INTEGER,
    "b_bercak" INTEGER,
    "r_rusak" INTEGER,
    "sl" INTEGER,
    "p_timbul" INTEGER,
    "b_celup" INTEGER,
    "p_tumpuk" INTEGER,
    "b_bar" INTEGER,
    "sml" INTEGER,
    "p_slub" INTEGER,
    "p_belang" INTEGER,
    "crossing" INTEGER,
    "x_sambang" INTEGER,
    "p_jelek" INTEGER,
    "lipatan" INTEGER,
    "sn_full" TEXT,

    CONSTRAINT "InspectGrayRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BBSFWashingRun" (
    "id" SERIAL NOT NULL,
    "kp" TEXT NOT NULL,
    "tgl" TIMESTAMP(3) NOT NULL,
    "shift" TEXT,
    "mc" TEXT,
    "jam_proses" TEXT,
    "speed" TEXT,
    "larutan_1" TEXT,
    "temp_1" DOUBLE PRECISION,
    "padder_1" DOUBLE PRECISION,
    "dancing_1" DOUBLE PRECISION,
    "larutan_2" TEXT,
    "temp_2" DOUBLE PRECISION,
    "padder_2" DOUBLE PRECISION,
    "dancing_2" DOUBLE PRECISION,
    "skala_skew" DOUBLE PRECISION,
    "tekanan_boiler" DOUBLE PRECISION,
    "press_dancing_1" DOUBLE PRECISION,
    "press_dancing_2" DOUBLE PRECISION,
    "press_dancing_3" DOUBLE PRECISION,
    "temp_zone_1" DOUBLE PRECISION,
    "temp_zone_2" DOUBLE PRECISION,
    "temp_zone_3" DOUBLE PRECISION,
    "temp_zone_4" DOUBLE PRECISION,
    "temp_zone_5" DOUBLE PRECISION,
    "temp_zone_6" DOUBLE PRECISION,
    "lebar_awal" DOUBLE PRECISION,
    "panjang_awal" DOUBLE PRECISION,
    "permasalahan" TEXT,
    "pelaksana" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BBSFWashingRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BBSFSanforRun" (
    "id" SERIAL NOT NULL,
    "kp" TEXT NOT NULL,
    "tgl" TIMESTAMP(3) NOT NULL,
    "shift" TEXT,
    "mc" TEXT,
    "sanfor_type" TEXT NOT NULL,
    "jam" TEXT,
    "speed" TEXT,
    "damping" DOUBLE PRECISION,
    "press" DOUBLE PRECISION,
    "tension" DOUBLE PRECISION,
    "tension_limit" DOUBLE PRECISION,
    "temperatur" DOUBLE PRECISION,
    "susut" DOUBLE PRECISION,
    "awal" DOUBLE PRECISION,
    "akhir" DOUBLE PRECISION,
    "panjang" DOUBLE PRECISION,
    "permasalahan" TEXT,
    "pelaksana" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BBSFSanforRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BBSFServiceRecord" (
    "id" SERIAL NOT NULL,
    "tgl" TIMESTAMP(3) NOT NULL,
    "keterangan" TEXT,
    "mc" TEXT,
    "no_mc" DOUBLE PRECISION,
    "tindakan" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BBSFServiceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InspectFinishRecord" (
    "id" SERIAL NOT NULL,
    "kp" TEXT NOT NULL,
    "tgl" TIMESTAMP(3) NOT NULL,
    "shift" TEXT,
    "operator" TEXT,
    "no_roll" INTEGER,
    "sn" TEXT,
    "tgl_potong" TIMESTAMP(3),
    "lebar" DOUBLE PRECISION,
    "kg" DOUBLE PRECISION,
    "susut_lusi" DOUBLE PRECISION,
    "grade" TEXT,
    "point" DOUBLE PRECISION,
    "btl" INTEGER,
    "bts" INTEGER,
    "slub" INTEGER,
    "snl" INTEGER,
    "losp" INTEGER,
    "lb" INTEGER,
    "ptr" INTEGER,
    "p_slub" INTEGER,
    "pb" INTEGER,
    "lm" INTEGER,
    "aw" INTEGER,
    "ptm" INTEGER,
    "j" INTEGER,
    "bta" INTEGER,
    "pts" INTEGER,
    "pd" INTEGER,
    "pp" INTEGER,
    "pks" INTEGER,
    "pss" INTEGER,
    "pkl" INTEGER,
    "pk" INTEGER,
    "plc" INTEGER,
    "lp" INTEGER,
    "lks" INTEGER,
    "lkc" INTEGER,
    "ld" INTEGER,
    "lkt" INTEGER,
    "lki" INTEGER,
    "lptd" INTEGER,
    "bmc" INTEGER,
    "exst" INTEGER,
    "smg" INTEGER,
    "noda" TEXT,
    "kotor" TEXT,
    "bkrt" TEXT,
    "ket" TEXT,
    "blpt_grey" TEXT,
    "bl_ws" DOUBLE PRECISION,
    "bl_bb" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "sn_combined" TEXT,
    "sn_beam" INTEGER,
    "sn_lot" TEXT,
    "sn_machine" TEXT,

    CONSTRAINT "InspectFinishRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FabricSpec" (
    "id" SERIAL NOT NULL,
    "item" TEXT NOT NULL,
    "kons_kode" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "kat_kode" TEXT NOT NULL,
    "te" INTEGER,
    "lusi_type" TEXT,
    "lusi_ne" TEXT,
    "pakan_type" TEXT,
    "pakan_ne" TEXT,
    "sisir" TEXT,
    "pick" INTEGER,
    "anyaman" TEXT,
    "arah" TEXT,
    "lg_inches" DOUBLE PRECISION,
    "lf_inches" DOUBLE PRECISION,
    "susut_pakan" DOUBLE PRECISION,
    "warna" TEXT,
    "pretreatment" TEXT,
    "indigo_i" DOUBLE PRECISION,
    "indigo_bak_i" INTEGER,
    "sulfur_s" DOUBLE PRECISION,
    "sulfur_bak_s" INTEGER,
    "posttreatment" TEXT,
    "finish" TEXT,
    "oz_g" DOUBLE PRECISION,
    "oz_f" DOUBLE PRECISION,
    "p_kons" TEXT,
    "remarks" TEXT,

    CONSTRAINT "FabricSpec_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportLog" (
    "id" SERIAL NOT NULL,
    "source" VARCHAR(50) NOT NULL,
    "rows_ok" INTEGER DEFAULT 0,
    "rows_error" INTEGER DEFAULT 0,
    "error_detail" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImportLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fiber_types" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fiber_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spk_fiber_usages" (
    "id" SERIAL NOT NULL,
    "spk_id" INTEGER NOT NULL,
    "fiber_type_id" INTEGER NOT NULL,
    "weight" DECIMAL(14,2) NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "spk_fiber_usages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BBSFProductionRecord" (
    "id" SERIAL NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "shift" TEXT,
    "kp" TEXT NOT NULL,
    "kode" TEXT,
    "qty" DECIMAL(65,30),
    "line" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BBSFProductionRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "stage" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BBSFSusutRecord" (
    "id" SERIAL NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "no" INTEGER,
    "kp" TEXT NOT NULL,
    "kp_kode" TEXT,
    "kereta" INTEGER,
    "susut_lusi_awal" DECIMAL(65,30),
    "set_lusi_awal" DECIMAL(65,30),
    "susut_lusi_tengah" DECIMAL(65,30),
    "set_lusi_tengah" DECIMAL(65,30),
    "susut_lusi_akhir" DECIMAL(65,30),
    "set_lusi_akhir" DECIMAL(65,30),
    "susut_pakan_awal" DECIMAL(65,30),
    "set_pakan_awal" DECIMAL(65,30),
    "susut_pakan_tengah" DECIMAL(65,30),
    "set_pakan_tengah" DECIMAL(65,30),
    "susut_pakan_akhir" DECIMAL(65,30),
    "set_pakan_akhir" DECIMAL(65,30),
    "skew_awal" DECIMAL(65,30),
    "skew_tengah" DECIMAL(65,30),
    "skew_akhir" DECIMAL(65,30),
    "set_skew" DECIMAL(65,30),
    "keterangan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BBSFSusutRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_count_descriptions_name" ON "count_descriptions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "count_ne_value_key" ON "count_ne"("value");

-- CreateIndex
CREATE INDEX "idx_count_ne_value" ON "count_ne"("value");

-- CreateIndex
CREATE UNIQUE INDEX "lots_code_key" ON "lots"("code");

-- CreateIndex
CREATE UNIQUE INDEX "lots_name_key" ON "lots"("name");

-- CreateIndex
CREATE INDEX "idx_lots_code" ON "lots"("code");

-- CreateIndex
CREATE INDEX "idx_lots_name" ON "lots"("name");

-- CreateIndex
CREATE INDEX "idx_lots_blend_id" ON "lots"("blend_id");

-- CreateIndex
CREATE UNIQUE INDEX "spks_code_key" ON "spks"("code");

-- CreateIndex
CREATE UNIQUE INDEX "spks_name_key" ON "spks"("name");

-- CreateIndex
CREATE INDEX "idx_spks_code" ON "spks"("code");

-- CreateIndex
CREATE INDEX "idx_spks_name" ON "spks"("name");

-- CreateIndex
CREATE INDEX "idx_spks_lot_id" ON "spks"("lot_id");

-- CreateIndex
CREATE INDEX "idx_spks_mills_unit_id" ON "spks"("mills_unit_id");

-- CreateIndex
CREATE INDEX "idx_spks_rayon_brand_id" ON "spks"("rayon_brand_id");

-- CreateIndex
CREATE UNIQUE INDEX "yarn_types_code_key" ON "yarn_types"("code");

-- CreateIndex
CREATE UNIQUE INDEX "yarn_types_name_key" ON "yarn_types"("name");

-- CreateIndex
CREATE INDEX "idx_yarn_types_code" ON "yarn_types"("code");

-- CreateIndex
CREATE INDEX "idx_yarn_types_name" ON "yarn_types"("name");

-- CreateIndex
CREATE INDEX "idx_yarn_types_letter_code" ON "yarn_types"("letter_code");

-- CreateIndex
CREATE UNIQUE INDEX "blends_name_key" ON "blends"("name");

-- CreateIndex
CREATE INDEX "idx_blends_name" ON "blends"("name");

-- CreateIndex
CREATE INDEX "idx_blends_letter_code" ON "blends"("letter_code");

-- CreateIndex
CREATE UNIQUE INDEX "slub_codes_code_key" ON "slub_codes"("code");

-- CreateIndex
CREATE INDEX "idx_slub_codes_code" ON "slub_codes"("code");

-- CreateIndex
CREATE UNIQUE INDEX "kp_code_key" ON "kp"("code");

-- CreateIndex
CREATE INDEX "idx_kp_code" ON "kp"("code");

-- CreateIndex
CREATE INDEX "idx_kp_name" ON "kp"("name");

-- CreateIndex
CREATE UNIQUE INDEX "kodes_code_key" ON "kodes"("code");

-- CreateIndex
CREATE INDEX "idx_kode_code" ON "kodes"("code");

-- CreateIndex
CREATE INDEX "idx_kode_name" ON "kodes"("name");

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_code_key" ON "suppliers"("code");

-- CreateIndex
CREATE INDEX "idx_suppliers_code" ON "suppliers"("code");

-- CreateIndex
CREATE INDEX "idx_suppliers_name" ON "suppliers"("name");

-- CreateIndex
CREATE UNIQUE INDEX "mills_units_code_key" ON "mills_units"("code");

-- CreateIndex
CREATE INDEX "idx_mills_units_code" ON "mills_units"("code");

-- CreateIndex
CREATE INDEX "idx_mills_units_name" ON "mills_units"("name");

-- CreateIndex
CREATE INDEX "idx_mills_units_letter_code" ON "mills_units"("letter_code");

-- CreateIndex
CREATE UNIQUE INDEX "process_steps_code_key" ON "process_steps"("code");

-- CreateIndex
CREATE INDEX "idx_process_steps_code" ON "process_steps"("code");

-- CreateIndex
CREATE INDEX "idx_process_steps_name" ON "process_steps"("name");

-- CreateIndex
CREATE UNIQUE INDEX "test_types_code_key" ON "test_types"("code");

-- CreateIndex
CREATE INDEX "idx_test_types_code" ON "test_types"("code");

-- CreateIndex
CREATE INDEX "idx_test_types_name" ON "test_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "sides_code_key" ON "sides"("code");

-- CreateIndex
CREATE INDEX "idx_sides_code" ON "sides"("code");

-- CreateIndex
CREATE INDEX "idx_sides_name" ON "sides"("name");

-- CreateIndex
CREATE UNIQUE INDEX "warna_cone_cheese_name_key" ON "warna_cone_cheese"("name");

-- CreateIndex
CREATE INDEX "idx_warna_cone_cheese_name" ON "warna_cone_cheese"("name");

-- CreateIndex
CREATE UNIQUE INDEX "rayon_brand_name_key" ON "rayon_brand"("name");

-- CreateIndex
CREATE INDEX "idx_rayon_brand_name" ON "rayon_brand"("name");

-- CreateIndex
CREATE INDEX "idx_rayon_brand_letter_code" ON "rayon_brand"("letter_code");

-- CreateIndex
CREATE INDEX "idx_yarn_tests_test_date" ON "yarn_tests"("test_date");

-- CreateIndex
CREATE INDEX "idx_yarn_tests_test_year_test_month" ON "yarn_tests"("test_year", "test_month");

-- CreateIndex
CREATE INDEX "idx_yarn_tests_count_description_code" ON "yarn_tests"("count_description_code");

-- CreateIndex
CREATE INDEX "idx_yarn_tests_count_ne_id" ON "yarn_tests"("count_ne_id");

-- CreateIndex
CREATE INDEX "idx_yarn_tests_lot_id" ON "yarn_tests"("lot_id");

-- CreateIndex
CREATE INDEX "idx_yarn_tests_spk_id" ON "yarn_tests"("spk_id");

-- CreateIndex
CREATE INDEX "idx_yarn_tests_blend_id" ON "yarn_tests"("blend_id");

-- CreateIndex
CREATE INDEX "idx_yarn_tests_supplier_id" ON "yarn_tests"("supplier_id");

-- CreateIndex
CREATE INDEX "idx_yarn_tests_mills_unit_id" ON "yarn_tests"("mills_unit_id");

-- CreateIndex
CREATE INDEX "idx_yarn_tests_process_step_id" ON "yarn_tests"("process_step_id");

-- CreateIndex
CREATE INDEX "idx_yarn_tests_test_type_id" ON "yarn_tests"("test_type_id");

-- CreateIndex
CREATE INDEX "idx_yarn_tests_machine_no" ON "yarn_tests"("machine_no");

-- CreateIndex
CREATE INDEX "idx_yarn_tests_created_at" ON "yarn_tests"("created_at");

-- CreateIndex
CREATE INDEX "idx_production_records_production_date" ON "production_records"("production_date");

-- CreateIndex
CREATE INDEX "idx_production_records_month" ON "production_records"("month");

-- CreateIndex
CREATE INDEX "idx_production_records_year" ON "production_records"("year");

-- CreateIndex
CREATE INDEX "idx_production_records_year_month" ON "production_records"("year", "month");

-- CreateIndex
CREATE INDEX "idx_production_records_mills_unit_id" ON "production_records"("mills_unit_id");

-- CreateIndex
CREATE INDEX "idx_production_records_yarn_type_id" ON "production_records"("yarn_type_id");

-- CreateIndex
CREATE INDEX "idx_production_records_count_ne_id" ON "production_records"("count_ne_id");

-- CreateIndex
CREATE INDEX "idx_production_records_count_description_code" ON "production_records"("count_description_code");

-- CreateIndex
CREATE INDEX "idx_production_records_blend_id" ON "production_records"("blend_id");

-- CreateIndex
CREATE INDEX "idx_production_records_slub_code_id" ON "production_records"("slub_code_id");

-- CreateIndex
CREATE INDEX "idx_production_records_lot_id" ON "production_records"("lot_id");

-- CreateIndex
CREATE INDEX "idx_production_records_spk_id" ON "production_records"("spk_id");

-- CreateIndex
CREATE INDEX "idx_production_records_warna_cone_cheese_id" ON "production_records"("warna_cone_cheese_id");

-- CreateIndex
CREATE INDEX "idx_production_records_rayon_brand_id" ON "production_records"("rayon_brand_id");

-- CreateIndex
CREATE INDEX "idx_indigo_division_records_tanggal" ON "indigo_division_records"("tanggal");

-- CreateIndex
CREATE INDEX "idx_indigo_division_records_count_description_code" ON "indigo_division_records"("count_description_code");

-- CreateIndex
CREATE INDEX "idx_indigo_division_records_kp_id" ON "indigo_division_records"("kp_id");

-- CreateIndex
CREATE INDEX "idx_indigo_division_records_kode_id" ON "indigo_division_records"("kode_id");

-- CreateIndex
CREATE UNIQUE INDEX "SalesContract_kp_key" ON "SalesContract"("kp");

-- CreateIndex
CREATE UNIQUE INDEX "SalesContract_kp_sequence_key" ON "SalesContract"("kp_sequence");

-- CreateIndex
CREATE INDEX "SalesContract_kp_idx" ON "SalesContract"("kp");

-- CreateIndex
CREATE INDEX "SalesContract_kons_kode_kode_number_idx" ON "SalesContract"("kons_kode", "kode_number");

-- CreateIndex
CREATE INDEX "SalesContract_tgl_idx" ON "SalesContract"("tgl");

-- CreateIndex
CREATE INDEX "SalesContract_pipeline_status_idx" ON "SalesContract"("pipeline_status");

-- CreateIndex
CREATE UNIQUE INDEX "WarpingRun_kp_key" ON "WarpingRun"("kp");

-- CreateIndex
CREATE INDEX "WarpingRun_kp_idx" ON "WarpingRun"("kp");

-- CreateIndex
CREATE INDEX "WarpingRun_tgl_idx" ON "WarpingRun"("tgl");

-- CreateIndex
CREATE INDEX "WarpingRun_kp_tgl_idx" ON "WarpingRun"("kp", "tgl");

-- CreateIndex
CREATE INDEX "WarpingBeam_beam_number_idx" ON "WarpingBeam"("beam_number");

-- CreateIndex
CREATE INDEX "WarpingBeam_kp_idx" ON "WarpingBeam"("kp");

-- CreateIndex
CREATE UNIQUE INDEX "WarpingBeam_warping_run_id_position_key" ON "WarpingBeam"("warping_run_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "WarpingBeam_kp_beam_number_key" ON "WarpingBeam"("kp", "beam_number");

-- CreateIndex
CREATE UNIQUE INDEX "IndigoRun_kp_key" ON "IndigoRun"("kp");

-- CreateIndex
CREATE INDEX "IndigoRun_kp_idx" ON "IndigoRun"("kp");

-- CreateIndex
CREATE INDEX "IndigoRun_tanggal_idx" ON "IndigoRun"("tanggal");

-- CreateIndex
CREATE INDEX "IndigoRun_kp_tanggal_idx" ON "IndigoRun"("kp", "tanggal");

-- CreateIndex
CREATE INDEX "WeavingRecord_kp_idx" ON "WeavingRecord"("kp");

-- CreateIndex
CREATE INDEX "WeavingRecord_tanggal_idx" ON "WeavingRecord"("tanggal");

-- CreateIndex
CREATE INDEX "WeavingRecord_machine_idx" ON "WeavingRecord"("machine");

-- CreateIndex
CREATE INDEX "WeavingRecord_beam_idx" ON "WeavingRecord"("beam");

-- CreateIndex
CREATE INDEX "WeavingRecord_machine_beam_idx" ON "WeavingRecord"("machine", "beam");

-- CreateIndex
CREATE INDEX "idx_weaving_record_synced_at" ON "WeavingRecord"("synced_at");

-- CreateIndex
CREATE INDEX "idx_weaving_record_kp_machine" ON "WeavingRecord"("kp", "machine");

-- CreateIndex
CREATE INDEX "idx_weaving_record_kp_tanggal" ON "WeavingRecord"("kp", "tanggal");

-- CreateIndex
CREATE INDEX "idx_weaving_record_machine_tanggal" ON "WeavingRecord"("machine", "tanggal");

-- CreateIndex
CREATE UNIQUE INDEX "WeavingRecord_kp_tanggal_shift_machine_key" ON "WeavingRecord"("kp", "tanggal", "shift", "machine");

-- CreateIndex
CREATE INDEX "InspectGrayRecord_kp_idx" ON "InspectGrayRecord"("kp");

-- CreateIndex
CREATE INDEX "InspectGrayRecord_tg_idx" ON "InspectGrayRecord"("tg");

-- CreateIndex
CREATE INDEX "InspectGrayRecord_mc_bm_idx" ON "InspectGrayRecord"("mc", "bm");

-- CreateIndex
CREATE INDEX "InspectGrayRecord_no_pot_idx" ON "InspectGrayRecord"("no_pot");

-- CreateIndex
CREATE INDEX "InspectGrayRecord_tgl_potong_idx" ON "InspectGrayRecord"("tgl_potong");

-- CreateIndex
CREATE INDEX "InspectGrayRecord_sn_combined_idx" ON "InspectGrayRecord"("sn_combined");

-- CreateIndex
CREATE UNIQUE INDEX "InspectGrayRecord_kp_mc_bm_no_pot_key" ON "InspectGrayRecord"("kp", "mc", "bm", "no_pot");

-- CreateIndex
CREATE INDEX "BBSFWashingRun_kp_idx" ON "BBSFWashingRun"("kp");

-- CreateIndex
CREATE INDEX "BBSFWashingRun_tgl_idx" ON "BBSFWashingRun"("tgl");

-- CreateIndex
CREATE INDEX "BBSFSanforRun_kp_idx" ON "BBSFSanforRun"("kp");

-- CreateIndex
CREATE INDEX "BBSFSanforRun_tgl_idx" ON "BBSFSanforRun"("tgl");

-- CreateIndex
CREATE INDEX "BBSFSanforRun_kp_sanfor_type_idx" ON "BBSFSanforRun"("kp", "sanfor_type");

-- CreateIndex
CREATE INDEX "BBSFServiceRecord_tgl_idx" ON "BBSFServiceRecord"("tgl");

-- CreateIndex
CREATE INDEX "InspectFinishRecord_kp_idx" ON "InspectFinishRecord"("kp");

-- CreateIndex
CREATE INDEX "InspectFinishRecord_sn_combined_idx" ON "InspectFinishRecord"("sn_combined");

-- CreateIndex
CREATE UNIQUE INDEX "FabricSpec_item_key" ON "FabricSpec"("item");

-- CreateIndex
CREATE INDEX "FabricSpec_kons_kode_idx" ON "FabricSpec"("kons_kode");

-- CreateIndex
CREATE INDEX "FabricSpec_kode_idx" ON "FabricSpec"("kode");

-- CreateIndex
CREATE INDEX "idx_import_log_created_at" ON "ImportLog"("created_at");

-- CreateIndex
CREATE INDEX "idx_import_log_source" ON "ImportLog"("source");

-- CreateIndex
CREATE UNIQUE INDEX "fiber_types_code_key" ON "fiber_types"("code");

-- CreateIndex
CREATE INDEX "idx_spk_fiber_usages_fiber_type_id" ON "spk_fiber_usages"("fiber_type_id");

-- CreateIndex
CREATE INDEX "idx_spk_fiber_usages_spk_id" ON "spk_fiber_usages"("spk_id");

-- CreateIndex
CREATE UNIQUE INDEX "idx_spk_fiber_usages_spk_fiber" ON "spk_fiber_usages"("spk_id", "fiber_type_id");

-- CreateIndex
CREATE INDEX "BBSFProductionRecord_kp_idx" ON "BBSFProductionRecord"("kp");

-- CreateIndex
CREATE INDEX "BBSFProductionRecord_tanggal_idx" ON "BBSFProductionRecord"("tanggal");

-- CreateIndex
CREATE INDEX "BBSFSusutRecord_kp_idx" ON "BBSFSusutRecord"("kp");

-- CreateIndex
CREATE INDEX "BBSFSusutRecord_tanggal_idx" ON "BBSFSusutRecord"("tanggal");

-- AddForeignKey
ALTER TABLE "lots" ADD CONSTRAINT "lots_blend_id_fkey" FOREIGN KEY ("blend_id") REFERENCES "blends"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "spks" ADD CONSTRAINT "spks_lot_id_fkey" FOREIGN KEY ("lot_id") REFERENCES "lots"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "spks" ADD CONSTRAINT "spks_mills_unit_id_fkey" FOREIGN KEY ("mills_unit_id") REFERENCES "mills_units"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "spks" ADD CONSTRAINT "spks_rayon_brand_id_fkey" FOREIGN KEY ("rayon_brand_id") REFERENCES "rayon_brand"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "yarn_tests" ADD CONSTRAINT "yarn_tests_blend_id_fkey" FOREIGN KEY ("blend_id") REFERENCES "blends"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "yarn_tests" ADD CONSTRAINT "yarn_tests_count_description_code_fkey" FOREIGN KEY ("count_description_code") REFERENCES "count_descriptions"("code") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "yarn_tests" ADD CONSTRAINT "yarn_tests_count_ne_id_fkey" FOREIGN KEY ("count_ne_id") REFERENCES "count_ne"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "yarn_tests" ADD CONSTRAINT "yarn_tests_lot_id_fkey" FOREIGN KEY ("lot_id") REFERENCES "lots"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "yarn_tests" ADD CONSTRAINT "yarn_tests_mills_unit_id_fkey" FOREIGN KEY ("mills_unit_id") REFERENCES "mills_units"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "yarn_tests" ADD CONSTRAINT "yarn_tests_process_step_id_fkey" FOREIGN KEY ("process_step_id") REFERENCES "process_steps"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "yarn_tests" ADD CONSTRAINT "yarn_tests_side_id_fkey" FOREIGN KEY ("side_id") REFERENCES "sides"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "yarn_tests" ADD CONSTRAINT "yarn_tests_slub_code_id_fkey" FOREIGN KEY ("slub_code_id") REFERENCES "slub_codes"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "yarn_tests" ADD CONSTRAINT "yarn_tests_spk_id_fkey" FOREIGN KEY ("spk_id") REFERENCES "spks"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "yarn_tests" ADD CONSTRAINT "yarn_tests_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "yarn_tests" ADD CONSTRAINT "yarn_tests_test_type_id_fkey" FOREIGN KEY ("test_type_id") REFERENCES "test_types"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "yarn_tests" ADD CONSTRAINT "yarn_tests_yarn_type_id_fkey" FOREIGN KEY ("yarn_type_id") REFERENCES "yarn_types"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "production_records" ADD CONSTRAINT "production_records_blend_id_fkey" FOREIGN KEY ("blend_id") REFERENCES "blends"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "production_records" ADD CONSTRAINT "production_records_count_description_code_fkey" FOREIGN KEY ("count_description_code") REFERENCES "count_descriptions"("code") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "production_records" ADD CONSTRAINT "production_records_count_ne_id_fkey" FOREIGN KEY ("count_ne_id") REFERENCES "count_ne"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "production_records" ADD CONSTRAINT "production_records_lot_id_fkey" FOREIGN KEY ("lot_id") REFERENCES "lots"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "production_records" ADD CONSTRAINT "production_records_mills_unit_id_fkey" FOREIGN KEY ("mills_unit_id") REFERENCES "mills_units"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "production_records" ADD CONSTRAINT "production_records_rayon_brand_id_fkey" FOREIGN KEY ("rayon_brand_id") REFERENCES "rayon_brand"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "production_records" ADD CONSTRAINT "production_records_slub_code_id_fkey" FOREIGN KEY ("slub_code_id") REFERENCES "slub_codes"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "production_records" ADD CONSTRAINT "production_records_spk_id_fkey" FOREIGN KEY ("spk_id") REFERENCES "spks"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "production_records" ADD CONSTRAINT "production_records_warna_cone_cheese_id_fkey" FOREIGN KEY ("warna_cone_cheese_id") REFERENCES "warna_cone_cheese"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "production_records" ADD CONSTRAINT "production_records_yarn_type_id_fkey" FOREIGN KEY ("yarn_type_id") REFERENCES "yarn_types"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "indigo_division_records" ADD CONSTRAINT "indigo_division_records_count_description_code_fkey" FOREIGN KEY ("count_description_code") REFERENCES "count_descriptions"("code") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "indigo_division_records" ADD CONSTRAINT "indigo_division_records_kode_id_fkey" FOREIGN KEY ("kode_id") REFERENCES "kodes"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "indigo_division_records" ADD CONSTRAINT "indigo_division_records_kp_id_fkey" FOREIGN KEY ("kp_id") REFERENCES "kp"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "WarpingBeam" ADD CONSTRAINT "WarpingBeam_warping_run_id_fkey" FOREIGN KEY ("warping_run_id") REFERENCES "WarpingRun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeavingRecord" ADD CONSTRAINT "WeavingRecord_warping_beam_id_fkey" FOREIGN KEY ("warping_beam_id") REFERENCES "WarpingBeam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InspectGrayRecord" ADD CONSTRAINT "InspectGrayRecord_weaving_record_id_fkey" FOREIGN KEY ("weaving_record_id") REFERENCES "WeavingRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spk_fiber_usages" ADD CONSTRAINT "spk_fiber_usages_fiber_type_id_fkey" FOREIGN KEY ("fiber_type_id") REFERENCES "fiber_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spk_fiber_usages" ADD CONSTRAINT "spk_fiber_usages_spk_id_fkey" FOREIGN KEY ("spk_id") REFERENCES "spks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

