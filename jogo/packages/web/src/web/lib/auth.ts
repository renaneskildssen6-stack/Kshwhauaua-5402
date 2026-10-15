import { createAuthClient } from "better-auth/react";
import { managedAuthClient } from "@runablehq/managed-auth/client";

const config = {
  applicationId: import.meta.env.VITE_APPLICATION_ID as string,
  issuer: import.meta.env.VITE_RUNABLE_AUTH_ISSUER as string,
};

export const authClient = createAuthClient({
  baseURL: window.location.origin,
  basePath: "/api/auth",
  plugins: [managedAuthClient(config)],
});

let redirect: Promise<unknown> | null = null;
/** Conclui uma volta de login gerenciado uma única vez por carregamento. */
export function completeManagedRedirect(): Promise<unknown> {
  redirect ??= authClient.managedAuth.handleRedirect().catch(() => null);
  return redirect;
}

/** Mesma chave do armazenamento do plugin gerenciado: um único token para Google e e-mail/senha. */
const TOKEN_KEY = "runable.managed-auth.token";
/** Login por e-mail no iframe de preview não recebe cookie: guarda o bearer devolvido pelo servidor. */
export function captureBearer(ctx: { response: Response }) {
  const token = ctx.response.headers.get("set-auth-token");
  if (token) localStorage.setItem(TOKEN_KEY, token);
}
export function refreshSession() {
  authClient.$store.notify("$sessionSignal");
}
