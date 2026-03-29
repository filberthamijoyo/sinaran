-- CreateTable
CREATE TABLE "PipelineEvent" (
    "id" SERIAL NOT NULL,
    "kp" TEXT NOT NULL,
    "from_stage" TEXT,
    "to_stage" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PipelineEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PipelineEvent_to_stage_created_at_idx" ON "PipelineEvent"("to_stage", "created_at");

-- CreateIndex
CREATE INDEX "PipelineEvent_kp_idx" ON "PipelineEvent"("kp");
