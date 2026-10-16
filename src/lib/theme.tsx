import { useEffect, useState } from "react";

export type ThemePref = "light" | "dark" | "system";
const KEY = "tuteya-theme";

export const themeInitScript = `(function(){try{var t=localStorage.getItem('${KEY}')||'system';var d=t==='dark'||(t==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);}catch(e){}})();`;

function apply(pref: ThemePref) {
  const dark =
    pref === "dark" || (pref === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

export function useTheme() {
  const [pref, setPref] = useState<ThemePref>("system");
  useEffect(() => {
    setPref((localStorage.getItem(KEY) as ThemePref) || "system");
  }, []);
  useEffect(() => {
    if (pref !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const fn = () => apply("system");
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, [pref]);
  const set = (p: ThemePref) => {
    localStorage.setItem(KEY, p);
    setPref(p);
    apply(p);
  };
  return { pref, set };
}
