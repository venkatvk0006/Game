import React from 'react';
import { GameStats, PowerupState, RunnerCustomization } from '../types';
import {
  Volume2,
  VolumeX,
  Pause,
  Zap,
  Magnet,
  Rocket,
  Shield,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { sound } from '../audio/SoundFX';

interface Props {
  stats: GameStats;
  powerups: PowerupState[];
  customization: RunnerCustomization;
  isMuted: boolean;
  onToggleMute: () => void;
  onPause: () => void;
  onShiftLeft: () => void;
  onShiftRight: () => void;
  onJump: () => void;
  onSlide: () => void;
  onHoverboard: () => void;
}

export const GameHUD: React.FC<Props> = ({
  stats,
  powerups,
  customization,
  isMuted,
  onToggleMute,
  onPause,
  onShiftLeft,
  onShiftRight,
  onJump,
  onSlide,
  onHoverboard,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none select-none z-20 flex flex-col justify-between p-4 sm:p-6">
      {/* Top Bar Perimeter Cluster */}
      <div className="flex items-start justify-between w-full">
        {/* Top-Left: Runner Avatar + Score */}
        <div className="flex items-center gap-3">
          {/* Avatar Thumbnail with custom photo */}
          <div
            className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl border-2 shadow-xl overflow-hidden flex items-center justify-center pointer-events-auto bg-slate-900"
            style={{ borderColor: customization.shirtColor || customization.capColor || '#2563eb' }}
          >
            {customization.photoUrl ? (
              <img
                src={customization.photoUrl}
                alt="Runner"
                className="w-full h-full object-cover"
                style={{
                  transform: `scale(${customization.photoScale}) translate(${customization.photoOffsetX * 0.4}px, ${customization.photoOffsetY * 0.4}px)`,
                }}
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center font-black text-slate-900 text-lg"
                style={{ backgroundColor: customization.skinTone }}
              >
                JR
              </div>
            )}
          </div>

          {/* Score Cluster */}
          <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl px-3.5 py-2 shadow-xl pointer-events-auto flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">SCORE</span>
              {stats.multiplier > 1 && (
                <span className="bg-gradient-to-r from-amber-400 to-rose-500 text-slate-950 font-black text-[10px] px-1.5 py-0.2 rounded-md">
                  x{stats.multiplier}
                </span>
              )}
            </div>
            <span className="text-xl sm:text-2xl font-black text-amber-400 tabular-nums tracking-tight">
              {stats.score.toLocaleString()}
            </span>
            <span className="text-[10px] font-bold text-slate-400 tabular-nums">
              {stats.distance}m RUN
            </span>
          </div>
        </div>

        {/* Top-Center: Active Powerups Countdown */}
        <div className="flex items-center gap-2">
          {powerups.map((p) => {
            const pct = Math.max(0, Math.min(100, (p.remaining / p.duration) * 100));
            const colorClass =
              p.type === 'MAGNET'
                ? 'from-rose-500 to-red-600'
                : p.type === 'SNEAKERS'
                ? 'from-emerald-400 to-green-600'
                : p.type === 'JETPACK'
                ? 'from-amber-400 to-orange-500'
                : p.type === 'HOVERBOARD'
                ? 'from-cyan-400 to-blue-600'
                : 'from-purple-400 to-indigo-600';

            return (
              <div
                key={p.type}
                className="bg-slate-900/90 border border-slate-700/80 rounded-2xl px-2.5 py-1.5 shadow-xl flex items-center gap-2 pointer-events-auto"
              >
                <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${colorClass} flex items-center justify-center text-slate-950 font-black`}>
                  {p.type === 'MAGNET' && <Magnet className="w-3.5 h-3.5" />}
                  {p.type === 'SNEAKERS' && <Zap className="w-3.5 h-3.5" />}
                  {p.type === 'JETPACK' && <Rocket className="w-3.5 h-3.5" />}
                  {p.type === 'HOVERBOARD' && <Shield className="w-3.5 h-3.5" />}
                  {p.type === 'MULTIPLIER' && <Flame className="w-3.5 h-3.5" />}
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-extrabold uppercase text-slate-300">
                    {p.type}
                  </span>
                  <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${colorClass} transition-all duration-100`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Top-Right: Coins + Mute & Pause */}
        <div className="flex items-center gap-2">
          {/* Cute Light Pink "T" Token Badge */}
          <div className="bg-slate-900/90 border border-pink-400/40 rounded-2xl px-3 py-1.5 shadow-[0_0_15px_rgba(244,114,182,0.25)] flex items-center gap-2 pointer-events-auto">
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-pink-500 via-rose-400 to-pink-200 border border-pink-300 flex items-center justify-center shadow-[0_0_10px_rgba(244,114,182,0.6)] relative">
              <span className="font-black text-white text-[11px] leading-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                T
              </span>
              <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-rose-500 rounded-full border border-white" />
            </div>
            <span className="text-lg sm:text-xl font-black text-pink-300 tabular-nums">
              {stats.coins.toLocaleString()}
            </span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={onToggleMute}
            className="w-10 h-10 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 flex items-center justify-center text-slate-300 hover:text-white shadow-xl pointer-events-auto transition active:scale-95"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Pause Button */}
          <button
            onClick={onPause}
            className="w-10 h-10 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 flex items-center justify-center text-slate-300 hover:text-white shadow-xl pointer-events-auto transition active:scale-95"
            title="Pause Game (Esc)"
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Center 85% playfield is COMPLETELY UNOBSTRUCTED as per craft guidelines */}

      {/* Bottom Dock / Touch Controls for Mobile/Tablet */}
      <div className="w-full flex items-end justify-between">
        {/* Left / Right Lane Arrows */}
        <div className="flex gap-2.5 pointer-events-auto">
          <button
            onClick={onShiftLeft}
            className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-slate-900/85 hover:bg-slate-800 border border-slate-700/80 text-white flex items-center justify-center shadow-xl active:scale-95 transition"
            title="Left Lane (A / Left Arrow)"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <button
            onClick={onShiftRight}
            className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-slate-900/85 hover:bg-slate-800 border border-slate-700/80 text-white flex items-center justify-center shadow-xl active:scale-95 transition"
            title="Right Lane (D / Right Arrow)"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>

        {/* Center: Hoverboard Summon Button */}
        <div className="pointer-events-auto">
          <button
            onClick={onHoverboard}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500/90 to-blue-600/90 hover:from-cyan-400 hover:to-blue-500 border border-cyan-400/60 text-slate-950 font-black text-xs uppercase tracking-wider shadow-xl active:scale-95 transition flex items-center gap-1.5"
            title="Summon Hoverboard (Key B or Double Tap)"
          >
            <Shield className="w-4 h-4 text-slate-950" />
            <span className="hidden sm:inline">HOVERBOARD</span>
            <span className="text-[10px] bg-slate-950/30 text-white px-1.5 py-0.5 rounded">B</span>
          </button>
        </div>

        {/* Jump / Slide Controls */}
        <div className="flex gap-2.5 pointer-events-auto">
          <button
            onClick={onSlide}
            className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-slate-900/85 hover:bg-slate-800 border border-slate-700/80 text-amber-400 flex items-center justify-center shadow-xl active:scale-95 transition"
            title="Roll / Slide (S / Down Arrow)"
          >
            <ArrowDown className="w-6 h-6" />
          </button>
          <button
            onClick={onJump}
            className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-slate-900/85 hover:bg-slate-800 border border-cyan-500/60 text-cyan-300 flex items-center justify-center shadow-xl active:scale-95 transition"
            title="Jump (W / Space / Up Arrow)"
          >
            <ArrowUp className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
