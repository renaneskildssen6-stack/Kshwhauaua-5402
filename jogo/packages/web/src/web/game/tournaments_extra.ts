import { arenaForElement } from "./arenas";
import type { TournamentDef } from "./tournaments";

// Gerado por assets/gen_tournaments.py — 1 torneio por robo novo.
const RAW_EXTRA_TOURNAMENTS: TournamentDef[] = [
  {
    id: "t_dunecrawler",
    name: "COPA DUNE CRAWLER",
    arena: "dojo",
    element: "AREIA",
    desc: "Circuito de Areia — enfrente DUNE CRAWLER na final e conquiste seu chassi.",
    requiredLevel: 1,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "bioreaper",
            level: 1,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "titanox",
            level: 2,
            trained: 1,
          },
          {
            id: "cryolance",
            level: 2,
            trained: 1,
          },
        ],
      },
      {
        name: "FINAL — DUNE CRAWLER",
        enemies: [
          {
            id: "nebulon",
            level: 3,
            trained: 2,
          },
          {
            id: "bioreaper",
            level: 3,
            trained: 2,
          },
          {
            id: "bioreaper",
            level: 3,
            trained: 2,
          },
          {
            id: "dunecrawler",
            level: 4,
            trained: 3,
          },
        ],
      },
    ],
    reward: {
      gold: 900,
      xp: 120,
      robot: "dunecrawler",
      item: "repair_kit",
      itemQty: 3,
    },
    replayGold: 234,
    station: "station_dojo_1",
    x: 309,
    y: 245,
  },
  {
    id: "t_ironsentinel",
    name: "COPA IRON SENTINEL",
    arena: "dojo",
    element: "FERRO",
    desc: "Circuito de Ferro — enfrente IRON SENTINEL na final e conquiste seu chassi.",
    requiredLevel: 1,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "zephyrblade",
            level: 1,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "nullshade",
            level: 2,
            trained: 1,
          },
          {
            id: "zephyrblade",
            level: 2,
            trained: 1,
          },
        ],
      },
      {
        name: "FINAL — IRON SENTINEL",
        enemies: [
          {
            id: "zephyrblade",
            level: 3,
            trained: 2,
          },
          {
            id: "nullshade",
            level: 3,
            trained: 2,
          },
          {
            id: "dunecrawler",
            level: 3,
            trained: 2,
          },
          {
            id: "ironsentinel",
            level: 4,
            trained: 3,
          },
        ],
      },
    ],
    reward: {
      gold: 900,
      xp: 120,
      robot: "ironsentinel",
      item: "repair_kit",
      itemQty: 3,
    },
    replayGold: 234,
    station: "station_dojo_3",
    x: 550,
    y: 250,
  },
  {
    id: "t_grimsprocket",
    name: "COPA GRIM SPROCKET",
    arena: "volcano",
    element: "RUINA",
    desc: "Circuito de Ruina — enfrente GRIM SPROCKET na final e conquiste seu chassi.",
    requiredLevel: 2,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "zephyrblade",
            level: 2,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "pyrokaiser",
            level: 3,
            trained: 1,
          },
          {
            id: "stormfang",
            level: 3,
            trained: 1,
          },
        ],
      },
      {
        name: "FINAL — GRIM SPROCKET",
        enemies: [
          {
            id: "stormfang",
            level: 4,
            trained: 2,
          },
          {
            id: "acidra",
            level: 4,
            trained: 2,
          },
          {
            id: "ironmonk",
            level: 4,
            trained: 2,
          },
          {
            id: "grimsprocket",
            level: 5,
            trained: 3,
          },
        ],
      },
    ],
    reward: {
      gold: 1585,
      xp: 257,
      robot: "grimsprocket",
      item: "repair_kit",
      itemQty: 3,
    },
    replayGold: 412,
    station: "station_volcano_1",
    x: 848,
    y: 264,
  },
  {
    id: "t_basaltguard",
    name: "COPA BASALT GUARD",
    arena: "volcano",
    element: "OBSIDIANA",
    desc: "Circuito de Obsidiana — enfrente BASALT GUARD na final e conquiste seu chassi.",
    requiredLevel: 3,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "terrabyte",
            level: 3,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "grimsprocket",
            level: 4,
            trained: 1,
          },
          {
            id: "grimsprocket",
            level: 4,
            trained: 1,
          },
        ],
      },
      {
        name: "FINAL — BASALT GUARD",
        enemies: [
          {
            id: "grimsprocket",
            level: 5,
            trained: 2,
          },
          {
            id: "pyrokaiser",
            level: 5,
            trained: 2,
          },
          {
            id: "grimsprocket",
            level: 5,
            trained: 2,
          },
          {
            id: "basaltguard",
            level: 6,
            trained: 3,
          },
        ],
      },
    ],
    reward: {
      gold: 2310,
      xp: 402,
      robot: "basaltguard",
      item: "repair_kit",
      itemQty: 3,
    },
    replayGold: 601,
    station: "station_volcano_3",
    x: 1171,
    y: 293,
  },
  {
    id: "t_cinderhound",
    name: "COPA CINDERHOUND",
    arena: "volcano",
    element: "BRASA",
    desc: "Circuito de Brasa — enfrente CINDERHOUND na final e conquiste seu chassi.",
    requiredLevel: 3,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "basaltguard",
            level: 3,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "grimsprocket",
            level: 4,
            trained: 1,
          },
          {
            id: "basaltguard",
            level: 4,
            trained: 1,
          },
        ],
      },
      {
        name: "FINAL — CINDERHOUND",
        enemies: [
          {
            id: "pyrokaiser",
            level: 5,
            trained: 2,
          },
          {
            id: "bioreaper",
            level: 5,
            trained: 2,
          },
          {
            id: "basaltguard",
            level: 5,
            trained: 2,
          },
          {
            id: "cinderhound",
            level: 6,
            trained: 3,
          },
        ],
      },
    ],
    reward: {
      gold: 2310,
      xp: 402,
      robot: "cinderhound",
      item: "repair_kit",
      itemQty: 3,
    },
    replayGold: 601,
    station: "station_volcano_1",
    x: 1423,
    y: 235,
  },
  {
    id: "t_cloudpiercer",
    name: "COPA CLOUD PIERCER",
    arena: "sky",
    element: "NUVEM",
    desc: "Circuito de Nuvem — enfrente CLOUD PIERCER na final e conquiste seu chassi.",
    requiredLevel: 4,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "chronowake",
            level: 4,
            trained: 0,
          },
          {
            id: "nullshade",
            level: 4,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "quartzine",
            level: 5,
            trained: 1,
          },
          {
            id: "pyrokaiser",
            level: 5,
            trained: 1,
          },
        ],
      },
      {
        name: "FINAL — CLOUD PIERCER",
        enemies: [
          {
            id: "magnavore",
            level: 6,
            trained: 2,
          },
          {
            id: "ferrovax",
            level: 6,
            trained: 2,
          },
          {
            id: "aurorion",
            level: 6,
            trained: 2,
          },
          {
            id: "cloudpiercer",
            level: 7,
            trained: 3,
          },
        ],
      },
    ],
    reward: {
      gold: 3055,
      xp: 551,
      robot: "cloudpiercer",
      item: "repair_kit",
      itemQty: 3,
    },
    replayGold: 794,
    station: "station_sky_2",
    x: 1675,
    y: 231,
  },
  {
    id: "t_emberwing",
    name: "COPA EMBERWING",
    arena: "volcano",
    element: "FOGO",
    desc: "Circuito de Fogo — enfrente EMBERWING na final e conquiste seu chassi.",
    requiredLevel: 5,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "dunecrawler",
            level: 5,
            trained: 0,
          },
          {
            id: "cinderhound",
            level: 5,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "cinderhound",
            level: 6,
            trained: 1,
          },
          {
            id: "grimsprocket",
            level: 6,
            trained: 1,
          },
        ],
      },
      {
        name: "FINAL — EMBERWING",
        enemies: [
          {
            id: "cinderhound",
            level: 7,
            trained: 2,
          },
          {
            id: "grimsprocket",
            level: 7,
            trained: 2,
          },
          {
            id: "bioreaper",
            level: 7,
            trained: 2,
          },
          {
            id: "emberwing",
            level: 8,
            trained: 3,
          },
        ],
      },
    ],
    reward: {
      gold: 3825,
      xp: 705,
      robot: "emberwing",
      item: "repair_kit",
      itemQty: 3,
    },
    replayGold: 994,
    station: "station_volcano_3",
    x: 1899,
    y: 288,
  },
  {
    id: "t_acidbloom",
    name: "COPA ACIDBLOOM",
    arena: "frozen",
    element: "ACIDO",
    desc: "Circuito de Acido — enfrente ACIDBLOOM na final e conquiste seu chassi.",
    requiredLevel: 5,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "terrabyte",
            level: 5,
            trained: 0,
          },
          {
            id: "cloudpiercer",
            level: 5,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "ironsentinel",
            level: 6,
            trained: 1,
          },
          {
            id: "voltronin",
            level: 6,
            trained: 1,
          },
        ],
      },
      {
        name: "FINAL — ACIDBLOOM",
        enemies: [
          {
            id: "stormfang",
            level: 7,
            trained: 2,
          },
          {
            id: "emberfox",
            level: 7,
            trained: 2,
          },
          {
            id: "ironmonk",
            level: 7,
            trained: 2,
          },
          {
            id: "acidbloom",
            level: 8,
            trained: 3,
          },
        ],
      },
    ],
    reward: {
      gold: 3825,
      xp: 705,
      robot: "acidbloom",
      item: "repair_kit",
      itemQty: 3,
    },
    replayGold: 994,
    station: "station_frozen_3",
    x: 2224,
    y: 232,
  },
  {
    id: "t_aridfang",
    name: "COPA ARID FANG",
    arena: "dojo",
    element: "DESERTO",
    desc: "Circuito de Deserto — enfrente ARID FANG na final e conquiste seu chassi.",
    requiredLevel: 6,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "terrabyte",
            level: 6,
            trained: 0,
          },
          {
            id: "ironsentinel",
            level: 6,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "dunecrawler",
            level: 7,
            trained: 1,
          },
          {
            id: "dunecrawler",
            level: 7,
            trained: 1,
          },
        ],
      },
      {
        name: "FINAL — ARID FANG",
        enemies: [
          {
            id: "dunecrawler",
            level: 8,
            trained: 2,
          },
          {
            id: "ironsentinel",
            level: 8,
            trained: 2,
          },
          {
            id: "hydroknight",
            level: 8,
            trained: 2,
          },
          {
            id: "aridfang",
            level: 9,
            trained: 3,
          },
        ],
      },
    ],
    reward: {
      gold: 4605,
      xp: 861,
      robot: "aridfang",
      item: "repair_kit",
      itemQty: 3,
    },
    replayGold: 1197,
    station: "station_dojo_1",
    x: 2514,
    y: 268,
  },
  {
    id: "t_cometfang",
    name: "COPA COMETFANG",
    arena: "volcano",
    element: "METEORO",
    desc: "Circuito de Meteoro — enfrente COMETFANG na final e conquiste seu chassi.",
    requiredLevel: 7,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "cinderhound",
            level: 7,
            trained: 0,
          },
          {
            id: "gravitus",
            level: 7,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "emberwing",
            level: 8,
            trained: 1,
          },
          {
            id: "basaltguard",
            level: 8,
            trained: 1,
          },
        ],
      },
      {
        name: "FINAL — COMETFANG",
        enemies: [
          {
            id: "acidra",
            level: 9,
            trained: 2,
          },
          {
            id: "basaltguard",
            level: 9,
            trained: 2,
          },
          {
            id: "cinderhound",
            level: 9,
            trained: 2,
          },
          {
            id: "cometfang",
            level: 10,
            trained: 3,
          },
        ],
      },
    ],
    reward: {
      gold: 5400,
      xp: 1020,
      robot: "cometfang",
      item: "repair_kit",
      itemQty: 3,
    },
    replayGold: 1404,
    station: "station_volcano_1",
    x: 2773,
    y: 230,
  },
  {
    id: "t_toxinvore",
    name: "COPA TOXINVORE",
    arena: "frozen",
    element: "TOXINA",
    desc: "Circuito de Toxina — enfrente TOXINVORE na final e conquiste seu chassi.",
    requiredLevel: 8,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "aurorion",
            level: 8,
            trained: 0,
          },
          {
            id: "acidbloom",
            level: 8,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "voltronin",
            level: 9,
            trained: 1,
          },
          {
            id: "acidbloom",
            level: 9,
            trained: 1,
          },
        ],
      },
      {
        name: "FINAL — TOXINVORE",
        enemies: [
          {
            id: "acidbloom",
            level: 10,
            trained: 2,
          },
          {
            id: "acidbloom",
            level: 10,
            trained: 2,
          },
          {
            id: "acidbloom",
            level: 10,
            trained: 2,
          },
          {
            id: "toxinvore",
            level: 11,
            trained: 3,
          },
        ],
      },
    ],
    reward: {
      gold: 6210,
      xp: 1182,
      robot: "toxinvore",
      item: "repair_kit",
      itemQty: 3,
    },
    replayGold: 1615,
    station: "station_frozen_3",
    x: 3013,
    y: 275,
  },
  {
    id: "t_rustpriest",
    name: "COPA RUST PRIEST",
    arena: "volcano",
    element: "FERRUGEM",
    desc: "Circuito de Ferrugem — enfrente RUST PRIEST na final e conquiste seu chassi.",
    requiredLevel: 8,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "ironsentinel",
            level: 8,
            trained: 0,
          },
          {
            id: "cometfang",
            level: 8,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "grimsprocket",
            level: 9,
            trained: 1,
          },
          {
            id: "basaltguard",
            level: 9,
            trained: 1,
          },
        ],
      },
      {
        name: "FINAL — RUST PRIEST",
        enemies: [
          {
            id: "cometfang",
            level: 10,
            trained: 2,
          },
          {
            id: "toxinvore",
            level: 10,
            trained: 2,
          },
          {
            id: "cometfang",
            level: 10,
            trained: 2,
          },
          {
            id: "rustpriest",
            level: 11,
            trained: 3,
          },
        ],
      },
    ],
    reward: {
      gold: 6210,
      xp: 1182,
      robot: "rustpriest",
      item: "repair_kit",
      itemQty: 3,
    },
    replayGold: 1615,
    station: "station_volcano_1",
    x: 3254,
    y: 226,
  },
  {
    id: "t_coralshiv",
    name: "COPA CORAL SHIV",
    arena: "frozen",
    element: "RECIFE",
    desc: "Circuito de Recife — enfrente CORAL SHIV na final e conquiste seu chassi.",
    requiredLevel: 9,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "toxinvore",
            level: 9,
            trained: 0,
          },
          {
            id: "ironmonk",
            level: 9,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "acidbloom",
            level: 10,
            trained: 1,
          },
          {
            id: "ironmonk",
            level: 10,
            trained: 1,
          },
        ],
      },
      {
        name: "FINAL — CORAL SHIV",
        enemies: [
          {
            id: "acidbloom",
            level: 11,
            trained: 2,
          },
          {
            id: "acidbloom",
            level: 11,
            trained: 2,
          },
          {
            id: "emberfox",
            level: 11,
            trained: 2,
          },
          {
            id: "coralshiv",
            level: 12,
            trained: 3,
          },
        ],
      },
    ],
    reward: {
      gold: 7025,
      xp: 1345,
      robot: "coralshiv",
      item: "repair_kit",
      itemQty: 3,
    },
    replayGold: 1826,
    station: "station_frozen_2",
    x: 3268,
    y: 480,
  },
  {
    id: "t_snowreaver",
    name: "COPA SNOW REAVER",
    arena: "frozen",
    element: "NEVE",
    desc: "Circuito de Neve — enfrente SNOW REAVER na final e conquiste seu chassi.",
    requiredLevel: 10,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "toxinvore",
            level: 10,
            trained: 0,
          },
          {
            id: "nullshade",
            level: 10,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "coralshiv",
            level: 11,
            trained: 1,
          },
          {
            id: "coralshiv",
            level: 11,
            trained: 1,
          },
        ],
      },
      {
        name: "FINAL — SNOW REAVER",
        enemies: [
          {
            id: "coralshiv",
            level: 12,
            trained: 2,
          },
          {
            id: "toxinvore",
            level: 12,
            trained: 2,
          },
          {
            id: "acidbloom",
            level: 12,
            trained: 2,
          },
          {
            id: "snowreaver",
            level: 13,
            trained: 3,
          },
        ],
      },
    ],
    reward: {
      gold: 7855,
      xp: 1511,
      robot: "snowreaver",
      item: "repair_kit",
      itemQty: 3,
    },
    replayGold: 2042,
    station: "station_frozen_2",
    x: 3033,
    y: 519,
  },
  {
    id: "t_emberlash",
    name: "COPA EMBERLASH",
    arena: "volcano",
    element: "BRASA",
    desc: "Circuito de Brasa — enfrente EMBERLASH na final e conquiste seu chassi.",
    requiredLevel: 11,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "cometfang",
            level: 11,
            trained: 0,
          },
          {
            id: "grimsprocket",
            level: 11,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "cinderhound",
            level: 12,
            trained: 1,
          },
          {
            id: "cometfang",
            level: 12,
            trained: 1,
          },
        ],
      },
      {
        name: "FINAL — EMBERLASH",
        enemies: [
          {
            id: "voltronin",
            level: 13,
            trained: 2,
          },
          {
            id: "emberwing",
            level: 13,
            trained: 2,
          },
          {
            id: "basaltguard",
            level: 13,
            trained: 2,
          },
          {
            id: "emberlash",
            level: 14,
            trained: 3,
          },
        ],
      },
    ],
    reward: {
      gold: 8690,
      xp: 1678,
      robot: "emberlash",
      item: "repair_kit",
      itemQty: 3,
    },
    replayGold: 2259,
    station: "station_volcano_3",
    x: 2733,
    y: 523,
  },
  {
    id: "t_sporeherald",
    name: "COPA SPORE HERALD",
    arena: "dojo",
    element: "BIO",
    desc: "Circuito de Bio — enfrente SPORE HERALD na final e conquiste seu chassi.",
    requiredLevel: 12,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "ferrovax",
            level: 12,
            trained: 0,
          },
          {
            id: "ironsentinel",
            level: 12,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "ironsentinel",
            level: 13,
            trained: 1,
          },
          {
            id: "snowreaver",
            level: 13,
            trained: 1,
          },
        ],
      },
      {
        name: "FINAL — SPORE HERALD",
        enemies: [
          {
            id: "dunecrawler",
            level: 14,
            trained: 2,
          },
          {
            id: "aurorion",
            level: 14,
            trained: 2,
          },
          {
            id: "gravitus",
            level: 14,
            trained: 2,
          },
          {
            id: "sporeherald",
            level: 15,
            trained: 3,
          },
        ],
      },
    ],
    reward: {
      gold: 9530,
      xp: 1846,
      robot: "sporeherald",
      item: "repair_kit",
      itemQty: 3,
    },
    replayGold: 2478,
    station: "station_dojo_1",
    x: 2467,
    y: 476,
  },
  {
    id: "t_mossknight",
    name: "COPA MOSS KNIGHT",
    arena: "dojo",
    element: "SELVA",
    desc: "Circuito de Selva — enfrente MOSS KNIGHT na final e conquiste seu chassi.",
    requiredLevel: 12,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "ironsentinel",
            level: 12,
            trained: 0,
          },
          {
            id: "dunecrawler",
            level: 12,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "bioreaper",
            level: 13,
            trained: 1,
          },
          {
            id: "sporeherald",
            level: 13,
            trained: 1,
          },
        ],
      },
      {
        name: "FINAL — MOSS KNIGHT",
        enemies: [
          {
            id: "aridfang",
            level: 14,
            trained: 2,
          },
          {
            id: "ferrovax",
            level: 14,
            trained: 2,
          },
          {
            id: "aridfang",
            level: 14,
            trained: 2,
          },
          {
            id: "mossknight",
            level: 15,
            trained: 3,
          },
        ],
      },
    ],
    reward: {
      gold: 9530,
      xp: 1846,
      robot: "mossknight",
      item: "repair_kit",
      itemQty: 3,
    },
    replayGold: 2478,
    station: "station_dojo_3",
    x: 2250,
    y: 498,
  },
  {
    id: "t_terraforge",
    name: "COPA TERRAFORGE",
    arena: "dojo",
    element: "TERRA",
    desc: "Circuito de Terra — enfrente TERRAFORGE na final e conquiste seu chassi.",
    requiredLevel: 13,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "zephyrblade",
            level: 13,
            trained: 0,
          },
          {
            id: "chronowake",
            level: 13,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "mossknight",
            level: 14,
            trained: 1,
          },
          {
            id: "aridfang",
            level: 14,
            trained: 1,
          },
        ],
      },
      {
        name: "FINAL — TERRAFORGE",
        enemies: [
          {
            id: "pyrokaiser",
            level: 15,
            trained: 2,
          },
          {
            id: "ironsentinel",
            level: 15,
            trained: 2,
          },
          {
            id: "ironsentinel",
            level: 15,
            trained: 2,
          },
          {
            id: "terraforge",
            level: 16,
            trained: 3,
          },
        ],
      },
    ],
    reward: {
      gold: 10380,
      xp: 2016,
      robot: "terraforge",
      item: "repair_kit",
      itemQty: 3,
    },
    replayGold: 2699,
    station: "station_dojo_2",
    x: 1938,
    y: 518,
  },
  {
    id: "t_mireclad",
    name: "COPA MIRECLAD",
    arena: "frozen",
    element: "PANTANO",
    desc: "Circuito de Pantano — enfrente MIRECLAD na final e conquiste seu chassi.",
    requiredLevel: 14,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "acidbloom",
            level: 14,
            trained: 0,
          },
          {
            id: "aridfang",
            level: 14,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "coralshiv",
            level: 15,
            trained: 1,
          },
          {
            id: "coralshiv",
            level: 15,
            trained: 1,
          },
        ],
      },
      {
        name: "FINAL — MIRECLAD",
        enemies: [
          {
            id: "acidbloom",
            level: 16,
            trained: 2,
          },
          {
            id: "mossknight",
            level: 16,
            trained: 2,
          },
          {
            id: "acidbloom",
            level: 16,
            trained: 2,
          },
          {
            id: "mireclad",
            level: 17,
            trained: 3,
          },
        ],
      },
    ],
    reward: {
      gold: 11235,
      xp: 2187,
      robot: "mireclad",
      item: "repair_kit",
      itemQty: 3,
    },
    replayGold: 2921,
    station: "station_frozen_3",
    x: 1703,
    y: 522,
  },
  {
    id: "t_windshear",
    name: "COPA WINDSHEAR",
    arena: "sky",
    element: "VENTO",
    desc: "Circuito de Vento — enfrente WINDSHEAR na final e conquiste seu chassi.",
    requiredLevel: 15,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "bioreaper",
            level: 15,
            trained: 0,
          },
          {
            id: "cloudpiercer",
            level: 15,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "cloudpiercer",
            level: 16,
            trained: 1,
          },
          {
            id: "cloudpiercer",
            level: 16,
            trained: 1,
          },
        ],
      },
      {
        name: "FINAL — WINDSHEAR",
        enemies: [
          {
            id: "cloudpiercer",
            level: 17,
            trained: 2,
          },
          {
            id: "cloudpiercer",
            level: 17,
            trained: 2,
          },
          {
            id: "cloudpiercer",
            level: 17,
            trained: 2,
          },
          {
            id: "windshear",
            level: 18,
            trained: 3,
          },
        ],
      },
    ],
    reward: {
      gold: 12100,
      xp: 2360,
      robot: "windshear",
      item: "repair_kit",
      itemQty: 3,
    },
    replayGold: 3146,
    station: "station_sky_1",
    x: 1386,
    y: 546,
  },
  {
    id: "t_amberlock",
    name: "COPA AMBERLOCK",
    arena: "frozen",
    element: "AMBAR",
    desc: "Circuito de Ambar — enfrente AMBERLOCK na final e conquiste seu chassi.",
    requiredLevel: 16,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "coralshiv",
            level: 16,
            trained: 0,
          },
          {
            id: "coralshiv",
            level: 16,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "coralshiv",
            level: 17,
            trained: 1,
          },
          {
            id: "snowreaver",
            level: 17,
            trained: 1,
          },
        ],
      },
      {
        name: "FINAL — AMBERLOCK",
        enemies: [
          {
            id: "hydroknight",
            level: 18,
            trained: 2,
          },
          {
            id: "snowreaver",
            level: 18,
            trained: 2,
          },
          {
            id: "acidbloom",
            level: 18,
            trained: 2,
          },
          {
            id: "amberlock",
            level: 19,
            trained: 3,
          },
        ],
      },
    ],
    reward: {
      gold: 12965,
      xp: 2533,
      robot: "amberlock",
      item: "repair_kit",
      itemQty: 3,
    },
    replayGold: 3371,
    station: "station_frozen_1",
    x: 1174,
    y: 507,
  },
  {
    id: "t_gridrunner",
    name: "COPA GRIDRUNNER",
    arena: "orbital",
    element: "NEON",
    desc: "Circuito de Neon — enfrente GRIDRUNNER na final e conquiste seu chassi.",
    requiredLevel: 17,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "pyrokaiser",
            level: 17,
            trained: 0,
          },
          {
            id: "nebulon",
            level: 17,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "chronowake",
            level: 18,
            trained: 1,
          },
          {
            id: "cloudpiercer",
            level: 18,
            trained: 1,
          },
        ],
      },
      {
        name: "FINAL — GRIDRUNNER",
        enemies: [
          {
            id: "titanox",
            level: 19,
            trained: 2,
          },
          {
            id: "coralshiv",
            level: 19,
            trained: 2,
          },
          {
            id: "zephyrblade",
            level: 19,
            trained: 2,
          },
          {
            id: "gridrunner",
            level: 20,
            trained: 3,
          },
        ],
      },
    ],
    reward: {
      gold: 13840,
      xp: 2708,
      robot: "gridrunner",
      item: "energy_cell",
      itemQty: 3,
    },
    replayGold: 3598,
    station: "station_orbital_1",
    x: 856,
    y: 525,
  },
  {
    id: "t_quarrybreaker",
    name: "COPA QUARRY BREAKER",
    arena: "dojo",
    element: "TERRA",
    desc: "Circuito de Terra — enfrente QUARRY BREAKER na final e conquiste seu chassi.",
    requiredLevel: 18,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "grimsprocket",
            level: 18,
            trained: 0,
          },
          {
            id: "mossknight",
            level: 18,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "terraforge",
            level: 19,
            trained: 1,
          },
          {
            id: "amberlock",
            level: 19,
            trained: 1,
          },
        ],
      },
      {
        name: "FINAL — QUARRY BREAKER",
        enemies: [
          {
            id: "voltronin",
            level: 20,
            trained: 2,
          },
          {
            id: "dunecrawler",
            level: 20,
            trained: 2,
          },
          {
            id: "mossknight",
            level: 20,
            trained: 2,
          },
          {
            id: "quarrybreaker",
            level: 21,
            trained: 3,
          },
        ],
      },
    ],
    reward: {
      gold: 14720,
      xp: 2884,
      robot: "quarrybreaker",
      item: "energy_cell",
      itemQty: 3,
    },
    replayGold: 3827,
    station: "station_dojo_1",
    x: 560,
    y: 534,
  },
  {
    id: "t_glacierjaw",
    name: "COPA GLACIER JAW",
    arena: "frozen",
    element: "GELO",
    desc: "Circuito de Gelo — enfrente GLACIER JAW na final e conquiste seu chassi.",
    requiredLevel: 19,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "coralshiv",
            level: 19,
            trained: 0,
          },
          {
            id: "mireclad",
            level: 19,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "quartzine",
            level: 20,
            trained: 1,
          },
          {
            id: "snowreaver",
            level: 20,
            trained: 1,
          },
        ],
      },
      {
        name: "FINAL — GLACIER JAW",
        enemies: [
          {
            id: "acidbloom",
            level: 21,
            trained: 2,
          },
          {
            id: "toxinvore",
            level: 21,
            trained: 2,
          },
          {
            id: "amberlock",
            level: 21,
            trained: 2,
          },
          {
            id: "glacierjaw",
            level: 22,
            trained: 3,
          },
        ],
      },
    ],
    reward: {
      gold: 15605,
      xp: 3061,
      robot: "glacierjaw",
      item: "energy_cell",
      itemQty: 3,
    },
    replayGold: 4057,
    station: "station_frozen_1",
    x: 341,
    y: 534,
  },
  {
    id: "t_prismvector",
    name: "COPA PRISM VECTOR",
    arena: "frozen",
    element: "CRISTAL",
    desc: "Circuito de Cristal — enfrente PRISM VECTOR na final e conquiste seu chassi.",
    requiredLevel: 19,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "amberlock",
            level: 19,
            trained: 0,
          },
          {
            id: "mireclad",
            level: 19,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "rustpriest",
            level: 20,
            trained: 1,
          },
          {
            id: "sporeherald",
            level: 20,
            trained: 1,
          },
        ],
      },
      {
        name: "FINAL — PRISM VECTOR",
        enemies: [
          {
            id: "amberlock",
            level: 21,
            trained: 2,
          },
          {
            id: "snowreaver",
            level: 21,
            trained: 2,
          },
          {
            id: "terraforge",
            level: 21,
            trained: 2,
          },
          {
            id: "prismvector",
            level: 22,
            trained: 3,
          },
        ],
      },
    ],
    reward: {
      gold: 15605,
      xp: 3061,
      robot: "prismvector",
      item: "energy_cell",
      itemQty: 3,
    },
    replayGold: 4057,
    station: "station_frozen_1",
    x: 337,
    y: 781,
  },
  {
    id: "t_forgeheart",
    name: "COPA FORGE HEART",
    arena: "volcano",
    element: "FORJA",
    desc: "Circuito de Forja — enfrente FORGE HEART na final e conquiste seu chassi.",
    requiredLevel: 20,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "cinderhound",
            level: 20,
            trained: 0,
          },
          {
            id: "pyrokaiser",
            level: 20,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "grimsprocket",
            level: 21,
            trained: 1,
          },
          {
            id: "grimsprocket",
            level: 21,
            trained: 1,
          },
        ],
      },
      {
        name: "FINAL — FORGE HEART",
        enemies: [
          {
            id: "cometfang",
            level: 22,
            trained: 2,
          },
          {
            id: "basaltguard",
            level: 22,
            trained: 2,
          },
          {
            id: "grimsprocket",
            level: 22,
            trained: 2,
          },
          {
            id: "forgeheart",
            level: 23,
            trained: 3,
          },
        ],
      },
    ],
    reward: {
      gold: 16490,
      xp: 3238,
      robot: "forgeheart",
      item: "energy_cell",
      itemQty: 3,
    },
    replayGold: 4287,
    station: "station_volcano_2",
    x: 580,
    y: 794,
  },
  {
    id: "t_cosmoveil",
    name: "COPA COSMOVEIL",
    arena: "orbital",
    element: "COSMICO",
    desc: "Circuito de Cosmico — enfrente COSMOVEIL na final e conquiste seu chassi.",
    requiredLevel: 21,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "sporeherald",
            level: 21,
            trained: 0,
          },
          {
            id: "stormfang",
            level: 21,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "emberlash",
            level: 22,
            trained: 1,
          },
          {
            id: "ironmonk",
            level: 22,
            trained: 1,
          },
        ],
      },
      {
        name: "FINAL — COSMOVEIL",
        enemies: [
          {
            id: "gridrunner",
            level: 23,
            trained: 2,
          },
          {
            id: "gridrunner",
            level: 23,
            trained: 2,
          },
          {
            id: "gridrunner",
            level: 23,
            trained: 2,
          },
          {
            id: "cosmoveil",
            level: 24,
            trained: 3,
          },
        ],
      },
    ],
    reward: {
      gold: 17385,
      xp: 3417,
      robot: "cosmoveil",
      item: "energy_cell",
      itemQty: 3,
    },
    replayGold: 4520,
    station: "station_orbital_2",
    x: 837,
    y: 799,
  },
  {
    id: "t_bonemarshal",
    name: "COPA BONE MARSHAL",
    arena: "dojo",
    element: "OSSO",
    desc: "Circuito de Osso — enfrente BONE MARSHAL na final e conquiste seu chassi.",
    requiredLevel: 22,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "dunecrawler",
            level: 22,
            trained: 0,
          },
          {
            id: "stormfang",
            level: 22,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "ironsentinel",
            level: 23,
            trained: 1,
          },
          {
            id: "terraforge",
            level: 23,
            trained: 1,
          },
        ],
      },
      {
        name: "FINAL — BONE MARSHAL",
        enemies: [
          {
            id: "aridfang",
            level: 24,
            trained: 2,
          },
          {
            id: "ironsentinel",
            level: 24,
            trained: 2,
          },
          {
            id: "mossknight",
            level: 24,
            trained: 2,
          },
          {
            id: "bonemarshal",
            level: 25,
            trained: 3,
          },
        ],
      },
    ],
    reward: {
      gold: 18280,
      xp: 3596,
      robot: "bonemarshal",
      item: "energy_cell",
      itemQty: 3,
    },
    replayGold: 4753,
    station: "station_dojo_2",
    x: 1114,
    y: 761,
  },
  {
    id: "t_neondrifter",
    name: "COPA NEON DRIFTER",
    arena: "orbital",
    element: "NEON",
    desc: "Circuito de Neon — enfrente NEON DRIFTER na final e conquiste seu chassi.",
    requiredLevel: 23,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "cosmoveil",
            level: 23,
            trained: 0,
          },
          {
            id: "acidra",
            level: 23,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "gridrunner",
            level: 24,
            trained: 1,
          },
          {
            id: "chronowake",
            level: 24,
            trained: 1,
          },
        ],
      },
      {
        name: "FINAL — NEON DRIFTER",
        enemies: [
          {
            id: "cosmoveil",
            level: 25,
            trained: 2,
          },
          {
            id: "coralshiv",
            level: 25,
            trained: 2,
          },
          {
            id: "stormfang",
            level: 25,
            trained: 2,
          },
          {
            id: "neondrifter",
            level: 26,
            trained: 3,
          },
        ],
      },
    ],
    reward: {
      gold: 19180,
      xp: 3776,
      robot: "neondrifter",
      item: "energy_cell",
      itemQty: 3,
    },
    replayGold: 4987,
    station: "station_orbital_2",
    x: 1400,
    y: 758,
  },
  {
    id: "t_vulcanargo",
    name: "COPA VULCAN ARGO",
    arena: "volcano",
    element: "VULCAO",
    desc: "Circuito de Vulcao — enfrente VULCAN ARGO na final e conquiste seu chassi.",
    requiredLevel: 24,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "aridfang",
            level: 24,
            trained: 0,
          },
          {
            id: "emberwing",
            level: 24,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "forgeheart",
            level: 25,
            trained: 1,
          },
          {
            id: "forgeheart",
            level: 25,
            trained: 1,
          },
        ],
      },
      {
        name: "FINAL — VULCAN ARGO",
        enemies: [
          {
            id: "emberwing",
            level: 26,
            trained: 2,
          },
          {
            id: "cometfang",
            level: 26,
            trained: 2,
          },
          {
            id: "ferrovax",
            level: 26,
            trained: 2,
          },
          {
            id: "vulcanargo",
            level: 27,
            trained: 3,
          },
        ],
      },
    ],
    reward: {
      gold: 20085,
      xp: 3957,
      robot: "vulcanargo",
      item: "energy_cell",
      itemQty: 3,
    },
    replayGold: 5222,
    station: "station_volcano_3",
    x: 1682,
    y: 757,
  },
  {
    id: "t_hailstriker",
    name: "COPA HAILSTRIKER",
    arena: "frozen",
    element: "NEVE",
    desc: "Circuito de Neve — enfrente HAILSTRIKER na final e conquiste seu chassi.",
    requiredLevel: 25,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "mireclad",
            level: 25,
            trained: 0,
          },
          {
            id: "quarrybreaker",
            level: 25,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "prismvector",
            level: 26,
            trained: 1,
          },
          {
            id: "prismvector",
            level: 26,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "toxinvore",
            level: 27,
            trained: 2,
          },
          {
            id: "gridrunner",
            level: 27,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — HAILSTRIKER",
        enemies: [
          {
            id: "emberwing",
            level: 28,
            trained: 3,
          },
          {
            id: "coralshiv",
            level: 28,
            trained: 3,
          },
          {
            id: "prismvector",
            level: 28,
            trained: 3,
          },
          {
            id: "hailstriker",
            level: 29,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 20995,
      xp: 4139,
      robot: "hailstriker",
      item: "energy_cell",
      itemQty: 3,
    },
    replayGold: 5459,
    station: "station_frozen_2",
    x: 1952,
    y: 754,
  },
  {
    id: "t_heliondriver",
    name: "COPA HELION DRIVER",
    arena: "sky",
    element: "SOL",
    desc: "Circuito de Sol — enfrente HELION DRIVER na final e conquiste seu chassi.",
    requiredLevel: 26,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "windshear",
            level: 26,
            trained: 0,
          },
          {
            id: "windshear",
            level: 26,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "cloudpiercer",
            level: 27,
            trained: 1,
          },
          {
            id: "windshear",
            level: 27,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "windshear",
            level: 28,
            trained: 2,
          },
          {
            id: "windshear",
            level: 28,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — HELION DRIVER",
        enemies: [
          {
            id: "neondrifter",
            level: 29,
            trained: 3,
          },
          {
            id: "cinderhound",
            level: 29,
            trained: 3,
          },
          {
            id: "windshear",
            level: 29,
            trained: 3,
          },
          {
            id: "heliondriver",
            level: 30,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 21910,
      xp: 4322,
      robot: "heliondriver",
      item: "energy_cell",
      itemQty: 3,
    },
    replayGold: 5697,
    station: "station_sky_3",
    x: 2200,
    y: 741,
  },
  {
    id: "t_sandwyrm",
    name: "COPA SANDWYRM",
    arena: "dojo",
    element: "AREIA",
    desc: "Circuito de Areia — enfrente SANDWYRM na final e conquiste seu chassi.",
    requiredLevel: 27,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "ironsentinel",
            level: 27,
            trained: 0,
          },
          {
            id: "mossknight",
            level: 27,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "ironsentinel",
            level: 28,
            trained: 1,
          },
          {
            id: "ironsentinel",
            level: 28,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "mossknight",
            level: 29,
            trained: 2,
          },
          {
            id: "terraforge",
            level: 29,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — SANDWYRM",
        enemies: [
          {
            id: "hydroknight",
            level: 30,
            trained: 3,
          },
          {
            id: "aridfang",
            level: 30,
            trained: 3,
          },
          {
            id: "quarrybreaker",
            level: 30,
            trained: 3,
          },
          {
            id: "sandwyrm",
            level: 31,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 22825,
      xp: 4505,
      robot: "sandwyrm",
      item: "energy_cell",
      itemQty: 3,
    },
    replayGold: 5934,
    station: "station_dojo_2",
    x: 2456,
    y: 740,
  },
  {
    id: "t_bogtyrant",
    name: "COPA BOG TYRANT",
    arena: "frozen",
    element: "PANTANO",
    desc: "Circuito de Pantano — enfrente BOG TYRANT na final e conquiste seu chassi.",
    requiredLevel: 28,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "glacierjaw",
            level: 28,
            trained: 0,
          },
          {
            id: "glacierjaw",
            level: 28,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "mireclad",
            level: 29,
            trained: 1,
          },
          {
            id: "cloudpiercer",
            level: 29,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "amberlock",
            level: 30,
            trained: 2,
          },
          {
            id: "prismvector",
            level: 30,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — BOG TYRANT",
        enemies: [
          {
            id: "mireclad",
            level: 31,
            trained: 3,
          },
          {
            id: "snowreaver",
            level: 31,
            trained: 3,
          },
          {
            id: "acidbloom",
            level: 31,
            trained: 3,
          },
          {
            id: "bogtyrant",
            level: 32,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 23745,
      xp: 4689,
      robot: "bogtyrant",
      item: "energy_cell",
      itemQty: 3,
    },
    replayGold: 6174,
    station: "station_frozen_2",
    x: 2753,
    y: 787,
  },
  {
    id: "t_biolattice",
    name: "COPA BIOLATTICE",
    arena: "dojo",
    element: "BIO",
    desc: "Circuito de Bio — enfrente BIOLATTICE na final e conquiste seu chassi.",
    requiredLevel: 29,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "mossknight",
            level: 29,
            trained: 0,
          },
          {
            id: "quarrybreaker",
            level: 29,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "terraforge",
            level: 30,
            trained: 1,
          },
          {
            id: "terraforge",
            level: 30,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "aridfang",
            level: 31,
            trained: 2,
          },
          {
            id: "prismvector",
            level: 31,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — BIOLATTICE",
        enemies: [
          {
            id: "aridfang",
            level: 32,
            trained: 3,
          },
          {
            id: "hailstriker",
            level: 32,
            trained: 3,
          },
          {
            id: "ironsentinel",
            level: 32,
            trained: 3,
          },
          {
            id: "biolattice",
            level: 33,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 24665,
      xp: 4873,
      robot: "biolattice",
      item: "energy_cell",
      itemQty: 3,
    },
    replayGold: 6413,
    station: "station_dojo_3",
    x: 3057,
    y: 764,
  },
  {
    id: "t_vireoblade",
    name: "COPA VIREO BLADE",
    arena: "dojo",
    element: "JADE",
    desc: "Circuito de Jade — enfrente VIREO BLADE na final e conquiste seu chassi.",
    requiredLevel: 30,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "bonemarshal",
            level: 30,
            trained: 0,
          },
          {
            id: "mossknight",
            level: 30,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "dunecrawler",
            level: 31,
            trained: 1,
          },
          {
            id: "cinderhound",
            level: 31,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "dunecrawler",
            level: 32,
            trained: 2,
          },
          {
            id: "terraforge",
            level: 32,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — VIREO BLADE",
        enemies: [
          {
            id: "sandwyrm",
            level: 33,
            trained: 3,
          },
          {
            id: "bonemarshal",
            level: 33,
            trained: 3,
          },
          {
            id: "dunecrawler",
            level: 33,
            trained: 3,
          },
          {
            id: "vireoblade",
            level: 34,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 25590,
      xp: 5058,
      robot: "vireoblade",
      item: "energy_cell",
      itemQty: 3,
    },
    replayGold: 6653,
    station: "station_dojo_1",
    x: 3322,
    y: 765,
  },
  {
    id: "t_solstitia",
    name: "COPA SOLSTITIA",
    arena: "orbital",
    element: "ECLIPSE",
    desc: "Circuito de Eclipse — enfrente SOLSTITIA na final e conquiste seu chassi.",
    requiredLevel: 31,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "gridrunner",
            level: 31,
            trained: 0,
          },
          {
            id: "gridrunner",
            level: 31,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "cosmoveil",
            level: 32,
            trained: 1,
          },
          {
            id: "gridrunner",
            level: 32,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "gridrunner",
            level: 33,
            trained: 2,
          },
          {
            id: "gridrunner",
            level: 33,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — SOLSTITIA",
        enemies: [
          {
            id: "gridrunner",
            level: 34,
            trained: 3,
          },
          {
            id: "gridrunner",
            level: 34,
            trained: 3,
          },
          {
            id: "neondrifter",
            level: 34,
            trained: 3,
          },
          {
            id: "solstitia",
            level: 35,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 26520,
      xp: 5244,
      robot: "solstitia",
      item: "energy_cell",
      itemQty: 3,
    },
    replayGold: 6895,
    station: "station_orbital_3",
    x: 3248,
    y: 1048,
  },
  {
    id: "t_ruinwarden",
    name: "COPA RUIN WARDEN",
    arena: "volcano",
    element: "RUINA",
    desc: "Circuito de Ruina — enfrente RUIN WARDEN na final e conquiste seu chassi.",
    requiredLevel: 32,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "forgeheart",
            level: 32,
            trained: 0,
          },
          {
            id: "rustpriest",
            level: 32,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "toxinvore",
            level: 33,
            trained: 1,
          },
          {
            id: "basaltguard",
            level: 33,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "cinderhound",
            level: 34,
            trained: 2,
          },
          {
            id: "cometfang",
            level: 34,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — RUIN WARDEN",
        enemies: [
          {
            id: "cinderhound",
            level: 35,
            trained: 3,
          },
          {
            id: "rustpriest",
            level: 35,
            trained: 3,
          },
          {
            id: "vulcanargo",
            level: 35,
            trained: 3,
          },
          {
            id: "ruinwarden",
            level: 36,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 27455,
      xp: 5431,
      robot: "ruinwarden",
      item: "energy_cell",
      itemQty: 3,
    },
    replayGold: 7138,
    station: "station_volcano_3",
    x: 2978,
    y: 996,
  },
  {
    id: "t_lunargeist",
    name: "COPA LUNAR GEIST",
    arena: "orbital",
    element: "LUA",
    desc: "Circuito de Lua — enfrente LUNAR GEIST na final e conquiste seu chassi.",
    requiredLevel: 33,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "gridrunner",
            level: 33,
            trained: 0,
          },
          {
            id: "solstitia",
            level: 33,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "neondrifter",
            level: 34,
            trained: 1,
          },
          {
            id: "solstitia",
            level: 34,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "solstitia",
            level: 35,
            trained: 2,
          },
          {
            id: "neondrifter",
            level: 35,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — LUNAR GEIST",
        enemies: [
          {
            id: "solstitia",
            level: 36,
            trained: 3,
          },
          {
            id: "neondrifter",
            level: 36,
            trained: 3,
          },
          {
            id: "gridrunner",
            level: 36,
            trained: 3,
          },
          {
            id: "lunargeist",
            level: 37,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 28390,
      xp: 5618,
      robot: "lunargeist",
      item: "energy_cell",
      itemQty: 3,
    },
    replayGold: 7381,
    station: "station_orbital_1",
    x: 2747,
    y: 977,
  },
  {
    id: "t_resinjudge",
    name: "COPA RESIN JUDGE",
    arena: "frozen",
    element: "AMBAR",
    desc: "Circuito de Ambar — enfrente RESIN JUDGE na final e conquiste seu chassi.",
    requiredLevel: 34,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "emberfox",
            level: 34,
            trained: 0,
          },
          {
            id: "sporeherald",
            level: 34,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "cryolance",
            level: 35,
            trained: 1,
          },
          {
            id: "neondrifter",
            level: 35,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "prismvector",
            level: 36,
            trained: 2,
          },
          {
            id: "vulcanargo",
            level: 36,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — RESIN JUDGE",
        enemies: [
          {
            id: "bogtyrant",
            level: 37,
            trained: 3,
          },
          {
            id: "snowreaver",
            level: 37,
            trained: 3,
          },
          {
            id: "toxinvore",
            level: 37,
            trained: 3,
          },
          {
            id: "resinjudge",
            level: 38,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 29325,
      xp: 5805,
      robot: "resinjudge",
      item: "shield_chip",
      itemQty: 2,
    },
    replayGold: 7624,
    station: "station_frozen_1",
    x: 2455,
    y: 970,
  },
  {
    id: "t_voidcaller",
    name: "COPA VOIDCALLER",
    arena: "orbital",
    element: "VAZIO",
    desc: "Circuito de Vazio — enfrente VOIDCALLER na final e conquiste seu chassi.",
    requiredLevel: 35,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "gridrunner",
            level: 35,
            trained: 0,
          },
          {
            id: "cosmoveil",
            level: 35,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "lunargeist",
            level: 36,
            trained: 1,
          },
          {
            id: "ironsentinel",
            level: 36,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "neondrifter",
            level: 37,
            trained: 2,
          },
          {
            id: "amberlock",
            level: 37,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — VOIDCALLER",
        enemies: [
          {
            id: "cosmoveil",
            level: 38,
            trained: 3,
          },
          {
            id: "gridrunner",
            level: 38,
            trained: 3,
          },
          {
            id: "lunargeist",
            level: 38,
            trained: 3,
          },
          {
            id: "voidcaller",
            level: 39,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 30265,
      xp: 5993,
      robot: "voidcaller",
      item: "shield_chip",
      itemQty: 2,
    },
    replayGold: 7869,
    station: "station_orbital_2",
    x: 2223,
    y: 1027,
  },
  {
    id: "t_ringwarden",
    name: "COPA RING WARDEN",
    arena: "orbital",
    element: "ANEL",
    desc: "Circuito de Anel — enfrente RING WARDEN na final e conquiste seu chassi.",
    requiredLevel: 36,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "cosmoveil",
            level: 36,
            trained: 0,
          },
          {
            id: "voidcaller",
            level: 36,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "ironmonk",
            level: 37,
            trained: 1,
          },
          {
            id: "voltronin",
            level: 37,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "terrabyte",
            level: 38,
            trained: 2,
          },
          {
            id: "ruinwarden",
            level: 38,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — RING WARDEN",
        enemies: [
          {
            id: "emberfox",
            level: 39,
            trained: 3,
          },
          {
            id: "coralshiv",
            level: 39,
            trained: 3,
          },
          {
            id: "cosmoveil",
            level: 39,
            trained: 3,
          },
          {
            id: "ringwarden",
            level: 40,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 31210,
      xp: 6182,
      robot: "ringwarden",
      item: "shield_chip",
      itemQty: 2,
    },
    replayGold: 8115,
    station: "station_orbital_3",
    x: 1903,
    y: 1049,
  },
  {
    id: "t_tundrakeeper",
    name: "COPA TUNDRA KEEPER",
    arena: "frozen",
    element: "TUNDRA",
    desc: "Circuito de Tundra — enfrente TUNDRA KEEPER na final e conquiste seu chassi.",
    requiredLevel: 37,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "amberlock",
            level: 37,
            trained: 0,
          },
          {
            id: "prismvector",
            level: 37,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "resinjudge",
            level: 38,
            trained: 1,
          },
          {
            id: "toxinvore",
            level: 38,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "snowreaver",
            level: 39,
            trained: 2,
          },
          {
            id: "coralshiv",
            level: 39,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — TUNDRA KEEPER",
        enemies: [
          {
            id: "acidbloom",
            level: 40,
            trained: 3,
          },
          {
            id: "bogtyrant",
            level: 40,
            trained: 3,
          },
          {
            id: "snowreaver",
            level: 40,
            trained: 3,
          },
          {
            id: "tundrakeeper",
            level: 41,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 32155,
      xp: 6371,
      robot: "tundrakeeper",
      item: "shield_chip",
      itemQty: 2,
    },
    replayGold: 8360,
    station: "station_frozen_2",
    x: 1681,
    y: 1049,
  },
  {
    id: "t_stratoveil",
    name: "COPA STRATOVEIL",
    arena: "sky",
    element: "NUVEM",
    desc: "Circuito de Nuvem — enfrente STRATOVEIL na final e conquiste seu chassi.",
    requiredLevel: 38,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "voidcaller",
            level: 38,
            trained: 0,
          },
          {
            id: "heliondriver",
            level: 38,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "windshear",
            level: 39,
            trained: 1,
          },
          {
            id: "cloudpiercer",
            level: 39,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "cloudpiercer",
            level: 40,
            trained: 2,
          },
          {
            id: "windshear",
            level: 40,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — STRATOVEIL",
        enemies: [
          {
            id: "heliondriver",
            level: 41,
            trained: 3,
          },
          {
            id: "ruinwarden",
            level: 41,
            trained: 3,
          },
          {
            id: "heliondriver",
            level: 41,
            trained: 3,
          },
          {
            id: "stratoveil",
            level: 42,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 33105,
      xp: 6561,
      robot: "stratoveil",
      item: "shield_chip",
      itemQty: 2,
    },
    replayGold: 8607,
    station: "station_sky_3",
    x: 1368,
    y: 1031,
  },
  {
    id: "t_venomcarapace",
    name: "COPA VENOM CARAPACE",
    arena: "frozen",
    element: "TOXINA",
    desc: "Circuito de Toxina — enfrente VENOM CARAPACE na final e conquiste seu chassi.",
    requiredLevel: 39,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "mossknight",
            level: 39,
            trained: 0,
          },
          {
            id: "hailstriker",
            level: 39,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "acidbloom",
            level: 40,
            trained: 1,
          },
          {
            id: "amberlock",
            level: 40,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "coralshiv",
            level: 41,
            trained: 2,
          },
          {
            id: "cloudpiercer",
            level: 41,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — VENOM CARAPACE",
        enemies: [
          {
            id: "acidbloom",
            level: 42,
            trained: 3,
          },
          {
            id: "tundrakeeper",
            level: 42,
            trained: 3,
          },
          {
            id: "glacierjaw",
            level: 42,
            trained: 3,
          },
          {
            id: "venomcarapace",
            level: 43,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 34055,
      xp: 6751,
      robot: "venomcarapace",
      item: "shield_chip",
      itemQty: 2,
    },
    replayGold: 8854,
    station: "station_frozen_3",
    x: 1173,
    y: 986,
  },
  {
    id: "t_hexweaver",
    name: "COPA HEXWEAVER",
    arena: "orbital",
    element: "GRAFENO",
    desc: "Circuito de Grafeno — enfrente HEXWEAVER na final e conquiste seu chassi.",
    requiredLevel: 40,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "gridrunner",
            level: 40,
            trained: 0,
          },
          {
            id: "cosmoveil",
            level: 40,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "ringwarden",
            level: 41,
            trained: 1,
          },
          {
            id: "gridrunner",
            level: 41,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "ringwarden",
            level: 42,
            trained: 2,
          },
          {
            id: "stratoveil",
            level: 42,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — HEXWEAVER",
        enemies: [
          {
            id: "cosmoveil",
            level: 43,
            trained: 3,
          },
          {
            id: "heliondriver",
            level: 43,
            trained: 3,
          },
          {
            id: "mossknight",
            level: 43,
            trained: 3,
          },
          {
            id: "hexweaver",
            level: 44,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 35005,
      xp: 6941,
      robot: "hexweaver",
      item: "shield_chip",
      itemQty: 2,
    },
    replayGold: 9101,
    station: "station_orbital_2",
    x: 835,
    y: 1003,
  },
  {
    id: "t_noxfeather",
    name: "COPA NOXFEATHER",
    arena: "dojo",
    element: "SOMBRA",
    desc: "Circuito de Sombra — enfrente NOXFEATHER na final e conquiste seu chassi.",
    requiredLevel: 41,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "ironsentinel",
            level: 41,
            trained: 0,
          },
          {
            id: "zephyrblade",
            level: 41,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "bonemarshal",
            level: 42,
            trained: 1,
          },
          {
            id: "aridfang",
            level: 42,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "vireoblade",
            level: 43,
            trained: 2,
          },
          {
            id: "neondrifter",
            level: 43,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — NOXFEATHER",
        enemies: [
          {
            id: "quarrybreaker",
            level: 44,
            trained: 3,
          },
          {
            id: "bonemarshal",
            level: 44,
            trained: 3,
          },
          {
            id: "sandwyrm",
            level: 44,
            trained: 3,
          },
          {
            id: "noxfeather",
            level: 45,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 35965,
      xp: 7133,
      robot: "noxfeather",
      item: "shield_chip",
      itemQty: 2,
    },
    replayGold: 9351,
    station: "station_dojo_3",
    x: 616,
    y: 1011,
  },
  {
    id: "t_meteorpunch",
    name: "COPA METEOR PUNCH",
    arena: "volcano",
    element: "METEORO",
    desc: "Circuito de Meteoro — enfrente METEOR PUNCH na final e conquiste seu chassi.",
    requiredLevel: 42,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "cinderhound",
            level: 42,
            trained: 0,
          },
          {
            id: "cryolance",
            level: 42,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "bogtyrant",
            level: 43,
            trained: 1,
          },
          {
            id: "forgeheart",
            level: 43,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "emberlash",
            level: 44,
            trained: 2,
          },
          {
            id: "hailstriker",
            level: 44,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — METEOR PUNCH",
        enemies: [
          {
            id: "forgeheart",
            level: 45,
            trained: 3,
          },
          {
            id: "forgeheart",
            level: 45,
            trained: 3,
          },
          {
            id: "ruinwarden",
            level: 45,
            trained: 3,
          },
          {
            id: "meteorpunch",
            level: 46,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 36920,
      xp: 7324,
      robot: "meteorpunch",
      item: "shield_chip",
      itemQty: 2,
    },
    replayGold: 9599,
    station: "station_volcano_2",
    x: 322,
    y: 1010,
  },
  {
    id: "t_aquabastion",
    name: "COPA AQUA BASTION",
    arena: "frozen",
    element: "AGUA",
    desc: "Circuito de Agua — enfrente AQUA BASTION na final e conquiste seu chassi.",
    requiredLevel: 43,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "cometfang",
            level: 43,
            trained: 0,
          },
          {
            id: "emberlash",
            level: 43,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "glacierjaw",
            level: 44,
            trained: 1,
          },
          {
            id: "acidbloom",
            level: 44,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "toxinvore",
            level: 45,
            trained: 2,
          },
          {
            id: "sandwyrm",
            level: 45,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — AQUA BASTION",
        enemies: [
          {
            id: "venomcarapace",
            level: 46,
            trained: 3,
          },
          {
            id: "prismvector",
            level: 46,
            trained: 3,
          },
          {
            id: "ringwarden",
            level: 46,
            trained: 3,
          },
          {
            id: "aquabastion",
            level: 47,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 37880,
      xp: 7516,
      robot: "aquabastion",
      item: "shield_chip",
      itemQty: 2,
    },
    replayGold: 9849,
    station: "station_frozen_2",
    x: 296,
    y: 1296,
  },
  {
    id: "t_scrapbaron",
    name: "COPA SCRAP BARON",
    arena: "volcano",
    element: "FERRUGEM",
    desc: "Circuito de Ferrugem — enfrente SCRAP BARON na final e conquiste seu chassi.",
    requiredLevel: 44,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "cometfang",
            level: 44,
            trained: 0,
          },
          {
            id: "vulcanargo",
            level: 44,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "biolattice",
            level: 45,
            trained: 1,
          },
          {
            id: "forgeheart",
            level: 45,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "quarrybreaker",
            level: 46,
            trained: 2,
          },
          {
            id: "emberlash",
            level: 46,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — SCRAP BARON",
        enemies: [
          {
            id: "cinderhound",
            level: 47,
            trained: 3,
          },
          {
            id: "ironmonk",
            level: 47,
            trained: 3,
          },
          {
            id: "emberwing",
            level: 47,
            trained: 3,
          },
          {
            id: "scrapbaron",
            level: 48,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 38845,
      xp: 7709,
      robot: "scrapbaron",
      item: "shield_chip",
      itemQty: 2,
    },
    replayGold: 10100,
    station: "station_volcano_3",
    x: 626,
    y: 1225,
  },
  {
    id: "t_junglemaw",
    name: "COPA JUNGLE MAW",
    arena: "dojo",
    element: "SELVA",
    desc: "Circuito de Selva — enfrente JUNGLE MAW na final e conquiste seu chassi.",
    requiredLevel: 45,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "aridfang",
            level: 45,
            trained: 0,
          },
          {
            id: "quartzine",
            level: 45,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "terraforge",
            level: 46,
            trained: 1,
          },
          {
            id: "noxfeather",
            level: 46,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "dunecrawler",
            level: 47,
            trained: 2,
          },
          {
            id: "hailstriker",
            level: 47,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — JUNGLE MAW",
        enemies: [
          {
            id: "dunecrawler",
            level: 48,
            trained: 3,
          },
          {
            id: "terraforge",
            level: 48,
            trained: 3,
          },
          {
            id: "emberfox",
            level: 48,
            trained: 3,
          },
          {
            id: "junglemaw",
            level: 49,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 39810,
      xp: 7902,
      robot: "junglemaw",
      item: "shield_chip",
      itemQty: 2,
    },
    replayGold: 10351,
    station: "station_dojo_1",
    x: 820,
    y: 1255,
  },
  {
    id: "t_cindercrown",
    name: "COPA CINDER CROWN",
    arena: "volcano",
    element: "CINZAS",
    desc: "Circuito de Cinzas — enfrente CINDER CROWN na final e conquiste seu chassi.",
    requiredLevel: 46,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "emberlash",
            level: 46,
            trained: 0,
          },
          {
            id: "basaltguard",
            level: 46,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "ruinwarden",
            level: 47,
            trained: 1,
          },
          {
            id: "meteorpunch",
            level: 47,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "emberwing",
            level: 48,
            trained: 2,
          },
          {
            id: "cinderhound",
            level: 48,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — CINDER CROWN",
        enemies: [
          {
            id: "basaltguard",
            level: 49,
            trained: 3,
          },
          {
            id: "cometfang",
            level: 49,
            trained: 3,
          },
          {
            id: "windshear",
            level: 49,
            trained: 3,
          },
          {
            id: "cindercrown",
            level: 50,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 40775,
      xp: 8095,
      robot: "cindercrown",
      item: "shield_chip",
      itemQty: 2,
    },
    replayGold: 10602,
    station: "station_volcano_1",
    x: 1171,
    y: 1270,
  },
  {
    id: "t_gloomtide",
    name: "COPA GLOOMTIDE",
    arena: "orbital",
    element: "ABISSO",
    desc: "Circuito de Abisso — enfrente GLOOMTIDE na final e conquiste seu chassi.",
    requiredLevel: 47,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "hexweaver",
            level: 47,
            trained: 0,
          },
          {
            id: "lunargeist",
            level: 47,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "cloudpiercer",
            level: 48,
            trained: 1,
          },
          {
            id: "nebulon",
            level: 48,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "voidcaller",
            level: 49,
            trained: 2,
          },
          {
            id: "solstitia",
            level: 49,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — GLOOMTIDE",
        enemies: [
          {
            id: "voidcaller",
            level: 50,
            trained: 3,
          },
          {
            id: "neondrifter",
            level: 50,
            trained: 3,
          },
          {
            id: "ruinwarden",
            level: 50,
            trained: 3,
          },
          {
            id: "gloomtide",
            level: 51,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 41745,
      xp: 8289,
      robot: "gloomtide",
      item: "shield_chip",
      itemQty: 2,
    },
    replayGold: 10854,
    station: "station_orbital_2",
    x: 1395,
    y: 1229,
  },
  {
    id: "t_obsidianfist",
    name: "COPA OBSIDIAN FIST",
    arena: "volcano",
    element: "OBSIDIANA",
    desc: "Circuito de Obsidiana — enfrente OBSIDIAN FIST na final e conquiste seu chassi.",
    requiredLevel: 48,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "cometfang",
            level: 48,
            trained: 0,
          },
          {
            id: "aridfang",
            level: 48,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "scrapbaron",
            level: 49,
            trained: 1,
          },
          {
            id: "gloomtide",
            level: 49,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "cryolance",
            level: 50,
            trained: 2,
          },
          {
            id: "stormfang",
            level: 50,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — OBSIDIAN FIST",
        enemies: [
          {
            id: "meteorpunch",
            level: 51,
            trained: 3,
          },
          {
            id: "quartzine",
            level: 51,
            trained: 3,
          },
          {
            id: "vireoblade",
            level: 51,
            trained: 3,
          },
          {
            id: "obsidianfist",
            level: 52,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 42715,
      xp: 8483,
      robot: "obsidianfist",
      item: "shield_chip",
      itemQty: 2,
    },
    replayGold: 11106,
    station: "station_volcano_2",
    x: 1630,
    y: 1248,
  },
  {
    id: "t_lumenblade",
    name: "COPA LUMEN BLADE",
    arena: "sky",
    element: "LUZ",
    desc: "Circuito de Luz — enfrente LUMEN BLADE na final e conquiste seu chassi.",
    requiredLevel: 49,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "cosmoveil",
            level: 49,
            trained: 0,
          },
          {
            id: "cloudpiercer",
            level: 49,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "stratoveil",
            level: 50,
            trained: 1,
          },
          {
            id: "stratoveil",
            level: 50,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "grimsprocket",
            level: 51,
            trained: 2,
          },
          {
            id: "stratoveil",
            level: 51,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — LUMEN BLADE",
        enemies: [
          {
            id: "windshear",
            level: 52,
            trained: 3,
          },
          {
            id: "windshear",
            level: 52,
            trained: 3,
          },
          {
            id: "voltronin",
            level: 52,
            trained: 3,
          },
          {
            id: "lumenblade",
            level: 53,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 43690,
      xp: 8678,
      robot: "lumenblade",
      item: "shield_chip",
      itemQty: 2,
    },
    replayGold: 11359,
    station: "station_sky_3",
    x: 1957,
    y: 1298,
  },
  {
    id: "t_gravitide",
    name: "COPA GRAVITIDE",
    arena: "orbital",
    element: "GRAVIDADE",
    desc: "Circuito de Gravidade — enfrente GRAVITIDE na final e conquiste seu chassi.",
    requiredLevel: 50,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "gloomtide",
            level: 50,
            trained: 0,
          },
          {
            id: "gloomtide",
            level: 50,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "hailstriker",
            level: 51,
            trained: 1,
          },
          {
            id: "lunargeist",
            level: 51,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "glacierjaw",
            level: 52,
            trained: 2,
          },
          {
            id: "voidcaller",
            level: 52,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — GRAVITIDE",
        enemies: [
          {
            id: "gridrunner",
            level: 53,
            trained: 3,
          },
          {
            id: "ruinwarden",
            level: 53,
            trained: 3,
          },
          {
            id: "voidcaller",
            level: 53,
            trained: 3,
          },
          {
            id: "gravitide",
            level: 54,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 44665,
      xp: 8873,
      robot: "gravitide",
      item: "shield_chip",
      itemQty: 2,
    },
    replayGold: 11613,
    station: "station_orbital_2",
    x: 2173,
    y: 1269,
  },
  {
    id: "t_nebulaseer",
    name: "COPA NEBULA SEER",
    arena: "orbital",
    element: "NEBULOSA",
    desc: "Circuito de Nebulosa — enfrente NEBULA SEER na final e conquiste seu chassi.",
    requiredLevel: 51,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "scrapbaron",
            level: 51,
            trained: 0,
          },
          {
            id: "gridrunner",
            level: 51,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "cosmoveil",
            level: 52,
            trained: 1,
          },
          {
            id: "obsidianfist",
            level: 52,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "tundrakeeper",
            level: 53,
            trained: 2,
          },
          {
            id: "hexweaver",
            level: 53,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — NEBULA SEER",
        enemies: [
          {
            id: "noxfeather",
            level: 54,
            trained: 3,
          },
          {
            id: "gridrunner",
            level: 54,
            trained: 3,
          },
          {
            id: "ringwarden",
            level: 54,
            trained: 3,
          },
          {
            id: "nebulaseer",
            level: 55,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 45640,
      xp: 9068,
      robot: "nebulaseer",
      item: "mega_repair",
      itemQty: 3,
    },
    replayGold: 11866,
    station: "station_orbital_1",
    x: 2519,
    y: 1232,
  },
  {
    id: "t_neutronmaul",
    name: "COPA NEUTRON MAUL",
    arena: "orbital",
    element: "PULSAR",
    desc: "Circuito de Pulsar — enfrente NEUTRON MAUL na final e conquiste seu chassi.",
    requiredLevel: 52,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "lunargeist",
            level: 52,
            trained: 0,
          },
          {
            id: "bonemarshal",
            level: 52,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "gloomtide",
            level: 53,
            trained: 1,
          },
          {
            id: "solstitia",
            level: 53,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "emberlash",
            level: 54,
            trained: 2,
          },
          {
            id: "gridrunner",
            level: 54,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — NEUTRON MAUL",
        enemies: [
          {
            id: "voltronin",
            level: 55,
            trained: 3,
          },
          {
            id: "gridrunner",
            level: 55,
            trained: 3,
          },
          {
            id: "cosmoveil",
            level: 55,
            trained: 3,
          },
          {
            id: "neutronmaul",
            level: 56,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 46620,
      xp: 9264,
      robot: "neutronmaul",
      item: "mega_repair",
      itemQty: 3,
    },
    replayGold: 12121,
    station: "station_orbital_2",
    x: 2785,
    y: 1265,
  },
  {
    id: "t_stormlance",
    name: "COPA STORMLANCE",
    arena: "sky",
    element: "TEMPESTADE",
    desc: "Circuito de Tempestade — enfrente STORMLANCE na final e conquiste seu chassi.",
    requiredLevel: 53,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "toxinvore",
            level: 53,
            trained: 0,
          },
          {
            id: "lumenblade",
            level: 53,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "cloudpiercer",
            level: 54,
            trained: 1,
          },
          {
            id: "meteorpunch",
            level: 54,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "stratoveil",
            level: 55,
            trained: 2,
          },
          {
            id: "chronowake",
            level: 55,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — STORMLANCE",
        enemies: [
          {
            id: "gravitus",
            level: 56,
            trained: 3,
          },
          {
            id: "bonemarshal",
            level: 56,
            trained: 3,
          },
          {
            id: "cloudpiercer",
            level: 56,
            trained: 3,
          },
          {
            id: "stormlance",
            level: 57,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 47600,
      xp: 9460,
      robot: "stormlance",
      item: "mega_repair",
      itemQty: 3,
    },
    replayGold: 12376,
    station: "station_sky_2",
    x: 3047,
    y: 1269,
  },
  {
    id: "t_thunderoni",
    name: "COPA THUNDER ONI",
    arena: "sky",
    element: "TROVAO",
    desc: "Circuito de Trovao — enfrente THUNDER ONI na final e conquiste seu chassi.",
    requiredLevel: 54,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "hydroknight",
            level: 54,
            trained: 0,
          },
          {
            id: "stormlance",
            level: 54,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "stratoveil",
            level: 55,
            trained: 1,
          },
          {
            id: "heliondriver",
            level: 55,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "lumenblade",
            level: 56,
            trained: 2,
          },
          {
            id: "stratoveil",
            level: 56,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — THUNDER ONI",
        enemies: [
          {
            id: "stormlance",
            level: 57,
            trained: 3,
          },
          {
            id: "heliondriver",
            level: 57,
            trained: 3,
          },
          {
            id: "sporeherald",
            level: 57,
            trained: 3,
          },
          {
            id: "thunderoni",
            level: 58,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 48580,
      xp: 9656,
      robot: "thunderoni",
      item: "mega_repair",
      itemQty: 3,
    },
    replayGold: 12631,
    station: "station_sky_1",
    x: 3278,
    y: 1243,
  },
  {
    id: "t_shadowfang",
    name: "COPA SHADOWFANG",
    arena: "dojo",
    element: "SOMBRA",
    desc: "Circuito de Sombra — enfrente SHADOWFANG na final e conquiste seu chassi.",
    requiredLevel: 55,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "sporeherald",
            level: 55,
            trained: 0,
          },
          {
            id: "aridfang",
            level: 55,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "ironsentinel",
            level: 56,
            trained: 1,
          },
          {
            id: "mireclad",
            level: 56,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "mossknight",
            level: 57,
            trained: 2,
          },
          {
            id: "sandwyrm",
            level: 57,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — SHADOWFANG",
        enemies: [
          {
            id: "noxfeather",
            level: 58,
            trained: 3,
          },
          {
            id: "dunecrawler",
            level: 58,
            trained: 3,
          },
          {
            id: "quarrybreaker",
            level: 58,
            trained: 3,
          },
          {
            id: "shadowfang",
            level: 59,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 49565,
      xp: 9853,
      robot: "shadowfang",
      item: "mega_repair",
      itemQty: 3,
    },
    replayGold: 12887,
    station: "station_dojo_2",
    x: 3265,
    y: 1521,
  },
  {
    id: "t_magnashrike",
    name: "COPA MAGNASHRIKE",
    arena: "orbital",
    element: "MAGNETISMO",
    desc: "Circuito de Magnetismo — enfrente MAGNASHRIKE na final e conquiste seu chassi.",
    requiredLevel: 56,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "gridrunner",
            level: 56,
            trained: 0,
          },
          {
            id: "solstitia",
            level: 56,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "cometfang",
            level: 57,
            trained: 1,
          },
          {
            id: "ironmonk",
            level: 57,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "voidcaller",
            level: 58,
            trained: 2,
          },
          {
            id: "hailstriker",
            level: 58,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — MAGNASHRIKE",
        enemies: [
          {
            id: "neondrifter",
            level: 59,
            trained: 3,
          },
          {
            id: "biolattice",
            level: 59,
            trained: 3,
          },
          {
            id: "ringwarden",
            level: 59,
            trained: 3,
          },
          {
            id: "magnashrike",
            level: 60,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 50555,
      xp: 10051,
      robot: "magnashrike",
      item: "mega_repair",
      itemQty: 3,
    },
    replayGold: 13144,
    station: "station_orbital_1",
    x: 3022,
    y: 1504,
  },
  {
    id: "t_blastfurnace",
    name: "COPA BLAST FURNACE",
    arena: "volcano",
    element: "FORJA",
    desc: "Circuito de Forja — enfrente BLAST FURNACE na final e conquiste seu chassi.",
    requiredLevel: 57,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "rustpriest",
            level: 57,
            trained: 0,
          },
          {
            id: "meteorpunch",
            level: 57,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "pyrokaiser",
            level: 58,
            trained: 1,
          },
          {
            id: "cometfang",
            level: 58,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "ruinwarden",
            level: 59,
            trained: 2,
          },
          {
            id: "forgeheart",
            level: 59,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — BLAST FURNACE",
        enemies: [
          {
            id: "aquabastion",
            level: 60,
            trained: 3,
          },
          {
            id: "vulcanargo",
            level: 60,
            trained: 3,
          },
          {
            id: "basaltguard",
            level: 60,
            trained: 3,
          },
          {
            id: "blastfurnace",
            level: 61,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 51540,
      xp: 10248,
      robot: "blastfurnace",
      item: "mega_repair",
      itemQty: 3,
    },
    replayGold: 13400,
    station: "station_volcano_1",
    x: 2779,
    y: 1541,
  },
  {
    id: "t_eventhorizon",
    name: "COPA EVENT HORIZON",
    arena: "orbital",
    element: "BURACO NEGRO",
    desc: "Circuito de Buraco Negro — enfrente EVENT HORIZON na final e conquiste seu chassi.",
    requiredLevel: 58,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "aquabastion",
            level: 58,
            trained: 0,
          },
          {
            id: "gridrunner",
            level: 58,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "gridrunner",
            level: 59,
            trained: 1,
          },
          {
            id: "solstitia",
            level: 59,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "hexweaver",
            level: 60,
            trained: 2,
          },
          {
            id: "scrapbaron",
            level: 60,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — EVENT HORIZON",
        enemies: [
          {
            id: "gravitide",
            level: 61,
            trained: 3,
          },
          {
            id: "magnashrike",
            level: 61,
            trained: 3,
          },
          {
            id: "neondrifter",
            level: 61,
            trained: 3,
          },
          {
            id: "eventhorizon",
            level: 62,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 52530,
      xp: 10446,
      robot: "eventhorizon",
      item: "mega_repair",
      itemQty: 3,
    },
    replayGold: 13658,
    station: "station_orbital_2",
    x: 2468,
    y: 1543,
  },
  {
    id: "t_maelstromfist",
    name: "COPA MAELSTROM FIST",
    arena: "frozen",
    element: "AGUA",
    desc: "Circuito de Agua — enfrente MAELSTROM FIST na final e conquiste seu chassi.",
    requiredLevel: 60,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "venomcarapace",
            level: 60,
            trained: 0,
          },
          {
            id: "tundrakeeper",
            level: 60,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "toxinvore",
            level: 61,
            trained: 1,
          },
          {
            id: "nebulaseer",
            level: 61,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "hydroknight",
            level: 62,
            trained: 2,
          },
          {
            id: "bogtyrant",
            level: 62,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — MAELSTROM FIST",
        enemies: [
          {
            id: "venomcarapace",
            level: 63,
            trained: 3,
          },
          {
            id: "resinjudge",
            level: 63,
            trained: 3,
          },
          {
            id: "resinjudge",
            level: 63,
            trained: 3,
          },
          {
            id: "maelstromfist",
            level: 64,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 54515,
      xp: 10843,
      robot: "maelstromfist",
      item: "mega_repair",
      itemQty: 3,
    },
    replayGold: 14174,
    station: "station_frozen_2",
    x: 2176,
    y: 1542,
  },
  {
    id: "t_eclipsar",
    name: "COPA ECLIPSAR",
    arena: "orbital",
    element: "ECLIPSE",
    desc: "Circuito de Eclipse — enfrente ECLIPSAR na final e conquiste seu chassi.",
    requiredLevel: 61,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "hexweaver",
            level: 61,
            trained: 0,
          },
          {
            id: "eventhorizon",
            level: 61,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "stormlance",
            level: 62,
            trained: 1,
          },
          {
            id: "lunargeist",
            level: 62,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "gravitide",
            level: 63,
            trained: 2,
          },
          {
            id: "ringwarden",
            level: 63,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — ECLIPSAR",
        enemies: [
          {
            id: "gridrunner",
            level: 64,
            trained: 3,
          },
          {
            id: "hexweaver",
            level: 64,
            trained: 3,
          },
          {
            id: "gloomtide",
            level: 64,
            trained: 3,
          },
          {
            id: "eclipsar",
            level: 65,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 55510,
      xp: 11042,
      robot: "eclipsar",
      item: "mega_repair",
      itemQty: 3,
    },
    replayGold: 14433,
    station: "station_orbital_1",
    x: 1969,
    y: 1476,
  },
  {
    id: "t_frostmonarch",
    name: "COPA FROST MONARCH",
    arena: "frozen",
    element: "GELO",
    desc: "Circuito de Gelo — enfrente FROST MONARCH na final e conquiste seu chassi.",
    requiredLevel: 62,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "maelstromfist",
            level: 62,
            trained: 0,
          },
          {
            id: "venomcarapace",
            level: 62,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "chronowake",
            level: 63,
            trained: 1,
          },
          {
            id: "tundrakeeper",
            level: 63,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "prismvector",
            level: 64,
            trained: 2,
          },
          {
            id: "tundrakeeper",
            level: 64,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — FROST MONARCH",
        enemies: [
          {
            id: "amberlock",
            level: 65,
            trained: 3,
          },
          {
            id: "amberlock",
            level: 65,
            trained: 3,
          },
          {
            id: "magnavore",
            level: 65,
            trained: 3,
          },
          {
            id: "frostmonarch",
            level: 66,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 56505,
      xp: 11241,
      robot: "frostmonarch",
      item: "mega_repair",
      itemQty: 3,
    },
    replayGold: 14691,
    station: "station_frozen_3",
    x: 1687,
    y: 1532,
  },
  {
    id: "t_pyreconclave",
    name: "COPA PYRE CONCLAVE",
    arena: "volcano",
    element: "FOGO",
    desc: "Circuito de Fogo — enfrente PYRE CONCLAVE na final e conquiste seu chassi.",
    requiredLevel: 63,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "scrapbaron",
            level: 63,
            trained: 0,
          },
          {
            id: "vulcanargo",
            level: 63,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "cindercrown",
            level: 64,
            trained: 1,
          },
          {
            id: "venomcarapace",
            level: 64,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "eventhorizon",
            level: 65,
            trained: 2,
          },
          {
            id: "cometfang",
            level: 65,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — PYRE CONCLAVE",
        enemies: [
          {
            id: "basaltguard",
            level: 66,
            trained: 3,
          },
          {
            id: "forgeheart",
            level: 66,
            trained: 3,
          },
          {
            id: "hexweaver",
            level: 66,
            trained: 3,
          },
          {
            id: "pyreconclave",
            level: 67,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 57505,
      xp: 11441,
      robot: "pyreconclave",
      item: "mega_repair",
      itemQty: 3,
    },
    replayGold: 14951,
    station: "station_volcano_1",
    x: 1439,
    y: 1516,
  },
  {
    id: "t_seraphcircuit",
    name: "COPA SERAPH CIRCUIT",
    arena: "sky",
    element: "LUZ",
    desc: "Circuito de Luz — enfrente SERAPH CIRCUIT na final e conquiste seu chassi.",
    requiredLevel: 64,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "lumenblade",
            level: 64,
            trained: 0,
          },
          {
            id: "lumenblade",
            level: 64,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "cloudpiercer",
            level: 65,
            trained: 1,
          },
          {
            id: "stratoveil",
            level: 65,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "lumenblade",
            level: 66,
            trained: 2,
          },
          {
            id: "thunderoni",
            level: 66,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — SERAPH CIRCUIT",
        enemies: [
          {
            id: "cloudpiercer",
            level: 67,
            trained: 3,
          },
          {
            id: "cloudpiercer",
            level: 67,
            trained: 3,
          },
          {
            id: "lumenblade",
            level: 67,
            trained: 3,
          },
          {
            id: "seraphcircuit",
            level: 68,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 58505,
      xp: 11641,
      robot: "seraphcircuit",
      item: "mega_repair",
      itemQty: 3,
    },
    replayGold: 15211,
    station: "station_sky_1",
    x: 1105,
    y: 1489,
  },
  {
    id: "t_ashenrevenant",
    name: "COPA ASHEN REVENANT",
    arena: "volcano",
    element: "CINZAS",
    desc: "Circuito de Cinzas — enfrente ASHEN REVENANT na final e conquiste seu chassi.",
    requiredLevel: 65,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "basaltguard",
            level: 65,
            trained: 0,
          },
          {
            id: "meteorpunch",
            level: 65,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "obsidianfist",
            level: 66,
            trained: 1,
          },
          {
            id: "biolattice",
            level: 66,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "vulcanargo",
            level: 67,
            trained: 2,
          },
          {
            id: "cinderhound",
            level: 67,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — ASHEN REVENANT",
        enemies: [
          {
            id: "basaltguard",
            level: 68,
            trained: 3,
          },
          {
            id: "vulcanargo",
            level: 68,
            trained: 3,
          },
          {
            id: "vulcanargo",
            level: 68,
            trained: 3,
          },
          {
            id: "ashenrevenant",
            level: 69,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 59505,
      xp: 11841,
      robot: "ashenrevenant",
      item: "mega_repair",
      itemQty: 3,
    },
    replayGold: 15471,
    station: "station_volcano_3",
    x: 875,
    y: 1526,
  },
  {
    id: "t_voidsingularity",
    name: "COPA VOID SINGULARITY",
    arena: "orbital",
    element: "BURACO NEGRO",
    desc: "Circuito de Buraco Negro — enfrente VOID SINGULARITY na final e conquiste seu chassi.",
    requiredLevel: 66,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "gravitide",
            level: 66,
            trained: 0,
          },
          {
            id: "emberwing",
            level: 66,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "zephyrblade",
            level: 67,
            trained: 1,
          },
          {
            id: "gridrunner",
            level: 67,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "cosmoveil",
            level: 68,
            trained: 2,
          },
          {
            id: "gridrunner",
            level: 68,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — VOID SINGULARITY",
        enemies: [
          {
            id: "neondrifter",
            level: 69,
            trained: 3,
          },
          {
            id: "nebulaseer",
            level: 69,
            trained: 3,
          },
          {
            id: "neutronmaul",
            level: 69,
            trained: 3,
          },
          {
            id: "voidsingularity",
            level: 70,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 60505,
      xp: 12041,
      robot: "voidsingularity",
      item: "mega_repair",
      itemQty: 3,
    },
    replayGold: 15731,
    station: "station_orbital_1",
    x: 557,
    y: 1477,
  },
  {
    id: "t_quantumecho",
    name: "COPA QUANTUM ECHO",
    arena: "orbital",
    element: "QUANTUM",
    desc: "Circuito de Quantum — enfrente QUANTUM ECHO na final e conquiste seu chassi.",
    requiredLevel: 67,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "magnashrike",
            level: 67,
            trained: 0,
          },
          {
            id: "gridrunner",
            level: 67,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "cometfang",
            level: 68,
            trained: 1,
          },
          {
            id: "nebulaseer",
            level: 68,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "neutronmaul",
            level: 69,
            trained: 2,
          },
          {
            id: "magnashrike",
            level: 69,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — QUANTUM ECHO",
        enemies: [
          {
            id: "gridrunner",
            level: 70,
            trained: 3,
          },
          {
            id: "gravitide",
            level: 70,
            trained: 3,
          },
          {
            id: "neutronmaul",
            level: 70,
            trained: 3,
          },
          {
            id: "quantumecho",
            level: 71,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 61510,
      xp: 12242,
      robot: "quantumecho",
      item: "mega_repair",
      itemQty: 3,
    },
    replayGold: 15993,
    station: "station_orbital_3",
    x: 360,
    y: 1514,
  },
  {
    id: "t_seraphimvoid",
    name: "COPA SERAPHIM VOID",
    arena: "orbital",
    element: "VAZIO",
    desc: "Circuito de Vazio — enfrente SERAPHIM VOID na final e conquiste seu chassi.",
    requiredLevel: 68,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "ashenrevenant",
            level: 68,
            trained: 0,
          },
          {
            id: "cosmoveil",
            level: 68,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "gravitide",
            level: 69,
            trained: 1,
          },
          {
            id: "gravitide",
            level: 69,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "gloomtide",
            level: 70,
            trained: 2,
          },
          {
            id: "eclipsar",
            level: 70,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — SERAPHIM VOID",
        enemies: [
          {
            id: "neutronmaul",
            level: 71,
            trained: 3,
          },
          {
            id: "ironsentinel",
            level: 71,
            trained: 3,
          },
          {
            id: "lunargeist",
            level: 71,
            trained: 3,
          },
          {
            id: "seraphimvoid",
            level: 72,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 62515,
      xp: 12443,
      robot: "seraphimvoid",
      item: "power_chip",
      itemQty: 2,
    },
    replayGold: 16254,
    station: "station_orbital_2",
    x: 358,
    y: 1784,
  },
  {
    id: "t_orbitalmarshal",
    name: "COPA ORBITAL MARSHAL",
    arena: "orbital",
    element: "ANEL",
    desc: "Circuito de Anel — enfrente ORBITAL MARSHAL na final e conquiste seu chassi.",
    requiredLevel: 69,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "voidcaller",
            level: 69,
            trained: 0,
          },
          {
            id: "gravitide",
            level: 69,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "eventhorizon",
            level: 70,
            trained: 1,
          },
          {
            id: "gravitide",
            level: 70,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "obsidianfist",
            level: 71,
            trained: 2,
          },
          {
            id: "pyrokaiser",
            level: 71,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — ORBITAL MARSHAL",
        enemies: [
          {
            id: "gridrunner",
            level: 72,
            trained: 3,
          },
          {
            id: "bioreaper",
            level: 72,
            trained: 3,
          },
          {
            id: "neondrifter",
            level: 72,
            trained: 3,
          },
          {
            id: "orbitalmarshal",
            level: 73,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 63525,
      xp: 12645,
      robot: "orbitalmarshal",
      item: "power_chip",
      itemQty: 2,
    },
    replayGold: 16516,
    station: "station_orbital_2",
    x: 600,
    y: 1782,
  },
  {
    id: "t_titanbulwark",
    name: "COPA TITAN BULWARK",
    arena: "dojo",
    element: "TITA",
    desc: "Circuito de Tita — enfrente TITAN BULWARK na final e conquiste seu chassi.",
    requiredLevel: 71,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "bonemarshal",
            level: 71,
            trained: 0,
          },
          {
            id: "emberfox",
            level: 71,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "dunecrawler",
            level: 72,
            trained: 1,
          },
          {
            id: "obsidianfist",
            level: 72,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "noxfeather",
            level: 73,
            trained: 2,
          },
          {
            id: "sporeherald",
            level: 73,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — TITAN BULWARK",
        enemies: [
          {
            id: "sporeherald",
            level: 74,
            trained: 3,
          },
          {
            id: "terraforge",
            level: 74,
            trained: 3,
          },
          {
            id: "ironsentinel",
            level: 74,
            trained: 3,
          },
          {
            id: "titanbulwark",
            level: 75,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 65545,
      xp: 13049,
      robot: "titanbulwark",
      item: "power_chip",
      itemQty: 2,
    },
    replayGold: 17042,
    station: "station_dojo_2",
    x: 862,
    y: 1759,
  },
  {
    id: "t_terminuscore",
    name: "COPA TERMINUS CORE",
    arena: "orbital",
    element: "QUANTUM",
    desc: "Circuito de Quantum — enfrente TERMINUS CORE na final e conquiste seu chassi.",
    requiredLevel: 72,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "voidsingularity",
            level: 72,
            trained: 0,
          },
          {
            id: "gridrunner",
            level: 72,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "neutronmaul",
            level: 73,
            trained: 1,
          },
          {
            id: "voidcaller",
            level: 73,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "cosmoveil",
            level: 74,
            trained: 2,
          },
          {
            id: "mireclad",
            level: 74,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — TERMINUS CORE",
        enemies: [
          {
            id: "gloomtide",
            level: 75,
            trained: 3,
          },
          {
            id: "ruinwarden",
            level: 75,
            trained: 3,
          },
          {
            id: "voidsingularity",
            level: 75,
            trained: 3,
          },
          {
            id: "terminuscore",
            level: 76,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 66555,
      xp: 13251,
      robot: "terminuscore",
      item: "power_chip",
      itemQty: 2,
    },
    replayGold: 17304,
    station: "station_orbital_3",
    x: 1125,
    y: 1762,
  },
  {
    id: "t_boneorchestra",
    name: "COPA BONE ORCHESTRA",
    arena: "dojo",
    element: "OSSO",
    desc: "Circuito de Osso — enfrente BONE ORCHESTRA na final e conquiste seu chassi.",
    requiredLevel: 73,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "junglemaw",
            level: 73,
            trained: 0,
          },
          {
            id: "vireoblade",
            level: 73,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "junglemaw",
            level: 74,
            trained: 1,
          },
          {
            id: "titanbulwark",
            level: 74,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "sandwyrm",
            level: 75,
            trained: 2,
          },
          {
            id: "biolattice",
            level: 75,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — BONE ORCHESTRA",
        enemies: [
          {
            id: "mossknight",
            level: 76,
            trained: 3,
          },
          {
            id: "tundrakeeper",
            level: 76,
            trained: 3,
          },
          {
            id: "forgeheart",
            level: 76,
            trained: 3,
          },
          {
            id: "boneorchestra",
            level: 77,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 67570,
      xp: 13454,
      robot: "boneorchestra",
      item: "power_chip",
      itemQty: 2,
    },
    replayGold: 17568,
    station: "station_dojo_2",
    x: 1419,
    y: 1774,
  },
  {
    id: "t_ironmonarch",
    name: "COPA IRON MONARCH",
    arena: "dojo",
    element: "FERRO",
    desc: "Circuito de Ferro — enfrente IRON MONARCH na final e conquiste seu chassi.",
    requiredLevel: 74,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "sandwyrm",
            level: 74,
            trained: 0,
          },
          {
            id: "dunecrawler",
            level: 74,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "vireoblade",
            level: 75,
            trained: 1,
          },
          {
            id: "obsidianfist",
            level: 75,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "noxfeather",
            level: 76,
            trained: 2,
          },
          {
            id: "quarrybreaker",
            level: 76,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — IRON MONARCH",
        enemies: [
          {
            id: "terraforge",
            level: 77,
            trained: 3,
          },
          {
            id: "maelstromfist",
            level: 77,
            trained: 3,
          },
          {
            id: "boneorchestra",
            level: 77,
            trained: 3,
          },
          {
            id: "ironmonarch",
            level: 78,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 68580,
      xp: 13656,
      robot: "ironmonarch",
      item: "power_chip",
      itemQty: 2,
    },
    replayGold: 17831,
    station: "station_dojo_1",
    x: 1667,
    y: 1793,
  },
  {
    id: "t_mirageblade",
    name: "COPA MIRAGE BLADE",
    arena: "dojo",
    element: "DESERTO",
    desc: "Circuito de Deserto — enfrente MIRAGE BLADE na final e conquiste seu chassi.",
    requiredLevel: 75,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "aridfang",
            level: 75,
            trained: 0,
          },
          {
            id: "gridrunner",
            level: 75,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "vireoblade",
            level: 76,
            trained: 1,
          },
          {
            id: "lumenblade",
            level: 76,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "mossknight",
            level: 77,
            trained: 2,
          },
          {
            id: "mossknight",
            level: 77,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — MIRAGE BLADE",
        enemies: [
          {
            id: "terraforge",
            level: 78,
            trained: 3,
          },
          {
            id: "vireoblade",
            level: 78,
            trained: 3,
          },
          {
            id: "ruinwarden",
            level: 78,
            trained: 3,
          },
          {
            id: "mirageblade",
            level: 79,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 69600,
      xp: 13860,
      robot: "mirageblade",
      item: "power_chip",
      itemQty: 2,
    },
    replayGold: 18096,
    station: "station_dojo_1",
    x: 1972,
    y: 1726,
  },
  {
    id: "t_crystallux",
    name: "COPA CRYSTALLUX",
    arena: "frozen",
    element: "CRISTAL",
    desc: "Circuito de Cristal — enfrente CRYSTALLUX na final e conquiste seu chassi.",
    requiredLevel: 76,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "magnavore",
            level: 76,
            trained: 0,
          },
          {
            id: "hailstriker",
            level: 76,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "vireoblade",
            level: 77,
            trained: 1,
          },
          {
            id: "tundrakeeper",
            level: 77,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "venomcarapace",
            level: 78,
            trained: 2,
          },
          {
            id: "toxinvore",
            level: 78,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — CRYSTALLUX",
        enemies: [
          {
            id: "amberlock",
            level: 79,
            trained: 3,
          },
          {
            id: "scrapbaron",
            level: 79,
            trained: 3,
          },
          {
            id: "sporeherald",
            level: 79,
            trained: 3,
          },
          {
            id: "crystallux",
            level: 80,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 70615,
      xp: 14063,
      robot: "crystallux",
      item: "power_chip",
      itemQty: 2,
    },
    replayGold: 18360,
    station: "station_frozen_1",
    x: 2171,
    y: 1769,
  },
  {
    id: "t_tempestcrown",
    name: "COPA TEMPEST CROWN",
    arena: "sky",
    element: "TEMPESTADE",
    desc: "Circuito de Tempestade — enfrente TEMPEST CROWN na final e conquiste seu chassi.",
    requiredLevel: 77,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "stratoveil",
            level: 77,
            trained: 0,
          },
          {
            id: "stratoveil",
            level: 77,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "noxfeather",
            level: 78,
            trained: 1,
          },
          {
            id: "windshear",
            level: 78,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "thunderoni",
            level: 79,
            trained: 2,
          },
          {
            id: "thunderoni",
            level: 79,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — TEMPEST CROWN",
        enemies: [
          {
            id: "cloudpiercer",
            level: 80,
            trained: 3,
          },
          {
            id: "lumenblade",
            level: 80,
            trained: 3,
          },
          {
            id: "seraphcircuit",
            level: 80,
            trained: 3,
          },
          {
            id: "tempestcrown",
            level: 81,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 71635,
      xp: 14267,
      robot: "tempestcrown",
      item: "power_chip",
      itemQty: 2,
    },
    replayGold: 18625,
    station: "station_sky_2",
    x: 2446,
    y: 1721,
  },
  {
    id: "t_stelladrake",
    name: "COPA STELLADRAKE",
    arena: "orbital",
    element: "COSMICO",
    desc: "Circuito de Cosmico — enfrente STELLADRAKE na final e conquiste seu chassi.",
    requiredLevel: 78,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "solstitia",
            level: 78,
            trained: 0,
          },
          {
            id: "titanox",
            level: 78,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "cosmoveil",
            level: 79,
            trained: 1,
          },
          {
            id: "magnashrike",
            level: 79,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "eclipsar",
            level: 80,
            trained: 2,
          },
          {
            id: "resinjudge",
            level: 80,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — STELLADRAKE",
        enemies: [
          {
            id: "eventhorizon",
            level: 81,
            trained: 3,
          },
          {
            id: "stormfang",
            level: 81,
            trained: 3,
          },
          {
            id: "magnashrike",
            level: 81,
            trained: 3,
          },
          {
            id: "stelladrake",
            level: 82,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 72655,
      xp: 14471,
      robot: "stelladrake",
      item: "power_chip",
      itemQty: 2,
    },
    replayGold: 18890,
    station: "station_orbital_1",
    x: 2778,
    y: 1778,
  },
  {
    id: "t_graphenex",
    name: "COPA GRAPHENEX",
    arena: "orbital",
    element: "GRAFENO",
    desc: "Circuito de Grafeno — enfrente GRAPHENEX na final e conquiste seu chassi.",
    requiredLevel: 79,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "neutronmaul",
            level: 79,
            trained: 0,
          },
          {
            id: "gloomtide",
            level: 79,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "voidcaller",
            level: 80,
            trained: 1,
          },
          {
            id: "stelladrake",
            level: 80,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "seraphcircuit",
            level: 81,
            trained: 2,
          },
          {
            id: "eclipsar",
            level: 81,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — GRAPHENEX",
        enemies: [
          {
            id: "voidcaller",
            level: 82,
            trained: 3,
          },
          {
            id: "cosmoveil",
            level: 82,
            trained: 3,
          },
          {
            id: "bonemarshal",
            level: 82,
            trained: 3,
          },
          {
            id: "graphenex",
            level: 83,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 73675,
      xp: 14675,
      robot: "graphenex",
      item: "power_chip",
      itemQty: 2,
    },
    replayGold: 19156,
    station: "station_orbital_1",
    x: 3021,
    y: 1762,
  },
  {
    id: "t_reefsovereign",
    name: "COPA REEF SOVEREIGN",
    arena: "frozen",
    element: "RECIFE",
    desc: "Circuito de Recife — enfrente REEF SOVEREIGN na final e conquiste seu chassi.",
    requiredLevel: 81,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "stormlance",
            level: 81,
            trained: 0,
          },
          {
            id: "toxinvore",
            level: 81,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "crystallux",
            level: 82,
            trained: 1,
          },
          {
            id: "tundrakeeper",
            level: 82,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "aridfang",
            level: 83,
            trained: 2,
          },
          {
            id: "nebulaseer",
            level: 83,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — REEF SOVEREIGN",
        enemies: [
          {
            id: "crystallux",
            level: 84,
            trained: 3,
          },
          {
            id: "coralshiv",
            level: 84,
            trained: 3,
          },
          {
            id: "voltronin",
            level: 84,
            trained: 3,
          },
          {
            id: "reefsovereign",
            level: 85,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 75720,
      xp: 15084,
      robot: "reefsovereign",
      item: "power_chip",
      itemQty: 2,
    },
    replayGold: 19687,
    station: "station_frozen_1",
    x: 3303,
    y: 1789,
  },
  {
    id: "t_magnetarfist",
    name: "COPA MAGNETAR FIST",
    arena: "orbital",
    element: "MAGNETISMO",
    desc: "Circuito de Magnetismo — enfrente MAGNETAR FIST na final e conquiste seu chassi.",
    requiredLevel: 82,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "graphenex",
            level: 82,
            trained: 0,
          },
          {
            id: "ironsentinel",
            level: 82,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "neondrifter",
            level: 83,
            trained: 1,
          },
          {
            id: "quantumecho",
            level: 83,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "stelladrake",
            level: 84,
            trained: 2,
          },
          {
            id: "cosmoveil",
            level: 84,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — MAGNETAR FIST",
        enemies: [
          {
            id: "graphenex",
            level: 85,
            trained: 3,
          },
          {
            id: "eclipsar",
            level: 85,
            trained: 3,
          },
          {
            id: "stratoveil",
            level: 85,
            trained: 3,
          },
          {
            id: "magnetarfist",
            level: 86,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 76745,
      xp: 15289,
      robot: "magnetarfist",
      item: "power_chip",
      itemQty: 2,
    },
    replayGold: 19954,
    station: "station_orbital_2",
    x: 3275,
    y: 1987,
  },
  {
    id: "t_nullpriest",
    name: "COPA NULL PRIEST",
    arena: "orbital",
    element: "VAZIO",
    desc: "Circuito de Vazio — enfrente NULL PRIEST na final e conquiste seu chassi.",
    requiredLevel: 83,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "eclipsar",
            level: 83,
            trained: 0,
          },
          {
            id: "cosmoveil",
            level: 83,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "eventhorizon",
            level: 84,
            trained: 1,
          },
          {
            id: "eventhorizon",
            level: 84,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "orbitalmarshal",
            level: 85,
            trained: 2,
          },
          {
            id: "magnashrike",
            level: 85,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — NULL PRIEST",
        enemies: [
          {
            id: "lunargeist",
            level: 86,
            trained: 3,
          },
          {
            id: "gloomtide",
            level: 86,
            trained: 3,
          },
          {
            id: "ringwarden",
            level: 86,
            trained: 3,
          },
          {
            id: "nullpriest",
            level: 87,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 77770,
      xp: 15494,
      robot: "nullpriest",
      item: "power_chip",
      itemQty: 2,
    },
    replayGold: 20220,
    station: "station_orbital_3",
    x: 3055,
    y: 2002,
  },
  {
    id: "t_plasmawraith",
    name: "COPA PLASMA WRAITH",
    arena: "volcano",
    element: "PLASMA",
    desc: "Circuito de Plasma — enfrente PLASMA WRAITH na final e conquiste seu chassi.",
    requiredLevel: 84,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "blastfurnace",
            level: 84,
            trained: 0,
          },
          {
            id: "rustpriest",
            level: 84,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "emberlash",
            level: 85,
            trained: 1,
          },
          {
            id: "ruinwarden",
            level: 85,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "pyreconclave",
            level: 86,
            trained: 2,
          },
          {
            id: "cindercrown",
            level: 86,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — PLASMA WRAITH",
        enemies: [
          {
            id: "vulcanargo",
            level: 87,
            trained: 3,
          },
          {
            id: "cindercrown",
            level: 87,
            trained: 3,
          },
          {
            id: "blastfurnace",
            level: 87,
            trained: 3,
          },
          {
            id: "plasmawraith",
            level: 88,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 78800,
      xp: 15700,
      robot: "plasmawraith",
      item: "power_chip",
      itemQty: 2,
    },
    replayGold: 20488,
    station: "station_volcano_3",
    x: 2720,
    y: 2028,
  },
  {
    id: "t_chronofracture",
    name: "COPA CHRONOFRACTURE",
    arena: "orbital",
    element: "TEMPO",
    desc: "Circuito de Tempo — enfrente CHRONOFRACTURE na final e conquiste seu chassi.",
    requiredLevel: 85,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "magnetarfist",
            level: 85,
            trained: 0,
          },
          {
            id: "orbitalmarshal",
            level: 85,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "vulcanargo",
            level: 86,
            trained: 1,
          },
          {
            id: "cosmoveil",
            level: 86,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "voidcaller",
            level: 87,
            trained: 2,
          },
          {
            id: "nebulaseer",
            level: 87,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — CHRONOFRACTURE",
        enemies: [
          {
            id: "magnetarfist",
            level: 88,
            trained: 3,
          },
          {
            id: "graphenex",
            level: 88,
            trained: 3,
          },
          {
            id: "voltronin",
            level: 88,
            trained: 3,
          },
          {
            id: "chronofracture",
            level: 89,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 79825,
      xp: 15905,
      robot: "chronofracture",
      item: "revive_core",
      itemQty: 2,
    },
    replayGold: 20754,
    station: "station_orbital_1",
    x: 2478,
    y: 2002,
  },
  {
    id: "t_zephyrhalo",
    name: "COPA ZEPHYR HALO",
    arena: "sky",
    element: "VENTO",
    desc: "Circuito de Vento — enfrente ZEPHYR HALO na final e conquiste seu chassi.",
    requiredLevel: 86,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "magnashrike",
            level: 86,
            trained: 0,
          },
          {
            id: "heliondriver",
            level: 86,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "windshear",
            level: 87,
            trained: 1,
          },
          {
            id: "stratoveil",
            level: 87,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "stormfang",
            level: 88,
            trained: 2,
          },
          {
            id: "heliondriver",
            level: 88,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — ZEPHYR HALO",
        enemies: [
          {
            id: "windshear",
            level: 89,
            trained: 3,
          },
          {
            id: "heliondriver",
            level: 89,
            trained: 3,
          },
          {
            id: "heliondriver",
            level: 89,
            trained: 3,
          },
          {
            id: "zephyrhalo",
            level: 90,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 80855,
      xp: 16111,
      robot: "zephyrhalo",
      item: "revive_core",
      itemQty: 2,
    },
    replayGold: 21022,
    station: "station_sky_3",
    x: 2239,
    y: 1999,
  },
  {
    id: "t_permafrostmk",
    name: "COPA PERMAFROST MK",
    arena: "frozen",
    element: "TUNDRA",
    desc: "Circuito de Tundra — enfrente PERMAFROST MK na final e conquiste seu chassi.",
    requiredLevel: 87,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "toxinvore",
            level: 87,
            trained: 0,
          },
          {
            id: "heliondriver",
            level: 87,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "seraphcircuit",
            level: 88,
            trained: 1,
          },
          {
            id: "maelstromfist",
            level: 88,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "emberlash",
            level: 89,
            trained: 2,
          },
          {
            id: "prismvector",
            level: 89,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — PERMAFROST MK",
        enemies: [
          {
            id: "mireclad",
            level: 90,
            trained: 3,
          },
          {
            id: "stratoveil",
            level: 90,
            trained: 3,
          },
          {
            id: "crystallux",
            level: 90,
            trained: 3,
          },
          {
            id: "permafrostmk",
            level: 91,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 81885,
      xp: 16317,
      robot: "permafrostmk",
      item: "revive_core",
      itemQty: 2,
    },
    replayGold: 21290,
    station: "station_frozen_2",
    x: 1978,
    y: 1994,
  },
  {
    id: "t_voltcarnyx",
    name: "COPA VOLTCARNYX",
    arena: "sky",
    element: "TROVAO",
    desc: "Circuito de Trovao — enfrente VOLTCARNYX na final e conquiste seu chassi.",
    requiredLevel: 89,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "bioreaper",
            level: 89,
            trained: 0,
          },
          {
            id: "thunderoni",
            level: 89,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "zephyrhalo",
            level: 90,
            trained: 1,
          },
          {
            id: "coralshiv",
            level: 90,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "boneorchestra",
            level: 91,
            trained: 2,
          },
          {
            id: "lumenblade",
            level: 91,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — VOLTCARNYX",
        enemies: [
          {
            id: "heliondriver",
            level: 92,
            trained: 3,
          },
          {
            id: "lumenblade",
            level: 92,
            trained: 3,
          },
          {
            id: "tempestcrown",
            level: 92,
            trained: 3,
          },
          {
            id: "voltcarnyx",
            level: 93,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 83955,
      xp: 16731,
      robot: "voltcarnyx",
      item: "revive_core",
      itemQty: 2,
    },
    replayGold: 21828,
    station: "station_sky_1",
    x: 1709,
    y: 1988,
  },
  {
    id: "t_jadearbiter",
    name: "COPA JADE ARBITER",
    arena: "dojo",
    element: "JADE",
    desc: "Circuito de Jade — enfrente JADE ARBITER na final e conquiste seu chassi.",
    requiredLevel: 90,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "frostmonarch",
            level: 90,
            trained: 0,
          },
          {
            id: "mossknight",
            level: 90,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "junglemaw",
            level: 91,
            trained: 1,
          },
          {
            id: "snowreaver",
            level: 91,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "hailstriker",
            level: 92,
            trained: 2,
          },
          {
            id: "solstitia",
            level: 92,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — JADE ARBITER",
        enemies: [
          {
            id: "titanbulwark",
            level: 93,
            trained: 3,
          },
          {
            id: "magnetarfist",
            level: 93,
            trained: 3,
          },
          {
            id: "hailstriker",
            level: 93,
            trained: 3,
          },
          {
            id: "jadearbiter",
            level: 94,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 84985,
      xp: 16937,
      robot: "jadearbiter",
      item: "revive_core",
      itemQty: 2,
    },
    replayGold: 22096,
    station: "station_dojo_1",
    x: 1359,
    y: 2010,
  },
  {
    id: "t_mirrorclad",
    name: "COPA MIRRORCLAD",
    arena: "frozen",
    element: "ESPELHO",
    desc: "Circuito de Espelho — enfrente MIRRORCLAD na final e conquiste seu chassi.",
    requiredLevel: 91,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "prismvector",
            level: 91,
            trained: 0,
          },
          {
            id: "bogtyrant",
            level: 91,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "maelstromfist",
            level: 92,
            trained: 1,
          },
          {
            id: "reefsovereign",
            level: 92,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "permafrostmk",
            level: 93,
            trained: 2,
          },
          {
            id: "toxinvore",
            level: 93,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — MIRRORCLAD",
        enemies: [
          {
            id: "reefsovereign",
            level: 94,
            trained: 3,
          },
          {
            id: "venomcarapace",
            level: 94,
            trained: 3,
          },
          {
            id: "dunecrawler",
            level: 94,
            trained: 3,
          },
          {
            id: "mirrorclad",
            level: 95,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 86025,
      xp: 17145,
      robot: "mirrorclad",
      item: "revive_core",
      itemQty: 2,
    },
    replayGold: 22366,
    station: "station_frozen_1",
    x: 1103,
    y: 2023,
  },
  {
    id: "t_solarixprime",
    name: "COPA SOLARIX PRIME",
    arena: "sky",
    element: "SOL",
    desc: "Circuito de Sol — enfrente SOLARIX PRIME na final e conquiste seu chassi.",
    requiredLevel: 92,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "windshear",
            level: 92,
            trained: 0,
          },
          {
            id: "lumenblade",
            level: 92,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "heliondriver",
            level: 93,
            trained: 1,
          },
          {
            id: "cryolance",
            level: 93,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "stratoveil",
            level: 94,
            trained: 2,
          },
          {
            id: "windshear",
            level: 94,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — SOLARIX PRIME",
        enemies: [
          {
            id: "shadowfang",
            level: 95,
            trained: 3,
          },
          {
            id: "cloudpiercer",
            level: 95,
            trained: 3,
          },
          {
            id: "sporeherald",
            level: 95,
            trained: 3,
          },
          {
            id: "solarixprime",
            level: 96,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 87060,
      xp: 17352,
      robot: "solarixprime",
      item: "revive_core",
      itemQty: 2,
    },
    replayGold: 22636,
    station: "station_sky_1",
    x: 899,
    y: 1976,
  },
  {
    id: "t_abyssalord",
    name: "COPA ABYSSA LORD",
    arena: "orbital",
    element: "ABISSO",
    desc: "Circuito de Abisso — enfrente ABYSSA LORD na final e conquiste seu chassi.",
    requiredLevel: 93,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "solstitia",
            level: 93,
            trained: 0,
          },
          {
            id: "gloomtide",
            level: 93,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "eclipsar",
            level: 94,
            trained: 1,
          },
          {
            id: "chronofracture",
            level: 94,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "gridrunner",
            level: 95,
            trained: 2,
          },
          {
            id: "ringwarden",
            level: 95,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — ABYSSA LORD",
        enemies: [
          {
            id: "graphenex",
            level: 96,
            trained: 3,
          },
          {
            id: "shadowfang",
            level: 96,
            trained: 3,
          },
          {
            id: "gridrunner",
            level: 96,
            trained: 3,
          },
          {
            id: "abyssalord",
            level: 97,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 88100,
      xp: 17560,
      robot: "abyssalord",
      item: "revive_core",
      itemQty: 2,
    },
    replayGold: 22906,
    station: "station_orbital_2",
    x: 560,
    y: 2031,
  },
  {
    id: "t_aetherloom",
    name: "COPA AETHER LOOM",
    arena: "orbital",
    element: "NEBULOSA",
    desc: "Circuito de Nebulosa — enfrente AETHER LOOM na final e conquiste seu chassi.",
    requiredLevel: 94,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "ironmonk",
            level: 94,
            trained: 0,
          },
          {
            id: "emberwing",
            level: 94,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "pyreconclave",
            level: 95,
            trained: 1,
          },
          {
            id: "abyssalord",
            level: 95,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "hailstriker",
            level: 96,
            trained: 2,
          },
          {
            id: "ringwarden",
            level: 96,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — AETHER LOOM",
        enemies: [
          {
            id: "amberlock",
            level: 97,
            trained: 3,
          },
          {
            id: "nullpriest",
            level: 97,
            trained: 3,
          },
          {
            id: "hailstriker",
            level: 97,
            trained: 3,
          },
          {
            id: "aetherloom",
            level: 98,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 89135,
      xp: 17767,
      robot: "aetherloom",
      item: "revive_core",
      itemQty: 2,
    },
    replayGold: 23175,
    station: "station_orbital_3",
    x: 303,
    y: 2033,
  },
  {
    id: "t_quicksilverr",
    name: "COPA QUICKSILVER",
    arena: "frozen",
    element: "ESPELHO",
    desc: "Circuito de Espelho — enfrente QUICKSILVER na final e conquiste seu chassi.",
    requiredLevel: 96,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "permafrostmk",
            level: 96,
            trained: 0,
          },
          {
            id: "voidcaller",
            level: 96,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "frostmonarch",
            level: 97,
            trained: 1,
          },
          {
            id: "tundrakeeper",
            level: 97,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "venomcarapace",
            level: 98,
            trained: 2,
          },
          {
            id: "acidbloom",
            level: 98,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — QUICKSILVER",
        enemies: [
          {
            id: "mireclad",
            level: 99,
            trained: 3,
          },
          {
            id: "frostmonarch",
            level: 99,
            trained: 3,
          },
          {
            id: "cosmoveil",
            level: 99,
            trained: 3,
          },
          {
            id: "quicksilverr",
            level: 99,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 91220,
      xp: 18184,
      robot: "quicksilverr",
      item: "revive_core",
      itemQty: 2,
    },
    replayGold: 23717,
    station: "station_frozen_2",
    x: 360,
    y: 2250,
  },
  {
    id: "t_ravenousbloom",
    name: "COPA RAVENOUS BLOOM",
    arena: "dojo",
    element: "BIO",
    desc: "Circuito de Bio — enfrente RAVENOUS BLOOM na final e conquiste seu chassi.",
    requiredLevel: 97,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "bonemarshal",
            level: 97,
            trained: 0,
          },
          {
            id: "heliondriver",
            level: 97,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "ironmonk",
            level: 98,
            trained: 1,
          },
          {
            id: "ringwarden",
            level: 98,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "titanbulwark",
            level: 99,
            trained: 2,
          },
          {
            id: "biolattice",
            level: 99,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — RAVENOUS BLOOM",
        enemies: [
          {
            id: "aetherloom",
            level: 100,
            trained: 3,
          },
          {
            id: "sandwyrm",
            level: 100,
            trained: 3,
          },
          {
            id: "quarrybreaker",
            level: 100,
            trained: 3,
          },
          {
            id: "ravenousbloom",
            level: 99,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 92260,
      xp: 18392,
      robot: "ravenousbloom",
      item: "revive_core",
      itemQty: 2,
    },
    replayGold: 23988,
    station: "station_dojo_1",
    x: 578,
    y: 2284,
  },
  {
    id: "t_lavabastion",
    name: "COPA LAVA BASTION",
    arena: "volcano",
    element: "VULCAO",
    desc: "Circuito de Vulcao — enfrente LAVA BASTION na final e conquiste seu chassi.",
    requiredLevel: 98,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "cinderhound",
            level: 98,
            trained: 0,
          },
          {
            id: "scrapbaron",
            level: 98,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "amberlock",
            level: 99,
            trained: 1,
          },
          {
            id: "obsidianfist",
            level: 99,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "ashenrevenant",
            level: 100,
            trained: 2,
          },
          {
            id: "grimsprocket",
            level: 100,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — LAVA BASTION",
        enemies: [
          {
            id: "meteorpunch",
            level: 101,
            trained: 3,
          },
          {
            id: "rustpriest",
            level: 101,
            trained: 3,
          },
          {
            id: "toxinvore",
            level: 101,
            trained: 3,
          },
          {
            id: "lavabastion",
            level: 99,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 93305,
      xp: 18601,
      robot: "lavabastion",
      item: "revive_core",
      itemQty: 2,
    },
    replayGold: 24259,
    station: "station_volcano_1",
    x: 851,
    y: 2298,
  },
  {
    id: "t_pulsarcore",
    name: "COPA PULSAR CORE",
    arena: "orbital",
    element: "PULSAR",
    desc: "Circuito de Pulsar — enfrente PULSAR CORE na final e conquiste seu chassi.",
    requiredLevel: 99,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "meteorpunch",
            level: 99,
            trained: 0,
          },
          {
            id: "ringwarden",
            level: 99,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "voidsingularity",
            level: 100,
            trained: 1,
          },
          {
            id: "stelladrake",
            level: 100,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "seraphimvoid",
            level: 101,
            trained: 2,
          },
          {
            id: "basaltguard",
            level: 101,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — PULSAR CORE",
        enemies: [
          {
            id: "gloomtide",
            level: 102,
            trained: 3,
          },
          {
            id: "aetherloom",
            level: 102,
            trained: 3,
          },
          {
            id: "eclipsar",
            level: 102,
            trained: 3,
          },
          {
            id: "pulsarcore",
            level: 99,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 94350,
      xp: 18810,
      robot: "pulsarcore",
      item: "revive_core",
      itemQty: 2,
    },
    replayGold: 24531,
    station: "station_orbital_2",
    x: 1132,
    y: 2255,
  },
  // --- TORNEIOS 220 ---
  {
    id: "t_glasscicada",
    name: "COPA GLASS CICADA",
    arena: "frozen",
    element: "VIDRO",
    desc: "Circuito de Vidro — enfrente GLASS CICADA na final e conquiste seu chassi.",
    requiredLevel: 2,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "jadearbiter",
            level: 2,
            trained: 0,
          },
          {
            id: "cometfang",
            level: 2,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "amberlock",
            level: 3,
            trained: 1,
          },
          {
            id: "tempestcrown",
            level: 3,
            trained: 1,
          },
        ],
      },
      {
        name: "FINAL — GLASS CICADA",
        enemies: [
          {
            id: "aridfang",
            level: 4,
            trained: 2,
          },
          {
            id: "pulsarcore",
            level: 4,
            trained: 2,
          },
          {
            id: "titanox",
            level: 4,
            trained: 2,
          },
          {
            id: "glasscicada",
            level: 6,
            trained: 3,
          },
        ],
      },
    ],
    reward: {
      gold: 1845,
      xp: 289,
      robot: "glasscicada",
      item: "repair_kit",
      itemQty: 3,
    },
    replayGold: 480,
    station: "station_frozen_3",
    x: 286,
    y: 2918,
  },
  {
    id: "t_swiftgale",
    name: "COPA SWIFT GALE",
    arena: "dojo",
    element: "BRISA",
    desc: "Circuito de Brisa — enfrente SWIFT GALE na final e conquiste seu chassi.",
    requiredLevel: 2,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "boneorchestra",
            level: 2,
            trained: 0,
          },
          {
            id: "mirageblade",
            level: 2,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "bonemarshal",
            level: 3,
            trained: 1,
          },
          {
            id: "sporeherald",
            level: 3,
            trained: 1,
          },
        ],
      },
      {
        name: "FINAL — SWIFT GALE",
        enemies: [
          {
            id: "mirageblade",
            level: 4,
            trained: 2,
          },
          {
            id: "ironsentinel",
            level: 4,
            trained: 2,
          },
          {
            id: "bonemarshal",
            level: 4,
            trained: 2,
          },
          {
            id: "swiftgale",
            level: 6,
            trained: 3,
          },
        ],
      },
    ],
    reward: {
      gold: 1845,
      xp: 289,
      robot: "swiftgale",
      item: "repair_kit",
      itemQty: 3,
    },
    replayGold: 480,
    station: "station_dojo_1",
    x: 559,
    y: 2883,
  },
  {
    id: "t_scrapjaw",
    name: "COPA SCRAPJAW",
    arena: "dojo",
    element: "SUCATA",
    desc: "Circuito de Sucata — enfrente SCRAPJAW na final e conquiste seu chassi.",
    requiredLevel: 3,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "shadowfang",
            level: 3,
            trained: 0,
          },
          {
            id: "venomcarapace",
            level: 3,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "boneorchestra",
            level: 4,
            trained: 1,
          },
          {
            id: "ironmonarch",
            level: 4,
            trained: 1,
          },
        ],
      },
      {
        name: "FINAL — SCRAPJAW",
        enemies: [
          {
            id: "mossknight",
            level: 5,
            trained: 2,
          },
          {
            id: "aurorion",
            level: 5,
            trained: 2,
          },
          {
            id: "boneorchestra",
            level: 5,
            trained: 2,
          },
          {
            id: "scrapjaw",
            level: 7,
            trained: 3,
          },
        ],
      },
    ],
    reward: {
      gold: 2660,
      xp: 452,
      robot: "scrapjaw",
      item: "repair_kit",
      itemQty: 3,
    },
    replayGold: 692,
    station: "station_dojo_2",
    x: 878,
    y: 2918,
  },
  {
    id: "t_steelmonk",
    name: "COPA IRON MONK",
    arena: "dojo",
    element: "DISCIPLINA",
    desc: "Circuito de Disciplina — enfrente IRON MONK na final e conquiste seu chassi.",
    requiredLevel: 4,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "titanbulwark",
            level: 4,
            trained: 0,
          },
          {
            id: "tundrakeeper",
            level: 4,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "aridfang",
            level: 5,
            trained: 1,
          },
          {
            id: "quarrybreaker",
            level: 5,
            trained: 1,
          },
        ],
      },
      {
        name: "FINAL — IRON MONK",
        enemies: [
          {
            id: "junglemaw",
            level: 6,
            trained: 2,
          },
          {
            id: "stormlance",
            level: 6,
            trained: 2,
          },
          {
            id: "biolattice",
            level: 6,
            trained: 2,
          },
          {
            id: "steelmonk",
            level: 8,
            trained: 3,
          },
        ],
      },
    ],
    reward: {
      gold: 3500,
      xp: 620,
      robot: "steelmonk",
      item: "repair_kit",
      itemQty: 3,
    },
    replayGold: 910,
    station: "station_dojo_1",
    x: 1115,
    y: 2921,
  },
  {
    id: "t_boulderox",
    name: "COPA BOULDER OX",
    arena: "dojo",
    element: "ROCHA",
    desc: "Circuito de Rocha — enfrente BOULDER OX na final e conquiste seu chassi.",
    requiredLevel: 4,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "ravenousbloom",
            level: 4,
            trained: 0,
          },
          {
            id: "meteorpunch",
            level: 4,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "terrabyte",
            level: 5,
            trained: 1,
          },
          {
            id: "mirrorclad",
            level: 5,
            trained: 1,
          },
        ],
      },
      {
        name: "FINAL — BOULDER OX",
        enemies: [
          {
            id: "ravenousbloom",
            level: 6,
            trained: 2,
          },
          {
            id: "swiftgale",
            level: 6,
            trained: 2,
          },
          {
            id: "dunecrawler",
            level: 6,
            trained: 2,
          },
          {
            id: "boulderox",
            level: 8,
            trained: 3,
          },
        ],
      },
    ],
    reward: {
      gold: 3500,
      xp: 620,
      robot: "boulderox",
      item: "repair_kit",
      itemQty: 3,
    },
    replayGold: 910,
    station: "station_dojo_1",
    x: 1366,
    y: 2886,
  },
  {
    id: "t_bramblewrath",
    name: "COPA BRAMBLE WRATH",
    arena: "dojo",
    element: "ESPINHO",
    desc: "Circuito de Espinho — enfrente BRAMBLE WRATH na final e conquiste seu chassi.",
    requiredLevel: 5,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "vireoblade",
            level: 5,
            trained: 0,
          },
          {
            id: "ravenousbloom",
            level: 5,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "hailstriker",
            level: 6,
            trained: 1,
          },
          {
            id: "hydroknight",
            level: 6,
            trained: 1,
          },
        ],
      },
      {
        name: "FINAL — BRAMBLE WRATH",
        enemies: [
          {
            id: "snowreaver",
            level: 7,
            trained: 2,
          },
          {
            id: "quicksilverr",
            level: 7,
            trained: 2,
          },
          {
            id: "noxfeather",
            level: 7,
            trained: 2,
          },
          {
            id: "bramblewrath",
            level: 9,
            trained: 3,
          },
        ],
      },
    ],
    reward: {
      gold: 4365,
      xp: 793,
      robot: "bramblewrath",
      item: "repair_kit",
      itemQty: 3,
    },
    replayGold: 1135,
    station: "station_dojo_1",
    x: 1686,
    y: 2924,
  },
  {
    id: "t_mycelor",
    name: "COPA MYCELOR",
    arena: "dojo",
    element: "FUNGO",
    desc: "Circuito de Fungo — enfrente MYCELOR na final e conquiste seu chassi.",
    requiredLevel: 6,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "mossknight",
            level: 6,
            trained: 0,
          },
          {
            id: "titanbulwark",
            level: 6,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "permafrostmk",
            level: 7,
            trained: 1,
          },
          {
            id: "boneorchestra",
            level: 7,
            trained: 1,
          },
        ],
      },
      {
        name: "FINAL — MYCELOR",
        enemies: [
          {
            id: "shadowfang",
            level: 8,
            trained: 2,
          },
          {
            id: "sporeherald",
            level: 8,
            trained: 2,
          },
          {
            id: "ringwarden",
            level: 8,
            trained: 2,
          },
          {
            id: "mycelor",
            level: 10,
            trained: 3,
          },
        ],
      },
    ],
    reward: {
      gold: 5245,
      xp: 969,
      robot: "mycelor",
      item: "repair_kit",
      itemQty: 3,
    },
    replayGold: 1364,
    station: "station_dojo_2",
    x: 1929,
    y: 2899,
  },
  {
    id: "t_wispkin",
    name: "COPA WISPKIN",
    arena: "dojo",
    element: "ESPIRITO",
    desc: "Circuito de Espirito — enfrente WISPKIN na final e conquiste seu chassi.",
    requiredLevel: 7,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "boneorchestra",
            level: 7,
            trained: 0,
          },
          {
            id: "reefsovereign",
            level: 7,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "shadowfang",
            level: 8,
            trained: 1,
          },
          {
            id: "boulderox",
            level: 8,
            trained: 1,
          },
        ],
      },
      {
        name: "FINAL — WISPKIN",
        enemies: [
          {
            id: "snowreaver",
            level: 9,
            trained: 2,
          },
          {
            id: "mossknight",
            level: 9,
            trained: 2,
          },
          {
            id: "shadowfang",
            level: 9,
            trained: 2,
          },
          {
            id: "wispkin",
            level: 11,
            trained: 3,
          },
        ],
      },
    ],
    reward: {
      gold: 6140,
      xp: 1148,
      robot: "wispkin",
      item: "repair_kit",
      itemQty: 3,
    },
    replayGold: 1596,
    station: "station_dojo_2",
    x: 2178,
    y: 2921,
  },
  {
    id: "t_stonewhisker",
    name: "COPA STONE WHISKER",
    arena: "dojo",
    element: "GRANITO",
    desc: "Circuito de Granito — enfrente STONE WHISKER na final e conquiste seu chassi.",
    requiredLevel: 7,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "mirageblade",
            level: 7,
            trained: 0,
          },
          {
            id: "stormfang",
            level: 7,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "neutronmaul",
            level: 8,
            trained: 1,
          },
          {
            id: "boneorchestra",
            level: 8,
            trained: 1,
          },
        ],
      },
      {
        name: "FINAL — STONE WHISKER",
        enemies: [
          {
            id: "terraforge",
            level: 9,
            trained: 2,
          },
          {
            id: "sporeherald",
            level: 9,
            trained: 2,
          },
          {
            id: "gridrunner",
            level: 9,
            trained: 2,
          },
          {
            id: "stonewhisker",
            level: 11,
            trained: 3,
          },
        ],
      },
    ],
    reward: {
      gold: 6140,
      xp: 1148,
      robot: "stonewhisker",
      item: "repair_kit",
      itemQty: 3,
    },
    replayGold: 1596,
    station: "station_dojo_3",
    x: 2444,
    y: 2873,
  },
  {
    id: "t_bogmire",
    name: "COPA BOGMIRE",
    arena: "frozen",
    element: "PANTANO",
    desc: "Circuito de Pantano — enfrente BOGMIRE na final e conquiste seu chassi.",
    requiredLevel: 8,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "snowreaver",
            level: 8,
            trained: 0,
          },
          {
            id: "resinjudge",
            level: 8,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "reefsovereign",
            level: 9,
            trained: 1,
          },
          {
            id: "quicksilverr",
            level: 9,
            trained: 1,
          },
        ],
      },
      {
        name: "FINAL — BOGMIRE",
        enemies: [
          {
            id: "amberlock",
            level: 10,
            trained: 2,
          },
          {
            id: "abyssalord",
            level: 10,
            trained: 2,
          },
          {
            id: "crystallux",
            level: 10,
            trained: 2,
          },
          {
            id: "bogmire",
            level: 12,
            trained: 3,
          },
        ],
      },
    ],
    reward: {
      gold: 7050,
      xp: 1330,
      robot: "bogmire",
      item: "repair_kit",
      itemQty: 3,
    },
    replayGold: 1833,
    station: "station_frozen_3",
    x: 2767,
    y: 2899,
  },
  {
    id: "t_cobblegolem",
    name: "COPA COBBLE GOLEM",
    arena: "dojo",
    element: "PEDRA",
    desc: "Circuito de Pedra — enfrente COBBLE GOLEM na final e conquiste seu chassi.",
    requiredLevel: 9,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "vireoblade",
            level: 9,
            trained: 0,
          },
          {
            id: "scrapjaw",
            level: 9,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "mossknight",
            level: 10,
            trained: 1,
          },
          {
            id: "bonemarshal",
            level: 10,
            trained: 1,
          },
        ],
      },
      {
        name: "FINAL — COBBLE GOLEM",
        enemies: [
          {
            id: "ravenousbloom",
            level: 11,
            trained: 2,
          },
          {
            id: "mycelor",
            level: 11,
            trained: 2,
          },
          {
            id: "sporeherald",
            level: 11,
            trained: 2,
          },
          {
            id: "cobblegolem",
            level: 13,
            trained: 3,
          },
        ],
      },
    ],
    reward: {
      gold: 7970,
      xp: 1514,
      robot: "cobblegolem",
      item: "repair_kit",
      itemQty: 3,
    },
    replayGold: 2072,
    station: "station_dojo_3",
    x: 3049,
    y: 2925,
  },
  {
    id: "t_frostpike",
    name: "COPA FROST PIKE",
    arena: "frozen",
    element: "GEADA",
    desc: "Circuito de Geada — enfrente FROST PIKE na final e conquiste seu chassi.",
    requiredLevel: 10,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "cloudpiercer",
            level: 10,
            trained: 0,
          },
          {
            id: "prismvector",
            level: 10,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "permafrostmk",
            level: 11,
            trained: 1,
          },
          {
            id: "glasscicada",
            level: 11,
            trained: 1,
          },
        ],
      },
      {
        name: "FINAL — FROST PIKE",
        enemies: [
          {
            id: "toxinvore",
            level: 12,
            trained: 2,
          },
          {
            id: "graphenex",
            level: 12,
            trained: 2,
          },
          {
            id: "nebulon",
            level: 12,
            trained: 2,
          },
          {
            id: "frostpike",
            level: 14,
            trained: 3,
          },
        ],
      },
    ],
    reward: {
      gold: 8900,
      xp: 1700,
      robot: "frostpike",
      item: "repair_kit",
      itemQty: 3,
    },
    replayGold: 2314,
    station: "station_frozen_2",
    x: 3292,
    y: 2900,
  },
  {
    id: "t_mudlarker",
    name: "COPA MUDLARKER",
    arena: "dojo",
    element: "LODO",
    desc: "Circuito de Lodo — enfrente MUDLARKER na final e conquiste seu chassi.",
    requiredLevel: 11,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "hailstriker",
            level: 11,
            trained: 0,
          },
          {
            id: "frostmonarch",
            level: 11,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "ironmonarch",
            level: 12,
            trained: 1,
          },
          {
            id: "wispkin",
            level: 12,
            trained: 1,
          },
        ],
      },
      {
        name: "FINAL — MUDLARKER",
        enemies: [
          {
            id: "boneorchestra",
            level: 13,
            trained: 2,
          },
          {
            id: "scrapjaw",
            level: 13,
            trained: 2,
          },
          {
            id: "quicksilverr",
            level: 13,
            trained: 2,
          },
          {
            id: "mudlarker",
            level: 15,
            trained: 3,
          },
        ],
      },
    ],
    reward: {
      gold: 9835,
      xp: 1887,
      robot: "mudlarker",
      item: "repair_kit",
      itemQty: 3,
    },
    replayGold: 2557,
    station: "station_dojo_3",
    x: 3247,
    y: 3164,
  },
  {
    id: "t_rustsaurus",
    name: "COPA RUSTSAURUS",
    arena: "volcano",
    element: "FERRUGEM",
    desc: "Circuito de Ferrugem — enfrente RUSTSAURUS na final e conquiste seu chassi.",
    requiredLevel: 11,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "magnetarfist",
            level: 11,
            trained: 0,
          },
          {
            id: "stratoveil",
            level: 11,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "vulcanargo",
            level: 12,
            trained: 1,
          },
          {
            id: "titanbulwark",
            level: 12,
            trained: 1,
          },
        ],
      },
      {
        name: "FINAL — RUSTSAURUS",
        enemies: [
          {
            id: "meteorpunch",
            level: 13,
            trained: 2,
          },
          {
            id: "terraforge",
            level: 13,
            trained: 2,
          },
          {
            id: "ferrovax",
            level: 13,
            trained: 2,
          },
          {
            id: "rustsaurus",
            level: 15,
            trained: 3,
          },
        ],
      },
    ],
    reward: {
      gold: 9835,
      xp: 1887,
      robot: "rustsaurus",
      item: "repair_kit",
      itemQty: 3,
    },
    replayGold: 2557,
    station: "station_volcano_2",
    x: 3020,
    y: 3113,
  },
  {
    id: "t_kelpwarden",
    name: "COPA KELP WARDEN",
    arena: "dojo",
    element: "ALGA",
    desc: "Circuito de Alga — enfrente KELP WARDEN na final e conquiste seu chassi.",
    requiredLevel: 12,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "ravenousbloom",
            level: 12,
            trained: 0,
          },
          {
            id: "titanbulwark",
            level: 12,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "stonewhisker",
            level: 13,
            trained: 1,
          },
          {
            id: "seraphcircuit",
            level: 13,
            trained: 1,
          },
        ],
      },
      {
        name: "FINAL — KELP WARDEN",
        enemies: [
          {
            id: "mudlarker",
            level: 14,
            trained: 2,
          },
          {
            id: "ravenousbloom",
            level: 14,
            trained: 2,
          },
          {
            id: "lavabastion",
            level: 14,
            trained: 2,
          },
          {
            id: "kelpwarden",
            level: 16,
            trained: 3,
          },
        ],
      },
    ],
    reward: {
      gold: 10785,
      xp: 2077,
      robot: "kelpwarden",
      item: "repair_kit",
      itemQty: 3,
    },
    replayGold: 2804,
    station: "station_dojo_1",
    x: 2770,
    y: 3112,
  },
  {
    id: "t_boilerbrute",
    name: "COPA BOILER BRUTE",
    arena: "dojo",
    element: "VAPOR",
    desc: "Circuito de Vapor — enfrente BOILER BRUTE na final e conquiste seu chassi.",
    requiredLevel: 13,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "biolattice",
            level: 13,
            trained: 0,
          },
          {
            id: "shadowfang",
            level: 13,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "steelmonk",
            level: 14,
            trained: 1,
          },
          {
            id: "venomcarapace",
            level: 14,
            trained: 1,
          },
        ],
      },
      {
        name: "FINAL — BOILER BRUTE",
        enemies: [
          {
            id: "acidra",
            level: 15,
            trained: 2,
          },
          {
            id: "mudlarker",
            level: 15,
            trained: 2,
          },
          {
            id: "forgeheart",
            level: 15,
            trained: 2,
          },
          {
            id: "boilerbrute",
            level: 17,
            trained: 3,
          },
        ],
      },
    ],
    reward: {
      gold: 11740,
      xp: 2268,
      robot: "boilerbrute",
      item: "repair_kit",
      itemQty: 3,
    },
    replayGold: 3052,
    station: "station_dojo_3",
    x: 2486,
    y: 3123,
  },
  {
    id: "t_boltbunny",
    name: "COPA BOLT BUNNY",
    arena: "dojo",
    element: "FAISCA",
    desc: "Circuito de Faisca — enfrente BOLT BUNNY na final e conquiste seu chassi.",
    requiredLevel: 14,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "bramblewrath",
            level: 14,
            trained: 0,
          },
          {
            id: "terminuscore",
            level: 14,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "terraforge",
            level: 15,
            trained: 1,
          },
          {
            id: "wispkin",
            level: 15,
            trained: 1,
          },
        ],
      },
      {
        name: "FINAL — BOLT BUNNY",
        enemies: [
          {
            id: "mirageblade",
            level: 16,
            trained: 2,
          },
          {
            id: "prismvector",
            level: 16,
            trained: 2,
          },
          {
            id: "cinderhound",
            level: 16,
            trained: 2,
          },
          {
            id: "boltbunny",
            level: 18,
            trained: 3,
          },
        ],
      },
    ],
    reward: {
      gold: 12705,
      xp: 2461,
      robot: "boltbunny",
      item: "repair_kit",
      itemQty: 3,
    },
    replayGold: 3303,
    station: "station_dojo_2",
    x: 2222,
    y: 3184,
  },
  {
    id: "t_solderjack",
    name: "COPA SOLDER JACK",
    arena: "dojo",
    element: "SOLDA",
    desc: "Circuito de Solda — enfrente SOLDER JACK na final e conquiste seu chassi.",
    requiredLevel: 15,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "quarrybreaker",
            level: 15,
            trained: 0,
          },
          {
            id: "terrabyte",
            level: 15,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "biolattice",
            level: 16,
            trained: 1,
          },
          {
            id: "voltronin",
            level: 16,
            trained: 1,
          },
        ],
      },
      {
        name: "FINAL — SOLDER JACK",
        enemies: [
          {
            id: "biolattice",
            level: 17,
            trained: 2,
          },
          {
            id: "kelpwarden",
            level: 17,
            trained: 2,
          },
          {
            id: "ironsentinel",
            level: 17,
            trained: 2,
          },
          {
            id: "solderjack",
            level: 19,
            trained: 3,
          },
        ],
      },
    ],
    reward: {
      gold: 13675,
      xp: 2655,
      robot: "solderjack",
      item: "repair_kit",
      itemQty: 3,
    },
    replayGold: 3556,
    station: "station_dojo_3",
    x: 1923,
    y: 3165,
  },
  {
    id: "t_ashenhound",
    name: "COPA CINDER HOUND",
    arena: "volcano",
    element: "CINZAS",
    desc: "Circuito de Cinzas — enfrente CINDER HOUND na final e conquiste seu chassi.",
    requiredLevel: 16,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "eventhorizon",
            level: 16,
            trained: 0,
          },
          {
            id: "grimsprocket",
            level: 16,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "basaltguard",
            level: 17,
            trained: 1,
          },
          {
            id: "emberlash",
            level: 17,
            trained: 1,
          },
        ],
      },
      {
        name: "FINAL — CINDER HOUND",
        enemies: [
          {
            id: "ironmonarch",
            level: 18,
            trained: 2,
          },
          {
            id: "ashenrevenant",
            level: 18,
            trained: 2,
          },
          {
            id: "rustsaurus",
            level: 18,
            trained: 2,
          },
          {
            id: "ashenhound",
            level: 20,
            trained: 3,
          },
        ],
      },
    ],
    reward: {
      gold: 14650,
      xp: 2850,
      robot: "ashenhound",
      item: "repair_kit",
      itemQty: 3,
    },
    replayGold: 3809,
    station: "station_volcano_1",
    x: 1667,
    y: 3186,
  },
  {
    id: "t_emberfang",
    name: "COPA EMBER FANG",
    arena: "dojo",
    element: "CHAMA",
    desc: "Circuito de Chama — enfrente EMBER FANG na final e conquiste seu chassi.",
    requiredLevel: 17,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "solarixprime",
            level: 17,
            trained: 0,
          },
          {
            id: "cobblegolem",
            level: 17,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "dunecrawler",
            level: 18,
            trained: 1,
          },
          {
            id: "tundrakeeper",
            level: 18,
            trained: 1,
          },
        ],
      },
      {
        name: "FINAL — EMBER FANG",
        enemies: [
          {
            id: "solderjack",
            level: 19,
            trained: 2,
          },
          {
            id: "ravenousbloom",
            level: 19,
            trained: 2,
          },
          {
            id: "stelladrake",
            level: 19,
            trained: 2,
          },
          {
            id: "emberfang",
            level: 21,
            trained: 3,
          },
        ],
      },
    ],
    reward: {
      gold: 15635,
      xp: 3047,
      robot: "emberfang",
      item: "energy_cell",
      itemQty: 3,
    },
    replayGold: 4065,
    station: "station_dojo_3",
    x: 1393,
    y: 3125,
  },
  {
    id: "t_radiantcalf",
    name: "COPA RADIANT CALF",
    arena: "sky",
    element: "SOL",
    desc: "Circuito de Sol — enfrente RADIANT CALF na final e conquiste seu chassi.",
    requiredLevel: 17,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "grimsprocket",
            level: 17,
            trained: 0,
          },
          {
            id: "tempestcrown",
            level: 17,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "toxinvore",
            level: 18,
            trained: 1,
          },
          {
            id: "tempestcrown",
            level: 18,
            trained: 1,
          },
        ],
      },
      {
        name: "FINAL — RADIANT CALF",
        enemies: [
          {
            id: "stormlance",
            level: 19,
            trained: 2,
          },
          {
            id: "stratoveil",
            level: 19,
            trained: 2,
          },
          {
            id: "cinderhound",
            level: 19,
            trained: 2,
          },
          {
            id: "radiantcalf",
            level: 21,
            trained: 3,
          },
        ],
      },
    ],
    reward: {
      gold: 15635,
      xp: 3047,
      robot: "radiantcalf",
      item: "energy_cell",
      itemQty: 3,
    },
    replayGold: 4065,
    station: "station_sky_1",
    x: 1097,
    y: 3173,
  },
  {
    id: "t_tarpitfiend",
    name: "COPA TARPIT FIEND",
    arena: "dojo",
    element: "PICHE",
    desc: "Circuito de Piche — enfrente TARPIT FIEND na final e conquiste seu chassi.",
    requiredLevel: 18,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "biolattice",
            level: 18,
            trained: 0,
          },
          {
            id: "quartzine",
            level: 18,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "mossknight",
            level: 19,
            trained: 1,
          },
          {
            id: "sandwyrm",
            level: 19,
            trained: 1,
          },
        ],
      },
      {
        name: "FINAL — TARPIT FIEND",
        enemies: [
          {
            id: "dunecrawler",
            level: 20,
            trained: 2,
          },
          {
            id: "sandwyrm",
            level: 20,
            trained: 2,
          },
          {
            id: "bonemarshal",
            level: 20,
            trained: 2,
          },
          {
            id: "tarpitfiend",
            level: 22,
            trained: 3,
          },
        ],
      },
    ],
    reward: {
      gold: 16620,
      xp: 3244,
      robot: "tarpitfiend",
      item: "energy_cell",
      itemQty: 3,
    },
    replayGold: 4321,
    station: "station_dojo_2",
    x: 866,
    y: 3140,
  },
  {
    id: "t_hullbreaker",
    name: "COPA HULL BREAKER",
    arena: "dojo",
    element: "TITANIO",
    desc: "Circuito de Titanio — enfrente HULL BREAKER na final e conquiste seu chassi.",
    requiredLevel: 19,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "aridfang",
            level: 19,
            trained: 0,
          },
          {
            id: "meteorpunch",
            level: 19,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "swiftgale",
            level: 20,
            trained: 1,
          },
          {
            id: "thunderoni",
            level: 20,
            trained: 1,
          },
        ],
      },
      {
        name: "FINAL — HULL BREAKER",
        enemies: [
          {
            id: "mossknight",
            level: 21,
            trained: 2,
          },
          {
            id: "kelpwarden",
            level: 21,
            trained: 2,
          },
          {
            id: "mycelor",
            level: 21,
            trained: 2,
          },
          {
            id: "hullbreaker",
            level: 23,
            trained: 3,
          },
        ],
      },
    ],
    reward: {
      gold: 17615,
      xp: 3443,
      robot: "hullbreaker",
      item: "energy_cell",
      itemQty: 3,
    },
    replayGold: 4580,
    station: "station_dojo_1",
    x: 609,
    y: 3156,
  },
  {
    id: "t_boreaxe",
    name: "COPA BOREAXE",
    arena: "dojo",
    element: "VENTANIA",
    desc: "Circuito de Ventania — enfrente BOREAXE na final e conquiste seu chassi.",
    requiredLevel: 20,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "mossknight",
            level: 20,
            trained: 0,
          },
          {
            id: "ravenousbloom",
            level: 20,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "junglemaw",
            level: 21,
            trained: 1,
          },
          {
            id: "mudlarker",
            level: 21,
            trained: 1,
          },
        ],
      },
      {
        name: "FINAL — BOREAXE",
        enemies: [
          {
            id: "stratoveil",
            level: 22,
            trained: 2,
          },
          {
            id: "solderjack",
            level: 22,
            trained: 2,
          },
          {
            id: "ravenousbloom",
            level: 22,
            trained: 2,
          },
          {
            id: "boreaxe",
            level: 24,
            trained: 3,
          },
        ],
      },
    ],
    reward: {
      gold: 18615,
      xp: 3643,
      robot: "boreaxe",
      item: "energy_cell",
      itemQty: 3,
    },
    replayGold: 4840,
    station: "station_dojo_3",
    x: 309,
    y: 3186,
  },
  {
    id: "t_dustmoth",
    name: "COPA DUST MOTH",
    arena: "dojo",
    element: "POEIRA",
    desc: "Circuito de Poeira — enfrente DUST MOTH na final e conquiste seu chassi.",
    requiredLevel: 21,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "mirrorclad",
            level: 21,
            trained: 0,
          },
          {
            id: "stormlance",
            level: 21,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "acidra",
            level: 22,
            trained: 1,
          },
          {
            id: "hullbreaker",
            level: 22,
            trained: 1,
          },
        ],
      },
      {
        name: "FINAL — DUST MOTH",
        enemies: [
          {
            id: "dunecrawler",
            level: 23,
            trained: 2,
          },
          {
            id: "kelpwarden",
            level: 23,
            trained: 2,
          },
          {
            id: "boilerbrute",
            level: 23,
            trained: 2,
          },
          {
            id: "dustmoth",
            level: 25,
            trained: 3,
          },
        ],
      },
    ],
    reward: {
      gold: 19620,
      xp: 3844,
      robot: "dustmoth",
      item: "energy_cell",
      itemQty: 3,
    },
    replayGold: 5101,
    station: "station_dojo_2",
    x: 357,
    y: 3361,
  },
  {
    id: "t_stygianox",
    name: "COPA STYGIAN OX",
    arena: "dojo",
    element: "ABISMO",
    desc: "Circuito de Abismo — enfrente STYGIAN OX na final e conquiste seu chassi.",
    requiredLevel: 22,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "jadearbiter",
            level: 22,
            trained: 0,
          },
          {
            id: "voltronin",
            level: 22,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "basaltguard",
            level: 23,
            trained: 1,
          },
          {
            id: "dunecrawler",
            level: 23,
            trained: 1,
          },
        ],
      },
      {
        name: "FINAL — STYGIAN OX",
        enemies: [
          {
            id: "frostpike",
            level: 24,
            trained: 2,
          },
          {
            id: "aquabastion",
            level: 24,
            trained: 2,
          },
          {
            id: "rustsaurus",
            level: 24,
            trained: 2,
          },
          {
            id: "stygianox",
            level: 26,
            trained: 3,
          },
        ],
      },
    ],
    reward: {
      gold: 20630,
      xp: 4046,
      robot: "stygianox",
      item: "energy_cell",
      itemQty: 3,
    },
    replayGold: 5364,
    station: "station_dojo_3",
    x: 608,
    y: 3369,
  },
  {
    id: "t_basaltgore",
    name: "COPA BASALT GORE",
    arena: "dojo",
    element: "BASALTO",
    desc: "Circuito de Basalto — enfrente BASALT GORE na final e conquiste seu chassi.",
    requiredLevel: 23,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "mirageblade",
            level: 23,
            trained: 0,
          },
          {
            id: "sandwyrm",
            level: 23,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "ironmonk",
            level: 24,
            trained: 1,
          },
          {
            id: "emberfang",
            level: 24,
            trained: 1,
          },
        ],
      },
      {
        name: "FINAL — BASALT GORE",
        enemies: [
          {
            id: "wispkin",
            level: 25,
            trained: 2,
          },
          {
            id: "ravenousbloom",
            level: 25,
            trained: 2,
          },
          {
            id: "scrapjaw",
            level: 25,
            trained: 2,
          },
          {
            id: "basaltgore",
            level: 27,
            trained: 3,
          },
        ],
      },
    ],
    reward: {
      gold: 21640,
      xp: 4248,
      robot: "basaltgore",
      item: "energy_cell",
      itemQty: 3,
    },
    replayGold: 5626,
    station: "station_dojo_2",
    x: 890,
    y: 3378,
  },
  {
    id: "t_emberkite",
    name: "COPA EMBER KITE",
    arena: "volcano",
    element: "BRASA",
    desc: "Circuito de Brasa — enfrente EMBER KITE na final e conquiste seu chassi.",
    requiredLevel: 24,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "ashenhound",
            level: 24,
            trained: 0,
          },
          {
            id: "meteorpunch",
            level: 24,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "blastfurnace",
            level: 25,
            trained: 1,
          },
          {
            id: "emberlash",
            level: 25,
            trained: 1,
          },
        ],
      },
      {
        name: "FINAL — EMBER KITE",
        enemies: [
          {
            id: "nullshade",
            level: 26,
            trained: 2,
          },
          {
            id: "obsidianfist",
            level: 26,
            trained: 2,
          },
          {
            id: "steelmonk",
            level: 26,
            trained: 2,
          },
          {
            id: "emberkite",
            level: 28,
            trained: 3,
          },
        ],
      },
    ],
    reward: {
      gold: 22660,
      xp: 4452,
      robot: "emberkite",
      item: "energy_cell",
      itemQty: 3,
    },
    replayGold: 5892,
    station: "station_volcano_3",
    x: 1135,
    y: 3436,
  },
  {
    id: "t_crystalquartz",
    name: "COPA CRYSTAL QUARTZ",
    arena: "frozen",
    element: "CRISTAL",
    desc: "Circuito de Cristal — enfrente CRYSTAL QUARTZ na final e conquiste seu chassi.",
    requiredLevel: 25,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "amberlock",
            level: 25,
            trained: 0,
          },
          {
            id: "crystallux",
            level: 25,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "coralshiv",
            level: 26,
            trained: 1,
          },
          {
            id: "boneorchestra",
            level: 26,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "tundrakeeper",
            level: 27,
            trained: 2,
          },
          {
            id: "aurorion",
            level: 27,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — CRYSTAL QUARTZ",
        enemies: [
          {
            id: "chronowake",
            level: 28,
            trained: 3,
          },
          {
            id: "cobblegolem",
            level: 28,
            trained: 3,
          },
          {
            id: "reefsovereign",
            level: 28,
            trained: 3,
          },
          {
            id: "crystalquartz",
            level: 30,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 23685,
      xp: 4657,
      robot: "crystalquartz",
      item: "energy_cell",
      itemQty: 3,
    },
    replayGold: 6158,
    station: "station_frozen_3",
    x: 1391,
    y: 3433,
  },
  {
    id: "t_skyloomweaver",
    name: "COPA SKYLOOM WEAVER",
    arena: "dojo",
    element: "TECELA",
    desc: "Circuito de Tecela — enfrente SKYLOOM WEAVER na final e conquiste seu chassi.",
    requiredLevel: 26,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "pyreconclave",
            level: 26,
            trained: 0,
          },
          {
            id: "boneorchestra",
            level: 26,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "boulderox",
            level: 27,
            trained: 1,
          },
          {
            id: "aridfang",
            level: 27,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "boltbunny",
            level: 28,
            trained: 2,
          },
          {
            id: "ironmonarch",
            level: 28,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — SKYLOOM WEAVER",
        enemies: [
          {
            id: "hullbreaker",
            level: 29,
            trained: 3,
          },
          {
            id: "ironsentinel",
            level: 29,
            trained: 3,
          },
          {
            id: "ironsentinel",
            level: 29,
            trained: 3,
          },
          {
            id: "skyloomweaver",
            level: 31,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 24710,
      xp: 4862,
      robot: "skyloomweaver",
      item: "energy_cell",
      itemQty: 3,
    },
    replayGold: 6425,
    station: "station_dojo_1",
    x: 1683,
    y: 3392,
  },
  {
    id: "t_grimquill",
    name: "COPA GRIM QUILL",
    arena: "dojo",
    element: "PENA",
    desc: "Circuito de Pena — enfrente GRIM QUILL na final e conquiste seu chassi.",
    requiredLevel: 27,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "sandwyrm",
            level: 27,
            trained: 0,
          },
          {
            id: "bramblewrath",
            level: 27,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "terraforge",
            level: 28,
            trained: 1,
          },
          {
            id: "mirageblade",
            level: 28,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "stonewhisker",
            level: 29,
            trained: 2,
          },
          {
            id: "boilerbrute",
            level: 29,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — GRIM QUILL",
        enemies: [
          {
            id: "noxfeather",
            level: 30,
            trained: 3,
          },
          {
            id: "vireoblade",
            level: 30,
            trained: 3,
          },
          {
            id: "titanox",
            level: 30,
            trained: 3,
          },
          {
            id: "grimquill",
            level: 32,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 25740,
      xp: 5068,
      robot: "grimquill",
      item: "energy_cell",
      itemQty: 3,
    },
    replayGold: 6692,
    station: "station_dojo_2",
    x: 1923,
    y: 3437,
  },
  {
    id: "t_nightjarx",
    name: "COPA NIGHTJAR X",
    arena: "dojo",
    element: "NOITE",
    desc: "Circuito de Noite — enfrente NIGHTJAR X na final e conquiste seu chassi.",
    requiredLevel: 28,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "noxfeather",
            level: 28,
            trained: 0,
          },
          {
            id: "basaltgore",
            level: 28,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "vireoblade",
            level: 29,
            trained: 1,
          },
          {
            id: "skyloomweaver",
            level: 29,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "solderjack",
            level: 30,
            trained: 2,
          },
          {
            id: "venomcarapace",
            level: 30,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — NIGHTJAR X",
        enemies: [
          {
            id: "stygianox",
            level: 31,
            trained: 3,
          },
          {
            id: "shadowfang",
            level: 31,
            trained: 3,
          },
          {
            id: "scrapjaw",
            level: 31,
            trained: 3,
          },
          {
            id: "nightjarx",
            level: 33,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 26775,
      xp: 5275,
      robot: "nightjarx",
      item: "energy_cell",
      itemQty: 3,
    },
    replayGold: 6962,
    station: "station_dojo_2",
    x: 2228,
    y: 3424,
  },
  {
    id: "t_polarisguard",
    name: "COPA POLARIS GUARD",
    arena: "dojo",
    element: "POLAR",
    desc: "Circuito de Polar — enfrente POLARIS GUARD na final e conquiste seu chassi.",
    requiredLevel: 28,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "wispkin",
            level: 28,
            trained: 0,
          },
          {
            id: "kelpwarden",
            level: 28,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "nightjarx",
            level: 29,
            trained: 1,
          },
          {
            id: "aridfang",
            level: 29,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "bramblewrath",
            level: 30,
            trained: 2,
          },
          {
            id: "titanbulwark",
            level: 30,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — POLARIS GUARD",
        enemies: [
          {
            id: "dunecrawler",
            level: 31,
            trained: 3,
          },
          {
            id: "basaltgore",
            level: 31,
            trained: 3,
          },
          {
            id: "gridrunner",
            level: 31,
            trained: 3,
          },
          {
            id: "polarisguard",
            level: 33,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 26775,
      xp: 5275,
      robot: "polarisguard",
      item: "energy_cell",
      itemQty: 3,
    },
    replayGold: 6962,
    station: "station_dojo_3",
    x: 2464,
    y: 3424,
  },
  {
    id: "t_fenrisbyte",
    name: "COPA FENRISBYTE",
    arena: "dojo",
    element: "LOBO",
    desc: "Circuito de Lobo — enfrente FENRISBYTE na final e conquiste seu chassi.",
    requiredLevel: 29,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "polarisguard",
            level: 29,
            trained: 0,
          },
          {
            id: "wispkin",
            level: 29,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "grimquill",
            level: 30,
            trained: 1,
          },
          {
            id: "basaltgore",
            level: 30,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "terraforge",
            level: 31,
            trained: 2,
          },
          {
            id: "mirageblade",
            level: 31,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — FENRISBYTE",
        enemies: [
          {
            id: "dustmoth",
            level: 32,
            trained: 3,
          },
          {
            id: "junglemaw",
            level: 32,
            trained: 3,
          },
          {
            id: "terrabyte",
            level: 32,
            trained: 3,
          },
          {
            id: "fenrisbyte",
            level: 34,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 27810,
      xp: 5482,
      robot: "fenrisbyte",
      item: "energy_cell",
      itemQty: 3,
    },
    replayGold: 7231,
    station: "station_dojo_3",
    x: 2742,
    y: 3412,
  },
  {
    id: "t_obsidianfang",
    name: "COPA OBSIDIAN FANG",
    arena: "volcano",
    element: "OBSIDIANA",
    desc: "Circuito de Obsidiana — enfrente OBSIDIAN FANG na final e conquiste seu chassi.",
    requiredLevel: 30,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "meteorpunch",
            level: 30,
            trained: 0,
          },
          {
            id: "ruinwarden",
            level: 30,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "seraphimvoid",
            level: 31,
            trained: 1,
          },
          {
            id: "emberlash",
            level: 31,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "ashenrevenant",
            level: 32,
            trained: 2,
          },
          {
            id: "emberwing",
            level: 32,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — OBSIDIAN FANG",
        enemies: [
          {
            id: "tarpitfiend",
            level: 33,
            trained: 3,
          },
          {
            id: "voidcaller",
            level: 33,
            trained: 3,
          },
          {
            id: "basaltguard",
            level: 33,
            trained: 3,
          },
          {
            id: "obsidianfang",
            level: 35,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 28855,
      xp: 5691,
      robot: "obsidianfang",
      item: "energy_cell",
      itemQty: 3,
    },
    replayGold: 7502,
    station: "station_volcano_2",
    x: 3014,
    y: 3420,
  },
  {
    id: "t_silentquill",
    name: "COPA SILENT QUILL",
    arena: "dojo",
    element: "SILENCIO",
    desc: "Circuito de Silencio — enfrente SILENT QUILL na final e conquiste seu chassi.",
    requiredLevel: 31,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "boltbunny",
            level: 31,
            trained: 0,
          },
          {
            id: "basaltgore",
            level: 31,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "ironmonk",
            level: 32,
            trained: 1,
          },
          {
            id: "mirageblade",
            level: 32,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "boltbunny",
            level: 33,
            trained: 2,
          },
          {
            id: "tarpitfiend",
            level: 33,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — SILENT QUILL",
        enemies: [
          {
            id: "quantumecho",
            level: 34,
            trained: 3,
          },
          {
            id: "noxfeather",
            level: 34,
            trained: 3,
          },
          {
            id: "junglemaw",
            level: 34,
            trained: 3,
          },
          {
            id: "silentquill",
            level: 36,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 29900,
      xp: 5900,
      robot: "silentquill",
      item: "energy_cell",
      itemQty: 3,
    },
    replayGold: 7774,
    station: "station_dojo_3",
    x: 3284,
    y: 3365,
  },
  {
    id: "t_orbitalance",
    name: "COPA ORBITALANCE",
    arena: "orbital",
    element: "ORBITA",
    desc: "Circuito de Orbita — enfrente ORBITALANCE na final e conquiste seu chassi.",
    requiredLevel: 32,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "cosmoveil",
            level: 32,
            trained: 0,
          },
          {
            id: "seraphimvoid",
            level: 32,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "bonemarshal",
            level: 33,
            trained: 1,
          },
          {
            id: "nebulaseer",
            level: 33,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "terminuscore",
            level: 34,
            trained: 2,
          },
          {
            id: "hailstriker",
            level: 34,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — ORBITALANCE",
        enemies: [
          {
            id: "gloomtide",
            level: 35,
            trained: 3,
          },
          {
            id: "terminuscore",
            level: 35,
            trained: 3,
          },
          {
            id: "pulsarcore",
            level: 35,
            trained: 3,
          },
          {
            id: "orbitalance",
            level: 37,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 30945,
      xp: 6109,
      robot: "orbitalance",
      item: "energy_cell",
      itemQty: 3,
    },
    replayGold: 8046,
    station: "station_orbital_3",
    x: 3281,
    y: 3663,
  },
  {
    id: "t_marblesaint",
    name: "COPA MARBLE SAINT",
    arena: "dojo",
    element: "MARMORE",
    desc: "Circuito de Marmore — enfrente MARBLE SAINT na final e conquiste seu chassi.",
    requiredLevel: 33,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "boulderox",
            level: 33,
            trained: 0,
          },
          {
            id: "dustmoth",
            level: 33,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "terraforge",
            level: 34,
            trained: 1,
          },
          {
            id: "meteorpunch",
            level: 34,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "bioreaper",
            level: 35,
            trained: 2,
          },
          {
            id: "seraphimvoid",
            level: 35,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — MARBLE SAINT",
        enemies: [
          {
            id: "mirageblade",
            level: 36,
            trained: 3,
          },
          {
            id: "cinderhound",
            level: 36,
            trained: 3,
          },
          {
            id: "titanbulwark",
            level: 36,
            trained: 3,
          },
          {
            id: "marblesaint",
            level: 38,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 32000,
      xp: 6320,
      robot: "marblesaint",
      item: "energy_cell",
      itemQty: 3,
    },
    replayGold: 8320,
    station: "station_dojo_1",
    x: 3034,
    y: 3648,
  },
  {
    id: "t_hydroquake",
    name: "COPA HYDROQUAKE",
    arena: "dojo",
    element: "TSUNAMI",
    desc: "Circuito de Tsunami — enfrente HYDROQUAKE na final e conquiste seu chassi.",
    requiredLevel: 34,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "glacierjaw",
            level: 34,
            trained: 0,
          },
          {
            id: "boltbunny",
            level: 34,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "aridfang",
            level: 35,
            trained: 1,
          },
          {
            id: "hexweaver",
            level: 35,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "jadearbiter",
            level: 36,
            trained: 2,
          },
          {
            id: "cobblegolem",
            level: 36,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — HYDROQUAKE",
        enemies: [
          {
            id: "nightjarx",
            level: 37,
            trained: 3,
          },
          {
            id: "seraphimvoid",
            level: 37,
            trained: 3,
          },
          {
            id: "bonemarshal",
            level: 37,
            trained: 3,
          },
          {
            id: "hydroquake",
            level: 39,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 33055,
      xp: 6531,
      robot: "hydroquake",
      item: "shield_chip",
      itemQty: 2,
    },
    replayGold: 8594,
    station: "station_dojo_1",
    x: 2711,
    y: 3654,
  },
  {
    id: "t_astrafox",
    name: "COPA ASTRA FOX",
    arena: "orbital",
    element: "ESTRELA",
    desc: "Circuito de Estrela — enfrente ASTRA FOX na final e conquiste seu chassi.",
    requiredLevel: 35,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "voltcarnyx",
            level: 35,
            trained: 0,
          },
          {
            id: "abyssalord",
            level: 35,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "orbitalmarshal",
            level: 36,
            trained: 1,
          },
          {
            id: "gravitide",
            level: 36,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "magnetarfist",
            level: 37,
            trained: 2,
          },
          {
            id: "hexweaver",
            level: 37,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — ASTRA FOX",
        enemies: [
          {
            id: "neutronmaul",
            level: 38,
            trained: 3,
          },
          {
            id: "terminuscore",
            level: 38,
            trained: 3,
          },
          {
            id: "steelmonk",
            level: 38,
            trained: 3,
          },
          {
            id: "astrafox",
            level: 40,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 34110,
      xp: 6742,
      robot: "astrafox",
      item: "shield_chip",
      itemQty: 2,
    },
    replayGold: 8869,
    station: "station_orbital_3",
    x: 2456,
    y: 3640,
  },
  {
    id: "t_magnetarch",
    name: "COPA MAGNETARCH",
    arena: "orbital",
    element: "MAGNETISMO",
    desc: "Circuito de Magnetismo — enfrente MAGNETARCH na final e conquiste seu chassi.",
    requiredLevel: 36,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "lunargeist",
            level: 36,
            trained: 0,
          },
          {
            id: "pulsarcore",
            level: 36,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "voltronin",
            level: 37,
            trained: 1,
          },
          {
            id: "aridfang",
            level: 37,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "orbitalance",
            level: 38,
            trained: 2,
          },
          {
            id: "grimquill",
            level: 38,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — MAGNETARCH",
        enemies: [
          {
            id: "maelstromfist",
            level: 39,
            trained: 3,
          },
          {
            id: "magnavore",
            level: 39,
            trained: 3,
          },
          {
            id: "eventhorizon",
            level: 39,
            trained: 3,
          },
          {
            id: "magnetarch",
            level: 41,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 35175,
      xp: 6955,
      robot: "magnetarch",
      item: "shield_chip",
      itemQty: 2,
    },
    replayGold: 9146,
    station: "station_orbital_3",
    x: 2218,
    y: 3642,
  },
  {
    id: "t_obeliskar",
    name: "COPA OBELISKAR",
    arena: "dojo",
    element: "RUNA",
    desc: "Circuito de Runa — enfrente OBELISKAR na final e conquiste seu chassi.",
    requiredLevel: 37,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "marblesaint",
            level: 37,
            trained: 0,
          },
          {
            id: "gridrunner",
            level: 37,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "acidbloom",
            level: 38,
            trained: 1,
          },
          {
            id: "quarrybreaker",
            level: 38,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "obsidianfang",
            level: 39,
            trained: 2,
          },
          {
            id: "obsidianfist",
            level: 39,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — OBELISKAR",
        enemies: [
          {
            id: "bogtyrant",
            level: 40,
            trained: 3,
          },
          {
            id: "basaltgore",
            level: 40,
            trained: 3,
          },
          {
            id: "sandwyrm",
            level: 40,
            trained: 3,
          },
          {
            id: "obeliskar",
            level: 42,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 36235,
      xp: 7167,
      robot: "obeliskar",
      item: "shield_chip",
      itemQty: 2,
    },
    replayGold: 9421,
    station: "station_dojo_1",
    x: 1974,
    y: 3679,
  },
  {
    id: "t_tidebreaker",
    name: "COPA TIDEBREAKER",
    arena: "frozen",
    element: "MARE",
    desc: "Circuito de Mare — enfrente TIDEBREAKER na final e conquiste seu chassi.",
    requiredLevel: 38,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "pulsarcore",
            level: 38,
            trained: 0,
          },
          {
            id: "quicksilverr",
            level: 38,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "quicksilverr",
            level: 39,
            trained: 1,
          },
          {
            id: "snowreaver",
            level: 39,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "venomcarapace",
            level: 40,
            trained: 2,
          },
          {
            id: "mirrorclad",
            level: 40,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — TIDEBREAKER",
        enemies: [
          {
            id: "glasscicada",
            level: 41,
            trained: 3,
          },
          {
            id: "quicksilverr",
            level: 41,
            trained: 3,
          },
          {
            id: "magnetarfist",
            level: 41,
            trained: 3,
          },
          {
            id: "tidebreaker",
            level: 43,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 37305,
      xp: 7381,
      robot: "tidebreaker",
      item: "shield_chip",
      itemQty: 2,
    },
    replayGold: 9699,
    station: "station_frozen_2",
    x: 1695,
    y: 3684,
  },
  {
    id: "t_venomcoil",
    name: "COPA VENOM COIL",
    arena: "dojo",
    element: "VENENO",
    desc: "Circuito de Veneno — enfrente VENOM COIL na final e conquiste seu chassi.",
    requiredLevel: 39,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "mirageblade",
            level: 39,
            trained: 0,
          },
          {
            id: "obeliskar",
            level: 39,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "basaltgore",
            level: 40,
            trained: 1,
          },
          {
            id: "terraforge",
            level: 40,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "kelpwarden",
            level: 41,
            trained: 2,
          },
          {
            id: "stygianox",
            level: 41,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — VENOM COIL",
        enemies: [
          {
            id: "bogtyrant",
            level: 42,
            trained: 3,
          },
          {
            id: "biolattice",
            level: 42,
            trained: 3,
          },
          {
            id: "aurorion",
            level: 42,
            trained: 3,
          },
          {
            id: "venomcoil",
            level: 44,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 38375,
      xp: 7595,
      robot: "venomcoil",
      item: "shield_chip",
      itemQty: 2,
    },
    replayGold: 9978,
    station: "station_dojo_3",
    x: 1431,
    y: 3610,
  },
  {
    id: "t_gearwidow",
    name: "COPA GEAR WIDOW",
    arena: "dojo",
    element: "RELOJOARIA",
    desc: "Circuito de Relojoaria — enfrente GEAR WIDOW na final e conquiste seu chassi.",
    requiredLevel: 40,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "sandwyrm",
            level: 40,
            trained: 0,
          },
          {
            id: "wispkin",
            level: 40,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "boreaxe",
            level: 41,
            trained: 1,
          },
          {
            id: "jadearbiter",
            level: 41,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "polarisguard",
            level: 42,
            trained: 2,
          },
          {
            id: "cindercrown",
            level: 42,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — GEAR WIDOW",
        enemies: [
          {
            id: "lumenblade",
            level: 43,
            trained: 3,
          },
          {
            id: "vireoblade",
            level: 43,
            trained: 3,
          },
          {
            id: "obeliskar",
            level: 43,
            trained: 3,
          },
          {
            id: "gearwidow",
            level: 45,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 39445,
      xp: 7809,
      robot: "gearwidow",
      item: "shield_chip",
      itemQty: 2,
    },
    replayGold: 10256,
    station: "station_dojo_3",
    x: 1091,
    y: 3641,
  },
  {
    id: "t_harvestking",
    name: "COPA HARVEST KING",
    arena: "dojo",
    element: "COLHEITA",
    desc: "Circuito de Colheita — enfrente HARVEST KING na final e conquiste seu chassi.",
    requiredLevel: 41,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "noxfeather",
            level: 41,
            trained: 0,
          },
          {
            id: "stonewhisker",
            level: 41,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "bogtyrant",
            level: 42,
            trained: 1,
          },
          {
            id: "stygianox",
            level: 42,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "boltbunny",
            level: 43,
            trained: 2,
          },
          {
            id: "swiftgale",
            level: 43,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — HARVEST KING",
        enemies: [
          {
            id: "hydroknight",
            level: 44,
            trained: 3,
          },
          {
            id: "boulderox",
            level: 44,
            trained: 3,
          },
          {
            id: "terraforge",
            level: 44,
            trained: 3,
          },
          {
            id: "harvestking",
            level: 46,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 40520,
      xp: 8024,
      robot: "harvestking",
      item: "shield_chip",
      itemQty: 2,
    },
    replayGold: 10535,
    station: "station_dojo_1",
    x: 828,
    y: 3649,
  },
  {
    id: "t_gravebyte",
    name: "COPA GRAVEBYTE",
    arena: "dojo",
    element: "TUMULO",
    desc: "Circuito de Tumulo — enfrente GRAVEBYTE na final e conquiste seu chassi.",
    requiredLevel: 42,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "permafrostmk",
            level: 42,
            trained: 0,
          },
          {
            id: "scrapjaw",
            level: 42,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "emberwing",
            level: 43,
            trained: 1,
          },
          {
            id: "vireoblade",
            level: 43,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "boneorchestra",
            level: 44,
            trained: 2,
          },
          {
            id: "gloomtide",
            level: 44,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — GRAVEBYTE",
        enemies: [
          {
            id: "boreaxe",
            level: 45,
            trained: 3,
          },
          {
            id: "shadowfang",
            level: 45,
            trained: 3,
          },
          {
            id: "mudlarker",
            level: 45,
            trained: 3,
          },
          {
            id: "gravebyte",
            level: 47,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 41600,
      xp: 8240,
      robot: "gravebyte",
      item: "shield_chip",
      itemQty: 2,
    },
    replayGold: 10816,
    station: "station_dojo_3",
    x: 553,
    y: 3627,
  },
  {
    id: "t_carrionvex",
    name: "COPA CARRION VEX",
    arena: "dojo",
    element: "PRAGA",
    desc: "Circuito de Praga — enfrente CARRION VEX na final e conquiste seu chassi.",
    requiredLevel: 43,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "mirageblade",
            level: 43,
            trained: 0,
          },
          {
            id: "hydroquake",
            level: 43,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "wispkin",
            level: 44,
            trained: 1,
          },
          {
            id: "noxfeather",
            level: 44,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "lunargeist",
            level: 45,
            trained: 2,
          },
          {
            id: "tarpitfiend",
            level: 45,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — CARRION VEX",
        enemies: [
          {
            id: "ironmonarch",
            level: 46,
            trained: 3,
          },
          {
            id: "vulcanargo",
            level: 46,
            trained: 3,
          },
          {
            id: "silentquill",
            level: 46,
            trained: 3,
          },
          {
            id: "carrionvex",
            level: 48,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 42680,
      xp: 8456,
      robot: "carrionvex",
      item: "shield_chip",
      itemQty: 2,
    },
    replayGold: 11097,
    station: "station_dojo_1",
    x: 289,
    y: 3658,
  },
  {
    id: "t_acidgrin",
    name: "COPA ACID GRIN",
    arena: "frozen",
    element: "ACIDO",
    desc: "Circuito de Acido — enfrente ACID GRIN na final e conquiste seu chassi.",
    requiredLevel: 44,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "mireclad",
            level: 44,
            trained: 0,
          },
          {
            id: "frostmonarch",
            level: 44,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "glacierjaw",
            level: 45,
            trained: 1,
          },
          {
            id: "tundrakeeper",
            level: 45,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "reefsovereign",
            level: 46,
            trained: 2,
          },
          {
            id: "bogtyrant",
            level: 46,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — ACID GRIN",
        enemies: [
          {
            id: "hexweaver",
            level: 47,
            trained: 3,
          },
          {
            id: "amberlock",
            level: 47,
            trained: 3,
          },
          {
            id: "frostmonarch",
            level: 47,
            trained: 3,
          },
          {
            id: "acidgrin",
            level: 49,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 43760,
      xp: 8672,
      robot: "acidgrin",
      item: "shield_chip",
      itemQty: 2,
    },
    replayGold: 11378,
    station: "station_frozen_1",
    x: 296,
    y: 3897,
  },
  {
    id: "t_quakejaw",
    name: "COPA QUAKE JAW",
    arena: "dojo",
    element: "TERREMOTO",
    desc: "Circuito de Terremoto — enfrente QUAKE JAW na final e conquiste seu chassi.",
    requiredLevel: 45,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "vireoblade",
            level: 45,
            trained: 0,
          },
          {
            id: "graphenex",
            level: 45,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "titanbulwark",
            level: 46,
            trained: 1,
          },
          {
            id: "nightjarx",
            level: 46,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "stonewhisker",
            level: 47,
            trained: 2,
          },
          {
            id: "eclipsar",
            level: 47,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — QUAKE JAW",
        enemies: [
          {
            id: "venomcoil",
            level: 48,
            trained: 3,
          },
          {
            id: "magnetarch",
            level: 48,
            trained: 3,
          },
          {
            id: "noxfeather",
            level: 48,
            trained: 3,
          },
          {
            id: "quakejaw",
            level: 50,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 44845,
      xp: 8889,
      robot: "quakejaw",
      item: "shield_chip",
      itemQty: 2,
    },
    replayGold: 11660,
    station: "station_dojo_3",
    x: 590,
    y: 3913,
  },
  {
    id: "t_aetherbell",
    name: "COPA AETHER BELL",
    arena: "dojo",
    element: "ETER",
    desc: "Circuito de Eter — enfrente AETHER BELL na final e conquiste seu chassi.",
    requiredLevel: 46,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "mossknight",
            level: 46,
            trained: 0,
          },
          {
            id: "emberfang",
            level: 46,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "basaltgore",
            level: 47,
            trained: 1,
          },
          {
            id: "nightjarx",
            level: 47,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "boneorchestra",
            level: 48,
            trained: 2,
          },
          {
            id: "shadowfang",
            level: 48,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — AETHER BELL",
        enemies: [
          {
            id: "aetherloom",
            level: 49,
            trained: 3,
          },
          {
            id: "terraforge",
            level: 49,
            trained: 3,
          },
          {
            id: "mycelor",
            level: 49,
            trained: 3,
          },
          {
            id: "aetherbell",
            level: 51,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 45935,
      xp: 9107,
      robot: "aetherbell",
      item: "shield_chip",
      itemQty: 2,
    },
    replayGold: 11943,
    station: "station_dojo_2",
    x: 867,
    y: 3870,
  },
  {
    id: "t_emberlotus",
    name: "COPA EMBER LOTUS",
    arena: "dojo",
    element: "FLOR",
    desc: "Circuito de Flor — enfrente EMBER LOTUS na final e conquiste seu chassi.",
    requiredLevel: 47,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "boneorchestra",
            level: 47,
            trained: 0,
          },
          {
            id: "mirageblade",
            level: 47,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "nebulon",
            level: 48,
            trained: 1,
          },
          {
            id: "stygianox",
            level: 48,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "gravebyte",
            level: 49,
            trained: 2,
          },
          {
            id: "ferrovax",
            level: 49,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — EMBER LOTUS",
        enemies: [
          {
            id: "biolattice",
            level: 50,
            trained: 3,
          },
          {
            id: "sporeherald",
            level: 50,
            trained: 3,
          },
          {
            id: "gravebyte",
            level: 50,
            trained: 3,
          },
          {
            id: "emberlotus",
            level: 52,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 47025,
      xp: 9325,
      robot: "emberlotus",
      item: "shield_chip",
      itemQty: 2,
    },
    replayGold: 12226,
    station: "station_dojo_3",
    x: 1102,
    y: 3896,
  },
  {
    id: "t_silkarachne",
    name: "COPA SILK ARACHNE",
    arena: "dojo",
    element: "SEDA",
    desc: "Circuito de Seda — enfrente SILK ARACHNE na final e conquiste seu chassi.",
    requiredLevel: 48,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "lunargeist",
            level: 48,
            trained: 0,
          },
          {
            id: "blastfurnace",
            level: 48,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "sporeherald",
            level: 49,
            trained: 1,
          },
          {
            id: "polarisguard",
            level: 49,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "biolattice",
            level: 50,
            trained: 2,
          },
          {
            id: "eventhorizon",
            level: 50,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — SILK ARACHNE",
        enemies: [
          {
            id: "gearwidow",
            level: 51,
            trained: 3,
          },
          {
            id: "aetherbell",
            level: 51,
            trained: 3,
          },
          {
            id: "hydroknight",
            level: 51,
            trained: 3,
          },
          {
            id: "silkarachne",
            level: 53,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 48115,
      xp: 9543,
      robot: "silkarachne",
      item: "shield_chip",
      itemQty: 2,
    },
    replayGold: 12510,
    station: "station_dojo_1",
    x: 1390,
    y: 3900,
  },
  {
    id: "t_tempestcoil",
    name: "COPA TEMPEST COIL",
    arena: "sky",
    element: "TEMPESTADE",
    desc: "Circuito de Tempestade — enfrente TEMPEST COIL na final e conquiste seu chassi.",
    requiredLevel: 49,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "boulderox",
            level: 49,
            trained: 0,
          },
          {
            id: "thunderoni",
            level: 49,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "seraphcircuit",
            level: 50,
            trained: 1,
          },
          {
            id: "resinjudge",
            level: 50,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "seraphcircuit",
            level: 51,
            trained: 2,
          },
          {
            id: "voltcarnyx",
            level: 51,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — TEMPEST COIL",
        enemies: [
          {
            id: "windshear",
            level: 52,
            trained: 3,
          },
          {
            id: "tempestcrown",
            level: 52,
            trained: 3,
          },
          {
            id: "obsidianfang",
            level: 52,
            trained: 3,
          },
          {
            id: "tempestcoil",
            level: 54,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 49210,
      xp: 9762,
      robot: "tempestcoil",
      item: "shield_chip",
      itemQty: 2,
    },
    replayGold: 12795,
    station: "station_sky_2",
    x: 1664,
    y: 3875,
  },
  {
    id: "t_skyreef",
    name: "COPA SKY REEF",
    arena: "frozen",
    element: "CORAL",
    desc: "Circuito de Coral — enfrente SKY REEF na final e conquiste seu chassi.",
    requiredLevel: 50,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "tundrakeeper",
            level: 50,
            trained: 0,
          },
          {
            id: "acidbloom",
            level: 50,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "pulsarcore",
            level: 51,
            trained: 1,
          },
          {
            id: "tidebreaker",
            level: 51,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "crystallux",
            level: 52,
            trained: 2,
          },
          {
            id: "reefsovereign",
            level: 52,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — SKY REEF",
        enemies: [
          {
            id: "prismvector",
            level: 53,
            trained: 3,
          },
          {
            id: "frostpike",
            level: 53,
            trained: 3,
          },
          {
            id: "radiantcalf",
            level: 53,
            trained: 3,
          },
          {
            id: "skyreef",
            level: 55,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 50310,
      xp: 9982,
      robot: "skyreef",
      item: "shield_chip",
      itemQty: 2,
    },
    replayGold: 13081,
    station: "station_frozen_1",
    x: 1913,
    y: 3919,
  },
  {
    id: "t_darkharbor",
    name: "COPA DARK HARBOR",
    arena: "dojo",
    element: "BREU",
    desc: "Circuito de Breu — enfrente DARK HARBOR na final e conquiste seu chassi.",
    requiredLevel: 51,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "shadowfang",
            level: 51,
            trained: 0,
          },
          {
            id: "hullbreaker",
            level: 51,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "cobblegolem",
            level: 52,
            trained: 1,
          },
          {
            id: "acidgrin",
            level: 52,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "hullbreaker",
            level: 53,
            trained: 2,
          },
          {
            id: "neutronmaul",
            level: 53,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — DARK HARBOR",
        enemies: [
          {
            id: "aetherbell",
            level: 54,
            trained: 3,
          },
          {
            id: "shadowfang",
            level: 54,
            trained: 3,
          },
          {
            id: "permafrostmk",
            level: 54,
            trained: 3,
          },
          {
            id: "darkharbor",
            level: 56,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 51405,
      xp: 10201,
      robot: "darkharbor",
      item: "mega_repair",
      itemQty: 3,
    },
    replayGold: 13365,
    station: "station_dojo_2",
    x: 2205,
    y: 3866,
  },
  {
    id: "t_ironpilgrim",
    name: "COPA IRON PILGRIM",
    arena: "dojo",
    element: "PEREGRINO",
    desc: "Circuito de Peregrino — enfrente IRON PILGRIM na final e conquiste seu chassi.",
    requiredLevel: 52,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "bramblewrath",
            level: 52,
            trained: 0,
          },
          {
            id: "junglemaw",
            level: 52,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "tarpitfiend",
            level: 53,
            trained: 1,
          },
          {
            id: "aetherloom",
            level: 53,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "aridfang",
            level: 54,
            trained: 2,
          },
          {
            id: "tarpitfiend",
            level: 54,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — IRON PILGRIM",
        enemies: [
          {
            id: "boneorchestra",
            level: 55,
            trained: 3,
          },
          {
            id: "polarisguard",
            level: 55,
            trained: 3,
          },
          {
            id: "gravebyte",
            level: 55,
            trained: 3,
          },
          {
            id: "ironpilgrim",
            level: 57,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 52510,
      xp: 10422,
      robot: "ironpilgrim",
      item: "mega_repair",
      itemQty: 3,
    },
    replayGold: 13653,
    station: "station_dojo_1",
    x: 2460,
    y: 3875,
  },
  {
    id: "t_neonrunner",
    name: "COPA NEON RUNNER",
    arena: "orbital",
    element: "NEON",
    desc: "Circuito de Neon — enfrente NEON RUNNER na final e conquiste seu chassi.",
    requiredLevel: 53,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "ringwarden",
            level: 53,
            trained: 0,
          },
          {
            id: "astrafox",
            level: 53,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "gravitide",
            level: 54,
            trained: 1,
          },
          {
            id: "quantumecho",
            level: 54,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "prismvector",
            level: 55,
            trained: 2,
          },
          {
            id: "terminuscore",
            level: 55,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — NEON RUNNER",
        enemies: [
          {
            id: "lunargeist",
            level: 56,
            trained: 3,
          },
          {
            id: "acidbloom",
            level: 56,
            trained: 3,
          },
          {
            id: "grimsprocket",
            level: 56,
            trained: 3,
          },
          {
            id: "neonrunner",
            level: 58,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 53610,
      xp: 10642,
      robot: "neonrunner",
      item: "mega_repair",
      itemQty: 3,
    },
    replayGold: 13939,
    station: "station_orbital_2",
    x: 2772,
    y: 3901,
  },
  {
    id: "t_dunemaw",
    name: "COPA DUNE MAW",
    arena: "dojo",
    element: "AREIA MOVEDIÇA",
    desc: "Circuito de Areia Movediça — enfrente DUNE MAW na final e conquiste seu chassi.",
    requiredLevel: 54,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "bramblewrath",
            level: 54,
            trained: 0,
          },
          {
            id: "graphenex",
            level: 54,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "dustmoth",
            level: 55,
            trained: 1,
          },
          {
            id: "mireclad",
            level: 55,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "nightjarx",
            level: 56,
            trained: 2,
          },
          {
            id: "noxfeather",
            level: 56,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — DUNE MAW",
        enemies: [
          {
            id: "silkarachne",
            level: 57,
            trained: 3,
          },
          {
            id: "silentquill",
            level: 57,
            trained: 3,
          },
          {
            id: "vireoblade",
            level: 57,
            trained: 3,
          },
          {
            id: "dunemaw",
            level: 59,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 54715,
      xp: 10863,
      robot: "dunemaw",
      item: "mega_repair",
      itemQty: 3,
    },
    replayGold: 14226,
    station: "station_dojo_1",
    x: 3052,
    y: 3880,
  },
  {
    id: "t_emberveilla",
    name: "COPA EMBER VEILLA",
    arena: "dojo",
    element: "FOGO FATUO",
    desc: "Circuito de Fogo Fatuo — enfrente EMBER VEILLA na final e conquiste seu chassi.",
    requiredLevel: 55,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "polarisguard",
            level: 55,
            trained: 0,
          },
          {
            id: "polarisguard",
            level: 55,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "sporeherald",
            level: 56,
            trained: 1,
          },
          {
            id: "hydroquake",
            level: 56,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "quarrybreaker",
            level: 57,
            trained: 2,
          },
          {
            id: "boulderox",
            level: 57,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — EMBER VEILLA",
        enemies: [
          {
            id: "ravenousbloom",
            level: 58,
            trained: 3,
          },
          {
            id: "ruinwarden",
            level: 58,
            trained: 3,
          },
          {
            id: "nightjarx",
            level: 58,
            trained: 3,
          },
          {
            id: "emberveilla",
            level: 60,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 55825,
      xp: 11085,
      robot: "emberveilla",
      item: "mega_repair",
      itemQty: 3,
    },
    replayGold: 14514,
    station: "station_dojo_3",
    x: 3273,
    y: 3899,
  },
  {
    id: "t_lanternghast",
    name: "COPA LANTERN GHAST",
    arena: "dojo",
    element: "ALMA",
    desc: "Circuito de Alma — enfrente LANTERN GHAST na final e conquiste seu chassi.",
    requiredLevel: 57,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "mirageblade",
            level: 57,
            trained: 0,
          },
          {
            id: "reefsovereign",
            level: 57,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "silentquill",
            level: 58,
            trained: 1,
          },
          {
            id: "carrionvex",
            level: 58,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "pulsarcore",
            level: 59,
            trained: 2,
          },
          {
            id: "gridrunner",
            level: 59,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — LANTERN GHAST",
        enemies: [
          {
            id: "vireoblade",
            level: 60,
            trained: 3,
          },
          {
            id: "emberlotus",
            level: 60,
            trained: 3,
          },
          {
            id: "ringwarden",
            level: 60,
            trained: 3,
          },
          {
            id: "lanternghast",
            level: 62,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 58045,
      xp: 11529,
      robot: "lanternghast",
      item: "mega_repair",
      itemQty: 3,
    },
    replayGold: 15092,
    station: "station_dojo_1",
    x: 3251,
    y: 4139,
  },
  {
    id: "t_plasmoth",
    name: "COPA PLASMOTH",
    arena: "volcano",
    element: "PLASMA",
    desc: "Circuito de Plasma — enfrente PLASMOTH na final e conquiste seu chassi.",
    requiredLevel: 58,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "ashenhound",
            level: 58,
            trained: 0,
          },
          {
            id: "fenrisbyte",
            level: 58,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "meteorpunch",
            level: 59,
            trained: 1,
          },
          {
            id: "graphenex",
            level: 59,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "scrapjaw",
            level: 60,
            trained: 2,
          },
          {
            id: "obsidianfang",
            level: 60,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — PLASMOTH",
        enemies: [
          {
            id: "ruinwarden",
            level: 61,
            trained: 3,
          },
          {
            id: "toxinvore",
            level: 61,
            trained: 3,
          },
          {
            id: "pyreconclave",
            level: 61,
            trained: 3,
          },
          {
            id: "plasmoth",
            level: 63,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 59160,
      xp: 11752,
      robot: "plasmoth",
      item: "mega_repair",
      itemQty: 3,
    },
    replayGold: 15382,
    station: "station_volcano_1",
    x: 2997,
    y: 4152,
  },
  {
    id: "t_thunderbison",
    name: "COPA THUNDER BISON",
    arena: "sky",
    element: "TROVAO",
    desc: "Circuito de Trovao — enfrente THUNDER BISON na final e conquiste seu chassi.",
    requiredLevel: 59,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "tarpitfiend",
            level: 59,
            trained: 0,
          },
          {
            id: "stratoveil",
            level: 59,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "cloudpiercer",
            level: 60,
            trained: 1,
          },
          {
            id: "tempestcoil",
            level: 60,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "hailstriker",
            level: 61,
            trained: 2,
          },
          {
            id: "chronowake",
            level: 61,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — THUNDER BISON",
        enemies: [
          {
            id: "solarixprime",
            level: 62,
            trained: 3,
          },
          {
            id: "tempestcrown",
            level: 62,
            trained: 3,
          },
          {
            id: "heliondriver",
            level: 62,
            trained: 3,
          },
          {
            id: "thunderbison",
            level: 64,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 60275,
      xp: 11975,
      robot: "thunderbison",
      item: "mega_repair",
      itemQty: 3,
    },
    replayGold: 15672,
    station: "station_sky_2",
    x: 2753,
    y: 4170,
  },
  {
    id: "t_brasslion",
    name: "COPA BRASS LION",
    arena: "dojo",
    element: "LATAO",
    desc: "Circuito de Latao — enfrente BRASS LION na final e conquiste seu chassi.",
    requiredLevel: 60,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "stygianox",
            level: 60,
            trained: 0,
          },
          {
            id: "pulsarcore",
            level: 60,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "venomcoil",
            level: 61,
            trained: 1,
          },
          {
            id: "mirageblade",
            level: 61,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "skyreef",
            level: 62,
            trained: 2,
          },
          {
            id: "carrionvex",
            level: 62,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — BRASS LION",
        enemies: [
          {
            id: "lumenblade",
            level: 63,
            trained: 3,
          },
          {
            id: "nightjarx",
            level: 63,
            trained: 3,
          },
          {
            id: "mirageblade",
            level: 63,
            trained: 3,
          },
          {
            id: "brasslion",
            level: 65,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 61390,
      xp: 12198,
      robot: "brasslion",
      item: "mega_repair",
      itemQty: 3,
    },
    replayGold: 15961,
    station: "station_dojo_2",
    x: 2475,
    y: 4138,
  },
  {
    id: "t_aurumtitan",
    name: "COPA AURUM TITAN",
    arena: "dojo",
    element: "OURO",
    desc: "Circuito de Ouro — enfrente AURUM TITAN na final e conquiste seu chassi.",
    requiredLevel: 61,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "swiftgale",
            level: 61,
            trained: 0,
          },
          {
            id: "basaltgore",
            level: 61,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "noxfeather",
            level: 62,
            trained: 1,
          },
          {
            id: "nightjarx",
            level: 62,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "shadowfang",
            level: 63,
            trained: 2,
          },
          {
            id: "kelpwarden",
            level: 63,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — AURUM TITAN",
        enemies: [
          {
            id: "quartzine",
            level: 64,
            trained: 3,
          },
          {
            id: "carrionvex",
            level: 64,
            trained: 3,
          },
          {
            id: "ashenrevenant",
            level: 64,
            trained: 3,
          },
          {
            id: "aurumtitan",
            level: 66,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 62510,
      xp: 12422,
      robot: "aurumtitan",
      item: "mega_repair",
      itemQty: 3,
    },
    replayGold: 16253,
    station: "station_dojo_2",
    x: 2193,
    y: 4132,
  },
  {
    id: "t_dreadnought",
    name: "COPA DREADNOUGHT X",
    arena: "dojo",
    element: "GUERRA",
    desc: "Circuito de Guerra — enfrente DREADNOUGHT X na final e conquiste seu chassi.",
    requiredLevel: 62,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "titanbulwark",
            level: 62,
            trained: 0,
          },
          {
            id: "silentquill",
            level: 62,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "bioreaper",
            level: 63,
            trained: 1,
          },
          {
            id: "gearwidow",
            level: 63,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "stonewhisker",
            level: 64,
            trained: 2,
          },
          {
            id: "stygianox",
            level: 64,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — DREADNOUGHT X",
        enemies: [
          {
            id: "nullpriest",
            level: 65,
            trained: 3,
          },
          {
            id: "coralshiv",
            level: 65,
            trained: 3,
          },
          {
            id: "emberveilla",
            level: 65,
            trained: 3,
          },
          {
            id: "dreadnought",
            level: 67,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 63630,
      xp: 12646,
      robot: "dreadnought",
      item: "mega_repair",
      itemQty: 3,
    },
    replayGold: 16544,
    station: "station_dojo_1",
    x: 1960,
    y: 4153,
  },
  {
    id: "t_titanforge",
    name: "COPA TITAN FORGE",
    arena: "volcano",
    element: "FORJA",
    desc: "Circuito de Forja — enfrente TITAN FORGE na final e conquiste seu chassi.",
    requiredLevel: 63,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "lavabastion",
            level: 63,
            trained: 0,
          },
          {
            id: "obsidianfist",
            level: 63,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "tempestcrown",
            level: 64,
            trained: 1,
          },
          {
            id: "acidgrin",
            level: 64,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "swiftgale",
            level: 65,
            trained: 2,
          },
          {
            id: "blastfurnace",
            level: 65,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — TITAN FORGE",
        enemies: [
          {
            id: "ashenrevenant",
            level: 66,
            trained: 3,
          },
          {
            id: "ashenrevenant",
            level: 66,
            trained: 3,
          },
          {
            id: "rustsaurus",
            level: 66,
            trained: 3,
          },
          {
            id: "titanforge",
            level: 68,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 64755,
      xp: 12871,
      robot: "titanforge",
      item: "mega_repair",
      itemQty: 3,
    },
    replayGold: 16836,
    station: "station_volcano_1",
    x: 1647,
    y: 4184,
  },
  {
    id: "t_skyforgewing",
    name: "COPA SKYFORGE WING",
    arena: "dojo",
    element: "CEU",
    desc: "Circuito de Ceu — enfrente SKYFORGE WING na final e conquiste seu chassi.",
    requiredLevel: 64,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "shadowfang",
            level: 64,
            trained: 0,
          },
          {
            id: "harvestking",
            level: 64,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "silentquill",
            level: 65,
            trained: 1,
          },
          {
            id: "grimquill",
            level: 65,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "dunemaw",
            level: 66,
            trained: 2,
          },
          {
            id: "quakejaw",
            level: 66,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — SKYFORGE WING",
        enemies: [
          {
            id: "venomcoil",
            level: 67,
            trained: 3,
          },
          {
            id: "ferrovax",
            level: 67,
            trained: 3,
          },
          {
            id: "titanbulwark",
            level: 67,
            trained: 3,
          },
          {
            id: "skyforgewing",
            level: 69,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 65880,
      xp: 13096,
      robot: "skyforgewing",
      item: "mega_repair",
      itemQty: 3,
    },
    replayGold: 17129,
    station: "station_dojo_2",
    x: 1371,
    y: 4184,
  },
  {
    id: "t_clockthrone",
    name: "COPA CLOCK THRONE",
    arena: "dojo",
    element: "ENGRENAGEM",
    desc: "Circuito de Engrenagem — enfrente CLOCK THRONE na final e conquiste seu chassi.",
    requiredLevel: 65,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "venomcoil",
            level: 65,
            trained: 0,
          },
          {
            id: "marblesaint",
            level: 65,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "carrionvex",
            level: 66,
            trained: 1,
          },
          {
            id: "venomcoil",
            level: 66,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "boulderox",
            level: 67,
            trained: 2,
          },
          {
            id: "ironpilgrim",
            level: 67,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — CLOCK THRONE",
        enemies: [
          {
            id: "skyforgewing",
            level: 68,
            trained: 3,
          },
          {
            id: "cosmoveil",
            level: 68,
            trained: 3,
          },
          {
            id: "darkharbor",
            level: 68,
            trained: 3,
          },
          {
            id: "clockthrone",
            level: 70,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 67005,
      xp: 13321,
      robot: "clockthrone",
      item: "mega_repair",
      itemQty: 3,
    },
    replayGold: 17421,
    station: "station_dojo_3",
    x: 1113,
    y: 4133,
  },
  {
    id: "t_aurorafin",
    name: "COPA AURORA FIN",
    arena: "orbital",
    element: "AURORA",
    desc: "Circuito de Aurora — enfrente AURORA FIN na final e conquiste seu chassi.",
    requiredLevel: 66,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "magnetarfist",
            level: 66,
            trained: 0,
          },
          {
            id: "gridrunner",
            level: 66,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "magnetarch",
            level: 67,
            trained: 1,
          },
          {
            id: "gravitide",
            level: 67,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "voltcarnyx",
            level: 68,
            trained: 2,
          },
          {
            id: "basaltgore",
            level: 68,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — AURORA FIN",
        enemies: [
          {
            id: "abyssalord",
            level: 69,
            trained: 3,
          },
          {
            id: "nebulaseer",
            level: 69,
            trained: 3,
          },
          {
            id: "chronofracture",
            level: 69,
            trained: 3,
          },
          {
            id: "aurorafin",
            level: 71,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 68135,
      xp: 13547,
      robot: "aurorafin",
      item: "mega_repair",
      itemQty: 3,
    },
    replayGold: 17715,
    station: "station_orbital_3",
    x: 869,
    y: 4112,
  },
  {
    id: "t_scarabking",
    name: "COPA SCARAB KING",
    arena: "dojo",
    element: "BESOURO",
    desc: "Circuito de Besouro — enfrente SCARAB KING na final e conquiste seu chassi.",
    requiredLevel: 67,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "orbitalance",
            level: 67,
            trained: 0,
          },
          {
            id: "boulderox",
            level: 67,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "boulderox",
            level: 68,
            trained: 1,
          },
          {
            id: "lanternghast",
            level: 68,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "boneorchestra",
            level: 69,
            trained: 2,
          },
          {
            id: "stratoveil",
            level: 69,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — SCARAB KING",
        enemies: [
          {
            id: "neonrunner",
            level: 70,
            trained: 3,
          },
          {
            id: "grimsprocket",
            level: 70,
            trained: 3,
          },
          {
            id: "stelladrake",
            level: 70,
            trained: 3,
          },
          {
            id: "scarabking",
            level: 72,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 69265,
      xp: 13773,
      robot: "scarabking",
      item: "mega_repair",
      itemQty: 3,
    },
    replayGold: 18009,
    station: "station_dojo_1",
    x: 625,
    y: 4128,
  },
  {
    id: "t_photonveil",
    name: "COPA PHOTON VEIL",
    arena: "orbital",
    element: "FOTON",
    desc: "Circuito de Foton — enfrente PHOTON VEIL na final e conquiste seu chassi.",
    requiredLevel: 68,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "terminuscore",
            level: 68,
            trained: 0,
          },
          {
            id: "nebulaseer",
            level: 68,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "snowreaver",
            level: 69,
            trained: 1,
          },
          {
            id: "maelstromfist",
            level: 69,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "cosmoveil",
            level: 70,
            trained: 2,
          },
          {
            id: "graphenex",
            level: 70,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — PHOTON VEIL",
        enemies: [
          {
            id: "nullpriest",
            level: 71,
            trained: 3,
          },
          {
            id: "gloomtide",
            level: 71,
            trained: 3,
          },
          {
            id: "orbitalmarshal",
            level: 71,
            trained: 3,
          },
          {
            id: "photonveil",
            level: 73,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 70395,
      xp: 13999,
      robot: "photonveil",
      item: "power_chip",
      itemQty: 2,
    },
    replayGold: 18303,
    station: "station_orbital_3",
    x: 324,
    y: 4169,
  },
  {
    id: "t_crimsonaria",
    name: "COPA CRIMSON ARIA",
    arena: "dojo",
    element: "SANGUE",
    desc: "Circuito de Sangue — enfrente CRIMSON ARIA na final e conquiste seu chassi.",
    requiredLevel: 69,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "acidbloom",
            level: 69,
            trained: 0,
          },
          {
            id: "darkharbor",
            level: 69,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "gearwidow",
            level: 70,
            trained: 1,
          },
          {
            id: "vireoblade",
            level: 70,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "nightjarx",
            level: 71,
            trained: 2,
          },
          {
            id: "aurumtitan",
            level: 71,
            trained: 2,
          },
        ],
      },
      {
        name: "FINAL — CRIMSON ARIA",
        enemies: [
          {
            id: "quarrybreaker",
            level: 72,
            trained: 3,
          },
          {
            id: "grimquill",
            level: 72,
            trained: 3,
          },
          {
            id: "junglemaw",
            level: 72,
            trained: 3,
          },
          {
            id: "crimsonaria",
            level: 74,
            trained: 4,
          },
        ],
      },
    ],
    reward: {
      gold: 71530,
      xp: 14226,
      robot: "crimsonaria",
      item: "power_chip",
      itemQty: 2,
    },
    replayGold: 18598,
    station: "station_dojo_2",
    x: 319,
    y: 4403,
  },
  {
    id: "t_meteorachi",
    name: "COPA METEORACHI",
    arena: "volcano",
    element: "METEORO",
    desc: "Circuito de Meteoro — enfrente METEORACHI na final e conquiste seu chassi.",
    requiredLevel: 70,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "cometfang",
            level: 70,
            trained: 0,
          },
          {
            id: "vulcanargo",
            level: 70,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "marblesaint",
            level: 71,
            trained: 1,
          },
          {
            id: "mycelor",
            level: 71,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "mudlarker",
            level: 72,
            trained: 2,
          },
          {
            id: "emberlash",
            level: 72,
            trained: 2,
          },
        ],
      },
      {
        name: "SEMIFINAL",
        enemies: [
          {
            id: "emberkite",
            level: 73,
            trained: 3,
          },
          {
            id: "vulcanargo",
            level: 73,
            trained: 3,
          },
        ],
      },
      {
        name: "FINAL — METEORACHI",
        enemies: [
          {
            id: "heliondriver",
            level: 74,
            trained: 4,
          },
          {
            id: "emberlash",
            level: 74,
            trained: 4,
          },
          {
            id: "ashenrevenant",
            level: 74,
            trained: 4,
          },
          {
            id: "meteorachi",
            level: 76,
            trained: 5,
          },
        ],
      },
    ],
    reward: {
      gold: 72660,
      xp: 14452,
      robot: "meteorachi",
      item: "power_chip",
      itemQty: 2,
    },
    replayGold: 18892,
    station: "station_volcano_1",
    x: 551,
    y: 4421,
  },
  {
    id: "t_magmaticus",
    name: "COPA MAGMATICUS",
    arena: "volcano",
    element: "MAGMA",
    desc: "Circuito de Magma — enfrente MAGMATICUS na final e conquiste seu chassi.",
    requiredLevel: 71,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "forgeheart",
            level: 71,
            trained: 0,
          },
          {
            id: "cindercrown",
            level: 71,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "cometfang",
            level: 72,
            trained: 1,
          },
          {
            id: "meteorpunch",
            level: 72,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "meteorachi",
            level: 73,
            trained: 2,
          },
          {
            id: "plasmawraith",
            level: 73,
            trained: 2,
          },
        ],
      },
      {
        name: "SEMIFINAL",
        enemies: [
          {
            id: "obsidianfist",
            level: 74,
            trained: 3,
          },
          {
            id: "meteorpunch",
            level: 74,
            trained: 3,
          },
        ],
      },
      {
        name: "FINAL — MAGMATICUS",
        enemies: [
          {
            id: "emberkite",
            level: 75,
            trained: 4,
          },
          {
            id: "hexweaver",
            level: 75,
            trained: 4,
          },
          {
            id: "forgeheart",
            level: 75,
            trained: 4,
          },
          {
            id: "magmaticus",
            level: 77,
            trained: 5,
          },
        ],
      },
    ],
    reward: {
      gold: 73800,
      xp: 14680,
      robot: "magmaticus",
      item: "power_chip",
      itemQty: 2,
    },
    replayGold: 19188,
    station: "station_volcano_2",
    x: 869,
    y: 4377,
  },
  {
    id: "t_nebulynx",
    name: "COPA NEBULYNX",
    arena: "orbital",
    element: "NEBULOSA",
    desc: "Circuito de Nebulosa — enfrente NEBULYNX na final e conquiste seu chassi.",
    requiredLevel: 72,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "gridrunner",
            level: 72,
            trained: 0,
          },
          {
            id: "pulsarcore",
            level: 72,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "abyssalord",
            level: 73,
            trained: 1,
          },
          {
            id: "shadowfang",
            level: 73,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "astrafox",
            level: 74,
            trained: 2,
          },
          {
            id: "astrafox",
            level: 74,
            trained: 2,
          },
        ],
      },
      {
        name: "SEMIFINAL",
        enemies: [
          {
            id: "gloomtide",
            level: 75,
            trained: 3,
          },
          {
            id: "amberlock",
            level: 75,
            trained: 3,
          },
        ],
      },
      {
        name: "FINAL — NEBULYNX",
        enemies: [
          {
            id: "gravitide",
            level: 76,
            trained: 4,
          },
          {
            id: "gearwidow",
            level: 76,
            trained: 4,
          },
          {
            id: "magnashrike",
            level: 76,
            trained: 4,
          },
          {
            id: "nebulynx",
            level: 78,
            trained: 5,
          },
        ],
      },
    ],
    reward: {
      gold: 74935,
      xp: 14907,
      robot: "nebulynx",
      item: "power_chip",
      itemQty: 2,
    },
    replayGold: 19483,
    station: "station_orbital_3",
    x: 1126,
    y: 4431,
  },
  {
    id: "t_cobaltronin",
    name: "COPA COBALT RONIN",
    arena: "dojo",
    element: "AÇO AZUL",
    desc: "Circuito de Aço Azul — enfrente COBALT RONIN na final e conquiste seu chassi.",
    requiredLevel: 74,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "gloomtide",
            level: 74,
            trained: 0,
          },
          {
            id: "bogmire",
            level: 74,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "boltbunny",
            level: 75,
            trained: 1,
          },
          {
            id: "plasmoth",
            level: 75,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "dustmoth",
            level: 76,
            trained: 2,
          },
          {
            id: "clockthrone",
            level: 76,
            trained: 2,
          },
        ],
      },
      {
        name: "SEMIFINAL",
        enemies: [
          {
            id: "basaltgore",
            level: 77,
            trained: 3,
          },
          {
            id: "skyloomweaver",
            level: 77,
            trained: 3,
          },
        ],
      },
      {
        name: "FINAL — COBALT RONIN",
        enemies: [
          {
            id: "aetherbell",
            level: 78,
            trained: 4,
          },
          {
            id: "terraforge",
            level: 78,
            trained: 4,
          },
          {
            id: "obeliskar",
            level: 78,
            trained: 4,
          },
          {
            id: "cobaltronin",
            level: 80,
            trained: 5,
          },
        ],
      },
    ],
    reward: {
      gold: 77215,
      xp: 15363,
      robot: "cobaltronin",
      item: "power_chip",
      itemQty: 2,
    },
    replayGold: 20076,
    station: "station_dojo_1",
    x: 1404,
    y: 4377,
  },
  {
    id: "t_frostmourn",
    name: "COPA FROST MOURN",
    arena: "dojo",
    element: "LAMENTO",
    desc: "Circuito de Lamento — enfrente FROST MOURN na final e conquiste seu chassi.",
    requiredLevel: 75,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "toxinvore",
            level: 75,
            trained: 0,
          },
          {
            id: "sporeherald",
            level: 75,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "boilerbrute",
            level: 76,
            trained: 1,
          },
          {
            id: "cobaltronin",
            level: 76,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "mudlarker",
            level: 77,
            trained: 2,
          },
          {
            id: "boltbunny",
            level: 77,
            trained: 2,
          },
        ],
      },
      {
        name: "SEMIFINAL",
        enemies: [
          {
            id: "venomcoil",
            level: 78,
            trained: 3,
          },
          {
            id: "emberfang",
            level: 78,
            trained: 3,
          },
        ],
      },
      {
        name: "FINAL — FROST MOURN",
        enemies: [
          {
            id: "boreaxe",
            level: 79,
            trained: 4,
          },
          {
            id: "gearwidow",
            level: 79,
            trained: 4,
          },
          {
            id: "voltronin",
            level: 79,
            trained: 4,
          },
          {
            id: "frostmourn",
            level: 81,
            trained: 5,
          },
        ],
      },
    ],
    reward: {
      gold: 78360,
      xp: 15592,
      robot: "frostmourn",
      item: "power_chip",
      itemQty: 2,
    },
    replayGold: 20374,
    station: "station_dojo_1",
    x: 1693,
    y: 4378,
  },
  {
    id: "t_prismblade",
    name: "COPA PRISM BLADE",
    arena: "dojo",
    element: "ARCO-IRIS",
    desc: "Circuito de Arco-Iris — enfrente PRISM BLADE na final e conquiste seu chassi.",
    requiredLevel: 76,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "windshear",
            level: 76,
            trained: 0,
          },
          {
            id: "kelpwarden",
            level: 76,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "ravenousbloom",
            level: 77,
            trained: 1,
          },
          {
            id: "stormfang",
            level: 77,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "boneorchestra",
            level: 78,
            trained: 2,
          },
          {
            id: "ironpilgrim",
            level: 78,
            trained: 2,
          },
        ],
      },
      {
        name: "SEMIFINAL",
        enemies: [
          {
            id: "cobblegolem",
            level: 79,
            trained: 3,
          },
          {
            id: "ashenhound",
            level: 79,
            trained: 3,
          },
        ],
      },
      {
        name: "FINAL — PRISM BLADE",
        enemies: [
          {
            id: "cobaltronin",
            level: 80,
            trained: 4,
          },
          {
            id: "neondrifter",
            level: 80,
            trained: 4,
          },
          {
            id: "gearwidow",
            level: 80,
            trained: 4,
          },
          {
            id: "prismblade",
            level: 82,
            trained: 5,
          },
        ],
      },
    ],
    reward: {
      gold: 79505,
      xp: 15821,
      robot: "prismblade",
      item: "power_chip",
      itemQty: 2,
    },
    replayGold: 20671,
    station: "station_dojo_2",
    x: 1971,
    y: 4402,
  },
  {
    id: "t_zenithara",
    name: "COPA ZENITHARA",
    arena: "orbital",
    element: "ZENITE",
    desc: "Circuito de Zenite — enfrente ZENITHARA na final e conquiste seu chassi.",
    requiredLevel: 77,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "neutronmaul",
            level: 77,
            trained: 0,
          },
          {
            id: "cosmoveil",
            level: 77,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "seraphimvoid",
            level: 78,
            trained: 1,
          },
          {
            id: "reefsovereign",
            level: 78,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "magnetarfist",
            level: 79,
            trained: 2,
          },
          {
            id: "gridrunner",
            level: 79,
            trained: 2,
          },
        ],
      },
      {
        name: "SEMIFINAL",
        enemies: [
          {
            id: "nightjarx",
            level: 80,
            trained: 3,
          },
          {
            id: "aetherloom",
            level: 80,
            trained: 3,
          },
        ],
      },
      {
        name: "FINAL — ZENITHARA",
        enemies: [
          {
            id: "nebulaseer",
            level: 81,
            trained: 4,
          },
          {
            id: "bogtyrant",
            level: 81,
            trained: 4,
          },
          {
            id: "terminuscore",
            level: 81,
            trained: 4,
          },
          {
            id: "zenithara",
            level: 83,
            trained: 5,
          },
        ],
      },
    ],
    reward: {
      gold: 80650,
      xp: 16050,
      robot: "zenithara",
      item: "power_chip",
      itemQty: 2,
    },
    replayGold: 20969,
    station: "station_orbital_3",
    x: 2182,
    y: 4414,
  },
  {
    id: "t_circuitmonk",
    name: "COPA CIRCUIT MONK",
    arena: "dojo",
    element: "CIRCUITO",
    desc: "Circuito de Circuito — enfrente CIRCUIT MONK na final e conquiste seu chassi.",
    requiredLevel: 78,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "biolattice",
            level: 78,
            trained: 0,
          },
          {
            id: "crystalquartz",
            level: 78,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "zephyrhalo",
            level: 79,
            trained: 1,
          },
          {
            id: "aridfang",
            level: 79,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "vireoblade",
            level: 80,
            trained: 2,
          },
          {
            id: "dunemaw",
            level: 80,
            trained: 2,
          },
        ],
      },
      {
        name: "SEMIFINAL",
        enemies: [
          {
            id: "quicksilverr",
            level: 81,
            trained: 3,
          },
          {
            id: "tundrakeeper",
            level: 81,
            trained: 3,
          },
        ],
      },
      {
        name: "FINAL — CIRCUIT MONK",
        enemies: [
          {
            id: "skyforgewing",
            level: 82,
            trained: 4,
          },
          {
            id: "scrapjaw",
            level: 82,
            trained: 4,
          },
          {
            id: "frostmourn",
            level: 82,
            trained: 4,
          },
          {
            id: "circuitmonk",
            level: 84,
            trained: 5,
          },
        ],
      },
    ],
    reward: {
      gold: 81795,
      xp: 16279,
      robot: "circuitmonk",
      item: "power_chip",
      itemQty: 2,
    },
    replayGold: 21267,
    station: "station_dojo_1",
    x: 2464,
    y: 4400,
  },
  {
    id: "t_glacierarch",
    name: "COPA GLACIER ARCH",
    arena: "dojo",
    element: "GLACIAL",
    desc: "Circuito de Glacial — enfrente GLACIER ARCH na final e conquiste seu chassi.",
    requiredLevel: 79,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "ravenousbloom",
            level: 79,
            trained: 0,
          },
          {
            id: "solarixprime",
            level: 79,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "fenrisbyte",
            level: 80,
            trained: 1,
          },
          {
            id: "harvestking",
            level: 80,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "eclipsar",
            level: 81,
            trained: 2,
          },
          {
            id: "boilerbrute",
            level: 81,
            trained: 2,
          },
        ],
      },
      {
        name: "SEMIFINAL",
        enemies: [
          {
            id: "nullshade",
            level: 82,
            trained: 3,
          },
          {
            id: "swiftgale",
            level: 82,
            trained: 3,
          },
        ],
      },
      {
        name: "FINAL — GLACIER ARCH",
        enemies: [
          {
            id: "grimquill",
            level: 83,
            trained: 4,
          },
          {
            id: "emberlotus",
            level: 83,
            trained: 4,
          },
          {
            id: "mirageblade",
            level: 83,
            trained: 4,
          },
          {
            id: "glacierarch",
            level: 85,
            trained: 5,
          },
        ],
      },
    ],
    reward: {
      gold: 82945,
      xp: 16509,
      robot: "glacierarch",
      item: "power_chip",
      itemQty: 2,
    },
    replayGold: 21566,
    station: "station_dojo_2",
    x: 2781,
    y: 4432,
  },
  {
    id: "t_halcyonix",
    name: "COPA HALCYONIX",
    arena: "dojo",
    element: "CALMARIA",
    desc: "Circuito de Calmaria — enfrente HALCYONIX na final e conquiste seu chassi.",
    requiredLevel: 80,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "shadowfang",
            level: 80,
            trained: 0,
          },
          {
            id: "mudlarker",
            level: 80,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "glacierarch",
            level: 81,
            trained: 1,
          },
          {
            id: "tempestcrown",
            level: 81,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "dreadnought",
            level: 82,
            trained: 2,
          },
          {
            id: "kelpwarden",
            level: 82,
            trained: 2,
          },
        ],
      },
      {
        name: "SEMIFINAL",
        enemies: [
          {
            id: "sandwyrm",
            level: 83,
            trained: 3,
          },
          {
            id: "aridfang",
            level: 83,
            trained: 3,
          },
        ],
      },
      {
        name: "FINAL — HALCYONIX",
        enemies: [
          {
            id: "quakejaw",
            level: 84,
            trained: 4,
          },
          {
            id: "stygianox",
            level: 84,
            trained: 4,
          },
          {
            id: "obeliskar",
            level: 84,
            trained: 4,
          },
          {
            id: "halcyonix",
            level: 86,
            trained: 5,
          },
        ],
      },
    ],
    reward: {
      gold: 84095,
      xp: 16739,
      robot: "halcyonix",
      item: "power_chip",
      itemQty: 2,
    },
    replayGold: 21865,
    station: "station_dojo_2",
    x: 3016,
    y: 4371,
  },
  {
    id: "t_pyreherald",
    name: "COPA PYRE HERALD",
    arena: "dojo",
    element: "PIRA",
    desc: "Circuito de Pira — enfrente PYRE HERALD na final e conquiste seu chassi.",
    requiredLevel: 81,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "cobaltronin",
            level: 81,
            trained: 0,
          },
          {
            id: "tarpitfiend",
            level: 81,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "mirageblade",
            level: 82,
            trained: 1,
          },
          {
            id: "emberveilla",
            level: 82,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "kelpwarden",
            level: 83,
            trained: 2,
          },
          {
            id: "gravebyte",
            level: 83,
            trained: 2,
          },
        ],
      },
      {
        name: "SEMIFINAL",
        enemies: [
          {
            id: "stygianox",
            level: 84,
            trained: 3,
          },
          {
            id: "nebulaseer",
            level: 84,
            trained: 3,
          },
        ],
      },
      {
        name: "FINAL — PYRE HERALD",
        enemies: [
          {
            id: "sporeherald",
            level: 85,
            trained: 4,
          },
          {
            id: "nebulynx",
            level: 85,
            trained: 4,
          },
          {
            id: "tempestcoil",
            level: 85,
            trained: 4,
          },
          {
            id: "pyreherald",
            level: 87,
            trained: 5,
          },
        ],
      },
    ],
    reward: {
      gold: 85245,
      xp: 16969,
      robot: "pyreherald",
      item: "power_chip",
      itemQty: 2,
    },
    replayGold: 22164,
    station: "station_dojo_2",
    x: 3265,
    y: 4418,
  },
  {
    id: "t_shogunplate",
    name: "COPA SHOGUN PLATE",
    arena: "dojo",
    element: "SAMURAI",
    desc: "Circuito de Samurai — enfrente SHOGUN PLATE na final e conquiste seu chassi.",
    requiredLevel: 82,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "boreaxe",
            level: 82,
            trained: 0,
          },
          {
            id: "wispkin",
            level: 82,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "titanforge",
            level: 83,
            trained: 1,
          },
          {
            id: "cobaltronin",
            level: 83,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "crimsonaria",
            level: 84,
            trained: 2,
          },
          {
            id: "obeliskar",
            level: 84,
            trained: 2,
          },
        ],
      },
      {
        name: "SEMIFINAL",
        enemies: [
          {
            id: "aurumtitan",
            level: 85,
            trained: 3,
          },
          {
            id: "hydroquake",
            level: 85,
            trained: 3,
          },
        ],
      },
      {
        name: "FINAL — SHOGUN PLATE",
        enemies: [
          {
            id: "hydroquake",
            level: 86,
            trained: 4,
          },
          {
            id: "fenrisbyte",
            level: 86,
            trained: 4,
          },
          {
            id: "frostmourn",
            level: 86,
            trained: 4,
          },
          {
            id: "shogunplate",
            level: 88,
            trained: 5,
          },
        ],
      },
    ],
    reward: {
      gold: 86400,
      xp: 17200,
      robot: "shogunplate",
      item: "power_chip",
      itemQty: 2,
    },
    replayGold: 22464,
    station: "station_dojo_2",
    x: 3323,
    y: 4684,
  },
  {
    id: "t_furnaceoni",
    name: "COPA FURNACE ONI",
    arena: "volcano",
    element: "INFERNO",
    desc: "Circuito de Inferno — enfrente FURNACE ONI na final e conquiste seu chassi.",
    requiredLevel: 83,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "ashenrevenant",
            level: 83,
            trained: 0,
          },
          {
            id: "boulderox",
            level: 83,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "thunderbison",
            level: 84,
            trained: 1,
          },
          {
            id: "basaltguard",
            level: 84,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "ruinwarden",
            level: 85,
            trained: 2,
          },
          {
            id: "ashenhound",
            level: 85,
            trained: 2,
          },
        ],
      },
      {
        name: "SEMIFINAL",
        enemies: [
          {
            id: "emberwing",
            level: 86,
            trained: 3,
          },
          {
            id: "ashenrevenant",
            level: 86,
            trained: 3,
          },
        ],
      },
      {
        name: "FINAL — FURNACE ONI",
        enemies: [
          {
            id: "obsidianfist",
            level: 87,
            trained: 4,
          },
          {
            id: "lavabastion",
            level: 87,
            trained: 4,
          },
          {
            id: "cinderhound",
            level: 87,
            trained: 4,
          },
          {
            id: "furnaceoni",
            level: 89,
            trained: 5,
          },
        ],
      },
    ],
    reward: {
      gold: 87555,
      xp: 17431,
      robot: "furnaceoni",
      item: "power_chip",
      itemQty: 2,
    },
    replayGold: 22764,
    station: "station_volcano_1",
    x: 3053,
    y: 4683,
  },
  {
    id: "t_sandvizier",
    name: "COPA SAND VIZIER",
    arena: "dojo",
    element: "DESERTO",
    desc: "Circuito de Deserto — enfrente SAND VIZIER na final e conquiste seu chassi.",
    requiredLevel: 85,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "darkharbor",
            level: 85,
            trained: 0,
          },
          {
            id: "mycelor",
            level: 85,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "bonemarshal",
            level: 86,
            trained: 1,
          },
          {
            id: "photonveil",
            level: 86,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "terminuscore",
            level: 87,
            trained: 2,
          },
          {
            id: "mycelor",
            level: 87,
            trained: 2,
          },
        ],
      },
      {
        name: "SEMIFINAL",
        enemies: [
          {
            id: "boneorchestra",
            level: 88,
            trained: 3,
          },
          {
            id: "swiftgale",
            level: 88,
            trained: 3,
          },
        ],
      },
      {
        name: "FINAL — SAND VIZIER",
        enemies: [
          {
            id: "terraforge",
            level: 89,
            trained: 4,
          },
          {
            id: "aetherbell",
            level: 89,
            trained: 4,
          },
          {
            id: "bonemarshal",
            level: 89,
            trained: 4,
          },
          {
            id: "sandvizier",
            level: 91,
            trained: 5,
          },
        ],
      },
    ],
    reward: {
      gold: 89865,
      xp: 17893,
      robot: "sandvizier",
      item: "revive_core",
      itemQty: 3,
    },
    replayGold: 23365,
    station: "station_dojo_3",
    x: 2768,
    y: 4622,
  },
  {
    id: "t_sporequeen",
    name: "COPA SPORE QUEEN",
    arena: "dojo",
    element: "ESPORO",
    desc: "Circuito de Esporo — enfrente SPORE QUEEN na final e conquiste seu chassi.",
    requiredLevel: 86,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "pyreconclave",
            level: 86,
            trained: 0,
          },
          {
            id: "clockthrone",
            level: 86,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "bramblewrath",
            level: 87,
            trained: 1,
          },
          {
            id: "lanternghast",
            level: 87,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "skyloomweaver",
            level: 88,
            trained: 2,
          },
          {
            id: "blastfurnace",
            level: 88,
            trained: 2,
          },
        ],
      },
      {
        name: "SEMIFINAL",
        enemies: [
          {
            id: "grimsprocket",
            level: 89,
            trained: 3,
          },
          {
            id: "steelmonk",
            level: 89,
            trained: 3,
          },
        ],
      },
      {
        name: "FINAL — SPORE QUEEN",
        enemies: [
          {
            id: "aridfang",
            level: 90,
            trained: 4,
          },
          {
            id: "mycelor",
            level: 90,
            trained: 4,
          },
          {
            id: "terraforge",
            level: 90,
            trained: 4,
          },
          {
            id: "sporequeen",
            level: 92,
            trained: 5,
          },
        ],
      },
    ],
    reward: {
      gold: 91025,
      xp: 18125,
      robot: "sporequeen",
      item: "revive_core",
      itemQty: 3,
    },
    replayGold: 23666,
    station: "station_dojo_2",
    x: 2509,
    y: 4613,
  },
  {
    id: "t_bastionhold",
    name: "COPA BASTION HOLD",
    arena: "dojo",
    element: "FORTALEZA",
    desc: "Circuito de Fortaleza — enfrente BASTION HOLD na final e conquiste seu chassi.",
    requiredLevel: 87,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "terraforge",
            level: 87,
            trained: 0,
          },
          {
            id: "gearwidow",
            level: 87,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "frostmourn",
            level: 88,
            trained: 1,
          },
          {
            id: "maelstromfist",
            level: 88,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "swiftgale",
            level: 89,
            trained: 2,
          },
          {
            id: "glacierarch",
            level: 89,
            trained: 2,
          },
        ],
      },
      {
        name: "SEMIFINAL",
        enemies: [
          {
            id: "ironsentinel",
            level: 90,
            trained: 3,
          },
          {
            id: "aridfang",
            level: 90,
            trained: 3,
          },
        ],
      },
      {
        name: "FINAL — BASTION HOLD",
        enemies: [
          {
            id: "noxfeather",
            level: 91,
            trained: 4,
          },
          {
            id: "scarabking",
            level: 91,
            trained: 4,
          },
          {
            id: "cloudpiercer",
            level: 91,
            trained: 4,
          },
          {
            id: "bastionhold",
            level: 93,
            trained: 5,
          },
        ],
      },
    ],
    reward: {
      gold: 92185,
      xp: 18357,
      robot: "bastionhold",
      item: "revive_core",
      itemQty: 3,
    },
    replayGold: 23968,
    station: "station_dojo_2",
    x: 2174,
    y: 4647,
  },
  {
    id: "t_cathedron",
    name: "COPA CATHEDRON",
    arena: "dojo",
    element: "CATEDRAL",
    desc: "Circuito de Catedral — enfrente CATHEDRON na final e conquiste seu chassi.",
    requiredLevel: 88,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "emberveilla",
            level: 88,
            trained: 0,
          },
          {
            id: "boneorchestra",
            level: 88,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "ashenhound",
            level: 89,
            trained: 1,
          },
          {
            id: "cobblegolem",
            level: 89,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "obeliskar",
            level: 90,
            trained: 2,
          },
          {
            id: "stygianox",
            level: 90,
            trained: 2,
          },
        ],
      },
      {
        name: "SEMIFINAL",
        enemies: [
          {
            id: "noxfeather",
            level: 91,
            trained: 3,
          },
          {
            id: "emberveilla",
            level: 91,
            trained: 3,
          },
        ],
      },
      {
        name: "FINAL — CATHEDRON",
        enemies: [
          {
            id: "obsidianfist",
            level: 92,
            trained: 4,
          },
          {
            id: "grimquill",
            level: 92,
            trained: 4,
          },
          {
            id: "frostmourn",
            level: 92,
            trained: 4,
          },
          {
            id: "cathedron",
            level: 94,
            trained: 5,
          },
        ],
      },
    ],
    reward: {
      gold: 93345,
      xp: 18589,
      robot: "cathedron",
      item: "revive_core",
      itemQty: 3,
    },
    replayGold: 24270,
    station: "station_dojo_1",
    x: 1975,
    y: 4666,
  },
  {
    id: "t_valkyrune",
    name: "COPA VALKYRUNE",
    arena: "dojo",
    element: "VALQUIRIA",
    desc: "Circuito de Valquiria — enfrente VALKYRUNE na final e conquiste seu chassi.",
    requiredLevel: 89,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "shogunplate",
            level: 89,
            trained: 0,
          },
          {
            id: "silkarachne",
            level: 89,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "sandwyrm",
            level: 90,
            trained: 1,
          },
          {
            id: "tarpitfiend",
            level: 90,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "boreaxe",
            level: 91,
            trained: 2,
          },
          {
            id: "gearwidow",
            level: 91,
            trained: 2,
          },
        ],
      },
      {
        name: "SEMIFINAL",
        enemies: [
          {
            id: "aurumtitan",
            level: 92,
            trained: 3,
          },
          {
            id: "marblesaint",
            level: 92,
            trained: 3,
          },
        ],
      },
      {
        name: "FINAL — VALKYRUNE",
        enemies: [
          {
            id: "nebulaseer",
            level: 93,
            trained: 4,
          },
          {
            id: "brasslion",
            level: 93,
            trained: 4,
          },
          {
            id: "tarpitfiend",
            level: 93,
            trained: 4,
          },
          {
            id: "valkyrune",
            level: 95,
            trained: 5,
          },
        ],
      },
    ],
    reward: {
      gold: 94510,
      xp: 18822,
      robot: "valkyrune",
      item: "revive_core",
      itemQty: 3,
    },
    replayGold: 24573,
    station: "station_dojo_1",
    x: 1645,
    y: 4688,
  },
  {
    id: "t_gravelord",
    name: "COPA GRAVELORD",
    arena: "orbital",
    element: "GRAVIDADE",
    desc: "Circuito de Gravidade — enfrente GRAVELORD na final e conquiste seu chassi.",
    requiredLevel: 90,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "aetherloom",
            level: 90,
            trained: 0,
          },
          {
            id: "eventhorizon",
            level: 90,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "scarabking",
            level: 91,
            trained: 1,
          },
          {
            id: "voidsingularity",
            level: 91,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "orbitalmarshal",
            level: 92,
            trained: 2,
          },
          {
            id: "terminuscore",
            level: 92,
            trained: 2,
          },
        ],
      },
      {
        name: "SEMIFINAL",
        enemies: [
          {
            id: "nebulaseer",
            level: 93,
            trained: 3,
          },
          {
            id: "neutronmaul",
            level: 93,
            trained: 3,
          },
        ],
      },
      {
        name: "FINAL — GRAVELORD",
        enemies: [
          {
            id: "magnashrike",
            level: 94,
            trained: 4,
          },
          {
            id: "toxinvore",
            level: 94,
            trained: 4,
          },
          {
            id: "stelladrake",
            level: 94,
            trained: 4,
          },
          {
            id: "gravelord",
            level: 96,
            trained: 5,
          },
        ],
      },
    ],
    reward: {
      gold: 95675,
      xp: 19055,
      robot: "gravelord",
      item: "revive_core",
      itemQty: 3,
    },
    replayGold: 24876,
    station: "station_orbital_1",
    x: 1417,
    y: 4614,
  },
  {
    id: "t_titanomaw",
    name: "COPA TITANOMAW",
    arena: "dojo",
    element: "TITAN",
    desc: "Circuito de Titan — enfrente TITANOMAW na final e conquiste seu chassi.",
    requiredLevel: 91,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "shogunplate",
            level: 91,
            trained: 0,
          },
          {
            id: "silkarachne",
            level: 91,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "nightjarx",
            level: 92,
            trained: 1,
          },
          {
            id: "venomcoil",
            level: 92,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "scrapjaw",
            level: 93,
            trained: 2,
          },
          {
            id: "scarabking",
            level: 93,
            trained: 2,
          },
        ],
      },
      {
        name: "SEMIFINAL",
        enemies: [
          {
            id: "scarabking",
            level: 94,
            trained: 3,
          },
          {
            id: "ravenousbloom",
            level: 94,
            trained: 3,
          },
        ],
      },
      {
        name: "FINAL — TITANOMAW",
        enemies: [
          {
            id: "nightjarx",
            level: 95,
            trained: 4,
          },
          {
            id: "obeliskar",
            level: 95,
            trained: 4,
          },
          {
            id: "pyreherald",
            level: 95,
            trained: 4,
          },
          {
            id: "titanomaw",
            level: 97,
            trained: 5,
          },
        ],
      },
    ],
    reward: {
      gold: 96840,
      xp: 19288,
      robot: "titanomaw",
      item: "revive_core",
      itemQty: 3,
    },
    replayGold: 25178,
    station: "station_dojo_1",
    x: 1106,
    y: 4688,
  },
  {
    id: "t_voidmantis",
    name: "COPA VOID MANTIS",
    arena: "orbital",
    element: "VAZIO",
    desc: "Circuito de Vazio — enfrente VOID MANTIS na final e conquiste seu chassi.",
    requiredLevel: 92,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "cosmoveil",
            level: 92,
            trained: 0,
          },
          {
            id: "gravitus",
            level: 92,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "solstitia",
            level: 93,
            trained: 1,
          },
          {
            id: "gravelord",
            level: 93,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "aurumtitan",
            level: 94,
            trained: 2,
          },
          {
            id: "abyssalord",
            level: 94,
            trained: 2,
          },
        ],
      },
      {
        name: "SEMIFINAL",
        enemies: [
          {
            id: "astrafox",
            level: 95,
            trained: 3,
          },
          {
            id: "neonrunner",
            level: 95,
            trained: 3,
          },
        ],
      },
      {
        name: "FINAL — VOID MANTIS",
        enemies: [
          {
            id: "nebulynx",
            level: 96,
            trained: 4,
          },
          {
            id: "snowreaver",
            level: 96,
            trained: 4,
          },
          {
            id: "gloomtide",
            level: 96,
            trained: 4,
          },
          {
            id: "voidmantis",
            level: 98,
            trained: 5,
          },
        ],
      },
    ],
    reward: {
      gold: 98005,
      xp: 19521,
      robot: "voidmantis",
      item: "revive_core",
      itemQty: 3,
    },
    replayGold: 25481,
    station: "station_orbital_2",
    x: 897,
    y: 4630,
  },
  {
    id: "t_chronowraith",
    name: "COPA CHRONO WRAITH",
    arena: "orbital",
    element: "TEMPO",
    desc: "Circuito de Tempo — enfrente CHRONO WRAITH na final e conquiste seu chassi.",
    requiredLevel: 93,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "nebulynx",
            level: 93,
            trained: 0,
          },
          {
            id: "pyrokaiser",
            level: 93,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "neutronmaul",
            level: 94,
            trained: 1,
          },
          {
            id: "astrafox",
            level: 94,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "gloomtide",
            level: 95,
            trained: 2,
          },
          {
            id: "abyssalord",
            level: 95,
            trained: 2,
          },
        ],
      },
      {
        name: "SEMIFINAL",
        enemies: [
          {
            id: "hexweaver",
            level: 96,
            trained: 3,
          },
          {
            id: "stelladrake",
            level: 96,
            trained: 3,
          },
        ],
      },
      {
        name: "FINAL — CHRONO WRAITH",
        enemies: [
          {
            id: "orbitalance",
            level: 97,
            trained: 4,
          },
          {
            id: "grimquill",
            level: 97,
            trained: 4,
          },
          {
            id: "gravelord",
            level: 97,
            trained: 4,
          },
          {
            id: "chronowraith",
            level: 99,
            trained: 5,
          },
        ],
      },
    ],
    reward: {
      gold: 99170,
      xp: 19754,
      robot: "chronowraith",
      item: "revive_core",
      itemQty: 3,
    },
    replayGold: 25784,
    station: "station_orbital_3",
    x: 603,
    y: 4683,
  },
  {
    id: "t_mirrorage",
    name: "COPA MIRRORAGE",
    arena: "frozen",
    element: "ESPELHO",
    desc: "Circuito de Espelho — enfrente MIRRORAGE na final e conquiste seu chassi.",
    requiredLevel: 95,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "frostmonarch",
            level: 95,
            trained: 0,
          },
          {
            id: "mirrorclad",
            level: 95,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "sandvizier",
            level: 96,
            trained: 1,
          },
          {
            id: "maelstromfist",
            level: 96,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "frostpike",
            level: 97,
            trained: 2,
          },
          {
            id: "snowreaver",
            level: 97,
            trained: 2,
          },
        ],
      },
      {
        name: "SEMIFINAL",
        enemies: [
          {
            id: "tidebreaker",
            level: 98,
            trained: 3,
          },
          {
            id: "gravitide",
            level: 98,
            trained: 3,
          },
        ],
      },
      {
        name: "FINAL — MIRRORAGE",
        enemies: [
          {
            id: "venomcarapace",
            level: 99,
            trained: 4,
          },
          {
            id: "tidebreaker",
            level: 99,
            trained: 4,
          },
          {
            id: "reefsovereign",
            level: 99,
            trained: 4,
          },
          {
            id: "mirrorage",
            level: 99,
            trained: 5,
          },
        ],
      },
    ],
    reward: {
      gold: 101510,
      xp: 20222,
      robot: "mirrorage",
      item: "revive_core",
      itemQty: 3,
    },
    replayGold: 26393,
    station: "station_frozen_3",
    x: 277,
    y: 4639,
  },
  {
    id: "t_solstice",
    name: "COPA SOLSTICE",
    arena: "dojo",
    element: "ESTACAO",
    desc: "Circuito de Estacao — enfrente SOLSTICE na final e conquiste seu chassi.",
    requiredLevel: 96,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "aetherbell",
            level: 96,
            trained: 0,
          },
          {
            id: "clockthrone",
            level: 96,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "frostmourn",
            level: 97,
            trained: 1,
          },
          {
            id: "hullbreaker",
            level: 97,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "bastionhold",
            level: 98,
            trained: 2,
          },
          {
            id: "crimsonaria",
            level: 98,
            trained: 2,
          },
        ],
      },
      {
        name: "SEMIFINAL",
        enemies: [
          {
            id: "sporequeen",
            level: 99,
            trained: 3,
          },
          {
            id: "kelpwarden",
            level: 99,
            trained: 3,
          },
        ],
      },
      {
        name: "FINAL — SOLSTICE",
        enemies: [
          {
            id: "skyloomweaver",
            level: 100,
            trained: 4,
          },
          {
            id: "magnetarch",
            level: 100,
            trained: 4,
          },
          {
            id: "clockthrone",
            level: 100,
            trained: 4,
          },
          {
            id: "solstice",
            level: 99,
            trained: 5,
          },
        ],
      },
    ],
    reward: {
      gold: 102685,
      xp: 20457,
      robot: "solstice",
      item: "revive_core",
      itemQty: 3,
    },
    replayGold: 26698,
    station: "station_dojo_1",
    x: 275,
    y: 4900,
  },
  {
    id: "t_nimbusaint",
    name: "COPA NIMBUS SAINT",
    arena: "sky",
    element: "NUVEM",
    desc: "Circuito de Nuvem — enfrente NIMBUS SAINT na final e conquiste seu chassi.",
    requiredLevel: 97,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "ironmonarch",
            level: 97,
            trained: 0,
          },
          {
            id: "crystalquartz",
            level: 97,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "voltcarnyx",
            level: 98,
            trained: 1,
          },
          {
            id: "quarrybreaker",
            level: 98,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "pyrokaiser",
            level: 99,
            trained: 2,
          },
          {
            id: "tempestcoil",
            level: 99,
            trained: 2,
          },
        ],
      },
      {
        name: "SEMIFINAL",
        enemies: [
          {
            id: "tempestcoil",
            level: 100,
            trained: 3,
          },
          {
            id: "frostmourn",
            level: 100,
            trained: 3,
          },
        ],
      },
      {
        name: "FINAL — NIMBUS SAINT",
        enemies: [
          {
            id: "thunderbison",
            level: 101,
            trained: 4,
          },
          {
            id: "seraphcircuit",
            level: 101,
            trained: 4,
          },
          {
            id: "venomcarapace",
            level: 101,
            trained: 4,
          },
          {
            id: "nimbusaint",
            level: 99,
            trained: 5,
          },
        ],
      },
    ],
    reward: {
      gold: 103855,
      xp: 20691,
      robot: "nimbusaint",
      item: "revive_core",
      itemQty: 3,
    },
    replayGold: 27002,
    station: "station_sky_3",
    x: 567,
    y: 4905,
  },
  {
    id: "t_sirenfall",
    name: "COPA SIRENFALL",
    arena: "dojo",
    element: "CANTO",
    desc: "Circuito de Canto — enfrente SIRENFALL na final e conquiste seu chassi.",
    requiredLevel: 98,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "hailstriker",
            level: 98,
            trained: 0,
          },
          {
            id: "aetherloom",
            level: 98,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "stygianox",
            level: 99,
            trained: 1,
          },
          {
            id: "aquabastion",
            level: 99,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "shogunplate",
            level: 100,
            trained: 2,
          },
          {
            id: "dunemaw",
            level: 100,
            trained: 2,
          },
        ],
      },
      {
        name: "SEMIFINAL",
        enemies: [
          {
            id: "sandwyrm",
            level: 101,
            trained: 3,
          },
          {
            id: "ironpilgrim",
            level: 101,
            trained: 3,
          },
        ],
      },
      {
        name: "FINAL — SIRENFALL",
        enemies: [
          {
            id: "brasslion",
            level: 102,
            trained: 4,
          },
          {
            id: "sandvizier",
            level: 102,
            trained: 4,
          },
          {
            id: "mudlarker",
            level: 102,
            trained: 4,
          },
          {
            id: "sirenfall",
            level: 99,
            trained: 5,
          },
        ],
      },
    ],
    reward: {
      gold: 105030,
      xp: 20926,
      robot: "sirenfall",
      item: "revive_core",
      itemQty: 3,
    },
    replayGold: 27308,
    station: "station_dojo_2",
    x: 858,
    y: 4929,
  },
  {
    id: "t_seraphlux",
    name: "COPA SERAPH LUX",
    arena: "dojo",
    element: "SANTO",
    desc: "Circuito de Santo — enfrente SERAPH LUX na final e conquiste seu chassi.",
    requiredLevel: 99,
    fights: [
      {
        name: "PRELIMINAR",
        enemies: [
          {
            id: "coralshiv",
            level: 99,
            trained: 0,
          },
          {
            id: "nebulynx",
            level: 99,
            trained: 0,
          },
        ],
      },
      {
        name: "OITAVAS",
        enemies: [
          {
            id: "polarisguard",
            level: 100,
            trained: 1,
          },
          {
            id: "stygianox",
            level: 100,
            trained: 1,
          },
        ],
      },
      {
        name: "QUARTAS",
        enemies: [
          {
            id: "sandwyrm",
            level: 101,
            trained: 2,
          },
          {
            id: "boilerbrute",
            level: 101,
            trained: 2,
          },
        ],
      },
      {
        name: "SEMIFINAL",
        enemies: [
          {
            id: "gravebyte",
            level: 102,
            trained: 3,
          },
          {
            id: "marblesaint",
            level: 102,
            trained: 3,
          },
        ],
      },
      {
        name: "FINAL — SERAPH LUX",
        enemies: [
          {
            id: "chronowake",
            level: 103,
            trained: 4,
          },
          {
            id: "sporeherald",
            level: 103,
            trained: 4,
          },
          {
            id: "boulderox",
            level: 103,
            trained: 4,
          },
          {
            id: "seraphlux",
            level: 99,
            trained: 5,
          },
        ],
      },
    ],
    reward: {
      gold: 106205,
      xp: 21161,
      robot: "seraphlux",
      item: "revive_core",
      itemQty: 3,
    },
    replayGold: 27613,
    station: "station_dojo_1",
    x: 1168,
    y: 4865,
  },
  // --- FIM TORNEIOS 220 ---
];

/**
 * A arena de cada torneio passa a sair do elemento do torneio, para que as
 * 11 arenas animadas apareçam no mapa em vez de repetir "dojo" o tempo todo.
 */
export const EXTRA_TOURNAMENTS: TournamentDef[] = RAW_EXTRA_TOURNAMENTS.map(
  (t) => ({ ...t, arena: arenaForElement(t.element ?? "", t.id) }),
);
