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

-- AddForeignKey
ALTER TABLE "lots" ADD CONSTRAINT "lots_blend_id_fkey" FOREIGN KEY ("blend_id") REFERENCES "blends"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "yarn_tests" ADD CONSTRAINT "yarn_tests_count_description_code_fkey" FOREIGN KEY ("count_description_code") REFERENCES "count_descriptions"("code") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "yarn_tests" ADD CONSTRAINT "yarn_tests_count_ne_id_fkey" FOREIGN KEY ("count_ne_id") REFERENCES "count_ne"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "yarn_tests" ADD CONSTRAINT "yarn_tests_lot_id_fkey" FOREIGN KEY ("lot_id") REFERENCES "lots"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "yarn_tests" ADD CONSTRAINT "yarn_tests_spk_id_fkey" FOREIGN KEY ("spk_id") REFERENCES "spks"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "yarn_tests" ADD CONSTRAINT "yarn_tests_yarn_type_id_fkey" FOREIGN KEY ("yarn_type_id") REFERENCES "yarn_types"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "yarn_tests" ADD CONSTRAINT "yarn_tests_blend_id_fkey" FOREIGN KEY ("blend_id") REFERENCES "blends"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "yarn_tests" ADD CONSTRAINT "yarn_tests_slub_code_id_fkey" FOREIGN KEY ("slub_code_id") REFERENCES "slub_codes"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "yarn_tests" ADD CONSTRAINT "yarn_tests_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "yarn_tests" ADD CONSTRAINT "yarn_tests_mills_unit_id_fkey" FOREIGN KEY ("mills_unit_id") REFERENCES "mills_units"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "yarn_tests" ADD CONSTRAINT "yarn_tests_process_step_id_fkey" FOREIGN KEY ("process_step_id") REFERENCES "process_steps"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "yarn_tests" ADD CONSTRAINT "yarn_tests_test_type_id_fkey" FOREIGN KEY ("test_type_id") REFERENCES "test_types"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "yarn_tests" ADD CONSTRAINT "yarn_tests_side_id_fkey" FOREIGN KEY ("side_id") REFERENCES "sides"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "production_records" ADD CONSTRAINT "production_records_mills_unit_id_fkey" FOREIGN KEY ("mills_unit_id") REFERENCES "mills_units"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "production_records" ADD CONSTRAINT "production_records_yarn_type_id_fkey" FOREIGN KEY ("yarn_type_id") REFERENCES "yarn_types"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "production_records" ADD CONSTRAINT "production_records_count_ne_id_fkey" FOREIGN KEY ("count_ne_id") REFERENCES "count_ne"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "production_records" ADD CONSTRAINT "production_records_count_description_code_fkey" FOREIGN KEY ("count_description_code") REFERENCES "count_descriptions"("code") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "production_records" ADD CONSTRAINT "production_records_blend_id_fkey" FOREIGN KEY ("blend_id") REFERENCES "blends"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "production_records" ADD CONSTRAINT "production_records_slub_code_id_fkey" FOREIGN KEY ("slub_code_id") REFERENCES "slub_codes"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "production_records" ADD CONSTRAINT "production_records_lot_id_fkey" FOREIGN KEY ("lot_id") REFERENCES "lots"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "production_records" ADD CONSTRAINT "production_records_spk_id_fkey" FOREIGN KEY ("spk_id") REFERENCES "spks"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "production_records" ADD CONSTRAINT "production_records_warna_cone_cheese_id_fkey" FOREIGN KEY ("warna_cone_cheese_id") REFERENCES "warna_cone_cheese"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "production_records" ADD CONSTRAINT "production_records_rayon_brand_id_fkey" FOREIGN KEY ("rayon_brand_id") REFERENCES "rayon_brand"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
