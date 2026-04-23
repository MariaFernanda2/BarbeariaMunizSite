"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock3,
  Scissors,
  UserRound,
  BadgeCheck,
  XCircle,
  CheckCircle2,
  Phone,
  CreditCard,
  Banknote,
  Wallet,
  MessageCircle,
  Save,
  ReceiptText,
  Zap,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/app/_components/ui/sheet";

type PaymentMethod = "CARD" | "CASH" | "PIX" | "";

type Service = {
  id: string;
  name: string;
  price: any;
  durationInMinutes?: number;
};

type Booking = {
  id: string;
  date: string | Date;
  endDate?: string | Date;
  status: "CONFIRMED" | "COMPLETED" | "CANCELED";
  barber: {
    name: string;
  };
  user: {
    name: string | null;
  };
  service: {
    name: string;
    price: any;
  };
  clientName?: string | null;
  clientPhone?: string | null;
  paymentMethod?: PaymentMethod | null;
};

interface Props {
  booking: Booking | null;
  onClose: () => void;
  services?: Service[];
  barbershopId?: string;
  currentBarberId?: string;
}

type BookingForm = {
  clientName: string;
  clientPhone: string;
  barberName: string;
  serviceName: string;
  price: string;
  date: string;
  status: Booking["status"];
  paymentMethod: PaymentMethod;
};

const inputClass =
  "w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2.5 text-sm font-semibold text-white outline-none transition placeholder:text-zinc-600 focus:border-[hsl(43_96%_56%_/_0.55)] focus:ring-2 focus:ring-[hsl(43_96%_56%_/_0.10)] disabled:cursor-not-allowed disabled:opacity-50";

function toLocalInputValue(date: string | Date) {
  const d = new Date(date);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

function formatCurrency(value: any) {
  return Number(value ?? 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 2) return digits;

  if (digits.length <= 7) {
    return digits.replace(/^(\d{2})(\d+)/, "($1) $2");
  }

  return digits.replace(/^(\d{2})(\d{5})(\d+)/, "($1) $2-$3");
}

function getStatusLabel(status: Booking["status"]) {
  const labels = {
    CONFIRMED: "Confirmado",
    COMPLETED: "Finalizado",
    CANCELED: "Cancelado",
  };

  return labels[status] ?? status;
}

function getStatusClass(status: Booking["status"]) {
  switch (status) {
    case "CONFIRMED":
      return "border-[hsl(43_96%_56%_/_0.28)] bg-[hsl(43_96%_56%_/_0.12)] text-[hsl(43_96%_56%)]";
    case "COMPLETED":
      return "border-emerald-400/20 bg-emerald-500/10 text-emerald-300";
    case "CANCELED":
      return "border-red-400/20 bg-red-500/10 text-red-300";
    default:
      return "border-zinc-700 bg-zinc-900 text-zinc-300";
  }
}

function getStatusIcon(status: Booking["status"]) {
  switch (status) {
    case "CONFIRMED":
      return <Clock3 size={14} />;
    case "COMPLETED":
      return <CheckCircle2 size={14} />;
    case "CANCELED":
      return <XCircle size={14} />;
    default:
      return <BadgeCheck size={14} />;
  }
}

function getPaymentLabel(paymentMethod: PaymentMethod) {
  switch (paymentMethod) {
    case "CARD":
      return "Cartão";
    case "CASH":
      return "Dinheiro";
    case "PIX":
      return "Pix";
    default:
      return "Não informado";
  }
}

function Field({
  label,
  children,
  icon,
}: {
  label: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500">
        {icon ? (
          <span className="text-[hsl(43_96%_56%)]">{icon}</span>
        ) : null}
        {label}
      </label>

      {children}
    </div>
  );
}

function BookingDetailsContent({
  booking,
  form,
  setForm,
  loading,
  errorMessage,
  onClose,
  onSave,
  onCheckout,
  onOpenQuickCashier,
}: {
  booking: Booking;
  form: BookingForm;
  setForm: React.Dispatch<React.SetStateAction<BookingForm>>;
  loading: boolean;
  errorMessage: string | null;
  onClose?: () => void;
  onSave: () => void;
  onCheckout: () => void;
  onOpenQuickCashier: () => void;
}) {
  const clientDisplayName = form.clientName || booking.user.name || "Cliente";
  const canCheckout = form.status !== "CANCELED" && !!form.paymentMethod;

  function updateField<K extends keyof BookingForm>(
    key: K,
    value: BookingForm[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleWhatsapp() {
    const phone = form.clientPhone.replace(/\D/g, "");

    if (!phone) return;

    const message = `Olá ${clientDisplayName}! 👋

Seu atendimento na Barbearia Muniz está confirmado ✂️

💈 ${form.serviceName}
💰 ${formatCurrency(form.price)}

Obrigado pela preferência!`;

    window.open(
      `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  }

  return (
    <div className="relative flex h-full flex-col bg-zinc-950">
      <div className="border-b border-white/10 bg-[radial-gradient(circle_at_top,hsl(43_96%_56%_/_0.12),transparent_36%)] px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
              Detalhes do atendimento
            </p>

            <h2 className="mt-1 truncate text-xl font-black text-white">
              {clientDisplayName}
            </h2>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <div
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${getStatusClass(
                  form.status
                )}`}
              >
                {getStatusIcon(form.status)}
                {getStatusLabel(form.status)}
              </div>

              <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-bold text-zinc-300">
                <CreditCard size={12} />
                {getPaymentLabel(form.paymentMethod)}
              </div>
            </div>
          </div>

          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition hover:bg-white/10"
            >
              ✕
            </button>
          ) : null}
        </div>

        <div className="mt-4 rounded-2xl border border-[hsl(43_96%_56%_/_0.24)] bg-[hsl(43_96%_56%_/_0.08)] p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-400">
                Valor
              </p>

              <p className="text-2xl font-black text-[hsl(43_96%_56%)]">
                {formatCurrency(form.price)}
              </p>
            </div>

            <div className="max-w-[170px] text-right">
              <p className="line-clamp-2 text-xs font-semibold text-zinc-200">
                {form.serviceName || "Serviço não informado"}
              </p>
              <p className="mt-1 text-[11px] text-zinc-500">
                {form.barberName || "Barbeiro"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 pb-40">

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={loading || !form.clientPhone}
            onClick={handleWhatsapp}
            className="flex items-center justify-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2.5 text-xs font-bold text-emerald-300 transition hover:bg-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <MessageCircle size={14} />
            WhatsApp
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => {
              updateField("clientName", "Cliente esporádico");
              updateField("clientPhone", "");
            }}
            className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-bold text-zinc-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <UserRound size={14} />
            Esporádico
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <Field label="Cliente" icon={<UserRound size={14} />}>
            <input
              value={form.clientName}
              onChange={(e) => updateField("clientName", e.target.value)}
              placeholder="Nome do cliente"
              disabled={loading}
              className={inputClass}
            />
          </Field>

          <Field label="WhatsApp opcional" icon={<Phone size={14} />}>
            <input
              value={form.clientPhone}
              onChange={(e) =>
                updateField("clientPhone", formatPhone(e.target.value))
              }
              placeholder="(11) 99999-9999"
              disabled={loading}
              className={inputClass}
              inputMode="numeric"
            />
          </Field>

          <Field label="Serviço" icon={<Scissors size={14} />}>
            <input
              value={form.serviceName}
              onChange={(e) => updateField("serviceName", e.target.value)}
              placeholder="Nome do serviço"
              disabled={loading}
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Valor" icon={<Wallet size={14} />}>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => updateField("price", e.target.value)}
                placeholder="0,00"
                disabled={loading}
                className={inputClass}
              />
            </Field>

            <Field label="Status" icon={<BadgeCheck size={14} />}>
              <select
                value={form.status}
                onChange={(e) =>
                  updateField("status", e.target.value as Booking["status"])
                }
                disabled={loading}
                className={inputClass}
              >
                <option value="CONFIRMED">Confirmado</option>
                <option value="COMPLETED">Finalizado</option>
                <option value="CANCELED">Cancelado</option>
              </select>
            </Field>
          </div>

          <Field label="Pagamento" icon={<CreditCard size={14} />}>
            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  value: "CARD",
                  label: "Cartão",
                  icon: <CreditCard size={14} />,
                },
                {
                  value: "CASH",
                  label: "Dinheiro",
                  icon: <Banknote size={14} />,
                },
                {
                  value: "PIX",
                  label: "Pix",
                  icon: <Wallet size={14} />,
                },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  disabled={loading}
                  onClick={() =>
                    updateField("paymentMethod", item.value as PaymentMethod)
                  }
                  className={`flex items-center justify-center gap-1.5 rounded-xl border px-2 py-2.5 text-[11px] font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${form.paymentMethod === item.value
                    ? "border-[hsl(43_96%_56%_/_0.55)] bg-[hsl(43_96%_56%_/_0.16)] text-[hsl(43_96%_56%)]"
                    : "border-white/10 bg-zinc-900 text-zinc-300 hover:bg-white/5"
                    }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>

            {!form.paymentMethod ? (
              <p className="mt-2 text-[11px] font-medium text-yellow-400">
                Selecione para liberar o checkout.
              </p>
            ) : null}
          </Field>

          <Field label="Barbeiro" icon={<UserRound size={14} />}>
            <input
              value={form.barberName}
              onChange={(e) => updateField("barberName", e.target.value)}
              placeholder="Nome do barbeiro"
              disabled={loading}
              className={inputClass}
            />
          </Field>

          <Field label="Data e horário" icon={<CalendarDays size={14} />}>
            <input
              type="datetime-local"
              value={form.date}
              onChange={(e) => updateField("date", e.target.value)}
              disabled={loading}
              className={inputClass}
            />
          </Field>
        </div>

        {errorMessage ? (
          <div className="rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs text-red-200">
            {errorMessage}
          </div>
        ) : null}
      </div>

      <div className="border-t border-white/10 bg-zinc-950/95 p-4 backdrop-blur xl:static">
        <div className="mb-2 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
          <div>
            <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">
              Total
            </p>
            <p className="text-lg font-black text-white">
              {formatCurrency(form.price)}
            </p>
          </div>

          <div className="text-right">
            <p className="text-[10px] text-zinc-500">Pagamento</p>
            <p className="text-xs font-bold text-zinc-200">
              {getPaymentLabel(form.paymentMethod)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onSave}
            disabled={loading}
            className="premium-button flex items-center justify-center gap-1.5 rounded-xl px-3 py-3 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save size={14} />
            {loading ? "Salvando..." : "Salvar"}
          </button>

          <button
            type="button"
            onClick={onCheckout}
            disabled={loading || !canCheckout}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-400 px-3 py-3 text-xs font-black text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ReceiptText size={14} />
            {loading ? "..." : "Checkout"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BookingDrawer({
  booking,
  onClose,
  services = [],
  barbershopId,
  currentBarberId,
}: Props) {
  const safeServices = Array.isArray(services) ? services : [];

  const [form, setForm] = useState<BookingForm>({
    clientName: "",
    clientPhone: "",
    barberName: "",
    serviceName: "",
    price: "",
    date: "",
    status: "CONFIRMED",
    paymentMethod: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isQuickCashierOpen, setIsQuickCashierOpen] = useState(false);
  const [quickServiceId, setQuickServiceId] = useState("");
  const [quickPaymentMethod, setQuickPaymentMethod] =
    useState<PaymentMethod>("");
  const [quickLoading, setQuickLoading] = useState(false);

  useEffect(() => {
    if (!booking) return;

    setForm({
      clientName: booking.clientName || booking.user.name || "",
      clientPhone: booking.clientPhone || "",
      barberName: booking.barber.name || "",
      serviceName: booking.service.name || "",
      price: String(Number(booking.service.price ?? 0)),
      date: toLocalInputValue(booking.date),
      status: booking.status,
      paymentMethod: booking.paymentMethod || "",
    });

    setErrorMessage(null);
  }, [booking]);

  useEffect(() => {
    if (!quickServiceId && safeServices.length > 0) {
      setQuickServiceId(safeServices[0].id);
    }
  }, [safeServices, quickServiceId]);

  const isOpen = useMemo(() => !!booking, [booking]);

  const selectedQuickService = useMemo(() => {
    return safeServices.find((service) => service.id === quickServiceId);
  }, [safeServices, quickServiceId]);

  function openQuickCashier() {
    if (!safeServices.length) {
      alert("Nenhum serviço disponível para atendimento rápido.");
      return;
    }

    if (!barbershopId || !currentBarberId) {
      alert("Dados da barbearia ou barbeiro não encontrados.");
      return;
    }

    setIsQuickCashierOpen(true);
  }

  async function updateBooking(extraPayload?: Record<string, any>) {
    if (!booking) return;

    const payload = {
      clientName: form.clientName.trim(),
      clientPhone: form.clientPhone.trim() || null,
      barberName: form.barberName.trim(),
      serviceName: form.serviceName.trim(),
      price: Number(form.price || 0),
      date: new Date(form.date).toISOString(),
      status: form.status,
      paymentMethod: form.paymentMethod || null,
      ...extraPayload,
    };

    const res = await fetch(`/api/v1/bookings/${booking.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      throw new Error(data?.message || "Erro ao atualizar agendamento.");
    }

    window.location.reload();
  }

  async function handleSave() {
    try {
      setLoading(true);
      setErrorMessage(null);
      await updateBooking();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar as alterações."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckout() {
    try {
      if (!form.paymentMethod) {
        setErrorMessage("Selecione uma forma de pagamento para finalizar.");
        return;
      }

      setLoading(true);
      setErrorMessage(null);

      await updateBooking({
        status: "COMPLETED",
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível finalizar o atendimento."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleQuickCashierSubmit() {
    try {
      if (!barbershopId || !currentBarberId) {
        alert("Dados da barbearia ou barbeiro não encontrados.");
        return;
      }

      if (!quickServiceId) {
        alert("Selecione um serviço.");
        return;
      }

      if (!quickPaymentMethod) {
        alert("Selecione uma forma de pagamento.");
        return;
      }

      setQuickLoading(true);

      const response = await fetch("/api/v1/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          barberId: currentBarberId,
          barbershopId,
          serviceId: quickServiceId,
          clientName: "Cliente balcão",
          clientPhone: "",
          date: new Date().toISOString(),
          status: "COMPLETED",
          paymentMethod: quickPaymentMethod,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || "Erro ao registrar atendimento.");
      }

      setIsQuickCashierOpen(false);
      setQuickPaymentMethod("");

      window.location.reload();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Erro ao registrar atendimento."
      );
    } finally {
      setQuickLoading(false);
    }
  }

  return (
    <>
      <div className="xl:hidden">
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
          <SheetContent
            side="bottom"
            className="h-[88vh] rounded-t-[28px] border-white/10 bg-zinc-950 p-0 text-white"
          >
            <SheetHeader className="sr-only">
              <SheetTitle>Detalhes do agendamento</SheetTitle>
            </SheetHeader>

            {booking ? (
              <BookingDetailsContent
                booking={booking}
                form={form}
                setForm={setForm}
                loading={loading}
                errorMessage={errorMessage}
                onSave={handleSave}
                onCheckout={handleCheckout}
                onOpenQuickCashier={openQuickCashier}
              />
            ) : null}
          </SheetContent>
        </Sheet>
      </div>

      {booking ? (
        <aside className="hidden h-full w-[460px] shrink-0 border-l border-white/10 bg-zinc-950 xl:block">
          <BookingDetailsContent
            booking={booking}
            form={form}
            setForm={setForm}
            loading={loading}
            errorMessage={errorMessage}
            onClose={onClose}
            onSave={handleSave}
            onCheckout={handleCheckout}
            onOpenQuickCashier={openQuickCashier}
          />
        </aside>
      ) : null}

      {isQuickCashierOpen ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-zinc-950 p-6 text-white shadow-[0_30px_90px_rgba(0,0,0,0.65)]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[hsl(43_96%_56%_/_0.25)] bg-[hsl(43_96%_56%_/_0.10)] px-3 py-1 text-xs font-bold text-[hsl(43_96%_56%)]">
                  <Zap size={14} />
                  Modo caixa
                </div>

                <h2 className="mt-3 text-xl font-black">
                  Atendimento rápido
                </h2>

                <p className="mt-1 text-sm text-zinc-400">
                  Registre um atendimento de balcão já como finalizado.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsQuickCashierOpen(false)}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <Field label="Serviço" icon={<Scissors size={16} />}>
                <select
                  value={quickServiceId}
                  onChange={(e) => setQuickServiceId(e.target.value)}
                  className={inputClass}
                  disabled={quickLoading}
                >
                  {safeServices.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} — {formatCurrency(service.price)}
                    </option>
                  ))}
                </select>

                {selectedQuickService ? (
                  <p className="mt-3 text-2xl font-black text-[hsl(43_96%_56%)]">
                    {formatCurrency(selectedQuickService.price)}
                  </p>
                ) : null}
              </Field>

              <Field label="Forma de pagamento" icon={<CreditCard size={16} />}>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    {
                      value: "CARD",
                      label: "Cartão",
                      icon: <CreditCard size={15} />,
                    },
                    {
                      value: "CASH",
                      label: "Dinheiro",
                      icon: <Banknote size={15} />,
                    },
                    {
                      value: "PIX",
                      label: "Pix",
                      icon: <Wallet size={15} />,
                    },
                  ].map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      disabled={quickLoading}
                      onClick={() =>
                        setQuickPaymentMethod(item.value as PaymentMethod)
                      }
                      className={`flex items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${quickPaymentMethod === item.value
                        ? "border-[hsl(43_96%_56%_/_0.55)] bg-[hsl(43_96%_56%_/_0.16)] text-[hsl(43_96%_56%)]"
                        : "border-white/10 bg-zinc-950 text-zinc-300 hover:bg-white/5"
                        }`}
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  ))}
                </div>
              </Field>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                      Cliente
                    </p>
                    <p className="font-bold text-white">Cliente balcão</p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                      Status
                    </p>
                    <p className="font-bold text-emerald-300">Finalizado</p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleQuickCashierSubmit}
                disabled={quickLoading || !quickServiceId || !quickPaymentMethod}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-4 py-4 text-sm font-black text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ReceiptText size={17} />
                {quickLoading ? "Registrando..." : "Registrar atendimento"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}