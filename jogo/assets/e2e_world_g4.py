"""G4: mundo, assets, movimento, pausa, minimapa, portas e retorno."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
errors, bad_http = [], []
with sync_playwright() as p:
    browser = p.chromium.launch(channel="chrome", args=["--no-sandbox"])
    page = browser.new_page(viewport={"width": 390, "height": 800})
    page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.on("response", lambda r: bad_http.append(f"{r.status} {r.url}") if r.status >= 400 else None)
    page.goto("http://localhost:4200/", wait_until="domcontentloaded")
    page.wait_for_timeout(1800)
    stats = page.evaluate("""async () => {
      const m = await import('/src/web/game/world.ts'); const w = m.getWorld();
      return { width:m.WW, height:m.WH, sites:w.sites.length, props:w.props.length,
        mobs:w.spawns.length, items:w.items.length, lanterns:w.lanterns.length,
        badDoors:w.sites.filter(s=>w.tiles[m.idx(s.tx,s.ty)]!==1||w.tiles[m.idx(s.tx,s.ty-1)]!==0).map(s=>s.t.id),
        kinds:[...new Set(w.sites.map(s=>s.kind))], biomes:m.BIOMES.length };
    }""")
    assert stats["sites"] == 205 and stats["biomes"] == 12 and not stats["badDoors"], stats
    assert stats["width"] * stats["height"] * 32**2 >= 100 * 3600 * 5200
    assets = ["/" + str(f.relative_to(ROOT / "packages/web/public")) for f in (ROOT / "packages/web/public/world").rglob("*") if f.is_file()]
    dims = page.evaluate("""async list => Promise.all(list.map(async src => {
      const r=await fetch(src); if(!r.ok) return [src,false];
      const b=await createImageBitmap(await r.blob()); return [src,b.width>0&&b.height>0];
    }))""", assets)
    assert all(ok for _, ok in dims), dims
    for _ in range(6):
        page.mouse.click(195, 400)
        page.wait_for_timeout(900)
        if "HANGAR" in page.inner_text("body"):
            break
    page.get_by_text("COLISEU", exact=True).click()
    page.get_by_test_id("world-map").wait_for()
    page.wait_for_timeout(3500)
    page.get_by_test_id("enter-site").wait_for()
    page.screenshot(path="/tmp/shots/g4_00_surface.png")
    page.get_by_test_id("enter-site").click()
    page.get_by_text("LUTAR!", exact=True).wait_for()
    page.screenshot(path="/tmp/shots/g4_01_brief.png")
    page.get_by_role("button", name="VOLTAR", exact=True).click()
    page.get_by_test_id("world-map").wait_for()
    page.wait_for_timeout(1000)
    pos = lambda: page.evaluate("JSON.parse(localStorage.getItem('mc_world_g4'))")
    x0 = pos()["x"]
    page.keyboard.down("ArrowLeft")
    page.wait_for_timeout(700)
    page.keyboard.up("ArrowLeft")
    page.wait_for_timeout(4500)
    x1 = pos()["x"]
    assert x1 < x0 - 50, (x0, x1)
    page.keyboard.down("Space")
    page.wait_for_timeout(160)
    page.screenshot(path="/tmp/shots/g4_02_jump.png")
    page.keyboard.up("Space")
    page.keyboard.press("f")
    page.get_by_test_id("open-map").click()
    page.get_by_test_id("minimap").wait_for()
    page.screenshot(path="/tmp/shots/g4_03_map.png")
    page.wait_for_timeout(4300)
    paused = pos()
    page.wait_for_timeout(4300)
    assert abs(pos()["x"] - paused["x"]) < 1 and abs(pos()["y"] - paused["y"]) < 1
    page.get_by_test_id("close-map").click()
    page.get_by_test_id("world-map").wait_for()
    page.get_by_text("◀ CIDADE", exact=True).click()
    page.get_by_text("COLISEU", exact=True).wait_for()
    broken = page.evaluate("() => [...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src)")
    assert not broken and not errors and not bad_http, {"broken":broken,"errors":errors,"http":bad_http}
    print(json.dumps({"world":stats,"assets":len(assets),"movement":[x0,x1],"errors":errors,"bad_http":bad_http}, ensure_ascii=False))
    browser.close()