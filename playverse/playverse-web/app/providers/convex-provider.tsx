// playverse-web/app/providers/convex-provider.tsx
"use client";

import { ReactNode } from "react";
import { ConvexProvider } from "convex/react";
import { convex } from "@/lib/convexClient";

export default function ConvexProviderClient({ children }: { children: ReactNode }) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
