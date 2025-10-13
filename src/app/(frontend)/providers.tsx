"use client";

import type { PropsWithChildren } from "react";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export default function Providers({ children }: PropsWithChildren) {
  // Create QueryClient on the client to avoid passing class instances from server to client
  const [client] = useState(() => new QueryClient());
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}


