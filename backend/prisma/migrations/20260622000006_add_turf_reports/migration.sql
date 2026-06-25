CREATE TABLE IF NOT EXISTS "TurfReport" (
  "id"          TEXT NOT NULL,
  "turfId"      TEXT NOT NULL,
  "reporterId"  TEXT NOT NULL,
  "reason"      TEXT NOT NULL,
  "description" TEXT,
  "status"      TEXT NOT NULL DEFAULT 'PENDING',
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TurfReport_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "TurfReport_turfId_fkey" FOREIGN KEY ("turfId") REFERENCES "Turf"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "TurfReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
