/*
  Warnings:

  - Made the column `display_name` on table `Sources` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Sources" ALTER COLUMN "display_name" SET NOT NULL;
