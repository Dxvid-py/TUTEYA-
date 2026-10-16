import { Link } from "@tanstack/react-router";
import { Monitor, Moon, Sun, Star } from "lucide-react";
import mark from "@/assets/tuteya-mark.png.asset.json";
import { useTheme, type ThemePref } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { STATUS_LABEL } from "@/lib/format";

export function Logo({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <Link to="/" className={cn("flex items-center gap-2.5", className)} aria-label="Tuteya, inicio">
      <img src={mark.url} alt="" className="h-8 w-auto" />
      {!compact && <span className="text-xl font-extrabold tracking-tight text-navy">Tuteya</span>}
    </Link>
  );
}

export function ThemeToggle() {
  const { pref, set } = useTheme();
  const opts: { v: ThemePref; icon: typeof Sun; label: string }[] = [
    { v: "light", icon: Sun, label: "Modo claro" },
    { v: "dark", icon: Moon, label: "Modo oscuro" },
    { v: "system", icon: Monitor, label: "Según el sistema" },
  ];
  return (
    <div role="radiogroup" aria-label="Tema" className="flex items-center rounded-full border bg-card p-0.5">
      {opts.map(({ v, icon: Icon, label }) => (
        <button
          key={v}
          role="radio"
          aria-checked={pref === v}
          aria-label={label}
          title={label}
          onClick={() => set(v)}
          className={cn(
            "grid size-7 place-items-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            pref === v && "bg-secondary text-secondary-foreground",
          )}
        >
          <Icon className="size-3.5" />
        </button>
      ))}
    </div>
  );
}

export function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value.toFixed(1)} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          style={{ width: size, height: size }}
          className={i <= Math.round(value) ? "fill-warning text-warning" : "text-border"}
        />
      ))}
    </span>
  );
}

const statusStyle: Record<string, string> = {
  pendiente: "bg-warning/15 text-foreground border-warning/40",
  confirmada: "bg-primary/12 text-primary border-primary/30",
  rechazada: "bg-destructive/10 text-destructive border-destructive/30",
  cancelada: "bg-muted text-muted-foreground border-border",
  completada: "bg-indigo/10 text-indigo border-indigo/30",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        statusStyle[status],
      )}
    >
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  text,
  action,
}: {
  icon: typeof Star;
  title: string;
  text: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed bg-card/50 px-6 py-12 text-center">
      <div className="mb-4 grid size-12 place-items-center rounded-2xl bg-secondary text-secondary-foreground">
        <Icon className="size-5" />
      </div>
      <h3 className="font-bold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
