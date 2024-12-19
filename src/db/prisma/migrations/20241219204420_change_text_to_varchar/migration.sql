/*
  Warnings:

  - You are about to alter the column `contractor` on the `CrawledData` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `word` on the `KeyWords` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(64)`.
  - You are about to alter the column `name` on the `Settings` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(128)`.
  - You are about to alter the column `value` on the `Settings` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(256)`.
  - You are about to alter the column `url` on the `SourceUrls` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(1024)`.
  - You are about to alter the column `email` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(128)`.
  - You are about to alter the column `password` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(128)`.

*/
-- AlterTable
ALTER TABLE "CrawledData" ALTER COLUMN "contractor" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "KeyWords" ALTER COLUMN "word" SET DATA TYPE VARCHAR(64);

-- AlterTable
ALTER TABLE "Settings" ALTER COLUMN "name" SET DATA TYPE VARCHAR(128),
ALTER COLUMN "value" SET DATA TYPE VARCHAR(256);

-- AlterTable
ALTER TABLE "SourceUrls" ALTER COLUMN "url" SET DATA TYPE VARCHAR(1024);

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email" SET DATA TYPE VARCHAR(128),
ALTER COLUMN "password" SET DATA TYPE VARCHAR(128);
