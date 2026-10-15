import { useEffect, useRef, useState } from "react";
import { ALL_ASSETS } from "@/game/assets";
import { preloadParts } from "@/game/compose";

/* ---------------------------------------------------------------------------
 * Tela de carregamento: skyline futurista em pixel art rodando a 4fps
 * enquanto TODAS as imagens do jogo são baixadas de verdade. O progresso
 * mostrado é o número real de arquivos já decodificados.
 * ------------------------------------------------------------------------- */

const FRAMES = [
  "/loading/city_f1.png",
  "/loading/city_f2.png",
  "/loading/city_f3.png",
  "/loading/city_f4.png",
];

const TIPS = [
  "Segure PULO para saltar mais alto.",
  "Toque em PULO no ar para o pulo duplo.",
  "Colete núcleos de energia espalhados pela cidade.",
  "Corra para alcançar as plataformas mais altas.",
  "Aperte ENTRAR na porta de um prédio para acessá-lo.",
];

function loadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = src;
  });
}

export function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [loaded, setLoaded] = useState(0);
  const [label, setLabel] = useState("iniciando…");
  const [frame, setFrame] = useState(0);
  const [tip] = useState(() => TIPS[Math.floor(Math.random() * TIPS.length)]);
  const [done, setDone] = useState(false);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  const total = ALL_ASSETS.length + FRAMES.length;

  // Animação 4fps do fundo
  useEffect(() => {
    const id = window.setInterval(() => setFrame((f) => (f + 1) % FRAMES.length), 250);
    return () => window.clearInterval(id);
  }, []);

  // Carregamento real, com concorrência limitada
  useEffect(() => {
    let alive = true;
    const queue = [...FRAMES, ...ALL_ASSETS];
    let cursor = 0;
    let finished = 0;

    const worker = async () => {
      while (alive) {
        const i = cursor++;
        if (i >= queue.length) return;
        const src = queue[i];
        await loadImage(src);
        if (!alive) return;
        finished++;
        setLoaded(finished);
        setLabel(src.replace(/^\//, ""));
      }
    };

    Promise.all([...Array.from({ length: 8 }, worker), preloadParts()]).then(() => {
      if (!alive) return;
      setLabel("pronto");
      setDone(true);
      window.setTimeout(() => doneRef.current(), 700);
    });

    return () => {
      alive = false;
    };
  }, []);

  const pct = Math.min(100, Math.round((loaded / total) * 100));

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 80,
        overflow: "hidden",
        background: "#040814",
        opacity: done ? 0 : 1,
        transition: "opacity 600ms ease",
      }}
    >
      {FRAMES.map((f, i) => (
        <img
          key={f}
          src={f}
          alt=""
          width={1024}
          height={576}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            imageRendering: "pixelated",
            opacity: frame === i ? 1 : 0,
          }}
        />
      ))}

      {/* Vinheta + scanlines */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(120% 80% at 50% 40%, rgba(0,0,0,0) 40%, rgba(2,5,12,0.9) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(to bottom, rgba(0,0,0,0.28) 0 1px, transparent 1px 3px)",
          mixBlendMode: "multiply",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          padding: "18px 18px 34px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <div
          className="mk-title"
          style={{
            fontSize: 14,
            color: "var(--mk-accent)",
            textShadow: "0 0 12px rgba(53,226,240,0.7)",
            letterSpacing: 1,
          }}
        >
          CAMPEÕES MECHA
        </div>

        {/* Barra pixelada */}
        <div
          style={{
            height: 18,
            border: "2px solid rgba(53,226,240,0.75)",
            background: "rgba(3,9,18,0.85)",
            padding: 2,
            boxShadow: "0 0 14px rgba(53,226,240,0.25)",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              background:
                "repeating-linear-gradient(90deg, #35e2f0 0 6px, #1ba7c4 6px 10px)",
              transition: "width 120ms linear",
            }}
          />
        </div>

        <div
          className="mk-title"
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 8,
            fontSize: 7,
            color: "#9fd8e6",
          }}
        >
          <span
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "62%",
            }}
          >
            {label}
          </span>
          <span>
            {loaded}/{total} • {pct}%
          </span>
        </div>

        <div className="mk-title" style={{ fontSize: 7, color: "#6f93a8", lineHeight: 1.8 }}>
          DICA: {tip}
        </div>
      </div>
    </div>
  );
}
