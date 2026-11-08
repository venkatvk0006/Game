import * as THREE from 'three';
import { RunnerCustomization, Hairstyle, ShirtStyle, BottomsStyle, EyewearStyle } from '../types';
import { createRunnerFaceTexture, createPlaidShirtTexture, createVenkatBadgeTexture } from './textures';

export class CharacterModel {
  public group: THREE.Group;

  // Body parts hierarchy
  public headGroup!: THREE.Group;
  public headMesh!: THREE.Mesh;
  public hairGroup!: THREE.Group;
  public eyewearGroup!: THREE.Group;
  public neckMesh!: THREE.Mesh;
  public torsoGroup!: THREE.Group;
  public chestMesh!: THREE.Mesh;
  public abdomenMesh!: THREE.Mesh;
  public leftArmGroup!: THREE.Group;
  public rightArmGroup!: THREE.Group;
  public leftForearmGroup!: THREE.Group;
  public rightForearmGroup!: THREE.Group;
  public watchMesh!: THREE.Mesh;
  public pelvisGroup!: THREE.Group;
  public leftLegGroup!: THREE.Group;
  public rightLegGroup!: THREE.Group;
  public leftShinGroup!: THREE.Group;
  public rightShinGroup!: THREE.Group;
  public leftShoeMesh!: THREE.Group;
  public rightShoeMesh!: THREE.Group;
  public hydrationPackGroup!: THREE.Group;
  public hoverboardGroup!: THREE.Group;

  // Materials
  private faceMaterial!: THREE.MeshStandardMaterial;
  private skinMaterial!: THREE.MeshStandardMaterial;
  private hairMaterial!: THREE.MeshStandardMaterial;
  private shirtMaterial!: THREE.MeshStandardMaterial;
  private shirtAccentMaterial!: THREE.MeshStandardMaterial;
  private bottomsMaterial!: THREE.MeshStandardMaterial;
  private shoeUpperMaterial!: THREE.MeshStandardMaterial;
  private shoeSoleMaterial!: THREE.MeshStandardMaterial;
  private shoeAccentMaterial!: THREE.MeshStandardMaterial;
  private eyewearMaterial!: THREE.MeshStandardMaterial;
  private boardMaterial!: THREE.MeshStandardMaterial;
  private boardGlowMaterial!: THREE.MeshBasicMaterial;

  // Animation variables
  private runCycleTime: number = 0;
  public isHoverboardActive: boolean = false;
  public isJetpackActive: boolean = false;
  public isSliding: boolean = false;
  public isJumping: boolean = false;
  public isCrashing: boolean = false;

  private currentFaceTexture: THREE.CanvasTexture | null = null;
  private currentConfig: RunnerCustomization;

  constructor(customization: RunnerCustomization) {
    this.currentConfig = customization;
    this.group = new THREE.Group();
    this.initMaterials(customization);
    this.buildRig(customization);
  }

  private initMaterials(cfg: RunnerCustomization) {
    const { texture } = createRunnerFaceTexture(cfg);
    this.currentFaceTexture = texture;

    const skinColor = new THREE.Color(cfg.skinTone || '#d4a373');

    // Face front material with custom photo/face projection
    this.faceMaterial = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.45,
      metalness: 0.05,
    });

    // Realistic anatomical skin material
    this.skinMaterial = new THREE.MeshStandardMaterial({
      color: skinColor,
      roughness: 0.45,
      metalness: 0.05,
    });

    // Hair material
    this.hairMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(cfg.hairColor || '#1c1917'),
      roughness: 0.8,
      metalness: 0.1,
    });

    // Shirt & clothing materials
    const shirtCol = cfg.shirtColor || cfg.hoodieColor || '#3b82f6';
    const isPlaid = shirtCol === '#3b82f6' || cfg.avatarName?.includes('Venkat');
    this.shirtMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(shirtCol),
      map: isPlaid ? createPlaidShirtTexture() : null,
      roughness: 0.6,
      metalness: 0.1,
    });

    this.shirtAccentMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(cfg.shirtAccentColor || '#93c5fd'),
      roughness: 0.5,
      metalness: 0.2,
    });

    // Bottoms (running shorts/track pants/tights)
    const bottomsCol = cfg.bottomsColor || cfg.pantsColor || '#1e293b';
    this.bottomsMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(bottomsCol),
      roughness: 0.65,
      metalness: 0.1,
    });

    // High performance running sneakers
    this.shoeUpperMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(cfg.shoePrimaryColor || '#f97316'),
      roughness: 0.4,
      metalness: 0.15,
    });

    this.shoeSoleMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#ffffff'), // High-stack foam midsole
      roughness: 0.35,
      metalness: 0.05,
    });

    this.shoeAccentMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(cfg.shoeAccentColor || '#06b6d4'),
      roughness: 0.3,
      metalness: 0.3,
    });

    // Eyewear
    this.eyewearMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(cfg.eyewearColor || '#0f172a'),
      roughness: 0.2,
      metalness: 0.8,
    });

    // Hoverboard
    this.boardMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(cfg.boardColor || '#f59e0b'),
      roughness: 0.2,
      metalness: 0.85,
    });

    this.boardGlowMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#38bdf8'),
    });
  }

  public updateCustomization(cfg: RunnerCustomization) {
    this.currentConfig = cfg;

    if (this.currentFaceTexture) {
      this.currentFaceTexture.dispose();
    }
    const { texture } = createRunnerFaceTexture(cfg, () => {
      this.faceMaterial.needsUpdate = true;
    });
    this.currentFaceTexture = texture;
    this.faceMaterial.map = texture;
    this.faceMaterial.needsUpdate = true;

    const skin = new THREE.Color(cfg.skinTone || '#d4a373');
    this.skinMaterial.color.copy(skin);
    this.hairMaterial.color.set(cfg.hairColor || '#1c1917');

    const shirtCol = cfg.shirtColor || cfg.hoodieColor || '#2563eb';
    this.shirtMaterial.color.set(shirtCol);
    this.shirtAccentMaterial.color.set(cfg.shirtAccentColor || '#38bdf8');

    const bottomsCol = cfg.bottomsColor || cfg.pantsColor || '#1e293b';
    this.bottomsMaterial.color.set(bottomsCol);

    this.shoeUpperMaterial.color.set(cfg.shoePrimaryColor || '#f97316');
    this.shoeAccentMaterial.color.set(cfg.shoeAccentColor || '#06b6d4');
    this.eyewearMaterial.color.set(cfg.eyewearColor || '#0f172a');
    this.boardMaterial.color.set(cfg.boardColor || '#f59e0b');

    // Rebuild hair & eyewear if changed
    this.rebuildHairAndAccessories(cfg);
  }

  private buildRig(cfg: RunnerCustomization) {
    // Athletic realistic male height ~1.82m tall, centered at origin Y = 0

    // 1. Pelvis / Hips
    this.pelvisGroup = new THREE.Group();
    this.pelvisGroup.position.set(0, 0.95, 0);

    const pelvisGeo = new THREE.CylinderGeometry(0.24, 0.22, 0.22, 12);
    const pelvisMesh = new THREE.Mesh(pelvisGeo, this.bottomsMaterial);
    pelvisMesh.castShadow = true;
    this.pelvisGroup.add(pelvisMesh);
    this.group.add(this.pelvisGroup);

    // 2. Torso (Abdomen + Chest with athletic muscular taper)
    this.torsoGroup = new THREE.Group();
    this.torsoGroup.position.set(0, 0.12, 0);

    // Abdomen / waist
    const abGeo = new THREE.CylinderGeometry(0.25, 0.22, 0.26, 12);
    this.abdomenMesh = new THREE.Mesh(
      abGeo,
      cfg.shirtStyle === 'SHIRTLESS' ? this.skinMaterial : this.shirtMaterial
    );
    this.abdomenMesh.position.y = 0.13;
    this.abdomenMesh.castShadow = true;
    this.torsoGroup.add(this.abdomenMesh);

    // Muscular chest & broad athletic shoulders
    const chestGeo = new THREE.BoxGeometry(0.56, 0.36, 0.32);
    this.chestMesh = new THREE.Mesh(
      chestGeo,
      cfg.shirtStyle === 'SHIRTLESS' ? this.skinMaterial : this.shirtMaterial
    );
    this.chestMesh.position.y = 0.38;
    this.chestMesh.castShadow = true;
    this.torsoGroup.add(this.chestMesh);

    // Athletic chest accents & Venkat subway runner badge
    if (cfg.shirtStyle !== 'SHIRTLESS') {
      // White & blue name badge on front chest
      const isVenkat = cfg.avatarName?.includes('Venkat') || !cfg.avatarName;
      const badgeMat = new THREE.MeshStandardMaterial({
        map: createVenkatBadgeTexture(isVenkat ? 'VENKAT' : cfg.avatarName.split(' ')[0]),
        roughness: 0.3,
        metalness: 0.1,
      });
      const badgeMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.08), badgeMat);
      badgeMesh.position.set(-0.11, 0.44, -0.165);
      badgeMesh.rotation.y = Math.PI; // faces camera/front
      this.torsoGroup.add(badgeMesh);

      // Black backpack straps over both shoulders
      const strapMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
      [-0.14, 0.14].forEach((sx) => {
        const strap = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.38, 0.33), strapMat);
        strap.position.set(sx, 0.38, 0);
        this.torsoGroup.add(strap);
      });
    }

    // 3. Neck
    const neckGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.16, 10);
    this.neckMesh = new THREE.Mesh(neckGeo, this.skinMaterial);
    this.neckMesh.position.set(0, 0.58, 0.02);
    this.neckMesh.castShadow = true;
    this.torsoGroup.add(this.neckMesh);

    // 4. Realistic Male Head
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.76, 0.02);

    // Sculpted Head Multi-material (Front is custom photo / face features)
    const headMaterials = [
      this.skinMaterial, // +X right
      this.skinMaterial, // -X left
      this.hairMaterial, // +Y top (hair)
      this.skinMaterial, // -Y underside
      this.hairMaterial, // +Z back (hair)
      this.faceMaterial, // -Z FRONT (faces track/camera)
    ];

    const headGeo = new THREE.BoxGeometry(0.36, 0.44, 0.38);
    this.headMesh = new THREE.Mesh(headGeo, headMaterials);
    this.headMesh.castShadow = true;
    this.headGroup.add(this.headMesh);

    // Realistic jaw & chin taper
    const jawGeo = new THREE.CylinderGeometry(0.16, 0.11, 0.16, 8);
    const jawMesh = new THREE.Mesh(jawGeo, this.skinMaterial);
    jawMesh.position.set(0, -0.16, -0.04);
    this.headMesh.add(jawMesh);

    // Ears
    const earGeo = new THREE.BoxGeometry(0.04, 0.12, 0.08);
    const leftEar = new THREE.Mesh(earGeo, this.skinMaterial);
    leftEar.position.set(-0.19, 0, 0);
    const rightEar = leftEar.clone();
    rightEar.position.x = 0.19;
    this.headGroup.add(leftEar);
    this.headGroup.add(rightEar);

    // Hairstyles & Eyewear Group
    this.hairGroup = new THREE.Group();
    this.headGroup.add(this.hairGroup);

    this.eyewearGroup = new THREE.Group();
    this.headGroup.add(this.eyewearGroup);

    this.torsoGroup.add(this.headGroup);
    this.pelvisGroup.add(this.torsoGroup);

    // 5. Left Arm
    this.leftArmGroup = new THREE.Group();
    this.leftArmGroup.position.set(-0.35, 0.46, 0);

    const shoulderGeo = new THREE.SphereGeometry(0.12, 12, 12);
    const leftShoulder = new THREE.Mesh(
      shoulderGeo,
      cfg.shirtStyle === 'TANK_TOP' || cfg.shirtStyle === 'SHIRTLESS'
        ? this.skinMaterial
        : this.shirtMaterial
    );
    this.leftArmGroup.add(leftShoulder);

    const bicepGeo = new THREE.CylinderGeometry(0.1, 0.09, 0.32, 10);
    const leftBicep = new THREE.Mesh(
      bicepGeo,
      cfg.shirtStyle === 'TANK_TOP' || cfg.shirtStyle === 'SHIRTLESS'
        ? this.skinMaterial
        : this.shirtMaterial
    );
    leftBicep.position.y = -0.16;
    leftBicep.castShadow = true;
    this.leftArmGroup.add(leftBicep);

    // Left Forearm
    this.leftForearmGroup = new THREE.Group();
    this.leftForearmGroup.position.set(0, -0.32, 0);
    const forearmGeo = new THREE.CylinderGeometry(0.085, 0.07, 0.32, 10);
    const leftForearm = new THREE.Mesh(forearmGeo, this.skinMaterial);
    leftForearm.position.y = -0.16;
    leftForearm.castShadow = true;
    this.leftForearmGroup.add(leftForearm);

    // Sports Smartwatch on left wrist (glowing AMOLED sport display)
    const watchHousing = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.06, 0.12),
      new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.8, roughness: 0.2 })
    );
    watchHousing.position.set(0, -0.28, 0);
    const watchScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.06, 0.08),
      new THREE.MeshBasicMaterial({ color: 0x06b6d4 })
    );
    watchScreen.rotation.x = -Math.PI / 2;
    watchScreen.position.set(0, 0.035, 0);
    watchHousing.add(watchScreen);
    this.leftForearmGroup.add(watchHousing);

    // Hand (sprint relaxed fist)
    const handGeo = new THREE.BoxGeometry(0.08, 0.11, 0.08);
    const leftHand = new THREE.Mesh(handGeo, this.skinMaterial);
    leftHand.position.set(0, -0.36, 0);
    this.leftForearmGroup.add(leftHand);

    this.leftArmGroup.add(this.leftForearmGroup);
    this.torsoGroup.add(this.leftArmGroup);

    // 6. Right Arm
    this.rightArmGroup = new THREE.Group();
    this.rightArmGroup.position.set(0.35, 0.46, 0);

    const rightShoulder = leftShoulder.clone();
    this.rightArmGroup.add(rightShoulder);

    const rightBicep = leftBicep.clone();
    this.rightArmGroup.add(rightBicep);

    this.rightForearmGroup = new THREE.Group();
    this.rightForearmGroup.position.set(0, -0.32, 0);
    const rightForearm = leftForearm.clone();
    this.rightForearmGroup.add(rightForearm);

    const rightHand = leftHand.clone();
    this.rightForearmGroup.add(rightHand);

    // Iconic Subway Runner Spray Paint Can in Hand
    const sprayCanGroup = new THREE.Group();
    sprayCanGroup.position.set(0, -0.06, 0.08);
    sprayCanGroup.rotation.x = 0.4;

    const canBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.14, 12),
      new THREE.MeshStandardMaterial({
        color: 0xec4899, // Vibrant pink / graffiti magenta
        roughness: 0.3,
        metalness: 0.6,
      })
    );
    sprayCanGroup.add(canBody);

    const canCap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.038, 0.04, 0.02, 12),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.1 })
    );
    canCap.position.y = 0.08;
    sprayCanGroup.add(canCap);

    const nozzle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.025, 8),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 })
    );
    nozzle.position.set(0, 0.095, 0.01);
    sprayCanGroup.add(nozzle);

    rightHand.add(sprayCanGroup);

    this.rightArmGroup.add(this.rightForearmGroup);
    this.torsoGroup.add(this.rightArmGroup);

    // 7. Hydration / Dual Sprayer Pack on Back (+Z)
    this.hydrationPackGroup = new THREE.Group();
    this.hydrationPackGroup.position.set(0, 0.32, 0.18);
    const packBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.42, 0.14),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7, metalness: 0.2 })
    );
    this.hydrationPackGroup.add(packBody);

    // Dual anodized jet canisters
    const canL = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.08, 0.36, 12),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.9, roughness: 0.15 })
    );
    canL.position.set(-0.12, 0, 0.06);
    const canR = canL.clone();
    canR.position.x = 0.12;
    this.hydrationPackGroup.add(canL);
    this.hydrationPackGroup.add(canR);

    this.torsoGroup.add(this.hydrationPackGroup);

    // 8. Left Leg
    this.leftLegGroup = new THREE.Group();
    this.leftLegGroup.position.set(-0.16, -0.05, 0);

    const thighGeo = new THREE.CylinderGeometry(0.12, 0.09, 0.46, 10);
    const isShorts = cfg.bottomsStyle === 'RUNNING_SHORTS';
    const leftThigh = new THREE.Mesh(
      thighGeo,
      isShorts ? this.skinMaterial : this.bottomsMaterial
    );
    leftThigh.position.y = -0.23;
    leftThigh.castShadow = true;
    this.leftLegGroup.add(leftThigh);

    // Athletic Running Shorts sleeve over thigh
    if (isShorts) {
      const shortsLeg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.13, 0.26, 10),
        this.bottomsMaterial
      );
      shortsLeg.position.y = -0.13;
      this.leftLegGroup.add(shortsLeg);
    }

    // Shin / Calf
    this.leftShinGroup = new THREE.Group();
    this.leftShinGroup.position.set(0, -0.46, 0);
    const calfGeo = new THREE.CylinderGeometry(0.09, 0.075, 0.44, 10);
    const leftShin = new THREE.Mesh(
      calfGeo,
      isShorts ? this.skinMaterial : this.bottomsMaterial
    );
    leftShin.position.y = -0.22;
    leftShin.castShadow = true;
    this.leftShinGroup.add(leftShin);

    // Athletic Running Shoe
    this.leftShoeMesh = this.buildRunningShoe();
    this.leftShoeMesh.position.set(0, -0.44, -0.05);
    this.leftShinGroup.add(this.leftShoeMesh);

    this.leftLegGroup.add(this.leftShinGroup);
    this.pelvisGroup.add(this.leftLegGroup);

    // 9. Right Leg
    this.rightLegGroup = new THREE.Group();
    this.rightLegGroup.position.set(0.16, -0.05, 0);

    const rightThigh = leftThigh.clone();
    this.rightLegGroup.add(rightThigh);

    if (isShorts) {
      const shortsLegR = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.13, 0.26, 10),
        this.bottomsMaterial
      );
      shortsLegR.position.y = -0.13;
      this.rightLegGroup.add(shortsLegR);
    }

    this.rightShinGroup = new THREE.Group();
    this.rightShinGroup.position.set(0, -0.46, 0);
    const rightShin = leftShin.clone();
    this.rightShinGroup.add(rightShin);

    this.rightShoeMesh = this.buildRunningShoe();
    this.rightShoeMesh.position.set(0, -0.44, -0.05);
    this.rightShinGroup.add(this.rightShoeMesh);

    this.rightLegGroup.add(this.rightShinGroup);
    this.pelvisGroup.add(this.rightLegGroup);

    // 10. Hoverboard (Subway Surfers signature!)
    this.hoverboardGroup = new THREE.Group();
    this.hoverboardGroup.position.set(0, 0.1, 0);
    this.hoverboardGroup.visible = false;

    // Streamlined aerodynamic carbon deck
    const deckGeo = new THREE.BoxGeometry(0.52, 0.06, 1.45);
    const deckMesh = new THREE.Mesh(deckGeo, this.boardMaterial);
    deckMesh.castShadow = true;
    this.hoverboardGroup.add(deckMesh);

    // Neon Edge Glow
    const glowGeo = new THREE.BoxGeometry(0.55, 0.02, 1.48);
    const glowMesh = new THREE.Mesh(glowGeo, this.boardGlowMaterial);
    this.hoverboardGroup.add(glowMesh);

    // Anti-grav magnetic levitation discs
    const padF = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 0.05, 16),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    padF.position.set(0, -0.04, -0.45);
    const padB = padF.clone();
    padB.position.z = 0.45;
    this.hoverboardGroup.add(padF);
    this.hoverboardGroup.add(padB);

    this.group.add(this.hoverboardGroup);

    // Build Hair & Eyewear
    this.rebuildHairAndAccessories(cfg);

    // Soft Radial Contact Shadow beneath runner (flush on track Y = 0.02)
    const shadowGeo = new THREE.PlaneGeometry(1.2, 1.2);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
    });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = 0.02;
    this.group.add(shadowPlane);
  }

  // High-performance carbon-plated running shoe model
  private buildRunningShoe(): THREE.Group {
    const shoe = new THREE.Group();

    // High-stack nitrogen-infused foam midsole
    const soleGeo = new THREE.BoxGeometry(0.19, 0.08, 0.44);
    const sole = new THREE.Mesh(soleGeo, this.shoeSoleMaterial);
    sole.position.y = 0.04;
    shoe.add(sole);

    // Aerodynamic curved carbon plate line along sole
    const plateGeo = new THREE.BoxGeometry(0.195, 0.015, 0.42);
    const plate = new THREE.Mesh(plateGeo, this.shoeAccentMaterial);
    plate.position.y = 0.04;
    shoe.add(plate);

    // Breathable engineered mesh upper
    const upperGeo = new THREE.BoxGeometry(0.18, 0.13, 0.38);
    const upper = new THREE.Mesh(upperGeo, this.shoeUpperMaterial);
    upper.position.set(0, 0.13, -0.02);
    shoe.add(upper);

    // Tapered toe rocker
    const toeGeo = new THREE.BoxGeometry(0.18, 0.09, 0.14);
    const toe = new THREE.Mesh(toeGeo, this.shoeUpperMaterial);
    toe.position.set(0, 0.09, -0.16);
    shoe.add(toe);

    return shoe;
  }

  // Rebuild realistic male hairstyles and accessories
  private rebuildHairAndAccessories(cfg: RunnerCustomization) {
    // Clear previous hair & eyewear meshes
    while (this.hairGroup.children.length > 0) {
      const child = this.hairGroup.children[0];
      this.hairGroup.remove(child);
    }
    while (this.eyewearGroup.children.length > 0) {
      const child = this.eyewearGroup.children[0];
      this.eyewearGroup.remove(child);
    }

    const hStyle: Hairstyle = cfg.hairstyle || 'SHORT_FADE';

    if (hStyle === 'SHORT_FADE' || hStyle === 'BUZZ_CUT') {
      const hairCrown = new THREE.Mesh(
        new THREE.CylinderGeometry(0.19, 0.2, 0.12, 16),
        this.hairMaterial
      );
      hairCrown.position.set(0, 0.22, 0);
      this.hairGroup.add(hairCrown);

      const hairSides = new THREE.Mesh(
        new THREE.BoxGeometry(0.38, 0.12, 0.39),
        this.hairMaterial
      );
      hairSides.position.set(0, 0.12, 0.02);
      this.hairGroup.add(hairSides);
    } else if (hStyle === 'SWEPT_BACK' || hStyle === 'UNDERCUT') {
      const hairTop = new THREE.Mesh(
        new THREE.BoxGeometry(0.38, 0.18, 0.44),
        this.hairMaterial
      );
      hairTop.position.set(0, 0.24, 0.02);
      hairTop.rotation.x = -0.1;
      this.hairGroup.add(hairTop);
    } else if (hStyle === 'PONYTAIL') {
      const hairTop = new THREE.Mesh(
        new THREE.BoxGeometry(0.38, 0.16, 0.4),
        this.hairMaterial
      );
      hairTop.position.set(0, 0.22, 0);
      this.hairGroup.add(hairTop);

      // Man bun / ponytail at back
      const bun = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 12, 12),
        this.hairMaterial
      );
      bun.position.set(0, 0.14, 0.24);
      this.hairGroup.add(bun);
    } else if (hStyle === 'CAP') {
      const capMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(cfg.capColor || '#dc2626'),
        roughness: 0.5,
      });
      const capCrown = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.22, 0.16, 16),
        capMat
      );
      capCrown.position.set(0, 0.22, 0);
      this.hairGroup.add(capCrown);

      // Visor flipped backwards (+Z)
      const visor = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.03, 0.22), capMat);
      visor.position.set(0, 0.16, 0.22);
      visor.rotation.x = 0.12;
      this.hairGroup.add(visor);
    }

    // Eyewear
    const eStyle: EyewearStyle = cfg.eyewear || 'SPORTS_SHADES';
    if (eStyle === 'SPORTS_SHADES') {
      // Aerodynamic wraparound sports sunglasses
      const glassMat = new THREE.MeshStandardMaterial({
        color: 0x06b6d4, // Polarized iridescent cyan lens
        roughness: 0.1,
        metalness: 0.9,
      });
      const shades = new THREE.Mesh(
        new THREE.BoxGeometry(0.36, 0.09, 0.08),
        glassMat
      );
      shades.position.set(0, 0.05, -0.21);
      this.eyewearGroup.add(shades);

      // Frame arms
      const armL = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.03, 0.25), this.eyewearMaterial);
      armL.position.set(-0.18, 0.05, -0.09);
      const armR = armL.clone();
      armR.position.x = 0.18;
      this.eyewearGroup.add(armL);
      this.eyewearGroup.add(armR);
    } else if (eStyle === 'WAYFARER') {
      const shades = new THREE.Mesh(
        new THREE.BoxGeometry(0.36, 0.1, 0.06),
        this.eyewearMaterial
      );
      shades.position.set(0, 0.05, -0.21);
      this.eyewearGroup.add(shades);
    } else if (eStyle === 'HEADBAND') {
      const band = new THREE.Mesh(
        new THREE.BoxGeometry(0.38, 0.08, 0.4),
        new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.7 })
      );
      band.position.set(0, 0.15, 0);
      this.eyewearGroup.add(band);
    }
  }

  // 60FPS Athletic Sprint Kinematics
  public update(dt: number, speed: number, laneOffsetRate: number) {
    if (this.isCrashing) {
      // Tumble crash
      this.group.rotation.x = THREE.MathUtils.damp(this.group.rotation.x, -Math.PI / 2.3, 8, dt);
      this.group.rotation.z = THREE.MathUtils.damp(this.group.rotation.z, 0.55, 6, dt);
      this.leftArmGroup.rotation.x = THREE.MathUtils.damp(this.leftArmGroup.rotation.x, 1.2, 8, dt);
      this.rightArmGroup.rotation.x = THREE.MathUtils.damp(this.rightArmGroup.rotation.x, -1.2, 8, dt);
      return;
    }

    this.hoverboardGroup.visible = this.isHoverboardActive;

    // Banking tilt on quick lane shift
    const targetTilt = -laneOffsetRate * 0.14;
    this.group.rotation.z = THREE.MathUtils.damp(this.group.rotation.z, targetTilt, 14, dt);
    this.group.rotation.y = THREE.MathUtils.damp(this.group.rotation.y, laneOffsetRate * 0.09, 14, dt);

    if (this.isJetpackActive) {
      // High altitude rocket flight pose
      this.runCycleTime += dt * 3;
      this.torsoGroup.rotation.x = THREE.MathUtils.damp(this.torsoGroup.rotation.x, 0.45, 8, dt);
      this.leftLegGroup.rotation.x = THREE.MathUtils.damp(this.leftLegGroup.rotation.x, 0.5, 8, dt);
      this.rightLegGroup.rotation.x = THREE.MathUtils.damp(this.rightLegGroup.rotation.x, 0.65, 8, dt);
      this.leftArmGroup.rotation.x = THREE.MathUtils.damp(this.leftArmGroup.rotation.x, -0.6, 8, dt);
      this.rightArmGroup.rotation.x = THREE.MathUtils.damp(this.rightArmGroup.rotation.x, -0.6, 8, dt);
      this.headGroup.rotation.x = THREE.MathUtils.damp(this.headGroup.rotation.x, -0.35, 8, dt);
      return;
    }

    if (this.isHoverboardActive) {
      // Surfer balance stance
      this.runCycleTime += dt * 4;
      this.hoverboardGroup.rotation.z = Math.sin(this.runCycleTime) * 0.05 + targetTilt;
      this.hoverboardGroup.position.y = 0.15 + Math.sin(this.runCycleTime * 2) * 0.03;

      this.pelvisGroup.position.y = 0.92;
      this.torsoGroup.rotation.y = THREE.MathUtils.damp(this.torsoGroup.rotation.y, 0.55, 10, dt);
      this.leftArmGroup.rotation.x = -0.4;
      this.leftArmGroup.rotation.z = -0.6;
      this.rightArmGroup.rotation.x = 0.5;
      this.rightArmGroup.rotation.z = 0.6;
      this.leftLegGroup.rotation.x = 0.2;
      this.rightLegGroup.rotation.x = -0.2;
      this.headGroup.rotation.y = -0.45; // Turn head forward while body is sideways
      return;
    }

    if (this.isSliding) {
      // Low athletic slide/crouch under high barrier
      this.pelvisGroup.position.y = THREE.MathUtils.damp(this.pelvisGroup.position.y, 0.45, 14, dt);
      this.torsoGroup.rotation.x = THREE.MathUtils.damp(this.torsoGroup.rotation.x, 0.8, 14, dt);
      this.headGroup.rotation.x = THREE.MathUtils.damp(this.headGroup.rotation.x, -0.4, 14, dt);

      // Tuck legs
      this.leftLegGroup.rotation.x = THREE.MathUtils.damp(this.leftLegGroup.rotation.x, -1.3, 14, dt);
      this.rightLegGroup.rotation.x = THREE.MathUtils.damp(this.rightLegGroup.rotation.x, -1.3, 14, dt);

      // Trailing arm touches track
      this.leftArmGroup.rotation.x = THREE.MathUtils.damp(this.leftArmGroup.rotation.x, 0.9, 14, dt);
      this.rightArmGroup.rotation.x = THREE.MathUtils.damp(this.rightArmGroup.rotation.x, 0.9, 14, dt);
      return;
    }

    if (this.isJumping) {
      // Athletic leap: drive knees up, arms back
      this.pelvisGroup.position.y = THREE.MathUtils.damp(this.pelvisGroup.position.y, 0.95, 10, dt);
      this.torsoGroup.rotation.x = THREE.MathUtils.damp(this.torsoGroup.rotation.x, -0.15, 10, dt);
      this.leftLegGroup.rotation.x = THREE.MathUtils.damp(this.leftLegGroup.rotation.x, 0.75, 12, dt);
      this.leftShinGroup.rotation.x = THREE.MathUtils.damp(this.leftShinGroup.rotation.x, 0.8, 12, dt);
      this.rightLegGroup.rotation.x = THREE.MathUtils.damp(this.rightLegGroup.rotation.x, -0.3, 12, dt);
      this.leftArmGroup.rotation.x = THREE.MathUtils.damp(this.leftArmGroup.rotation.x, -1.2, 10, dt);
      this.rightArmGroup.rotation.x = THREE.MathUtils.damp(this.rightArmGroup.rotation.x, -1.2, 10, dt);
      return;
    }

    // Realistic Athletic Sprint Cycle (60FPS)
    this.pelvisGroup.position.y = 0.95;
    this.torsoGroup.rotation.set(0.18, 0, 0); // Forward athletic sprint lean
    this.headGroup.rotation.set(-0.06, 0, 0);

    const runFreq = speed * 0.78;
    this.runCycleTime += dt * runFreq;

    const swing = Math.sin(this.runCycleTime);
    const cosSwing = Math.cos(this.runCycleTime);

    // Reciprocal Arm Swings (elbows bent at ~90°)
    this.leftArmGroup.rotation.x = -swing * 0.95;
    this.leftForearmGroup.rotation.x = -0.9 + Math.abs(swing) * 0.2;

    this.rightArmGroup.rotation.x = swing * 0.95;
    this.rightForearmGroup.rotation.x = -0.9 + Math.abs(swing) * 0.2;

    // Reciprocal High Knee Drive & Heel Kick
    this.leftLegGroup.rotation.x = swing * 0.85;
    this.leftShinGroup.rotation.x = Math.max(0, -swing * 1.25);

    this.rightLegGroup.rotation.x = -swing * 0.85;
    this.rightShinGroup.rotation.x = Math.max(0, swing * 1.25);

    // Pelvic bounce and tilt
    this.pelvisGroup.position.y = 0.95 + Math.abs(cosSwing) * 0.08;
    this.torsoGroup.rotation.y = swing * 0.08; // Torso twists naturally with sprint cadence
  }

  public dispose() {
    if (this.currentFaceTexture) {
      this.currentFaceTexture.dispose();
    }
    this.faceMaterial.dispose();
    this.skinMaterial.dispose();
    this.hairMaterial.dispose();
    this.shirtMaterial.dispose();
    this.shirtAccentMaterial.dispose();
    this.bottomsMaterial.dispose();
    this.shoeUpperMaterial.dispose();
    this.shoeSoleMaterial.dispose();
    this.shoeAccentMaterial.dispose();
    this.eyewearMaterial.dispose();
    this.boardMaterial.dispose();
    this.boardGlowMaterial.dispose();
  }
}
