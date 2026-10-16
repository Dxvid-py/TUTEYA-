import logo from "@/assets/tuteya-logo.png.asset.json";
import { Logo, ThemeToggle } from "@/components/brand";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-secondary p-12 lg:flex">
        <div className="pointer-events-none absolute inset-0 bg-hero-glow" />
        <div className="relative rounded-3xl bg-logo-surface p-10 shadow-soft">
          <img src={logo.url} alt="Tuteya — Tu tutor, a un clic" className="mx-auto w-64" />
        </div>
        <blockquote className="relative text-2xl font-bold leading-snug text-secondary-foreground">
          “Aprender nos conecta.”
          <span className="mt-3 block text-sm font-medium opacity-80">
            Tutorías virtuales y presenciales con personas que saben explicar.
          </span>
        </blockquote>
      </div>
      <div className="flex flex-col">
        <div className="flex items-center justify-between p-6">
          <Logo />
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center px-6 pb-16">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function GoogleButton({ label = "Continuar con Google" }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={async () => {
        const r = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin + "/login" } });
        if (r.error) toast.error("No se pudo iniciar sesión con Google");
      }}
      className="flex h-11 w-full items-center justify-center gap-3 rounded-xl border bg-card text-sm font-semibold transition-colors hover:bg-muted"
    >
      <svg className="size-4" viewBox="0 0 24 24" aria-hidden>
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.07H2.18a11 11 0 0 0 0 9.86l3.66-2.84z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A10.6 10.6 0 0 0 12 1 11 11 0 0 0 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
      </svg>
      {label}
    </button>
  );
}
