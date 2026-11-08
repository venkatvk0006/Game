import React, { useState, useRef } from 'react';
import {
  RunnerCustomization,
  Hairstyle,
  FacialHair,
  ShirtStyle,
  BottomsStyle,
  EyewearStyle,
} from '../types';
import {
  Camera,
  Upload,
  RefreshCw,
  Sparkles,
  X,
  Check,
  ZoomIn,
  Palette,
  User,
  Scissors,
  Shirt,
  Glasses,
  Eye,
} from 'lucide-react';

interface Props {
  customization: RunnerCustomization;
  onSave: (updated: RunnerCustomization) => void;
  onClose: () => void;
}

const REALISTIC_SKIN_TONES = [
  { name: 'Fair Ivory', hex: '#ffd8be' },
  { name: 'Warm Beige', hex: '#f0c29f' },
  { name: 'Olive Tan', hex: '#d4a373' },
  { name: 'Warm Bronze', hex: '#b07d56' },
  { name: 'Deep Espresso', hex: '#634433' },
  { name: 'Rich Mahogany', hex: '#3d251e' },
];

const HAIR_COLORS = [
  { name: 'Jet Black', hex: '#1c1917' },
  { name: 'Dark Brown', hex: '#3e2723' },
  { name: 'Chestnut', hex: '#5d4037' },
  { name: 'Dirty Blonde', hex: '#b59265' },
  { name: 'Light Blonde', hex: '#e2ba82' },
  { name: 'Auburn Red', hex: '#7f281e' },
  { name: 'Silver Slate', hex: '#94a3b8' },
];

const EYE_COLORS = [
  { name: 'Ocean Blue', hex: '#0284c7' },
  { name: 'Hazel Brown', hex: '#854d0e' },
  { name: 'Emerald Green', hex: '#16a34a' },
  { name: 'Dark Amber', hex: '#451a03' },
  { name: 'Slate Grey', hex: '#475569' },
];

const HAIRSTYLES: { id: Hairstyle; label: string }[] = [
  { id: 'SHORT_FADE', label: 'Athletic Fade' },
  { id: 'SWEPT_BACK', label: 'Swept Back' },
  { id: 'BUZZ_CUT', label: 'Buzz Cut' },
  { id: 'UNDERCUT', label: 'Modern Undercut' },
  { id: 'PONYTAIL', label: 'Man Bun / Ponytail' },
  { id: 'CAP', label: 'Backwards Cap' },
  { id: 'BALD', label: 'Clean Shaved' },
];

const FACIAL_HAIR_OPTIONS: { id: FacialHair; label: string }[] = [
  { id: 'CLEAN_SHAVEN', label: 'Clean Shaven' },
  { id: 'STUBBLE', label: "5 O'Clock Stubble" },
  { id: 'FULL_BEARD', label: 'Full Athletic Beard' },
  { id: 'GOATEE', label: 'Trimmed Goatee' },
  { id: 'MUSTACHE', label: 'Mustache' },
];

const SHIRT_STYLES: { id: ShirtStyle; label: string }[] = [
  { id: 'TECH_TEE', label: 'Athletic Tech Tee' },
  { id: 'TANK_TOP', label: 'Running Singlet' },
  { id: 'TRACK_JACKET', label: 'Track Jacket' },
  { id: 'HOODIE', label: 'Street Hoodie' },
  { id: 'SHIRTLESS', label: 'Shirtless (Muscular)' },
];

const BOTTOMS_STYLES: { id: BottomsStyle; label: string }[] = [
  { id: 'RUNNING_SHORTS', label: 'Running Shorts' },
  { id: 'TRACK_PANTS', label: 'Track Joggers' },
  { id: 'TIGHTS', label: 'Compression Tights' },
];

const EYEWEAR_STYLES: { id: EyewearStyle; label: string }[] = [
  { id: 'SPORTS_SHADES', label: 'Sports Wraparound Shades' },
  { id: 'WAYFARER', label: 'Wayfarer Sunglasses' },
  { id: 'HEADBAND', label: 'Athletic Headband' },
  { id: 'NONE', label: 'No Eyewear' },
];

const COLOR_PALETTE = [
  '#2563eb', '#dc2626', '#16a34a', '#f59e0b', '#06b6d4', '#9333ea', '#ea580c', '#18181b', '#ffffff', '#475569',
];

const PRESETS: Partial<RunnerCustomization>[] = [
  {
    avatarName: 'Venkat (Subway Runner)',
    photoUrl: '/avatar-venkat-face.png',
    skinTone: '#b07d56',
    hairstyle: 'SWEPT_BACK',
    hairColor: '#1c1917',
    facialHair: 'CLEAN_SHAVEN',
    eyeColor: '#451a03',
    shirtStyle: 'TECH_TEE',
    shirtColor: '#3b82f6',
    shirtAccentColor: '#93c5fd',
    bottomsStyle: 'TRACK_PANTS',
    bottomsColor: '#1d4ed8',
    shoePrimaryColor: '#ffffff',
    shoeAccentColor: '#2563eb',
    eyewear: 'NONE',
    boardColor: '#f59e0b',
  },
  {
    avatarName: 'Elite Marathoner',
    skinTone: '#d4a373',
    hairstyle: 'SHORT_FADE',
    hairColor: '#1c1917',
    facialHair: 'STUBBLE',
    eyeColor: '#0284c7',
    shirtStyle: 'TANK_TOP',
    shirtColor: '#2563eb',
    shirtAccentColor: '#38bdf8',
    bottomsStyle: 'RUNNING_SHORTS',
    bottomsColor: '#18181b',
    shoePrimaryColor: '#f97316',
    shoeAccentColor: '#06b6d4',
    eyewear: 'SPORTS_SHADES',
    boardColor: '#f59e0b',
  },
  {
    avatarName: 'Urban Sprinter',
    skinTone: '#b07d56',
    hairstyle: 'SWEPT_BACK',
    hairColor: '#1c1917',
    facialHair: 'FULL_BEARD',
    eyeColor: '#451a03',
    shirtStyle: 'TECH_TEE',
    shirtColor: '#dc2626',
    shirtAccentColor: '#ffffff',
    bottomsStyle: 'TRACK_PANTS',
    bottomsColor: '#1e293b',
    shoePrimaryColor: '#ffffff',
    shoeAccentColor: '#dc2626',
    eyewear: 'WAYFARER',
    boardColor: '#dc2626',
  },
  {
    avatarName: 'Stealth Night Runner',
    skinTone: '#f0c29f',
    hairstyle: 'BUZZ_CUT',
    hairColor: '#1c1917',
    facialHair: 'STUBBLE',
    eyeColor: '#475569',
    shirtStyle: 'HOODIE',
    shirtColor: '#18181b',
    shirtAccentColor: '#06b6d4',
    bottomsStyle: 'TIGHTS',
    bottomsColor: '#09090b',
    shoePrimaryColor: '#06b6d4',
    shoeAccentColor: '#18181b',
    eyewear: 'SPORTS_SHADES',
    boardColor: '#38bdf8',
  },
  {
    avatarName: 'Beach Cross-Trainer',
    skinTone: '#d4a373',
    hairstyle: 'PONYTAIL',
    hairColor: '#b59265',
    facialHair: 'GOATEE',
    eyeColor: '#16a34a',
    shirtStyle: 'SHIRTLESS',
    shirtColor: '#2563eb',
    shirtAccentColor: '#ffffff',
    bottomsStyle: 'RUNNING_SHORTS',
    bottomsColor: '#ea580c',
    shoePrimaryColor: '#ea580c',
    shoeAccentColor: '#ffffff',
    eyewear: 'HEADBAND',
    boardColor: '#f59e0b',
  },
];

export const PhotoCustomizerModal: React.FC<Props> = ({ customization, onSave, onClose }) => {
  const [config, setConfig] = useState<RunnerCustomization>({
    ...customization,
    skinTone: customization.skinTone || '#d4a373',
    hairstyle: customization.hairstyle || 'SHORT_FADE',
    hairColor: customization.hairColor || '#1c1917',
    facialHair: customization.facialHair || 'STUBBLE',
    facialHairColor: customization.facialHairColor || customization.hairColor || '#1c1917',
    eyeColor: customization.eyeColor || '#0284c7',
    physique: customization.physique || 'ATHLETIC',
    shirtStyle: customization.shirtStyle || 'TECH_TEE',
    shirtColor: customization.shirtColor || customization.hoodieColor || '#2563eb',
    shirtAccentColor: customization.shirtAccentColor || '#38bdf8',
    bottomsStyle: customization.bottomsStyle || 'RUNNING_SHORTS',
    bottomsColor: customization.bottomsColor || customization.pantsColor || '#1e293b',
    shoePrimaryColor: customization.shoePrimaryColor || '#f97316',
    shoeAccentColor: customization.shoeAccentColor || '#06b6d4',
    eyewear: customization.eyewear || 'SPORTS_SHADES',
    eyewearColor: customization.eyewearColor || '#0f172a',
    boardColor: customization.boardColor || '#f59e0b',
  });

  const [activeTab, setActiveTab] = useState<'PHOTO' | 'HEAD' | 'WARDROBE' | 'PRESETS'>('PHOTO');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setConfig((prev) => ({
        ...prev,
        photoUrl: dataUrl,
        avatarName: 'Custom Face Avatar',
      }));
    };
    reader.readAsDataURL(file);
  };

  // Webcam Selfie
  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 480, height: 480 },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.warn('Camera error:', err);
      setIsCameraActive(false);
      alert('Camera access unavailable. Please upload a photo instead.');
    }
  };

  const captureCameraPhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.translate(400, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(videoRef.current, 0, 0, 400, 400);
      const dataUrl = canvas.toDataURL('image/png');
      setConfig((prev) => ({
        ...prev,
        photoUrl: dataUrl,
        avatarName: 'Selfie Avatar',
      }));
    }
    stopCamera();
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const applyPreset = (preset: Partial<RunnerCustomization>) => {
    setConfig((prev) => ({
      ...prev,
      ...preset,
    }));
  };

  const handleSave = () => {
    stopCamera();
    onSave(config);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-slate-950 font-black shadow-lg">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-wide text-white flex items-center gap-2">
                CUSTOMIZE REALISTIC RUNNER
              </h2>
              <p className="text-xs text-slate-400">
                Design your athletic 3D runner avatar with custom face photo, facial hair & gear
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/90 px-6 pt-2 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('PHOTO')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all border-b-2 ${
              activeTab === 'PHOTO'
                ? 'border-cyan-400 text-cyan-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" />
            Face Photo & Selfie
          </button>
          <button
            onClick={() => setActiveTab('HEAD')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all border-b-2 ${
              activeTab === 'HEAD'
                ? 'border-amber-400 text-amber-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Scissors className="w-4 h-4" />
            Hair & Facial Grooming
          </button>
          <button
            onClick={() => setActiveTab('WARDROBE')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all border-b-2 ${
              activeTab === 'WARDROBE'
                ? 'border-emerald-400 text-emerald-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Shirt className="w-4 h-4" />
            Athletic Wardrobe
          </button>
          <button
            onClick={() => setActiveTab('PRESETS')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all border-b-2 ${
              activeTab === 'PRESETS'
                ? 'border-purple-400 text-purple-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Pro Styles
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: FACE PHOTO & WEBCAM */}
          {activeTab === 'PHOTO' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Photo Preview Frame */}
              <div className="md:col-span-5 flex flex-col items-center">
                <div
                  className="w-48 h-56 rounded-3xl p-1.5 shadow-2xl relative overflow-hidden flex items-center justify-center border-4"
                  style={{
                    borderColor: config.shirtColor || '#2563eb',
                    backgroundColor: config.skinTone || '#d4a373',
                  }}
                >
                  {isCameraActive ? (
                    <div className="w-full h-full relative">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover rounded-2xl transform -scale-x-100"
                      />
                      <button
                        onClick={captureCameraPhoto}
                        className="absolute bottom-2 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black rounded-full shadow-lg flex items-center gap-1.5"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        SNAP PHOTO
                      </button>
                    </div>
                  ) : config.photoUrl ? (
                    <div className="w-full h-full rounded-2xl overflow-hidden relative bg-slate-950 flex items-center justify-center">
                      <img
                        src={config.photoUrl}
                        alt="Custom Face"
                        className="w-full h-full object-cover"
                        style={{
                          transform: `scale(${config.photoScale}) translate(${config.photoOffsetX}px, ${config.photoOffsetY}px)`,
                        }}
                      />
                      <div className="absolute inset-0 border-2 border-cyan-400/40 rounded-2xl pointer-events-none" />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center p-3">
                      <div className="w-16 h-16 rounded-full bg-slate-900/80 flex items-center justify-center text-cyan-400 mb-2">
                        <User className="w-8 h-8" />
                      </div>
                      <span className="text-xs font-black text-slate-900">Realistic Man Face</span>
                      <span className="text-[10px] text-slate-800">Procedural 3D Head</span>
                    </div>
                  )}
                </div>

                <span className="mt-3 text-xs font-semibold text-slate-400">
                  {config.photoUrl ? 'Custom Photo Face Active' : 'Procedural Realistic Face Active'}
                </span>
              </div>

              {/* Upload Controls */}
              <div className="md:col-span-7 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3.5 rounded-2xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex flex-col items-center justify-center gap-2 transition active:scale-95"
                  >
                    <Upload className="w-5 h-5 text-cyan-400" />
                    <span>Upload Face Photo</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  <button
                    onClick={isCameraActive ? stopCamera : startCamera}
                    className="p-3.5 rounded-2xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 font-bold text-xs flex flex-col items-center justify-center gap-2 transition active:scale-95"
                  >
                    <Camera className="w-5 h-5 text-rose-400" />
                    <span>{isCameraActive ? 'Cancel Selfie' : 'Take Selfie Webcam'}</span>
                  </button>
                </div>

                {config.photoUrl && (
                  <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <ZoomIn className="w-3.5 h-3.5 text-cyan-400" />
                        Face Zoom
                      </span>
                      <span className="tabular-nums text-cyan-400">{config.photoScale.toFixed(2)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.8"
                      max="1.8"
                      step="0.05"
                      value={config.photoScale}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          photoScale: parseFloat(e.target.value),
                        }))
                      }
                      className="w-full accent-cyan-400 cursor-pointer"
                    />

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <span className="text-[11px] text-slate-400 font-medium">Pan X</span>
                        <input
                          type="range"
                          min="-40"
                          max="40"
                          value={config.photoOffsetX}
                          onChange={(e) =>
                            setConfig((prev) => ({
                              ...prev,
                              photoOffsetX: parseInt(e.target.value, 10),
                            }))
                          }
                          className="w-full accent-cyan-400 cursor-pointer"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400 font-medium">Pan Y</span>
                        <input
                          type="range"
                          min="-40"
                          max="40"
                          value={config.photoOffsetY}
                          onChange={(e) =>
                            setConfig((prev) => ({
                              ...prev,
                              photoOffsetY: parseInt(e.target.value, 10),
                            }))
                          }
                          className="w-full accent-cyan-400 cursor-pointer"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        setConfig((prev) => ({
                          ...prev,
                          photoUrl: '',
                          photoScale: 1.0,
                          photoOffsetX: 0,
                          photoOffsetY: 0,
                        }))
                      }
                      className="w-full py-2 text-xs text-rose-400 hover:text-rose-300 flex items-center justify-center gap-1.5 transition"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Remove Photo / Use Procedural Face
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: REALISTIC HEAD & GROOMING */}
          {activeTab === 'HEAD' && (
            <div className="space-y-6">
              {/* Skin Tone Selector */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 mb-2">
                  <Palette className="w-3.5 h-3.5 text-amber-400" />
                  Realistic Skin Melanin Tone
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                  {REALISTIC_SKIN_TONES.map((st) => (
                    <button
                      key={st.hex}
                      onClick={() => setConfig((prev) => ({ ...prev, skinTone: st.hex }))}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                        config.skinTone === st.hex
                          ? 'border-amber-400 bg-amber-500/10 ring-2 ring-amber-400'
                          : 'border-slate-800 bg-slate-800/40 hover:bg-slate-800'
                      }`}
                    >
                      <span className="w-7 h-7 rounded-full shadow-inner" style={{ backgroundColor: st.hex }} />
                      <span className="text-[11px] font-bold text-slate-300">{st.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Hairstyle */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 mb-2">
                  <Scissors className="w-3.5 h-3.5 text-cyan-400" />
                  Hairstyle
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {HAIRSTYLES.map((h) => (
                    <button
                      key={h.id}
                      onClick={() => setConfig((prev) => ({ ...prev, hairstyle: h.id }))}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border text-left ${
                        config.hairstyle === h.id
                          ? 'border-cyan-400 bg-cyan-500/10 text-cyan-300'
                          : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:text-white'
                      }`}
                    >
                      {h.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hair Color */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 mb-2">
                  Hair Color
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {HAIR_COLORS.map((hc) => (
                    <button
                      key={hc.hex}
                      onClick={() =>
                        setConfig((prev) => ({
                          ...prev,
                          hairColor: hc.hex,
                          facialHairColor: hc.hex,
                        }))
                      }
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-2 transition-all ${
                        config.hairColor === hc.hex
                          ? 'border-cyan-400 bg-cyan-500/10 text-white'
                          : 'border-slate-800 bg-slate-800/40 text-slate-400'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: hc.hex }} />
                      <span>{hc.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Facial Hair */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 mb-2">
                  Facial Hair & Grooming
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {FACIAL_HAIR_OPTIONS.map((fh) => (
                    <button
                      key={fh.id}
                      onClick={() => setConfig((prev) => ({ ...prev, facialHair: fh.id }))}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border text-center ${
                        config.facialHair === fh.id
                          ? 'border-amber-400 bg-amber-500/10 text-amber-300'
                          : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:text-white'
                      }`}
                    >
                      {fh.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Eye Color */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 mb-2">
                  <Eye className="w-3.5 h-3.5 text-blue-400" />
                  Eye Color
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {EYE_COLORS.map((ec) => (
                    <button
                      key={ec.hex}
                      onClick={() => setConfig((prev) => ({ ...prev, eyeColor: ec.hex }))}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-2 transition-all ${
                        config.eyeColor === ec.hex
                          ? 'border-blue-400 bg-blue-500/10 text-white'
                          : 'border-slate-800 bg-slate-800/40 text-slate-400'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: ec.hex }} />
                      <span>{ec.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ATHLETIC WARDROBE */}
          {activeTab === 'WARDROBE' && (
            <div className="space-y-6">
              {/* Shirt Style */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 mb-2">
                  <Shirt className="w-3.5 h-3.5 text-emerald-400" />
                  Upper Apparel
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SHIRT_STYLES.map((ss) => (
                    <button
                      key={ss.id}
                      onClick={() => setConfig((prev) => ({ ...prev, shirtStyle: ss.id }))}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border text-left ${
                        config.shirtStyle === ss.id
                          ? 'border-emerald-400 bg-emerald-500/10 text-emerald-300'
                          : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:text-white'
                      }`}
                    >
                      {ss.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Shirt Color */}
              {config.shirtStyle !== 'SHIRTLESS' && (
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
                    Shirt Color
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_PALETTE.map((c) => (
                      <button
                        key={c}
                        onClick={() =>
                          setConfig((prev) => ({
                            ...prev,
                            shirtColor: c,
                            hoodieColor: c,
                          }))
                        }
                        className={`w-8 h-8 rounded-xl transition-all ${
                          config.shirtColor === c ? 'ring-2 ring-white scale-110' : ''
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Bottoms Style */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
                  Lower Body Apparel
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {BOTTOMS_STYLES.map((bs) => (
                    <button
                      key={bs.id}
                      onClick={() => setConfig((prev) => ({ ...prev, bottomsStyle: bs.id }))}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border text-center ${
                        config.bottomsStyle === bs.id
                          ? 'border-emerald-400 bg-emerald-500/10 text-emerald-300'
                          : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:text-white'
                      }`}
                    >
                      {bs.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bottoms Color */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
                  Bottoms Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_PALETTE.map((c) => (
                    <button
                      key={c}
                      onClick={() =>
                        setConfig((prev) => ({
                          ...prev,
                          bottomsColor: c,
                          pantsColor: c,
                        }))
                      }
                      className={`w-8 h-8 rounded-xl transition-all ${
                        config.bottomsColor === c ? 'ring-2 ring-white scale-110' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Eyewear */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 mb-2">
                  <Glasses className="w-3.5 h-3.5 text-cyan-400" />
                  Eyewear & Headwear
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {EYEWEAR_STYLES.map((es) => (
                    <button
                      key={es.id}
                      onClick={() => setConfig((prev) => ({ ...prev, eyewear: es.id }))}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border text-left ${
                        config.eyewear === es.id
                          ? 'border-cyan-400 bg-cyan-500/10 text-cyan-300'
                          : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:text-white'
                      }`}
                    >
                      {es.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hoverboard Color */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
                  Hoverboard Finish
                </label>
                <div className="flex flex-wrap gap-2">
                  {['#f59e0b', '#38bdf8', '#ec4899', '#22c55e', '#a855f7', '#ef4444'].map((c) => (
                    <button
                      key={c}
                      onClick={() => setConfig((prev) => ({ ...prev, boardColor: c }))}
                      className={`w-8 h-8 rounded-xl transition-all ${
                        config.boardColor === c ? 'ring-2 ring-white scale-110' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PRESETS */}
          {activeTab === 'PRESETS' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PRESETS.map((p) => (
                <div
                  key={p.avatarName}
                  onClick={() => applyPreset(p)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-4 ${
                    config.avatarName === p.avatarName
                      ? 'border-purple-400 bg-purple-500/15 shadow-lg'
                      : 'border-slate-800 bg-slate-800/40 hover:bg-slate-800'
                  }`}
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center border shadow-inner"
                    style={{ backgroundColor: p.skinTone, borderColor: p.shirtColor }}
                  >
                    <User className="w-7 h-7 text-slate-900" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">{p.avatarName}</h4>
                    <p className="text-[11px] text-slate-400">
                      {p.hairstyle?.replace('_', ' ')} &middot; {p.shirtStyle?.replace('_', ' ')}
                    </p>
                    <div className="flex gap-1.5 mt-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: p.shirtColor }} />
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: p.bottomsColor }} />
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: p.boardColor }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Updates 3D realistic runner directly</span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition active:scale-95 flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Save & Run
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
