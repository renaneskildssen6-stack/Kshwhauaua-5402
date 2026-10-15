# -*- coding: utf-8 -*-
"""Lote 2 da Fase D: 36 robos novos com sprite sheet de IA.
Temas: bestas selvagens, abissais/aquaticos, celestiais/cosmicos,
espectros/necro-mecha, aves/aereos, arcanos/alquimistas.
Tupla: (id, NOME, ELEMENTO, raridade, look, ataque_principal, efeito)
"""
import json

ROSTER = [
    # --- BESTAS SELVAGENS --------------------------------------------------
    ("lupvexor", "LUPVEXOR", "MATILHA", "silver", "steel grey wolf mecha standing on digitigrade legs, a bristling mane of blade-quills, elongated snout with exposed piston fangs, glowing amber eyes", "pack fang lunge", "drain"),
    ("tigravox", "TIGRAVOX", "PRESA", "gold", "orange and black striped tiger mecha with retractable plasma claws, a heavy armored chest, whiskers of thin antennae, snarling metal jaw", "quad claw rend", "weakening"),
    ("ursagrind", "URSA GRIND", "URSO", "bronze", "massive brown bear mecha with shaggy cable fur, riveted shoulder pauldrons, enormous grinding paw drills, small red eye lenses", "grinding paw crush", "paralyze"),
    ("cornubrute", "CORNU BRUTE", "CHIFRE", "silver", "muscular bull mecha with two curved iron horns, a snorting steam nose vent, hoof pistons kicking up dust, plated hump back", "horn charge trample", "paralyze"),
    ("simiaslam", "SIMIA SLAM", "PRIMATA", "bronze", "broad-armed gorilla mecha with knuckle walker fists, a barrel chest with a glowing core, short legs, angry brow plate over green optics", "double fist ground slam", "damage_reduction"),
    ("draknoir", "DRAKNOIR", "DRAGAO", "gold", "black scaled dragon mecha with tattered metal wings, a long spiked tail, a furnace throat glowing orange, curved horns sweeping back", "furnace breath sweep", "burn"),
    # --- ABISSAIS / AQUATICOS ----------------------------------------------
    ("abyssquid", "ABYSS SQUID", "ABISSO", "silver", "deep sea squid mecha with eight cable tentacles, a torpedo mantle body with bioluminescent blue dots, two huge glass eye domes", "tentacle ink coil", "blind"),
    ("krakenvolt", "KRAKEN VOLT", "MARE", "gold", "colossal kraken mecha with barnacled dark teal plating, electrified suckers along its arms, a beaked maw, storm clouds of static around it", "electro tentacle slam", "paralyze"),
    ("orcapulse", "ORCA PULSE", "SONAR", "silver", "sleek black and white orca mecha with hydro jet fins, a rounded sonar dome forehead, streamlined torso, short powerful arms", "sonar pulse ram", "blind"),
    ("coralarch", "CORAL ARCH", "RECIFE", "bronze", "reef mecha overgrown with pink and orange coral branches, cracked white ceramic plating, anemone shoulders, calm turquoise eye lights", "coral spire uppercut", "hp_regen"),
    ("hadalmaw", "HADAL MAW", "PRESSAO", "gold", "anglerfish mecha of pitted black steel with a glowing lure antenna, an enormous jaw of needle teeth, tiny useless arms, pressure ribbed hull", "lure light chomp", "trapped"),
    ("nauticrust", "NAUTICRUST", "CASCO", "bronze", "armored crab mecha with a wide barnacle shell back, one oversized crusher claw and one shield claw, stalk eyes, six skittering legs", "crusher claw pinch", "damage_reduction"),
    # --- CELESTIAIS / COSMICOS ---------------------------------------------
    ("solvarion", "SOLVARION", "SOLAR", "gold", "radiant golden mecha with a sun disc halo behind its head, molten light seams across white armor, flowing solar flare cape, blank glowing faceplate", "solar flare judgment", "burn"),
    ("lunaris_n", "LUNARIS", "LUNAR", "silver", "pale silver mecha with a crescent moon crown, flowing star-cloth mantle, delicate filigree armor, calm violet visor, moonlight orb in its palm", "crescent moon arc", "hp_regen"),
    ("cometrail", "COMET RAIL", "COMETA", "silver", "streamlined ice-blue mecha trailing a burning comet tail from its back thrusters, frost-cracked plating, sharp forward-swept shoulders", "comet tail dive", "adrenalin"),
    ("astronex", "ASTRONEX", "ORBITA", "bronze", "bulky white astronaut mecha with a gold-mirrored bubble visor, life support backpack, ringed planet emblem on its chest, thick padded joints", "orbital wrench swing", "damage_reduction"),
    ("quasarion", "QUASARION", "QUASAR", "gold", "blinding white-violet mecha whose chest is a collapsing star core, armor plates floating detached around its body, no legs, streaming light hair", "quasar collapse beam", "weakening"),
    ("zodiakon", "ZODIAKON", "ZODIACO", "silver", "bronze astrolabe mecha with rotating constellation rings around its waist, star-chart engraved armor, a horned diadem, twelve tiny glowing sigils", "constellation ring bind", "trapped"),
    # --- ESPECTROS / NECRO-MECHA -------------------------------------------
    ("wraithcore", "WRAITH CORE", "ESPECTRO", "gold", "tattered ghost mecha with a shredded grey shroud, a hollow chest cavity holding a floating blue soul flame, chained broken arms, faceless skull helm", "soul flame reach", "drain"),
    ("ossuarion", "OSSUARION", "OSSADA", "silver", "skeletal mecha assembled from bleached bone-white struts and exposed gears, a grinning skull faceplate, ribcage torso with a green lantern heart", "bone scythe sweep", "poison"),
    ("crypthollow", "CRYPT HOLLOW", "CRIPTA", "bronze", "hunched gravedigger mecha caked in dirt, a rusted iron mask with two eye holes, a shovel blade arm, coffin plate strapped to its back", "shovel grave swing", "weakening"),
    ("banshira", "BANSHIRA", "LAMENTO", "silver", "wailing spirit mecha with long floating hair of black wire, a cracked porcelain face mask, torn white gown plating, hovering above the ground", "wailing shriek wave", "blind"),
    ("necrovault", "NECROVAULT", "NECRO", "gold", "towering tomb mecha of black marble and gold trim, sarcophagus chest that cracks open with green light, crowned pharaoh helm, bandage cables", "sarcophagus seal grip", "trapped"),
    ("phantasmog", "PHANTASMOG", "NEVOA", "bronze", "half-transparent mist mecha whose lower body dissolves into fog, faint outline of ribs and spine, two drifting lantern eyes, ragged cloak", "fog phase strike", "blind"),
    # --- AVES / AEREOS -----------------------------------------------------
    ("aquilaris", "AQUILARIS", "AGUIA", "gold", "golden eagle mecha with a huge feathered wingspan of metal blades, hooked beak helm, taloned raptor feet, brown and gold plumage plating", "dive talon strike", "adrenalin"),
    ("corvexis", "CORVEXIS", "CORVO", "silver", "glossy black raven mecha with a sharp beak visor, feather-blade cloak wings, purple iridescent sheen, clawed hands, one glowing white eye", "beak peck barrage", "blind"),
    ("strixnova", "STRIX NOVA", "CORUJA", "silver", "round owl mecha with huge orange lens eyes, silent feather-panel wings, tufted horn ears, a swiveling head, soft grey barred plating", "silent talon ambush", "weakening"),
    ("falcowire", "FALCO WIRE", "FALCAO", "bronze", "compact peregrine falcon mecha built for speed, swept dart wings, a slate blue helm with cheek stripes, needle talons, thin frame", "stoop dive slash", "adrenalin"),
    ("pavoreal", "PAVO REAL", "PLUMA", "gold", "peacock mecha with an enormous fan of iridescent blue-green eye-spotted tail panels, a crowned crest, elegant slim armor, mirrored chest", "dazzling fan display", "blind"),
    ("condorax", "CONDORAX", "ALTITUDE", "bronze", "heavy condor mecha with a bald red-plated head, enormous ragged black wings, hunched shoulders, thick scavenger talons, dusty worn armor", "wing buffet crush", "damage_reduction"),
    # --- ARCANOS / ALQUIMISTAS ---------------------------------------------
    ("arcanexus", "ARCANEXUS", "ARCANO", "gold", "wizard mecha in a rune-stitched deep blue robe over segmented armor, floating spell tomes orbiting its head, a long staff topped with a glowing prism", "prism arcane bolt", "weakening"),
    ("alchemyre", "ALCHEMYRE", "ALQUIMIA", "silver", "alchemist mecha with a glass alembic torso bubbling green fluid, brass pipe arms, a plague-doctor beak mask, vial bandolier across its chest", "unstable flask toss", "poison"),
    ("runeblaid", "RUNE BLAID", "RUNA", "silver", "stone-grey mecha covered in carved glowing runes, a floating rune-etched greatsword controlled without hands, a slab faceplate with three eye marks", "floating rune blade", "burn"),
    ("hexarion", "HEXARION", "MALDICAO", "bronze", "crooked witch mecha with a wide brimmed iron hat, a bubbling cauldron mounted on its back, gnarled claw fingers, one green and one purple eye", "cauldron curse splash", "poison"),
    ("sigilmark", "SIGILMARK", "SIGILO", "gold", "ceremonial mecha whose chest opens into a spinning summoning circle, gold-inlaid white armor, ribbon seals fluttering from its arms, a mask of many eyes", "summoning circle seal", "trapped"),
    ("elixirion", "ELIXIRION", "ELIXIR", "bronze", "apothecary mecha with tanks of red and blue elixir on its back, transfusion tube arms, a monocle lens over one optic, stained lab-coat plating", "elixir injection jab", "hp_regen"),
]

if __name__ == "__main__":
    data = [dict(i=a, n=b, e=c, r=d, l=e, a=f, f=g) for a, b, c, d, e, f, g in ROSTER]
    ids = [d["i"] for d in data]
    assert len(set(ids)) == len(ids), "ids duplicados"
    json.dump(data, open("/home/user/mecha-champions/assets/roster_b2.json", "w"),
              ensure_ascii=False, indent=1)
    print(len(data), "robos no lote 2")
