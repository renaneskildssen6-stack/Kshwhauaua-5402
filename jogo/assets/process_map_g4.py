#!/usr/bin/env python3
"""Fase G4 — processa toda a arte gerada por IA do Mundo dos Torneios.

Entrada: /home/user/tmpwork/g4/*.png (folhas 4x4 em fundo magenta + fundos 16:9)
Saida:   packages/web/public/world/

  tiles_X.png  -> world/tiles/X.png   atlas 16x1 de tiles 32px (opaco)
  props_X.png  -> world/props/X.png   atlas 16x1 de props 64px (alfa, assentado no chao)
  mobs_all.png -> world/mobs.png      atlas 16x1 de 64px (alfa)
  items_all.png-> world/items.png     atlas 16x1 de 48px (alfa)
  build_?.png  -> world/build_?.png   atlas 16x1 de 192px (alfa, assentado no chao)
  bg_X_far.png -> world/bg/X_far.jpg  1280x720
  bg_X_mid.png -> world/bg/X_mid.png  1280x720 com alfa em rampa no topo (paralaxe)

Chroma-key estrito (fase G3): r>180 & b>180 & g<95 & |r-b|<70.
Para sprites (props/mobs/itens/predios) tambem removemos a sombra magenta
escura que o modelo pinta embaixo dos objetos: r>110 & b>110 & g<70 & |r-b|<45.
"""

from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
from PIL import Image

SRC = Path("/home/user/tmpwork/g4")
OUT = Path("/home/user/mecha-champions/packages/web/public/world")


def key_strict(a: np.ndarray) -> np.ndarray:
    r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
    return (r > 180) & (b > 180) & (g < 95) & (np.abs(r - b) < 70)


def key_sprite(a: np.ndarray) -> np.ndarray:
    r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
    soft = (r > 110) & (b > 110) & (g < 70) & (np.abs(r - b) < 45)
    white_gutter = (r > 235) & (g > 225) & (b > 235)
    return key_strict(a) | soft | white_gutter


def bands(mask: np.ndarray, axis: int, want: int) -> list[tuple[int, int]]:
    """Faixas de conteudo ao longo de um eixo (0 = linhas, 1 = colunas)."""
    frac = mask.mean(axis=1 - axis) if axis == 0 else mask.mean(axis=0)
    n = len(frac)
    flags = frac < 0.55
    out, start = [], None
    for i, f in enumerate(flags):
        if f and start is None:
            start = i
        elif not f and start is not None:
            out.append((start, i))
            start = None
    if start is not None:
        out.append((start, n))
    out = [c for c in out if c[1] - c[0] > n * 0.12]
    if len(out) != want:
        step = n / want
        return [(round(i * step), round((i + 1) * step)) for i in range(want)]
    return out


def cells(path: Path, sprite: bool) -> list[np.ndarray]:
    a = np.array(Image.open(path).convert("RGBA"))
    m = key_strict(a[..., :3])
    rows = bands(m, 0, 4)
    cols = bands(m, 1, 4)
    out = []
    for y0, y1 in rows:
        for x0, x1 in cols:
            c = a[y0:y1, x0:x1].copy()
            if sprite:
                inset = 4
                c = c[inset:-inset, inset:-inset].copy()
                k = key_sprite(c[..., :3])
                c[k] = (0, 0, 0, 0)
            out.append(c)
    return out


def fit_sprite(c: np.ndarray, size: int) -> Image.Image:
    im = Image.fromarray(c, "RGBA")
    # remove pixels quase transparentes soltos
    bbox = im.getbbox()
    if bbox:
        im = im.crop(bbox)
    w, h = im.size
    s = min(size / w, size / h)
    nw, nh = max(1, round(w * s)), max(1, round(h * s))
    small = im.resize((nw, nh), Image.NEAREST)
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    canvas.paste(small, ((size - nw) // 2, size - nh), small)
    return canvas


def fit_tile(c: np.ndarray, size: int) -> Image.Image:
    im = Image.fromarray(c, "RGBA").convert("RGB")
    # corta 2% de borda para eliminar qualquer resto de gutter
    w, h = im.size
    m = max(1, round(min(w, h) * 0.02))
    im = im.crop((m, m, w - m, h - m))
    return im.resize((size, size), Image.BOX).convert("RGBA")


def atlas(frames: list[Image.Image], size: int) -> Image.Image:
    sheet = Image.new("RGBA", (size * len(frames), size), (0, 0, 0, 0))
    for i, f in enumerate(frames):
        sheet.paste(f, (i * size, 0), f)
    return sheet


def sheet_job(src: Path, dst: Path, size: int, sprite: bool) -> None:
    cs = cells(src, sprite)
    frames = [fit_sprite(c, size) if sprite else fit_tile(c, size) for c in cs]
    dst.parent.mkdir(parents=True, exist_ok=True)
    img = atlas(frames, size)
    if not sprite:
        img = img.convert("RGB")
    img.save(dst, optimize=True)
    empty = sum(1 for f in frames if f.getbbox() is None)
    print(f"  {src.name:22s} -> {dst.relative_to(OUT)}  {img.size[0]}x{img.size[1]}  vazios={empty}")


def bg_job(src: Path, name: str, layer: str) -> None:
    im = Image.open(src).convert("RGB").resize((1280, 720), Image.BOX)
    d = OUT / "bg"
    d.mkdir(parents=True, exist_ok=True)
    if layer == "far":
        im.save(d / f"{name}_far.jpg", quality=86, optimize=True)
        print(f"  {src.name:22s} -> bg/{name}_far.jpg")
        return
    a = np.array(im.convert("RGBA"))
    h = a.shape[0]
    ramp = np.clip((np.arange(h) / h - 0.22) / 0.30, 0, 1)
    a[..., 3] = (ramp[:, None] * 255).astype(np.uint8)
    out = Image.fromarray(a, "RGBA").quantize(colors=200, method=Image.FASTOCTREE)
    out.save(d / f"{name}_mid.png", optimize=True)
    print(f"  {src.name:22s} -> bg/{name}_mid.png")


def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)
    for p in sorted(SRC.glob("tiles_*.png")):
        sheet_job(p, OUT / "tiles" / f"{p.stem[6:]}.png", 32, sprite=False)
    for p in sorted(SRC.glob("props_*.png")):
        sheet_job(p, OUT / "props" / f"{p.stem[6:]}.png", 64, sprite=True)
    if (SRC / "mobs_all.png").exists():
        sheet_job(SRC / "mobs_all.png", OUT / "mobs.png", 64, sprite=True)
    if (SRC / "items_all.png").exists():
        sheet_job(SRC / "items_all.png", OUT / "items.png", 48, sprite=True)
    for p in sorted(SRC.glob("build_*.png")):
        sheet_job(p, OUT / f"{p.stem}.png", 192, sprite=True)
    for p in sorted(SRC.glob("bg_*_*.png")):
        _, name, layer = p.stem.split("_")
        bg_job(p, name, layer)
    return 0


if __name__ == "__main__":
    sys.exit(main())
