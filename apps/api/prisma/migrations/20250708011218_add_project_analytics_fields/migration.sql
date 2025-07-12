-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "budget" DOUBLE PRECISION,
ADD COLUMN     "deadline" TIMESTAMP(3),
ADD COLUMN     "guidelines" TEXT;
