-- CreateTable
CREATE TABLE "user_settings" (
    "userId" TEXT NOT NULL,
    "displayName" TEXT,
    "gender" TEXT,
    "monthly_food_budget_cents" INTEGER,
    "monthly_grooming_budget_cents" INTEGER,
    "monthly_vet_budget_cents" INTEGER,
    "monthly_supplies_budget_cents" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'SGD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_settings_pkey" PRIMARY KEY ("userId")
);
