import { useEffect, useMemo, useRef, useState } from "react";
import { ORPCError } from "@orpc/client";
import { authClient, captureBearer, completeManagedRedirect, refreshSession } from "@/lib/auth";
import { CATALOG_IDS, ROBOT_MAP, faceUrl } from "@/game/robots";
import { ELEMENTS, elementDef } from "@/game/elements";
import { combatView, type CombatAction } from "@/game/combat";
import type { RobotSave } from "@/game/engine";
import { BattleScreen, type RemoteBattle } from "@/screens/battle";
import { useCancelQueue, useJoinRoom, useOnlineAction, useOnlineLobby, useOnlineMatch, useQueueOnline, useSurrender } from "@/queries/online";
import "./online.css";

const errText = (e: unknown) => (e as { message?: string } | null)?.message ?? "Falha de conexão com o servidor.";

/** Entrada do modo online: conta → lobby (fila/sala) → batalha autoritativa. */
export function OnlineScreen({ onBack, backLabel = "CIDADE" }: { onBack: () => void; backLabel?: string }) {
  const [redirected, setRedirected] = useState(false);
  useEffect(() => { void completeManagedRedirect().finally(() => setRedirected(true)); }, []);
  const { data: session, isPending } = authClient.useSession();
  if (!redirected || isPending) return <div className="mo-screen mo-center"><p className="mo-kicker">CONECTANDO AO SERVIDOR…</p></div>;
  if (!session) return <AuthPanel onBack={onBack} />;
  return <Lobby onBack={onBack} backLabel={backLabel} name={session.user.name} />;
}

function AuthPanel({ onBack }: { onBack: () => void }) {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const google = async () => {
    setError(null); setBusy(true);
    try {
      const r = await authClient.managedAuth.signIn({ provider: "google" });
      if (r.error && r.error.code !== "POPUP_CLOSED") setError(r.error.message ?? "Login Google indisponível.");
      else if (!r.error) refreshSession();
    } catch (e) { setError(errText(e)); }
    finally { setBusy(false); }
  };
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setBusy(true);
    try {
      const opts = { onSuccess: captureBearer };
      const r = mode === "up"
        ? await authClient.signUp.email({ name: name.trim(), email: email.trim(), password }, opts)
        : await authClient.signIn.email({ email: email.trim(), password }, opts);
      if (r.error) setError(r.error.message ?? "Não foi possível entrar.");
      else refreshSession();
    } catch (err) { setError(errText(err)); }
    finally { setBusy(false); }
  };
  return <div className="mo-screen mo-auth">
    <header className="mo-top"><button className="mo-ghost" onClick={onBack}>‹ VOLTAR</button><span>ARENA ONLINE</span></header>
    <div className="mo-auth-card">
      <p className="mo-kicker">PvP EM TEMPO REAL · SERVIDOR AUTORITATIVO</p>
      <h1>CONECTE SEU PILOTO</h1>
      <p className="mo-lead">Uma conta guarda vitórias, derrotas e a partida em andamento. O progresso offline continua no seu aparelho.</p>
      <button className="mo-google" onClick={google} disabled={busy}><span>G</span>CONTINUAR COM GOOGLE</button>
      <div className="mo-split"><span>OU E-MAIL</span></div>
      <div className="mo-tabs" role="tablist">
        <button role="tab" aria-selected={mode === "in"} onClick={() => setMode("in")}>ENTRAR</button>
        <button role="tab" aria-selected={mode === "up"} onClick={() => setMode("up")}>CRIAR CONTA</button>
      </div>
      <form onSubmit={submit} className="mo-form">
        {mode === "up" && <label>NOME DE PILOTO<input value={name} onChange={e => setName(e.target.value)} required minLength={2} maxLength={24} autoComplete="nickname" /></label>}
        <label>E-MAIL<input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" /></label>
        <label>SENHA<input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={10} autoComplete={mode === "up" ? "new-password" : "current-password"} /></label>
        {mode === "up" && <small>Mínimo de 10 caracteres.</small>}
        {error && <p className="mo-error" role="alert">{error}</p>}
        <button className="mo-primary" disabled={busy}>{busy ? "AGUARDE…" : mode === "up" ? "CRIAR E ENTRAR" : "ENTRAR"}</button>
      </form>
    </div>
  </div>;
}

function Lobby({ onBack, backLabel, name }: { onBack: () => void; backLabel: string; name: string }) {
  const [team, setTeam] = useState<string[]>([]);
  const [tab, setTab] = useState<"public" | "private">("public");
  const [code, setCode] = useState("");
  const [query, setQuery] = useState("");
  const [element, setElement] = useState<string>("");
  const [watching, setWatching] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [lobbyWaiting, setLobbyWaiting] = useState(false);
  const lobby = useOnlineLobby(true, lobbyWaiting);
  const queue = useQueueOnline(), join = useJoinRoom(), cancel = useCancelQueue();
  const ticket = lobby.data?.ticket ?? null;
  const waiting = !!ticket && !ticket.matchId;
  useEffect(() => setLobbyWaiting(waiting), [waiting]);
  const activeMatch = ticket?.matchId && !ticket.matchFinished ? ticket.matchId : null;
  useEffect(() => { if (activeMatch) setWatching(activeMatch); }, [activeMatch]);
  const error = queue.error ?? join.error ?? cancel.error ?? lobby.error;
  /** Uma ação nova limpa erros antigos das outras, para a faixa mostrar só o que vale agora. */
  const fresh = () => { queue.reset(); join.reset(); cancel.reset(); };

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CATALOG_IDS.map(id => ROBOT_MAP[id]).filter(r => r && (!element || elementDef(r.element)?.id === element) && (!q || r.name.toLowerCase().includes(q)));
  }, [query, element]);
  const toggle = (id: string) => setTeam(t => t.includes(id) ? t.filter(x => x !== id) : t.length >= 4 ? t : [...t, id]);

  if (watching) return <OnlineBattle id={watching} onExit={() => { setWatching(null); void lobby.refetch(); }} />;

  return <div className="mo-screen">
    <header className="mo-top">
      <button className="mo-ghost" onClick={onBack}>‹ {backLabel}</button>
      <span>ARENA ONLINE</span>
      <button className="mo-ghost" onClick={() => void authClient.signOut()}>SAIR</button>
    </header>
    <section className="mo-pilot">
      <div><small>PILOTO</small><strong>{name}</strong></div>
      <div className="mo-record"><b>{lobby.data?.record.wins ?? 0}</b><small>V</small><b className="mo-loss">{lobby.data?.record.losses ?? 0}</b><small>D</small></div>
    </section>
    <p className="mo-rules">Nível 10 fixo · sem treino, equipamentos, pets, cards ou itens · turno de 60 s · 3 turnos perdidos = derrota</p>

    {ticket?.matchId && ticket.matchFinished && <p className="mo-note">Última partida encerrada. Monte a equipe para jogar de novo.</p>}

    {waiting ? <section className="mo-wait">
      {ticket.kind === "private" && ticket.code ? <>
        <p className="mo-kicker">SALA PRIVADA · AGUARDANDO RIVAL</p>
        <button className="mo-code" onClick={() => { void navigator.clipboard?.writeText(ticket.code!).then(() => setCopied(true), () => setCopied(false)); }} aria-label={`Código ${ticket.code}, copiar`}>{ticket.code}</button>
        <small>{copied ? "CÓDIGO COPIADO" : "Toque para copiar e envie ao oponente. Mantenha esta tela aberta."}</small>
      </> : <>
        <p className="mo-kicker">FILA PÚBLICA</p>
        <div className="mo-scan" aria-hidden><i /><i /><i /><i /><i /></div>
        <strong>PROCURANDO OPONENTE · {ticket.team.length}v{ticket.team.length}</strong>
        <small>{Math.max(0, Math.floor(((lobby.data?.serverNow ?? Date.now()) - ticket.joined) / 1000))} s na fila</small>
      </>}
      <div className="mo-wait-team">{ticket.team.map(id => <img key={id} src={faceUrl(id)} alt={ROBOT_MAP[id]?.name ?? id} />)}</div>
      <button className="mo-secondary" disabled={cancel.isPending} onClick={() => { fresh(); cancel.mutate({}); }}>CANCELAR</button>
    </section> : <>
      <div className="mo-tabs" role="tablist">
        <button role="tab" aria-selected={tab === "public"} onClick={() => setTab("public")}>FILA PÚBLICA</button>
        <button role="tab" aria-selected={tab === "private"} onClick={() => setTab("private")}>SALA PRIVADA</button>
      </div>
      <section className="mo-team" aria-label="Equipe online">
        {[0, 1, 2, 3].map(i => { const id = team[i]; return <button key={i} className="mo-slot" disabled={!id} onClick={() => id && toggle(id)} aria-label={id ? `Remover ${ROBOT_MAP[id]?.name}` : `Vaga ${i + 1} livre`}>
          {id ? <><img src={faceUrl(id)} alt="" /><span>{ROBOT_MAP[id]?.name}</span></> : <span className="mo-empty">{String(i + 1).padStart(2, "0")}</span>}
        </button>; })}
      </section>
      <div className="mo-actions">
        {tab === "public"
          ? <button className="mo-primary" disabled={!team.length || queue.isPending} onClick={() => { fresh(); queue.mutate({ team, privateRoom: false }); }}>BUSCAR PARTIDA {team.length ? `${team.length}v${team.length}` : ""}</button>
          : <>
            <button className="mo-primary" disabled={!team.length || queue.isPending} onClick={() => { fresh(); setCopied(false); queue.mutate({ team, privateRoom: true }); }}>CRIAR SALA</button>
            <form className="mo-join" onSubmit={e => { e.preventDefault(); fresh(); join.mutate({ team, code: code.trim() }, { onSuccess: r => setWatching(r.matchId) }); }}>
              <input value={code} onChange={e => setCode(e.target.value.replace(/[^0-9a-f]/gi, "").slice(0, 10).toUpperCase())} placeholder="CÓDIGO" aria-label="Código da sala" />
              <button className="mo-secondary" disabled={!team.length || code.length !== 10 || join.isPending}>ENTRAR</button>
            </form>
          </>}
      </div>
    </>}
    {error && <p className="mo-error" role="alert">{errText(error)}</p>}

    {!waiting && <section className="mo-roster" aria-label="Catálogo competitivo">
      <div className="mo-filter">
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar entre 256 robôs" aria-label="Buscar robô" />
        <select value={element} onChange={e => setElement(e.target.value)} aria-label="Filtrar por elemento">
          <option value="">TODOS</option>
          {ELEMENTS.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
        </select>
      </div>
      <div className="mo-grid">{list.map(r => { const el = elementDef(r.element); const on = team.includes(r.id); return <button key={r.id} className="mo-pick" aria-pressed={on} disabled={!on && team.length >= 4} onClick={() => toggle(r.id)} style={{ ["--el" as string]: el?.color ?? "#35e2f0" }}>
        <img src={faceUrl(r.id)} alt="" loading="lazy" /><span>{r.name}</span><small>{el?.abbr ?? r.element}</small>
      </button>; })}</div>
      {!list.length && <p className="mo-note">Nenhum robô encontrado.</p>}
    </section>}

    {!!lobby.data?.leaders.length && <section className="mo-leaders"><h3>TOP PILOTOS</h3><ol>{lobby.data.leaders.map((l, i) => <li key={i}><span>{l.name}</span><b>{l.wins}V</b><small>{l.losses}D</small></li>)}</ol></section>}
  </div>;
}

function useClock(deadline: number, serverNow: number) {
  const offset = useRef(0);
  useEffect(() => { offset.current = serverNow - Date.now(); }, [serverNow]);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const t = window.setInterval(() => setNow(Date.now()), 250); return () => window.clearInterval(t); }, []);
  return Math.max(0, Math.ceil((deadline - (now + offset.current)) / 1000));
}

function OnlineBattle({ id, onExit }: { id: string; onExit: () => void }) {
  const [mine, setMine] = useState(false);
  const match = useOnlineMatch(id, mine);
  const action = useOnlineAction(), surrender = useSurrender();
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const view = match.data;
  useEffect(() => setMine(!!view?.mine), [view?.mine]);
  const seconds = useClock(view?.deadline ?? 0, view?.serverNow ?? Date.now());
  const refetch = match.refetch;
  useEffect(() => { if (view && !view.finished && seconds === 0) { const t = window.setTimeout(() => void refetch(), 900); return () => window.clearTimeout(t); } }, [seconds, view, refetch]);

  const battle = useMemo(() => view ? combatView(view.combat) : null, [view]);
  const teamsRef = useRef<{ id: string; player: RobotSave[]; enemy: RobotSave[] } | null>(null);
  if (view && teamsRef.current?.id !== view.id) {
    const save = (robotId: string): RobotSave => ({ id: robotId, level: 10, xp: 0, trained: { str: 0, def: 0, agl: 0 }, borrowed: true, gadgetLevel: 0 });
    teamsRef.current = { id: view.id, player: view.combat.player.fighters.map(f => save(f.robotId)), enemy: view.combat.enemy.fighters.map(f => save(f.robotId)) };
  }
  const teams = teamsRef.current;

  const send = async (a: CombatAction) => {
    if (!view || a.kind === "item" || a.kind === "auto") return;
    const command = a.kind === "cover" ? (a.withUid ? { kind: "cover" as const, withUid: a.withUid } : null) : a;
    if (!command) return;
    setError(null);
    const input = { id, revision: view.revision, requestId: crypto.randomUUID(), action: command };
    try { await action.mutateAsync(input); }
    catch (e) {
      // Só falha de rede repete (mesmo requestId = idempotente); recusa do servidor apenas ressincroniza.
      if (e instanceof ORPCError) { setError(errText(e)); void refetch(); return; }
      try { await action.mutateAsync(input); } catch (again) { setError(errText(again)); void refetch(); }
    }
  };

  if (match.isError && !view) return <div className="mo-screen mo-center"><p className="mo-error">{errText(match.error)}</p><button className="mo-secondary" onClick={onExit}>VOLTAR AO LOBBY</button></div>;
  if (!view || !battle || !teams) return <div className="mo-screen mo-center"><p className="mo-kicker">SINCRONIZANDO PARTIDA…</p></div>;

  const header = <div className="mo-turnbar" data-mine={view.mine} data-low={view.mine && seconds <= 15}>
    <span className="mo-turn">{view.finished ? "PARTIDA ENCERRADA" : view.mine ? "SUA VEZ" : "VEZ DO OPONENTE"}</span>
    {!view.finished && <b className="mo-clock" aria-label={`${seconds} segundos`}>{String(seconds).padStart(2, "0")}s</b>}
    <span className="mo-rival">vs {view.opponentName}{view.missed ? ` · perdas ${view.missed}/3` : ""}</span>
    {!view.finished && (confirm
      ? <span className="mo-confirm"><button onClick={() => { setConfirm(false); surrender.mutate({ id }); }}>CONFIRMAR</button><button onClick={() => setConfirm(false)}>NÃO</button></span>
      : <button className="mo-surrender" onClick={() => setConfirm(true)}>DESISTIR</button>)}
    {(error || surrender.error || match.isError) && <p className="mo-error" role="alert">{error ?? (surrender.error ? errText(surrender.error) : "Conexão instável — tentando de novo…")}</p>}
  </div>;
  const remote: RemoteBattle = {
    battle, revision: view.revision, transitions: view.transitions, mine: view.mine,
    sending: action.isPending, send: a => void send(a), header,
    waiting: <div className="mo-waiting"><span className="mo-scan mo-scan-sm" aria-hidden><i /><i /><i /></span>AGUARDANDO {view.opponentName.toUpperCase()}…</div>,
  };
  return <div className="mo-battle">
    <BattleScreen key={id} remote={remote} arena={view.combat.arena} playerTeam={teams.player} enemyTeam={teams.enemy}
      items={{}} label={`ONLINE · ${view.myName} vs ${view.opponentName}`} recordProgress={false}
      onUseItem={() => {}} onFinish={onExit} />
  </div>;
}
