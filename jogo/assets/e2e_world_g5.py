"""G5 pós-merge: entrada nova, hub, Coliseu (mundo G5), acesso direto a torneios, atlas, diário,
movimento por teclado e joystick, sem erros de console/HTTP."""
import json
from playwright.sync_api import sync_playwright

URL = "http://localhost:4200/"
errors, bad_http = [], []


def log(*a):
    print("[g5]", *a, flush=True)


with sync_playwright() as p:
    browser = p.chromium.launch(channel="chrome", args=["--no-sandbox"])
    ctx = browser.new_context(viewport={"width": 390, "height": 800}, has_touch=True)
    page = ctx.new_page()
    page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.on("response", lambda r: bad_http.append(f"{r.status} {r.url}") if r.status >= 400 else None)

    # Save legado com 4 robôs e nível 20 (pula tutorial obrigatório do save novo).
    page.goto(URL, wait_until="domcontentloaded")
    ids = page.evaluate("async()=>{const m=await import('/src/web/game/robots.ts');return m.CATALOG_IDS.slice(0,4)}")
    save = {"robots": [{"id": i, "level": 20, "xp": 0, "trained": {"str": 0, "def": 0, "agl": 0}} for i in ids],
            "team": ids, "playerLevel": 20, "playerXP": 0, "gold": 5000,
            "tutorial": {"started": True, "completed": True, "chapter": 5, "legacyAccess": True}}
    page.evaluate("s=>{localStorage.clear();localStorage.setItem('campeoes-mecha-save-v1',JSON.stringify(s))}", save)
    page.reload(wait_until="domcontentloaded")

    page.wait_for_timeout(1200)
    page.get_by_text("PULAR ABERTURA").click()
    page.get_by_role("button", name="JOGAR", exact=True).wait_for(timeout=90000)
    page.get_by_role("button", name="JOGAR", exact=True).click()
    page.get_by_text("COLISEU", exact=True).first.wait_for(timeout=20000)
    page.wait_for_timeout(800)
    page.screenshot(path="/tmp/shots/g5_00_hub.png")
    log("hub ok")

    page.get_by_text("COLISEU", exact=True).first.click()
    page.get_by_test_id("world-map").wait_for(timeout=20000)
    page.wait_for_timeout(2500)
    page.screenshot(path="/tmp/shots/g5_01_world.png")
    log("world ok")

    # Acesso direto aos torneios por nível
    page.keyboard.press("t")
    page.get_by_test_id("tournament-access").wait_for()
    rows = page.get_by_test_id("access-row").count()
    assert rows > 0, "nenhum torneio liberado no nível 20"
    page.screenshot(path="/tmp/shots/g5_02_access.png")
    pos0 = page.evaluate("JSON.parse(localStorage.getItem('mc_world_g5')||'null')")
    page.get_by_test_id("access-enter").first.click()
    page.get_by_text("LUTAR!", exact=True).wait_for(timeout=15000)
    page.screenshot(path="/tmp/shots/g5_03_brief.png")
    log("access -> briefing ok, rows", rows)
    page.get_by_role("button", name="VOLTAR", exact=True).click()
    page.get_by_test_id("world-map").wait_for()
    page.wait_for_timeout(1200)

    # Movimento por teclado
    pos = lambda: page.evaluate("JSON.parse(localStorage.getItem('mc_world_g5')||'null')")
    x0 = pos()["x"]
    page.keyboard.down("ArrowRight"); page.wait_for_timeout(900); page.keyboard.up("ArrowRight")
    page.wait_for_timeout(4500)
    x1 = pos()["x"]
    log("keyboard x", x0, "->", x1)
    assert x1 > x0 + 40, (x0, x1)

    # Joystick por toque (proporcional)
    js = page.get_by_test_id("world-map").get_by_test_id("joystick")
    if js.count():
        b = js.bounding_box()
        cx, cy = b["x"] + b["width"] / 2, b["y"] + b["height"] / 2
        cdp = ctx.new_cdp_session(page)
        cdp.send("Input.dispatchTouchEvent", {"type": "touchStart", "touchPoints": [{"x": cx, "y": cy, "id": 1}]})
        cdp.send("Input.dispatchTouchEvent", {"type": "touchMove", "touchPoints": [{"x": cx - b["width"] / 2, "y": cy, "id": 1}]})
        page.wait_for_timeout(200)
        val = js.get_attribute("aria-valuenow")
        page.wait_for_timeout(900)
        cdp.send("Input.dispatchTouchEvent", {"type": "touchEnd", "touchPoints": []})
        page.wait_for_timeout(300)
        rel = js.get_attribute("aria-valuenow")
        log("joystick value", val, "release", rel)
        assert int(val) < -50 and int(rel) == 0, (val, rel)
    page.screenshot(path="/tmp/shots/g5_04_moved.png")

    # Atlas
    page.get_by_test_id("open-map").click()
    page.get_by_test_id("minimap").wait_for()
    page.screenshot(path="/tmp/shots/g5_05_atlas.png")
    if page.get_by_test_id("atlas-travel").count():
        page.get_by_test_id("atlas-travel").first.click()
    else:
        page.get_by_test_id("close-map").click()
    page.wait_for_timeout(1500)
    log("atlas ok")

    # Diário
    page.get_by_test_id("open-journal").click()
    page.get_by_test_id("world-journal").wait_for()
    page.screenshot(path="/tmp/shots/g5_06_journal.png")
    page.get_by_test_id("close-journal").click()
    log("journal ok")

    # Batalha real a partir do acesso direto
    page.keyboard.press("t")
    page.get_by_test_id("tournament-access").wait_for()
    page.get_by_test_id("access-enter").first.click()
    page.get_by_text("LUTAR!", exact=True).wait_for(timeout=15000)
    page.wait_for_timeout(1500)
    page.get_by_text("LUTAR!", exact=True).click()
    hits = 0
    for _ in range(40):
        page.wait_for_timeout(1000)
        btn = page.locator("button.mc-skill-action:not([disabled])")
        if btn.count():
            btn.first.click()
            hits += 1
            if hits >= 3:
                break
    page.wait_for_timeout(2500)
    page.screenshot(path="/tmp/shots/g5_08_battle.png")
    log("battle actions", hits)
    assert hits >= 1, "nenhum comando de batalha disponível"

    page.wait_for_timeout(1000)
    page.screenshot(path="/tmp/shots/g5_07_end.png")
    browser.close()

errors = [e for e in errors if "ExperimentalWarning" not in e]
log("console errors:", json.dumps(errors[:10], ensure_ascii=False))
log("bad http:", json.dumps(bad_http[:10]))
assert not errors and not bad_http
log("PASS")
