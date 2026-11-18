import React, { useEffect, useMemo, useState } from "react";

interface TutorAvatarProps {
  name: string;
  src?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  online?: boolean;
  className?: string;
}

const VERIFIED_PORTRAITS = [
  "https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=400",
  "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400",
  "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400",
  "https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=400",
  "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400",
  "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400",
];

const BRAND_GRADIENTS: [string, string][] = [
  ["#047857", "#059669"],
  ["#065f46", "#d97706"],
  ["#0d9488", "#047857"],
  ["#b45309", "#059669"],
];

function hashName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function buildFallbackSvg(name: string): string {
  const clean = (name || "Tutor Tuteya").trim();
  const parts = clean.split(/\s+/);
  const initials =
    parts.length >= 2
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : clean.slice(0, 2).toUpperCase();

  const [c1, c2] = BRAND_GRADIENTS[hashName(clean) % BRAND_GRADIENTS.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${c1}"/>
        <stop offset="100%" stop-color="${c2}"/>
      </linearGradient>
    </defs>
    <rect width="200" height="200" rx="100" fill="url(#g)"/>
    <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle"
      font-family="Manrope, system-ui, sans-serif" font-size="72" font-weight="700" fill="#ffffff">
      ${initials}
    </text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const SIZE_CLASSES: Record<NonNullable<TutorAvatarProps["size"]>, string> = {
  sm: "h-10 w-10",
  md: "h-14 w-14",
  lg: "h-20 w-20",
  xl: "h-24 w-24",
};

export function TutorAvatar({
  name,
  src,
  size = "md",
  online = false,
  className = "",
}: TutorAvatarProps) {
  const fallbackDataUri = useMemo(() => buildFallbackSvg(name), [name]);

  const initialUrl = useMemo(() => {
    const trimmed = src?.trim();
    if (!trimmed || trimmed.includes("unsplash.com/photos/")) {
      return VERIFIED_PORTRAITS[hashName(name || "tutor") % VERIFIED_PORTRAITS.length];
    }
    return trimmed;
  }, [src, name]);

  const [imgSrc, setImgSrc] = useState<string>(initialUrl);

  useEffect(() => {
    setImgSrc(initialUrl);
  }, [initialUrl]);

  return (
    <div className={`relative inline-flex shrink-0 ${SIZE_CLASSES[size]} ${className}`}>
      <img
        src={imgSrc}
        alt={`Foto de ${name}`}
        loading="lazy"
        onError={() => {
          if (imgSrc !== fallbackDataUri) {
            setImgSrc(fallbackDataUri);
          }
        }}
        className="h-full w-full rounded-full object-cover ring-2 ring-emerald-600/20 shadow-sm transition-transform duration-300 group-hover:scale-105"
      />
      {online && (
        <span
          title="Disponible ahora"
          className="absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-background"
        />
      )}
    </div>
  );
}

export default TutorAvatar;
