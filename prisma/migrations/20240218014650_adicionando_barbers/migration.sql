/*
  Warnings:

  - Added the required column `barberId` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "barberId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Barber" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "barbershopId" TEXT NOT NULL,

    CONSTRAINT "Barber_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Barber" ADD CONSTRAINT "Barber_barbershopId_fkey" FOREIGN KEY ("barbershopId") REFERENCES "Barbershop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_barberId_fkey" FOREIGN KEY ("barberId") REFERENCES "Barber"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
