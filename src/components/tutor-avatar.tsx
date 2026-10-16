import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

export function TutorAvatar({ name, url, className }: { name: string; url?: string | null; className?: string }) {
  if (url) return <img src={url} alt={name} className={cn("rounded-2xl object-cover", className)} />;
  return (
    <div className={cn("grid place-items-center rounded-2xl bg-secondary font-extrabold text-secondary-foreground", className)} aria-hidden>
      {initials(name)}
    </div>
  );
}
