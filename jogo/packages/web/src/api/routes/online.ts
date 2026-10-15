import { z } from "zod";
import { authed } from "../middleware/auth";
import * as service from "../online/service";

const team = z.array(z.string().max(50)).min(1).max(4);
const id = z.string().uuid();
const action = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("skill"), skillId: z.string().max(100), targetUid: z.string().max(20).optional() }).strict(),
  z.object({ kind: z.literal("ultimate"), targetUid: z.string().max(20).optional() }).strict(),
  z.object({ kind: z.literal("analyze"), targetUid: z.string().max(20).optional() }).strict(),
  z.object({ kind: z.literal("guard") }).strict(),
  z.object({ kind: z.literal("dodge") }).strict(),
  z.object({ kind: z.literal("pass") }).strict(),
  z.object({ kind: z.literal("reposition"), withUid: z.string().max(20) }).strict(),
  z.object({ kind: z.literal("cover"), withUid: z.string().max(20) }).strict(),
]);
export const online = {
  lobby: authed.handler(({ context }) => service.lobby(context.user)),
  queue: authed.input(z.object({ team, privateRoom: z.boolean() }).strict()).handler(({ context, input }) => service.enterQueue(context.user, input.team, input.privateRoom)),
  join: authed.input(z.object({ team, code: z.string().regex(/^[A-Fa-f0-9]{10}$/) }).strict()).handler(({ context, input }) => service.joinRoom(context.user, input.team, input.code)),
  cancel: authed.handler(({ context }) => service.cancelQueue(context.user)),
  state: authed.input(z.object({ id }).strict()).handler(({ context, input }) => service.matchState(context.user, input.id)),
  action: authed.input(z.object({ id, revision: z.number().int().nonnegative(), requestId: z.string().uuid(), action }).strict()).handler(({ context, input }) => service.action(context.user, input)),
  surrender: authed.input(z.object({ id }).strict()).handler(({ context, input }) => service.surrender(context.user, input.id)),
};