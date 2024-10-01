/*
  Warnings:

  - Added the required column `folderName` to the `albums` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "albums" ADD COLUMN     "folderName" TEXT NOT NULL;
