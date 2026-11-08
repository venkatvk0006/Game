import React from 'react';
import { CyberMission } from '../types';
import { X, Trophy, Check, Gift, ArrowRight } from 'lucide-react';
import { sound } from '../audio/SoundFX';

interface Props {
  missions: CyberMission[];
  onClaimReward: (missionId: string, reward: number) => void;
  onClose: () => void;
}

export const MissionsDrawer: React.FC<Props> = ({ missions, onClaimReward, onClose }) => {
  const handleClaim = (m: CyberMission) => {
    if (m.claimed || m.progress < m.target) return;
    sound.playMissionComplete();
    onClaimReward(m.id, m.reward);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border-2 border-emerald-500/60 rounded-3xl shadow-[0_0_50px_rgba(16,185,129,0.2)] flex flex-col max-h-[92vh] overflow-hidden text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-slate-950 font-black shadow-lg">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                CYBER OBJECTIVES // PROTOCOLS
              </span>
              <h3 className="text-xl font-black text-white tracking-wide">MISSIONS & CHALLENGES</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Missions List */}
        <div className="p-6 overflow-y-auto space-y-3.5 flex-1">
          {missions.map((m) => {
            const isCompleted = m.progress >= m.target;
            const pct = Math.min(100, Math.round((m.progress / m.target) * 100));

            return (
              <div
                key={m.id}
                className={`p-4 rounded-2xl border transition-all ${
                  m.claimed
                    ? 'border-slate-800/80 bg-slate-950/40 opacity-70'
                    : isCompleted
                    ? 'border-emerald-500/60 bg-emerald-950/20 shadow-lg shadow-emerald-500/10'
                    : 'border-slate-800 bg-slate-950/60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-black text-white flex items-center gap-2">
                      {m.title}
                      {m.claimed && (
                        <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded uppercase font-bold">
                          Claimed
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">{m.desc}</p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-xs font-black text-pink-300 tabular-nums">
                      +{m.reward}
                    </span>
                    <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-pink-500 via-rose-400 to-pink-200 border border-pink-300 flex items-center justify-center shadow-[0_0_8px_rgba(244,114,182,0.6)] relative">
                      <span className="font-black text-white text-[9px] leading-none">
                        T
                      </span>
                      <div className="absolute -top-0.5 -right-0.5 w-1 h-1 bg-rose-500 rounded-full border border-white" />
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isCompleted ? 'bg-gradient-to-r from-emerald-400 to-teal-400' : 'bg-cyan-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <span className="text-[11px] font-bold text-slate-400 tabular-nums shrink-0">
                    {Math.min(m.progress, m.target)} / {m.target} ({pct}%)
                  </span>

                  {isCompleted && !m.claimed && (
                    <button
                      onClick={() => handleClaim(m)}
                      className="px-3 py-1 bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition active:scale-95 flex items-center gap-1 shrink-0"
                    >
                      <Gift className="w-3.5 h-3.5" />
                      CLAIM
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Complete missions during your runs to earn bonus cute "T" tokens
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
