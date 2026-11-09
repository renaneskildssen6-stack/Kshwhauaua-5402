"""E2E bustos animados: HANGAR mostra o busto (tira webp) no cartão de foco, troca de robô,
silhueta bloqueada, sem 404 nem erro de console."""
import json
from playwright.sync_api import sync_playwright

URL = "http://localhost:4200/"
IDS = ["aurorion", "acidra", "toxinvore", "kagemaru"]
errors, bad_http = [], []
CLICK = """(txt)=>{const b=[...document.querySelectorAll('button')]
 .filter(e=>e.textContent.includes(txt)&&!e.disabled);
 if(!b.length) return false; b[b.length-1].click(); return true;}"""
BUST = """()=>{const i=document.querySelector('img.mk-bust-strip');if(!i)return null;
 const cs=getComputedStyle(i);return {src:i.src.split('/').pop(),nw:i.naturalWidth,nh:i.naturalHeight,
 w:i.getBoundingClientRect().width,h:i.getBoundingClientRect().height,anim:cs.animationName,
 dur:cs.animationDuration,timing:cs.animationTimingFunction,op:cs.opacity}}"""


def log(*a):
    print("[bust]", *a, flush=True)


with sync_playwright() as p:
    browser = p.chromium.launch(channel="chrome", args=["--no-sandbox"])
    ctx = browser.new_context(viewport={"width": 390, "height": 800}, has_touch=True)
    page = ctx.new_page()
    page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.on("response", lambda r: bad_http.append(f"{r.status} {r.url}") if r.status >= 400 else None)

    page.goto(URL, wait_until="domcontentloaded")
    save = {"robots": [{"id": i, "level": 20, "xp": 0, "trained": {"str": 0, "def": 0, "agl": 0}} for i in IDS],
            "team": IDS, "playerLevel": 20, "playerXP": 0, "gold": 5000,
            "tutorial": {"started": True, "completed": True, "chapter": 5, "legacyAccess": True}}
    page.evaluate("s=>{localStorage.clear();localStorage.setItem('campeoes-mecha-save-v1',JSON.stringify(s))}", save)
    page.reload(wait_until="domcontentloaded")
    page.wait_for_timeout(1200)
    page.get_by_text("PULAR ABERTURA").click()
    page.get_by_role("button", name="JOGAR", exact=True).wait_for(timeout=90000)
    page.get_by_role("button", name="JOGAR", exact=True).click()
    page.get_by_text("COLISEU", exact=True).first.wait_for(timeout=20000)
    page.wait_for_timeout(800)
    ok = page.evaluate(CLICK, "HANGAR")
    log("hangar click", ok)
    page.get_by_text("HANGAR MECHA").first.wait_for(timeout=15000)
    page.wait_for_timeout(1500)
    b0 = page.evaluate(BUST)
    log("bust 0", b0)
    assert b0 and b0["nw"] > 0 and b0["anim"] == "mk-bust-play" and b0["dur"] == "1s", b0
    assert abs(b0["h"] - 184) < 1 and abs(b0["w"] - 184 * b0["nw"] / b0["nh"]) < 2, b0
    page.screenshot(path="/tmp/shots/bust_00.png")
    page.wait_for_timeout(420)
    page.screenshot(path="/tmp/shots/bust_01.png")

    seen = {b0["src"]}
    for rid in IDS[1:]:
        name = page.evaluate(f"async()=>{{const m=await import('/src/web/game/robots.ts');return m.ROBOT_MAP['{rid}'].name}}")
        box = page.query_selector("input")
        if box:
            box.fill(name)
            page.wait_for_timeout(700)
        page.evaluate("""(n)=>{const b=[...document.querySelectorAll('button')]
          .filter(e=>(e.textContent||'').includes(n));if(b.length)b[b.length-1].click();}""", name)
        page.wait_for_timeout(1200)
        bi = page.evaluate(BUST)
        log(rid, bi)
        assert bi and bi["src"] == f"{rid}.webp" and bi["nw"] > 0 and bi["op"] == "1", bi
        seen.add(bi["src"])
        page.screenshot(path=f"/tmp/shots/bust_{rid}.png")
    if page.query_selector("input"):
        page.query_selector("input").fill("")
        page.wait_for_timeout(500)

    # robô bloqueado -> silhueta (sem busto)
    page.evaluate(CLICK, "BLOQ")
    page.wait_for_timeout(900)
    page.evaluate("""()=>{const b=[...document.querySelectorAll('button')].filter(e=>e.querySelector('img'));
      const last=b.slice(-3)[0]; if(last) last.click();}""")
    page.wait_for_timeout(900)
    page.screenshot(path="/tmp/shots/bust_locked.png")
    log("locked text", "BLOQUEADO" in page.inner_text("body"), "bust", page.evaluate(BUST))

    # reduced motion
    page.emulate_media(reduced_motion="reduce")
    page.wait_for_timeout(300)
    log("reduced-motion anim", page.evaluate("()=>{const i=document.querySelector('img.mk-bust-strip');return i&&getComputedStyle(i).animationName}"))

    bad = [b for b in bad_http if "/robots/bust/" in b or "404" in b]
    log("seen", sorted(seen))
    log("http bad", bad[:10])
    log("console errors", errors[:10])
    assert not bad, bad
    assert not errors, errors
    print("PASS")
    browser.close()
