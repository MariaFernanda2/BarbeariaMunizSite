"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import {
  CalendarIcon,
  HomeIcon,
  LogInIcon,
  LogOutIcon,
  StoreIcon,
  UserIcon,
} from "lucide-react";

import { SheetHeader, SheetTitle } from "./ui/sheet";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";

const SideMenu = () => {
  const { data: session } = useSession();

  const user = session?.user as
    | {
        name?: string | null;
        image?: string | null;
        role?: "USER" | "BARBER" | "ADMIN";
        barbershopId?: number | string | null;
      }
    | undefined;

  const isLoggedIn = !!user;
  const role = user?.role;

  const isAdmin = role === "ADMIN";
  const isBarber = role === "BARBER";
  const isClient = role === "USER";

  // Ajuste aqui conforme vier do seu session/token
  const barberBarbershopId = user?.barbershopId;

  const showBookings = isLoggedIn && isClient;
  const showUnit1Agenda =
    isLoggedIn && (isAdmin || (isBarber && String(barberBarbershopId) === "1"));
  const showUnit2Agenda =
    isLoggedIn && (isAdmin || (isBarber && String(barberBarbershopId) === "2"));
  const showUnit3Agenda =
    isLoggedIn && (isAdmin || (isBarber && String(barberBarbershopId) === "3"));

  const handleLogoutClick = () => signOut();
  const handleLoginClick = () => signIn("google");

  const getRoleLabel = () => {
    if (isAdmin) return "Administrador";
    if (isBarber) return "Barbeiro";
    return "Cliente";
  };

  return (
    <>
      <SheetHeader className="border-b border-secondary p-5 text-left">
        <SheetTitle className="text-base font-bold">Menu</SheetTitle>
      </SheetHeader>

      {isLoggedIn ? (
        <div className="flex items-center justify-between px-5 py-6">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={user?.image ?? ""} alt={user?.name ?? "Usuário"} />
            </Avatar>

            <div>
              <h2 className="font-bold">{user?.name}</h2>
              <p className="text-xs text-muted-foreground">{getRoleLabel()}</p>
            </div>
          </div>

          <Button variant="secondary" size="icon" onClick={handleLogoutClick}>
            <LogOutIcon size={18} />
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3 px-5 py-6">
          <div className="flex items-center gap-2">
            <UserIcon size={32} />
            <h2 className="font-bold">Olá, faça seu login!</h2>
          </div>

          <Button
            variant="secondary"
            className="w-full justify-start"
            onClick={handleLoginClick}
          >
            <LogInIcon className="mr-2" size={18} />
            Fazer login
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-3 px-5 pb-5">
        <Button variant="outline" className="justify-start" asChild>
          <Link href="/">
            <HomeIcon size={18} className="mr-2" />
            Início
          </Link>
        </Button>

        {showBookings && (
          <Button variant="outline" className="justify-start" asChild>
            <Link href="/bookings">
              <CalendarIcon size={18} className="mr-2" />
              Agendamentos
            </Link>
          </Button>
        )}

        {showUnit1Agenda && (
          <Button variant="outline" className="justify-start" asChild>
            <Link href="/dashboard/barbershop/1">
              <StoreIcon size={18} className="mr-2" />
              Agenda Unidade 1
            </Link>
          </Button>
        )}

        {showUnit2Agenda && (
          <Button variant="outline" className="justify-start" asChild>
            <Link href="/dashboard/barbershop/2">
              <StoreIcon size={18} className="mr-2" />
              Agenda Unidade 2
            </Link>
          </Button>
        )}

        {showUnit3Agenda && (
          <Button variant="outline" className="justify-start" asChild>
            <Link href="/dashboard/barbershop/3">
              <StoreIcon size={18} className="mr-2" />
              Agenda Unidade 3
            </Link>
          </Button>
        )}
      </div>
    </>
  );
};

export default SideMenu;