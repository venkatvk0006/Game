import React, { useEffect, useRef, useState } from 'react';

interface OverdriveSpeedFXProps {
  isActive: boolean;
  speed: number;
}

interface SpeedStreak {
  angle: number;
  dist: number;
  speed: number;
  length: number;
  width: number;
  color: string;
  alpha: number;
}

export const OverdriveSpeedFX: React.FC<OverdriveSpeedFXProps> = ({ isActive, speed }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [activationFlash, setActivationFlash] = useState(false);
  const opacityRef = useRef(0);
  const streaksRef = useRef<SpeedStreak[]>([]);
  const animFrameIdRef = useRef<number | null>(null);

  // Activation initial flash trigger
  useEffect(() => {
    if (isActive) {
      setVisible(true);
      setActivationFlash(true);
      const timer = setTimeout(() => setActivationFlash(false), 220);
      return () => clearTimeout(timer);
    } else {
      // Keep visible during fade out
      const timer = setTimeout(() => setVisible(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  // Canvas 60 FPS Radial Speed Streak Motion Blur
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Initialize streak pool
    const NUM_STREAKS = 110;
    const colors = [
      '#00f0ff', // Cyber cyan
      '#38bdf8', // Sky electric
      '#f43f5e', // Hot magenta / rose
      '#ec4899', // Pink
      '#ffffff', // Pure white core
      '#a855f7', // Neon purple
      '#fde047', // Solar yellow
    ];

    streaksRef.current = Array.from({ length: NUM_STREAKS }, () => ({
      angle: Math.random() * Math.PI * 2,
      dist: Math.random() * Math.min(width, height) * 0.85,
      speed: 600 + Math.random() * 950,
      length: 80 + Math.random() * 220,
      width: 1.2 + Math.random() * 2.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 0.35 + Math.random() * 0.65,
    }));

    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      // Smooth opacity ramp
      const targetOpacity = isActive ? 1.0 : 0.0;
      opacityRef.current += (targetOpacity - opacityRef.current) * Math.min(1, dt * 10);

      ctx.clearRect(0, 0, width, height);

      if (opacityRef.current > 0.01) {
        // Horizon vanishing point (perspective center where tracks recede)
        const cx = width * 0.5;
        const cy = height * 0.44;
        const maxDist = Math.hypot(width, height) * 0.65;

        ctx.save();
        ctx.globalAlpha = opacityRef.current;

        // Draw radial motion blur streaks
        for (const streak of streaksRef.current) {
          streak.dist += streak.speed * dt * (speed / 30);
          if (streak.dist > maxDist) {
            streak.dist = 40 + Math.random() * 80;
            streak.angle = Math.random() * Math.PI * 2;
            streak.length = 80 + Math.random() * 260;
            streak.speed = 650 + Math.random() * 1100;
          }

          // Streak coordinates
          const tailDist = Math.max(15, streak.dist - streak.length);
          const x1 = cx + Math.cos(streak.angle) * tailDist;
          const y1 = cy + Math.sin(streak.angle) * tailDist;
          const x2 = cx + Math.cos(streak.angle) * streak.dist;
          const y2 = cy + Math.sin(streak.angle) * streak.dist;

          // Velocity fade: brighter as it rushes towards edge
          const edgeFactor = Math.min(1, streak.dist / (maxDist * 0.6));
          const currentAlpha = streak.alpha * edgeFactor * opacityRef.current;

          // Gradient streak for high-speed motion blur trail
          const grad = ctx.createLinearGradient(x1, y1, x2, y2);
          grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
          grad.addColorStop(0.4, streak.color);
          grad.addColorStop(1, '#ffffff');

          ctx.strokeStyle = grad;
          ctx.lineWidth = streak.width * (0.8 + edgeFactor * 0.8);
          ctx.lineCap = 'round';

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();

          // Chromatic fringe (cyan & magenta offset lines on outer edges)
          if (edgeFactor > 0.4) {
            ctx.strokeStyle = 'rgba(6, 182, 212, 0.45)';
            ctx.lineWidth = streak.width * 0.6;
            ctx.beginPath();
            ctx.moveTo(x1 + 1.8, y1 - 1.2);
            ctx.lineTo(x2 + 2.5, y2 - 1.8);
            ctx.stroke();

            ctx.strokeStyle = 'rgba(244, 63, 94, 0.45)';
            ctx.lineWidth = streak.width * 0.6;
            ctx.beginPath();
            ctx.moveTo(x1 - 1.8, y1 + 1.2);
            ctx.lineTo(x2 - 2.5, y2 + 1.8);
            ctx.stroke();
          }
        }

        ctx.restore();
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [isActive, speed]);

  if (!visible && !isActive) return null;

  return (
    <div
      className={`absolute inset-0 pointer-events-none select-none z-15 overflow-hidden transition-opacity duration-300 ${
        isActive ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* 1. SCREEN-SPACE OPTICAL RADIAL MOTION BLUR (Backdrop-filter with radial mask) */}
      <div
        className="absolute inset-0 backdrop-blur-[5px] sm:backdrop-blur-[7px]"
        style={{
          WebkitMaskImage:
            'radial-gradient(ellipse 70% 60% at 50% 46%, transparent 22%, rgba(0,0,0,0.55) 52%, black 82%)',
          maskImage:
            'radial-gradient(ellipse 70% 60% at 50% 46%, transparent 22%, rgba(0,0,0,0.55) 52%, black 82%)',
        }}
      />

      {/* 2. FAST 60 FPS RADIAL SPEED-BLUR STREAKS CANVAS */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* 3. INTENSE DYNAMIC EDGE GLOW (Vignette & Neon Inset Pulse) */}
      <div
        className="absolute inset-0 transition-all duration-300"
        style={{
          boxShadow: `
            inset 0 0 60px 15px rgba(244, 63, 94, 0.55),
            inset 0 0 120px 40px rgba(6, 182, 212, 0.45),
            inset 0 0 180px 70px rgba(168, 85, 247, 0.3)
          `,
        }}
      />

      {/* 4. ANIMATED CYBERNETIC EDGE LASER BORDERS */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-rose-500 to-cyan-400 shadow-[0_0_15px_#f43f5e] animate-pulse" />
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-cyan-400 to-rose-500 shadow-[0_0_15px_#06b6d4] animate-pulse" />
      <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-cyan-400 via-rose-500 to-cyan-400 shadow-[0_0_15px_#06b6d4] animate-pulse" />
      <div className="absolute top-0 bottom-0 right-0 w-1 bg-gradient-to-b from-rose-500 via-cyan-400 to-rose-500 shadow-[0_0_15px_#f43f5e] animate-pulse" />

      {/* 5. TACTICAL HUD CORNER SPEED BRACKETS */}
      <div className="absolute top-4 left-4 flex flex-col gap-0.5">
        <div className="flex items-center gap-1.5 bg-rose-950/85 border border-rose-500/80 rounded px-2 py-0.5 shadow-[0_0_12px_rgba(244,63,94,0.7)]">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
          <span className="text-[10px] font-black uppercase tracking-widest text-rose-300 font-mono">
            WARP OVERDRIVE ACTIVE
          </span>
        </div>
        <span className="text-[9px] font-mono text-cyan-300 tracking-wider font-bold">
          VELOCITY BOOST +65%
        </span>
      </div>

      <div className="absolute top-4 right-4 hidden sm:flex flex-col items-end gap-0.5">
        <div className="flex items-center gap-1.5 bg-cyan-950/85 border border-cyan-400/80 rounded px-2 py-0.5 shadow-[0_0_12px_rgba(6,182,212,0.7)]">
          <span className="text-[10px] font-black uppercase tracking-widest text-cyan-300 font-mono">
            KINETIC SHIELD ENGAGED
          </span>
        </div>
        <span className="text-[9px] font-mono text-rose-300 tracking-wider font-bold">
          COLLISION IMMUNITY
        </span>
      </div>

      <div className="absolute bottom-4 left-4 hidden sm:flex items-center gap-2">
        <div className="h-6 w-1 bg-rose-500 shadow-[0_0_10px_#f43f5e]" />
        <span className="text-[10px] font-mono font-black text-rose-400 tracking-widest uppercase">
          CHRONO WARP // MOTION BLUR LEVEL 3
        </span>
      </div>

      {/* 6. INITIAL ACTIVATION HYPER-DRIVE FLASH */}
      {activationFlash && (
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400/30 via-white/40 to-rose-500/30 pointer-events-none animate-ping" />
      )}
    </div>
  );
};
