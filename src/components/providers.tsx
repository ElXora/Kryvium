"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useThemeStore } from "@/lib/store/theme-store";
import { LoadingScreen } from "@/components/ui/loading-screen";

/**
 * Mounted once at the root layout. Handles theme hydration and shows the
 * branded loading screen only on true first load (hard refresh) — NOT on
 * every client-side route change, since this component lives above the
 * router outlet and never remounts between pages.
 */
export function Providers({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const hydrate = useThemeStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
    const t = setTimeout(() => setReady(true), 280);
    return () => clearTimeout(t);
  }, [hydrate]);

  if (!ready) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
