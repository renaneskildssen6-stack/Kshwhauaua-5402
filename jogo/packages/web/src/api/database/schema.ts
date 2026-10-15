import { integer, text, sqliteTable } from "drizzle-orm/sqlite-core";
export * from "./auth-schema";

export const onlineTickets = sqliteTable("mecha_online_tickets", {
  userId: text("user_id").primaryKey(),
  name: text("name").notNull(),
  team: text("team").notNull(),
  kind: text("kind").notNull(),
  code: text("code").unique(),
  matchId: text("match_id"),
  heartbeat: integer("heartbeat").notNull(),
  joined: integer("joined").notNull(),
});
export const onlineMatches = sqliteTable("mecha_online_matches", {
  id: text("id").primaryKey(),
  hostId: text("host_id").notNull(),
  guestId: text("guest_id").notNull(),
  hostName: text("host_name").notNull(),
  guestName: text("guest_name").notNull(),
  state: text("state").notNull(),
  /** Últimas transições compactas (reprodução das animações no cliente). */
  events: text("events").notNull().default("[]"),
  revision: integer("revision").notNull().default(0),
  deadline: integer("deadline").notNull(),
  missedHost: integer("missed_host").notNull().default(0),
  missedGuest: integer("missed_guest").notNull().default(0),
  winnerId: text("winner_id"),
  finished: integer("finished"),
  created: integer("created").notNull(),
});
export const onlineReceipts = sqliteTable("mecha_online_receipts", {
  id: text("id").primaryKey(),
  matchId: text("match_id").notNull(),
  userId: text("user_id").notNull(),
  requestId: text("request_id").notNull(),
  revision: integer("revision").notNull(),
});
export const onlineRecords = sqliteTable("mecha_online_records", {
  userId: text("user_id").primaryKey(),
  name: text("name").notNull(),
  wins: integer("wins").notNull().default(0),
  losses: integer("losses").notNull().default(0),
});

/**
 * Define your database schema here, then apply it with `bun run db:push`
 * (from packages/web). Re-export any generated schema from this file
 * (e.g. Better Auth's auth-schema.ts) so drizzle generates complete migrations.
 * Table patterns and conventions: skills/app/references/api.md
 */
