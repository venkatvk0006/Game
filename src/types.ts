export type GameState = 'MENU' | 'PLAYING' | 'PAUSED' | 'GAMEOVER';

export type Hairstyle = 'SHORT_FADE' | 'BUZZ_CUT' | 'SWEPT_BACK' | 'UNDERCUT' | 'PONYTAIL' | 'CAP' | 'BALD';
export type FacialHair = 'CLEAN_SHAVEN' | 'STUBBLE' | 'FULL_BEARD' | 'GOATEE' | 'MUSTACHE';
export type ShirtStyle = 'TECH_TEE' | 'TANK_TOP' | 'TRACK_JACKET' | 'HOODIE' | 'SHIRTLESS';
export type BottomsStyle = 'RUNNING_SHORTS' | 'TRACK_PANTS' | 'TIGHTS';
export type EyewearStyle = 'NONE' | 'SPORTS_SHADES' | 'WAYFARER' | 'HEADBAND';
export type BodyPhysique = 'LEAN' | 'ATHLETIC' | 'MUSCULAR';

export interface RunnerCustomization {
  photoUrl: string; // User uploaded face photo or webcam capture
  photoScale: number; // 0.8 - 2.0
  photoOffsetX: number; // -50 to 50
  photoOffsetY: number; // -50 to 50
  avatarName: string;

  // Realistic Man Head & Body
  skinTone: string;
  hairstyle: Hairstyle;
  hairColor: string;
  facialHair: FacialHair;
  facialHairColor: string;
  eyeColor: string;
  physique: BodyPhysique;

  // Clothing & Gear
  shirtStyle: ShirtStyle;
  shirtColor: string;
  shirtAccentColor: string;
  bottomsStyle: BottomsStyle;
  bottomsColor: string;
  shoePrimaryColor: string;
  shoeAccentColor: string;
  eyewear: EyewearStyle;
  eyewearColor: string;
  wristWatch: boolean;

  // Gear & Board
  boardColor: string;
  capColor?: string;
  hoodieColor?: string;
  pantsColor?: string;
}

export type Lane = 0 | 1 | 2; // 0 = Left (-2.8), 1 = Center (0), 2 = Right (+2.8)

export type ObstacleType =
  | 'TRAIN'
  | 'TRAIN_RAMP'
  | 'BARRIER_LOW'
  | 'BARRIER_HIGH'
  | 'TRACK_GATE'
  | 'TRAFFIC_LIGHT';

export type PowerupType =
  | 'MAGNET'
  | 'SNEAKERS'
  | 'JETPACK'
  | 'HOVERBOARD'
  | 'MULTIPLIER';

export interface PowerupState {
  type: PowerupType;
  duration: number; // total duration in sec
  remaining: number; // seconds left
}

export interface GameStats {
  score: number;
  coins: number;
  distance: number;
  highScore: number;
  multiplier: number;
  speed: number;
  overdriveEnergy: number; // 0 - 100%
  isOverdriveActive: boolean;
  heartRate: number; // simulated BPM 130-185
}

export interface CyberMission {
  id: string;
  title: string;
  desc: string;
  target: number;
  progress: number;
  reward: number;
  claimed: boolean;
  type: 'COINS' | 'DISTANCE' | 'JUMPS' | 'SLIDES' | 'HOVERBOARDS' | 'TRAIN_ROOFS';
}

export type BoardModel = 'NEON_PHANTOM' | 'CYBER_GLIDER' | 'PLASMA_WAVE' | 'WARP_DRIVE';

export interface TechUpgrades {
  magnetLevel: number; // 1-5
  sneakersLevel: number;
  jetpackLevel: number;
  multiplierLevel: number;
  overdriveEfficiency: number;
  selectedBoard: BoardModel;
}

export interface CareerStats {
  totalRuns: number;
  totalCoins: number;
  totalDistance: number;
  trainsDodged: number;
  overdrivesTriggered: number;
}

