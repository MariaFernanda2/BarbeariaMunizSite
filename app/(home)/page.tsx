import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getServerSession } from "next-auth";
import { headers } from "next/headers";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  PlusCircle,
  Scissors,
  Star,
  Trophy,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";

import { authOptions } from "@/app/lib/auth";
import Header from "@/app/_components/header";
import BookingItem from "@/app/_components/booking-item";
import Search from "./_components/search";
import BarbershopItem from "./_components/barbershop-item";
import QuickRebookingBanner from "./_components/quick-rebooking-banner";
import Carousel from "./_components/carousel";
import EventsSection from "./_components/events-section";
import { Button } from "@/app/_components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";

type SessionUser = {
  id?: string;
  name?: string | null;
  role?: "USER" | "BARBER" | "ADMIN";
  barbershopId?: number | string | null;
};

type HomeData = {
  recommendedBarbershops: any[];
  confirmedBookings: any[];
  lastCompletedBooking: any;
  carouselItems: any[];
};

async function getBaseUrl() {
  const host = headers().get("host");
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  return `${protocol}://${host}`;
}

async function getHomeData(userId?: string): Promise<HomeData> {
  const baseUrl = await getBaseUrl();

  const [barbershopsRes, bookingsRes, lastBookingRes, carouselRes] =
    await Promise.all([
      fetch(`${baseUrl}/api/v1/barbershops?page=1&limit=10`, {
        cache: "no-store",
      }),
      userId
        ? fetch(`${baseUrl}/api/v1/bookings?userId=${userId}`, {
            cache: "no-store",
          })
        : Promise.resolve(null),
      userId
        ? fetch(`${baseUrl}/api/v1/bookings/last-completed?userId=${userId}`, {
            cache: "no-store",
          })
        : Promise.resolve(null),
      fetch(`${baseUrl}/api/v1/carousel`, {
        cache: "no-store",
      }),
    ]);

  const barbershopsData = await barbershopsRes.json().catch(() => ({
    data: [],
  }));

  const bookingsData = await bookingsRes?.json().catch(() => ({
    data: [],
  }));

  const lastBookingData = await lastBookingRes?.json().catch(() => ({
    data: null,
  }));

  const carouselData = await carouselRes.json().catch(() => ({
    data: [],
  }));

  return {
    recommendedBarbershops: barbershopsData?.data ?? [],
    confirmedBookings: bookingsData?.data ?? [],
    lastCompletedBooking: lastBookingData?.data ?? null,
    carouselItems: carouselData?.data ?? [],
  };
}

function SectionTitle({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={`mb-3 px-5 text-xs font-bold uppercase tracking-wide text-zinc-500 ${className}`}
    >
      {children}
    </h2>
  );
}

function Greeting({ userName }: { userName?: string | null }) {
  return (
    <div className="px-5 pt-5">
      <h2 className="text-xl font-bold text-foreground md:text-2xl">
        {userName
          ? `Olá, ${userName.split(" ")[0]}!`
          : "Olá! Vamos agendar um corte hoje?"}
      </h2>
      <p className="mb-4 text-sm capitalize text-zinc-500">
        {format(new Date(), "EEEE',' dd 'de' MMMM", { locale: ptBR })}
      </p>
    </div>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
}) {
  return (
    <Card className="rounded-3xl border border-zinc-200 bg-white shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-zinc-600">{title}</p>
            <h3 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">
              {value}
            </h3>
            <p className="mt-1 text-xs text-zinc-500">{subtitle}</p>
          </div>

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-700">
            <Icon size={20} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ActionCard({
  title,
  description,
  href,
  cta,
  icon: Icon,
  tone = "primary",
}: {
  title: string;
  description: string;
  href: string;
  cta: string;
  icon: LucideIcon;
  tone?: "primary" | "secondary";
}) {
  const buttonClassName =
    tone === "primary"
      ? "mt-5 w-full rounded-2xl bg-primary text-primary-foreground hover:opacity-90"
      : "mt-5 w-full rounded-2xl bg-zinc-800 text-white hover:bg-zinc-700";

  return (
    <Card className="group rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-900 to-black text-white shadow-[0_12px_30px_rgba(0,0,0,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
      <CardContent className="p-5">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-700 bg-zinc-800/80 text-zinc-100 transition-colors group-hover:bg-zinc-700">
          <Icon size={22} />
        </div>

        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="mt-2 min-h-[72px] text-sm leading-relaxed text-zinc-400">
          {description}
        </p>

        <Button asChild className={buttonClassName}>
          <Link href={href}>{cta}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function RankingRow({
  position,
  name,
  rating,
  reviews,
  highlight = false,
}: {
  position: string;
  name: string;
  rating: string;
  reviews: string;
  highlight?: boolean;
}) {
  if (highlight) {
    return (
      <div className="rounded-2xl border border-amber-300 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
              {position}
            </p>
            <h3 className="mt-1 text-base font-semibold text-zinc-900">{name}</h3>
            <p className="mt-1 text-sm text-zinc-600">
              {rating} de média • {reviews}
            </p>
          </div>

          <div className="rounded-full bg-amber-100 p-2 text-amber-700">
            <Trophy size={18} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 transition hover:bg-zinc-50">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-zinc-900">{position}</p>
          <p className="text-sm text-zinc-600">
            {name} • {rating}
          </p>
        </div>

        <p className="text-sm font-medium text-zinc-700">{reviews}</p>
      </div>
    </div>
  );
}

function PerformanceItem({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-700">
        <Icon size={18} />
      </div>

      <p className="text-sm font-medium text-zinc-600">{title}</p>
      <h3 className="mt-2 text-lg font-semibold text-zinc-900">{value}</h3>
      <p className="mt-2 text-xs leading-relaxed text-zinc-500">{description}</p>
    </div>
  );
}

function BarberHero({ barberBarbershopId, barberName }: { barberBarbershopId: string; barberName: string }) {
  return (
    <section className="px-5 pt-6">
      <Card className="overflow-hidden rounded-[28px] border border-zinc-800 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 text-white shadow-[0_18px_50px_rgba(0,0,0,0.35)]">
        <CardContent className="relative p-6 md:p-8">
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-white/5 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
                Painel do barbeiro
              </div>

              <h1 className="mt-4 text-2xl font-bold tracking-tight text-white md:text-3xl">
                Olá, {barberName}! Sua agenda começa aqui.
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-300 md:text-base">
                Acompanhe seus atendimentos, crie novos agendamentos, veja seus
                relatórios e acompanhe seu desempenho na barbearia.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="rounded-2xl bg-white px-6 text-black hover:bg-zinc-200"
                >
                  <Link href={`/dashboard/barbershop/${barberBarbershopId}`}>
                    Ver agenda
                    <ArrowRight className="ml-2" size={18} />
                  </Link>
                </Button>

                <Button
                  asChild
                  size="lg"
                  className="rounded-2xl border border-white/10 bg-white/10 text-white hover:bg-white/20"
                >
                  <Link href="/bookings/new">Criar agendamento</Link>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:min-w-[320px]">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-wide text-zinc-300">Hoje</p>
                <p className="mt-2 text-2xl font-bold text-white">08</p>
                <p className="text-xs text-zinc-300">agendamentos</p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-wide text-zinc-300">Média</p>
                <p className="mt-2 text-2xl font-bold text-white">4.9</p>
                <p className="text-xs text-zinc-300">avaliação</p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-wide text-zinc-300">
                  Clientes
                </p>
                <p className="mt-2 text-2xl font-bold text-white">24</p>
                <p className="text-xs text-zinc-300">no mês</p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-wide text-zinc-300">
                  Destaque
                </p>
                <p className="mt-2 text-2xl font-bold text-white">#2</p>
                <p className="text-xs text-zinc-300">ranking</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function BarberHome({ user }: { user: SessionUser }) {
  const barberBarbershopId = String(user?.barbershopId ?? "1");
  const barberName = user?.name?.split(" ")[0] ?? "Barbeiro";

  return (
    <div className="min-h-screen bg-zinc-100">
      <Header />

      <main className="pb-24">
        <BarberHero
          barberBarbershopId={barberBarbershopId}
          barberName={barberName}
        />

        <section className="mt-6 grid grid-cols-1 gap-3 px-5 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Agendamentos hoje"
            value="08"
            subtitle="2 em andamento"
            icon={CalendarDays}
          />
          <MetricCard
            title="Avaliação média"
            value="4.9"
            subtitle="Baseado nos clientes"
            icon={Star}
          />
          <MetricCard
            title="Clientes atendidos"
            value="24"
            subtitle="Neste mês"
            icon={Users}
          />
          <MetricCard
            title="Crescimento"
            value="+12%"
            subtitle="Comparado ao mês passado"
            icon={TrendingUp}
          />
        </section>

        <section className="mt-6 grid grid-cols-1 gap-4 px-5 lg:grid-cols-3">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:col-span-2">
            <ActionCard
              title="Minha agenda"
              description="Visualize sua agenda diária e acompanhe seus horários marcados."
              href={`/dashboard/barbershop/${barberBarbershopId}`}
              cta="Abrir agenda"
              icon={CalendarDays}
            />

            <ActionCard
              title="Novo agendamento"
              description="Crie rapidamente um novo horário para clientes e encaixes."
              href="/bookings/new"
              cta="Criar agora"
              icon={PlusCircle}
            />

            <ActionCard
              title="Relatórios"
              description="Acompanhe seus números, desempenho e evolução no período."
              href="/dashboard/reports"
              cta="Ver relatórios"
              icon={BarChart3}
              tone="secondary"
            />
          </div>

          <Card className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-white shadow-[0_10px_28px_rgba(0,0,0,0.06)]">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg text-zinc-900">
                    <Trophy className="text-amber-500" size={18} />
                    Barbeiro destaque
                  </CardTitle>
                  <CardDescription className="text-zinc-600">
                    Ranking por avaliações dos clientes
                  </CardDescription>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                  <Star size={18} />
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <RankingRow
                position="1º lugar"
                name="João Muniz"
                rating="4.9"
                reviews="47 avaliações"
                highlight
              />
              <RankingRow
                position="2º lugar"
                name="Carlos Silva"
                rating="4.8"
                reviews="39 avaliações"
              />
              <RankingRow
                position="3º lugar"
                name="Pedro Lima"
                rating="4.7"
                reviews="31 avaliações"
              />

              <div className="rounded-2xl bg-amber-50 p-4">
                <p className="text-sm leading-relaxed text-zinc-600">
                  O ranking será definido com base nas avaliações feitas pelos
                  clientes ao final de cada atendimento concluído.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mt-6 px-5">
          <Card className="rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-900 to-black text-white shadow-[0_14px_34px_rgba(0,0,0,0.24)]">
            <CardHeader>
              <CardTitle className="text-lg text-white">
                Resumo de performance
              </CardTitle>
              <CardDescription className="text-zinc-400">
                Visão rápida do seu desempenho na unidade
              </CardDescription>
            </CardHeader>

            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <PerformanceItem
                title="Serviço mais pedido"
                value="Corte + Barba"
                description="Serviço com maior saída no mês atual"
                icon={Scissors}
              />
              <PerformanceItem
                title="Clientes recorrentes"
                value="18 clientes"
                description="Retornaram para mais de um atendimento"
                icon={Users}
              />
              <PerformanceItem
                title="Meta do mês"
                value="78%"
                description="Progresso atual da sua meta mensal"
                icon={BarChart3}
              />
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}

function CustomerHome({
  session,
  recommendedBarbershops,
  confirmedBookings,
  lastCompletedBooking,
  carouselItems,
}: {
  session: any;
  recommendedBarbershops: any[];
  confirmedBookings: any[];
  lastCompletedBooking: any;
  carouselItems: any[];
}) {
  return (
    <div>
      <Header />

      <div className="mt-6 px-5">
        <Search />
      </div>

      <Greeting userName={session?.user?.name} />

      {carouselItems.length > 0 && (
        <div className="mt-6">
          <SectionTitle>Confira nosso trabalho</SectionTitle>
          <Carousel items={carouselItems} />
          <EventsSection />
        </div>
      )}

      {lastCompletedBooking && (
        <QuickRebookingBanner lastBooking={lastCompletedBooking} />
      )}

      {confirmedBookings.length > 0 && (
        <div className="mt-6">
          <SectionTitle className="pl-5">Agendamentos</SectionTitle>

          <div className="flex gap-3 overflow-x-auto px-5">
            {confirmedBookings.map((booking: any) => (
              <BookingItem key={booking.id} booking={booking} />
            ))}
          </div>
        </div>
      )}

      <div className="mb-[4.5rem] mt-6">
        <SectionTitle>Unidades</SectionTitle>

        <div className="flex gap-4 overflow-x-auto px-5">
          {recommendedBarbershops.map((barbershop: any) => (
            <div key={barbershop.id} className="min-w-[167px] max-w-[167px]">
              <BarbershopItem barbershop={barbershop} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function Home() {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;

  if (user?.role === "BARBER") {
    return <BarberHome user={user} />;
  }

  const {
    recommendedBarbershops,
    confirmedBookings,
    lastCompletedBooking,
    carouselItems,
  } = await getHomeData(user?.id);

  return (
    <CustomerHome
      session={session}
      recommendedBarbershops={recommendedBarbershops}
      confirmedBookings={confirmedBookings}
      lastCompletedBooking={lastCompletedBooking}
      carouselItems={carouselItems}
    />
  );
}