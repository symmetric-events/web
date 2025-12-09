"use client";

import type { PropsWithChildren } from "react";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CurrencyProvider } from "./context/CurrencyContext";

export default function Providers({ children }: PropsWithChildren) {
  // Create QueryClient on the client to avoid passing class instances from server to client
  const [client] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={client}>
      <CurrencyProvider>{children}</CurrencyProvider>
    </QueryClientProvider>
  );
}


