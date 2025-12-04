import React, { useState, useEffect, useRef } from 'react';
import { FishType } from '../types';
import { Fish, Anchor } from 'lucide-react';

interface FishingMinigameProps {
  onCatch: (fishType: FishType) => void;
}

export const FishingMinigame: React.FC<FishingMinigameProps> = ({ onCatch }) => {
  const [gameState, setGameState] = useState<'IDLE' | 'CASTING' | 'WAITING' | 'HOOKED' | 'REELING'>('IDLE');
  const [tension, setTension] = useState(0); // 0 to 100
  const [fishProgress, setFishProgress] = useState(0); // 0 to 100 (Success)
  const [message, setMessage] = useState("Tap untuk melempar kail!");

  const tensionRef = useRef(0);
  const progressRef = useRef(0);
  const animationFrameRef = useRef<number>(0);

  // Game Loop for Reeling
  useEffect(() => {
    if (gameState === 'REELING') {
      const loop = () => {
        // Natural tension decrease (fish pulling away)
        tensionRef.current = Math.max(0, tensionRef.current - 0.5);
        
        // Fail condition
        if (tensionRef.current >= 100) {
          setGameState('IDLE');
          setMessage("Benang putus! Ikan lepas.");
          setTension(0);
          setFishProgress(0);
          return;
        }

        // Success condition
        if (progressRef.current >= 100) {
          setGameState('IDLE');
          const randomFish = Math.random() > 0.7 ? FishType.NILA : FishType.LELE;
          onCatch(randomFish);
          setMessage(`Hore! Dapat ${randomFish}!`);
          setTension(0);
          setFishProgress(0);
          return;
        }

        setTension(tensionRef.current);
        setFishProgress(progressRef.current);
        animationFrameRef.current = requestAnimationFrame(loop);
      };
      animationFrameRef.current = requestAnimationFrame(loop);
    }

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [gameState, onCatch]);

  const handleAction = () => {
    if (gameState === 'IDLE') {
      setGameState('WAITING');
      setMessage("Menunggu ikan...");
      setTimeout(() => {
        setGameState('HOOKED');
        setMessage("Ikan memakan umpan! TARIK!");
      }, 2000 + Math.random() * 3000);
    } else if (gameState === 'HOOKED') {
      setGameState('REELING');
      setMessage("Tahan tombol/Tap berulang untuk menarik!");
      tensionRef.current = 50;
      progressRef.current = 20;
    } else if (gameState === 'REELING') {
      // Reeling mechanic: Click increases progress AND tension
      tensionRef.current += 15; 
      progressRef.current += 5;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 bg-cyan-100 rounded-xl border-4 border-cyan-300 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-10 left-10 opacity-20"><Fish size={40} /></div>
      <div className="absolute bottom-20 right-10 opacity-20"><Fish size={60} /></div>

      <div className="text-center mb-8 z-10">
        <h2 className="text-3xl font-black text-cyan-800 mb-2">Pemancingan Desa</h2>
        <p className="text-cyan-700 font-medium">{message}</p>
      </div>

      <div className="w-full max-w-xs z-10 space-y-4">
        {gameState === 'REELING' && (
          <>
            {/* Tension Bar */}
            <div className="w-full bg-gray-300 h-4 rounded-full overflow-hidden border border-gray-400 relative">
              <div 
                className={`h-full transition-all duration-100 ${tension > 80 ? 'bg-red-600' : 'bg-orange-400'}`}
                style={{ width: `${tension}%` }}
              ></div>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-black/50">TEGANGAN BENANG</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-300 h-6 rounded-full overflow-hidden border border-gray-400 relative">
               <div 
                className="h-full bg-green-500 transition-all duration-100"
                style={{ width: `${fishProgress}%` }}
              ></div>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white shadow-sm">JARAK IKAN</span>
            </div>
          </>
        )}

        <button
          onClick={handleAction}
          className={`w-40 h-40 rounded-full flex flex-col items-center justify-center border-8 shadow-2xl transition-transform active:scale-95 mx-auto ${
            gameState === 'HOOKED' || gameState === 'REELING'
              ? 'bg-red-500 border-red-700 text-white animate-pulse'
              : 'bg-cyan-500 border-cyan-700 text-white hover:bg-cyan-600'
          }`}
        >
          {gameState === 'IDLE' && <Anchor size={48} />}
          {gameState === 'WAITING' && <div className="animate-spin"><Anchor size={48} /></div>}
          {(gameState === 'HOOKED' || gameState === 'REELING') && <span className="text-2xl font-black">TARIK!</span>}
        </button>
      </div>
    </div>
  );
};