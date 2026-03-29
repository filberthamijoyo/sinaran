-- CreateTable
CREATE TABLE "BBSFProductionRecord" (
    "id" SERIAL NOT NULL,
    "tanggal" TIMESTAMP(6) NOT NULL,
    "shift" VARCHAR(191),
    "kp" VARCHAR(191) NOT NULL,
    "kode" VARCHAR(191),
    "qty" DECIMAL(65, 30),
    "line" VARCHAR(191),
    "createdAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BBSFProductionRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BBSFProductionRecord_kp_idx" ON "BBSFProductionRecord"("kp");

-- CreateIndex
CREATE INDEX "BBSFProductionRecord_tanggal_idx" ON "BBSFProductionRecord"("tanggal");

-- CreateTable
CREATE TABLE "BBSFSusutRecord" (
    "id" SERIAL NOT NULL,
    "tanggal" TIMESTAMP(6) NOT NULL,
    "no" INTEGER,
    "kp" VARCHAR(191) NOT NULL,
    "kp_kode" VARCHAR(191),
    "kereta" INTEGER,
    "susut_lusi_awal" DECIMAL(65, 30),
    "set_lusi_awal" DECIMAL(65, 30),
    "susut_lusi_tengah" DECIMAL(65, 30),
    "set_lusi_tengah" DECIMAL(65, 30),
    "susut_lusi_akhir" DECIMAL(65, 30),
    "set_lusi_akhir" DECIMAL(65, 30),
    "susut_pakan_awal" DECIMAL(65, 30),
    "set_pakan_awal" DECIMAL(65, 30),
    "susut_pakan_tengah" DECIMAL(65, 30),
    "set_pakan_tengah" DECIMAL(65, 30),
    "susut_pakan_akhir" DECIMAL(65, 30),
    "set_pakan_akhir" DECIMAL(65, 30),
    "skew_awal" DECIMAL(65, 30),
    "skew_tengah" DECIMAL(65, 30),
    "skew_akhir" DECIMAL(65, 30),
    "set_skew" DECIMAL(65, 30),
    "keterangan" VARCHAR(191),
    "createdAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BBSFSusutRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BBSFSusutRecord_kp_idx" ON "BBSFSusutRecord"("kp");

-- CreateIndex
CREATE INDEX "BBSFSusutRecord_tanggal_idx" ON "BBSFSusutRecord"("tanggal");
