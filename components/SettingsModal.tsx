import React from 'react';
import { X, Gamepad2, Bug } from 'lucide-react';
import { Settings } from '../types';

interface SettingsModalProps {
  settings: Settings;
  onUpdate: (newSettings: Settings) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ settings, onUpdate, onClose }) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="bg-slate-800 p-4 flex justify-between items-center text-white">
          <h2 className="font-bold text-lg">Pengaturan</h2>
          <button onClick={onClose}><X /></button>
        </div>
        <div className="p-6 space-y-6">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Gamepad2 className="text-slate-600" />
              <div className="flex flex-col">
                <span className="font-bold text-slate-800">Joystick Layar</span>
                <span className="text-xs text-slate-500">Kontrol bulat untuk HP</span>
              </div>
            </div>
            <button 
              onClick={() => onUpdate({ ...settings, useJoystick: !settings.useJoystick })}
              className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.useJoystick ? 'bg-green-500' : 'bg-gray-300'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${settings.useJoystick ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bug className="text-slate-600" />
              <div className="flex flex-col">
                <span className="font-bold text-slate-800">Mode Debug</span>
                <span className="text-xs text-slate-500">Tampilkan koordinat</span>
              </div>
            </div>
            <button 
              onClick={() => onUpdate({ ...settings, showDebug: !settings.showDebug })}
              className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.showDebug ? 'bg-green-500' : 'bg-gray-300'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${settings.showDebug ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};