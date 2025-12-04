import { FishType, FishConfig, GameState, MapId, MapObject } from './types';

export const FISH_DATA: Record<FishType, FishConfig> = {
  [FishType.LELE]: {
    name: FishType.LELE,
    seedPrice: 50,
    sellPriceBase: 120,
    growthTimeSec: 30,
    hungerRate: 2,
    xpReward: 10,
  },
  [FishType.NILA]: {
    name: FishType.NILA,
    seedPrice: 150,
    sellPriceBase: 400,
    growthTimeSec: 60,
    hungerRate: 1.5,
    xpReward: 25,
  },
  [FishType.MAS]: {
    name: FishType.MAS,
    seedPrice: 500,
    sellPriceBase: 1200,
    growthTimeSec: 120,
    hungerRate: 1,
    xpReward: 60,
  },
  [FishType.GURAME]: {
    name: FishType.GURAME,
    seedPrice: 1500,
    sellPriceBase: 4000,
    growthTimeSec: 300,
    hungerRate: 0.8,
    xpReward: 150,
  }
};

// Map Configurations - NEW LAYOUTS
export const MAP_OBJECTS: Record<MapId, MapObject[]> = {
  [MapId.HOME]: [
    // Top Left: Shop Area
    { id: 'shop', type: 'building', x: 15, y: 15, width: 22, height: 20, label: 'Toko', interactionType: 'shop' },
    
    // Bottom Right: Fishing Area (Near the new "River")
    { id: 'fishing', type: 'building', x: 85, y: 60, width: 20, height: 20, label: 'Dermaga', interactionType: 'fishing' },
    
    // Bottom Left: Exit to City
    { id: 'exit_neighbor', type: 'exit', x: 10, y: 90, width: 15, height: 10, label: 'Ke Kota', targetMap: MapId.NEIGHBOR },
  ],
  [MapId.NEIGHBOR]: [
    // Center Top: Big Market
    { id: 'market', type: 'building', x: 50, y: 20, width: 35, height: 25, label: 'Pasar Besar', interactionType: 'market' },
    
    // Right Center: NPC
    { id: 'npc_buyer', type: 'npc', x: 80, y: 50, width: 12, height: 15, label: 'Bos Ikan', interactionType: 'npc_trade', data: { name: 'Juragan Kodok' } },
    
    // Bottom Center: Exit to Home
    { id: 'exit_home', type: 'exit', x: 50, y: 90, width: 15, height: 10, label: 'Pulang', targetMap: MapId.HOME },
  ]
};

export const INITIAL_STATE: GameState = {
  money: 500,
  level: 1,
  xp: 0,
  maxXp: 100,
  day: 1,
  history: [{ day: 1, money: 500 }],
  currentMap: MapId.HOME,
  settings: {
    useJoystick: false,
    showDebug: false
  },
  player: {
    x: 50,
    y: 50,
    speed: 0.8,
    direction: 'down'
  },
  ponds: [
    // Organized Grid in the Center-Left of Home
    { id: 1, mapId: MapId.HOME, x: 25, y: 50, isUnlocked: true, priceToUnlock: 0, fishType: null, count: 0, progress: 0, hunger: 0, isReadyToHarvest: false },
    { id: 2, mapId: MapId.HOME, x: 55, y: 50, isUnlocked: false, priceToUnlock: 2000, fishType: null, count: 0, progress: 0, hunger: 0, isReadyToHarvest: false },
    { id: 3, mapId: MapId.HOME, x: 25, y: 75, isUnlocked: false, priceToUnlock: 10000, fishType: null, count: 0, progress: 0, hunger: 0, isReadyToHarvest: false },
    { id: 4, mapId: MapId.HOME, x: 55, y: 75, isUnlocked: false, priceToUnlock: 25000, fishType: null, count: 0, progress: 0, hunger: 0, isReadyToHarvest: false },
  ],
  inventory: {
    seeds: {
      [FishType.LELE]: 5,
      [FishType.NILA]: 0,
      [FishType.MAS]: 0,
      [FishType.GURAME]: 0,
    },
    feed: 20,
    feedQuality: 1,
    harvestedFish: {
      [FishType.LELE]: 0,
      [FishType.NILA]: 0,
      [FishType.MAS]: 0,
      [FishType.GURAME]: 0,
    }
  }
};

export const FEED_PRICE = 10;
export const FEED_AMOUNT_PER_BUY = 10;