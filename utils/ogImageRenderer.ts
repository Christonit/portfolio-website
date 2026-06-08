import type {
  DirectionalLight,
  Group,
  Object3D,
  PerspectiveCamera,
  PMREMGenerator,
  Scene,
  Texture,
  WebGLRenderer,
} from "three";

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;
export const MODEL_URL = "/images/human+character+3d+model.glb";

export interface OgSceneHandle {
  rotationY: number;
  renderFrame: (time?: number) => void;
  exportPng: () => string;
  dispose: () => void;
}

interface FrameModelState {
  localMinY: number;
  localMaxY: number;
  modelHeight: number;
}

function frameModel(
  camera: PerspectiveCamera,
  model: Object3D,
  viewW: number,
  viewH: number,
  state: FrameModelState,
) {
  const { localMinY, localMaxY, modelHeight } = state;
  const isWideViewport = viewW / viewH >= 0.9;

  const bottomPadPx = isWideViewport ? 44 : 34;
  const topPadPx = isWideViewport ? 28 : 22;
  const marginFactor = (isWideViewport ? 1.65 : 1.22) * 0.8;

  const fovRad = (camera.fov * Math.PI) / 180;
  const visibleHeight = modelHeight * marginFactor;
  const dist = visibleHeight / (2 * Math.tan(fovRad / 2));
  const halfVisible = visibleHeight / 2;
  const worldPerPx = visibleHeight / viewH;
  const bottomPad = bottomPadPx * worldPerPx;
  const topPad = topPadPx * worldPerPx;

  const modelBottomY = -halfVisible + bottomPad;
  model.position.y = modelBottomY - localMinY;

  const modelTop = modelBottomY + modelHeight;
  const faceY = modelBottomY + modelHeight * 0.74;

  camera.position.set(0, faceY, dist);
  camera.lookAt(0, faceY, 0);
  camera.updateProjectionMatrix();

  if (modelTop > faceY + halfVisible - topPad) {
    const extra = (modelTop - (faceY + halfVisible - topPad)) / modelHeight;
    const adjustedMargin = marginFactor + extra + 0.08;
    const adjustedVisible = modelHeight * adjustedMargin;
    const adjustedDist = adjustedVisible / (2 * Math.tan(fovRad / 2));
    const adjustedHalf = adjustedVisible / 2;
    const adjustedWorldPerPx = adjustedVisible / viewH;
    const adjustedBottomPad = bottomPadPx * adjustedWorldPerPx;

    const adjustedBottomY = -adjustedHalf + adjustedBottomPad;
    model.position.y = adjustedBottomY - localMinY;
    const adjustedFaceY = adjustedBottomY + modelHeight * 0.74;

    camera.position.set(0, adjustedFaceY, adjustedDist);
    camera.lookAt(0, adjustedFaceY, 0);
    camera.updateProjectionMatrix();
  }
}

function drawBackground(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "#131313";
  ctx.fillRect(0, 0, OG_WIDTH, OG_HEIGHT);

  ctx.fillStyle = "rgba(71, 71, 71, 0.18)";
  const spacing = 32;
  for (let x = 0; x < OG_WIDTH; x += spacing) {
    for (let y = 0; y < OG_HEIGHT; y += spacing) {
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawScanlines(ctx: CanvasRenderingContext2D) {
  for (let y = 0; y < OG_HEIGHT; y += 3) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.025)";
    ctx.fillRect(0, y, OG_WIDTH, 1);
  }
}

function drawHudOverlays(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, OG_WIDTH - 1, OG_HEIGHT - 1);

  const drawCorner = (x: number, y: number, dx: number, dy: number) => {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + dx, y);
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + dy);
    ctx.stroke();
  };

  drawCorner(0, 0, 10, 10);
  drawCorner(OG_WIDTH, 0, -10, 10);
  drawCorner(0, OG_HEIGHT, 10, -10);
  drawCorner(OG_WIDTH, OG_HEIGHT, -10, -10);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
  ctx.beginPath();
  ctx.moveTo(16, 16);
  ctx.lineTo(16, 36);
  ctx.lineTo(36, 36);
  ctx.stroke();

  ctx.fillStyle = "#919191";
  ctx.font =
    "700 14px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
  ctx.textBaseline = "top";
  ctx.fillText("SCAN_LOCK: TARGET_ACQUIRED", 42, 18);

  const gradient = ctx.createLinearGradient(0, OG_HEIGHT - 120, 0, OG_HEIGHT);
  gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
  gradient.addColorStop(1, "rgba(0, 0, 0, 0.9)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, OG_HEIGHT - 120, OG_WIDTH, 120);

  ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
  ctx.beginPath();
  ctx.moveTo(OG_WIDTH / 2, OG_HEIGHT - 72);
  ctx.lineTo(OG_WIDTH / 2 - 8, OG_HEIGHT - 61);
  ctx.lineTo(OG_WIDTH / 2 + 8, OG_HEIGHT - 61);
  ctx.closePath();
  ctx.fill();

  ctx.textAlign = "center";
  ctx.fillStyle = "#919191";
  ctx.font =
    "700 16px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
  ctx.fillText("SUIT INTEGRITY HIGH", OG_WIDTH / 2, OG_HEIGHT - 52);

  ctx.fillStyle = "#474747";
  ctx.font =
    "400 12px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
  ctx.fillText("OPTIMAL_V_2.4", OG_WIDTH / 2, OG_HEIGHT - 30);
  ctx.textAlign = "left";
}

function compositeFrame(webglCanvas: HTMLCanvasElement): string {
  const canvas = document.createElement("canvas");
  canvas.width = OG_WIDTH;
  canvas.height = OG_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create export canvas");

  drawBackground(ctx);
  ctx.drawImage(webglCanvas, 0, 0, OG_WIDTH, OG_HEIGHT);
  drawScanlines(ctx);
  drawHudOverlays(ctx);

  return canvas.toDataURL("image/png");
}

export async function createOgScene(
  container: HTMLElement,
): Promise<OgSceneHandle> {
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

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(1);
  renderer.setSize(OG_WIDTH, OG_HEIGHT, false);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.85;
  container.appendChild(renderer.domElement);
  renderer.domElement.style.display = "block";
  renderer.domElement.style.width = `${OG_WIDTH}px`;
  renderer.domElement.style.height = `${OG_HEIGHT}px`;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    35,
    OG_WIDTH / OG_HEIGHT,
    0.1,
    100,
  );

  const pmrem: PMREMGenerator = new THREE.PMREMGenerator(renderer);
  const envTexture: Texture = pmrem.fromScene(
    new RoomEnvironment(),
    0.04,
  ).texture;
  scene.environment = envTexture;

  scene.add(new THREE.AmbientLight(0xffffff, 0.35));
  const key: DirectionalLight = new THREE.DirectionalLight(0xffffff, 0.75);
  key.position.set(1.5, 2.5, 3);
  scene.add(key);
  const rim: DirectionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
  rim.position.set(-2, 1, -2);
  scene.add(rim);

  const pivot: Group = new THREE.Group();
  scene.add(pivot);

  const composer = new EffectComposer(renderer);
  composer.setPixelRatio(1);
  composer.setSize(OG_WIDTH, OG_HEIGHT);

  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(OG_WIDTH, OG_HEIGHT),
    0.12,
    0.4,
    0.85,
  );
  composer.addPass(bloomPass);

  const ScanlineShader = {
    uniforms: {
      tDiffuse: { value: null as unknown },
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(OG_WIDTH, OG_HEIGHT) },
      uScanIntensity: { value: 0.1 },
      uScanCount: { value: 900.0 },
      uSaturation: { value: 0.72 },
      uPixelCols: { value: 320.0 },
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
        vec2 grid = vec2(uPixelCols, uPixelCols * uResolution.y / uResolution.x);
        vec2 puv = (floor(uv * grid) + 0.5) / grid;
        vec4 color = texture2D(tDiffuse, puv);

        float luma = dot(color.rgb, vec3(0.299, 0.587, 0.114));
        color.rgb = mix(vec3(luma), color.rgb, uSaturation);

        float scan = sin((uv.y * uScanCount) - uTime * 8.0);
        scan = (scan * 0.5 + 0.5);
        color.rgb *= 1.0 - uScanIntensity * scan;

        float n = rand(uv * uResolution.xy + uTime * 60.0);
        color.rgb += (n - 0.5) * 0.035;

        vec2 c = uv - 0.5;
        float vig = smoothstep(0.95, 0.45, length(c));
        color.rgb *= mix(0.85, 1.0, vig);

        gl_FragColor = color;
      }
    `,
  };

  const scanlinePass = new ShaderPass(ScanlineShader);
  composer.addPass(scanlinePass);
  composer.addPass(new OutputPass());

  let frameState: FrameModelState | null = null;
  let rotationY = 0.72;

  await new Promise<void>((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load(
      MODEL_URL,
      (gltf) => {
        const model = gltf.scene;

        model.traverse((child: unknown) => {
          const mesh = child as {
            isMesh?: boolean;
            material?: unknown;
            geometry?: { deleteAttribute: (name: string) => void };
          };
          if (!mesh.isMesh) return;
          const mats = Array.isArray(mesh.material)
            ? mesh.material
            : [mesh.material];
          mats.forEach((mat) => {
            if (!mat) return;
            const surface = mat as {
              flatShading?: boolean;
              roughness?: number;
              metalness?: number;
              envMapIntensity?: number;
              needsUpdate?: boolean;
            };
            surface.flatShading = true;
            if ("roughness" in surface) surface.roughness = 1.0;
            if ("metalness" in surface) surface.metalness = 0.0;
            if ("envMapIntensity" in surface) surface.envMapIntensity = 0.25;
            surface.needsUpdate = true;
          });
          if (mesh.geometry) mesh.geometry.deleteAttribute("normal");
        });

        const box = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3();
        const center = new THREE.Vector3();
        box.getSize(size);
        box.getCenter(center);
        model.position.sub(center);

        const scale = 2 / (size.y || 1);
        model.scale.setScalar(scale);

        const scaledBox = new THREE.Box3().setFromObject(model);
        model.position.x -= (scaledBox.min.x + scaledBox.max.x) / 2;
        model.position.z -= (scaledBox.min.z + scaledBox.max.z) / 2;

        frameState = {
          localMinY: scaledBox.min.y,
          localMaxY: scaledBox.max.y,
          modelHeight: scaledBox.max.y - scaledBox.min.y,
        };

        pivot.add(model);
        frameModel(camera, model, OG_WIDTH, OG_HEIGHT, frameState);
        resolve();
      },
      undefined,
      reject,
    );
  });

  const renderFrame = (time = 0) => {
    scanlinePass.uniforms.uTime.value = time;
    pivot.rotation.y = rotationY;
    composer.render();
  };

  renderFrame(0);

  return {
    get rotationY() {
      return rotationY;
    },
    set rotationY(value: number) {
      rotationY = value;
      renderFrame(0);
    },
    renderFrame,
    exportPng: () => {
      renderFrame(0);
      return compositeFrame(renderer.domElement);
    },
    dispose: () => {
      composer.dispose();
      envTexture.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.click();
}
