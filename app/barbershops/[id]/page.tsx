import { db } from "@/app/_lib/prisma";
import BarbershopInfo from "./_components/barbershop-info";
import ServiceItem from "./_components/service-item";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/_lib/auth";
import { Service } from "@prisma/client";

interface BarbershopDetailsPageProps {
  params: {
    id?: string;
  };
}

const BarbershopDetailsPage = async ({ params }: BarbershopDetailsPageProps) => {
  const session = await getServerSession(authOptions);

  if (!params.id) {
    // TODO: redirecionar para home page
    return null;
  }

  // 💡 CORREÇÃO AQUI: Adicionar o 'include: { barbers: true }'
  const barbershop = await db.barbershop.findUnique({
    where: {
      id: params.id,
    },
    include: {
      services: true,
      barbers: true, // ⬅️ AGORA SEUS BARBEIROS SERÃO CARREGADOS
    },
  });

  if (!barbershop) {
    // TODO: redirecionar para home page
    return null;
  }
  
  // Como a tipagem original do Prisma agora tem 'services' e 'barbers' incluídos, 
  // o TypeScript deve aceitar. Se houver um erro de tipagem no ServiceItem, 
  // pode ser necessário ajustar a interface, mas faremos isso no ServiceItem.

  return (
    <div>
      <BarbershopInfo barbershop={barbershop} />

      <div className="px-5 flex flex-col gap-4 py-6">
        {/* Passamos o 'barbershop' que agora tem a lista de 'barbers' */}
        {barbershop.services.map((service: Service) => (
          <ServiceItem 
            key={service.id} 
            barbershop={barbershop as any} // Usamos 'as any' temporário se o TS reclamar antes de corrigir o ServiceItem
            service={service} 
            isAuthenticated={!!session?.user} 
          />
        ))}
      </div>
    </div>
  );
};

export default BarbershopDetailsPage;