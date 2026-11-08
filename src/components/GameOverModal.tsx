import React from 'react';
import { GameStats, RunnerCustomization } from '../types';
import { RotateCcw, Trophy, Sparkles, Camera, Home } from 'lucide-react';

interface Props {
  stats: GameStats;
  customization: RunnerCustomization;
  isNewHigh: boolean;
  onPlayAgain: () => void;
  onOpenCustomizer: () => void;
  onGoToMenu: () => void;
}

export const GameOverModal: React.FC<Props> = ({
  stats,
  customization,
  isNewHigh,
  onPlayAgain,
  onOpenCustomizer,
  onGoToMenu,
}) => {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border-2 border-slate-700 rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col items-center text-center overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Runner Photo Medal Podium */}
        <div className="relative mb-4">
          <div
            className="w-20 h-20 rounded-3xl border-4 shadow-2xl overflow-hidden flex items-center justify-center bg-slate-950"
            style={{ borderColor: customization.shirtColor || customization.capColor || '#2563eb' }}
          >
            {customization.photoUrl ? (
              <img
                src={customization.photoUrl}
                alt="Runner"
                className="w-full h-full object-cover"
                style={{
                  transform: `scale(${customization.photoScale}) translate(${customization.photoOffsetX * 0.5}px, ${customization.photoOffsetY * 0.5}px)`,
                }}
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center font-black text-2xl text-slate-900"
                style={{ backgroundColor: customization.skinTone }}
              >
                JR
              </div>
            )}
          </div>
          {isNewHigh && (
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg animate-bounce">
              <Trophy className="w-4 h-4 fill-current" />
            </div>
          )}
        </div>

        {/* Title / Status */}
        {isNewHigh ? (
          <div className="mb-4">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 font-black text-xs uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              NEW RECORD!
            </span>
            <h2 className="text-3xl font-black text-white tracking-wide">AMAZING RUN!</h2>
          </div>
        ) : (
          <div className="mb-4">
            <h2 className="text-3xl font-black text-rose-500 tracking-wider">CRASHED!</h2>
            <p className="text-xs text-slate-400">Better luck dodging next time</p>
          </div>
        )}

        {/* Score Readout */}
        <div className="w-full bg-slate-950/70 border border-slate-800 rounded-2xl p-4 mb-5 space-y-3">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-slate-400 uppercase">FINAL SCORE</span>
            <span className="text-2xl font-black text-amber-400 tabular-nums">
              {stats.score.toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-left">
            <div className="bg-slate-900/80 rounded-xl p-2.5 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">"T" TOKENS COLLECTED</span>
              <span className="text-lg font-black text-pink-300 tabular-nums flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-pink-500 via-rose-400 to-pink-200 border border-pink-300 flex items-center justify-center shadow-[0_0_8px_rgba(244,114,182,0.6)] relative">
                  <span className="font-black text-white text-[9px] leading-none">
                    T
                  </span>
                  <div className="absolute -top-0.5 -right-0.5 w-1 h-1 bg-rose-500 rounded-full border border-white" />
                </div>
                {stats.coins.toLocaleString()}
              </span>
            </div>

            <div className="bg-slate-900/80 rounded-xl p-2.5 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">DISTANCE</span>
              <span className="text-lg font-black text-cyan-400 tabular-nums">
                {stats.distance}m
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-3">
          <button
            onClick={onPlayAgain}
            className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-rose-500 to-amber-400 hover:from-amber-300 hover:via-rose-400 hover:to-amber-300 text-slate-950 font-black text-base uppercase tracking-wider rounded-2xl shadow-xl transition-all transform hover:scale-102 active:scale-95 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            PLAY AGAIN
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={onOpenCustomizer}
              className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1.5"
            >
              <Camera className="w-4 h-4 text-cyan-400" />
              Edit Runner
            </button>
            <button
              onClick={onGoToMenu}
              className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1.5"
            >
              <Home className="w-4 h-4 text-amber-400" />
              Title Menu
            </button>
          </div>

          <div className="pt-2 text-[10px] text-slate-500 font-medium">
            Subway Rush 3D &middot; Engineered by <span className="text-cyan-400 font-bold">Venkat</span>
          </div>
        </div>
      </div>
    </div>
  );
};
