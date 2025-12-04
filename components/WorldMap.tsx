import React from 'react';
import { Pond, MapObject, PlayerState, MapId } from '../types';
import { Store, ShoppingCart, Anchor, User, Lock, ArrowBigDown, ArrowBigUp } from 'lucide-react';

interface WorldMapProps {
  mapId: MapId;
  player: PlayerState;
  ponds: Pond[];
  mapObjects: MapObject[];
  showDebug: boolean;
  onInteraction: (obj: MapObject) => void;
}

export const WorldMap: React.FC<WorldMapProps> = ({ 
  mapId, 
  player, 
  ponds, 
  mapObjects,
  showDebug,
  onInteraction
}) => {
  
  // Flat Color Backgrounds
  const getMapBackground = () => {
    switch(mapId) {
        case MapId.HOME: return "bg-[#86efac]"; // Solid Light Green
        case MapId.NEIGHBOR: return "bg-[#e2e8f0]"; // Solid Light Gray (Paving)
        default: return "bg-white";
    }
  };

  return (
    <div className={`relative w-full h-full ${getMapBackground()} overflow-hidden`}>
      
      {/* --- TERRAIN DECORATION (FLAT) --- */}
      
      {mapId === MapId.HOME && (
        <>
            {/* River on the Right */}
            <div className="absolute right-0 top-0 bottom-0 w-[20%] bg-[#38bdf8] border-l-4 border-[#0ea5e9]"></div>
            
            {/* Dirt Path */}
            <div className="absolute top-[25%] left-0 right-[20%] h-8 bg-[#fcd34d] opacity-50"></div>
            <div className="absolute top-[25%] left-[25%] bottom-0 w-8 bg-[#fcd34d] opacity-50"></div>
        </>
      )}

      {mapId === MapId.NEIGHBOR && (
        <>
            {/* City Square Pattern */}
            <div className="absolute inset-0 opacity-10"
                style={{
                    backgroundImage: 'linear-gradient(#94a3b8 2px, transparent 2px), linear-gradient(90deg, #94a3b8 2px, transparent 2px)',
                    backgroundSize: '40px 40px'
                }}
            ></div>
            {/* Red Carpet / Path to Market */}
            <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-20 h-[80%] bg-[#cbd5e1] border-x-4 border-white"></div>
        </>
      )}


      {/* --- DYNAMIC OBJECTS --- */}
      {mapObjects.map((obj) => (
         <div 
           key={obj.id}
           onClick={() => onInteraction(obj)}
           className="absolute flex flex-col items-center justify-center cursor-pointer transition-transform duration-100 hover:scale-105 active:scale-95 z-10"
           style={{
             left: `${obj.x}%`,
             top: `${obj.y}%`,
             width: `${obj.width}%`,
             height: `${obj.height}%`,
             border: showDebug ? '2px solid red' : 'none',
             transform: 'translate(-50%, -50%)' // Center anchor
           }}
         >
            {/* Building Style (FLAT) */}
            {obj.type === 'building' && (
                 <div className="relative w-full h-full">
                     {/* Roof/Body */}
                     <div className={`w-full h-full rounded-lg flex flex-col items-center justify-center border-4 shadow-sm
                         ${obj.interactionType === 'shop' ? 'bg-[#fdba74] border-[#c2410c] text-[#7c2d12]' : 
                           obj.interactionType === 'market' ? 'bg-[#fca5a5] border-[#b91c1c] text-[#7f1d1d]' : 
                           'bg-[#7dd3fc] border-[#0369a1] text-[#0c4a6e]'}
                     `}>
                        <div className="p-1">
                            {obj.interactionType === 'shop' && <ShoppingCart size={24} strokeWidth={2.5} />}
                            {obj.interactionType === 'market' && <Store size={24} strokeWidth={2.5} />}
                            {obj.interactionType === 'fishing' && <Anchor size={24} strokeWidth={2.5} />}
                        </div>
                        <span className="text-[10px] font-black uppercase mt-1">{obj.label}</span>
                     </div>
                 </div>
            )}

            {/* NPC Style (FLAT) */}
            {obj.type === 'npc' && (
                 <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-[#c084fc] rounded-full border-4 border-[#7e22ce] flex items-center justify-center">
                        <User className="text-white w-6 h-6" strokeWidth={3} />
                    </div>
                    <div className="mt-1 bg-white px-2 py-0.5 rounded border-2 border-slate-800">
                        <span className="text-[10px] font-bold text-slate-900">{obj.label}</span>
                    </div>
                 </div>
            )}

            {/* Exit Zone Style */}
             {obj.type === 'exit' && (
                 <div className="w-full h-full flex flex-col items-center justify-center bg-black/20 rounded-lg border-2 border-black/10">
                    <span className="text-[9px] font-bold text-slate-800 bg-white/80 px-1 rounded mb-1">{obj.label}</span>
                    {obj.y > 80 ? <ArrowBigDown className="text-slate-800 animate-bounce" /> : <ArrowBigUp className="text-slate-800 animate-bounce" />}
                 </div>
            )}
         </div>
      ))}

      {/* --- PONDS (FLAT) --- */}
      {ponds.filter(p => p.mapId === mapId).map((pond) => (
        <div
            key={pond.id}
            onClick={() => onInteraction({ id: `pond-${pond.id}`, type: 'pond', x: pond.x, y: pond.y, width: 28, height: 25, interactionType: 'manage_pond', data: pond.id })}
            style={{ 
                left: `${pond.x}%`, 
                top: `${pond.y}%`,
                width: '24%', // Slightly smaller to fit grid
                height: '20%',
                transform: 'translate(-50%, -50%)'
            }}
            className="absolute z-10 cursor-pointer"
        >
            <div className={`w-full h-full rounded-xl relative overflow-hidden transition-transform active:scale-95 border-4
                ${!pond.isUnlocked 
                    ? 'bg-[#d6d3d1] border-[#a8a29e]' // Stone Gray
                    : 'bg-[#22d3ee] border-[#0891b2]' // Cyan Blue
                }`}
            >
                 <div className="absolute inset-0 flex flex-col items-center justify-center text-[#164e63]">
                    {!pond.isUnlocked ? (
                         <>
                            <Lock size={20} className="text-[#57534e] mb-1" />
                            <span className="text-[10px] font-bold text-[#57534e]">
                                {pond.priceToUnlock/1000}k
                            </span>
                         </>
                    ) : (
                        <>
                            {pond.fishType ? (
                                <>
                                  <span className="text-xs font-black uppercase tracking-wider">{pond.fishType}</span>
                                  {pond.isReadyToHarvest && (
                                      <div className="absolute top-1 right-1 w-3 h-3 bg-yellow-400 rounded-full border border-black animate-ping"></div>
                                  )}
                                </>
                            ) : (
                                <span className="text-[10px] font-bold opacity-50">KOSONG</span>
                            )}
                        </>
                    )}
                 </div>
            </div>
        </div>
      ))}

      {/* --- PLAYER (FLAT) --- */}
      <div 
        className="absolute w-12 h-12 z-30 pointer-events-none"
        style={{ 
            left: `${player.x}%`, 
            top: `${player.y}%`,
            transform: `translate(-50%, -50%)`
        }}
      >
        <div className={`w-full h-full bg-[#f43f5e] rounded-full border-[3px] border-[#881337] flex items-center justify-center
            ${player.direction === 'left' ? 'scale-x-[-1]' : ''}
        `}>
             <User className="w-6 h-6 text-white" strokeWidth={3} />
        </div>
        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-8 h-2 bg-black/20 rounded-full"></div>
      </div>

    </div>
  );
};