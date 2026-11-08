import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  GameState,
  RunnerCustomization,
  GameStats,
  PowerupState,
  CyberMission,
  TechUpgrades,
} from './types';
import { GameEngine } from './game/GameEngine';
import { sound } from './audio/SoundFX';
import { TitleScreen } from './components/TitleScreen';
import { CyberHUD } from './components/CyberHUD';
import { PauseModal } from './components/PauseModal';
import { GameOverModal } from './components/GameOverModal';
import { PhotoCustomizerModal } from './components/PhotoCustomizerModal';
import { AboutModal } from './components/AboutModal';
import { TechShopModal } from './components/TechShopModal';
import { MissionsDrawer } from './components/MissionsDrawer';
import { OverdriveSpeedFX } from './components/OverdriveSpeedFX';

const DEFAULT_CUSTOMIZATION: RunnerCustomization = {
  photoUrl: '/avatar-venkat-face.png',
  photoScale: 1.0,
  photoOffsetX: 0,
  photoOffsetY: 0,
  avatarName: 'Venkat - Subway Runner',
  skinTone: '#b07d56',
  hairstyle: 'SWEPT_BACK',
  hairColor: '#1c1917',
  facialHair: 'CLEAN_SHAVEN',
  facialHairColor: '#1c1917',
  eyeColor: '#451a03',
  physique: 'ATHLETIC',
  shirtStyle: 'TECH_TEE',
  shirtColor: '#3b82f6',
  shirtAccentColor: '#93c5fd',
  bottomsStyle: 'TRACK_PANTS',
  bottomsColor: '#1d4ed8',
  shoePrimaryColor: '#ffffff',
  shoeAccentColor: '#2563eb',
  eyewear: 'NONE',
  eyewearColor: '#0f172a',
  wristWatch: true,
  boardColor: '#f59e0b',
  capColor: '#3b82f6',
  hoodieColor: '#3b82f6',
  pantsColor: '#1d4ed8',
};

const DEFAULT_MISSIONS: CyberMission[] = [
  {
    id: 'm1',
    title: 'Tactical Sprinter',
    desc: 'Cover 500 meters along subway tracks',
    target: 500,
    progress: 0,
    reward: 200,
    claimed: false,
    type: 'DISTANCE',
  },
  {
    id: 'm2',
    title: 'Pink Token Collector',
    desc: 'Collect 50 cute pink "T" tokens',
    target: 50,
    progress: 0,
    reward: 150,
    claimed: false,
    type: 'COINS',
  },
  {
    id: 'm3',
    title: 'Aerial Infiltration',
    desc: 'Perform 6 athletic hurdle jumps',
    target: 6,
    progress: 0,
    reward: 180,
    claimed: false,
    type: 'JUMPS',
  },
  {
    id: 'm4',
    title: 'Sub-Level Roll',
    desc: 'Slide under 4 high signal barriers',
    target: 4,
    progress: 0,
    reward: 220,
    claimed: false,
    type: 'SLIDES',
  },
  {
    id: 'm5',
    title: 'Hoverboard Pilot',
    desc: 'Deploy your hoverboard 2 times',
    target: 2,
    progress: 0,
    reward: 250,
    claimed: false,
    type: 'HOVERBOARDS',
  },
];

const DEFAULT_UPGRADES: TechUpgrades = {
  magnetLevel: 1,
  sneakersLevel: 1,
  jetpackLevel: 1,
  multiplierLevel: 1,
  overdriveEfficiency: 1,
  selectedBoard: 'NEON_PHANTOM',
};

export default function App() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // Runner Customization with persistence
  const [customization, setCustomization] = useState<RunnerCustomization>(() => {
    try {
      const saved = localStorage.getItem('subway_rush_customization');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.avatarName === 'Alex - Pro Runner' || !parsed.photoUrl) {
          return DEFAULT_CUSTOMIZATION;
        }
        return parsed;
      }
    } catch {}
    return DEFAULT_CUSTOMIZATION;
  });

  // Upgrades & Tech Garage
  const [techUpgrades, setTechUpgrades] = useState<TechUpgrades>(() => {
    try {
      const saved = localStorage.getItem('subway_rush_upgrades');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_UPGRADES;
  });

  // Banked Coins
  const [bankedCoins, setBankedCoins] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('subway_rush_banked_coins');
      if (saved) return parseInt(saved, 10) || 0;
    } catch {}
    return 250; // Starter welcome bonus
  });

  // Missions State
  const [missions, setMissions] = useState<CyberMission[]>(() => {
    try {
      const saved = localStorage.getItem('subway_rush_missions');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_MISSIONS;
  });

  // Game UI State
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    coins: 0,
    distance: 0,
    highScore: 0,
    multiplier: 1,
    speed: 22,
    overdriveEnergy: 25,
    isOverdriveActive: false,
    heartRate: 138,
  });
  const [powerups, setPowerups] = useState<PowerupState[]>([]);
  const [isMuted, setIsMuted] = useState<boolean>(() => sound.getMuted());
  const [isNewHighScore, setIsNewHighScore] = useState(false);

  // Active Modals
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isTechShopOpen, setIsTechShopOpen] = useState(false);
  const [isMissionsOpen, setIsMissionsOpen] = useState(false);

  // Mission event handler
  const handleMissionEvent = useCallback(
    (type: 'COINS' | 'DISTANCE' | 'JUMPS' | 'SLIDES' | 'HOVERBOARDS' | 'TRAIN_ROOFS', amount: number) => {
      setMissions((prevMissions) => {
        let changed = false;
        const updated = prevMissions.map((m) => {
          if (m.type === type && !m.claimed && m.progress < m.target) {
            changed = true;
            return {
              ...m,
              progress: m.progress + amount,
            };
          }
          return m;
        });

        if (changed) {
          try {
            localStorage.setItem('subway_rush_missions', JSON.stringify(updated));
          } catch {}
          return updated;
        }
        return prevMissions;
      });
    },
    []
  );

  // Claim Mission Reward
  const handleClaimMission = useCallback((missionId: string, reward: number) => {
    setMissions((prev) => {
      const updated = prev.map((m) => (m.id === missionId ? { ...m, claimed: true } : m));
      try {
        localStorage.setItem('subway_rush_missions', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    setBankedCoins((prev) => {
      const newTotal = prev + reward;
      try {
        localStorage.setItem('subway_rush_banked_coins', String(newTotal));
      } catch {}
      return newTotal;
    });
  }, []);

  // Update Tech Upgrades
  const handleUpdateUpgrades = useCallback((newUpgrades: TechUpgrades, remainingCoins: number) => {
    setTechUpgrades(newUpgrades);
    setBankedCoins(remainingCoins);
    try {
      localStorage.setItem('subway_rush_upgrades', JSON.stringify(newUpgrades));
      localStorage.setItem('subway_rush_banked_coins', String(remainingCoins));
    } catch {}

    if (engineRef.current) {
      engineRef.current.techUpgrades = newUpgrades;
    }
  }, []);

  // Initialize WebGL GameEngine once on mount
  useEffect(() => {
    if (!mountRef.current) return;

    let previousHighScore = 0;
    try {
      const saved = localStorage.getItem('subway_rush_high_score');
      if (saved) previousHighScore = parseInt(saved, 10) || 0;
    } catch {}

    const engine = new GameEngine(mountRef.current, customization, {
      onStatsUpdate: (newStats) => {
        setStats(newStats);
        if (newStats.score > previousHighScore && previousHighScore > 0) {
          setIsNewHighScore(true);
        }
      },
      onPowerupsUpdate: (newPowerups) => {
        setPowerups([...newPowerups]);
      },
      onStateChange: (state) => {
        setGameState(state);
        // Bank coins on game over
        if (state === 'GAMEOVER' && engineRef.current) {
          const runCoins = stats.coins;
          if (runCoins > 0) {
            setBankedCoins((prev) => {
              const total = prev + runCoins;
              try {
                localStorage.setItem('subway_rush_banked_coins', String(total));
              } catch {}
              return total;
            });
          }
        }
      },
    });

    engine.techUpgrades = techUpgrades;
    engine.onMissionEvent = handleMissionEvent;
    engineRef.current = engine;

    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  // Sync techUpgrades and hooks
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.techUpgrades = techUpgrades;
      engineRef.current.onMissionEvent = handleMissionEvent;
    }
  }, [techUpgrades, handleMissionEvent]);

  // Update customization on engine when modified
  const handleSaveCustomization = useCallback((updated: RunnerCustomization) => {
    setCustomization(updated);
    try {
      localStorage.setItem('subway_rush_customization', JSON.stringify(updated));
    } catch {}
    if (engineRef.current) {
      engineRef.current.updateCustomization(updated);
    }
  }, []);

  const handleToggleMute = useCallback(() => {
    const nextMute = sound.toggleMute();
    setIsMuted(nextMute);
  }, []);

  const handleStartGame = useCallback(() => {
    setIsNewHighScore(false);
    engineRef.current?.startGame();
  }, []);

  const handlePause = useCallback(() => {
    engineRef.current?.pauseGame();
  }, []);

  const handleResume = useCallback(() => {
    engineRef.current?.resumeGame();
  }, []);

  const handleRestart = useCallback(() => {
    setIsNewHighScore(false);
    engineRef.current?.restartGame();
  }, []);

  const handleGoToMenu = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.state = 'MENU';
      setGameState('MENU');
      sound.stopMusic();
    }
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 3D WebGL Canvas isolated mount */}
      <div ref={mountRef} className="absolute inset-0 z-0 w-full h-full" />

      {/* Screen-Space Overdrive Motion Blur & Edge Glow Effect */}
      {gameState === 'PLAYING' && (
        <OverdriveSpeedFX
          isActive={stats.isOverdriveActive}
          speed={stats.speed}
        />
      )}

      {/* Title Screen Overlay */}
      {gameState === 'MENU' && (
        <TitleScreen
          customization={customization}
          highScore={stats.highScore}
          coins={bankedCoins}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onStart={handleStartGame}
          onOpenCustomizer={() => setIsCustomizerOpen(true)}
          onOpenAbout={() => setIsAboutOpen(true)}
          onOpenMissions={() => setIsMissionsOpen(true)}
          onOpenTechShop={() => setIsTechShopOpen(true)}
        />
      )}

      {/* In-Game Cyberpunk Tactical HUD */}
      {gameState === 'PLAYING' && (
        <CyberHUD
          stats={stats}
          powerups={powerups}
          customization={customization}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onPause={handlePause}
          onOpenAbout={() => setIsAboutOpen(true)}
          onShiftLeft={() => engineRef.current?.shiftLane(-1)}
          onShiftRight={() => engineRef.current?.shiftLane(1)}
          onJump={() => engineRef.current?.triggerJump()}
          onSlide={() => engineRef.current?.triggerSlide()}
          onHoverboard={() => engineRef.current?.activateHoverboardManual()}
          onTriggerOverdrive={() => engineRef.current?.triggerOverdrive()}
        />
      )}

      {/* Paused Modal */}
      {gameState === 'PAUSED' && (
        <PauseModal
          customization={customization}
          isMuted={isMuted}
          onResume={handleResume}
          onRestart={handleRestart}
          onGoToMenu={handleGoToMenu}
          onToggleMute={handleToggleMute}
          onOpenCustomizer={() => setIsCustomizerOpen(true)}
        />
      )}

      {/* Game Over Modal */}
      {gameState === 'GAMEOVER' && (
        <GameOverModal
          stats={stats}
          customization={customization}
          isNewHigh={isNewHighScore}
          onPlayAgain={handleRestart}
          onOpenCustomizer={() => setIsCustomizerOpen(true)}
          onGoToMenu={handleGoToMenu}
        />
      )}

      {/* Customizable Runner Photo Studio Modal */}
      {isCustomizerOpen && (
        <PhotoCustomizerModal
          customization={customization}
          onSave={handleSaveCustomization}
          onClose={() => setIsCustomizerOpen(false)}
        />
      )}

      {/* About App Creator (Venkat) & Specs Modal */}
      {isAboutOpen && <AboutModal onClose={() => setIsAboutOpen(false)} />}

      {/* Tech Garage / Upgrades Modal */}
      {isTechShopOpen && (
        <TechShopModal
          upgrades={techUpgrades}
          coins={bankedCoins}
          onUpdateUpgrades={handleUpdateUpgrades}
          onClose={() => setIsTechShopOpen(false)}
        />
      )}

      {/* Missions & Challenges Drawer */}
      {isMissionsOpen && (
        <MissionsDrawer
          missions={missions}
          onClaimReward={handleClaimMission}
          onClose={() => setIsMissionsOpen(false)}
        />
      )}
    </div>
  );
}
