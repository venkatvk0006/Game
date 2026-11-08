import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  GameState,
  RunnerCustomization,
  Lane,
  PowerupType,
  PowerupState,
  GameStats,
} from '../types';
import { sound } from '../audio/SoundFX';
import { CharacterModel } from './CharacterModel';
import { TrackManager, ObstacleInstance } from './TrackManager';

// Pre-allocated math helpers to eliminate GC spikes in 60FPS loop
const _vec3 = new THREE.Vector3();
const _playerBox = new THREE.Box3();
const _obsBox = new THREE.Box3();

export interface GameEngineCallbacks {
  onStatsUpdate: (stats: GameStats) => void;
  onPowerupsUpdate: (powerups: PowerupState[]) => void;
  onStateChange: (state: GameState) => void;
}

export class GameEngine {
  private container: HTMLDivElement;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private isSoftwareGl: boolean = false;
  private frameId: number = 0;
  private clock: THREE.Clock;

  // Components
  public character!: CharacterModel;
  public track!: TrackManager;
  public customization: RunnerCustomization;
  private callbacks: GameEngineCallbacks;

  // Game State
  public state: GameState = 'MENU';
  private currentLane: Lane = 1; // 0=Left, 1=Center, 2=Right
  private targetLaneX: number = 0;
  private currentLaneX: number = 0;

  // Physics & Movement
  private speed: number = 22; // units per sec
  private baseSpeed: number = 22;
  private maxSpeed: number = 42;
  private playerPos: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  private verticalVelocity: number = 0;
  private isGrounded: boolean = true;
  private groundY: number = 0;
  private gravity: number = -46;
  private jumpForce: number = 16.5;

  // Slide state
  private isSliding: boolean = false;
  private slideTimer: number = 0;
  private readonly SLIDE_DURATION: number = 0.75;

  // Active Powerups
  private activePowerups: Map<PowerupType, { remaining: number; duration: number }> = new Map();

  // Stats
  private score: number = 0;
  private coins: number = 0;
  private distance: number = 0;
  private multiplier: number = 1;
  private highScore: number = 0;

  // Cyber Overdrive System
  public overdriveEnergy: number = 0; // 0 - 100%
  public isOverdriveActive: boolean = false;
  private overdriveTimer: number = 0;
  private readonly OVERDRIVE_DURATION: number = 6.0;

  // External hooks & upgrades
  public techUpgrades?: import('../types').TechUpgrades;
  public onMissionEvent?: (type: 'COINS' | 'DISTANCE' | 'JUMPS' | 'SLIDES' | 'HOVERBOARDS' | 'TRAIN_ROOFS', amount: number) => void;

  // Camera feel & hitstop
  private hitstopTimer: number = 0;
  private screenShake: number = 0;
  private cameraTargetPos: THREE.Vector3 = new THREE.Vector3(0, 3.8, 7.5);

  // Input buffering
  private bufferedAction: 'JUMP' | 'SLIDE' | 'LEFT' | 'RIGHT' | null = null;
  private bufferTimer: number = 0;
  private touchStartX: number = 0;
  private touchStartY: number = 0;
  private touchStartTime: number = 0;

  // Particle System
  private particleGroup!: THREE.Group;
  private particles: {
    mesh: THREE.Mesh;
    velocity: THREE.Vector3;
    life: number;
    maxLife: number;
    rotVelocity?: THREE.Vector3;
    drag?: number;
    gravity?: number;
    isRing?: boolean;
    isSharedGeo?: boolean;
  }[] = [];

  // Pre-allocated particle geometries & materials for 60 FPS zero-GC pickup FX
  private pRingGeo!: THREE.RingGeometry;
  private pOctaGeo!: THREE.OctahedronGeometry;
  private pBoxGeo!: THREE.BoxGeometry;
  private pSphereGeo!: THREE.SphereGeometry;
  private pPinkMat!: THREE.MeshBasicMaterial;
  private pRoseMat!: THREE.MeshBasicMaterial;
  private pBlushMat!: THREE.MeshBasicMaterial;
  private pWhiteMat!: THREE.MeshBasicMaterial;
  private pGoldMat!: THREE.MeshBasicMaterial;
  private pRingMat!: THREE.MeshBasicMaterial;
  private pDustMat!: THREE.MeshBasicMaterial;

  constructor(
    container: HTMLDivElement,
    customization: RunnerCustomization,
    callbacks: GameEngineCallbacks
  ) {
    this.container = container;
    this.customization = customization;
    this.callbacks = callbacks;
    this.clock = new THREE.Clock();

    // Read high score
    try {
      const savedHigh = localStorage.getItem('subway_rush_high_score');
      if (savedHigh) this.highScore = parseInt(savedHigh, 10) || 0;
    } catch {}

    this.initWebGL();
    this.initScene();
    this.initInputs();
    this.startLoop();
  }

  private initWebGL() {
    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });

    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.setPixelRatio(
      this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2)
    );
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.renderer.setSize(width, height);
    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 350);
    this.camera.position.set(0, 3.8, 7.5);
  }

  private initScene() {
    this.scene = new THREE.Scene();
    // Warm sunny canyon atmosphere matching Subway Surfers reference image
    this.scene.background = new THREE.Color(0x7dd3fc); // Bright cyan sunny sky
    this.scene.fog = new THREE.FogExp2(0xbae6fd, 0.007); // Warm golden horizon haze

    // Studio Environment Map via RoomEnvironment
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Bright golden sun key light with crisp shadows
    const keyLight = new THREE.DirectionalLight(0xfffbeb, 2.6);
    keyLight.position.set(14, 26, 12);
    if (!this.isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.camera.near = 0.5;
      keyLight.shadow.camera.far = 70;
      const d = 16;
      keyLight.shadow.camera.left = -d;
      keyLight.shadow.camera.right = d;
      keyLight.shadow.camera.top = d;
      keyLight.shadow.camera.bottom = -d;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    this.scene.add(keyLight);

    // Warm canyon bounce & sky fill light (sky-blue dome + warm terracotta ground bounce)
    const hemiLight = new THREE.HemisphereLight(0x7dd3fc, 0xd97706, 1.4);
    this.scene.add(hemiLight);

    // Soft ambient fill light for smooth, bright cartoon shading
    const ambientLight = new THREE.AmbientLight(0xffedd5, 0.5);
    this.scene.add(ambientLight);

    // Initialize shared reusable particle geometries & materials
    this.initParticleAssets();

    // Track Manager
    this.track = new TrackManager(this.scene);
    this.track.init();

    // 3D Character
    this.character = new CharacterModel(this.customization);
    this.scene.add(this.character.group);

    // Particle Group
    this.particleGroup = new THREE.Group();
    this.scene.add(this.particleGroup);

    // Window resize handling
    window.addEventListener('resize', this.onResize);
  }

  private initParticleAssets() {
    this.pRingGeo = new THREE.RingGeometry(0.18, 0.36, 24);
    this.pOctaGeo = new THREE.OctahedronGeometry(0.14, 0);
    this.pBoxGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    this.pSphereGeo = new THREE.SphereGeometry(0.08, 8, 8);

    this.pPinkMat = new THREE.MeshBasicMaterial({ color: 0xf472b6 });
    this.pRoseMat = new THREE.MeshBasicMaterial({ color: 0xfb7185 });
    this.pBlushMat = new THREE.MeshBasicMaterial({ color: 0xfbcfe8 });
    this.pWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.pGoldMat = new THREE.MeshBasicMaterial({ color: 0xfde047 });
    this.pRingMat = new THREE.MeshBasicMaterial({
      color: 0xf472b6,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this.pDustMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });
  }

  private onResize = () => {
    if (!this.container || !this.renderer) return;
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  public updateCustomization(cfg: RunnerCustomization) {
    this.customization = cfg;
    this.character.updateCustomization(cfg);
  }

  // --- Input System ---
  private initInputs() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('blur', this.handleBlur);

    const el = this.renderer.domElement;
    el.addEventListener('touchstart', this.handleTouchStart, { passive: true });
    el.addEventListener('touchend', this.handleTouchEnd, { passive: true });
  }

  private handleBlur = () => {
    if (this.state === 'PLAYING') {
      this.pauseGame();
    }
  };

  private handleKeyDown = (e: KeyboardEvent) => {
    if (this.state === 'MENU') {
      if (e.code === 'Enter' || e.code === 'Space') {
        this.startGame();
      }
      return;
    }

    if (this.state === 'GAMEOVER') {
      if (e.code === 'Enter' || e.code === 'Space') {
        this.restartGame();
      }
      return;
    }

    if (e.code === 'Escape') {
      if (this.state === 'PLAYING') this.pauseGame();
      else if (this.state === 'PAUSED') this.resumeGame();
      return;
    }

    if (this.state !== 'PLAYING') return;

    switch (e.code) {
      case 'ArrowLeft':
      case 'KeyA':
        this.shiftLane(-1);
        break;
      case 'ArrowRight':
      case 'KeyD':
        this.shiftLane(1);
        break;
      case 'ArrowUp':
      case 'KeyW':
      case 'Space':
        this.triggerJump();
        break;
      case 'ArrowDown':
      case 'KeyS':
        this.triggerSlide();
        break;
      case 'KeyB':
        this.activateHoverboardManual();
        break;
      case 'KeyE':
        this.triggerOverdrive();
        break;
    }
  };

  private handleTouchStart = (e: TouchEvent) => {
    const touch = e.changedTouches[0];
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
    this.touchStartTime = performance.now();
  };

  private handleTouchEnd = (e: TouchEvent) => {
    if (this.state === 'MENU') {
      this.startGame();
      return;
    }
    if (this.state === 'GAMEOVER') {
      this.restartGame();
      return;
    }
    if (this.state !== 'PLAYING') return;

    const touch = e.changedTouches[0];
    const dx = touch.clientX - this.touchStartX;
    const dy = touch.clientY - this.touchStartY;
    const dt = performance.now() - this.touchStartTime;

    // Double tap check for Hoverboard
    if (dt < 250 && Math.abs(dx) < 20 && Math.abs(dy) < 20) {
      this.activateHoverboardManual();
      return;
    }

    const minSwipe = 30;
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx < -minSwipe) this.shiftLane(-1);
      else if (dx > minSwipe) this.shiftLane(1);
    } else {
      if (dy < -minSwipe) this.triggerJump();
      else if (dy > minSwipe) this.triggerSlide();
    }
  };

  public shiftLane(direction: -1 | 1) {
    if (this.state !== 'PLAYING') return;
    const nextLane = (this.currentLane + direction) as Lane;
    if (nextLane >= 0 && nextLane <= 2) {
      this.currentLane = nextLane;
      this.targetLaneX = TrackManager.LANES[nextLane];
      sound.playLaneShift();
    }
  }

  public triggerJump() {
    if (this.state !== 'PLAYING') return;

    // Super sneakers boost jump
    const hasSneakers = this.activePowerups.has('SNEAKERS');
    const sneakerBonus = this.techUpgrades?.sneakersLevel ? (this.techUpgrades.sneakersLevel - 1) * 0.08 : 0;
    const jumpVel = (hasSneakers ? this.jumpForce * 1.4 : this.jumpForce) + sneakerBonus;

    if (this.isGrounded) {
      this.verticalVelocity = jumpVel;
      this.isGrounded = false;
      this.isSliding = false;
      this.character.isSliding = false;
      this.character.isJumping = true;

      this.onMissionEvent?.('JUMPS', 1);

      if (hasSneakers) sound.playSuperJump();
      else sound.playJump();

      this.spawnDustBurst(this.playerPos.x, this.playerPos.y, this.playerPos.z, 0x38bdf8);
    } else {
      // Buffer jump for landing
      this.bufferedAction = 'JUMP';
      this.bufferTimer = 0.25;
    }
  }

  public triggerSlide() {
    if (this.state !== 'PLAYING') return;

    // Fast-drop if in air
    if (!this.isGrounded) {
      this.verticalVelocity = -35;
    }

    this.isSliding = true;
    this.slideTimer = this.SLIDE_DURATION;
    this.character.isSliding = true;
    this.character.isJumping = false;
    this.onMissionEvent?.('SLIDES', 1);
    sound.playSlide();

    this.spawnDustBurst(this.playerPos.x, this.playerPos.y + 0.2, this.playerPos.z, 0xf59e0b);
  }

  public activateHoverboardManual() {
    if (this.state !== 'PLAYING') return;
    if (!this.activePowerups.has('HOVERBOARD')) {
      const extraTime = this.techUpgrades?.selectedBoard === 'CYBER_GLIDER' ? 5 : 0;
      this.activatePowerup('HOVERBOARD', 15 + extraTime);
      this.onMissionEvent?.('HOVERBOARDS', 1);
      sound.playHoverboard();
    }
  }

  public triggerOverdrive() {
    if (this.state !== 'PLAYING') return;
    if (this.overdriveEnergy >= 100 && !this.isOverdriveActive) {
      this.isOverdriveActive = true;
      this.overdriveTimer = this.OVERDRIVE_DURATION;
      this.overdriveEnergy = 0;
      sound.playOverdrive();
      this.screenShake = 0.8;
      this.spawnPowerupBurst(this.playerPos.x, this.playerPos.y + 1, this.playerPos.z);
    }
  }

  public activatePowerup(type: PowerupType, duration: number = 10) {
    this.activePowerups.set(type, { remaining: duration, duration });
    sound.playPowerup();

    if (type === 'HOVERBOARD') {
      this.character.isHoverboardActive = true;
    } else if (type === 'JETPACK') {
      this.character.isJetpackActive = true;
      this.verticalVelocity = 12;
      this.isGrounded = false;
    } else if (type === 'MULTIPLIER') {
      this.multiplier = 2;
    }
    this.emitPowerups();
  }

  private emitPowerups() {
    const list: PowerupState[] = [];
    this.activePowerups.forEach((val, type) => {
      list.push({ type, duration: val.duration, remaining: val.remaining });
    });
    this.callbacks.onPowerupsUpdate(list);
  }

  // --- Game Flow Control ---
  public startGame() {
    this.state = 'PLAYING';
    this.score = 0;
    this.coins = 0;
    this.distance = 0;
    this.speed = this.baseSpeed;
    this.multiplier = 1;
    this.currentLane = 1;
    this.targetLaneX = 0;
    this.currentLaneX = 0;
    this.playerPos.set(0, 0, 0);
    this.verticalVelocity = 0;
    this.isGrounded = true;
    this.groundY = 0;
    this.isSliding = false;
    this.character.isCrashing = false;
    this.character.isSliding = false;
    this.character.isJumping = false;
    this.character.isHoverboardActive = false;
    this.character.isJetpackActive = false;
    this.character.group.rotation.set(0, 0, 0);
    this.overdriveEnergy = 25;
    this.isOverdriveActive = false;
    this.overdriveTimer = 0;
    this.activePowerups.clear();
    this.emitPowerups();

    this.track.init();
    sound.startMusic();
    this.callbacks.onStateChange('PLAYING');
  }

  public pauseGame() {
    if (this.state !== 'PLAYING') return;
    this.state = 'PAUSED';
    sound.stopMusic();
    this.callbacks.onStateChange('PAUSED');
  }

  public resumeGame() {
    if (this.state !== 'PAUSED') return;
    this.state = 'PLAYING';
    sound.startMusic();
    this.callbacks.onStateChange('PLAYING');
  }

  public restartGame() {
    this.startGame();
  }

  private triggerCrash(obstacle: ObstacleInstance) {
    // If hoverboard is active, save player with board break effect!
    if (this.activePowerups.has('HOVERBOARD')) {
      this.activePowerups.delete('HOVERBOARD');
      this.character.isHoverboardActive = false;
      this.emitPowerups();
      sound.playHit();
      this.hitstopTimer = 0.08;
      this.screenShake = 0.6;
      this.spawnDustBurst(this.playerPos.x, this.playerPos.y + 1, this.playerPos.z, 0x38bdf8, 30);
      // Remove or pass obstacle
      this.scene.remove(obstacle.mesh);
      return;
    }

    // Game Over
    this.state = 'GAMEOVER';
    this.character.isCrashing = true;
    this.character.isHoverboardActive = false;
    this.character.isJetpackActive = false;
    sound.playHit();
    sound.stopMusic();

    this.hitstopTimer = 0.12; // 120ms juicy hitstop
    this.screenShake = 1.0;

    // Check high score
    if (this.score > this.highScore) {
      this.highScore = Math.floor(this.score);
      try {
        localStorage.setItem('subway_rush_high_score', String(this.highScore));
      } catch {}
    }

    this.callbacks.onStateChange('GAMEOVER');
  }

  // --- 60Hz / 60 FPS Animation & Physics Loop ---
  private startLoop() {
    const afterDraw = (cb: () => void) => {
      const gl = this.renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          this.frameId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          this.frameId = window.setTimeout(cb, 80);
        }
      };
      this.frameId = window.setTimeout(poll, 5);
    };

    const tick = () => {
      const rawDt = this.clock.getDelta();
      const dt = Math.min(rawDt, 0.05); // Clamp frame delta time to prevent physics tunnel spikes

      this.step(dt);
      this.renderer.render(this.scene, this.camera);

      if (this.isSoftwareGl) afterDraw(tick);
      else this.frameId = requestAnimationFrame(tick);
    };

    if (this.isSoftwareGl) afterDraw(tick);
    else this.frameId = requestAnimationFrame(tick);
  }

  private step(dt: number) {
    // Hitstop micro-pause simulation
    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= dt;
      return;
    }

    // Input buffer expiration
    if (this.bufferTimer > 0) {
      this.bufferTimer -= dt;
      if (this.bufferTimer <= 0) this.bufferedAction = null;
    }

    // Update screen shake decay
    if (this.screenShake > 0) {
      this.screenShake = THREE.MathUtils.damp(this.screenShake, 0, 8, dt);
    }

    // Update Particles
    this.updateParticles(dt);

    if (this.state === 'MENU') {
      // Atmospheric title camera pan around runner
      const t = performance.now() * 0.0008;
      this.camera.position.x = Math.sin(t) * 4.5;
      this.camera.position.y = 2.4 + Math.cos(t * 0.7) * 0.5;
      this.camera.position.z = 4.2 + Math.cos(t) * 2;
      this.camera.lookAt(0, 1.4, 0);
      this.character.update(dt, 8, 0);
      return;
    }

    if (this.state === 'PAUSED') {
      return;
    }

    if (this.state === 'GAMEOVER') {
      this.character.update(dt, 0, 0);
      // Camera slows down and frames the fallen runner
      this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, this.playerPos.x + 2, 4, dt);
      this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, 2.2, 4, dt);
      this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, this.playerPos.z + 5.5, 4, dt);
      this.camera.lookAt(this.playerPos.x, 0.6, this.playerPos.z);
      return;
    }

    // --- PLAYING STATE SIMULATION ---

    // 1. Difficulty ramp: gradually increase speed
    this.speed = Math.min(this.maxSpeed, this.baseSpeed + (this.distance / 1200) * 12);

    // Overdrive Countdown & Energy
    if (this.isOverdriveActive) {
      this.overdriveTimer -= dt;
      if (this.overdriveTimer <= 0) {
        this.isOverdriveActive = false;
      }
      this.spawnOverdriveSpeedStreaks(dt);
    } else {
      this.overdriveEnergy = Math.min(100, this.overdriveEnergy + dt * 3.5);
    }

    // 2. Forward Movement (Boosted in Overdrive)
    const effectiveSpeed = this.isOverdriveActive ? this.speed * 1.65 : this.speed;
    const moveZ = effectiveSpeed * dt;
    this.playerPos.z -= moveZ;
    this.distance += moveZ;
    this.score += moveZ * this.multiplier * (this.isOverdriveActive ? 3.0 : 1.5);
    this.onMissionEvent?.('DISTANCE', Math.round(moveZ));

    // 3. Smooth Spring Lane Shift Kinematics
    const prevLaneX = this.currentLaneX;
    this.currentLaneX = THREE.MathUtils.damp(this.currentLaneX, this.targetLaneX, 18, dt);
    const laneOffsetRate = (this.currentLaneX - prevLaneX) / dt;
    this.playerPos.x = this.currentLaneX;

    // 4. Slide duration countdown
    if (this.isSliding) {
      this.slideTimer -= dt;
      if (this.slideTimer <= 0) {
        this.isSliding = false;
        this.character.isSliding = false;
      }
    }

    // 5. Vertical Physics & Ramp / Train Top checks
    const trainSupport = this.checkTrainVerticalSupport();
    this.groundY = trainSupport;

    const isJetpack = this.activePowerups.has('JETPACK');
    if (isJetpack) {
      // Cruise in sky above tracks
      const targetSkyY = 5.8;
      this.playerPos.y = THREE.MathUtils.damp(this.playerPos.y, targetSkyY, 6, dt);
      this.verticalVelocity = 0;
      this.isGrounded = false;
      this.spawnJetpackThrust(dt);
    } else {
      if (!this.isGrounded) {
        this.verticalVelocity += this.gravity * dt;
        this.playerPos.y += this.verticalVelocity * dt;

        // Landing check
        if (this.playerPos.y <= this.groundY) {
          this.playerPos.y = this.groundY;
          this.verticalVelocity = 0;
          this.isGrounded = true;
          this.character.isJumping = false;
          this.spawnLandingDust(this.playerPos.x, this.playerPos.y, this.playerPos.z);

          // Consume buffered jump if present
          if (this.bufferedAction === 'JUMP') {
            this.bufferedAction = null;
            this.triggerJump();
          }
        }
      } else {
        // Player is on ground or roof
        if (this.playerPos.y > this.groundY + 0.1) {
          // Walked off an edge
          this.isGrounded = false;
        } else {
          this.playerPos.y = this.groundY;
          // Running footstep dust puffs matching Subway Surfers cartoon style
          if (!this.character.isHoverboardActive && Math.random() < dt * 7) {
            this.spawnFootDust(this.playerPos.x, this.playerPos.y, this.playerPos.z);
          }
        }
      }
    }

    // Update Character 3D Transform & Animation
    this.character.group.position.copy(this.playerPos);
    this.character.update(dt, this.speed, laneOffsetRate);

    // 6. Update Active Powerups
    let powerupsChanged = false;
    this.activePowerups.forEach((pState, type) => {
      pState.remaining -= dt;
      if (pState.remaining <= 0) {
        this.activePowerups.delete(type);
        powerupsChanged = true;
        if (type === 'HOVERBOARD') this.character.isHoverboardActive = false;
        if (type === 'JETPACK') this.character.isJetpackActive = false;
        if (type === 'MULTIPLIER') this.multiplier = 1;
      }
    });
    if (powerupsChanged) this.emitPowerups();

    // 7. Track Update & Collectibles / Coins
    const hasMagnet =
      this.activePowerups.has('MAGNET') ||
      this.isOverdriveActive ||
      (this.techUpgrades?.selectedBoard === 'PLASMA_WAVE' && this.character.isHoverboardActive);
    this.track.update(this.playerPos.z, dt, hasMagnet, this.playerPos);

    // Check Collectible Pickups
    this.checkCollectiblePickups();

    // 8. Obstacle Collision Detection
    if (!isJetpack) {
      this.checkObstacleCollisions();
    }

    // 9. Dynamic Third-Person Chase Camera with Smooth Spring & Warp FOV
    const targetFov = this.isOverdriveActive ? 85 : 65;
    this.camera.fov = THREE.MathUtils.damp(this.camera.fov, targetFov, 7, dt);
    this.camera.updateProjectionMatrix();

    // High-speed engine vibration when overdrive is active
    const overdriveRumbleX = this.isOverdriveActive ? Math.sin(performance.now() * 0.05) * 0.06 : 0;
    const overdriveRumbleY = this.isOverdriveActive ? Math.cos(performance.now() * 0.06) * 0.06 : 0;

    const shakeX = (Math.random() * 2 - 1) * this.screenShake * 0.25 + overdriveRumbleX;
    const shakeY = (Math.random() * 2 - 1) * this.screenShake * 0.25 + overdriveRumbleY;

    const targetCamX = this.playerPos.x * 0.45 + shakeX;
    const targetCamY = Math.max(3.2, this.playerPos.y + 2.8) + shakeY;
    const targetCamZ = this.playerPos.z + (this.isOverdriveActive ? 7.2 : 6.8);

    this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, targetCamX, 10, dt);
    this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, targetCamY, 8, dt);
    this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, targetCamZ, 16, dt);

    const lookY = Math.max(1.4, this.playerPos.y + 1.2);
    this.camera.lookAt(this.playerPos.x * 0.25, lookY, this.playerPos.z - 8);

    // 10. Emit Stats with Cyber Telemetry
    const heartRate = Math.min(
      185,
      Math.round(135 + (this.speed - 22) * 2.2 + (this.isOverdriveActive ? 25 : 0))
    );

    this.callbacks.onStatsUpdate({
      score: Math.floor(this.score),
      coins: this.coins,
      distance: Math.floor(this.distance),
      highScore: Math.max(this.highScore, Math.floor(this.score)),
      multiplier: this.multiplier,
      speed: Math.round(this.isOverdriveActive ? this.speed * 1.65 : this.speed),
      overdriveEnergy: this.overdriveEnergy,
      isOverdriveActive: this.isOverdriveActive,
      heartRate,
    });
  }

  // Vertical support on top of trains & ramps
  private checkTrainVerticalSupport(): number {
    let ground = 0;
    for (const obs of this.track.obstacles) {
      if (obs.type === 'TRAIN' || obs.type === 'TRAIN_RAMP') {
        const laneX = TrackManager.LANES[obs.lane];
        const halfW = obs.width / 2 + 0.3;
        const halfD = obs.depth / 2 + (obs.hasRamp ? 4 : 0);

        // Check if player is horizontally within train boundary
        if (
          Math.abs(this.playerPos.x - laneX) < halfW &&
          Math.abs(this.playerPos.z - obs.z) < halfD
        ) {
          // If train has a ramp and player is entering from front (+Z)
          if (obs.hasRamp && this.playerPos.z > obs.z + obs.depth / 2 - 4) {
            const rampProgress = (obs.z + obs.depth / 2 + 3.5 - this.playerPos.z) / 5.5;
            const rampY = Math.min(obs.height, Math.max(0, rampProgress * obs.height));
            ground = Math.max(ground, rampY);
          } else {
            // On top of train roof
            if (this.playerPos.y >= obs.height - 0.5) {
              ground = Math.max(ground, obs.height);
            }
          }
        }
      }
    }
    return ground;
  }

  private checkObstacleCollisions() {
    // If Overdrive is active, vaporize oncoming obstacles!
    if (this.isOverdriveActive) {
      for (let i = this.track.obstacles.length - 1; i >= 0; i--) {
        const obs = this.track.obstacles[i];
        const laneX = TrackManager.LANES[obs.lane];
        const zDiff = Math.abs(this.playerPos.z - obs.z);
        if (Math.abs(this.playerPos.x - laneX) < obs.width / 2 + 0.6 && zDiff < (obs.depth / 2 + 1.2)) {
          this.scene.remove(obs.mesh);
          this.spawnPowerupBurst(this.playerPos.x, this.playerPos.y + 1, obs.z);
          this.track.obstacles.splice(i, 1);
          this.score += 350;
          this.screenShake = 0.5;
        }
      }
      return;
    }

    const playerRadius = 0.42;
    const playerBottom = this.playerPos.y;
    const playerTop = this.isSliding ? this.playerPos.y + 0.95 : this.playerPos.y + 1.8;

    for (const obs of this.track.obstacles) {
      const laneX = TrackManager.LANES[obs.lane];
      const zDiff = Math.abs(this.playerPos.z - obs.z);

      if (obs.type === 'TRAIN' || obs.type === 'TRAIN_RAMP') {
        const halfD = obs.depth / 2;
        // If on roof or ramp, safe
        if (this.playerPos.y >= obs.height - 0.2) continue;
        if (obs.hasRamp && this.playerPos.z > obs.z + halfD - 4.5) continue;

        // Otherwise check horizontal & depth box crash
        if (
          Math.abs(this.playerPos.x - laneX) < obs.width / 2 + playerRadius - 0.15 &&
          zDiff < halfD + 0.2
        ) {
          this.triggerCrash(obs);
          return;
        }
      } else if (obs.type === 'BARRIER_LOW') {
        if (zDiff < 0.6) {
          if (Math.abs(this.playerPos.x - laneX) < obs.width / 2 + playerRadius - 0.1) {
            // Must jump over OR slide under
            if (playerBottom < 0.95 && !this.isSliding) {
              this.triggerCrash(obs);
              return;
            }
          }
        }
      } else if (obs.type === 'BARRIER_HIGH') {
        if (zDiff < 0.6) {
          if (Math.abs(this.playerPos.x - laneX) < obs.width / 2 + playerRadius - 0.1) {
            // Must slide under! If standing or jumping, top hits barrier
            if (playerTop > 1.1) {
              this.triggerCrash(obs);
              return;
            }
          }
        }
      } else if (obs.type === 'TRACK_GATE') {
        if (zDiff < 0.6) {
          if (Math.abs(this.playerPos.x - laneX) < obs.width / 2 + playerRadius - 0.1) {
            if (playerBottom < 2.0) {
              this.triggerCrash(obs);
              return;
            }
          }
        }
      }
    }
  }

  private checkCollectiblePickups() {
    const pickupRadius = this.isOverdriveActive ? 3.5 : 1.35;
    for (const col of this.track.collectibles) {
      if (col.collected) continue;

      const dist = this.playerPos.distanceTo(col.mesh.position);
      if (dist < pickupRadius) {
        col.collected = true;

        if (col.type === 'COIN') {
          this.coins++;
          this.score += 60 * this.multiplier * (this.isOverdriveActive ? 2 : 1);
          this.overdriveEnergy = Math.min(100, this.overdriveEnergy + 4.0);
          this.onMissionEvent?.('COINS', 1);
          sound.playCoin();
          this.spawnCoinSparks(col.mesh.position.x, col.mesh.position.y, col.mesh.position.z);
        } else {
          // Power-up
          let dur = 12;
          if (this.techUpgrades) {
            if (col.type === 'MAGNET') dur += (this.techUpgrades.magnetLevel - 1) * 2;
            if (col.type === 'SNEAKERS') dur += (this.techUpgrades.sneakersLevel - 1) * 2;
            if (col.type === 'JETPACK') dur += (this.techUpgrades.jetpackLevel - 1) * 2;
            if (col.type === 'MULTIPLIER') dur += (this.techUpgrades.multiplierLevel - 1) * 2;
          }
          this.activatePowerup(col.type as PowerupType, dur);
          this.spawnPowerupBurst(col.mesh.position.x, col.mesh.position.y, col.mesh.position.z);
        }
      }
    }
  }

  // --- Procedural Particle Effects ---
  private spawnFootDust(x: number, y: number, z: number) {
    for (let i = 0; i < 2; i++) {
      const mesh = new THREE.Mesh(this.pSphereGeo, this.pDustMat);
      mesh.position.set(
        x + (Math.random() - 0.5) * 0.35,
        y + 0.08,
        z + 0.2 + Math.random() * 0.2
      );
      mesh.scale.set(0.6, 0.6, 0.6);
      this.particleGroup.add(mesh);

      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 1.2,
        Math.random() * 1.2 + 0.4,
        2.5 + Math.random() * 2
      );
      this.particles.push({
        mesh,
        velocity: vel,
        life: 0.28,
        maxLife: 0.28,
        drag: 0.88,
        gravity: -2,
        isSharedGeo: true,
      });
    }
  }

  private spawnLandingDust(x: number, y: number, z: number) {
    for (let i = 0; i < 8; i++) {
      const mesh = new THREE.Mesh(this.pSphereGeo, this.pDustMat);
      mesh.position.set(x, y + 0.1, z);
      const angle = (i * Math.PI * 2) / 8;
      const speed = 2.2 + Math.random() * 1.5;
      mesh.scale.set(0.8, 0.8, 0.8);
      this.particleGroup.add(mesh);

      const vel = new THREE.Vector3(
        Math.cos(angle) * speed,
        Math.random() * 1.5 + 0.5,
        Math.sin(angle) * speed + 1.5
      );
      this.particles.push({
        mesh,
        velocity: vel,
        life: 0.35,
        maxLife: 0.35,
        drag: 0.85,
        gravity: -4,
        isSharedGeo: true,
      });
    }
  }

  private spawnDustBurst(x: number, y: number, z: number, color: number = 0xffffff, count: number = 10) {
    for (let i = 0; i < count; i++) {
      const geo = new THREE.BoxGeometry(0.08, 0.08, 0.08);
      const mat = new THREE.MeshBasicMaterial({ color });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      this.particleGroup.add(mesh);

      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 4,
        Math.random() * 3 + 1,
        (Math.random() - 0.5) * 4
      );

      this.particles.push({ mesh, velocity: vel, life: 0.35, maxLife: 0.35 });
    }
  }

  // Satisfying Cute Pink "T" Collectible Pickup FX
  private spawnCoinSparks(x: number, y: number, z: number) {
    // 1. Tactile Micro Screen-Shake Haptic
    this.screenShake = Math.max(this.screenShake, 0.38);

    // 2. Expanding Pink Shockwave Halo Ring
    const ringMat = this.pRingMat.clone();
    const ringMesh = new THREE.Mesh(this.pRingGeo, ringMat);
    ringMesh.position.set(x, y, z);
    ringMesh.scale.set(0.3, 0.3, 0.3);
    ringMesh.rotation.x = -Math.PI / 5;
    this.particleGroup.add(ringMesh);

    this.particles.push({
      mesh: ringMesh,
      velocity: new THREE.Vector3(0, 0.6, 0),
      life: 0.38,
      maxLife: 0.38,
      isRing: true,
      isSharedGeo: true,
    });

    // 3. 14 3D Tumbling Diamond & Star Gems with Rotation & Drag
    const gemMats = [this.pPinkMat, this.pRoseMat, this.pBlushMat, this.pGoldMat, this.pWhiteMat];
    for (let i = 0; i < 14; i++) {
      const geo = i % 2 === 0 ? this.pOctaGeo : this.pBoxGeo;
      const mat = gemMats[i % gemMats.length];
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      this.particleGroup.add(mesh);

      const angle = (i * Math.PI * 2) / 14 + (Math.random() - 0.5) * 0.3;
      const horizSpeed = 3.8 + Math.random() * 3.4;
      const vel = new THREE.Vector3(
        Math.cos(angle) * horizSpeed,
        Math.random() * 4.2 + 2.4,
        Math.sin(angle) * horizSpeed * 0.5
      );

      const rotVelocity = new THREE.Vector3(
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 16
      );

      this.particles.push({
        mesh,
        velocity: vel,
        life: 0.42,
        maxLife: 0.42,
        rotVelocity,
        drag: 0.93,
        gravity: -16,
        isSharedGeo: true,
      });
    }

    // 4. 6 Floaty Pixie Dust Sparkles (slow graceful upward drift)
    for (let i = 0; i < 6; i++) {
      const mat = i % 2 === 0 ? this.pWhiteMat : this.pBlushMat;
      const mesh = new THREE.Mesh(this.pSphereGeo, mat);
      mesh.position.set(
        x + (Math.random() - 0.5) * 0.3,
        y + (Math.random() - 0.5) * 0.3,
        z + (Math.random() - 0.5) * 0.3
      );
      this.particleGroup.add(mesh);

      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 1.8,
        Math.random() * 2.2 + 1.2,
        (Math.random() - 0.5) * 1.8
      );

      this.particles.push({
        mesh,
        velocity: vel,
        life: 0.5,
        maxLife: 0.5,
        drag: 0.95,
        gravity: 1.5, // float upwards!
        isSharedGeo: true,
      });
    }
  }

  private spawnPowerupBurst(x: number, y: number, z: number) {
    for (let i = 0; i < 18; i++) {
      const geo = new THREE.BoxGeometry(0.14, 0.14, 0.14);
      const mat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      this.particleGroup.add(mesh);

      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 8
      );
      this.particles.push({ mesh, velocity: vel, life: 0.45, maxLife: 0.45 });
    }
  }

  private spawnJetpackThrust(dt: number) {
    if (Math.random() > 0.4) {
      const geo = new THREE.BoxGeometry(0.12, 0.12, 0.12);
      const mat = new THREE.MeshBasicMaterial({ color: Math.random() > 0.5 ? 0xf97316 : 0xfbbf24 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(
        this.playerPos.x + (Math.random() - 0.5) * 0.4,
        this.playerPos.y + 0.8,
        this.playerPos.z + 0.4
      );
      this.particleGroup.add(mesh);

      const vel = new THREE.Vector3(0, -6, 8);
      this.particles.push({ mesh, velocity: vel, life: 0.2, maxLife: 0.2 });
    }
  }

  // 3D Spatial Speed Streaks for Overdrive Hyperspeed
  private spawnOverdriveSpeedStreaks(dt: number) {
    if (Math.random() < dt * 45) {
      const geo = this.pBoxGeo;
      const mat = Math.random() > 0.5 ? this.pPinkMat : this.pWhiteMat;
      const mesh = new THREE.Mesh(geo, mat);
      const angle = Math.random() * Math.PI * 2;
      const radius = 1.0 + Math.random() * 3.5;
      mesh.position.set(
        this.playerPos.x + Math.cos(angle) * radius,
        this.playerPos.y + 1.2 + Math.sin(angle) * (radius * 0.7),
        this.playerPos.z - 15 - Math.random() * 15
      );
      mesh.scale.set(0.08, 0.08, 4.2);
      this.particleGroup.add(mesh);

      const vel = new THREE.Vector3(0, 0, 54 + this.speed * 1.5);
      this.particles.push({
        mesh,
        velocity: vel,
        life: 0.35,
        maxLife: 0.35,
        isSharedGeo: true,
      });
    }
  }

  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particleGroup.remove(p.mesh);
        if (!p.isSharedGeo) {
          p.mesh.geometry.dispose();
          (p.mesh.material as THREE.Material).dispose();
        } else if (p.isRing) {
          (p.mesh.material as THREE.Material).dispose();
        }
        this.particles.splice(i, 1);
        continue;
      }

      if (p.isRing) {
        const progress = 1 - p.life / p.maxLife;
        const scale = THREE.MathUtils.lerp(0.3, 3.4, progress);
        p.mesh.scale.set(scale, scale, scale);
        const mat = p.mesh.material as THREE.MeshBasicMaterial;
        mat.opacity = Math.max(0, (p.life / p.maxLife) * 0.9);
        p.mesh.position.addScaledVector(p.velocity, dt);
      } else {
        if (p.drag) {
          p.velocity.multiplyScalar(Math.pow(p.drag, dt * 60));
        }
        if (p.gravity !== undefined) {
          p.velocity.y += p.gravity * dt;
        }
        p.mesh.position.addScaledVector(p.velocity, dt);

        if (p.rotVelocity) {
          p.mesh.rotation.x += p.rotVelocity.x * dt;
          p.mesh.rotation.y += p.rotVelocity.y * dt;
          p.mesh.rotation.z += p.rotVelocity.z * dt;
        }

        const scale = Math.max(0.001, p.life / p.maxLife);
        p.mesh.scale.set(scale, scale, scale);
      }
    }
  }

  public dispose() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('blur', this.handleBlur);
    window.removeEventListener('resize', this.onResize);
    sound.stopMusic();

    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);

    this.character.dispose();
    this.track.dispose();

    for (const p of this.particles) {
      this.particleGroup.remove(p.mesh);
      if (!p.isSharedGeo) {
        p.mesh.geometry.dispose();
        (p.mesh.material as THREE.Material).dispose();
      } else if (p.isRing) {
        (p.mesh.material as THREE.Material).dispose();
      }
    }
    this.particles = [];

    // Dispose pre-allocated particle assets
    this.pRingGeo?.dispose();
    this.pOctaGeo?.dispose();
    this.pBoxGeo?.dispose();
    this.pSphereGeo?.dispose();
    this.pPinkMat?.dispose();
    this.pRoseMat?.dispose();
    this.pBlushMat?.dispose();
    this.pWhiteMat?.dispose();
    this.pGoldMat?.dispose();
    this.pRingMat?.dispose();
    this.pDustMat?.dispose();

    this.renderer.dispose();
    if (this.container.contains(this.renderer.domElement)) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
