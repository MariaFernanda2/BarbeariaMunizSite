import { db } from "@/app/lib/repositories/prisma";
import BarbershopInfo from "./_components/barbershop-info";
import ServiceItem from "./_components/service-item";

interface BarbershopDetailsPageProps {
  params: {
    id?: string;
  };
}

const BarbershopDetailsPage = async ({
  params,
}: BarbershopDetailsPageProps) => {
  if (!params.id) {
    return null;
  }

  const barbershop = await db.barbershop.findUnique({
    where: {
      id: params.id,
    },
    include: {
      services: {
        include: {
          service: true,
        },
      },
      barbers: true,
    },
  });

  if (!barbershop) {
    return null;
  }

  const formattedBarbershop = {
    ...barbershop,
    services: barbershop.services.map((barbershopService) => ({
      id: barbershopService.service.id,
      name: barbershopService.service.name,
      description: barbershopService.service.description,
      imageUrl: barbershopService.service.imageUrl,
      durationInMinutes: barbershopService.service.durationInMinutes,
      price: Number(barbershopService.price),
    })),
  };

  return (
    <div>
      <BarbershopInfo barbershop={formattedBarbershop} />

      <div className="flex flex-col gap-4 px-5 py-6">
        {formattedBarbershop.services.map((service) => (
          <ServiceItem
            key={service.id}
            barbershop={formattedBarbershop}
            service={service}
          />
        ))}
      </div>
    </div>
  );
};

export default BarbershopDetailsPage;