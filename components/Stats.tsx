import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { GameState } from '../types';

interface StatsProps {
  history: GameState['history'];
}

export const Stats: React.FC<StatsProps> = ({ history }) => {
  // Use last 10-20 data points for readability
  const data = history.slice(-20);

  return (
    <div className="p-4 space-y-6 h-full pb-20">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Laporan Keuangan</h2>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorMoney" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="day" hide />
              <YAxis tickFormatter={(val) => `${val/1000}k`} stroke="#94a3b8" />
              <Tooltip 
                formatter={(value: number) => [`Rp ${value.toLocaleString()}`, 'Uang']}
                labelFormatter={(label) => `Hari ke-${label}`}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Area 
                type="monotone" 
                dataKey="money" 
                stroke="#059669" 
                fillOpacity={1} 
                fill="url(#colorMoney)" 
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <p className="text-center text-slate-500 mt-4 text-sm">Grafik perkembangan aset (Uang Tunai) anda seiring waktu.</p>
      </div>
    </div>
  );
};
