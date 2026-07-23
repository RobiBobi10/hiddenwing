-- CreateTable
CREATE TABLE "PreferenceProfile" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "valueOfTimePerHour" INTEGER NOT NULL DEFAULT 30,
    "checkedBagsNeeded" INTEGER NOT NULL DEFAULT 1,
    "estimatedBagFee" INTEGER NOT NULL DEFAULT 50,
    "perStopPenalty" INTEGER NOT NULL DEFAULT 40,
    "redEyePenalty" INTEGER NOT NULL DEFAULT 60,
    "comfortWeight" INTEGER NOT NULL DEFAULT 120,
    "noRedEye" BOOLEAN NOT NULL DEFAULT false,
    "maxStops" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PreferenceProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PreferenceProfile_clerkId_key" ON "PreferenceProfile"("clerkId");
