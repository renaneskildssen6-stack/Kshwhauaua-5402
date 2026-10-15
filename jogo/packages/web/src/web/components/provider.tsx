import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { completeManagedRedirect } from "@/lib/auth";

const queryClient = new QueryClient();

interface ProviderProps {
  children: React.ReactNode;
}

// App-level providers — add theme/context providers here, wrapping children.
// QueryClientProvider must stay (all API calls run through TanStack Query).
export function Provider({ children }: ProviderProps) {
  // Volta do login Google gerenciado pode cair em qualquer tela: conclui uma vez no boot (promessa compartilhada).
  useEffect(() => { void completeManagedRedirect(); }, []);
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
