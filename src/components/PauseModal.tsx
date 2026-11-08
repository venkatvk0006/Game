import React from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX, Camera } from 'lucide-react';
import { RunnerCustomization } from '../types';

interface Props {
  customization: RunnerCustomization;
  isMuted: boolean;
  onResume: () => void;
  onRestart: () => void;
  onGoToMenu: () => void;
  onToggleMute: () => void;
  onOpenCustomizer: () => void;
}

export const PauseModal: React.FC<Props> = ({
  customization,
  isMuted,
  onResume,
  onRestart,
  onGoToMenu,
  onToggleMute,
  onOpenCustomizer,
}) => {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center shadow-2xl">
        {/* Runner Avatar Thumbnail */}
        <div
          className="w-16 h-16 rounded-2xl border-2 mb-3 overflow-hidden flex items-center justify-center bg-slate-950"
          style={{ borderColor: customization.shirtColor || customization.capColor || '#2563eb' }}
        >
          {customization.photoUrl ? (
            <img src={customization.photoUrl} alt="Runner" className="w-full h-full object-cover" />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-slate-900 font-black text-xl"
              style={{ backgroundColor: customization.skinTone }}
            >
              JR
            </div>
          )}
        </div>

        <h3 className="text-2xl font-black text-white tracking-wider mb-1">GAME PAUSED</h3>
        <p className="text-xs text-slate-400 mb-6">Take a breather or customize your runner</p>

        <div className="w-full space-y-2.5">
          <button
            onClick={onResume}
            className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-rose-500 hover:from-amber-300 hover:to-rose-400 text-slate-950 font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl transition active:scale-95 flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5 fill-current" />
            RESUME RUN
          </button>

          <button
            onClick={onOpenCustomizer}
            className="w-full py-2.5 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-cyan-300 font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2"
          >
            <Camera className="w-4 h-4 text-cyan-400" />
            Customize Runner Photo
          </button>

          <button
            onClick={onRestart}
            className="w-full py-2.5 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            Restart Run
          </button>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={onToggleMute}
              className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              <span>{isMuted ? 'Unmute' : 'Mute'}</span>
            </button>

            <button
              onClick={onGoToMenu}
              className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
            >
              <Home className="w-4 h-4" />
              <span>Menu</span>
            </button>
          </div>

          <div className="pt-2 text-[10px] text-slate-400 font-medium">
            Subway Rush 3D &middot; Created by <span className="text-cyan-400 font-bold">Venkat</span>
          </div>
        </div>
      </div>
    </div>
  );
};
