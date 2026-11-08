import React from 'react';
import { TechUpgrades, BoardModel } from '../types';
import { X, Zap, Magnet, Rocket, Flame, Shield, Check, ArrowUpRight } from 'lucide-react';
import { sound } from '../audio/SoundFX';

interface Props {
  upgrades: TechUpgrades;
  coins: number;
  onUpdateUpgrades: (newUpgrades: TechUpgrades, newCoins: number) => void;
  onClose: () => void;
}

const UPGRADE_COSTS = [150, 350, 750, 1500, 3000];

const BOARDS: { id: BoardModel; name: string; perk: string; cost: number; color: string }[] = [
  { id: 'NEON_PHANTOM', name: 'Neon Phantom', perk: 'Standard 1-hit crash shield', cost: 0, color: '#f59e0b' },
  { id: 'CYBER_GLIDER', name: 'Cyber Glider', perk: '+35% Hoverboard duration', cost: 500, color: '#38bdf8' },
  { id: 'PLASMA_WAVE', name: 'Plasma Wave', perk: 'Built-in coin pull magnet while active', cost: 1200, color: '#ec4899' },
  { id: 'WARP_DRIVE', name: 'Warp Drive', perk: 'Explosive barrier breaker + speed boost', cost: 2500, color: '#22c55e' },
];

export const TechShopModal: React.FC<Props> = ({
  upgrades,
  coins,
  onUpdateUpgrades,
  onClose,
}) => {
  const buyUpgrade = (key: keyof Omit<TechUpgrades, 'selectedBoard'>) => {
    const currentLvl = upgrades[key];
    if (currentLvl >= 5) return;
    const cost = UPGRADE_COSTS[currentLvl - 1] || 150;
    if (coins < cost) {
      sound.playHit();
      return;
    }

    sound.playUpgrade();
    const updated = {
      ...upgrades,
      [key]: currentLvl + 1,
    };
    onUpdateUpgrades(updated, coins - cost);
  };

  const selectBoard = (b: typeof BOARDS[0]) => {
    if (upgrades.selectedBoard === b.id) return;
    sound.playClick();
    onUpdateUpgrades({ ...upgrades, selectedBoard: b.id }, coins);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-amber-500/60 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.2)] flex flex-col max-h-[92vh] overflow-hidden text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-slate-950 font-black shadow-lg">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                CYBER TECH GARAGE
              </span>
              <h3 className="text-xl font-black text-white tracking-wide">UPGRADES & HOVERBOARDS</h3>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Cute Pink "T" Tokens Balance */}
            <div className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-pink-400/40 flex items-center gap-2 shadow-[0_0_12px_rgba(244,114,182,0.2)]">
              <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-pink-500 via-rose-400 to-pink-200 border border-pink-300 flex items-center justify-center shadow-[0_0_8px_rgba(244,114,182,0.6)] relative">
                <span className="font-black text-white text-[9px] leading-none">
                  T
                </span>
                <div className="absolute -top-0.5 -right-0.5 w-1 h-1 bg-rose-500 rounded-full border border-white" />
              </div>
              <span className="text-sm font-black text-pink-300 tabular-nums">
                {coins.toLocaleString()}
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Tech Powerup Enhancements */}
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-slate-400 block mb-3">
              POWERUP TECH CHIPS
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Magnet Upgrade */}
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Magnet className="w-4 h-4 text-rose-400" />
                      Magnetic Core
                    </span>
                    <span className="text-[10px] font-black text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-900">
                      LVL {upgrades.magnetLevel} / 5
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Expands coin pickup radius and extends magnet suction time.
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <span
                        key={lvl}
                        className={`w-3.5 h-1.5 rounded-full ${
                          lvl <= upgrades.magnetLevel ? 'bg-rose-500' : 'bg-slate-800'
                        }`}
                      />
                    ))}
                  </div>

                  {upgrades.magnetLevel < 5 ? (
                    <button
                      onClick={() => buyUpgrade('magnetLevel')}
                      className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] rounded-lg transition active:scale-95 flex items-center gap-1"
                    >
                      <span>{UPGRADE_COSTS[upgrades.magnetLevel - 1]}</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  ) : (
                    <span className="text-[10px] font-black text-emerald-400">MAX LEVEL</span>
                  )}
                </div>
              </div>

              {/* Super Sneakers Upgrade */}
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-emerald-400" />
                      Bionic Sneakers
                    </span>
                    <span className="text-[10px] font-black text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-900">
                      LVL {upgrades.sneakersLevel} / 5
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Increases jump apex height and extends sneaker duration.
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <span
                        key={lvl}
                        className={`w-3.5 h-1.5 rounded-full ${
                          lvl <= upgrades.sneakersLevel ? 'bg-emerald-500' : 'bg-slate-800'
                        }`}
                      />
                    ))}
                  </div>

                  {upgrades.sneakersLevel < 5 ? (
                    <button
                      onClick={() => buyUpgrade('sneakersLevel')}
                      className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] rounded-lg transition active:scale-95 flex items-center gap-1"
                    >
                      <span>{UPGRADE_COSTS[upgrades.sneakersLevel - 1]}</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  ) : (
                    <span className="text-[10px] font-black text-emerald-400">MAX LEVEL</span>
                  )}
                </div>
              </div>

              {/* Jetpack Upgrade */}
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Rocket className="w-4 h-4 text-amber-400" />
                      Jetpack Thruster
                    </span>
                    <span className="text-[10px] font-black text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-900">
                      LVL {upgrades.jetpackLevel} / 5
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Boosts flight altitude and extends rocket fuel time.
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <span
                        key={lvl}
                        className={`w-3.5 h-1.5 rounded-full ${
                          lvl <= upgrades.jetpackLevel ? 'bg-amber-500' : 'bg-slate-800'
                        }`}
                      />
                    ))}
                  </div>

                  {upgrades.jetpackLevel < 5 ? (
                    <button
                      onClick={() => buyUpgrade('jetpackLevel')}
                      className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] rounded-lg transition active:scale-95 flex items-center gap-1"
                    >
                      <span>{UPGRADE_COSTS[upgrades.jetpackLevel - 1]}</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  ) : (
                    <span className="text-[10px] font-black text-emerald-400">MAX LEVEL</span>
                  )}
                </div>
              </div>

              {/* Multiplier Chip */}
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-purple-400" />
                      Score Overclock Chip
                    </span>
                    <span className="text-[10px] font-black text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-900">
                      LVL {upgrades.multiplierLevel} / 5
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Doubles score gain rate for extended time windows.
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <span
                        key={lvl}
                        className={`w-3.5 h-1.5 rounded-full ${
                          lvl <= upgrades.multiplierLevel ? 'bg-purple-500' : 'bg-slate-800'
                        }`}
                      />
                    ))}
                  </div>

                  {upgrades.multiplierLevel < 5 ? (
                    <button
                      onClick={() => buyUpgrade('multiplierLevel')}
                      className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] rounded-lg transition active:scale-95 flex items-center gap-1"
                    >
                      <span>{UPGRADE_COSTS[upgrades.multiplierLevel - 1]}</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  ) : (
                    <span className="text-[10px] font-black text-emerald-400">MAX LEVEL</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Cyber Hoverboard Hangar */}
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-slate-400 block mb-3">
              HOVERBOARD HANGAR
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {BOARDS.map((b) => (
                <div
                  key={b.id}
                  onClick={() => selectBoard(b)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    upgrades.selectedBoard === b.id
                      ? 'border-cyan-400 bg-cyan-950/30 ring-1 ring-cyan-400'
                      : 'border-slate-800 bg-slate-950/50 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-inner"
                      style={{ backgroundColor: `${b.color}22`, borderColor: b.color }}
                    >
                      <Shield className="w-5 h-5" style={{ color: b.color }} />
                    </div>
                    <div>
                      <h5 className="text-xs font-black text-white">{b.name}</h5>
                      <span className="text-[11px] text-slate-400 block">{b.perk}</span>
                    </div>
                  </div>

                  {upgrades.selectedBoard === b.id ? (
                    <span className="px-2.5 py-1 bg-cyan-500 text-slate-950 font-black text-[10px] rounded-lg flex items-center gap-1">
                      <Check className="w-3 h-3" /> EQUIPPED
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-slate-400">EQUIP</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Upgrades automatically activate in your 3D runs
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gradient-to-r from-amber-400 to-rose-500 hover:from-amber-300 hover:to-rose-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
