import * as THREE from 'three';
import { ObstacleType, PowerupType } from '../types';
import {
  createTrainSideTexture,
  createTrainFrontTexture,
  createWallTexture,
  createTrackTexture,
  createCoinTexture,
  createHazardTexture,
} from './textures';

export interface ObstacleInstance {
  type: ObstacleType;
  lane: number;
  z: number;
  mesh: THREE.Group;
  width: number;
  height: number;
  depth: number;
  hasRamp?: boolean;
  rampSlope?: number;
  isMoving?: boolean;
  moveSpeed?: number;
}

export interface CollectibleInstance {
  id: number;
  type: 'COIN' | PowerupType;
  lane: number;
  x: number;
  y: number;
  z: number;
  mesh: THREE.Object3D;
  collected: boolean;
}

export class TrackManager {
  public scene: THREE.Scene;
  public chunks: THREE.Group[] = [];
  public obstacles: ObstacleInstance[] = [];
  public collectibles: CollectibleInstance[] = [];

  // Track layout constants
  public static readonly LANE_WIDTH = 2.8;
  public static readonly CHUNK_LENGTH = 60;
  public static readonly ACTIVE_CHUNKS = 6;
  public static readonly LANES = [-2.8, 0, 2.8];

  private chunkCount: number = 0;
  private nextCollectibleId: number = 1;

  // Shared reusable materials & geometries
  private trackMaterial: THREE.MeshStandardMaterial;
  private wallMaterial: THREE.MeshStandardMaterial;
  private trainSideMaterial: THREE.MeshStandardMaterial;
  private trainFrontMaterial: THREE.MeshStandardMaterial;
  private trainRoofMaterial: THREE.MeshStandardMaterial;
  private trainChassisMaterial: THREE.MeshStandardMaterial;
  private hazardMaterial: THREE.MeshStandardMaterial;
  private coinMaterial: THREE.MeshStandardMaterial;
  private gantryMaterial: THREE.MeshStandardMaterial;
  private hurdleBarMaterial: THREE.MeshStandardMaterial;
  private hurdlePadMaterial: THREE.MeshStandardMaterial;
  private hurdleLegMaterial: THREE.MeshStandardMaterial;

  private coinGeometry: THREE.CylinderGeometry;

  constructor(scene: THREE.Scene) {
    this.scene = scene;

    const trackTex = createTrackTexture();
    trackTex.repeat.set(1, TrackManager.CHUNK_LENGTH / 8);
    this.trackMaterial = new THREE.MeshStandardMaterial({
      map: trackTex,
      roughness: 0.8,
      metalness: 0.1,
    });

    const wallTex = createWallTexture();
    wallTex.repeat.set(TrackManager.CHUNK_LENGTH / 15, 1);
    this.wallMaterial = new THREE.MeshStandardMaterial({
      map: wallTex,
      roughness: 0.85,
      metalness: 0.1,
    });

    // Crimson red stripe on silver steel trains (Subway Surfers signature style)
    this.trainSideMaterial = new THREE.MeshStandardMaterial({
      map: createTrainSideTexture('#dc2626'),
      roughness: 0.32,
      metalness: 0.65,
    });

    this.trainFrontMaterial = new THREE.MeshStandardMaterial({
      map: createTrainFrontTexture('#dc2626'),
      roughness: 0.35,
      metalness: 0.58,
    });

    this.trainRoofMaterial = new THREE.MeshStandardMaterial({
      color: 0xcbd5e1, // smooth silver metal roof
      roughness: 0.35,
      metalness: 0.5,
    });

    this.trainChassisMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.65,
      metalness: 0.75,
    });

    this.hazardMaterial = new THREE.MeshStandardMaterial({
      map: createHazardTexture(),
      roughness: 0.4,
      metalness: 0.2,
    });

    // Subway Surfers Red Hurdle with Round Bumper Studs
    this.hurdleBarMaterial = new THREE.MeshStandardMaterial({
      color: 0xdc2626, // Crimson red crossbar
      roughness: 0.35,
      metalness: 0.15,
    });

    this.hurdlePadMaterial = new THREE.MeshStandardMaterial({
      color: 0x18181b, // Dark round rubber bumper cap
      roughness: 0.7,
      metalness: 0.2,
    });

    this.hurdleLegMaterial = new THREE.MeshStandardMaterial({
      color: 0x475569, // Grey steel support stanchions
      roughness: 0.45,
      metalness: 0.55,
    });

    this.coinMaterial = new THREE.MeshStandardMaterial({
      map: createCoinTexture(),
      roughness: 0.2,
      metalness: 0.35,
      emissive: 0xf43f5e,
      emissiveIntensity: 0.35,
    });

    // Subway blue steel catenary truss gantries
    this.gantryMaterial = new THREE.MeshStandardMaterial({
      color: 0x1d4ed8,
      roughness: 0.45,
      metalness: 0.45,
    });

    // Cute Light Pink "T" Collectible Geometries & Materials
    this.coinGeometry = new THREE.CylinderGeometry(0.42, 0.42, 0.08, 24);
    this.initCuteTMaterials();
  }

  // Shared reusable geometries & materials for cute 3D "T" tokens
  private tBarGeo!: THREE.BoxGeometry;
  private tStemGeo!: THREE.BoxGeometry;
  private tGemGeo!: THREE.OctahedronGeometry;
  private tAuraGeo!: THREE.TorusGeometry;
  private tPinkMat!: THREE.MeshStandardMaterial;
  private tWhiteMat!: THREE.MeshStandardMaterial;
  private tRubyMat!: THREE.MeshStandardMaterial;
  private tGlowMat!: THREE.MeshBasicMaterial;

  private initCuteTMaterials() {
    this.tBarGeo = new THREE.BoxGeometry(0.52, 0.14, 0.14);
    this.tStemGeo = new THREE.BoxGeometry(0.16, 0.42, 0.14);
    this.tGemGeo = new THREE.OctahedronGeometry(0.09, 0);
    this.tAuraGeo = new THREE.TorusGeometry(0.52, 0.02, 8, 24);

    this.tPinkMat = new THREE.MeshStandardMaterial({
      color: 0xffb6c1,
      roughness: 0.2,
      metalness: 0.4,
      emissive: 0xf43f5e,
      emissiveIntensity: 0.45,
    });

    this.tWhiteMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.15,
      metalness: 0.25,
      emissive: 0xfce7f3,
      emissiveIntensity: 0.3,
    });

    this.tRubyMat = new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      roughness: 0.15,
      metalness: 0.5,
      emissive: 0xfb7185,
      emissiveIntensity: 0.65,
    });

    this.tGlowMat = new THREE.MeshBasicMaterial({
      color: 0xf472b6,
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide,
    });
  }

  public init() {
    this.clear();
    for (let i = 0; i < TrackManager.ACTIVE_CHUNKS; i++) {
      this.spawnChunk(i === 0);
    }
  }

  public clear() {
    for (const chunk of this.chunks) {
      this.scene.remove(chunk);
    }
    this.chunks = [];

    for (const obs of this.obstacles) {
      this.scene.remove(obs.mesh);
    }
    this.obstacles = [];

    for (const col of this.collectibles) {
      this.scene.remove(col.mesh);
    }
    this.collectibles = [];
    this.chunkCount = 0;
  }

  public spawnChunk(isSafeRunway: boolean = false) {
    const chunkZ = -this.chunkCount * TrackManager.CHUNK_LENGTH;
    const chunkGroup = new THREE.Group();
    chunkGroup.position.z = chunkZ;

    // 1. Ground Railroad Bed (3 tracks with ballast & ties)
    const groundGeo = new THREE.PlaneGeometry(10, TrackManager.CHUNK_LENGTH);
    const groundMesh = new THREE.Mesh(groundGeo, this.trackMaterial);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.set(0, 0, -TrackManager.CHUNK_LENGTH / 2);
    groundMesh.receiveShadow = true;
    chunkGroup.add(groundMesh);

    // 2. Concrete Subway Tunnel Walls
    const wallGeo = new THREE.PlaneGeometry(TrackManager.CHUNK_LENGTH, 6.5);

    const leftWall = new THREE.Mesh(wallGeo, this.wallMaterial);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-5.5, 3.25, -TrackManager.CHUNK_LENGTH / 2);
    chunkGroup.add(leftWall);

    const rightWall = new THREE.Mesh(wallGeo, this.wallMaterial);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.set(5.5, 3.25, -TrackManager.CHUNK_LENGTH / 2);
    chunkGroup.add(rightWall);

    // 3. Overhead Catenary Steel Gantries with Electric Signal Lights
    for (let zOffset = 10; zOffset < TrackManager.CHUNK_LENGTH; zOffset += 25) {
      const gantry = this.createGantry();
      gantry.position.set(0, 0, -zOffset);
      chunkGroup.add(gantry);
    }

    this.scene.add(chunkGroup);
    this.chunks.push(chunkGroup);

    if (!isSafeRunway) {
      this.generateChunkContent(chunkZ);
    }

    this.chunkCount++;
  }

  private createGantry(): THREE.Group {
    const gantry = new THREE.Group();

    // Steel truss pillars
    const pillarGeo = new THREE.CylinderGeometry(0.12, 0.14, 5.5, 8);
    const leftPillar = new THREE.Mesh(pillarGeo, this.gantryMaterial);
    leftPillar.position.set(-5.2, 2.75, 0);
    gantry.add(leftPillar);

    const rightPillar = leftPillar.clone();
    rightPillar.position.x = 5.2;
    gantry.add(rightPillar);

    // Overhead truss beam
    const beamGeo = new THREE.BoxGeometry(10.6, 0.25, 0.25);
    const beam = new THREE.Mesh(beamGeo, this.gantryMaterial);
    beam.position.set(0, 5.2, 0);
    gantry.add(beam);

    // Electric catenary insulator lines
    const wireGeo = new THREE.CylinderGeometry(0.015, 0.015, 10.6, 6);
    wireGeo.rotateZ(Math.PI / 2);
    const wire = new THREE.Mesh(wireGeo, new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 }));
    wire.position.set(0, 4.9, 0);
    gantry.add(wire);

    // Overhead Signal Lamps
    for (let i = 0; i < 3; i++) {
      const lightBox = new THREE.Mesh(
        new THREE.BoxGeometry(0.35, 0.7, 0.25),
        new THREE.MeshStandardMaterial({ color: 0x18181b })
      );
      lightBox.position.set(TrackManager.LANES[i], 4.7, 0);

      const lamp = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 8, 8),
        new THREE.MeshBasicMaterial({ color: i === 1 ? 0x22c55e : 0xef4444 })
      );
      lamp.position.z = 0.14;
      lightBox.add(lamp);
      gantry.add(lightBox);
    }

    return gantry;
  }

  private generateChunkContent(chunkStartZ: number) {
    const zones = [15, 42];

    zones.forEach((zoneOffset) => {
      const obstacleZ = chunkStartZ - zoneOffset;
      const patternChoice = Math.random();

      if (patternChoice < 0.4) {
        // Pattern A: Subway Train (either static or oncoming!)
        const trainLane = Math.floor(Math.random() * 3);
        const hasRamp = Math.random() > 0.4;
        const isMoving = Math.random() < 0.35; // 35% chance of moving oncoming train!
        this.spawnSubwayTrain(trainLane, obstacleZ, hasRamp, isMoving);

        if (hasRamp) {
          this.spawnCoinArcOnTrain(trainLane, obstacleZ);
        } else {
          const coinLane = (trainLane + 1) % 3;
          this.spawnCoinRow(coinLane, obstacleZ - 6, 6);
        }
      } else if (patternChoice < 0.7) {
        // Pattern B: Low hurdle + High hurdle
        const lane1 = Math.floor(Math.random() * 3);
        let lane2 = (lane1 + 1) % 3;
        if (Math.random() > 0.5) lane2 = (lane1 + 2) % 3;

        this.spawnBarrierLow(lane1, obstacleZ);
        this.spawnBarrierHigh(lane2, obstacleZ);
        this.spawnCoinJumpArc(lane1, obstacleZ);

        const freeLane = 3 - lane1 - lane2;
        if (Math.random() < 0.32) {
          this.spawnRandomPowerup(freeLane, obstacleZ);
        }
      } else if (patternChoice < 0.88) {
        // Pattern C: Double Subway Train (2 tracks occupied, 1 track safe, or ramp on 1)
        const freeLane = Math.floor(Math.random() * 3);
        for (let l = 0; l < 3; l++) {
          if (l !== freeLane) {
            const hasRamp = l === 1 || Math.random() > 0.5;
            this.spawnSubwayTrain(l, obstacleZ, hasRamp, false);
          }
        }
        this.spawnCoinRow(freeLane, obstacleZ - 6, 7);
      } else {
        // Pattern D: Track Signal Block Gate
        const lane = Math.floor(Math.random() * 3);
        this.spawnTrackGate(lane, obstacleZ);
        this.spawnCoinRow((lane + 1) % 3, obstacleZ - 5, 5);
      }
    });

    if (Math.random() < 0.3) {
      const pLane = Math.floor(Math.random() * 3);
      const pZ = chunkStartZ - (28 + Math.random() * 10);
      this.spawnRandomPowerup(pLane, pZ);
    }
  }

  // --- Real Modern Subway Passenger Train Model ---
  // Unmistakably a subway train (aerodynamic cab, dual bogies with steel wheels,
  // rooftop AC pods, pantograph electric pickup, passenger door yellow edge seals,
  // illuminated windows, high-beam headlights with forward light beams!)
  private spawnSubwayTrain(
    lane: number,
    z: number,
    hasRamp: boolean = false,
    isMoving: boolean = false
  ) {
    const trainGroup = new THREE.Group();
    const laneX = TrackManager.LANES[lane];
    trainGroup.position.set(laneX, 0, z);

    const trainLen = 15;
    const trainH = 2.85;
    const trainW = 2.45;

    // 1. Train Main Body
    const trainMaterials = [
      this.trainSideMaterial, // +X right passenger side
      this.trainSideMaterial, // -X left passenger side
      this.trainRoofMaterial, // +Y roof
      this.trainChassisMaterial, // -Y underside
      this.trainFrontMaterial, // +Z front cab (facing runner!)
      this.trainFrontMaterial, // -Z rear cab
    ];

    const bodyGeo = new THREE.BoxGeometry(trainW, trainH - 0.55, trainLen);
    const bodyMesh = new THREE.Mesh(bodyGeo, trainMaterials);
    bodyMesh.position.y = (trainH - 0.55) / 2 + 0.55;
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    trainGroup.add(bodyMesh);

    // 2. Aerodynamic Sloped Front Cab Nose (+Z)
    // Front wedge that slopes forward so it doesn't look like a blunt container
    const cabNoseGeo = new THREE.BoxGeometry(trainW, 0.9, 1.2);
    const cabNose = new THREE.Mesh(cabNoseGeo, this.trainFrontMaterial);
    cabNose.position.set(0, 0.95, trainLen / 2 + 0.5);
    trainGroup.add(cabNose);

    // Heavy anti-climber front cowcatcher / bumper
    const bumperGeo = new THREE.BoxGeometry(trainW + 0.1, 0.45, 0.8);
    const bumper = new THREE.Mesh(
      bumperGeo,
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8, metalness: 0.9 })
    );
    bumper.position.set(0, 0.35, trainLen / 2 + 0.6);
    trainGroup.add(bumper);

    // High-Beam Headlight Beams (Glowing translucent light cones extending down track!)
    const beamGeo = new THREE.ConeGeometry(0.85, 9.0, 16, 1, true);
    beamGeo.rotateX(-Math.PI / 2);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const leftBeam = new THREE.Mesh(beamGeo, beamMat);
    leftBeam.position.set(-0.75, 1.35, trainLen / 2 + 4.8);
    trainGroup.add(leftBeam);

    const rightBeam = leftBeam.clone();
    rightBeam.position.x = 0.75;
    trainGroup.add(rightBeam);

    // 3. Rooftop Air Conditioning Condenser Pods (AC Units)
    [-3.8, 1.5].forEach((acZ) => {
      const acGeo = new THREE.BoxGeometry(1.6, 0.28, 2.4);
      const acMesh = new THREE.Mesh(
        acGeo,
        new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6, metalness: 0.4 })
      );
      acMesh.position.set(0, trainH + 0.14, acZ);
      acMesh.castShadow = true;
      trainGroup.add(acMesh);

      // Radiator fans on top
      [-0.45, 0.45].forEach((fanX) => {
        const fan = new THREE.Mesh(
          new THREE.CylinderGeometry(0.3, 0.3, 0.04, 12),
          new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 })
        );
        fan.position.set(fanX, trainH + 0.3, acZ);
        trainGroup.add(fan);
      });
    });

    // 4. Scissor Diamond Pantograph (Electrical current collector on roof)
    const pantographGroup = new THREE.Group();
    pantographGroup.position.set(0, trainH, -1.2);
    const armMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.8, roughness: 0.3 });

    const pBase = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 0.8), armMat);
    pantographGroup.add(pBase);

    const pArmGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.9, 6);
    pArmGeo.rotateX(0.5);
    const pArmL = new THREE.Mesh(pArmGeo, armMat);
    pArmL.position.set(-0.4, 0.4, 0);
    pantographGroup.add(pArmL);

    const pArmR = pArmL.clone();
    pArmR.position.x = 0.4;
    pantographGroup.add(pArmR);

    // Collector head touching overhead wires
    const pHead = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.04, 0.14), armMat);
    pHead.position.set(0, 0.8, 0.2);
    pantographGroup.add(pHead);
    trainGroup.add(pantographGroup);

    // 5. Dual-Axle Subway Wheel Bogies (Front & Rear)
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.95, roughness: 0.2 });
    const wheelGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.16, 16);
    wheelGeo.rotateZ(Math.PI / 2);

    [-4.8, 4.8].forEach((bogieZ) => {
      // Bogie side frame
      const frameGeo = new THREE.BoxGeometry(2.4, 0.18, 2.2);
      const frame = new THREE.Mesh(frameGeo, this.trainChassisMaterial);
      frame.position.set(0, 0.4, bogieZ);
      trainGroup.add(frame);

      // 4 flanged steel wheels per bogie
      [-0.8, 0.8].forEach((wzOffset) => {
        [-1.15, 1.15].forEach((wx) => {
          const wheel = new THREE.Mesh(wheelGeo, wheelMat);
          wheel.position.set(wx, 0.38, bogieZ + wzOffset);
          trainGroup.add(wheel);
        });
      });
    });

    // 6. Skateboard / Maintenance Ramp at Front (Ride up to train roof!)
    if (hasRamp) {
      const rampLen = 5.6;
      const rampGeo = new THREE.BoxGeometry(trainW, 0.16, rampLen);
      const rampMat = new THREE.MeshStandardMaterial({
        color: 0xd97706,
        roughness: 0.35,
        metalness: 0.65,
      });
      const rampMesh = new THREE.Mesh(rampGeo, rampMat);

      const rampAngle = Math.atan2(trainH, rampLen);
      rampMesh.rotation.x = -rampAngle;
      rampMesh.position.set(0, trainH / 2, trainLen / 2 + rampLen / 2 - 0.1);
      rampMesh.castShadow = true;
      rampMesh.receiveShadow = true;
      trainGroup.add(rampMesh);

      // Yellow/Black striped caution side guard rails
      const railGeo = new THREE.CylinderGeometry(0.045, 0.045, rampLen, 8);
      railGeo.rotateX(Math.PI / 2);
      const leftRail = new THREE.Mesh(railGeo, this.hazardMaterial);
      leftRail.position.set(-trainW / 2 + 0.1, trainH / 2 + 0.25, trainLen / 2 + rampLen / 2);
      leftRail.rotation.x = -rampAngle;
      trainGroup.add(leftRail);

      const rightRail = leftRail.clone();
      rightRail.position.x = trainW / 2 - 0.1;
      trainGroup.add(rightRail);
    }

    this.scene.add(trainGroup);

    this.obstacles.push({
      type: hasRamp ? 'TRAIN_RAMP' : 'TRAIN',
      lane,
      z,
      mesh: trainGroup,
      width: trainW,
      height: trainH,
      depth: trainLen,
      hasRamp,
      rampSlope: hasRamp ? trainH / 5.6 : undefined,
      isMoving,
      moveSpeed: isMoving ? 12 : 0, // oncoming train speed
    });
  }

  // Low Hurdle (Subway Surfers red obstacle with black bumper studs: Jump over or slide under!)
  private spawnBarrierLow(lane: number, z: number) {
    const group = new THREE.Group();
    const laneX = TrackManager.LANES[lane];
    group.position.set(laneX, 0, z);

    // Main Crimson Red Hurdle Crossbar
    const barGeo = new THREE.BoxGeometry(2.15, 0.38, 0.24);
    const bar = new THREE.Mesh(barGeo, this.hurdleBarMaterial);
    bar.position.set(0, 0.94, 0);
    bar.castShadow = true;
    group.add(bar);

    // Two Signature Dark Round Rubber Bumper Studs on the front face (from reference artwork)
    const bumperGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.1, 16);
    bumperGeo.rotateX(Math.PI / 2);

    const leftBumper = new THREE.Mesh(bumperGeo, this.hurdlePadMaterial);
    leftBumper.position.set(-0.6, 0.94, 0.13);
    leftBumper.castShadow = true;
    group.add(leftBumper);

    const rightBumper = leftBumper.clone();
    rightBumper.position.x = 0.6;
    group.add(rightBumper);

    // Sturdy Steel A-Frame Stanchions & Base Brackets
    const stanchionGeo = new THREE.BoxGeometry(0.12, 0.95, 0.14);
    const leftStanchion = new THREE.Mesh(stanchionGeo, this.hurdleLegMaterial);
    leftStanchion.position.set(-0.65, 0.47, 0);
    leftStanchion.castShadow = true;
    group.add(leftStanchion);

    const rightStanchion = leftStanchion.clone();
    rightStanchion.position.x = 0.65;
    group.add(rightStanchion);

    // Outer support legs
    const outerLegGeo = new THREE.BoxGeometry(0.1, 0.95, 0.12);
    const leftOuterLeg = new THREE.Mesh(outerLegGeo, this.hurdleLegMaterial);
    leftOuterLeg.position.set(-0.95, 0.47, 0);
    group.add(leftOuterLeg);

    const rightOuterLeg = leftOuterLeg.clone();
    rightOuterLeg.position.x = 0.95;
    group.add(rightOuterLeg);

    // Bottom Base Plates on ties
    const footGeo = new THREE.BoxGeometry(0.24, 0.08, 0.5);
    const leftFoot = new THREE.Mesh(footGeo, this.hurdleLegMaterial);
    leftFoot.position.set(-0.65, 0.04, 0);
    group.add(leftFoot);

    const rightFoot = leftFoot.clone();
    rightFoot.position.x = 0.65;
    group.add(rightFoot);

    this.scene.add(group);

    this.obstacles.push({
      type: 'BARRIER_LOW',
      lane,
      z,
      mesh: group,
      width: 2.2,
      height: 1.15,
      depth: 0.6,
    });
  }

  // High Barrier (Overhead Track Signal: Must slide under!)
  private spawnBarrierHigh(lane: number, z: number) {
    const group = new THREE.Group();
    const laneX = TrackManager.LANES[lane];
    group.position.set(laneX, 0, z);

    const postGeo = new THREE.CylinderGeometry(0.1, 0.1, 2.8, 8);
    const leftPost = new THREE.Mesh(postGeo, this.gantryMaterial);
    leftPost.position.set(-1.15, 1.4, 0);
    group.add(leftPost);

    const rightPost = leftPost.clone();
    rightPost.position.x = 1.15;
    group.add(rightPost);

    const boardGeo = new THREE.BoxGeometry(2.4, 1.4, 0.2);
    const board = new THREE.Mesh(boardGeo, this.hazardMaterial);
    board.position.set(0, 2.0, 0);
    board.castShadow = true;
    group.add(board);

    this.scene.add(group);

    this.obstacles.push({
      type: 'BARRIER_HIGH',
      lane,
      z,
      mesh: group,
      width: 2.3,
      height: 2.8,
      depth: 0.6,
    });
  }

  // Track Gate with Flashing Warning Signal
  private spawnTrackGate(lane: number, z: number) {
    const group = new THREE.Group();
    const laneX = TrackManager.LANES[lane];
    group.position.set(laneX, 0, z);

    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.14, 2.2, 8),
      this.gantryMaterial
    );
    post.position.set(0, 1.1, 0);
    group.add(post);

    const sign = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.8, 0.15),
      this.hazardMaterial
    );
    sign.position.set(0, 1.8, 0);
    group.add(sign);

    const redLight = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xef4444 })
    );
    redLight.position.set(0, 2.35, 0);
    group.add(redLight);

    this.scene.add(group);

    this.obstacles.push({
      type: 'TRACK_GATE',
      lane,
      z,
      mesh: group,
      width: 1.8,
      height: 2.4,
      depth: 0.6,
    });
  }

  // --- Collectibles ---

  public spawnCoin(lane: number, x: number, y: number, z: number) {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    // 1. Pastel pink round token medallion backing with cute "T" texture
    const discMesh = new THREE.Mesh(this.coinGeometry, this.coinMaterial);
    discMesh.rotation.x = Math.PI / 2;
    discMesh.castShadow = true;
    group.add(discMesh);

    // 2. Chunky 3D Sculpted "T" Letter protruding on both front (+Z) and back (-Z)
    [-0.05, 0.05].forEach((zFace) => {
      // Horizontal crossbar of "T"
      const bar = new THREE.Mesh(this.tBarGeo, this.tWhiteMat);
      bar.position.set(0, 0.16, zFace);
      group.add(bar);

      // Vertical stem of "T"
      const stem = new THREE.Mesh(this.tStemGeo, this.tWhiteMat);
      stem.position.set(0, -0.06, zFace);
      group.add(stem);

      // Cute Little Sparkle Gem / Heart at top-right corner of "T"
      const gem = new THREE.Mesh(this.tGemGeo, this.tRubyMat);
      gem.position.set(0.24, 0.25, zFace);
      gem.rotation.z = Math.PI / 4;
      group.add(gem);
    });

    // 3. Cute translucent glowing halo ring circling the "T"
    const aura = new THREE.Mesh(this.tAuraGeo, this.tGlowMat);
    group.add(aura);

    this.scene.add(group);

    this.collectibles.push({
      id: this.nextCollectibleId++,
      type: 'COIN',
      lane,
      x,
      y,
      z,
      mesh: group,
      collected: false,
    });
  }

  public spawnCoinRow(lane: number, startZ: number, count: number = 5, y: number = 0.8) {
    const laneX = TrackManager.LANES[lane];
    for (let i = 0; i < count; i++) {
      this.spawnCoin(lane, laneX, y, startZ - i * 2.2);
    }
  }

  public spawnCoinJumpArc(lane: number, obstacleZ: number) {
    const laneX = TrackManager.LANES[lane];
    const steps = 7;
    for (let i = 0; i < steps; i++) {
      const t = (i / (steps - 1)) * 2 - 1;
      const y = 0.8 + (1 - t * t) * 2.2;
      const z = obstacleZ + 5 - i * 1.6;
      this.spawnCoin(lane, laneX, y, z);
    }
  }

  public spawnCoinArcOnTrain(lane: number, trainZ: number) {
    const laneX = TrackManager.LANES[lane];
    for (let i = 0; i < 8; i++) {
      const z = trainZ + 5 - i * 2.0;
      const y = 3.65;
      this.spawnCoin(lane, laneX, y, z);
    }
  }

  private spawnRandomPowerup(lane: number, z: number) {
    const laneX = TrackManager.LANES[lane];
    const types: PowerupType[] = ['MAGNET', 'SNEAKERS', 'JETPACK', 'HOVERBOARD', 'MULTIPLIER'];
    const type = types[Math.floor(Math.random() * types.length)];

    const group = new THREE.Group();
    group.position.set(laneX, 1.2, z);

    const orbMat = new THREE.MeshStandardMaterial({
      color:
        type === 'MAGNET'
          ? 0xef4444
          : type === 'SNEAKERS'
          ? 0x22c55e
          : type === 'JETPACK'
          ? 0xf59e0b
          : type === 'HOVERBOARD'
          ? 0x38bdf8
          : 0xa855f7,
      metalness: 0.8,
      roughness: 0.2,
      emissive:
        type === 'MAGNET'
          ? 0x7f1d1d
          : type === 'SNEAKERS'
          ? 0x14532d
          : type === 'JETPACK'
          ? 0x78350f
          : type === 'HOVERBOARD'
          ? 0x0369a1
          : 0x581c87,
    });

    const orb = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.7), orbMat);
    group.add(orb);

    const symbolMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const symbol = new THREE.Mesh(new THREE.OctahedronGeometry(0.35), symbolMat);
    group.add(symbol);

    this.scene.add(group);

    this.collectibles.push({
      id: this.nextCollectibleId++,
      type,
      lane,
      x: laneX,
      y: 1.2,
      z,
      mesh: group,
      collected: false,
    });
  }

  // 60FPS Track Update & Moving Oncoming Trains
  public update(playerZ: number, dt: number, hasMagnet: boolean, playerPos: THREE.Vector3) {
    // 1. Update moving oncoming trains
    for (const obs of this.obstacles) {
      if (obs.isMoving && obs.moveSpeed) {
        // Train moves towards player (+Z direction)
        obs.z += obs.moveSpeed * dt;
        obs.mesh.position.z = obs.z;
      }
    }

    // 2. Lovely animation choreography for cute "T" letter coins & powerups
    const t = performance.now() * 0.003;
    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const col = this.collectibles[i];
      if (col.collected) {
        this.scene.remove(col.mesh);
        this.collectibles.splice(i, 1);
        continue;
      }

      if (col.type === 'COIN') {
        // 1. Continuous smooth 360° spin
        col.mesh.rotation.y += dt * 3.6;

        // 2. Cute rhythmic vertical bobbing (floating fairy wave)
        const floatY = Math.sin(t * 4.8 + col.id * 0.75) * 0.14;
        col.mesh.position.y = col.y + floatY;

        // 3. Adorable jelly tilt / playful wobble on X and Z
        col.mesh.rotation.z = Math.sin(t * 3.8 + col.id) * 0.12;
        col.mesh.rotation.x = Math.cos(t * 2.6 + col.id) * 0.08;

        // 4. Heartbeat breathing scale pulse
        const pulse = 1.0 + Math.sin(t * 5.4 + col.id * 1.1) * 0.08;
        col.mesh.scale.set(pulse, pulse, pulse);

        if (hasMagnet) {
          const dist = col.mesh.position.distanceTo(playerPos);
          if (dist < 18) {
            col.mesh.position.lerp(playerPos, dt * 14);
          }
        }
      } else {
        col.mesh.rotation.y += dt * 2.5;
        col.mesh.rotation.x = Math.sin(t) * 0.2;
        col.mesh.position.y = col.y + Math.sin(t * 2) * 0.15;
      }
    }

    // 3. Recycle passed chunks
    const firstChunk = this.chunks[0];
    if (firstChunk && playerZ < firstChunk.position.z - TrackManager.CHUNK_LENGTH - 10) {
      this.scene.remove(firstChunk);
      this.chunks.shift();

      for (let i = this.obstacles.length - 1; i >= 0; i--) {
        const obs = this.obstacles[i];
        if (obs.z > playerZ + 25) {
          this.scene.remove(obs.mesh);
          this.obstacles.splice(i, 1);
        }
      }

      for (let i = this.collectibles.length - 1; i >= 0; i--) {
        const col = this.collectibles[i];
        if (col.z > playerZ + 25) {
          this.scene.remove(col.mesh);
          this.collectibles.splice(i, 1);
        }
      }

      this.spawnChunk(false);
    }
  }

  public dispose() {
    this.clear();
    this.trackMaterial.dispose();
    this.wallMaterial.dispose();
    this.trainSideMaterial.dispose();
    this.trainFrontMaterial.dispose();
    this.trainRoofMaterial.dispose();
    this.trainChassisMaterial.dispose();
    this.hazardMaterial.dispose();
    this.coinMaterial.dispose();
    this.gantryMaterial.dispose();
    this.coinGeometry.dispose();
    this.tBarGeo.dispose();
    this.tStemGeo.dispose();
    this.tGemGeo.dispose();
    this.tAuraGeo.dispose();
    this.tPinkMat.dispose();
    this.tWhiteMat.dispose();
    this.tRubyMat.dispose();
    this.tGlowMat.dispose();
  }
}
