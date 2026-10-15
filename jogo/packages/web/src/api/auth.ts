import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { runableManagedAuth } from "@runablehq/managed-auth/server";
import { db } from "./database";

export const auth = betterAuth({
  basePath: "/api/auth",
  baseURL: process.env.WEBSITE_URL,
  database: drizzleAdapter(db, { provider: "sqlite" }),
  emailAndPassword: { enabled: true, minPasswordLength: 10 },
  secret: process.env.BETTER_AUTH_SECRET,
  // Sessão por bearer (preview em iframe, publicação e domínio próprio): confia na origem da própria requisição.
  trustedOrigins: (request) => {
    const origin = request?.headers.get("origin");
    return origin ? [origin] : ["*"];
  },
  rateLimit: { enabled: true, window: 60, max: 60 },
  plugins: [...runableManagedAuth({
    applicationId: process.env.APPLICATION_ID!,
    issuer: process.env.VITE_RUNABLE_AUTH_ISSUER!,
  })],
});