import React, { useState, useEffect, useRef } from 'react';
import { 
  GameState, 
  Page, 
  FishType,
  MapId,
  MapObject,
  Pond
} from './types';
import { 
  INITIAL_STATE, 
  FISH_DATA, 
  FEED_PRICE, 
  FEED_AMOUNT_PER_BUY,
  MAP_OBJECTS
} from './constants';
import { Shop } from './components/Shop';
import { FishingMinigame } from './components/FishingMinigame';
import { Market } from './components/Market';
import { Stats } from './components/Stats';
import { WorldMap } from './components/WorldMap';
import { PondModal } from './components/PondModal';
import { Joystick } from './components/Joystick';
import { SettingsModal } from './components/SettingsModal';
import { NPCInteractionModal } from './components/NPCInteractionModal';
import { Coins, Star, Settings as SettingsIcon, Hand, ArrowLeft, MapPin } from 'lucide-react';

// Improved Collision Detection
const checkCollision = (px: number, py: number, obj: MapObject) => {
    const pSize = 4; 
    return (
        px + pSize > obj.x - (obj.width/2) && 
        px - pSize < obj.x + (obj.width/2) && 
        py + pSize > obj.y - (obj.height/2) && 
        py - pSize < obj.y + (obj.height/2)
    );
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [activePage, setActivePage] = useState<Page>(Page.GAME_WORLD);
  const [selectedPondId, setSelectedPondId] = useState<number | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  
  // Interaction State
  const [interactionTarget, setInteractionTarget] = useState<MapObject | null>(null);
  const [showNPCModal, setShowNPCModal] = useState(false);

  // Refs for Game Loop
  const playerRef = useRef({ ...INITIAL_STATE.player });
  const pondsRef = useRef<Pond[]>([...INITIAL_STATE.ponds]);
  const inputRef = useRef({ x: 0, y: 0 }); 
  const keysPressed = useRef<Record<string, boolean>>({});
  const lastInteractionIdRef = useRef<string | null>(null);
  const currentMapRef = useRef<MapId>(MapId.HOME);

  // Sync Ref when map changes
  useEffect(() => {
    currentMapRef.current = gameState.currentMap;
    // Reset player position safely if needed, or keep previous logic
    // Currently relying on transition logic inside game loop
  }, [gameState.currentMap]);

  useEffect(() => {
     pondsRef.current = gameState.ponds;
  }, [gameState.ponds]);

  // --- INPUT HANDLING ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // --- MAIN GAME LOOP ---
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const gameLoop = (time: number) => {
      const deltaTime = (time - lastTime) / 1000; // Seconds
      lastTime = time;

      // 1. Process Movement
      let { x, y } = playerRef.current;
      let dx = 0; 
      let dy = 0;

      if (keysPressed.current['KeyW'] || keysPressed.current['ArrowUp']) dy -= 1;
      if (keysPressed.current['KeyS'] || keysPressed.current['ArrowDown']) dy += 1;
      if (keysPressed.current['KeyA'] || keysPressed.current['ArrowLeft']) dx -= 1;
      if (keysPressed.current['KeyD'] || keysPressed.current['ArrowRight']) dx += 1;
      
      dx += inputRef.current.x;
      dy += inputRef.current.y;

      const len = Math.sqrt(dx*dx + dy*dy);
      if (len > 1) { dx /= len; dy /= len; }

      let newDirection = playerRef.current.direction;
      if (dx > 0.1) newDirection = 'right';
      if (dx < -0.1) newDirection = 'left';

      const speed = playerRef.current.speed; 
      const moveAmount = speed * (deltaTime * 60 * 0.2); 

      let newX = x + dx * moveAmount;
      let newY = y + dy * moveAmount;

      newX = Math.max(0, Math.min(100, newX));
      newY = Math.max(0, Math.min(100, newY));

      playerRef.current = { ...playerRef.current, x: newX, y: newY, direction: newDirection };

      // 2. Logic Update
      const currentPonds = pondsRef.current.map((pond) => {
          if (!pond.fishType || !pond.isUnlocked || pond.isReadyToHarvest) return pond;

          const config = FISH_DATA[pond.fishType];
          let newHunger = pond.hunger + (config.hungerRate * deltaTime * 0.5); 
          if (newHunger > 100) newHunger = 100;
          
          const hungerPenalty = newHunger > 80 ? 0.1 : newHunger > 50 ? 0.5 : 1;
          const growthIncrement = ((100 / config.growthTimeSec) * hungerPenalty) * deltaTime;
          
          let newProgress = pond.progress + growthIncrement;
          let ready = false;
          if (newProgress >= 100) {
            newProgress = 100;
            ready = true;
          }
          return { ...pond, hunger: newHunger, progress: newProgress, isReadyToHarvest: ready };
      });
      pondsRef.current = currentPonds;

      // 3. Collision & Interaction
      const currentMap = currentMapRef.current;
      const currentMapObjects = MAP_OBJECTS[currentMap] || [];
      
      let foundInteraction: MapObject | null = null;
      let shouldTransitionMap: MapId | null = null;
      let transitionTargetPos: {x: number, y: number} | null = null;

      // Check Static Objects
      for (const obj of currentMapObjects) {
          if (checkCollision(newX, newY, obj)) {
              if (obj.type === 'exit' && obj.targetMap) {
                  shouldTransitionMap = obj.targetMap;
                  transitionTargetPos = {
                      x: newX < 10 ? 90 : newX > 90 ? 10 : 
                         newY < 10 ? 50 : newY > 80 ? 50 : newX, // Default center for vertical entrance
                      y: newY < 10 ? 80 : newY > 90 ? 20 : newY
                  };
              } else {
                  foundInteraction = obj;
              }
          }
      }

      // Check Ponds
      const mapPonds = currentPonds.filter(p => p.mapId === currentMap);
      for (const p of mapPonds) {
          const pObj: MapObject = { id: `pond-${p.id}`, type: 'pond', x: p.x, y: p.y, width: 24, height: 20 };
          if (checkCollision(newX, newY, pObj)) {
              foundInteraction = { ...pObj, interactionType: 'manage_pond', data: p.id };
          }
      }

      // 4. Update State and Refs
      if (shouldTransitionMap && transitionTargetPos) {
          playerRef.current.x = transitionTargetPos.x;
          playerRef.current.y = transitionTargetPos.y;
          currentMapRef.current = shouldTransitionMap;
          
          foundInteraction = null;
          lastInteractionIdRef.current = null;
          setInteractionTarget(null);
      }

      const foundId = foundInteraction ? foundInteraction.id : null;
      if (foundId !== lastInteractionIdRef.current) {
          lastInteractionIdRef.current = foundId;
          setInteractionTarget(foundInteraction);
      }

      setGameState(prev => ({
          ...prev,
          ponds: currentPonds,
          player: playerRef.current,
          currentMap: currentMapRef.current
      }));

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, []); 

  // --- ACTIONS ---

  const handleDirectInteraction = (obj: MapObject) => {
    switch (obj.interactionType) {
        case 'shop': setActivePage(Page.SHOP); break;
        case 'market': setActivePage(Page.MARKET); break;
        case 'fishing': setActivePage(Page.FISHING); break;
        case 'manage_pond': if (obj.data) setSelectedPondId(obj.data); break;
        case 'npc_trade': setInteractionTarget(obj); setShowNPCModal(true); break;
        default: break;
    }
  };

  const buySeed = (type: FishType) => {
    const price = FISH_DATA[type].seedPrice;
    if (gameState.money >= price) {
      setGameState(prev => ({
        ...prev,
        money: prev.money - price,
        inventory: {
          ...prev.inventory,
          seeds: { ...prev.inventory.seeds, [type]: prev.inventory.seeds[type] + 1 }
        }
      }));
    }
  };

  const buyFeed = () => {
    if (gameState.money >= FEED_PRICE) {
      setGameState(prev => ({
        ...prev,
        money: prev.money - FEED_PRICE,
        inventory: {
          ...prev.inventory,
          feed: prev.inventory.feed + FEED_AMOUNT_PER_BUY
        }
      }));
    }
  };

  const seedPond = (type: FishType) => {
    if (selectedPondId === null) return;
    if (gameState.inventory.seeds[type] > 0) {
      pondsRef.current = pondsRef.current.map(p => p.id === selectedPondId ? {
          ...p, fishType: type, count: 10, progress: 0, hunger: 0, isReadyToHarvest: false
      } : p);
      setGameState(prev => ({
        ...prev,
        inventory: { ...prev.inventory, seeds: { ...prev.inventory.seeds, [type]: prev.inventory.seeds[type] - 1 } },
        ponds: pondsRef.current
      }));
    }
  };

  const feedPond = () => {
    if (selectedPondId === null) return;
    if (gameState.inventory.feed > 0) {
      pondsRef.current = pondsRef.current.map(p => p.id === selectedPondId ? {
          ...p, hunger: Math.max(0, p.hunger - 30)
      } : p);
      setGameState(prev => ({
        ...prev,
        inventory: { ...prev.inventory, feed: prev.inventory.feed - 1 },
        ponds: pondsRef.current
      }));
    }
  };

  const harvestPond = () => {
    if (selectedPondId === null) return;
    const pond = gameState.ponds.find(p => p.id === selectedPondId);
    if (pond && pond.fishType && pond.isReadyToHarvest) {
      const fishType = pond.fishType;
      const count = pond.count;
      const xpGain = FISH_DATA[fishType].xpReward * count;

      pondsRef.current = pondsRef.current.map(p => p.id === selectedPondId ? {
          ...p, fishType: null, count: 0, progress: 0, hunger: 0, isReadyToHarvest: false
      } : p);

      setGameState(prev => {
        let newXp = prev.xp + xpGain;
        let newLevel = prev.level;
        let newMaxXp = prev.maxXp;

        if (newXp >= prev.maxXp) {
          newLevel += 1;
          newXp = newXp - prev.maxXp;
          newMaxXp = Math.floor(prev.maxXp * 1.5);
        }

        return {
          ...prev,
          xp: newXp,
          level: newLevel,
          maxXp: newMaxXp,
          inventory: {
              ...prev.inventory,
              harvestedFish: {
                  ...prev.inventory.harvestedFish,
                  [fishType]: prev.inventory.harvestedFish[fishType] + count
              }
          },
          ponds: pondsRef.current
        };
      });
      setSelectedPondId(null);
    }
  };

  const sellFish = (type: FishType, amount: number, price: number) => {
      setGameState(prev => ({
          ...prev,
          money: prev.money + price,
          inventory: {
              ...prev.inventory,
              harvestedFish: {
                  ...prev.inventory.harvestedFish,
                  [type]: prev.inventory.harvestedFish[type] - amount
              }
          }
      }));
  };

  const unlockPond = () => {
    if (selectedPondId === null) return;
    const pond = gameState.ponds.find(p => p.id === selectedPondId);
    if (pond && gameState.money >= pond.priceToUnlock) {
      pondsRef.current = pondsRef.current.map(p => p.id === selectedPondId ? { ...p, isUnlocked: true } : p);
      setGameState(prev => ({
        ...prev,
        money: prev.money - pond.priceToUnlock,
        ponds: pondsRef.current
      }));
      setSelectedPondId(null);
    }
  };

  return (
    <div className="h-screen w-screen flex justify-center items-center overflow-hidden">
      {/* Mobile Frame Container - Flat Shadow */}
      <div className="w-full h-full md:max-w-[480px] md:h-[850px] bg-white md:rounded-[3rem] overflow-hidden flex flex-col relative md:shadow-2xl md:ring-[12px] md:ring-black">
        
        {/* Floating HUD - Flat */}
        <div className="absolute top-0 left-0 right-0 p-4 z-50 flex justify-between items-start pointer-events-none">
           {/* Level Profile */}
           <div className="flex items-center gap-3 pointer-events-auto">
             <div className="relative w-14 h-14">
               {/* Progress Circle - Flat */}
               <svg className="w-full h-full transform -rotate-90">
                 <circle cx="28" cy="28" r="26" stroke="#e2e8f0" strokeWidth="6" fill="transparent" />
                 <circle 
                   cx="28" cy="28" r="26" 
                   stroke="#3b82f6" strokeWidth="6" fill="transparent" 
                   strokeDasharray={2 * Math.PI * 26}
                   strokeDashoffset={2 * Math.PI * 26 * (1 - gameState.xp / gameState.maxXp)}
                   className="transition-all duration-500" 
                 />
               </svg>
               <div className="absolute inset-1 bg-white rounded-full flex items-center justify-center border-2 border-slate-200">
                 <span className="font-black text-slate-800 text-lg">{gameState.level}</span>
               </div>
               <div className="absolute -bottom-1 -right-1 bg-yellow-400 p-1 rounded-full border-2 border-white">
                 <Star size={10} className="text-yellow-900 fill-yellow-900" />
               </div>
             </div>
           </div>

           <div className="flex flex-col gap-2 items-end pointer-events-auto">
              {/* Money Capsule - Flat */}
              <div className="bg-white px-4 py-2 rounded-full border-2 border-slate-200 flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
                <div className="bg-yellow-100 p-1 rounded-full">
                  <Coins size={18} className="text-yellow-600" />
                </div>
                <span className="font-black text-slate-800 font-mono">Rp {gameState.money.toLocaleString()}</span>
              </div>
              
              {/* Settings Button - Flat */}
              <button onClick={() => setShowSettings(true)} className="bg-white p-2 rounded-full border-2 border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors shadow-sm">
                 <SettingsIcon size={20} />
              </button>
           </div>
        </div>

        {/* Interaction Overlay (Floating) - Flat */}
        {activePage === Page.GAME_WORLD && interactionTarget && (
           <div className="absolute inset-x-0 bottom-24 z-40 px-6 flex justify-center pointer-events-none">
             <button 
                onClick={() => handleDirectInteraction(interactionTarget)}
                className="bg-[#3b82f6] hover:bg-[#2563eb] text-white font-black py-4 px-10 rounded-xl shadow-[0_4px_0_0_#1d4ed8] active:shadow-none active:translate-y-1 animate-bounce pointer-events-auto flex items-center gap-3 border-2 border-[#1d4ed8]"
              >
                  <Hand className="w-6 h-6" />
                  <span className="text-lg tracking-wide uppercase">{interactionTarget.label || 'Interaksi'}</span>
              </button>
           </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 relative overflow-hidden bg-slate-100">
          {activePage === Page.GAME_WORLD ? (
              <>
                <WorldMap 
                    mapId={gameState.currentMap}
                    player={gameState.player}
                    ponds={gameState.ponds}
                    mapObjects={MAP_OBJECTS[gameState.currentMap]}
                    showDebug={gameState.settings.showDebug}
                    onInteraction={handleDirectInteraction}
                />
                
                {gameState.settings.useJoystick && (
                    <Joystick onMove={(x, y) => { inputRef.current = { x, y }; }} />
                )}

                {/* Location Tag - Flat */}
                <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-white px-4 py-1.5 rounded-lg border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] pointer-events-none">
                    <div className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-red-500 fill-red-500" />
                        <span className="font-black text-slate-900 text-xs tracking-wider uppercase">
                            {gameState.currentMap === MapId.HOME ? 'Desa Sukamakmur' : 'Pusat Kota'}
                        </span>
                    </div>
                </div>
              </>
          ) : (
            <div className="h-full flex flex-col bg-white relative">
               <div className="p-4 z-10 flex items-center gap-4 mt-16 border-b-2 border-slate-100 pb-4">
                   <button 
                    onClick={() => setActivePage(Page.GAME_WORLD)} 
                    className="p-3 bg-white rounded-lg border-2 border-slate-200 hover:bg-slate-50 text-slate-800 transition-colors shadow-sm"
                   >
                       <ArrowLeft size={24} strokeWidth={3} />
                   </button>
                   <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">
                     {activePage === Page.SHOP && "Toko Desa"}
                     {activePage === Page.FISHING && "Pemancingan"}
                     {activePage === Page.STATS && "Statistik"}
                     {activePage === Page.MARKET && "Pasar Kota"}
                   </h1>
               </div>
               
               <div className="flex-1 overflow-y-auto px-4 pb-8 pt-6 z-10">
                   {activePage === Page.SHOP && <Shop money={gameState.money} inventory={gameState.inventory} level={gameState.level} onBuySeed={buySeed} onBuyFeed={buyFeed} />}
                   {activePage === Page.FISHING && <FishingMinigame onCatch={(type) => sellFish(type, 1, FISH_DATA[type].sellPriceBase)} />}
                   {activePage === Page.STATS && <Stats history={gameState.history} />}
                   {activePage === Page.MARKET && <Market money={gameState.money} level={gameState.level} />}
               </div>
            </div>
          )}
        </main>

        {/* Modals */}
        {selectedPondId !== null && (
           <PondModal 
             pond={gameState.ponds.find(p => p.id === selectedPondId)!}
             inventory={gameState.inventory}
             onClose={() => setSelectedPondId(null)}
             onSeed={seedPond}
             onFeed={feedPond}
             onHarvest={harvestPond}
             onUnlock={unlockPond}
           />
        )}

        {showSettings && (
            <SettingsModal 
                settings={gameState.settings} 
                onUpdate={(s) => setGameState(prev => ({...prev, settings: s}))}
                onClose={() => setShowSettings(false)}
            />
        )}

        {showNPCModal && interactionTarget?.data && (
            <NPCInteractionModal 
                npcName={interactionTarget.data.name}
                inventory={gameState.inventory}
                onClose={() => setShowNPCModal(false)}
                onSell={sellFish}
            />
        )}

      </div>
    </div>
  );
};

export default App;