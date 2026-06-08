<script setup lang="ts">
const container = ref<HTMLElement | null>(null);
const loading = ref(true);
const errored = ref(false);

let cleanup: (() => void) | undefined;

onMounted(async () => {
  if (!container.value) return;

  const THREE = await import("three");
  const { GLTFLoader } =
    await import("three/examples/jsm/loaders/GLTFLoader.js");
  const { EffectComposer } =
    await import("three/examples/jsm/postprocessing/EffectComposer.js");
  const { RenderPass } =
    await import("three/examples/jsm/postprocessing/RenderPass.js");
  const { ShaderPass } =
    await import("three/examples/jsm/postprocessing/ShaderPass.js");
  const { UnrealBloomPass } =
    await import("three/examples/jsm/postprocessing/UnrealBloomPass.js");
  const { OutputPass } =
    await import("three/examples/jsm/postprocessing/OutputPass.js");
  const { RoomEnvironment } =
    await import("three/examples/jsm/environments/RoomEnvironment.js");

  const el = container.value;
  const width = el.clientWidth || 1;
  const height = el.clientHeight || 1;

  // ── Renderer (transparent so the HUD background shows through) ──
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.85;
  el.appendChild(renderer.domElement);
  renderer.domElement.style.display = "block";
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  renderer.domElement.style.cursor = "grab";

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
  camera.position.set(0, 0, 4);

  // Neutral studio environment so the PBR textures read correctly.
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTexture;

  // Fill / key lighting to lift the figure off the dark HUD background.
  scene.add(new THREE.AmbientLight(0xffffff, 0.35));
  const key = new THREE.DirectionalLight(0xffffff, 0.75);
  key.position.set(1.5, 2.5, 3);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffffff, 0.6);
  rim.position.set(-2, 1, -2);
  scene.add(rim);

  // Pivot group → we rotate this horizontally (around Y).
  const pivot = new THREE.Group();
  scene.add(pivot);

  // ── Load the GLB model (keep original textures) ────────────────
  const loader = new GLTFLoader();
  const MODEL_URL = "/images/human+character+3d+model.glb";

  loader.load(
    MODEL_URL,
    (gltf) => {
      const model = gltf.scene;

      // Low-poly faceted look + matte surface (no specular face hotspot).
      model.traverse((child: any) => {
        if (!child.isMesh) return;
        const mats = Array.isArray(child.material)
          ? child.material
          : [child.material];
        mats.forEach((mat: any) => {
          if (!mat) return;
          mat.flatShading = true; // faceted, hard edges
          if ("roughness" in mat) mat.roughness = 1.0; // fully matte
          if ("metalness" in mat) mat.metalness = 0.0; // kill reflections
          if ("envMapIntensity" in mat) mat.envMapIntensity = 0.25;
          mat.needsUpdate = true;
        });
        // Drop smoothed vertex normals so flatShading recomputes hard facets.
        if (child.geometry) child.geometry.deleteAttribute("normal");
      });

      // Center on X/Z so it spins in place; normalize height to 2 units.
      const box = new THREE.Box3().setFromObject(model);
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      box.getSize(size);
      box.getCenter(center);

      model.position.sub(center); // center the bounding box at origin

      const scale = 2 / (size.y || 1);
      model.scale.setScalar(scale);

      pivot.add(model);

      // ── Frame as a head-and-shoulders bust (matches the mockup) ──
      // Normalized height is 2 → top of head at +1, base at -1.
      const fovRad = (camera.fov * Math.PI) / 180;
      const visibleHeight = 2 * 1.15; // show the full figure with margin (zoomed out 25%)
      const dist = visibleHeight / 2 / Math.tan(fovRad / 2);
      const targetY = 1 - 2 * 0.45; // aim near center, with headroom up top
      camera.position.set(0, targetY, dist);
      camera.lookAt(0, targetY, 0);
      camera.updateProjectionMatrix();

      // Nudge the model down by ~200px (converted to world units).
      const worldPerPx = visibleHeight / height;
      model.position.y -= 200 * worldPerPx;

      loading.value = false;
    },
    undefined,
    (err) => {
      console.error("[ModelViewer] failed to load GLB:", err);
      errored.value = true;
      loading.value = false;
    },
  );

  // ── Post-processing: bloom + CRT scanline / hologram filter ─────
  const composer = new EffectComposer(renderer);
  composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  composer.setSize(width, height);

  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(width, height),
    0.12, // strength — barely-there glow on highlights
    0.4, // radius
    0.85, // threshold — only the brightest specular blooms
  );
  composer.addPass(bloomPass);

  const ScanlineShader = {
    uniforms: {
      tDiffuse: { value: null as any },
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(width, height) },
      uScanIntensity: { value: 0.1 },
      uScanCount: { value: 900.0 },
      uSaturation: { value: 0.72 }, // <1 = slightly desaturated
      uPixelCols: { value: 200.0 }, // horizontal resolution of pixelation grid
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D tDiffuse;
      uniform float uTime;
      uniform vec2 uResolution;
      uniform float uScanIntensity;
      uniform float uScanCount;
      uniform float uSaturation;
      uniform float uPixelCols;
      varying vec2 vUv;

      float rand(vec2 co) {
        return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
      }

      void main() {
        vec2 uv = vUv;

        // Pixelation — snap UVs to a coarse grid before sampling.
        vec2 grid = vec2(uPixelCols, uPixelCols * uResolution.y / uResolution.x);
        vec2 puv = (floor(uv * grid) + 0.5) / grid;
        vec4 color = texture2D(tDiffuse, puv);

        // Slight desaturation toward luminance (keeps it on-theme).
        float luma = dot(color.rgb, vec3(0.299, 0.587, 0.114));
        color.rgb = mix(vec3(luma), color.rgb, uSaturation);

        // Fine horizontal scanlines.
        float scan = sin((uv.y * uScanCount) - uTime * 8.0);
        scan = (scan * 0.5 + 0.5);
        color.rgb *= 1.0 - uScanIntensity * scan;

        // Subtle animated noise / signal grain.
        float n = rand(uv * uResolution.xy + uTime * 60.0);
        color.rgb += (n - 0.5) * 0.035;

        // Gentle vignette to focus the scan.
        vec2 c = uv - 0.5;
        float vig = smoothstep(0.95, 0.45, length(c));
        color.rgb *= mix(0.85, 1.0, vig);

        gl_FragColor = color;
      }
    `,
  };

  const scanlinePass = new ShaderPass(ScanlineShader);
  composer.addPass(scanlinePass);

  const outputPass = new OutputPass();
  composer.addPass(outputPass);

  // ── Horizontal drag rotation (spins model around vertical axis) ─
  let isDragging = false;
  let lastX = 0;
  let velocity = 0; // radians per frame, with inertia
  const AUTO_SPIN = 0.0025;

  function onPointerDown(e: PointerEvent) {
    isDragging = true;
    lastX = e.clientX;
    velocity = 0;
    renderer.domElement.style.cursor = "grabbing";
    renderer.domElement.setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: PointerEvent) {
    if (!isDragging) return;
    const dx = e.clientX - lastX;
    lastX = e.clientX;
    const delta = dx * 0.01;
    pivot.rotation.y += delta;
    velocity = delta;
  }
  function onPointerUp(e: PointerEvent) {
    isDragging = false;
    renderer.domElement.style.cursor = "grab";
    try {
      renderer.domElement.releasePointerCapture(e.pointerId);
    } catch {}
  }

  renderer.domElement.addEventListener("pointerdown", onPointerDown);
  renderer.domElement.addEventListener("pointermove", onPointerMove);
  renderer.domElement.addEventListener("pointerup", onPointerUp);
  renderer.domElement.addEventListener("pointerleave", onPointerUp);

  // ── Resize handling ────────────────────────────────────────────
  const resize = () => {
    const w = el.clientWidth || 1;
    const h = el.clientHeight || 1;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    composer.setSize(w, h);
    bloomPass.setSize(w, h);
    scanlinePass.uniforms.uResolution.value.set(w, h);
  };
  const ro = new ResizeObserver(resize);
  ro.observe(el);

  // ── Render loop ────────────────────────────────────────────────
  const clock = new THREE.Clock();
  let frame = 0;

  const animate = () => {
    frame = requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    scanlinePass.uniforms.uTime.value = t;

    if (!isDragging) {
      // inertia after a drag, then settle into a gentle auto-spin
      if (Math.abs(velocity) > 0.0005) {
        pivot.rotation.y += velocity;
        velocity *= 0.95;
      } else {
        pivot.rotation.y += AUTO_SPIN;
      }
    }

    composer.render();
  };
  animate();

  // ── Cleanup ────────────────────────────────────────────────────
  cleanup = () => {
    cancelAnimationFrame(frame);
    ro.disconnect();
    renderer.domElement.removeEventListener("pointerdown", onPointerDown);
    renderer.domElement.removeEventListener("pointermove", onPointerMove);
    renderer.domElement.removeEventListener("pointerup", onPointerUp);
    renderer.domElement.removeEventListener("pointerleave", onPointerUp);
    composer.dispose();
    envTexture.dispose();
    pmrem.dispose();
    renderer.dispose();
    if (renderer.domElement.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement);
    }
  };
});

onUnmounted(() => {
  cleanup?.();
});
</script>

<template>
  <div ref="container" class="relative w-full h-full">
    <!-- Loading / signal-acquiring state -->
    <div
      v-if="loading"
      class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10"
    >
      <span
        class="font-mono text-[9px] uppercase tracking-[0.3em] text-[#919191] animate-pulse"
      >
        DECODING_SUIT_MESH…
      </span>
    </div>
    <div
      v-if="errored"
      class="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
    >
      <span
        class="font-mono text-[9px] uppercase tracking-[0.3em] text-red-400/80"
      >
        SIGNAL_LOST // MESH_UNAVAILABLE
      </span>
    </div>
  </div>
</template>
