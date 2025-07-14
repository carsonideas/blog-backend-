/*
  Warnings:

  - You are about to drop the column `featuredImageUrl` on the `blogs` table. All the data in the column will be lost.
  - You are about to drop the column `synopsis` on the `blogs` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "blogs" DROP COLUMN "featuredImageUrl",
DROP COLUMN "synopsis",
ADD COLUMN     "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "profileImage" TEXT,
ALTER COLUMN "firstName" DROP NOT NULL,
ALTER COLUMN "lastName" DROP NOT NULL;
