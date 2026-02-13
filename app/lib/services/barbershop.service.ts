import { BarbershopRepository, BarbershopWithRelations } from "../repositories/barbershop.repository";
import { BarbershopResponseDTO } from "../dtos/barbershop-response.dto";
import { AppError } from "../errors/app-error";
import { BarbershopDetailsResponseDTO } from "../dtos/barbershop-details-response.dto";

export class BarbershopService {

  constructor(private repository: BarbershopRepository) {}

  async findAll(page: number, limit: number, search?: string) {
    const [barbershops, total] = await Promise.all([
      this.repository.findMany(page, limit, search),
      this.repository.count(search),
    ]);

    return {
      data: barbershops.map((b) => this.mapToResponse(b)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

async findById(id: string): Promise<BarbershopDetailsResponseDTO> {
  const barbershop = await this.repository.findById(id);

  if (!barbershop) {
    throw new AppError("Barbearia não encontrada", 404);
  }

  return {
    id: barbershop.id,
    name: barbershop.name,
    address: barbershop.address,
    imageUrl: barbershop.imageUrl,
    services: barbershop.services.map((service) => ({
      id: service.id,
      name: service.name,
      price: Number(service.price),
    })),
    barbers: barbershop.barbers.map((barber) => ({
      id: barber.id,
      name: barber.name,
    })),
  };
}

  private mapToResponse(
    barbershop: BarbershopWithRelations
  ): BarbershopResponseDTO {

    return {
      id: barbershop.id,
      name: barbershop.name,
      address: barbershop.address,
      imageUrl: barbershop.imageUrl,
      servicesCount: barbershop.services.length,
      barbersCount: barbershop.barbers.length,
    };
  }
}
