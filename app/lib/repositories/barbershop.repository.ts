import { db } from "@/app/lib/repositories/prisma";
import { Prisma } from "@prisma/client";

export type BarbershopWithRelations = Prisma.BarbershopGetPayload<{
  include: {
    services: true;
    barbers: true;
  };
}>;

export class BarbershopRepository {

  async findMany(
    page: number,
    limit: number,
    search?: string
  ): Promise<BarbershopWithRelations[]> {

    return db.barbershop.findMany({
      where: search
        ? {
            name: {
              contains: search,
              mode: "insensitive",
            },
          }
        : undefined,
      include: {
        services: true,
        barbers: true,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        name: "asc",
      },
    });
  }

  async count(search?: string): Promise<number> {
    return db.barbershop.count({
      where: search
        ? {
            name: {
              contains: search,
              mode: "insensitive",
            },
          }
        : undefined,
    });
  }

  async findById(id: string) {
    return db.barbershop.findUnique({
      where: { id },
      include: {
        services: true,
        barbers: true,
      },
    });
  }
}
