import { PantheonScreen } from "@/screens/pantheon";
import "@/screens/pantheon.css";
import { ObservatoryScreen } from "@/screens/city-observatory";
import { AcademyScreen } from "@/screens/city-academy";
import { ContractsScreen } from "@/screens/city-contracts";
import { PowerScreen } from "@/screens/city-power";
import { MuseumScreen } from "@/screens/city-museum";
import { PortalScreen } from "@/screens/city-portal";
import { useEffect, useState } from "react";
import { GateProvider, useGate } from "@/components/gate";
import { HubCity } from "@/components/hub-city";
import { LoadingScreen, StudioSplash } from "@/components/entry-experience";
import { SystemGuide } from "@/components/system-guide";
import { type Screen } from "@/screens/menu";
import { EngineerScreen } from "@/screens/engineer";
import { ModesScreen } from "@/screens/modes";
import { CardsScreen } from "@/screens/cards";
import { LabScreen } from "@/screens/lab";
import { MasteryScreen, ProfileScreen, SkinsScreen } from "@/screens/meta";
import { MineScreen } from "@/screens/mine";
import { PetsScreen } from "@/screens/pets";
import { RankedScreen } from "@/screens/ranked";
import { RosterScreen } from "@/screens/roster";
import { ShopScreen } from "@/screens/shop";
import { TournamentsScreen } from "@/screens/tournaments";
import { TutorialScreen } from "@/screens/tutorial";
import { OnlineScreen } from "@/screens/online";
import { ScreenBoundary } from "@/components/screen-boundary";
import { getState, useGame } from "@/game/save";
import { startTutorial } from "@/game/tutorial";
import { UNLOCK_LEVEL, systemUnlocked } from "@/game/progression";
import "@/screens/tutorial.css";

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
  const [entry, setEntry] = useState<"title"|"tutorial"|"city"|"online">("title");
  const [practice,setPractice] = useState(false);
  const [guideOpen,setGuideOpen] = useState(false);
  const g=useGame();
  const { transition } = useGate();
  const close = () => transition(() => setScreen("menu"));
  const enter = (id:Screen) => { if(systemUnlocked(getState(),id))setScreen(id); };
  const immersive = ["observatory", "academy", "contracts", "power", "museum", "portal", "modes", "ranked", "tournaments", "online", "pantheon"].includes(screen);

  const beginTutorial=()=>{
    const replay=g.tutorial.completed;
    setPractice(replay);
    if(!replay)startTutorial();
    setEntry("tutorial");
  };
  if(entry==="title")return <div className="mc-entry" aria-label="MECHA CHAMPIONS">
    <div className="mc-entry-brand">MECHA CHAMPIONS · PRIMEIRA LUZ</div>
    <div className="mc-entry-sub">Seu sinal. Seu esquadrão.</div>
    <button onClick={()=>g.tutorial.completed&&g.robots.length?setEntry("city"):beginTutorial()}>JOGAR</button>
    <button onClick={()=>setEntry("online")}>ONLINE · PvP</button>
    <button onClick={beginTutorial}>{g.tutorial.completed?"TUTORIAL · REJOGAR":g.tutorial.started?`RETOMAR MISSÃO ${g.tutorial.chapter+1}`:"TUTORIAL"}</button>
    <p className="mc-entry-note">{g.robots.length?`${g.robots.length} robôs · Piloto nível ${g.playerLevel} · progresso preservado`:"Sua jornada começa sem ouro, itens ou robôs.\nAurorion espera por você no tutorial."}</p>
  </div>;
  if(entry==="online")return <ScreenBoundary exitLabel="VOLTAR AO TÍTULO" onExit={()=>setEntry("title")}><OnlineScreen backLabel="TÍTULO" onBack={()=>setEntry("title")}/></ScreenBoundary>;
  if(entry==="tutorial")return <ScreenBoundary exitLabel="VOLTAR AO TÍTULO" onExit={()=>setEntry("title")}><TutorialScreen practice={practice} onExit={()=>setEntry(getState().tutorial.completed?"city":"title")}/></ScreenBoundary>;

  return (
    <>
      <ScreenBoundary exitLabel="VOLTAR AO TÍTULO" onExit={()=>setEntry("title")}><HubCity onEnter={enter} enabled={screen==="menu"&&!guideOpen} /></ScreenBoundary>

      {screen !== "menu" && systemUnlocked(g,screen) && (
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
            </ScreenBoundary>
          </div>
        </div>
      )}
      {screen==="menu"&&<button className="mc-pantheon-trigger" data-testid="pantheon-button" disabled={!systemUnlocked(g,"pantheon")} onClick={()=>enter("pantheon")} aria-label="Abrir Panteão"><span className="pt-sheet" style={{width:30,height:30,backgroundImage:"url(/mythic/emblem.webp)"}}/>{systemUnlocked(g,"pantheon")?"PANTEÃO":`PANTEÃO · NV ${UNLOCK_LEVEL.pantheon}`}</button>}
      {screen==="menu"&&<button className="mc-guide-trigger" onClick={()=>setGuideOpen(true)} aria-label="Abrir briefing e rota de desbloqueios"><img src="/overhaul/pilot.webp" alt=""/>BRIEFING</button>}
      <SystemGuide screen={screen} open={guideOpen} onClose={()=>setGuideOpen(false)} onEnter={enter}/>
    </>
  );
}
