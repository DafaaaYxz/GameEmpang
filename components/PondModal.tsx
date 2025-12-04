import React from 'react';
import { Pond, FishType, Inventory } from '../types';
import { FISH_DATA } from '../constants';
import { Fish, Droplets, Shovel, X, TrendingUp, Sparkles } from 'lucide-react';

interface PondModalProps {
  pond: Pond;
  inventory: Inventory;
  onClose: () => void;
  onSeed: (type: FishType) => void;
  onFeed: () => void;
  onHarvest: () => void;
  onUnlock: () => void;
}

export const PondModal: React.FC<PondModalProps> = ({
  pond,
  inventory,
  onClose,
  onSeed,
  onFeed,
  onHarvest,
  onUnlock
}) => {
  const fishConfig = pond.fishType ? FISH_DATA[pond.fishType] : null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Overlay - Solid Dark */}
      <div className="absolute inset-0 bg-slate-900/80" onClick={onClose}></div>
      
      {/* Modal Card - Flat White */}
      <div className="relative bg-white w-full max-w-sm rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] border-4 border-slate-800 overflow-hidden">
        
        {/* Header - Solid Color */}
        <div className={`h-24 w-full relative p-4 flex justify-between items-center border-b-4 border-slate-800
            ${pond.isUnlocked 
                ? 'bg-[#22d3ee]' // Cyan
                : 'bg-[#a8a29e]'} // Stone
        `}>
            <div>
                <h2 className="font-black text-2xl text-slate-900 tracking-tight">
                    {pond.isUnlocked ? (pond.fishType ? `${pond.fishType}` : "Empang Kosong") : "Terkunci"}
                </h2>
                {pond.isUnlocked && pond.fishType && (
                    <span className="text-xs font-bold bg-white/40 border-2 border-slate-900 px-2 py-0.5 rounded text-slate-900">Level 1</span>
                )}
            </div>

            <button 
                onClick={onClose} 
                className="bg-white hover:bg-slate-100 text-slate-900 border-2 border-slate-900 p-1.5 rounded-lg transition-colors"
            >
                <X size={24} strokeWidth={3} />
            </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {!pond.isUnlocked ? (
            <div className="text-center space-y-6">
              <div className="mx-auto w-20 h-20 bg-slate-100 border-4 border-slate-800 rounded-full flex items-center justify-center text-slate-800">
                <TrendingUp size={40} strokeWidth={2.5} />
              </div>
              <div>
                  <h3 className="font-bold text-slate-800 text-lg">Perluas Lahan</h3>
                  <p className="text-slate-600 text-sm mt-1">
                    Beli lahan ini agar keuntunganmu makin berlipat ganda!
                  </p>
              </div>
              <button 
                onClick={onUnlock}
                className="w-full bg-[#10b981] hover:bg-[#059669] text-white font-bold py-3 border-b-4 border-[#047857] active:border-b-0 active:translate-y-1 rounded-lg flex items-center justify-center gap-2 transition-all"
              >
                <Sparkles size={20} />
                Beli Rp {pond.priceToUnlock.toLocaleString()}
              </button>
            </div>
          ) : !pond.fishType ? (
            <div className="space-y-4">
              <p className="text-center text-slate-800 font-bold uppercase tracking-wide border-b-2 border-slate-100 pb-2">Pilih Bibit</p>
              <div className="grid grid-cols-2 gap-3">
                {Object.values(FishType).map((type) => (
                  <button
                    key={type}
                    disabled={inventory.seeds[type] <= 0}
                    onClick={() => onSeed(type)}
                    className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
                      inventory.seeds[type] > 0 
                        ? 'bg-blue-50 border-blue-500 hover:bg-blue-100 text-blue-900' 
                        : 'bg-slate-50 border-slate-200 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="mb-1 text-slate-800">
                        <Fish size={24} />
                    </div>
                    <span className="font-bold text-sm">{type}</span>
                    <span className="text-xs font-bold text-slate-500 mt-1">x{inventory.seeds[type]}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Bars - Flat */}
              <div className="space-y-4 bg-slate-50 p-4 rounded-xl border-2 border-slate-200">
                <div>
                  <div className="flex justify-between text-xs font-black text-slate-600 mb-1">
                    <span>PROGRESS</span>
                    <span>{Math.floor(pond.progress)}%</span>
                  </div>
                  <div className="w-full bg-slate-300 rounded-full h-4 border-2 border-slate-400 overflow-hidden">
                    <div 
                      className="bg-[#22c55e] h-full" 
                      style={{ width: `${pond.progress}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-black text-slate-600 mb-1">
                    <span>LAPAR</span>
                    <span className={pond.hunger > 50 ? "text-[#ef4444]" : "text-slate-600"}>{Math.floor(pond.hunger)}%</span>
                  </div>
                  <div className="w-full bg-slate-300 rounded-full h-4 border-2 border-slate-400 overflow-hidden">
                    <div 
                      className={`h-full ${
                          pond.hunger > 80 ? 'bg-[#ef4444]' : 
                          pond.hunger > 50 ? 'bg-[#f59e0b]' : 
                          'bg-[#3b82f6]'
                      }`}
                      style={{ width: `${pond.hunger}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Stats - Flat */}
              <div className="flex items-center justify-between gap-3">
                 <div className="flex-1 bg-white border-2 border-slate-200 p-2 rounded-lg text-center">
                   <span className="text-slate-500 text-[10px] uppercase font-bold block">Populasi</span>
                   <span className="font-black text-lg text-slate-800">{pond.count}</span>
                 </div>
                 <div className="flex-1 bg-white border-2 border-slate-200 p-2 rounded-lg text-center">
                   <span className="text-slate-500 text-[10px] uppercase font-bold block">Nilai Jual</span>
                   <span className="font-black text-lg text-[#16a34a]">Rp {(fishConfig?.sellPriceBase || 0) * pond.count}</span>
                 </div>
              </div>

              {/* Actions - Flat Buttons */}
              <div className="pt-2">
                {pond.isReadyToHarvest ? (
                    <button 
                    onClick={onHarvest}
                    className="w-full bg-[#f59e0b] hover:bg-[#d97706] text-white font-black py-3 rounded-lg border-b-4 border-[#b45309] active:border-b-0 active:translate-y-1 flex items-center justify-center gap-2 transition-all"
                    >
                    <Shovel size={24} />
                    <span>PANEN RAYA</span>
                    </button>
                ) : (
                    <button 
                    onClick={onFeed}
                    disabled={inventory.feed <= 0}
                    className={`w-full font-black py-3 rounded-lg border-b-4 active:border-b-0 active:translate-y-1 flex items-center justify-center gap-2 transition-all ${
                        inventory.feed > 0 
                        ? 'bg-[#3b82f6] hover:bg-[#2563eb] text-white border-[#1d4ed8]' 
                        : 'bg-slate-300 text-slate-500 border-slate-400 cursor-not-allowed'
                    }`}
                    >
                    <Droplets size={24} />
                    <span>BERI MAKAN ({inventory.feed})</span>
                    </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};