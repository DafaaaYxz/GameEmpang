export enum FishType {
  LELE = 'Lele',
  NILA = 'Nila',
  MAS = 'Mas',
  GURAME = 'Gurame'
}

export enum Page {
  GAME_WORLD = 'game_world',
  SHOP = 'shop',
  FISHING = 'fishing',
  STATS = 'stats',
  MARKET = 'market' // Added Market Page
}

export enum MapId {
  HOME = 'home',
  NEIGHBOR = 'neighbor'
}

export interface FishConfig {
  name: FishType;
  seedPrice: number;
  sellPriceBase: number;
  growthTimeSec: number;
  hungerRate: number;
  xpReward: number;
}

export interface Pond {
  id: number;
  x: number; // Grid X position (0-100)
  y: number; // Grid Y position (0-100)
  mapId: MapId;
  isUnlocked: boolean;
  priceToUnlock: number;
  fishType: FishType | null;
  count: number;
  progress: number;
  hunger: number;
  isReadyToHarvest: boolean;
}

export interface Inventory {
  seeds: Record<FishType, number>;
  feed: number;
  feedQuality: number;
  harvestedFish: Record<FishType, number>; // Fish kept in inventory to sell later
}

export interface PlayerState {
  x: number; // 0-100
  y: number; // 0-100
  speed: number;
  direction: 'left' | 'right' | 'up' | 'down';
}

export interface Settings {
  useJoystick: boolean;
  showDebug: boolean;
}

export interface GameState {
  money: number;
  level: number;
  xp: number;
  maxXp: number;
  ponds: Pond[];
  inventory: Inventory;
  day: number;
  history: { day: number; money: number }[];
  player: PlayerState;
  currentMap: MapId;
  settings: Settings;
}

export interface MapObject {
  id: string;
  type: 'building' | 'npc' | 'exit' | 'pond';
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
  targetMap?: MapId; // For exits
  interactionType?: 'shop' | 'market' | 'fishing' | 'npc_trade' | 'manage_pond';
  data?: any; // Extra data like Pond ID or NPC Name
}