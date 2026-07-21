/**
 * The signature scroll-reactive 3D hero (spec §4): a simplex-noise-displaced
 * torus — navy body with molten-gold fresnel/spec highlights — that idles
 * slowly and deforms + spins faster as the user scrolls. Loaded ONLY via
 * dynamic import from hero-island.ts after every guardrail has passed.
 *
 * Swappable concept: replace the Torus + shaders with a GLTF brand object
 * later without touching the island/guardrail layer.
 */
import { Camera, Mesh, Program, Renderer, Torus, Transform } from 'ogl';

// Simplex noise: Ian McEwan / Stefan Gustavson (Ashima Arts), MIT.
const NOISE_GLSL = /* glsl */ `
vec3 mod289(vec3 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 mod289(vec4 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+10.0)*x);}
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
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
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
  vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 105.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`;

const VERTEX = /* glsl */ `
attribute vec3 position;
attribute vec3 normal;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;
uniform float uTime;
uniform float uIntensity;
varying vec3 vNormal;
varying vec3 vView;
varying float vNoise;
${NOISE_GLSL}

float noiseAt(vec3 p) {
  return snoise(p * 1.35 + vec3(uTime * 0.22, uTime * 0.14, 0.0));
}

vec3 displace(vec3 p, vec3 n) {
  return p + n * noiseAt(p) * (0.10 + uIntensity * 0.6);
}

void main() {
  vec3 p = displace(position, normal);

  // Approximate the displaced normal by neighbor sampling on the tangent plane.
  vec3 axis = abs(normal.y) > 0.99 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0);
  vec3 tangent = normalize(cross(normal, axis));
  vec3 bitangent = normalize(cross(normal, tangent));
  float eps = 0.08;
  vec3 p1 = displace(position + tangent * eps, normal);
  vec3 p2 = displace(position + bitangent * eps, normal);
  vec3 n2 = cross(p1 - p, p2 - p);
  vNormal = normalize(normalMatrix * (dot(n2, normal) < 0.0 ? -n2 : n2));

  vNoise = noiseAt(position);
  vec4 mvPos = modelViewMatrix * vec4(p, 1.0);
  vView = -mvPos.xyz;
  gl_Position = projectionMatrix * mvPos;
}
`;

const FRAGMENT = /* glsl */ `
precision highp float;
varying vec3 vNormal;
varying vec3 vView;
varying float vNoise;
uniform float uGoldMix;

const vec3 NAVY      = vec3(0.031, 0.067, 0.141);
const vec3 NAVY_LIT  = vec3(0.129, 0.220, 0.400);
const vec3 GOLD      = vec3(0.850, 0.670, 0.220);
const vec3 GOLD_HOT  = vec3(0.980, 0.840, 0.420);

void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(vView);
  vec3 L = normalize(vec3(0.55, 0.75, 0.5));

  float diff = max(dot(N, L), 0.0);
  float fresnel = pow(1.0 - max(dot(N, V), 0.0), 2.4);

  vec3 base = mix(NAVY, NAVY_LIT, diff);
  float molten = smoothstep(0.35, 0.95, vNoise) * uGoldMix;
  float goldAmt = clamp(fresnel * 1.1 + molten, 0.0, 1.0);
  vec3 col = mix(base, mix(GOLD, GOLD_HOT, molten), goldAmt);

  vec3 H = normalize(L + V);
  col += GOLD_HOT * pow(max(dot(N, H), 0.0), 42.0) * 0.55;

  gl_FragColor = vec4(col, 1.0);
}
`;

export interface HeroScene {
  pause(): void;
  resume(): void;
  destroy(): void;
}

export function createHeroScene(mount: HTMLElement): HeroScene {
  const renderer = new Renderer({
    dpr: Math.min(window.devicePixelRatio || 1, 2),
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  });
  const gl = renderer.gl;
  gl.clearColor(0, 0, 0, 0);
  Object.assign(gl.canvas.style, {
    position: 'absolute',
    inset: '0',
    width: '100%',
    height: '100%',
  });
  mount.appendChild(gl.canvas);

  const camera = new Camera(gl, { fov: 35 });
  camera.position.set(0, 0, 7);
  const sceneRoot = new Transform();

  const geometry = new Torus(gl, {
    radius: 1.6,
    tube: 0.62,
    radialSegments: 128,
    tubularSegments: 48,
  });
  const program = new Program(gl, {
    vertex: VERTEX,
    fragment: FRAGMENT,
    uniforms: {
      uTime: { value: 0 },
      uIntensity: { value: 0 },
      uGoldMix: { value: 0.25 },
    },
  });
  const mesh = new Mesh(gl, { geometry, program });
  mesh.setParent(sceneRoot);

  // --- scroll + pointer state -------------------------------------------
  let scrollProgress = 0; // 0..1 across the first viewport height
  let scrollVelocity = 0;
  let pointerX = 0;
  let pointerY = 0;
  let smoothedVelocity = 0;

  const onNativeScroll = () => {
    scrollProgress = Math.min(window.scrollY / window.innerHeight, 1);
  };

  const attachLenis = (): boolean => {
    const lenis = window.__lenis;
    if (!lenis) return false;
    lenis.on('scroll', ({ velocity }: { velocity: number }) => {
      scrollProgress = Math.min(window.scrollY / window.innerHeight, 1);
      scrollVelocity = velocity;
    });
    return true;
  };
  if (!attachLenis()) {
    // Lenis not up yet (module order) or reduced-motion native scrolling.
    document.addEventListener('ka:motion-ready', () => attachLenis(), {
      once: true,
    });
    window.addEventListener('scroll', onNativeScroll, { passive: true });
  }

  const onPointerMove = (e: PointerEvent) => {
    pointerX = (e.clientX / window.innerWidth) * 2 - 1;
    pointerY = (e.clientY / window.innerHeight) * 2 - 1;
  };
  window.addEventListener('pointermove', onPointerMove, { passive: true });

  // --- sizing ------------------------------------------------------------
  let resizeQueued = false;
  const setSize = () => {
    resizeQueued = false;
    const w = mount.clientWidth || 1;
    const h = mount.clientHeight || 1;
    renderer.setSize(w, h);
    camera.perspective({ aspect: w / h });
  };
  const onResize = () => {
    if (!resizeQueued) {
      resizeQueued = true;
      requestAnimationFrame(setSize);
    }
  };
  window.addEventListener('resize', onResize);
  setSize();

  // --- render loop --------------------------------------------------------
  let running = true;
  let rafId = 0;
  let lastT = performance.now();
  let time = 0;

  const frame = (now: number) => {
    rafId = requestAnimationFrame(frame);
    const dt = Math.min((now - lastT) / 1000, 0.05);
    lastT = now;
    time += dt;

    smoothedVelocity += (Math.abs(scrollVelocity) - smoothedVelocity) * 0.06;
    scrollVelocity *= 0.92;
    const energy = Math.min(smoothedVelocity / 40, 1);

    program.uniforms.uTime.value = time;
    program.uniforms.uIntensity.value = scrollProgress * 0.7 + energy * 0.5;
    program.uniforms.uGoldMix.value = 0.25 + scrollProgress * 0.55 + energy * 0.3;

    // Idle rotation, accelerated by scroll; subtle pointer parallax.
    const spin = 0.12 + scrollProgress * 0.5 + energy * 1.4;
    mesh.rotation.y += dt * spin;
    mesh.rotation.x += dt * spin * 0.45;
    sceneRoot.rotation.x += (pointerY * 0.18 - sceneRoot.rotation.x) * 0.04;
    sceneRoot.rotation.y += (pointerX * 0.22 - sceneRoot.rotation.y) * 0.04;

    renderer.render({ scene: sceneRoot, camera });
  };
  rafId = requestAnimationFrame(frame);

  const pause = () => {
    if (!running) return;
    running = false;
    cancelAnimationFrame(rafId);
  };
  const resume = () => {
    if (running) return;
    running = true;
    lastT = performance.now();
    rafId = requestAnimationFrame(frame);
  };

  const destroy = () => {
    pause();
    window.removeEventListener('resize', onResize);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('scroll', onNativeScroll);
    geometry.remove();
    program.remove();
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    gl.canvas.remove();
  };

  return { pause, resume, destroy };
}
