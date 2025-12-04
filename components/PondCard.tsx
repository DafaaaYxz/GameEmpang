import React from 'react';
import { Pond, FishType, Inventory } from '../types';
import { FISH_DATA } from '../constants';
import { Fish, Droplets, Shovel, Lock, PlusCircle } from 'lucide-react';

interface PondCardProps {
  pond: Pond;
  inventory: Inventory;
  onSeed: (pondId: number, type: FishType) => void;
  onFeed: (pondId: number) => void;
  onHarvest: (pondId: number) => void;
  onUnlock: (pondId: number) => void;
}

export const PondCard: React.FC<PondCardProps> = ({ 
  pond, 
  inventory, 
  onSeed, 
  onFeed, 
  onHarvest, 
  onUnlock 
}) => {
  if (!pond.isUnlocked) {
    return (
      <div className="bg-stone-200 border-4 border-stone-300 rounded-xl p-6 flex flex-col items-center justify-center h-64 shadow-inner opacity-70 hover:opacity-100 transition-opacity">
        <Lock className="w-12 h-12 text-stone-500 mb-4" />
        <h3 className="text-xl font-bold text-stone-600 mb-2">Lahan Kosong</h3>
        <p className="text-stone-500 mb-4 text-center">Beli lahan ini untuk memperluas bisnis lele kamu!</p>
        <button 
          onClick={() => onUnlock(pond.id)}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"
        >
          <PlusCircle size={20} />
          Beli Rp {pond.priceToUnlock.toLocaleString()}
        </button>
      </div>
    );
  }

  if (!pond.fishType) {
    return (
      <div className="bg-blue-100 border-4 border-blue-200 rounded-xl p-6 flex flex-col items-center justify-center h-64 shadow-md relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <h3 className="text-lg font-bold text-blue-800 mb-4 z-10">Empang Kosong</h3>
        <div className="grid grid-cols-2 gap-2 w-full z-10">
          {Object.values(FishType).map((type) => (
            <button
              key={type}
              disabled={inventory.seeds[type] <= 0}
              onClick={() => onSeed(pond.id, type)}
              className={`p-2 rounded text-sm font-medium border ${
                inventory.seeds[type] > 0 
                  ? 'bg-white border-blue-300 text-blue-700 hover:bg-blue-50' 
                  : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Tebar {type} ({inventory.seeds[type]})
            </button>
          ))}
        </div>
        <p className="text-xs text-blue-500 mt-2 z-10">*Beli bibit di Toko</p>
      </div>
    );
  }

  const fishConfig = FISH_DATA[pond.fishType];
  const progressPercent = Math.min(100, pond.progress);
  const hungerColor = pond.hunger > 80 ? 'bg-red-500' : pond.hunger > 50 ? 'bg-yellow-500' : 'bg-green-500';

  return (
    <div className="bg-blue-500 border-4 border-blue-700 rounded-xl p-4 flex flex-col h-64 shadow-lg relative overflow-hidden text-white">
       {/* Water Effect */}
       <div className="absolute bottom-0 left-0 right-0 h-full bg-gradient-to-t from-blue-900 to-blue-500 opacity-50 z-0"></div>
       
       {/* Content */}
       <div className="z-10 flex justify-between items-start mb-2">
         <div className="flex items-center gap-2">
           <div className="bg-white/20 p-2 rounded-full">
             <Fish className="w-6 h-6" />
           </div>
           <div>
             <h3 className="font-bold text-lg">{pond.fishType}</h3>
             <span className="text-xs text-blue-100">{pond.count} ekor</span>
           </div>
         </div>
         {pond.isReadyToHarvest && (
           <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded animate-bounce">
             SIAP PANEN!
           </span>
         )}
       </div>

       <div className="z-10 space-y-3 mt-2 flex-1">
         {/* Growth Bar */}
         <div>
           <div className="flex justify-between text-xs mb-1">
             <span>Pertumbuhan</span>
             <span>{Math.floor(progressPercent)}%</span>
           </div>
           <div className="w-full bg-blue-900/50 rounded-full h-2.5">
             <div 
               className="bg-green-400 h-2.5 rounded-full transition-all duration-500" 
               style={{ width: `${progressPercent}%` }}
             ></div>
           </div>
         </div>

         {/* Hunger Bar */}
         <div>
           <div className="flex justify-between text-xs mb-1">
             <span>Lapar</span>
             <span>{Math.floor(pond.hunger)}%</span>
           </div>
           <div className="w-full bg-blue-900/50 rounded-full h-2.5">
             <div 
               className={`${hungerColor} h-2.5 rounded-full transition-all duration-500`} 
               style={{ width: `${pond.hunger}%` }}
             ></div>
           </div>
         </div>
       </div>

       <div className="z-10 mt-auto flex gap-2">
         {pond.isReadyToHarvest ? (
            <button 
              onClick={() => onHarvest(pond.id)}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-yellow-900 font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <Shovel size={18} />
              Panen Raya
            </button>
         ) : (
            <button 
              onClick={() => onFeed(pond.id)}
              disabled={inventory.feed <= 0}
              className={`w-full font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                inventory.feed > 0 ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-gray-500 text-gray-300 cursor-not-allowed'
              }`}
            >
              <Droplets size={18} />
              Beri Pakan ({inventory.feed})
            </button>
         )}
       </div>
    </div>
  );
};
