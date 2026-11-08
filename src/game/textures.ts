import * as THREE from 'three';
import { RunnerCustomization } from '../types';

// Helper to set texture parameters
function finalizeTexture(canvas: HTMLCanvasElement): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

// Generates procedural realistic runner face texture from user photo or realistic male facial features
export function createRunnerFaceTexture(
  config: RunnerCustomization,
  onUpdate?: () => void
): { texture: THREE.CanvasTexture; canvas: HTMLCanvasElement } {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const texture = finalizeTexture(canvas);

  const redraw = (customImg?: HTMLImageElement) => {
    ctx.clearRect(0, 0, 512, 512);

    const skinColor = config.skinTone || '#d4a373';

    // 1. Base realistic skin tone background with anatomical shading
    ctx.fillStyle = skinColor;
    ctx.fillRect(0, 0, 512, 512);

    // Subtle facial contouring: forehead highlight, cheekbone definition, temple shading
    const headGrad = ctx.createRadialGradient(256, 240, 30, 256, 256, 240);
    headGrad.addColorStop(0, 'rgba(255,255,255,0.18)');
    headGrad.addColorStop(0.5, 'rgba(255,255,255,0.02)');
    headGrad.addColorStop(0.85, 'rgba(0,0,0,0.12)');
    headGrad.addColorStop(1, 'rgba(0,0,0,0.3)');
    ctx.fillStyle = headGrad;
    ctx.fillRect(0, 0, 512, 512);

    // Jawline & chin shadow
    const chinGrad = ctx.createLinearGradient(0, 380, 0, 512);
    chinGrad.addColorStop(0, 'rgba(0,0,0,0)');
    chinGrad.addColorStop(1, 'rgba(0,0,0,0.35)');
    ctx.fillStyle = chinGrad;
    ctx.fillRect(0, 380, 512, 132);

    // 2. If user image exists, project and blend customized photo avatar
    if (customImg && customImg.complete && customImg.naturalWidth > 0) {
      ctx.save();

      const centerX = 256 + (config.photoOffsetX || 0) * 2;
      const centerY = 260 + (config.photoOffsetY || 0) * 2;
      const radius = 175 * (config.photoScale || 1.0);

      // Feathered realistic oval face mask
      ctx.beginPath();
      ctx.ellipse(256, 260, 160, 195, 0, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      const imgAspect = customImg.width / customImg.height;
      let drawW = radius * 2;
      let drawH = radius * 2;
      if (imgAspect > 1) {
        drawW = drawH * imgAspect;
      } else {
        drawH = drawW / imgAspect;
      }

      ctx.drawImage(
        customImg,
        centerX - drawW / 2,
        centerY - drawH / 2,
        drawW,
        drawH
      );

      ctx.restore();

      // Soft natural vignette around projected photo so it blends with 3D skin tone
      const featherGrad = ctx.createRadialGradient(256, 260, 130, 256, 260, 175);
      featherGrad.addColorStop(0, 'rgba(0,0,0,0)');
      featherGrad.addColorStop(0.7, 'rgba(0,0,0,0.05)');
      featherGrad.addColorStop(1, skinColor);
      ctx.fillStyle = featherGrad;
      ctx.fillRect(0, 0, 512, 512);
    } else {
      // 3. Realistic procedural male face features

      // Brow bone shadow
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      ctx.beginPath();
      ctx.ellipse(180, 215, 45, 16, -0.05, 0, Math.PI * 2);
      ctx.ellipse(332, 215, 45, 16, 0.05, 0, Math.PI * 2);
      ctx.fill();

      // Eyebrows (realistic athletic male brows)
      const hairCol = config.hairColor || '#1c1917';
      ctx.fillStyle = hairCol;

      // Left eyebrow
      ctx.beginPath();
      ctx.moveTo(135, 202);
      ctx.quadraticCurveTo(180, 185, 225, 206);
      ctx.quadraticCurveTo(180, 196, 140, 212);
      ctx.closePath();
      ctx.fill();

      // Right eyebrow
      ctx.beginPath();
      ctx.moveTo(377, 202);
      ctx.quadraticCurveTo(332, 185, 287, 206);
      ctx.quadraticCurveTo(332, 196, 372, 212);
      ctx.closePath();
      ctx.fill();

      // Eyes (realistic eyes with iris color)
      const eyeCol = config.eyeColor || '#3b82f6';
      [182, 330].forEach((eyeX) => {
        // Sclera (eye white with subtle shading)
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.ellipse(eyeX, 235, 26, 15, 0, 0, Math.PI * 2);
        ctx.fill();

        // Iris
        ctx.fillStyle = eyeCol;
        ctx.beginPath();
        ctx.arc(eyeX, 235, 12, 0, Math.PI * 2);
        ctx.fill();

        // Pupil
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(eyeX, 235, 5.5, 0, Math.PI * 2);
        ctx.fill();

        // Realistic eye specular light dot
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(eyeX - 4, 231, 3, 0, Math.PI * 2);
        ctx.fill();

        // Upper eyelid line & crease
        ctx.strokeStyle = '#292524';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.ellipse(eyeX, 235, 27, 15, 0, Math.PI, 0);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(0,0,0,0.18)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(eyeX, 226, 25, Math.PI * 0.9, Math.PI * 0.1);
        ctx.stroke();
      });

      // Realistic Male Nose
      // Nose bridge highlight & side shadow
      ctx.fillStyle = 'rgba(0,0,0,0.08)';
      ctx.beginPath();
      ctx.moveTo(242, 220);
      ctx.lineTo(238, 295);
      ctx.lineTo(248, 305);
      ctx.lineTo(252, 220);
      ctx.closePath();
      ctx.fill();

      // Nose tip & nostrils
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.beginPath();
      // Left nostril
      ctx.ellipse(240, 302, 6, 4, 0.3, 0, Math.PI * 2);
      // Right nostril
      ctx.ellipse(272, 302, 6, 4, -0.3, 0, Math.PI * 2);
      ctx.fill();

      // Nose tip highlight
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      ctx.beginPath();
      ctx.arc(256, 294, 9, 0, Math.PI * 2);
      ctx.fill();

      // Male Lips / Mouth (determined athletic focus)
      // Upper lip
      ctx.fillStyle = '#834c38';
      ctx.beginPath();
      ctx.moveTo(215, 350);
      ctx.quadraticCurveTo(256, 342, 297, 350);
      ctx.quadraticCurveTo(256, 354, 215, 350);
      ctx.fill();

      // Lower lip
      ctx.fillStyle = '#9a5840';
      ctx.beginPath();
      ctx.moveTo(218, 350);
      ctx.quadraticCurveTo(256, 370, 294, 350);
      ctx.quadraticCurveTo(256, 354, 218, 350);
      ctx.fill();

      // Lower lip highlight
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.beginPath();
      ctx.ellipse(256, 358, 16, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Facial Hair (Stubble, Full Beard, Goatee, Mustache)
      const beardCol = config.facialHairColor || config.hairColor || '#1c1917';
      const fHair = config.facialHair || 'STUBBLE';

      if (fHair === 'STUBBLE') {
        // Procedural fine 5 o'clock shadow
        ctx.fillStyle = 'rgba(40,30,25,0.18)';
        ctx.beginPath();
        ctx.ellipse(256, 380, 85, 65, 0, 0, Math.PI);
        ctx.fill();

        // Upper lip stubble
        ctx.fillRect(220, 325, 72, 16);
      } else if (fHair === 'FULL_BEARD') {
        ctx.fillStyle = beardCol;
        ctx.beginPath();
        ctx.moveTo(170, 310);
        ctx.quadraticCurveTo(160, 420, 256, 460);
        ctx.quadraticCurveTo(352, 420, 342, 310);
        ctx.quadraticCurveTo(320, 370, 256, 380);
        ctx.quadraticCurveTo(192, 370, 170, 310);
        ctx.closePath();
        ctx.fill();

        // Mustache connect
        ctx.fillRect(212, 324, 88, 22);
      } else if (fHair === 'GOATEE') {
        ctx.fillStyle = beardCol;
        ctx.beginPath();
        ctx.ellipse(256, 395, 45, 50, 0, 0, Math.PI);
        ctx.fill();
        ctx.fillRect(216, 326, 80, 20);
      } else if (fHair === 'MUSTACHE') {
        ctx.fillStyle = beardCol;
        ctx.beginPath();
        ctx.moveTo(210, 342);
        ctx.quadraticCurveTo(256, 324, 302, 342);
        ctx.quadraticCurveTo(256, 348, 210, 342);
        ctx.fill();
      }
    }

    texture.needsUpdate = true;
    if (onUpdate) onUpdate();
  };

  if (config.photoUrl) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => redraw(img);
    img.onerror = () => redraw();
    img.src = config.photoUrl;
  } else {
    redraw();
  }

  return { texture, canvas };
}

// Procedural realistic Subway Passenger Train Side Texture
// Features: stainless steel corrugated panels, sliding passenger doors with yellow seals,
// illuminated passenger windows showing interior cabin, transit logo, and train car numbering.
export function createTrainSideTexture(lineColor: string = '#2563eb'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // 1. Brushed Stainless Steel Train Body
  const steelGrad = ctx.createLinearGradient(0, 0, 0, 512);
  steelGrad.addColorStop(0, '#94a3b8');
  steelGrad.addColorStop(0.15, '#cbd5e1');
  steelGrad.addColorStop(0.35, '#f1f5f9');
  steelGrad.addColorStop(0.7, '#cbd5e1');
  steelGrad.addColorStop(1, '#64748b');
  ctx.fillStyle = steelGrad;
  ctx.fillRect(0, 0, 1024, 512);

  // 2. Bold Subway Transit Line Band (e.g. Cobalt Express or Crimson Metro)
  ctx.fillStyle = lineColor;
  ctx.fillRect(0, 120, 1024, 60);

  // Thin reflective white/silver pinstripe
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 116, 1024, 4);
  ctx.fillRect(0, 180, 1024, 4);

  // 3. Train Car Numbering & Subway Crest
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px monospace';
  ctx.fillText('CAR #7042', 30, 158);
  ctx.fillText('METRO RAPID TRANSIT', 740, 158);

  // 4. Passenger Windows with Illuminated Interior Cabin
  for (let i = 0; i < 4; i++) {
    const wx = 75 + i * 235;

    // Window rubber gasket frame
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(wx - 4, 70, 158, 120);

    // Warm cabin interior lighting gradient
    const winGrad = ctx.createLinearGradient(wx, 74, wx, 186);
    winGrad.addColorStop(0, '#38bdf8');
    winGrad.addColorStop(0.4, '#bae6fd');
    winGrad.addColorStop(0.85, '#fef08a');
    winGrad.addColorStop(1, '#fde047');
    ctx.fillStyle = winGrad;
    ctx.fillRect(wx, 74, 150, 112);

    // Cabin interior silhouettes (seats, handrail poles, passenger heads)
    ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
    // Stainless steel overhead grab rail
    ctx.fillRect(wx, 88, 150, 4);
    // Interior seat silhouettes
    ctx.fillRect(wx + 15, 140, 35, 45);
    ctx.fillRect(wx + 95, 140, 35, 45);

    // Diagonal Glass Sheen Reflection
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath();
    ctx.moveTo(wx + 25, 186);
    ctx.lineTo(wx + 80, 74);
    ctx.lineTo(wx + 105, 74);
    ctx.lineTo(wx + 50, 186);
    ctx.closePath();
    ctx.fill();
  }

  // 5. Center Double-Leaf Passenger Doors with High-Visibility Yellow Edge Seals
  const doorX = 490;
  // Door frame recess
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(doorX - 6, 60, 92, 380);

  // Left leaf
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(doorX, 65, 38, 370);
  // Right leaf
  ctx.fillRect(doorX + 42, 65, 38, 370);

  // Yellow safety edge seal
  ctx.fillStyle = '#facc15';
  ctx.fillRect(doorX + 37, 65, 6, 370);

  // Door windows
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(doorX + 6, 95, 26, 90);
  ctx.fillRect(doorX + 48, 95, 26, 90);
  ctx.fillStyle = '#7dd3fc';
  ctx.fillRect(doorX + 8, 97, 22, 86);
  ctx.fillRect(doorX + 50, 97, 22, 86);

  // Door handles
  ctx.fillStyle = '#475569';
  ctx.fillRect(doorX + 32, 240, 4, 30);
  ctx.fillRect(doorX + 44, 240, 4, 30);

  // 6. Realistic Corrugated Steel Fluting Ribs (authentic subway fluted sides)
  for (let y = 230; y < 490; y += 14) {
    // Ridge highlight
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillRect(0, y, 1024, 3);
    // Ridge shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(0, y + 3, 1024, 4);
  }

  // 7. Authentic Subway Graffiti Tag on Lower Fluting (Street Runner Vibe)
  ctx.save();
  ctx.translate(180, 360);
  ctx.rotate(-0.04);
  ctx.font = 'bold 76px Impact, sans-serif';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 12;
  ctx.strokeText('SUBWAY', 0, 0);
  ctx.fillStyle = '#22c55e';
  ctx.fillText('SUBWAY', 0, 0);

  ctx.font = 'bold 52px Impact, sans-serif';
  ctx.strokeText('EXPRESS', 290, 15);
  ctx.fillStyle = '#ec4899';
  ctx.fillText('EXPRESS', 290, 15);
  ctx.restore();

  return finalizeTexture(canvas);
}

// Procedural realistic Subway Train Front Cab Face Texture
// Features: Wrap-around curved aerodynamic windshield, digital LED destination sign,
// high-intensity dual beam headlights, front emergency door, anti-climber crash buffer.
export function createTrainFrontTexture(lineColor: string = '#2563eb'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // 1. Train Cab Front Shell (Deep Graphite & Brushed Steel)
  ctx.fillStyle = '#334155';
  ctx.fillRect(0, 0, 512, 512);

  // 2. Line Color Banner
  ctx.fillStyle = lineColor;
  ctx.fillRect(20, 25, 472, 85);

  // 3. Digital LED Destination Board ("METRO EXPRESS 60FPS")
  ctx.fillStyle = '#09090b';
  ctx.fillRect(60, 45, 392, 50);
  ctx.strokeStyle = '#27272a';
  ctx.lineWidth = 4;
  ctx.strokeRect(60, 45, 392, 50);

  ctx.fillStyle = '#f59e0b'; // Amber LED glow
  ctx.font = 'bold 26px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('SUBWAY EXPRESS 60FPS', 256, 80);

  // 4. Large Aerodynamic Windshield
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(35, 125, 442, 185);

  const glassGrad = ctx.createLinearGradient(35, 125, 35, 310);
  glassGrad.addColorStop(0, '#0284c7');
  glassGrad.addColorStop(0.4, '#38bdf8');
  glassGrad.addColorStop(0.8, '#0369a1');
  glassGrad.addColorStop(1, '#0c4a6e');
  ctx.fillStyle = glassGrad;
  ctx.fillRect(45, 135, 422, 165);

  // Glass Sheen Reflection
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.beginPath();
  ctx.moveTo(80, 300);
  ctx.lineTo(240, 135);
  ctx.lineTo(310, 135);
  ctx.lineTo(150, 300);
  ctx.closePath();
  ctx.fill();

  // Windshield Wiper
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(256, 300);
  ctx.lineTo(290, 180);
  ctx.stroke();

  // 5. Dual High-Intensity Headlights with Reflectors
  // Left Headlight
  const drawHeadlight = (x: number, y: number) => {
    // Chrome housing bezel
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.arc(x, y, 42, 0, Math.PI * 2);
    ctx.fill();

    // Reflector dish
    const hlGrad = ctx.createRadialGradient(x, y, 5, x, y, 36);
    hlGrad.addColorStop(0, '#ffffff');
    hlGrad.addColorStop(0.4, '#fef08a');
    hlGrad.addColorStop(0.8, '#f59e0b');
    hlGrad.addColorStop(1, '#78350f');
    ctx.fillStyle = hlGrad;
    ctx.beginPath();
    ctx.arc(x, y, 36, 0, Math.PI * 2);
    ctx.fill();

    // Outer ring
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 6;
    ctx.stroke();

    // Red marker light next to headlight
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(x > 256 ? x + 48 : x - 48, y, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#7f1d1d';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  drawHeadlight(110, 370);
  drawHeadlight(402, 370);

  // 6. Heavy Anti-Climber Crash Buffer & Subway Cowcatcher
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(40, 430, 432, 70);

  // Heavy steel ribbed teeth on bumper
  for (let y = 436; y < 495; y += 12) {
    ctx.fillStyle = '#64748b';
    ctx.fillRect(40, y, 432, 4);
    ctx.fillStyle = '#000000';
    ctx.fillRect(40, y + 4, 432, 4);
  }

  // Center Emergency Coupler Pocket
  ctx.fillStyle = '#18181b';
  ctx.fillRect(206, 435, 100, 60);
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 4;
  ctx.strokeRect(206, 435, 100, 60);

  return finalizeTexture(canvas);
}

// Procedural Warm Terracotta Brick Tunnel Wall with Subway Surfers Graffiti Art & Green Foliage
export function createWallTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // 1. Warm Terracotta / Red-Orange Brick Wall Base
  const wallGrad = ctx.createLinearGradient(0, 0, 0, 512);
  wallGrad.addColorStop(0, '#c2410c'); // Warm terracotta orange
  wallGrad.addColorStop(0.5, '#b45309'); // Amber brick
  wallGrad.addColorStop(1, '#9a3412');  // Deep terracotta base
  ctx.fillStyle = wallGrad;
  ctx.fillRect(0, 0, 1024, 512);

  // Brick courses & stylized mortar lines
  ctx.strokeStyle = 'rgba(254, 215, 170, 0.35)'; // Warm mortar
  ctx.lineWidth = 3;
  const brickH = 28;
  const brickW = 64;
  for (let y = 50; y < 512; y += brickH) {
    const shift = (Math.floor(y / brickH) % 2) * (brickW / 2);
    for (let x = -shift; x < 1024 + brickW; x += brickW) {
      // Subtle brick color variation
      if (Math.random() > 0.4) {
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(234, 88, 12, 0.25)' : 'rgba(180, 83, 9, 0.25)';
        ctx.fillRect(x + 2, y + 2, brickW - 4, brickH - 4);
      }
      ctx.strokeRect(x, y, brickW, brickH);
    }
  }

  // 2. Concrete Parapet Wall Coping at Top (Y: 0 to 50)
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(0, 16, 1024, 34);
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(0, 46, 1024, 6);

  // 3. Overhanging Lush Green Foliage / City Shrubs atop Wall (matching the image)
  const bushCount = 20;
  for (let i = 0; i < bushCount; i++) {
    const bx = i * 55 + Math.random() * 15;
    const br = 22 + Math.random() * 12;
    ctx.fillStyle = i % 2 === 0 ? '#15803d' : '#22c55e';
    ctx.beginPath();
    ctx.arc(bx, 14, br, 0, Math.PI * 2);
    ctx.fill();

    // Leaf highlights
    ctx.fillStyle = '#86efac';
    ctx.beginPath();
    ctx.arc(bx - 4, 10, br * 0.45, 0, Math.PI * 2);
    ctx.fill();
  }

  // 4. Iconic "SUBWAY SURFERS" Graffiti Piece (exactly like on the wall in the image!)
  ctx.save();
  ctx.translate(160, 240);
  ctx.rotate(-0.06);

  // Blue spray drop shadow
  ctx.font = '900 86px Impact, "Arial Black", sans-serif';
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 18;
  ctx.lineJoin = 'round';
  ctx.strokeText('SUBWAY', 0, 0);

  // Black sharp inner border
  ctx.strokeStyle = '#09090b';
  ctx.lineWidth = 8;
  ctx.strokeText('SUBWAY', 0, 0);

  // Bright golden-yellow graffiti fill
  const surfGrad = ctx.createLinearGradient(0, -60, 0, 20);
  surfGrad.addColorStop(0, '#fef08a');
  surfGrad.addColorStop(0.5, '#f59e0b');
  surfGrad.addColorStop(1, '#ea580c');
  ctx.fillStyle = surfGrad;
  ctx.fillText('SUBWAY', 0, 0);

  // Second line: SURFERS
  ctx.translate(20, 75);
  ctx.font = '900 78px Impact, "Arial Black", sans-serif';
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 18;
  ctx.strokeText('SURFERS', 0, 0);
  ctx.strokeStyle = '#09090b';
  ctx.lineWidth = 8;
  ctx.strokeText('SURFERS', 0, 0);
  ctx.fillStyle = surfGrad;
  ctx.fillText('SURFERS', 0, 0);
  ctx.restore();

  // 5. Stylized Tag on Right Section (matching graffiti on right train wall in image)
  ctx.save();
  ctx.translate(720, 260);
  ctx.rotate(0.04);
  ctx.font = '900 68px Impact, sans-serif';
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 14;
  ctx.strokeText('VENKAT', 0, 0);
  ctx.strokeStyle = '#09090b';
  ctx.lineWidth = 6;
  ctx.strokeText('VENKAT', 0, 0);
  ctx.fillStyle = '#ec4899';
  ctx.fillText('VENKAT', 0, 0);
  ctx.restore();

  // 6. Lower Concrete Kick-Plate Curb at Bottom
  ctx.fillStyle = '#78350f';
  ctx.fillRect(0, 480, 1024, 32);
  ctx.fillStyle = '#92400e';
  ctx.fillRect(0, 480, 1024, 6);

  return finalizeTexture(canvas);
}

// Procedural Sunny Railroad Track & Ballast Texture (matching sunny warm tracks in image)
export function createTrackTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // 1. Warm Sunny Sand/Ballast Bed
  const ballastGrad = ctx.createLinearGradient(0, 0, 512, 0);
  ballastGrad.addColorStop(0, '#d97706'); // Warm amber gold
  ballastGrad.addColorStop(0.5, '#ca8a04'); // Sandy track gold
  ballastGrad.addColorStop(1, '#b45309'); // Terracotta warm shadow
  ctx.fillStyle = ballastGrad;
  ctx.fillRect(0, 0, 512, 512);

  // Gravel stippling
  for (let i = 0; i < 2200; i++) {
    const gx = Math.random() * 512;
    const gy = Math.random() * 512;
    const size = Math.random() * 2.5 + 1;
    ctx.fillStyle = Math.random() > 0.5 ? '#fde68a' : '#92400e';
    ctx.fillRect(gx, gy, size, size);
  }

  // 2. Rich Wooden Railroad Cross-Ties (8 per chunk repeat)
  const tieCount = 8;
  const tieGap = 512 / tieCount;
  for (let i = 0; i < tieCount; i++) {
    const y = i * tieGap + 8;
    // Tie shadow
    ctx.fillStyle = 'rgba(69, 26, 3, 0.45)';
    ctx.fillRect(20, y + 26, 472, 6);

    // Warm timber tie body
    const woodGrad = ctx.createLinearGradient(0, y, 0, y + 26);
    woodGrad.addColorStop(0, '#92400e');
    woodGrad.addColorStop(0.3, '#b45309');
    woodGrad.addColorStop(1, '#78350f');
    ctx.fillStyle = woodGrad;
    ctx.fillRect(24, y, 464, 26);

    // Wood grain highlight
    ctx.fillStyle = 'rgba(254, 215, 170, 0.25)';
    ctx.fillRect(24, y + 2, 464, 3);

    // Steel tie-plates and rail spikes
    ctx.fillStyle = '#475569';
    ctx.fillRect(100, y + 3, 22, 20);
    ctx.fillRect(390, y + 3, 22, 20);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(108, y + 8, 6, 10);
    ctx.fillRect(398, y + 8, 6, 10);
  }

  // 3. Shiny Steel Rails with Golden Sunlight Specular Glint
  const railLeft = 105;
  const railRight = 395;
  const railW = 12;

  // Rail cast shadow
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(railLeft - 4, 0, railW + 8, 512);
  ctx.fillRect(railRight - 4, 0, railW + 8, 512);

  // Chrome rail head
  const railGrad = ctx.createLinearGradient(railLeft, 0, railLeft + railW, 0);
  railGrad.addColorStop(0, '#cbd5e1');
  railGrad.addColorStop(0.4, '#ffffff');
  railGrad.addColorStop(0.8, '#94a3b8');
  railGrad.addColorStop(1, '#64748b');

  ctx.fillStyle = railGrad;
  ctx.fillRect(railLeft, 0, railW, 512);
  ctx.fillRect(railRight, 0, railW, 512);

  // Top sun glint pinstripe
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(railLeft + 3, 0, 3, 512);
  ctx.fillRect(railRight + 3, 0, 3, 512);

  return finalizeTexture(canvas);
}

// Procedural Cute Light Pink "T" Letter Token Texture
export function createCoinTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Cute light pink radial gradient sheen
  const grad = ctx.createRadialGradient(128, 128, 15, 128, 128, 128);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.25, '#fce7f3'); // pastel soft blush
  grad.addColorStop(0.65, '#f472b6'); // cute light pink
  grad.addColorStop(0.9, '#ec4899');  // vibrant strawberry rose
  grad.addColorStop(1, '#db2777');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  // Soft sparkle glitter specks
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  const sparkles = [
    { x: 50, y: 55, r: 4 },
    { x: 205, y: 60, r: 5 },
    { x: 45, y: 195, r: 3.5 },
    { x: 210, y: 200, r: 4 },
  ];
  sparkles.forEach((s) => {
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
    // 4-point sparkle ray
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(s.x - s.r * 2.5, s.y);
    ctx.lineTo(s.x + s.r * 2.5, s.y);
    ctx.moveTo(s.x, s.y - s.r * 2.5);
    ctx.lineTo(s.x, s.y + s.r * 2.5);
    ctx.stroke();
  });

  // Chunky Cute Rounded "T" Letter in Center
  ctx.save();
  ctx.translate(128, 128);

  // Soft shadow for "T"
  ctx.shadowColor = 'rgba(190, 24, 93, 0.45)';
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 6;

  // Outer cute outline of "T"
  ctx.font = '900 156px "Arial Rounded MT Bold", "Comfortaa", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Thick white background stroke
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 18;
  ctx.lineJoin = 'round';
  ctx.strokeText('T', 0, 4);

  // Gradient fill for "T"
  const tGrad = ctx.createLinearGradient(0, -60, 0, 70);
  tGrad.addColorStop(0, '#ffffff');
  tGrad.addColorStop(0.4, '#fff1f2');
  tGrad.addColorStop(1, '#fbcfe8');
  ctx.fillStyle = tGrad;
  ctx.fillText('T', 0, 4);

  ctx.restore();

  // Cute Little Sparkle Heart on top-right of "T"
  ctx.save();
  ctx.translate(170, 75);
  ctx.fillStyle = '#f43f5e';
  ctx.beginPath();
  const hSize = 14;
  ctx.moveTo(0, hSize * 0.3);
  ctx.bezierCurveTo(-hSize * 0.8, -hSize * 0.5, -hSize * 0.8, -hSize * 1.1, 0, -hSize * 0.4);
  ctx.bezierCurveTo(hSize * 0.8, -hSize * 1.1, hSize * 0.8, -hSize * 0.5, 0, hSize * 0.3);
  ctx.fill();

  // White highlight in heart
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(-3, -7, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Outer cute beaded pastel rim
  ctx.strokeStyle = '#fbcfe8';
  ctx.lineWidth = 12;
  ctx.strokeRect(8, 8, 240, 240);

  return finalizeTexture(canvas);
}

// Procedural Hazard Caution Texture
export function createHazardTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#eab308';
  ctx.fillRect(0, 0, 256, 256);

  ctx.fillStyle = '#18181b';
  const stripeW = 40;
  for (let x = -256; x < 512; x += stripeW * 2) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + stripeW, 0);
    ctx.lineTo(x + stripeW + 256, 256);
    ctx.lineTo(x + 256, 256);
    ctx.closePath();
    ctx.fill();
  }

  return finalizeTexture(canvas);
}

// Procedural Blue Plaid Checkered Shirt Texture matching Venkat's Subway Runner shirt
export function createPlaidShirtTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 256, 256);

  // Plaid blue vertical & horizontal stripes
  const stripeW = 32;
  ctx.fillStyle = 'rgba(59, 130, 246, 0.65)'; // Blue 500
  for (let x = 0; x < 256; x += stripeW * 2) {
    ctx.fillRect(x, 0, stripeW, 256);
  }
  for (let y = 0; y < 256; y += stripeW * 2) {
    ctx.fillRect(0, y, 256, stripeW);
  }

  // Deeper blue intersections
  ctx.fillStyle = 'rgba(29, 78, 216, 0.45)';
  for (let x = 0; x < 256; x += stripeW * 2) {
    for (let y = 0; y < 256; y += stripeW * 2) {
      ctx.fillRect(x, y, stripeW, stripeW);
    }
  }

  const tex = finalizeTexture(canvas);
  tex.repeat.set(4, 4);
  return tex;
}

// Procedural Venkat Chest Name Tag Texture
export function createVenkatBadgeTexture(name: string = 'VENKAT'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 256, 128);

  ctx.strokeStyle = '#2563eb';
  ctx.lineWidth = 10;
  ctx.strokeRect(5, 5, 246, 118);

  ctx.fillStyle = '#1e3a8a';
  ctx.font = '900 52px "Arial Rounded MT Bold", Impact, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(name.toUpperCase(), 128, 64);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
