"use client";

import { format, isFuture } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Event {
  id: number;
  title: string;
  date: Date;
  description: string;
  image?: string;
}

const mockEvents: Event[] = [
  {
    id: 1,
    title: "Inauguração da Unidade II",
    date: new Date(2026, 3, 11),
    description: "Venha conhecer nossa nova unidade!",
    image:
      "https://cl1ro7kgga.ufs.sh/f/vKcUisEYIxmgRtaCb3zLlfvcJFoSYEXi928QzG5nMm671VuO",
  },
  {
    id: 2,
    title: "Dia das Mães",
    date: new Date(2026, 4, 10),
    description: "Promoções especiais para ficar bonitão pra sua mãe.",
    image:"https://www.lojawentz.com.br/media/magefan_blog/2024/celebrando-o-dia-das-maes-com-ensaio-fotografico-5.jpg",
  },
  {
    id: 3,
    title: "Dia dos Namorados",
    date: new Date(2026, 5, 12),
    description: "Descontos para ficar no estilo 💈❤️",
    image:"https://meubolso.mercadopago.com.br/hs-fs/hubfs/imagens/blog/meu_bolso/Presente-para-o-Dia-dos-Namorados-Mercado-Pago.jpg?width=670&name=Presente-para-o-Dia-dos-Namorados-Mercado-Pago.jpg",
    
  },
  {
    id: 4,
    title: "Brasil x México",
    date: new Date(2026, 5, 12),
    description: "Transmissão ao vivo na barbearia!",
    image:
      "https://p2.trrsf.com/image/fget/cf/500/0/images.terra.com/2026/03/06/363718949-mexxbra-amistoso-feminino-610x400.jpg",
  },
  {
    id: 5,
    title: "Brasil x Alemanha",
    date: new Date(2026, 5, 17),
    description: "Venha torcer com a gente 🇧🇷🔥",
    image:
      "https://media.licdn.com/dms/image/v2/D4D12AQGV3tk9UMLA-w/article-cover_image-shrink_720_1280/B4DZsJd2VcLcAI-/0/1765390383251?e=2147483647&v=beta&t=I8ZkeNNuPLIiQ2HdRurIHo01KKVeNjymnG0IRTmxWqM",
  },
  {
    id: 6,
    title: "Brasil x Japão",
    date: new Date(2026, 5, 22),
    description: "Clima de copa na barbearia!",
    image:
      "https://www.estadao.com.br/resizer/v2/CJZ5E4RJSVF3XAO26GAGAMMH7M.jpeg?quality=80&auth=a4fb157323f156d9b860998ee2b7974165898448190a4010342f127c42ae52c4&width=1200",
  },
];

export default function EventsSection() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    const value = direction === "left" ? -300 : 300;

    scrollRef.current?.scrollBy({
      left: value,
      behavior: "smooth",
    });
  };

  const events = [...mockEvents].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );

  if (!events.length) {
    return (
      <div className="px-5 mt-6">
        <p className="text-sm text-gray-400">
          Nenhum evento disponível no momento.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      {/* HEADER */}
      <div className="flex items-center justify-between px-5 mb-3">
        <h2 className="text-xs uppercase text-gray-400 font-bold">
          Eventos
        </h2>

        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            className="bg-zinc-800 hover:bg-zinc-700 transition p-2 rounded-full"
          >
            <ChevronLeft size={16} />
          </button>

          <button
            onClick={() => scroll("right")}
            className="bg-zinc-800 hover:bg-zinc-700 transition p-2 rounded-full"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* CARROSSEL COM FADE */}
      <div className="relative">
        {/* FADE ESQUERDA */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-zinc-950 to-transparent z-10" />

        {/* FADE DIREITA */}
        <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-zinc-950 to-transparent z-10" />

        {/* SCROLL */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto px-5 scrollbar-hide pb-2 scroll-smooth"
        >
          {events.map((event) => {
            const isUpcoming = isFuture(event.date);

            return (
              <div
                key={event.id}
                className="min-w-[220px] max-w-[220px] bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 transition-transform duration-300 hover:scale-[1.02]"
              >
                {event.image && (
                  <div className="w-full h-[120px]">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">
                      {format(event.date, "dd MMM", { locale: ptBR })}
                    </span>

                    {isUpcoming && (
                      <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-full">
                        Em breve
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold leading-tight">
                    {event.title}
                  </h3>

                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                    {event.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}