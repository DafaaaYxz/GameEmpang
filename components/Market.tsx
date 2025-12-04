import React, { useState } from 'react';
import { getNPCAdvice } from '../services/geminiService';
import { User, MessageCircle, Store, Send } from 'lucide-react';

interface MarketProps {
  money: number;
  level: number;
}

export const Market: React.FC<MarketProps> = ({ money, level }) => {
  const [npcResponse, setNpcResponse] = useState<string>("Halo Nak! Mau tanya apa sama Bapak?");
  const [isLoading, setIsLoading] = useState(false);
  const [inputContext, setInputContext] = useState("");

  const handleAsk = async () => {
    if (!inputContext.trim()) return;
    setIsLoading(true);
    setNpcResponse("...");
    const advice = await getNPCAdvice("Juragan", money, level, inputContext);
    setNpcResponse(advice);
    setIsLoading(false);
    setInputContext("");
  };

  return (
    <div className="space-y-6 pb-24 h-full flex flex-col">
      
      {/* Market Ticker */}
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
         {['Lele', 'Nila', 'Mas'].map((fish, idx) => (
             <div key={fish} className="bg-white min-w-[140px] p-3 rounded-xl shadow-sm border border-slate-100 flex flex-col">
                 <span className="text-xs text-slate-400 font-bold uppercase">{fish}</span>
                 <div className="flex items-end gap-2 mt-1">
                     <span className="font-bold text-slate-800">Rp {(100 + idx * 50) * 10}</span>
                     <span className={`text-xs font-bold ${idx % 2 === 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {idx % 2 === 0 ? '+2.4%' : '-0.5%'}
                     </span>
                 </div>
             </div>
         ))}
      </div>

      {/* Chat Interface */}
      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
         {/* Chat Header */}
         <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center gap-3">
            <div className="relative">
                <img src="https://picsum.photos/id/1005/100/100" alt="Pak Soleh" className="w-10 h-10 rounded-full border border-white shadow-sm grayscale" />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div>
                <h3 className="font-bold text-slate-800 text-sm">Pak Soleh</h3>
                <p className="text-xs text-slate-500">Online • Mentor</p>
            </div>
         </div>

         {/* Chat Area */}
         <div className="flex-1 p-4 bg-slate-50/30 overflow-y-auto space-y-4">
             {/* NPC Message */}
             <div className="flex gap-3">
                 <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0 overflow-hidden">
                    <img src="https://picsum.photos/id/1005/100/100" className="w-full h-full object-cover grayscale" />
                 </div>
                 <div className="bg-white border border-slate-100 p-3 rounded-2xl rounded-tl-none shadow-sm max-w-[80%] text-sm text-slate-700 leading-relaxed">
                     {npcResponse === "..." ? (
                         <div className="flex gap-1">
                             <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                             <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                             <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                         </div>
                     ) : (
                         npcResponse
                     )}
                 </div>
             </div>
         </div>

         {/* Input Area */}
         <div className="p-3 bg-white border-t border-slate-100">
             <div className="flex gap-2 bg-slate-100 p-1.5 rounded-full pl-4">
                 <input 
                   type="text" 
                   value={inputContext}
                   onChange={(e) => setInputContext(e.target.value)}
                   placeholder="Tanya saran..."
                   className="flex-1 bg-transparent text-sm focus:outline-none text-slate-700"
                   onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                 />
                 <button 
                   onClick={handleAsk}
                   disabled={isLoading}
                   className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-full shadow-lg shadow-indigo-200 transition-all disabled:opacity-50"
                 >
                   <Send size={16} />
                 </button>
             </div>
         </div>
      </div>
    </div>
  );
};