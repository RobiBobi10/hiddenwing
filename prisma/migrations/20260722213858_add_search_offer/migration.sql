-- CreateTable
CREATE TABLE "Search" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "departureDate" TEXT NOT NULL,
    "returnDate" TEXT,
    "adults" INTEGER NOT NULL,
    "children" INTEGER NOT NULL,
    "infants" INTEGER NOT NULL,
    "cabinClass" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "offerCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Search_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Offer" (
    "id" TEXT NOT NULL,
    "searchId" TEXT NOT NULL,
    "providerOfferId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "cabinClass" TEXT NOT NULL,
    "stops" INTEGER NOT NULL,
    "normalized" JSONB NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Search_userId_idx" ON "Search"("userId");

-- CreateIndex
CREATE INDEX "Search_createdAt_idx" ON "Search"("createdAt");

-- CreateIndex
CREATE INDEX "Offer_searchId_idx" ON "Offer"("searchId");

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_searchId_fkey" FOREIGN KEY ("searchId") REFERENCES "Search"("id") ON DELETE CASCADE ON UPDATE CASCADE;
