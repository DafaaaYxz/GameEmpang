import React from 'react';
import { FishType, Inventory } from '../types';
import { FISH_DATA, FEED_PRICE, FEED_AMOUNT_PER_BUY } from '../constants';
import { ShoppingBag, Wheat, Package } from 'lucide-react';

interface ShopProps {
  money: number;
  inventory: Inventory;
  level: number;
  onBuySeed: (type: FishType) => void;
  onBuyFeed: () => void;
}

export const Shop: React.FC<ShopProps> = ({ money, inventory, level, onBuySeed, onBuyFeed }) => {
  return (
    <div className="space-y-8 pb-20">
      
      {/* Feed Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
           <div className="bg-[#fb923c] p-2 rounded border-2 border-[#c2410c] text-white">
               <Wheat size={20} />
           </div>
           <h2 className="text-xl font-black text-slate-800 uppercase">Pakan Ikan</h2>
        </div>
        
        <div className="bg-white rounded-xl p-5 border-4 border-slate-200 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-[#f97316] p-3 rounded-lg text-white border-2 border-[#c2410c]">
              <Package size={28} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Pelet Premium</h3>
              <p className="text-sm text-slate-500 font-bold">+ {FEED_AMOUNT_PER_BUY} karung</p>
            </div>
          </div>

          <button 
            onClick={onBuyFeed}
            disabled={money < FEED_PRICE}
            className={`px-6 py-2 rounded-lg font-black border-b-4 active:border-b-0 active:translate-y-1 transition-all ${
              money >= FEED_PRICE 
              ? 'bg-[#1e293b] text-white border-black hover:bg-slate-800' 
              : 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed'
            }`}
          >
            Rp {FEED_PRICE}
          </button>
        </div>
      </section>

      {/* Seeds Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
           <div className="bg-[#60a5fa] p-2 rounded border-2 border-[#1d4ed8] text-white">
               <ShoppingBag size={20} />
           </div>
           <h2 className="text-xl font-black text-slate-800 uppercase">Bibit Ikan</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.values(FISH_DATA).map((fish) => (
            <div key={fish.name} className="bg-white rounded-xl p-4 border-4 border-slate-200 flex flex-col gap-3 hover:border-blue-300 transition-colors">
              <div className="flex justify-between items-start">
                 <div className="flex gap-3">
                    <div className="w-14 h-14 bg-slate-100 rounded-lg border-2 border-slate-300 flex items-center justify-center">
                        {/* Placeholder for actual image if needed, using simple color block for flat look */}
                        <span className="text-2xl">🐟</span>
                    </div>
                    <div>
                        <h3 className="font-black text-slate-800 text-lg">{fish.name}</h3>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold border border-blue-200">
                            {fish.growthTimeSec} Detik
                        </span>
                    </div>
                 </div>
                 <div className="text-right">
                    <span className="block text-xs text-slate-500 font-bold uppercase">Tas</span>
                    <span className="font-black text-slate-800 text-lg">{inventory.seeds[fish.name]}</span>
                 </div>
              </div>

              <button 
                onClick={() => onBuySeed(fish.name)}
                disabled={money < fish.seedPrice}
                className={`w-full py-2 rounded-lg text-sm font-black border-b-4 active:border-b-0 active:translate-y-1 transition-all ${
                  money >= fish.seedPrice 
                  ? 'bg-[#3b82f6] text-white border-[#1d4ed8] hover:bg-[#2563eb]' 
                  : 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed'
                }`}
              >
                Beli Rp {fish.seedPrice}
              </button>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};