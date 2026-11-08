import React from 'react';
import { X, Sparkles, User, Cpu, Shield, Zap, Terminal, Trophy } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export const AboutModal: React.FC<Props> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border-2 border-cyan-500/70 rounded-3xl shadow-[0_0_50px_rgba(6,182,212,0.25)] p-6 sm:p-8 flex flex-col text-slate-200 overflow-hidden">
        {/* Cyber Grid Corner Flairs */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-cyan-500/30">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                  SYSTEM INFO // VER 2.4.0
                </span>
              </div>
              <h3 className="text-xl font-black text-white tracking-wide">ABOUT SUBWAY RUSH 3D</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Creator Showcase Card */}
        <div className="my-5 p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-2 border-cyan-500/50 shadow-inner flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 via-rose-500 to-cyan-400 p-0.5 shadow-xl flex items-center justify-center overflow-hidden">
              <img
                src="/avatar-venkat-face.png"
                alt="Venkat"
                className="w-full h-full object-cover rounded-[14px]"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center text-[10px] text-slate-950 font-black">
              ✓
            </div>
          </div>

          <div className="flex-1">
            <span className="text-[10px] font-black tracking-widest uppercase text-amber-400 block">
              APP CREATOR & DEFAULT SUBWAY RUNNER
            </span>
            <h4 className="text-2xl font-black text-white tracking-wide flex items-center gap-2">
              Venkat
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </h4>
            <p className="text-xs text-slate-300 font-medium mt-0.5">
              Official Lead Runner & Creator of Subway Rush 3D
            </p>
          </div>
        </div>

        {/* Engine Specs Matrix */}
        <div className="space-y-3 mb-5">
          <span className="text-[11px] font-black tracking-widest uppercase text-slate-400 block">
            TECHNICAL ARCHITECTURE & FEATURES
          </span>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-2.5">
              <Cpu className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-xs font-bold text-white block">60 FPS WebGL Engine</span>
                <span className="text-[10px] text-slate-400">
                  Three.js PBR Studio Lighting & software WebGL fail-safe.
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-2.5">
              <User className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-xs font-bold text-white block">Realistic Man Avatar</span>
                <span className="text-[10px] text-slate-400">
                  Full body customization, skin melanin, facial hair & webcam mapping.
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-2.5">
              <Shield className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-xs font-bold text-white block">Subway Passenger Trains</span>
                <span className="text-[10px] text-slate-400">
                  Aerodynamic cab nose, moving express trains & rooftop ramps.
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-2.5">
              <Zap className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-xs font-bold text-white block">Cyber Overdrive & Upgrades</span>
                <span className="text-[10px] text-slate-400">
                  Hyperspeed warp rush, missions system, and hoverboard garage.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            Crafted with passion by <strong className="text-cyan-400">Venkat</strong>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition active:scale-95"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
