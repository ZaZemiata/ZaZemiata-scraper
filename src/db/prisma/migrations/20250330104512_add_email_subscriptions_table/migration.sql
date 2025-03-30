-- CreateTable
CREATE TABLE "EmailSubscriptions" (
    "id" BIGSERIAL NOT NULL,
    "email" VARCHAR(128) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailSubscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmailSubscriptions_email_key" ON "EmailSubscriptions"("email");
