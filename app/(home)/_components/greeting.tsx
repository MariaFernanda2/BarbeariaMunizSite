import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface GreetingProps {
  userName?: string | null;
}

export default function Greeting({ userName }: GreetingProps) {
  return (
    <div className="px-5 pt-5">
      <h2 className="text-xl font-bold text-foreground md:text-2xl">
        {userName
          ? `Olá, ${userName.split(" ")[0]}!`
          : "Olá! Vamos agendar um corte hoje?"}
      </h2>

      <p className="mb-4 text-sm capitalize text-zinc-500">
        {format(new Date(), "EEEE',' dd 'de' MMMM", {
          locale: ptBR,
        })}
      </p>
    </div>
  );
}