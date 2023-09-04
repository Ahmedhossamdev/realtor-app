/*
  Warnings:

  - The values [CONDOM] on the enum `ProperType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ProperType_new" AS ENUM ('RESIDENTAIL', 'CONDO');
ALTER TABLE "Home" ALTER COLUMN "propertyType" TYPE "ProperType_new" USING ("propertyType"::text::"ProperType_new");
ALTER TYPE "ProperType" RENAME TO "ProperType_old";
ALTER TYPE "ProperType_new" RENAME TO "ProperType";
DROP TYPE "ProperType_old";
COMMIT;
