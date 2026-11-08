import React, { useState, useEffect, useRef } from 'react';
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
  Activity,
  Gauge,
  HelpCircle,
  Radio,
} from 'lucide-react';

interface Props {
  stats: GameStats;
  powerups: PowerupState[];
  customization: RunnerCustomization;
  isMuted: boolean;
  onToggleMute: () => void;
  onPause: () => void;
  onOpenAbout: () => void;
  onShiftLeft: () => void;
  onShiftRight: () => void;
  onJump: () => void;
  onSlide: () => void;
  onHoverboard: () => void;
  onTriggerOverdrive: () => void;
}

export const CyberHUD: React.FC<Props> = ({
  stats,
  powerups,
  customization,
  isMuted,
  onToggleMute,
  onPause,
  onOpenAbout,
  onShiftLeft,
  onShiftRight,
  onJump,
  onSlide,
  onHoverboard,
  onTriggerOverdrive,
}) => {
  const kmh = Math.round(stats.speed * 3.6);
  const isOverdriveReady = stats.overdriveEnergy >= 100 && !stats.isOverdriveActive;

  // Satisfying Cute Pink "T" Token Pickup Pop Reaction
  const [isCoinPopping, setIsCoinPopping] = useState(false);
  const prevCoinsRef = useRef(stats.coins);

  useEffect(() => {
    if (stats.coins > prevCoinsRef.current) {
      setIsCoinPopping(true);
      const timer = setTimeout(() => setIsCoinPopping(false), 240);
      prevCoinsRef.current = stats.coins;
      return () => clearTimeout(timer);
    }
    prevCoinsRef.current = stats.coins;
  }, [stats.coins]);

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-20 flex flex-col justify-between p-3 sm:p-5">
      {/* TOP TACTICAL HUD CLUSTER */}
      <div className="flex items-start justify-between w-full">
        {/* Top-Left: Cyber Avatar & Tactical Score Matrix */}
        <div className="flex items-center gap-3">
          {/* Cyberpunk Avatar Frame */}
          <div className="relative pointer-events-auto">
            <div
              className="w-13 h-13 sm:w-15 sm:h-15 rounded-2xl border-2 shadow-[0_0_20px_rgba(6,182,212,0.35)] overflow-hidden flex items-center justify-center bg-slate-950/90 relative"
              style={{ borderColor: stats.isOverdriveActive ? '#f43f5e' : customization.shirtColor || '#06b6d4' }}
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
                  className="w-full h-full flex items-center justify-center font-black text-slate-900 text-base"
                  style={{ backgroundColor: customization.skinTone || '#d4a373' }}
                >
                  RUN
                </div>
              )}

              {/* Holographic corner accents */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-400" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan-400" />
            </div>

            {/* Overdrive Status Pill */}
            {stats.isOverdriveActive && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-rose-600 text-white font-black text-[9px] uppercase tracking-wider shadow-md">
                WARP
              </div>
            )}
          </div>

          {/* Tactical Score Matrix */}
          <div className="bg-slate-950/85 border border-cyan-500/40 rounded-2xl px-3.5 py-2 shadow-2xl pointer-events-auto flex flex-col relative overflow-hidden backdrop-blur-none">
            {/* Top scanning line aesthetic */}
            <div className="flex items-center justify-between gap-3">
              <span className="text-[9px] font-black uppercase tracking-widest text-cyan-400 flex items-center gap-1">
                <Radio className="w-2.5 h-2.5 text-cyan-400" />
                TELEMETRY SCORE
              </span>
              {stats.multiplier > 1 && (
                <span className="bg-gradient-to-r from-amber-400 to-rose-500 text-slate-950 font-black text-[10px] px-1.5 py-0.2 rounded font-mono">
                  x{stats.multiplier}
                </span>
              )}
            </div>

            <span className="text-xl sm:text-2xl font-black text-amber-400 tabular-nums font-mono tracking-tight leading-none mt-1">
              {stats.score.toLocaleString()}
            </span>

            <div className="flex items-center gap-2 mt-1 text-[10px] font-bold text-slate-400 tabular-nums">
              <span className="text-cyan-300 font-mono">{stats.distance}M</span>
              <span>&middot;</span>
              <span className="flex items-center gap-1 text-rose-400 font-mono">
                <Activity className="w-3 h-3 text-rose-500" />
                {stats.heartRate || 142} BPM
              </span>
            </div>
          </div>
        </div>

        {/* Top-Center: Cyber Overdrive Core & Powerup Matrix */}
        <div className="flex flex-col items-center gap-1.5 pointer-events-auto">
          {/* Overdrive Activation Bar */}
          <div
            onClick={isOverdriveReady ? onTriggerOverdrive : undefined}
            className={`px-3 py-1.5 rounded-2xl border transition-all flex items-center gap-2.5 shadow-2xl ${
              stats.isOverdriveActive
                ? 'bg-rose-950/80 border-rose-500 ring-2 ring-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.4)]'
                : isOverdriveReady
                ? 'bg-amber-950/80 border-amber-400 ring-2 ring-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.5)] cursor-pointer'
                : 'bg-slate-950/80 border-slate-800'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-lg flex items-center justify-center font-black ${
                stats.isOverdriveActive
                  ? 'bg-rose-500 text-white animate-spin'
                  : isOverdriveReady
                  ? 'bg-amber-400 text-slate-950'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-300">
                  {stats.isOverdriveActive
                    ? 'WARP OVERDRIVE ACTIVE'
                    : isOverdriveReady
                    ? 'OVERDRIVE READY! [E]'
                    : 'OVERDRIVE CHARGE'}
                </span>
                <span className="text-[9px] font-bold text-amber-400 tabular-nums font-mono">
                  {Math.round(stats.overdriveEnergy)}%
                </span>
              </div>
              <div className="w-28 sm:w-36 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-700 mt-0.5">
                <div
                  className={`h-full transition-all duration-150 ${
                    stats.isOverdriveActive
                      ? 'bg-gradient-to-r from-rose-500 to-amber-400'
                      : isOverdriveReady
                      ? 'bg-gradient-to-r from-amber-400 via-rose-500 to-amber-300'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                  }`}
                  style={{ width: `${Math.min(100, stats.overdriveEnergy)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Active Powerups Row */}
          {powerups.length > 0 && (
            <div className="flex items-center gap-1.5">
              {powerups.map((p) => {
                const pct = Math.max(0, Math.min(100, (p.remaining / p.duration) * 100));
                const colorClass =
                  p.type === 'MAGNET'
                    ? 'text-rose-400 border-rose-500/50 bg-rose-950/40'
                    : p.type === 'SNEAKERS'
                    ? 'text-emerald-400 border-emerald-500/50 bg-emerald-950/40'
                    : p.type === 'JETPACK'
                    ? 'text-amber-400 border-amber-500/50 bg-amber-950/40'
                    : p.type === 'HOVERBOARD'
                    ? 'text-cyan-400 border-cyan-500/50 bg-cyan-950/40'
                    : 'text-purple-400 border-purple-500/50 bg-purple-950/40';

                return (
                  <div
                    key={p.type}
                    className={`border rounded-xl px-2 py-1 shadow-lg flex items-center gap-1.5 backdrop-blur-none ${colorClass}`}
                  >
                    {p.type === 'MAGNET' && <Magnet className="w-3 h-3" />}
                    {p.type === 'SNEAKERS' && <Zap className="w-3 h-3" />}
                    {p.type === 'JETPACK' && <Rocket className="w-3 h-3" />}
                    {p.type === 'HOVERBOARD' && <Shield className="w-3 h-3" />}
                    {p.type === 'MULTIPLIER' && <Flame className="w-3 h-3" />}
                    <span className="text-[10px] font-black tabular-nums font-mono">
                      {Math.ceil(p.remaining)}s
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top-Right: Coins, Speedometer, About & Controls */}
        <div className="flex items-center gap-2">
          {/* Cute Light Pink "T" Token Readout with Pop Reaction */}
          <div
            className={`bg-slate-950/90 border rounded-2xl px-3 py-1.5 flex items-center gap-2 pointer-events-auto transition-all duration-150 relative ${
              isCoinPopping
                ? 'scale-115 border-pink-300 ring-2 ring-pink-400 shadow-[0_0_25px_rgba(244,114,182,0.85)] bg-pink-950/40'
                : 'scale-100 border-pink-400/50 shadow-[0_0_15px_rgba(244,114,182,0.25)]'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-gradient-to-tr from-pink-500 via-rose-400 to-pink-200 border border-pink-300 flex items-center justify-center relative transition-transform duration-150 ${
                isCoinPopping ? 'rotate-12 scale-125 shadow-[0_0_15px_rgba(244,114,182,0.9)]' : 'shadow-[0_0_10px_rgba(244,114,182,0.6)]'
              }`}
            >
              <span className="font-black text-white text-[11px] leading-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                T
              </span>
              <div
                className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-rose-500 rounded-full border border-white ${
                  isCoinPopping ? 'animate-ping' : ''
                }`}
              />
            </div>
            <span
              className={`text-base sm:text-lg font-black tabular-nums font-mono transition-colors duration-150 ${
                isCoinPopping ? 'text-white' : 'text-pink-300'
              }`}
            >
              {stats.coins.toLocaleString()}
            </span>

            {/* Micro +1 Floaty Indicator */}
            {isCoinPopping && (
              <span className="absolute -top-3.5 right-2 text-xs font-black text-pink-300 animate-bounce pointer-events-none drop-shadow-[0_0_6px_rgba(244,114,182,0.9)]">
                +1
              </span>
            )}
          </div>

          {/* Speedometer Cluster */}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-950/85 border border-slate-700/80 rounded-2xl px-2.5 py-1.5 shadow-xl">
            <Gauge className="w-4 h-4 text-cyan-400" />
            <div className="flex flex-col">
              <span className="text-[8px] font-black uppercase text-slate-400">VELOCITY</span>
              <span className="text-xs font-black text-cyan-300 tabular-nums font-mono leading-none">
                {kmh} KM/H
              </span>
            </div>
          </div>

          {/* About Creator Modal Button */}
          <button
            onClick={onOpenAbout}
            className="w-10 h-10 rounded-2xl bg-slate-950/85 hover:bg-slate-800 border border-cyan-500/40 hover:border-cyan-400 flex items-center justify-center text-cyan-400 hover:text-white shadow-xl pointer-events-auto transition active:scale-95"
            title="About Creator (Venkat)"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleMute}
            className="w-10 h-10 rounded-2xl bg-slate-950/85 hover:bg-slate-800 border border-slate-700/80 flex items-center justify-center text-slate-300 hover:text-white shadow-xl pointer-events-auto transition active:scale-95"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Pause Button */}
          <button
            onClick={onPause}
            className="w-10 h-10 rounded-2xl bg-slate-950/85 hover:bg-slate-800 border border-slate-700/80 flex items-center justify-center text-slate-300 hover:text-white shadow-xl pointer-events-auto transition active:scale-95"
            title="Pause Game (Esc)"
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* CENTER 85% PLAYFIELD REMAINS COMPLETELY UNOBSTRUCTED AS REQUIRED */}

      {/* BOTTOM CYBER CONTROLS DOCK */}
      <div className="w-full flex items-end justify-between">
        {/* Left / Right Lane Navigation */}
        <div className="flex gap-2 pointer-events-auto">
          <button
            onClick={onShiftLeft}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-950/85 hover:bg-slate-800 border border-cyan-500/50 hover:border-cyan-400 text-white flex items-center justify-center shadow-2xl active:scale-95 transition"
            title="Left Lane (A / Left Arrow)"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
          </button>
          <button
            onClick={onShiftRight}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-950/85 hover:bg-slate-800 border border-cyan-500/50 hover:border-cyan-400 text-white flex items-center justify-center shadow-2xl active:scale-95 transition"
            title="Right Lane (D / Right Arrow)"
          >
            <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
          </button>
        </div>

        {/* Center: Overdrive & Hoverboard Action Triggers */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Hoverboard Summon */}
          <button
            onClick={onHoverboard}
            className="px-3.5 py-2.5 rounded-2xl bg-slate-950/85 hover:bg-slate-800 border border-cyan-400/60 text-cyan-300 font-black text-xs uppercase tracking-wider shadow-2xl active:scale-95 transition flex items-center gap-1.5"
            title="Summon Hoverboard (Key B)"
          >
            <Shield className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">HOVERBOARD</span>
            <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800 px-1.5 py-0.5 rounded font-mono">
              B
            </span>
          </button>

          {/* Overdrive Trigger Button */}
          {isOverdriveReady && (
            <button
              onClick={onTriggerOverdrive}
              className="px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 via-rose-500 to-amber-400 hover:from-amber-300 hover:to-rose-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.5)] active:scale-95 transition flex items-center gap-1.5"
              title="Activate Overdrive (Key E)"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>OVERDRIVE</span>
              <span className="text-[10px] bg-slate-950/40 text-white px-1.5 py-0.5 rounded font-mono">
                E
              </span>
            </button>
          )}
        </div>

        {/* Jump / Slide Controls */}
        <div className="flex gap-2 pointer-events-auto">
          <button
            onClick={onSlide}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-950/85 hover:bg-slate-800 border border-amber-500/50 hover:border-amber-400 text-amber-400 flex items-center justify-center shadow-2xl active:scale-95 transition"
            title="Roll / Slide (S / Down Arrow)"
          >
            <ArrowDown className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button
            onClick={onJump}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-950/85 hover:bg-slate-800 border border-cyan-400 text-cyan-300 flex items-center justify-center shadow-2xl active:scale-95 transition"
            title="Jump (W / Space / Up Arrow)"
          >
            <ArrowUp className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
