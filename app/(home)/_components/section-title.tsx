interface SectionTitleProps {
  children: React.ReactNode;
  className?: string;
}

export default function SectionTitle({
  children,
  className = "",
}: SectionTitleProps) {
  return (
    <h2
      className={`mb-3 px-5 text-xs font-bold uppercase tracking-wide text-zinc-500 ${className}`}
    >
      {children}
    </h2>
  );
}