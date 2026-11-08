import React from 'react';
import { RunnerCustomization } from '../types';
import { Play, Camera, Trophy, Sparkles, Volume2, VolumeX, Shield, Zap, HelpCircle, User } from 'lucide-react';

interface Props {
  customization: RunnerCustomization;
  highScore: number;
  coins: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onStart: () => void;
  onOpenCustomizer: () => void;
  onOpenAbout: () => void;
  onOpenMissions: () => void;
  onOpenTechShop: () => void;
}

export const TitleScreen: React.FC<Props> = ({
  customization,
  highScore,
  coins,
  isMuted,
  onToggleMute,
  onStart,
  onOpenCustomizer,
  onOpenAbout,
  onOpenMissions,
  onOpenTechShop,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-between p-4 sm:p-8 pointer-events-none select-none">
      {/* Top Bar: High Score, Creator Badge & Controls */}
      <div className="flex items-center justify-between w-full pointer-events-auto">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Best Score Badge */}
          <div className="flex items-center gap-2.5 bg-slate-950/85 border border-cyan-500/50 rounded-2xl px-3.5 py-2 shadow-2xl">
            <Trophy className="w-5 h-5 text-amber-400" />
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-wider text-cyan-400 font-mono">
                RECORD
              </span>
              <span className="text-base sm:text-lg font-black text-white tabular-nums font-mono leading-none">
                {highScore.toLocaleString()}
              </span>
            </div>
          </div>

          {/* App Creator Badge: Venkat */}
          <button
            onClick={onOpenAbout}
            className="flex items-center gap-2 bg-slate-950/85 hover:bg-slate-900 border border-amber-500/50 hover:border-amber-400 rounded-2xl px-3 py-2 shadow-2xl transition active:scale-95 group text-left"
            title="Click to view Creator information"
          >
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center text-slate-950 font-black text-xs shadow">
              V
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] font-black uppercase tracking-widest text-amber-400">
                APP CREATOR
              </span>
              <span className="text-xs font-black text-white group-hover:text-amber-300 transition-colors flex items-center gap-1 leading-none">
                Venkat
                <Sparkles className="w-3 h-3 text-amber-400" />
              </span>
            </div>
          </button>
        </div>

        {/* Coins & Audio Controls */}
        <div className="flex items-center gap-2">
          {/* Cute Light Pink "T" Tokens Readout */}
          <div className="bg-slate-950/85 border border-pink-400/40 rounded-2xl px-3 py-1.5 shadow-[0_0_15px_rgba(244,114,182,0.25)] flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-pink-500 via-rose-400 to-pink-200 border border-pink-300 flex items-center justify-center shadow-[0_0_8px_rgba(244,114,182,0.6)] relative">
              <span className="font-black text-white text-[9px] leading-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                T
              </span>
              <div className="absolute -top-0.5 -right-0.5 w-1 h-1 bg-rose-500 rounded-full border border-white" />
            </div>
            <span className="text-sm font-black text-pink-300 tabular-nums font-mono">
              {coins.toLocaleString()}
            </span>
          </div>

          <button
            onClick={onOpenAbout}
            className="w-10 h-10 rounded-2xl bg-slate-950/85 hover:bg-slate-800 border border-cyan-500/40 flex items-center justify-center text-cyan-400 hover:text-white shadow-2xl transition active:scale-95"
            title="About Game & Creator (Venkat)"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            onClick={onToggleMute}
            className="w-10 h-10 rounded-2xl bg-slate-950/85 hover:bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white shadow-2xl transition active:scale-95"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Hero Title Lockup with bespoke Cyber SVG (over 35% negative space) */}
      <div className="flex flex-col items-center text-center my-auto">
        <div className="w-full max-w-lg px-4 drop-shadow-[0_15px_35px_rgba(0,0,0,0.9)]">
          <svg viewBox="0 0 440 135" className="w-full h-auto overflow-visible">
            <defs>
              <linearGradient id="cyberSubwayGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="50%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
              <linearGradient id="cyberRushGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="50%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>
              <filter id="cyberGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#000" floodOpacity="0.9" />
              </filter>
            </defs>

            {/* Backing Stroke */}
            <text
              x="220"
              y="60"
              textAnchor="middle"
              fontSize="64"
              fontFamily="Impact, sans-serif"
              fontWeight="900"
              letterSpacing="3"
              stroke="#09090b"
              strokeWidth="16"
              strokeLinejoin="round"
              fill="#09090b"
            >
              SUBWAY
            </text>
            <text
              x="220"
              y="60"
              textAnchor="middle"
              fontSize="64"
              fontFamily="Impact, sans-serif"
              fontWeight="900"
              letterSpacing="3"
              fill="url(#cyberSubwayGrad)"
              filter="url(#cyberGlow)"
            >
              SUBWAY
            </text>

            <text
              x="220"
              y="120"
              textAnchor="middle"
              fontSize="58"
              fontFamily="Impact, sans-serif"
              fontWeight="900"
              letterSpacing="5"
              stroke="#09090b"
              strokeWidth="16"
              strokeLinejoin="round"
              fill="#09090b"
            >
              RUSH 3D
            </text>
            <text
              x="220"
              y="120"
              textAnchor="middle"
              fontSize="58"
              fontFamily="Impact, sans-serif"
              fontWeight="900"
              letterSpacing="5"
              fill="url(#cyberRushGrad)"
              filter="url(#cyberGlow)"
            >
              RUSH 3D
            </text>
          </svg>

          {/* Subtitle tag */}
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 bg-cyan-950/80 px-2.5 py-0.5 rounded border border-cyan-800 shadow">
              60 FPS // CYBER HUD EDITION
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-950/80 px-2.5 py-0.5 rounded border border-amber-800 shadow">
              BY VENKAT
            </span>
          </div>
        </div>

        {/* Feature Action Buttons Grid */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5 pointer-events-auto max-w-xl">
          {/* Customize Runner Avatar */}
          <button
            onClick={onOpenCustomizer}
            className="px-3.5 py-1.5 rounded-xl bg-slate-950/85 hover:bg-slate-900 border border-cyan-500/60 hover:border-cyan-400 text-cyan-300 font-bold text-xs uppercase tracking-wider shadow-xl transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <div className="w-5 h-5 rounded-lg overflow-hidden border border-cyan-400/80 bg-slate-900 shrink-0">
              {customization.photoUrl ? (
                <img src={customization.photoUrl} alt="Runner" className="w-full h-full object-cover" />
              ) : (
                <Camera className="w-full h-full p-0.5 text-cyan-400" />
              )}
            </div>
            <span>Runner: {customization.avatarName.split(' ')[0] || 'Venkat'}</span>
          </button>

          {/* Missions */}
          <button
            onClick={onOpenMissions}
            className="px-4 py-2 rounded-xl bg-slate-950/85 hover:bg-slate-900 border border-emerald-500/60 hover:border-emerald-400 text-emerald-300 font-bold text-xs uppercase tracking-wider shadow-xl transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <Trophy className="w-4 h-4 text-emerald-400" />
            <span>Missions</span>
          </button>

          {/* Tech Shop / Garage */}
          <button
            onClick={onOpenTechShop}
            className="px-4 py-2 rounded-xl bg-slate-950/85 hover:bg-slate-900 border border-amber-500/60 hover:border-amber-400 text-amber-300 font-bold text-xs uppercase tracking-wider shadow-xl transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Tech Garage</span>
          </button>

          {/* About Creator */}
          <button
            onClick={onOpenAbout}
            className="px-4 py-2 rounded-xl bg-slate-950/85 hover:bg-slate-900 border border-purple-500/60 hover:border-purple-400 text-purple-300 font-bold text-xs uppercase tracking-wider shadow-xl transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <User className="w-4 h-4 text-purple-400" />
            <span>About Venkat</span>
          </button>
        </div>

        {/* Primary Start CTA */}
        <div className="mt-7 flex flex-col items-center gap-2.5 pointer-events-auto">
          <button
            onClick={onStart}
            className="px-10 py-3.5 bg-gradient-to-r from-cyan-400 via-amber-400 to-rose-500 hover:from-cyan-300 hover:via-amber-300 hover:to-rose-400 text-slate-950 font-black text-base uppercase tracking-wider rounded-2xl shadow-[0_10px_35px_rgba(6,182,212,0.4)] transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2.5"
          >
            <Play className="w-5 h-5 fill-current" />
            ENTER THE TRACKS
          </button>

          <span className="text-xs font-bold text-slate-400 tracking-wider">
            Press <kbd className="px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">Space</kbd> or <kbd className="px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">Enter</kbd> to Launch
          </span>
        </div>
      </div>

      {/* Flat Control-Hint Line (Craft Guideline) */}
      <div className="text-center text-xs font-semibold text-slate-400 tracking-wide bg-slate-950/85 border border-slate-800 rounded-2xl py-2 px-4 max-w-2xl mx-auto shadow-2xl">
        <span className="text-cyan-400 font-mono">A / D</span> Switch Lanes &middot;{' '}
        <span className="text-cyan-400 font-mono">W / Space</span> Jump &middot;{' '}
        <span className="text-amber-400 font-mono">S</span> Slide &middot;{' '}
        <span className="text-emerald-400 font-mono">B</span> Hoverboard &middot;{' '}
        <span className="text-rose-400 font-mono">E</span> Cyber Overdrive &middot;{' '}
        <span className="text-slate-300 font-mono">Esc</span> Pause
      </div>
    </div>
  );
};
