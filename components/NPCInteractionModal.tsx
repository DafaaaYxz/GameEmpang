import React, { useState } from 'react';
import { Inventory, FishType } from '../types';
import { FISH_DATA } from '../constants';
import { negotiatePrice } from '../services/geminiService';
import { X, HandCoins, Check, Sparkles, Scale } from 'lucide-react';

interface NPCInteractionModalProps {
  npcName: string;
  inventory: Inventory;
  onClose: () => void;
  onSell: (type: FishType, amount: number, price: number) => void;
}

export const NPCInteractionModal: React.FC<NPCInteractionModalProps> = ({
  npcName,
  inventory,
  onClose,
  onSell
}) => {
  const [mode, setMode] = useState<'SELECT' | 'HAGGLE' | 'RESULT'>('SELECT');
  const [selectedFish, setSelectedFish] = useState<FishType | null>(null);
  const [offerPrice, setOfferPrice] = useState<number>(0);
  const [npcMessage, setNpcMessage] = useState(`Halo juragan! Ada ikan apa hari ini?`);
  const [isThinking, setIsThinking] = useState(false);

  const availableFish = Object.entries(inventory.harvestedFish).filter(([_, count]) => count > 0);

  const startHaggle = (fish: FishType) => {
    setSelectedFish(fish);
    const basePrice = FISH_DATA[fish].sellPriceBase * inventory.harvestedFish[fish];
    setOfferPrice(basePrice); 
    setMode('HAGGLE');
    setNpcMessage(`Wah, ${inventory.harvestedFish[fish]} ekor ${fish} ya? Mau lepas harga berapa?`);
  };

  const submitOffer = async () => {
    if (!selectedFish) return;
    
    setIsThinking(true);
    const count = inventory.harvestedFish[selectedFish];
    const baseTotal = FISH_DATA[selectedFish].sellPriceBase * count;
    
    const result = await negotiatePrice(selectedFish, count, baseTotal, offerPrice, npcName);
    
    setIsThinking(false);
    
    if (result.accepted) {
        onSell(selectedFish, count, offerPrice);
        setNpcMessage(result.message);
        setMode('RESULT');
    } else if (result.counterOffer) {
        setNpcMessage(`${result.message}`);
    } else {
        setNpcMessage(result.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/80" onClick={onClose}></div>
      
      <div className="relative bg-white w-full max-w-md rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] border-4 border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header - Flat Purple */}
        <div className="bg-[#8b5cf6] p-6 text-white border-b-4 border-slate-800 pb-8">
            <div className="flex justify-between items-start">
                 <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-full border-2 border-slate-900 overflow-hidden">
                        <UserAvatar seed={npcName} />
                    </div>
                    <div>
                        <h2 className="font-black text-xl text-white drop-shadow-md">{npcName}</h2>
                        <span className="text-xs font-bold text-[#5b21b6] bg-[#ddd6fe] px-2 py-0.5 rounded border border-[#5b21b6]">Tengkulak</span>
                    </div>
                 </div>
                 <button onClick={onClose} className="p-1 bg-white text-black rounded border-2 border-black hover:bg-slate-200"><X size={20} strokeWidth={3}/></button>
            </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-white -mt-4 rounded-t-2xl p-6 relative z-10 flex flex-col overflow-hidden">
            
            {/* NPC Chat Box */}
            <div className="mb-6 bg-slate-100 p-4 rounded-xl border-2 border-slate-200">
                <p className="text-slate-800 font-bold text-sm">"{npcMessage}"</p>
            </div>

            <div className="overflow-y-auto flex-1 pr-1">
                {mode === 'SELECT' && (
                    <div className="space-y-3">
                        <h3 className="font-black text-slate-800 text-sm uppercase mb-2">Jual Hasil Panen</h3>
                        {availableFish.length === 0 ? (
                            <div className="text-center py-10 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
                                <span className="text-slate-400 font-bold">Tas kosong melompong.</span>
                            </div>
                        ) : (
                            availableFish.map(([type, count]) => (
                                <button 
                                    key={type}
                                    onClick={() => startHaggle(type as FishType)}
                                    className="w-full flex justify-between items-center p-4 bg-white border-2 border-slate-200 rounded-xl hover:border-[#8b5cf6] hover:bg-purple-50 transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="bg-blue-100 p-2 rounded-lg text-blue-600 border border-blue-200">
                                            <FishIcon />
                                        </div>
                                        <div className="text-left">
                                            <span className="block font-black text-slate-700">{type}</span>
                                            <span className="text-xs font-bold text-slate-500">Stok: {count}</span>
                                        </div>
                                    </div>
                                    <div className="font-black text-slate-300 group-hover:text-[#8b5cf6]">→</div>
                                </button>
                            ))
                        )}
                    </div>
                )}

                {mode === 'HAGGLE' && selectedFish && (
                    <div className="space-y-6">
                        <div className="bg-[#fef9c3] p-4 rounded-xl border-2 border-[#facc15] flex justify-between items-center">
                            <div>
                                <span className="text-xs text-[#854d0e] font-bold uppercase">Harga Pasar</span>
                                <div className="text-xl font-black text-[#854d0e]">
                                    Rp {(FISH_DATA[selectedFish].sellPriceBase * inventory.harvestedFish[selectedFish]).toLocaleString()}
                                </div>
                            </div>
                            <Scale className="text-[#eab308]" size={32} />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-800 mb-2">Tawaran Anda</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Rp</span>
                                <input 
                                    type="number" 
                                    value={offerPrice}
                                    onChange={(e) => setOfferPrice(Number(e.target.value))}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-4 border-slate-200 rounded-xl text-xl font-black text-slate-800 focus:border-[#8b5cf6] focus:outline-none transition-colors"
                                />
                            </div>
                        </div>

                        <button 
                            onClick={submitOffer}
                            disabled={isThinking}
                            className="w-full bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-black py-4 rounded-xl border-b-4 border-[#5b21b6] active:border-b-0 active:translate-y-1 flex items-center justify-center gap-2 transition-all"
                        >
                            {isThinking ? (
                                <span className="animate-pulse">Mikis Sik...</span>
                            ) : (
                                <>
                                    <HandCoins size={20} />
                                    <span>Ajukan Tawaran</span>
                                </>
                            )}
                        </button>
                        <button onClick={() => setMode('SELECT')} className="w-full text-slate-500 text-sm font-bold py-2 hover:text-slate-800">Batalkan</button>
                    </div>
                )}

                {mode === 'RESULT' && (
                    <div className="text-center py-10">
                        <div className="w-20 h-20 bg-[#dcfce7] rounded-full flex items-center justify-center mx-auto mb-4 text-[#16a34a] border-4 border-[#16a34a]">
                            <Sparkles size={32} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 mb-2">DEAL!</h3>
                        <p className="text-slate-500 font-bold mb-8">Uang sudah diterima.</p>
                        <button onClick={onClose} className="w-full bg-slate-800 text-white font-black py-4 rounded-xl border-b-4 border-black active:border-b-0 active:translate-y-1">Tutup</button>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

const UserAvatar = ({ seed }: { seed: string }) => (
    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`} alt="avatar" className="w-full h-full object-cover" />
);

const FishIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 12c.94-2.08 2.38-3 5.42-3 1.79 0 3.8 1.52 4.58 3 .78 1.48.24 3-.58 3-2.6 0-3.6-1.6-4.42-1.6-1.56 0-2.56 3-4.58 3C4.6 16.4 3 14.8 3 12c0-1.8 1.2-3 2-3s1.2 1 1.5 3Z"/><path d="M9.5 9c-.56 0-1.06-.5-1.5-1.5-.44-1-.5-2.5-.5-2.5"/><path d="M19.5 13c-.5 0-1.2.4-1.9 1.4-.7 1-1.1 2.6-1.1 2.6"/><path d="m14 17.6-1.6 4.4c-.2.5-.9.6-1.2.1l-.8-1.5c-.5-.9-1.8-.9-2.3 0l-.8 1.5c-.4.5-1.1.4-1.2-.1L4.5 17.6"/></svg>
);