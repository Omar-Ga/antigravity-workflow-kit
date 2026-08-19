"use client";

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import type { AudioLevels, LivePhase } from '@/hooks/useGeminiLive';

/* ==========================================================================
   Voice orb
   --------------------------------------------------------------------------
   Three concentric layers sharing one uniform block:

     core   — small bright nucleus, scales with overall loudness
     main   — simplex-noise displaced sphere, the readable silhouette
     aura   — additive fresnel shell, the bloom

   At rest the orb breathes very slowly (~0.12 Hz, ±1.5%). While the model
   speaks, the low band drives big slow bulges and the high band adds fine
   surface ripple, so the motion tracks speech rather than looping on a timer.

   Levels are pulled from a ref-based getter inside the render loop, so audio
   reactivity never touches React state. The loop rides gsap.ticker, which the
   rest of the site (Lenis, ScrollTrigger) already shares — one RAF for the
   whole page.
   ========================================================================== */

/**
 * Palette matches what the site actually renders, not DESIGN.md: `--primary`
 * is never defined in `:root`, so every stylesheet falls through to the orange
 * `#fb923c` fallback. `--accent` (rose-plum) is real and comes from globals.css.
 */
const PALETTE = {
  /** --ink, graphite resting state */
  restCore: new THREE.Color(0.05, 0.06, 0.07),
  restEdge: new THREE.Color(0.24, 0.25, 0.27),
  /** --primary fallback #fb923c — the site's live accent */
  primary: new THREE.Color(0.984, 0.573, 0.235),
  primaryLift: new THREE.Color(1.0, 0.8, 0.55),
  /** --accent: oklch(0.45 0.15 330) deep rose-plum */
  accent: new THREE.Color(0.62, 0.19, 0.45),
  accentLift: new THREE.Color(0.95, 0.55, 0.78)
};

const SIMPLEX_GLSL = `
  vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

  float snoise(vec3 v){
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + 1.0 * C.xxx;
    vec3 x2 = x0 - i2 + 2.0 * C.xxx;
    vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

    i = mod(i, 289.0);
    vec4 p = permute(permute(permute(
               i.z + vec4(0.0, i1.z, i2.z, 1.0))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0))
             + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }
`;

const MAIN_VERTEX = `
  uniform float u_time;
  uniform float u_level;
  uniform float u_low;
  uniform float u_high;
  uniform float u_breath;

  varying vec3 vViewNormal;
  varying vec3 vViewPosition;
  varying float vDisplacement;

  ${SIMPLEX_GLSL}

  // Two octaves: a slow swell driven by the low band, plus fine ripple from
  // the high band. Wrapped so the same maths can perturb the normal.
  // Hard-clamped: the silhouette must never leave the camera frustum, whatever
  // the noise or the audio levels do.
  float fieldAt(vec3 p, float t) {
    float swell = snoise(p * 1.35 + vec3(t * 0.42)) * (0.055 + u_low * 0.30);
    float ripple = snoise(p * 3.6 - vec3(t * 0.95)) * (0.010 + u_high * 0.075);
    return clamp(swell + ripple, -0.24, 0.24);
  }

  void main() {
    float t = u_time;
    vec3 basePos = position * u_breath;

    float displacement = fieldAt(basePos, t);
    vDisplacement = displacement;

    vec3 newPos = basePos + normal * displacement;

    // Perturb the normal with finite differences so the lighting follows the
    // deformation instead of staying glued to the undisplaced sphere.
    float eps = 0.035;
    vec3 tangent = normalize(abs(normal.y) < 0.99 ? cross(normal, vec3(0.0, 1.0, 0.0))
                                                 : cross(normal, vec3(1.0, 0.0, 0.0)));
    vec3 bitangent = normalize(cross(normal, tangent));

    float dT = fieldAt(basePos + tangent * eps, t) - displacement;
    float dB = fieldAt(basePos + bitangent * eps, t) - displacement;

    vec3 perturbed = normalize(normal - (tangent * dT + bitangent * dB) / eps);

    vViewNormal = normalize(normalMatrix * perturbed);
    vec4 mvPosition = modelViewMatrix * vec4(newPos, 1.0);
    vViewPosition = mvPosition.xyz;

    gl_Position = projectionMatrix * mvPosition;
  }
`;

const MAIN_FRAGMENT = `
  uniform vec3 u_coreColor;
  uniform vec3 u_edgeColor;
  uniform float u_level;
  uniform float u_opacity;

  varying vec3 vViewNormal;
  varying vec3 vViewPosition;
  varying float vDisplacement;

  void main() {
    vec3 viewDir = normalize(-vViewPosition);
    float facing = max(dot(viewDir, vViewNormal), 0.0);
    float fresnel = pow(1.0 - facing, 2.4);

    // Single soft key light, upper-left, keeps the sphere reading as a volume.
    vec3 lightDir = normalize(vec3(-0.45, 0.75, 0.6));
    float diffuse = 0.35 + 0.65 * max(dot(vViewNormal, lightDir), 0.0);

    float crest = clamp(vDisplacement * 4.0 + 0.5, 0.0, 1.0);
    vec3 body = mix(u_coreColor, u_edgeColor, crest * 0.85);
    body *= diffuse;

    vec3 finalColor = mix(body, u_edgeColor, fresnel * 0.9);
    finalColor += u_edgeColor * u_level * 0.25;

    gl_FragColor = vec4(finalColor, u_opacity * (0.86 + fresnel * 0.14));
  }
`;

const AURA_VERTEX = `
  uniform float u_time;
  uniform float u_level;
  uniform float u_breath;

  varying vec3 vViewNormal;
  varying vec3 vViewPosition;

  void main() {
    float wobble = sin(position.x * 2.2 + u_time * 0.55) * 0.035;
    vec3 newPos = position * u_breath + normal * (wobble + u_level * 0.16);

    vViewNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(newPos, 1.0);
    vViewPosition = mvPosition.xyz;

    gl_Position = projectionMatrix * mvPosition;
  }
`;

const AURA_FRAGMENT = `
  uniform vec3 u_edgeColor;
  uniform float u_level;
  uniform float u_opacity;

  varying vec3 vViewNormal;
  varying vec3 vViewPosition;

  void main() {
    vec3 viewDir = normalize(-vViewPosition);
    float fresnel = pow(1.0 - max(dot(viewDir, vViewNormal), 0.0), 3.4);
    gl_FragColor = vec4(u_edgeColor, fresnel * (0.30 + u_level * 0.40) * u_opacity);
  }
`;

const CORE_VERTEX = `
  uniform float u_time;
  uniform float u_level;
  uniform float u_breath;

  varying float vRim;

  void main() {
    float pulse = 1.0 + sin(u_time * 1.6) * 0.03 + u_level * 0.30;
    vec3 newPos = position * u_breath * pulse;

    vec4 mvPosition = modelViewMatrix * vec4(newPos, 1.0);
    vRim = 1.0 - max(dot(normalize(normalMatrix * normal), normalize(-mvPosition.xyz)), 0.0);

    gl_Position = projectionMatrix * mvPosition;
  }
`;

const CORE_FRAGMENT = `
  uniform vec3 u_coreLift;
  uniform float u_level;
  uniform float u_opacity;

  varying float vRim;

  void main() {
    float glow = 0.55 + u_level * 0.45;
    gl_FragColor = vec4(u_coreLift * glow, (0.75 - vRim * 0.35) * u_opacity);
  }
`;

interface VoiceOrbProps {
  phase: LivePhase;
  getLevels: () => AudioLevels;
  className?: string;
}

/** Per-phase colour + motion targets. Everything is lerped toward these. */
function targetsFor(phase: LivePhase) {
  switch (phase) {
    case 'listening':
      return { core: PALETTE.restCore, edge: PALETTE.primary, lift: PALETTE.primaryLift, spin: 0.22, gain: 0.75 };
    case 'thinking':
      return { core: PALETTE.restCore, edge: PALETTE.primary, lift: PALETTE.primaryLift, spin: 0.75, gain: 0.12 };
    case 'speaking':
      return { core: PALETTE.restCore, edge: PALETTE.accent, lift: PALETTE.accentLift, spin: 0.30, gain: 1.0 };
    case 'connecting':
      return { core: PALETTE.restCore, edge: PALETTE.restEdge, lift: PALETTE.primaryLift, spin: 0.55, gain: 0.1 };
    case 'error':
      return { core: PALETTE.restCore, edge: PALETTE.accent, lift: PALETTE.accentLift, spin: 0.05, gain: 0.0 };
    default:
      return { core: PALETTE.restCore, edge: PALETTE.restEdge, lift: PALETTE.primaryLift, spin: 0.14, gain: 0.0 };
  }
}

export default function VoiceOrb({ phase, getLevels, className }: VoiceOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phaseRef = useRef<LivePhase>(phase);
  const levelsRef = useRef(getLevels);

  // The render loop lives outside React, so it reads the latest phase and level
  // getter through refs. Syncing them in an effect keeps render itself pure.
  useEffect(() => {
    phaseRef.current = phase;
    levelsRef.current = getLevels;
  }, [phase, getLevels]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    } catch {
      // No WebGL: the CSS halo behind the canvas is the graceful fallback.
      return;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 3.4;

    const uniforms = {
      u_time: { value: 0 },
      u_level: { value: 0 },
      u_low: { value: 0 },
      u_high: { value: 0 },
      u_breath: { value: 1 },
      u_opacity: { value: 0 },
      u_coreColor: { value: PALETTE.restCore.clone() },
      u_edgeColor: { value: PALETTE.restEdge.clone() },
      u_coreLift: { value: PALETTE.primaryLift.clone() }
    };

    const layer = (
      radius: number,
      detail: number,
      vertexShader: string,
      fragmentShader: string,
      extra?: Partial<THREE.ShaderMaterialParameters>
    ) => {
      const geometry = new THREE.IcosahedronGeometry(radius, detail);
      const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms,
        transparent: true,
        ...extra
      });
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
      return { geometry, material, mesh };
    };

    const core = layer(0.40, 12, CORE_VERTEX, CORE_FRAGMENT, { depthWrite: false });
    // detail 24 → ~4k verts: smooth silhouette without wasting fill on a 90px orb.
    const main = layer(0.74, 24, MAIN_VERTEX, MAIN_FRAGMENT);
    const aura = layer(0.98, 16, AURA_VERTEX, AURA_FRAGMENT, {
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    /* ------------------------------------------------------------- sizing */

    let width = 0;
    let height = 0;

    const resize = () => {
      const rect = host.getBoundingClientRect();
      const w = Math.max(1, Math.round(rect.width));
      const h = Math.max(1, Math.round(rect.height));
      if (w === width && h === height) return;
      width = w;
      height = h;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };

    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);

    /* --------------------------------------------------------------- loop */

    let elapsed = 0;
    let spin = 0.14;
    let visible = !document.hidden;

    const currentCore = PALETTE.restCore.clone();
    const currentEdge = PALETTE.restEdge.clone();
    const currentLift = PALETTE.primaryLift.clone();

    const onVisibility = () => {
      visible = !document.hidden;
    };
    document.addEventListener('visibilitychange', onVisibility);

    const tick = (_time: number, deltaMs: number) => {
      if (!visible) return;

      const delta = Math.min(deltaMs, 50) / 1000;
      const target = targetsFor(phaseRef.current);
      const levels = levelsRef.current();

      // Idle breathing: very slow, very shallow. This is the only motion when
      // nobody is talking, and it is what makes the orb feel alive at rest.
      const breath = reducedMotion ? 1 : 1 + Math.sin(elapsed * 0.75) * 0.015;

      if (!reducedMotion) {
        elapsed += delta;
        uniforms.u_time.value = elapsed;
      }

      const gain = reducedMotion ? 0 : target.gain;
      uniforms.u_level.value += (levels.level * gain - uniforms.u_level.value) * 0.2;
      uniforms.u_low.value += (levels.low * gain - uniforms.u_low.value) * 0.2;
      uniforms.u_high.value += (levels.high * gain - uniforms.u_high.value) * 0.25;
      uniforms.u_breath.value = breath;
      uniforms.u_opacity.value += (1 - uniforms.u_opacity.value) * 0.08;

      currentCore.lerp(target.core, 0.05);
      currentEdge.lerp(target.edge, 0.05);
      currentLift.lerp(target.lift, 0.05);
      uniforms.u_coreColor.value.copy(currentCore);
      uniforms.u_edgeColor.value.copy(currentEdge);
      uniforms.u_coreLift.value.copy(currentLift);

      spin += (target.spin - spin) * 0.04;

      if (!reducedMotion) {
        main.mesh.rotation.y += spin * delta;
        main.mesh.rotation.x = Math.sin(elapsed * 0.19) * 0.14;
        aura.mesh.rotation.y -= spin * 0.7 * delta;
        aura.mesh.rotation.z = Math.cos(elapsed * 0.16) * 0.1;
        core.mesh.rotation.y += spin * 1.6 * delta;
      }

      renderer.render(scene, camera);
    };

    // Share the site's single RAF (Lenis + ScrollTrigger already ride it).
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      document.removeEventListener('visibilitychange', onVisibility);
      resizeObserver.disconnect();

      for (const l of [core, main, aura]) {
        l.geometry.dispose();
        l.material.dispose();
      }
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
