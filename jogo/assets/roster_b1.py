# -*- coding: utf-8 -*-
"""Lote 1 da Fase D: 30 robos novos com sprite sheet de IA.
Temas escolhidos pelo usuario: insetoides/aracnideos, ninjas/ageis,
colossos/tanques, alienigenas organico-tecnologicos, cavaleiros/samurais.
Tupla: (id, NOME, ELEMENTO, raridade, look, ataque_principal, efeito)
"""
import json

ROSTER = [
    # --- INSETOIDES / ARACNIDEOS -------------------------------------------
    ("vespirion", "VESPIRION", "FERRAO", "silver", "yellow and black wasp mecha with four buzzing translucent wings, a segmented abdomen ending in a huge drill stinger, compound amber optics", "drill stinger dive", "poison"),
    ("scarabyss", "SCARABYSS", "ESCARAVELHO", "bronze", "armored beetle mecha with an iridescent green-blue carapace shell that splits open, two horn pincers on its head, stubby digging claws", "horn pincer flip", "trapped"),
    ("aranthrax", "ARANTHRAX", "TEIA", "gold", "towering black widow spider mecha with eight jointed steel legs, a crimson hourglass core glowing on its abdomen, web launcher fangs", "web fang snare", "trapped"),
    ("mantivore", "MANTIVORE", "LAMINA", "silver", "slender jade green mantis mecha with twin serrated scythe forearms, triangular head with glowing pink eyes, thin folded thorax plates", "scythe cross reap", "weakening"),
    ("formicore", "FORMICORE", "COLONIA", "bronze", "hunched red ant mecha with oversized mandible cutters, a swarm of tiny drone ants orbiting it, thick chitin shoulder plates", "mandible swarm bite", "drain"),
    ("cicadron", "CICADRON", "SONORO", "silver", "bronze cicada mecha with veined resonating wing membranes, a vibrating sound chamber chest, bulbous red eyes, hooked climbing legs", "resonant screech burst", "blind"),
    # --- AGEIS / NINJAS ----------------------------------------------------
    ("kagemaru", "KAGEMARU", "SOMBRA", "gold", "sleek black ninja mecha in a shadow-weave bodysuit with a scarf trailing behind, twin short tantos, glowing red visor slit under a hooded helm", "shadow twin tanto slash", "blind"),
    ("shurikage", "SHURIKAGE", "AGIL", "silver", "compact dark grey shinobi mecha with folding shuriken discs on its forearms, split-toe jet boots, a slim masked faceplate with cyan eye lines", "shuriken fan volley", "adrenalin"),
    ("fumikaze", "FUMIKAZE", "FUMACA", "bronze", "lean smoke-grey ninja mecha wrapped in smoke bomb canisters, vapor pouring from its ankles, cloth wraps over steel joints, one glowing yellow eye", "smoke veil elbow", "blind"),
    ("kunailock", "KUNAI LOCK", "CORRENTE", "silver", "agile indigo ninja mecha with kusarigama chain and kunai, chain coiled around its arm, sandal-like thruster feet, half-mask with sharp teeth pattern", "chain kunai bind", "trapped"),
    ("hayatezero", "HAYATE ZERO", "VENTO", "gold", "ultra-slim white and teal speed mecha with wind-blade ribbons on its back, afterimage trails, aerodynamic beak visor, bladed heels", "afterimage gale cut", "adrenalin"),
    ("nokusaki", "NOKUSAKI", "VENENO", "bronze", "wiry olive-green ninja mecha with poison dart tubes on its wrists, a straw-hat shaped helm, tattered scarf, glowing purple eye slits", "dart flurry strike", "poison"),
    # --- COLOSSOS / TANQUES ------------------------------------------------
    ("bastionox", "BASTIONOX", "MURALHA", "gold", "gigantic slab-armored fortress mecha with a wall-sized tower shield fused to one arm, riveted grey plating, tiny glowing blue eye slit, tread-like feet", "fortress shield ram", "damage_reduction"),
    ("mortarhulk", "MORTAR HULK", "ARTILHARIA", "silver", "squat wide-bodied tank mecha with twin mortar tubes on its shoulders, caterpillar treads instead of legs, olive drab armor, armored cockpit head", "twin mortar barrage", "burn"),
    ("granithor", "GRANITHOR", "GRANITO", "bronze", "hulking mecha built from rough grey granite blocks bound by iron bands, enormous fists, mossy cracks, glowing white rune eyes", "granite double slam", "weakening"),
    ("juggerspine", "JUGGERSPINE", "IMPACTO", "silver", "heavy charcoal juggernaut mecha with a spiked ram plate on its chest, hunched broad shoulders, hydraulic pistons on its back, no visible head", "spiked ram charge", "paralyze"),
    ("tectomaul", "TECTOMAUL", "TECTONICA", "gold", "colossal earth-plate mecha with continental crust armor, glowing magma seams, a wrecking maul the size of its torso, jaw-like faceplate", "tectonic maul quake", "paralyze"),
    ("ferroatlas", "FERRO ATLAS", "FERRO", "bronze", "broad shouldered iron laborer mecha carrying a girder on its back, chain harness across its chest, welded patch plates, single lamp eye", "girder overhead swing", "damage_reduction"),
    # --- ALIENIGENAS / ORGANICO-TECNOLOGICOS -------------------------------
    ("xenovyre", "XENOVYRE", "XENO", "gold", "unsettling alien mecha of black chitin and violet muscle cables, an elongated eyeless head with a jaw of glass needles, a whip tail, ribbed torso", "needle jaw lunge", "drain"),
    ("myconaut", "MYCONAUT", "ESPORO", "bronze", "bulbous fungal-alien mecha with a translucent dome head full of floating spores, mottled purple flesh over ceramic plating, tendril fingers", "spore cloud grasp", "poison"),
    ("nebulith", "NEBULITH", "NEBULOSA", "silver", "floating alien mecha whose torso is a suspended nebula sphere held by three metal rings, long jellyfish tendrils, no legs, star-fleck skin", "gravity tendril pull", "trapped"),
    ("bioquell", "BIOQUELL", "SIMBIOSE", "silver", "symbiotic mecha half machine half pulsing coral flesh, glowing veins pumping teal fluid, asymmetric arms, one organic eye and one optic lens", "coral graft bash", "hp_regen"),
    ("hollowseer", "HOLLOW SEER", "PSIQUICO", "gold", "tall thin alien mecha with a smooth featureless faceplate reflecting stars, four floating hands, a levitating brain core in a glass ribcage", "psionic hand crush", "blind"),
    ("gastropodo", "GASTROPODO", "MUCO", "bronze", "slow alien mecha with a spiral metal shell on its back leaking luminous slime, two eyestalk sensors, a wide gliding base instead of feet", "slime trail bind", "weakening"),
    # --- CAVALEIROS / SAMURAIS MECHA ---------------------------------------
    ("ronin_akatsu", "AKATSU RONIN", "AURORA", "gold", "crimson and gold samurai mecha with layered lamellar plating, a wide horned kabuto helm with a sunrise crest, a long glowing odachi", "dawn odachi draw cut", "burn"),
    ("bushidorne", "BUSHIDORNE", "HONRA", "silver", "dark indigo samurai mecha with a demon-mask menpo faceplate, twin katanas at its hip, sashimono banner on its back, plated skirt", "iai twin katana", "weakening"),
    ("lanceviel", "LANCEVIEL", "LANCA", "silver", "silver-white knight mecha in polished plate armor with a heater shield and a long jousting lance, plumed helm, blue tabard", "jousting lance charge", "paralyze"),
    ("templarion", "TEMPLARION", "JURAMENTO", "gold", "crusader knight mecha in white enamel armor with a red cross emblem, a huge two-handed claymore, chainmail underlayer, slit-visor helm", "oathbound claymore arc", "damage_reduction"),
    ("kuroyari", "KUROYARI", "OBSIDIANA", "bronze", "black-lacquered ashigaru mecha with a long yari spear, conical jingasa helm, simple riveted cuirass, glowing orange eye slits", "spear thrust chain", "poison"),
    ("gwenshield", "GWEN SHIELD", "GUARDIA", "bronze", "stout woman-shaped knight mecha in dented iron plate with a kite shield twice her size, short mace, visor helm with a horsehair crest", "shield wall bash", "damage_reduction"),
]

if __name__ == "__main__":
    data = [dict(i=a, n=b, e=c, r=d, l=e, a=f, f=g) for a, b, c, d, e, f, g in ROSTER]
    ids = [d["i"] for d in data]
    assert len(set(ids)) == len(ids), "ids duplicados"
    json.dump(data, open("/home/user/mecha-champions/assets/roster_b1.json", "w"),
              ensure_ascii=False, indent=1)
    print(len(data), "robos no lote 1")
