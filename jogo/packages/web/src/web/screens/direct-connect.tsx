import { useEffect, useRef, useState } from "react";
import "./online.css";

type Signal = { type: "offer" | "answer"; sdp: string | null };

function waitForIce(pc: RTCPeerConnection) {
  if (pc.iceGatheringState === "complete") return Promise.resolve();
  return new Promise<void>((resolve) => {
    const done = () => { if (pc.iceGatheringState === "complete") { pc.removeEventListener("icegatheringstatechange", done); resolve(); } };
    pc.addEventListener("icegatheringstatechange", done);
    window.setTimeout(() => { pc.removeEventListener("icegatheringstatechange", done); resolve(); }, 8000);
  });
}

const encode = (v: Signal) => JSON.stringify(v);
const decode = (v: string): Signal => {
  const parsed = JSON.parse(v) as Signal;
  if (!parsed || (parsed.type !== "offer" && parsed.type !== "answer") || typeof parsed.sdp !== "string") throw new Error("Sinal inválido.");
  return parsed;
};

export function DirectConnect({ onBack }: { onBack: () => void }) {
  const pc = useRef<RTCPeerConnection | null>(null);
  const channel = useRef<RTCDataChannel | null>(null);
  const [role, setRole] = useState<"host" | "guest" | null>(null);
  const [signal, setSignal] = useState("");
  const [incoming, setIncoming] = useState("");
  const [status, setStatus] = useState("Escolha um aparelho anfitrião e outro convidado.");
  const [connected, setConnected] = useState(false);
  const [message, setMessage] = useState("");
  const [log, setLog] = useState<string[]>([]);
  const close = () => { channel.current?.close(); pc.current?.close(); pc.current = null; channel.current = null; setConnected(false); };
  useEffect(() => close, []);
  const bindChannel = (dc: RTCDataChannel) => { channel.current = dc; dc.onopen = () => { setConnected(true); setStatus("CONEXÃO DIRETA ESTABELECIDA"); setLog((l) => [...l, "Canal de dados aberto."]); }; dc.onclose = () => { setConnected(false); setStatus("CONEXÃO ENCERRADA"); }; dc.onerror = () => setStatus("Erro no canal direto."); dc.onmessage = (e) => setLog((l) => [...l, `RIVAL: ${String(e.data)}`]); };
  const createHost = async () => {
    close(); setRole("host"); setStatus("GERANDO OFERTA…");
    const next = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun.cloudflare.com:3478" }] }); pc.current = next; bindChannel(next.createDataChannel("mecha-battle"));
    next.onconnectionstatechange = () => { if (["failed", "disconnected"].includes(next.connectionState)) setStatus("A conexão caiu. Tente gerar uma oferta novamente."); };
    await next.setLocalDescription(await next.createOffer()); await waitForIce(next); setSignal(encode({ type: "offer", sdp: next.localDescription?.sdp ?? null })); setStatus("Envie esta oferta ao aparelho convidado.");
  };
  const acceptOffer = async () => {
    try { close(); setRole("guest"); setStatus("CRIANDO RESPOSTA…"); const next = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun.cloudflare.com:3478" }] }); pc.current = next; next.ondatachannel = (e) => bindChannel(e.channel); await next.setRemoteDescription(decode(incoming)); await next.setLocalDescription(await next.createAnswer()); await waitForIce(next); setSignal(encode({ type: "answer", sdp: next.localDescription?.sdp ?? null })); setStatus("Envie esta resposta de volta ao anfitrião."); } catch (e) { setStatus(e instanceof Error ? e.message : "Não foi possível aceitar a oferta."); }
  };
  const applyAnswer = async () => { try { if (!pc.current || role !== "host") throw new Error("Crie uma oferta primeiro."); await pc.current.setRemoteDescription(decode(incoming)); setStatus("NEGOCIANDO CONEXÃO DIRETA…"); } catch (e) { setStatus(e instanceof Error ? e.message : "Resposta inválida."); } };
  const send = () => { if (!message.trim() || channel.current?.readyState !== "open") return; channel.current.send(message.trim()); setLog((l) => [...l, `VOCÊ: ${message.trim()}`]); setMessage(""); };
  return <div className="mo-screen mo-auth"><header className="mo-top"><button className="mo-ghost" onClick={() => { close(); onBack(); }}>‹ VOLTAR</button><span>CONEXÃO DIRETA</span></header><div className="mo-auth-card"><p className="mo-kicker">WEBRTC · SEM API KEY · P2P</p><h1>CONECTAR APARELHOS</h1><p className="mo-lead">A conexão usa WebRTC direto. Um aparelho cria a oferta, o outro responde, e depois os dados da partida passam entre vocês sem servidor.</p><div className="mo-direct-actions"><button className="mo-primary" onClick={() => void createHost()}>CRIAR OFERTA</button><button className="mo-secondary" onClick={() => { close(); setRole("guest"); setStatus("Cole a oferta do anfitrião abaixo."); }}>SOU CONVIDADO</button></div><label className="mo-direct-label">SINAL GERADO / RECEBIDO<textarea value={signal} onChange={(e) => setSignal(e.target.value)} placeholder="A oferta ou resposta aparecerá aqui." rows={5} readOnly /></label><button className="mo-secondary" disabled={!signal} onClick={() => void navigator.clipboard?.writeText(signal)}>COPIAR SINAL</button><label className="mo-direct-label">COLAR SINAL DO OUTRO APARELHO<textarea value={incoming} onChange={(e) => setIncoming(e.target.value)} placeholder="Cole aqui o JSON recebido." rows={5} /></label>{role === "guest" ? <button className="mo-primary" disabled={!incoming} onClick={() => void acceptOffer()}>GERAR RESPOSTA</button> : <button className="mo-primary" disabled={!incoming} onClick={() => void applyAnswer()}>APLICAR RESPOSTA</button>}<p className="mo-note">{status}</p>{connected && <><div className="mo-direct-chat"><input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Teste uma mensagem" onKeyDown={(e) => { if (e.key === "Enter") send(); }} /><button className="mo-secondary" onClick={send}>ENVIAR</button></div><div className="mo-direct-log">{log.map((line, i) => <small key={`${line}-${i}`}>{line}</small>)}</div></>}</div></div>;
}
