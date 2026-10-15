import { randomBytes, randomUUID } from "node:crypto";
import { and, eq, desc, sql } from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { db } from "../database";
import { onlineTickets as tickets, onlineMatches as matches, onlineRecords as records, onlineReceipts as receipts } from "../database/schema";
import { competitiveCombat, ownerSide, perspective, playOnline, validateTeam, TURN_MS } from "./engine";
import type { BattleEvent, Combat, CombatAction, Side } from "../../web/game/combat";
import { compactEvents, eventsFor, type Transition } from "./events";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
type Match = typeof matches.$inferSelect;
type User = { id: string; name: string };
const WAIT_TTL = 45_000;
/** Acrescenta a reprodução do turno, mantendo as 6 últimas para quem perdeu um polling. */
function withEvents(m: Match, events: BattleEvent[]): Match {
  const list: Transition[] = JSON.parse(m.events || "[]");
  list.push({ revision: m.revision, events: compactEvents(events) });
  return { ...m, events: JSON.stringify(list.slice(-6)) };
}
const fail = (message: string): never => { throw new ORPCError("BAD_REQUEST", { message }); };
function friendlyName(user: User) { return user.name.slice(0, 40); }
async function oneMatch(tx: Tx, id: string): Promise<Match> {
  const [m] = await tx.select().from(matches).where(eq(matches.id, id));
  if (!m) throw new ORPCError("NOT_FOUND", { message: "Partida não encontrada." });
  return m;
}
function sideOf(m: Match, userId: string): Side {
  if (m.hostId === userId) return "player";
  if (m.guestId === userId) return "enemy";
  throw new ORPCError("FORBIDDEN", { message: "Você não participa desta partida." });
}
async function finalize(tx: Tx, m: Match, c: Combat, now: number): Promise<Match> {
  if (m.finished || c.phase !== "over") return m;
  const winner = c.result === "win" ? m.hostId : m.guestId;
  for (const [id, name] of [[m.hostId, m.hostName], [m.guestId, m.guestName]]) {
    await tx.insert(records).values({ userId: id, name, wins: id === winner ? 1 : 0, losses: id === winner ? 0 : 1 })
      .onConflictDoUpdate({ target: records.userId, set: { name, wins: sql`${records.wins} + ${id === winner ? 1 : 0}`, losses: sql`${records.losses} + ${id === winner ? 0 : 1}` } });
  }
  return { ...m, finished: now, winnerId: winner };
}
async function save(tx: Tx, m: Match): Promise<void> {
  await tx.update(matches).set({ state: m.state, events: m.events, revision: m.revision, deadline: m.deadline, missedHost: m.missedHost, missedGuest: m.missedGuest, finished: m.finished, winnerId: m.winnerId }).where(eq(matches.id, m.id));
}
async function expireTurn(tx: Tx, m: Match, now: number): Promise<Match> {
  if (m.finished || now < m.deadline) return m;
  const c: Combat = JSON.parse(m.state);
  const side = ownerSide(c);
  if (!side) return m;
  const next = { ...m, revision: m.revision + 1, deadline: now + TURN_MS };
  const missed = side === "player" ? ++next.missedHost : ++next.missedGuest;
  const who = side === "player" ? m.hostName : m.guestName;
  let events: BattleEvent[];
  if (missed >= 3) {
    c.phase = "over"; c.ready = null; c.result = side === "player" ? "lose" : "win";
    const text = `${who}: três turnos sem resposta — derrota por abandono.`;
    c.log.push(text); events = [{ t: "msg", text }, { t: "end", result: c.result }];
  } else {
    const text = `Tempo esgotado: ${who} perdeu o turno (${missed}/3).`;
    c.log.push(text);
    events = [{ t: "msg", text }, ...playOnline(c, side, { kind: "pass" })];
  }
  const finished = await finalize(tx, withEvents({ ...next, state: JSON.stringify(c) }, events), c, now);
  await save(tx, finished); return finished;
}
function view(m: Match, userId: string, now: number) {
  const side = sideOf(m, userId);
  const c: Combat = JSON.parse(m.state);
  return { id: m.id, revision: m.revision, deadline: m.deadline, serverNow: now,
    combat: perspective(c, side), mine: ownerSide(c) === side && !m.finished,
    myName: side === "player" ? m.hostName : m.guestName,
    opponentName: side === "player" ? m.guestName : m.hostName,
    finished: !!m.finished, won: m.finished ? m.winnerId === userId : null,
    missed: side === "player" ? m.missedHost : m.missedGuest,
    transitions: (JSON.parse(m.events || "[]") as Transition[]).map(t => ({ revision: t.revision, events: eventsFor(t.events, side) })) };
}
export type OnlineMatchView = ReturnType<typeof view>;
async function idle(tx: Tx, user: User): Promise<void> {
  const [t] = await tx.select().from(tickets).where(eq(tickets.userId, user.id));
  if (!t) return;
  if (t.matchId && !(await oneMatch(tx, t.matchId)).finished) fail("Você já tem uma partida ativa. Retome-a antes de iniciar outra.");
  await tx.delete(tickets).where(eq(tickets.userId, user.id));
}
async function pair(tx: Tx, a: typeof tickets.$inferSelect, b: typeof tickets.$inferSelect, now: number): Promise<string> {
  const c = competitiveCombat(JSON.parse(a.team), JSON.parse(b.team));
  const id = randomUUID();
  await tx.insert(matches).values({ id, hostId: a.userId, guestId: b.userId, hostName: a.name, guestName: b.name,
    state: JSON.stringify(c), deadline: now + TURN_MS, created: now });
  await tx.update(tickets).set({ matchId: id, code: null }).where(eq(tickets.userId, a.userId));
  await tx.update(tickets).set({ matchId: id, code: null }).where(eq(tickets.userId, b.userId));
  return id;
}
export async function enterQueue(user: User, team: string[], privateRoom: boolean) {
  try { validateTeam(team); } catch (e) { fail((e as Error).message); }
  return db.transaction(async tx => {
    const now = Date.now(); await idle(tx, user);
    const code = privateRoom ? randomBytes(5).toString("hex").toUpperCase() : null;
    const ticket = { userId: user.id, name: friendlyName(user), team: JSON.stringify(team), kind: privateRoom ? "private" : "public", code, matchId: null, heartbeat: now, joined: now };
    await tx.insert(tickets).values(ticket);
    if (!privateRoom) {
      const candidates = await tx.select().from(tickets).where(and(eq(tickets.kind, "public"), sql`${tickets.matchId} IS NULL`, sql`${tickets.userId} != ${user.id}`, sql`${tickets.heartbeat} > ${now - WAIT_TTL}`)).orderBy(tickets.joined).limit(100);
      const foe = candidates.find(t => JSON.parse(t.team).length === team.length);
      if (foe) await pair(tx, foe, ticket, now);
    }
    return { ok: true, code };
  }, { behavior: "immediate" });
}
export async function joinRoom(user: User, team: string[], code: string) {
  try { validateTeam(team); } catch (e) { fail((e as Error).message); }
  return db.transaction(async tx => {
    const now = Date.now();
    const [host] = await tx.select().from(tickets).where(eq(tickets.code, code.toUpperCase()));
    if (!host || host.matchId || host.heartbeat < now - WAIT_TTL) fail("Sala expirada ou código incorreto. O anfitrião precisa estar no lobby.");
    if (host.userId === user.id) fail("Não é possível enfrentar a própria conta.");
    if (JSON.parse(host.team).length !== team.length) fail(`Esta sala exige equipe de ${JSON.parse(host.team).length} robô(s).`);
    await idle(tx, user);
    const ticket = { userId: user.id, name: friendlyName(user), team: JSON.stringify(team), kind: "private", code: null, matchId: null, heartbeat: now, joined: now };
    await tx.insert(tickets).values(ticket); const id = await pair(tx, host, ticket, now);
    return { matchId: id };
  }, { behavior: "immediate" });
}
export async function lobby(user: User) {
  return db.transaction(async tx => {
    const now = Date.now();
    let ticket: typeof tickets.$inferSelect | undefined = (await tx.select().from(tickets).where(eq(tickets.userId, user.id)))[0];
    if (ticket && !ticket.matchId && ticket.heartbeat < now - WAIT_TTL) {
      await tx.delete(tickets).where(eq(tickets.userId, user.id)); ticket = undefined;
    }
    if (ticket) await tx.update(tickets).set({ heartbeat: now }).where(eq(tickets.userId, user.id));
    const active = ticket?.matchId ? await expireTurn(tx, await oneMatch(tx, ticket.matchId), now) : null;
    const leaders = await tx.select({ name: records.name, wins: records.wins, losses: records.losses }).from(records).orderBy(desc(records.wins)).limit(10);
    const [record] = await tx.select().from(records).where(eq(records.userId, user.id));
    return { ticket: ticket ? { kind: ticket.kind, code: ticket.code, matchId: ticket.matchId, team: JSON.parse(ticket.team) as string[], joined: ticket.joined, matchFinished: !!active?.finished } : null,
      record: { wins: record?.wins ?? 0, losses: record?.losses ?? 0 }, leaders, serverNow: now };
  }, { behavior: "immediate" });
}
export async function cancelQueue(user: User) {
  return db.transaction(async tx => { await idle(tx, user); return { ok: true }; }, { behavior: "immediate" });
}
export async function matchState(user: User, id: string): Promise<OnlineMatchView> {
  return db.transaction(async tx => {
    const now = Date.now(); let m = await oneMatch(tx, id); sideOf(m, user.id);
    m = await expireTurn(tx, m, now); return view(m, user.id, now);
  }, { behavior: "immediate" });
}
export async function action(user: User, input: { id: string; revision: number; requestId: string; action: CombatAction }): Promise<OnlineMatchView> {
  return db.transaction(async tx => {
    const now = Date.now(); let m = await oneMatch(tx, input.id); const side = sideOf(m, user.id);
    const receiptId = `${input.id}:${user.id}:${input.requestId}`;
    const [receipt] = await tx.select().from(receipts).where(eq(receipts.id, receiptId));
    if (receipt) return view(m, user.id, now);
    m = await expireTurn(tx, m, now);
    if (m.finished || m.revision !== input.revision) return view(m, user.id, now);
    const c: Combat = JSON.parse(m.state);
    let events: BattleEvent[] = [];
    try { events = playOnline(c, side, input.action); } catch (e) { fail((e as Error).message); }
    m = withEvents({ ...m, state: JSON.stringify(c), revision: m.revision + 1, deadline: now + TURN_MS,
      missedHost: side === "player" ? 0 : m.missedHost, missedGuest: side === "enemy" ? 0 : m.missedGuest }, events);
    m = await finalize(tx, m, c, now); await save(tx, m);
    await tx.insert(receipts).values({ id: receiptId, matchId: m.id, userId: user.id, requestId: input.requestId, revision: m.revision });
    return view(m, user.id, now);
  }, { behavior: "immediate" });
}
export async function surrender(user: User, id: string) {
  return db.transaction(async tx => {
    const now = Date.now(); let m = await oneMatch(tx, id); const side = sideOf(m, user.id);
    if (!m.finished) {
      const c: Combat = JSON.parse(m.state); c.phase = "over"; c.ready = null; c.result = side === "player" ? "lose" : "win";
      const text = `${friendlyName(user)} desistiu da partida.`;
      c.log.push(text);
      m = withEvents({ ...m, state: JSON.stringify(c), revision: m.revision + 1 }, [{ t: "msg", text }, { t: "end", result: c.result }]);
      m = await finalize(tx, m, c, now); await save(tx, m);
    }
    return view(m, user.id, now);
  }, { behavior: "immediate" });
}