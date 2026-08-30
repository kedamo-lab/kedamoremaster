import React, { useEffect, useRef } from 'react';
import {
  WebGLRenderer,
  Scene,
  OrthographicCamera,
  PlaneGeometry,
  Mesh,
  ShaderMaterial,
  CanvasTexture,
  NearestFilter,
  Vector2,
  Color,
  Uniform,
  Texture,
} from 'three';
import { EffectComposer, RenderPass, EffectPass, Effect } from 'postprocessing';

const createTouchTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D context not available');

  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new CanvasTexture(canvas);
  texture.minFilter = NearestFilter;
  texture.magFilter = NearestFilter;
  texture.generateMipmaps = false;

  interface TouchPoint {
    x: number;
    y: number;
    age: number;
    force: number;
    vx: number;
    vy: number;
  }

  const trail: TouchPoint[] = [];
  let last: { x: number; y: number } | null = null;
  const maxAge = 64;
  let radius = 0.1 * 64;
  const speed = 1 / maxAge;

  const clear = () => {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const drawPoint = (p: TouchPoint) => {
    const pos = { x: p.x * 64, y: (1 - p.y) * 64 };
    let intensity = 1;
    const easeIn = (t: number) => Math.sin((t * Math.PI) / 2);
    const easeOut = (t: number) => -t * (t - 2);

    if (p.age < maxAge * 0.3) {
      intensity = easeIn(p.age / (maxAge * 0.3));
    } else {
      intensity = easeOut(1 - (p.age - maxAge * 0.3) / (maxAge * 0.7)) || 0;
    }
    intensity *= p.force;

    const rgb = `${((p.vx + 1) / 2) * 255}, ${((p.vy + 1) / 2) * 255}, ${intensity * 255}`;
    const offset = 320;
    ctx.shadowOffsetX = offset;
    ctx.shadowOffsetY = offset;
    ctx.shadowBlur = radius;
    ctx.shadowColor = `rgba(${rgb}, ${0.22 * intensity})`;
    ctx.beginPath();
    ctx.fillStyle = 'rgba(255,0,0,1)';
    ctx.arc(pos.x - offset, pos.y - offset, radius, 0, Math.PI * 2);
    ctx.fill();
  };

  return {
    canvas,
    texture,
    addTouch: (point: { x: number; y: number }) => {
      let force = 0;
      let vx = 0;
      let vy = 0;

      if (last) {
        const dx = point.x - last.x;
        const dy = point.y - last.y;
        if (dx === 0 && dy === 0) return;
        const d2 = dx * dx + dy * dy;
        const d = Math.sqrt(d2);
        vx = dx / (d || 1);
        vy = dy / (d || 1);
        force = Math.min(d2 * 10000, 1);
      }
      last = { x: point.x, y: point.y };
      trail.push({ x: point.x, y: point.y, age: 0, force, vx, vy });
    },
    update: () => {
      clear();
      for (let i = trail.length - 1; i >= 0; i--) {
        const p = trail[i];
        const f = p.force * speed * (1 - p.age / maxAge);
        p.x += p.vx * f;
        p.y += p.vy * f;
        p.age++;
        if (p.age > maxAge) trail.splice(i, 1);
      }
      for (let i = 0; i < trail.length; i++) {
        drawPoint(trail[i]);
      }
      texture.needsUpdate = true;
    },
    set radiusScale(s: number) {
      radius = 0.1 * 64 * s;
    },
    get radiusScale() {
      return radius / (0.1 * 64);
    },
    size: 64,
  };
};

const createLiquidEffect = (texture: Texture, options?: { strength?: number; freq?: number }) => {
  const fragmentShader = `
    uniform sampler2D uTexture;
    uniform float uStrength;
    uniform float uTime;
    uniform float uFreq;
    void mainUv(inout vec2 uv) {
      vec4 tex = texture2D(uTexture, uv);
      float vx = tex.r * 2.0 - 1.0;
      float vy = tex.g * 2.0 - 1.0;
      float intensity = tex.b;
      float wave = 0.5 + 0.5 * sin(uTime * uFreq + intensity * 6.2831853);
      float amt = uStrength * intensity * wave;
      uv += vec2(vx, vy) * amt;
    }
  `;

  // Explicit typing Map<string, Uniform<any>> to satisfy Effect constructor overloads
  const uniforms = new Map<string, Uniform<any>>([
    ['uTexture', new Uniform<Texture>(texture)],
    ['uStrength', new Uniform<number>(options?.strength ?? 0.025)],
    ['uTime', new Uniform<number>(0)],
    ['uFreq', new Uniform<number>(options?.freq ?? 4.5)],
  ]);

  return new Effect('LiquidEffect', fragmentShader, {
    uniforms,
  });
};

const shapeMap: Record<string, number> = {
  square: 0,
  circle: 1,
  triangle: 2,
  diamond: 3,
};

const vertexShader = `
void main() {
  gl_Position = vec4(position, 1.0);
}
`;

const fragmentShader = `
precision highp float;
uniform vec3  uColor;
uniform vec2  uResolution;
uniform float uTime;
uniform float uPixelSize;
uniform float uScale;
uniform float uDensity;
uniform float uPixelJitter;
uniform int   uEnableRipples;
uniform float uRippleSpeed;
uniform float uRippleThickness;
uniform float uRippleIntensity;
uniform float uEdgeFade;
uniform int   uShapeType;

const int SHAPE_SQUARE   = 0;
const int SHAPE_CIRCLE   = 1;
const int SHAPE_TRIANGLE = 2;
const int SHAPE_DIAMOND  = 3;

const int MAX_CLICKS = 10;
uniform vec2  uClickPos  [MAX_CLICKS];
uniform float uClickTimes[MAX_CLICKS];

out vec4 fragColor;

float Bayer2(vec2 a) {
  a = floor(a);
  return fract(a.x / 2. + a.y * a.y * .75);
}
#define Bayer4(a) (Bayer2(.5*(a))*0.25 + Bayer2(a))
#define Bayer8(a) (Bayer4(.5*(a))*0.25 + Bayer2(a))

#define FBM_OCTAVES 5
#define FBM_LACUNARITY 1.25
#define FBM_GAIN 1.0

float hash11(float n){ return fract(sin(n)*43758.5453); }

float vnoise(vec3 p){
  vec3 ip = floor(p);
  vec3 fp = fract(p);
  float n000 = hash11(dot(ip + vec3(0.0,0.0,0.0), vec3(1.0,57.0,113.0)));
  float n100 = hash11(dot(ip + vec3(1.0,0.0,0.0), vec3(1.0,57.0,113.0)));
  float n010 = hash11(dot(ip + vec3(0.0,1.0,0.0), vec3(1.0,57.0,113.0)));
  float n110 = hash11(dot(ip + vec3(1.0,1.0,0.0), vec3(1.0,57.0,113.0)));
  float n001 = hash11(dot(ip + vec3(0.0,0.0,1.0), vec3(1.0,57.0,113.0)));
  float n101 = hash11(dot(ip + vec3(1.0,0.0,1.0), vec3(1.0,57.0,113.0)));
  float n011 = hash11(dot(ip + vec3(0.0,1.0,1.0), vec3(1.0,57.0,113.0)));
  float n111 = hash11(dot(ip + vec3(1.0,1.0,1.0), vec3(1.0,57.0,113.0)));
  vec3 w = fp*fp*fp*(fp*(fp*6.0-15.0)+10.0);
  float x00 = mix(n000, n100, w.x);
  float x10 = mix(n010, n110, w.x);
  float x01 = mix(n001, n101, w.x);
  float x11 = mix(n011, n111, w.x);
  float y0  = mix(x00, x10, w.y);
  float y1  = mix(x01, x11, w.y);
  return mix(y0, y1, w.z) * 2.0 - 1.0;
}

float fbm2(vec2 uv, float t){
  vec3 p = vec3(uv * uScale, t);
  float amp = 1.0;
  float freq = 1.0;
  float sum = 1.0;
  for (int i = 0; i < FBM_OCTAVES; ++i){
    sum  += amp * vnoise(p * freq);
    freq *= FBM_LACUNARITY;
    amp  *= FBM_GAIN;
  }
  return sum * 0.5 + 0.5;
}

float maskCircle(vec2 p, float cov){
  float r = sqrt(cov) * .25;
  float d = length(p - 0.5) - r;
  float aa = 0.5 * fwidth(d);
  return cov * (1.0 - smoothstep(-aa, aa, d * 2.0));
}

float maskTriangle(vec2 p, vec2 id, float cov){
  bool flip = mod(id.x + id.y, 2.0) > 0.5;
  if (flip) p.x = 1.0 - p.x;
  float r = sqrt(cov);
  float d  = p.y - r*(1.0 - p.x);
  float aa = fwidth(d);
  return cov * clamp(0.5 - d/aa, 0.0, 1.0);
}

float maskDiamond(vec2 p, float cov){
  float r = sqrt(cov) * 0.564;
  return step(abs(p.x - 0.49) + abs(p.y - 0.49), r);
}

void main(){
  float pixelSize = uPixelSize;
  vec2 fragCoord = gl_FragCoord.xy - uResolution * .5;
  float aspectRatio = uResolution.x / uResolution.y;
  vec2 pixelId = floor(fragCoord / pixelSize);
  vec2 pixelUV = fract(fragCoord / pixelSize);
  float cellPixelSize = 8.0 * pixelSize;
  vec2 cellId = floor(fragCoord / cellPixelSize);
  vec2 cellCoord = cellId * cellPixelSize;
  vec2 uv = cellCoord / uResolution * vec2(aspectRatio, 1.0);
  float base = fbm2(uv, uTime * 0.05);
  base = base * 0.5 - 0.65;
  float feed = base + (uDensity - 0.5) * 0.3;

  float speed     = uRippleSpeed;
  float thickness = uRippleThickness;
  if (uEnableRipples == 1) {
    for (int i = 0; i < MAX_CLICKS; ++i){
      vec2 cpos = uClickPos[i];
      if (cpos.x < 0.0) continue;
      float elapsed = uTime - uClickTimes[i];
      if (elapsed < 0.0 || elapsed > 8.0) continue;
      float radius = elapsed * speed;
      vec2 diff = (fragCoord - cpos) / uResolution.y;
      float dist = length(diff);
      float ring = smoothstep(radius - thickness, radius, dist)
                 - smoothstep(radius, radius + thickness, dist);
      float atten = exp(-elapsed * 0.6);
      feed = max(feed, ring * atten * uRippleIntensity);
    }
  }

  float bayer = Bayer8(fragCoord / uPixelSize) - 0.5;
  float bw = step(0.5, feed + bayer);
  float h = fract(sin(dot(floor(fragCoord / uPixelSize), vec2(127.1, 311.7))) * 43758.5453);
  float jitterScale = 1.0 + (h - 0.5) * uPixelJitter;
  float coverage = bw * jitterScale;
  float M;
  if      (uShapeType == SHAPE_CIRCLE)   M = maskCircle (pixelUV, coverage);
  else if (uShapeType == SHAPE_TRIANGLE) M = maskTriangle(pixelUV, pixelId, coverage);
  else if (uShapeType == SHAPE_DIAMOND)  M = maskDiamond(pixelUV, coverage);
  else                                   M = coverage;

  if (uEdgeFade > 0.0) {
    vec2 norm = gl_FragCoord.xy / uResolution;
    float edge = min(min(norm.x, norm.y), min(1.0 - norm.x, 1.0 - norm.y));
    float fade = smoothstep(0.0, uEdgeFade, edge);
    M *= fade;
  }

  vec3 color = uColor;
  vec3 srgbColor = mix(
    color * 12.92,
    1.055 * pow(color, vec3(1.0 / 2.4)) - 0.055,
    step(0.0031308, color)
  );
  fragColor = vec4(srgbColor, M);
}
`;

const MAX_CLICKS = 10;

export interface PixelBlastProps {
  variant?: 'square' | 'circle' | 'triangle' | 'diamond';
  pixelSize?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
  antialias?: boolean;
  patternScale?: number;
  patternDensity?: number;
  liquid?: boolean;
  liquidStrength?: number;
  liquidRadius?: number;
  pixelSizeJitter?: number;
  enableRipples?: boolean;
  rippleIntensityScale?: number;
  rippleThickness?: number;
  rippleSpeed?: number;
  liquidWobbleSpeed?: number;
  autoPauseOffscreen?: boolean;
  speed?: number;
  transparent?: boolean;
  edgeFade?: number;
  noiseAmount?: number;
}

export const PixelBlast: React.FC<PixelBlastProps> = ({
  variant = 'square',
  pixelSize = 3,
  color = '#B497CF',
  className,
  style,
  antialias = true,
  patternScale = 2,
  patternDensity = 1,
  liquid = false,
  liquidStrength = 0.1,
  liquidRadius = 1,
  pixelSizeJitter = 0,
  enableRipples = true,
  rippleIntensityScale = 1,
  rippleThickness = 0.1,
  rippleSpeed = 0.3,
  liquidWobbleSpeed = 4.5,
  autoPauseOffscreen = true,
  speed = 0.5,
  transparent = true,
  edgeFade = 0.5,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef<{ visible: boolean }>({ visible: true });
  const speedRef = useRef(speed);
  const engineRef = useRef<any>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    speedRef.current = speed;

    const canvas = document.createElement('canvas');
    const renderer = new WebGLRenderer({
      canvas,
      antialias,
      alpha: true,
      powerPreference: 'high-performance',
    });

    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    container.appendChild(renderer.domElement);

    if (transparent) {
      renderer.setClearAlpha(0);
    } else {
      renderer.setClearColor(0, 1);
    }

    const uniforms = {
      uResolution: { value: new Vector2(0, 0) },
      uTime: { value: 0 },
      uColor: { value: new Color(color) },
      uClickPos: { value: Array.from({ length: MAX_CLICKS }, () => new Vector2(-1, -1)) },
      uClickTimes: { value: new Float32Array(MAX_CLICKS) },
      uShapeType: { value: shapeMap[variant] ?? 0 },
      uPixelSize: { value: pixelSize * (window.devicePixelRatio || 1) },
      uScale: { value: patternScale },
      uDensity: { value: patternDensity },
      uPixelJitter: { value: pixelSizeJitter },
      uEnableRipples: { value: enableRipples ? 1 : 0 },
      uRippleSpeed: { value: rippleSpeed },
      uRippleThickness: { value: rippleThickness },
      uRippleIntensity: { value: rippleIntensityScale },
      uEdgeFade: { value: edgeFade },
    };

    const material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
      glslVersion: '300 es' as any,
    });

    const quad = new Mesh(new PlaneGeometry(2, 2), material);
    const scene = new Scene();
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    scene.add(quad);

    let composer: EffectComposer | null = null;
    let touch: any = null;
    let liquidEffect: any = null;

    if (liquid) {
      touch = createTouchTexture();
      touch.radiusScale = liquidRadius;
      liquidEffect = createLiquidEffect(touch.texture, {
        strength: liquidStrength,
        freq: liquidWobbleSpeed,
      });

      composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      composer.addPass(new EffectPass(camera, liquidEffect));
    }

    let clickIdx = 0;
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;

      const dpr = renderer.getPixelRatio();
      const fragX = x * dpr - (rect.width * dpr) / 2;
      const fragY = (rect.height - y) * dpr - (rect.height * dpr) / 2;

      uniforms.uClickPos.value[clickIdx].set(fragX, fragY);
      uniforms.uClickTimes.value[clickIdx] = uniforms.uTime.value;
      clickIdx = (clickIdx + 1) % MAX_CLICKS;

      if (touch) {
        touch.addTouch({ x: x / rect.width, y: y / rect.height });
      }
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!touch) return;
      const rect = renderer.domElement.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      if (x >= 0 && y >= 0 && x <= rect.width && y <= rect.height) {
        touch.addTouch({ x: x / rect.width, y: y / rect.height });
      }
    };

    window.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });

    const setSize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      renderer.setSize(w, h);
      uniforms.uResolution.value.set(w * renderer.getPixelRatio(), h * renderer.getPixelRatio());
      if (composer) {
        composer.setSize(w, h);
      }
    };
    setSize();

    const resizeObserver = new ResizeObserver(() => setSize());
    resizeObserver.observe(container);

    let raf = 0;
    let lastTime = performance.now();

    const animate = (now: number) => {
      raf = requestAnimationFrame(animate);
      if (!stateRef.current.visible && autoPauseOffscreen) return;

      const delta = (now - lastTime) / 1000;
      lastTime = now;

      uniforms.uTime.value += delta * speedRef.current;
      if (touch) {
        touch.update();
        if (liquidEffect && liquidEffect.uniforms) {
          const uT = liquidEffect.uniforms.get('uTime');
          if (uT) uT.value = uniforms.uTime.value;
        }
      }

      if (composer) {
        composer.render();
      } else {
        renderer.render(scene, camera);
      }
    };
    raf = requestAnimationFrame(animate);

    engineRef.current = {
      renderer,
      composer,
      material,
      quad,
      resizeObserver,
      raf,
    };

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('touchmove', onPointerMove);
      resizeObserver.disconnect();
      quad.geometry.dispose();
      material.dispose();
      composer?.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
      engineRef.current = null;
    };
  }, [
    variant,
    pixelSize,
    color,
    antialias,
    patternScale,
    patternDensity,
    liquid,
    liquidStrength,
    liquidRadius,
    pixelSizeJitter,
    enableRipples,
    rippleIntensityScale,
    rippleThickness,
    rippleSpeed,
    liquidWobbleSpeed,
    autoPauseOffscreen,
    speed,
    transparent,
    edgeFade,
  ]);

  return (
    <div
      ref={containerRef}
      className={`pixel-blast-container ${className || ''}`}
      style={style}
    />
  );
};
