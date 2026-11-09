import { lazy, Suspense, useEffect, useState } from "react";
import { GateProvider, useGate } from "@/components/gate";
import { LoadingScreen, StudioSplash } from "@/components/entry-experience";
import { ScreenBoundary } from "@/components/screen-boundary";
import { type Screen } from "@/screens/menu";
import { getState, useGame } from "@/game/save";
import { startTutorial } from "@/game/tutorial";
import { UNLOCK_LEVEL, systemUnlocked } from "@/game/progression";
import "@/screens/pantheon.css";
import "./city-evolution.css";
import "@/screens/tutorial.css";
import "./title-screen.css";

// Game systems are split by screen: the title/download path does not pull the
// battle, roster, city and tournament modules into its first JavaScript chunk.
const PantheonScreen = lazy(() => import("@/screens/pantheon").then(m => ({ default: m.PantheonScreen })));
const StoryScreen = lazy(() => import("@/screens/story").then(m => ({ default: m.StoryScreen })));
const ObservatoryScreen = lazy(() => import("@/screens/city-observatory").then(m => ({ default: m.ObservatoryScreen })));
const AcademyScreen = lazy(() => import("@/screens/city-academy").then(m => ({ default: m.AcademyScreen })));
const ContractsScreen = lazy(() => import("@/screens/city-contracts").then(m => ({ default: m.ContractsScreen })));
const PowerScreen = lazy(() => import("@/screens/city-power").then(m => ({ default: m.PowerScreen })));
const MuseumScreen = lazy(() => import("@/screens/city-museum").then(m => ({ default: m.MuseumScreen })));
const PortalScreen = lazy(() => import("@/screens/city-portal").then(m => ({ default: m.PortalScreen })));
const HubCity = lazy(() => import("@/components/connected-city").then(m => ({ default: m.HubCity })));
const HomeLab = lazy(() => import("@/components/home-lab").then(m => ({ default: m.HomeLab })));
const EngineerScreen = lazy(() => import("@/screens/engineer").then(m => ({ default: m.EngineerScreen })));
const ModesScreen = lazy(() => import("@/screens/modes").then(m => ({ default: m.ModesScreen })));
const CardsScreen = lazy(() => import("@/screens/cards").then(m => ({ default: m.CardsScreen })));
const LabScreen = lazy(() => import("@/screens/lab").then(m => ({ default: m.LabScreen })));
const MasteryScreen = lazy(() => import("@/screens/meta").then(m => ({ default: m.MasteryScreen })));
const ProfileScreen = lazy(() => import("@/screens/meta").then(m => ({ default: m.ProfileScreen })));
const SkinsScreen = lazy(() => import("@/screens/meta").then(m => ({ default: m.SkinsScreen })));
const DroneScreen = lazy(() => import("@/screens/drones").then(m => ({ default: m.DroneScreen })));
const MineScreen = lazy(() => import("@/screens/mine").then(m => ({ default: m.MineScreen })));
const PetsScreen = lazy(() => import("@/screens/pets").then(m => ({ default: m.PetsScreen })));
const RankedScreen = lazy(() => import("@/screens/ranked").then(m => ({ default: m.RankedScreen })));
const RosterScreen = lazy(() => import("@/screens/roster").then(m => ({ default: m.RosterScreen })));
const ShopScreen = lazy(() => import("@/screens/shop").then(m => ({ default: m.ShopScreen })));
const TournamentsScreen = lazy(() => import("@/screens/tournaments").then(m => ({ default: m.TournamentsScreen })));
const TutorialScreen = lazy(() => import("@/screens/tutorial").then(m => ({ default: m.TutorialScreen })));
const OnlineScreen = lazy(() => import("@/screens/online").then(m => ({ default: m.OnlineScreen })));

function ScreenLoading() {
  return <div className="mc-screen-loading" aria-live="polite"><span aria-hidden="true" />CARREGANDO SISTEMA…</div>;
}

/** Casca do jogo: viewport mobile fixo + hub da cidade + modais de tela. */
export function GameShell() {
  const [ready, setReady] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [studioDone, setStudioDone] = useState(false);

  // O save vive no localStorage: só montamos as telas depois da hidratação.
  useEffect(() => setReady(true), []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--mk-bg)",
        display: "grid",
        placeItems: "center",
      }}
    >
      <div
        className="mc-game-viewport"
        style={{
          position: "relative",
          width: "min(100vw, 480px)",
          height: "100dvh",
          maxHeight: "100dvh",
          overflow: "hidden",
          background: "var(--mk-bg2)",
          boxShadow: "0 0 0 2px rgba(53,226,240,0.35)",
        }}
      >
        <GateProvider>
          {ready && loaded && <GameContent />}
          {ready && !studioDone && <StudioSplash onDone={() => setStudioDone(true)} />}
          {ready && studioDone && !loaded && <LoadingScreen onDone={() => setLoaded(true)} />}
        </GateProvider>
      </div>
    </div>
  );
}

function GameContent() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [entry, setEntry] = useState<"title" | "tutorial" | "home" | "city" | "online">("title");
  const [practice, setPractice] = useState(false);
  const g = useGame();
  const { transition } = useGate();
  const close = () => transition(() => setScreen("menu"));
  const enter = (id: Screen) => { if (systemUnlocked(getState(), id)) setScreen(id); };
  const immersive = ["observatory", "academy", "contracts", "power", "museum", "portal", "modes", "ranked", "tournaments", "online", "pantheon", "story"].includes(screen);

  const beginTutorial = () => {
    const replay = g.tutorial.completed;
    setPractice(replay);
    if (!replay) startTutorial();
    setEntry("tutorial");
  };
  const play = () => g.tutorial.completed && g.robots.length ? setEntry("home") : beginTutorial();
  const saveNote = g.robots.length
    ? `${g.robots.length} robôs · Piloto nível ${g.playerLevel} · progresso preservado`
    : "Sua jornada começa sem ouro, itens ou robôs. Aurorion espera por você no tutorial.";
  const playDetail = g.tutorial.completed && g.robots.length
    ? "ENTRAR NA BASE"
    : g.tutorial.started
      ? `RETOMAR MISSÃO ${g.tutorial.chapter + 1}`
      : "INICIAR CAMPANHA";
  const tutorialDetail = g.tutorial.completed
    ? "REJOGAR O TUTORIAL"
    : g.tutorial.started
      ? `RETOMAR MISSÃO ${g.tutorial.chapter + 1}`
      : "APRENDER A PILOTAR";

  if (entry === "title") return (
    <main className="mc-entry mc-title-screen" aria-labelledby="mc-title-heading">
      <h1 id="mc-title-heading" className="mc-title-sr-only">MECHA CHAMPIONS</h1>
      <header className="mc-title-header" aria-label="Identidade do jogo">
        <div className="mc-title-brand">
          <span className="mc-title-brand-mark" aria-hidden="true">MC</span>
          <span className="mc-title-brand-copy"><strong>REMULU GAMES</strong><small>MECHA CHAMPIONS</small></span>
        </div>
        <span className="mc-title-state"><i aria-hidden="true" />ARQUIVO LOCAL</span>
      </header>
      <div className="mc-title-signal" aria-hidden="true"><span>PRIMEIRA LUZ</span><i /><span>SETOR 01 // AURORA</span></div>
      <section className="mc-title-console" aria-label="Central de comando do piloto">
        <div className="mc-title-summary">
          <img src="/overhaul/pilot.webp" alt="" width="43" height="43" fetchPriority="high" />
          <div className="mc-title-mission"><small>UNIDADE DE COMANDO · 01</small><p>Seu sinal.<br /><strong>Seu esquadrão.</strong></p></div>
          <div className="mc-title-level"><small>PILOTO</small><strong>NV {g.playerLevel}</strong></div>
        </div>
        <div className="mc-title-progress" aria-live="polite"><i aria-hidden="true" /><span>{saveNote}</span></div>
        <div className="mc-title-actions">
          <button type="button" className="mc-title-action mc-title-primary" onClick={play} aria-label={`Jogar. ${playDetail}`}>
            <span className="mc-title-index" aria-hidden="true">01</span>
            <span className="mc-title-action-copy"><strong>JOGAR</strong><small>{playDetail}</small></span>
            <span className="mc-title-action-arrow" aria-hidden="true">↗</span>
          </button>
          <button type="button" className="mc-title-action mc-title-secondary" onClick={() => setEntry("online")} aria-label="Abrir arena online PvP">
            <span className="mc-title-index" aria-hidden="true">02</span>
            <span className="mc-title-action-copy"><strong>ARENA ONLINE</strong><small>Duelo PvP</small></span>
          </button>
          <button type="button" className="mc-title-action mc-title-secondary" onClick={beginTutorial} aria-label={`Abrir tutorial. ${tutorialDetail}`}>
            <span className="mc-title-index" aria-hidden="true">03</span>
            <span className="mc-title-action-copy"><strong>TUTORIAL</strong><small>{tutorialDetail}</small></span>
          </button>
        </div>
        <nav className="mc-title-links" aria-label="Conteúdo adicional">
          <span>EXTRAS</span>
          <a href="/assets">SPRITES & ASSETS <b aria-hidden="true">↗</b></a>
          <a href="/galeria">GALERIA <b aria-hidden="true">↗</b></a>
        </nav>
      </section>
    </main>
  );
  if (entry === "online") return (
    <Suspense fallback={<ScreenLoading />}>
      <ScreenBoundary exitLabel="VOLTAR AO TÍTULO" onExit={() => setEntry("title")}>
        <OnlineScreen backLabel="TÍTULO" onBack={() => setEntry("title")} />
      </ScreenBoundary>
    </Suspense>
  );
  if (entry === "tutorial") return (
    <Suspense fallback={<ScreenLoading />}>
      <ScreenBoundary exitLabel="VOLTAR AO TÍTULO" onExit={() => setEntry("title")}>
        <TutorialScreen practice={practice} onExit={() => setEntry(getState().tutorial.completed ? "home" : "title")} />
      </ScreenBoundary>
    </Suspense>
  );

  return (
    <Suspense fallback={<ScreenLoading />}>
      <>
        <ScreenBoundary exitLabel="VOLTAR AO TÍTULO" onExit={() => setEntry("title")}>
          {entry === "home"
            ? <HomeLab onEnter={enter} onExit={() => transition(() => setEntry("city"))} enabled={screen === "menu"} />
            : <HubCity onEnter={enter} enabled={screen === "menu"} />}
        </ScreenBoundary>
        {entry === "city" && screen === "menu" && <button className="mc-city-home-return" onClick={() => transition(() => setEntry("home"))} aria-label="Voltar para casa-laboratório">⌂ CASA · FORJA</button>}

        {screen !== "menu" && systemUnlocked(g, screen) && (
          <div
            style={{
              position: immersive ? "fixed" : "absolute",
              inset: 0,
              background: immersive ? "#02060c" : "rgba(2,6,12,0.82)",
              zIndex: 20,
              display: "grid",
              placeItems: "center",
              padding: 8,
            }}
          >
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
                overflow: "hidden",
                background: "var(--mk-bg2)",
                border: "2px solid rgba(53,226,240,0.55)",
                boxShadow: "0 0 24px rgba(53,226,240,0.25)",
              }}
            >
              <ScreenBoundary key={screen} onExit={close}>
                {screen === "roster" && <RosterScreen onBack={close} />}
                {screen === "shop" && <ShopScreen onBack={close} />}
                {screen === "modes" && <ModesScreen onBack={close} />}
                {screen === "ranked" && <RankedScreen onBack={close} />}
                {screen === "tournaments" && <TournamentsScreen onBack={close} />}
                {screen === "engineer" && <EngineerScreen onBack={close} />}
                {screen === "pets" && <PetsScreen onBack={close} />}
                {screen === "cards" && <CardsScreen onBack={close} />}
                {screen === "drones" && <DroneScreen onBack={close} />}
                {screen === "mine" && <MineScreen onBack={close} />}
                {screen === "lab" && <LabScreen onBack={close} />}
                {screen === "profile" && <ProfileScreen onBack={close} />}
                {screen === "mastery" && <MasteryScreen onBack={close} />}
                {screen === "skins" && <SkinsScreen onBack={close} />}
                {screen === "observatory" && <ObservatoryScreen onBack={close} />}
                {screen === "academy" && <AcademyScreen onBack={close} />}
                {screen === "contracts" && <ContractsScreen onBack={close} />}
                {screen === "power" && <PowerScreen onBack={close} />}
                {screen === "museum" && <MuseumScreen onBack={close} />}
                {screen === "portal" && <PortalScreen onBack={close} />}
                {screen === "online" && <OnlineScreen backLabel="CIDADE" onBack={close} />}
                {screen === "pantheon" && <PantheonScreen onBack={close} />}
                {screen === "story" && <StoryScreen onBack={close} />}
              </ScreenBoundary>
            </div>
          </div>
        )}
        {screen === "menu" && entry === "city" && <button className="mc-pantheon-trigger" data-testid="pantheon-button" disabled={!systemUnlocked(g, "pantheon")} onClick={() => enter("pantheon")} aria-label="Abrir Panteão"><span className="pt-sheet" style={{ width: 30, height: 30, backgroundImage: "url(/mythic/emblem.webp)" }} />{systemUnlocked(g, "pantheon") ? "PANTEÃO" : `PANTEÃO · NV ${UNLOCK_LEVEL.pantheon}`}</button>}
      </>
    </Suspense>
  );
}
