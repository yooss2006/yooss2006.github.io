export type RainIntensity = "drizzle" | "shower" | "storm";

type RainLayerName = "far" | "mid" | "near";

type Range = readonly [number, number];

interface LayerConfig {
  name: RainLayerName;
  share: number;
  length: Range;
  thickness: Range;
  opacity: Range;
  velocity: Range;
  blur: Range;
}

interface IntensityConfig {
  densityMultiplier: number;
  opacityMultiplier: number;
  velocityMultiplier: number;
  baseDrops: number;
  spawnRate: number;
}

interface RainDrop {
  x: number;
  y: number;
  length: number;
  thickness: 0 | 1 | 2;
  alpha: number;
  velocity: number;
  drift: number;
  layer: LayerConfig;
}

interface Ripple {
  x: number;
  y: number;
  age: number;
  life: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

export interface RainEngineOptions {
  intensity: RainIntensity;
  wind?: number;
  color?: string;
}

export const RAIN_INTENSITY_CONFIG: Record<RainIntensity, IntensityConfig> = {
  drizzle: {
    densityMultiplier: 0.58,
    opacityMultiplier: 0.92,
    velocityMultiplier: 0.86,
    baseDrops: 640,
    spawnRate: 620,
  },
  shower: {
    densityMultiplier: 0.66,
    opacityMultiplier: 0.78,
    velocityMultiplier: 1,
    baseDrops: 760,
    spawnRate: 1150,
  },
  storm: {
    densityMultiplier: 0.82,
    opacityMultiplier: 0.92,
    velocityMultiplier: 1.18,
    baseDrops: 1040,
    spawnRate: 1760,
  },
};

const LAYERS: readonly LayerConfig[] = [
  {
    name: "far",
    share: 0.38,
    length: [5, 12],
    thickness: [0.5, 1],
    opacity: [0.04, 0.1],
    velocity: [500, 900],
    blur: [0, 0.4],
  },
  {
    name: "mid",
    share: 0.4,
    length: [10, 24],
    thickness: [0.75, 1.5],
    opacity: [0.07, 0.18],
    velocity: [900, 1500],
    blur: [0, 0.8],
  },
  {
    name: "near",
    share: 0.22,
    length: [22, 48],
    thickness: [1, 2.5],
    opacity: [0.11, 0.28],
    velocity: [1400, 2500],
    blur: [0.2, 1.5],
  },
];

const BASE_AREA = 1920 * 1080;
const MAX_DELTA_SECONDS = 0.04;
const TARGET_FRAME_MS = 1000 / 30;
const THICKNESS_BUCKETS = [0.7, 1.15, 1.75] as const;
const RENDER_SCALE_DESKTOP = 0.75;
const RENDER_SCALE_MOBILE = 0.68;

export class RainCanvasEngine {
  private readonly canvas: HTMLCanvasElement;
  private readonly context: CanvasRenderingContext2D;
  private drops: RainDrop[] = [];
  private ripples: Ripple[] = [];
  private frameId = 0;
  private width = 0;
  private height = 0;
  private dpr = 1;
  private mobile = false;
  private lastTime = 0;
  private adaptiveQuality = 1;
  private slowFrameStreak = 0;
  private fastFrameStreak = 0;
  private running = false;
  private visible = true;
  private viewportActive = true;
  private density = 1;
  private densityTarget = 1;
  private nextDensityShift = 0;
  private gust = 0;
  private gustTarget = 0;
  private nextGustShift = 0;
  private options: Required<RainEngineOptions>;

  constructor(canvas: HTMLCanvasElement, options: RainEngineOptions) {
    const context = canvas.getContext("2d", { alpha: true });

    if (!context) {
      throw new Error("RainCanvasEngine requires a 2D canvas context.");
    }

    this.canvas = canvas;
    this.context = context;
    this.options = {
      intensity: options.intensity,
      wind: options.wind ?? 0,
      color: options.color ?? "rgb(206 226 232)",
    };
    this.resize();
  }

  updateOptions(options: RainEngineOptions) {
    this.options = {
      intensity: options.intensity,
      wind: options.wind ?? this.options.wind,
      color: options.color ?? this.options.color,
    };
    this.rebuildPool();
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const nextWidth = Math.max(1, Math.floor(rect.width || window.innerWidth));
    const nextHeight = Math.max(1, Math.floor(rect.height || window.innerHeight));
    const nextMobile = Math.min(window.innerWidth, window.innerHeight) < 768;
    const renderScale = nextMobile ? RENDER_SCALE_MOBILE : RENDER_SCALE_DESKTOP;
    const nextDpr = Math.min(window.devicePixelRatio || 1, nextMobile ? 1 : 1.5) * renderScale;

    if (nextWidth === this.width && nextHeight === this.height && nextDpr === this.dpr && nextMobile === this.mobile) {
      return;
    }

    this.width = nextWidth;
    this.height = nextHeight;
    this.dpr = nextDpr;
    this.mobile = nextMobile;
    this.canvas.width = Math.ceil(this.width * this.dpr);
    this.canvas.height = Math.ceil(this.height * this.dpr);
    this.context.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.rebuildPool();
  }

  setVisible(visible: boolean) {
    this.visible = visible;
    this.syncLoop();
  }

  setViewportActive(active: boolean) {
    this.viewportActive = active;
    this.syncLoop();
  }

  start() {
    this.running = true;
    this.syncLoop();
  }

  stop() {
    this.running = false;
    this.cancelFrame();
    this.clear();
  }

  destroy() {
    this.stop();
    this.drops = [];
    this.ripples = [];
  }

  private syncLoop() {
    if (!this.running || !this.visible || !this.viewportActive) {
      this.cancelFrame();
      return;
    }

    if (!this.frameId) {
      this.lastTime = performance.now();
      this.frameId = requestAnimationFrame(this.tick);
    }
  }

  private readonly tick = (time: number) => {
    this.frameId = 0;

    if (!this.running || !this.visible || !this.viewportActive) {
      return;
    }

    if (time - this.lastTime < TARGET_FRAME_MS) {
      this.frameId = requestAnimationFrame(this.tick);
      return;
    }

    const delta = Math.min((time - this.lastTime) / 1000, MAX_DELTA_SECONDS);
    this.updateAdaptiveQuality(time - this.lastTime);
    this.lastTime = time;
    this.update(delta, time);
    this.draw();
    this.frameId = requestAnimationFrame(this.tick);
  };

  private rebuildPool() {
    const config = RAIN_INTENSITY_CONFIG[this.options.intensity];
    const areaScale = Math.max(0.5, (this.width * this.height) / BASE_AREA);
    const mobileScale = Math.min(window.innerWidth, window.innerHeight) < 768 ? 0.36 : 0.72;
    const total = Math.round(config.baseDrops * config.densityMultiplier * areaScale * mobileScale);
    const nextDrops: RainDrop[] = [];

    for (const layer of LAYERS) {
      const count = Math.max(1, Math.round(total * layer.share));

      for (let index = 0; index < count; index += 1) {
        nextDrops.push(this.createDrop(layer, Math.random() * this.width, Math.random() * this.height));
      }
    }

    this.drops = nextDrops;
    this.ripples = [];
  }

  private updateAdaptiveQuality(frameMs: number) {
    if (frameMs > 52) {
      this.slowFrameStreak += 1;
      this.fastFrameStreak = 0;
    } else if (frameMs < 38) {
      this.fastFrameStreak += 1;
      this.slowFrameStreak = 0;
    } else {
      this.slowFrameStreak = 0;
      this.fastFrameStreak = 0;
    }

    if (this.slowFrameStreak >= 8) {
      this.adaptiveQuality = Math.max(0.62, this.adaptiveQuality - 0.08);
      this.slowFrameStreak = 0;
      return;
    }

    if (this.fastFrameStreak >= 90) {
      this.adaptiveQuality = Math.min(1, this.adaptiveQuality + 0.04);
      this.fastFrameStreak = 0;
    }
  }

  private createDrop(layer: LayerConfig, x: number, y: number): RainDrop {
    const length = random(layer.length);
    const lengthRatio = (length - layer.length[0]) / (layer.length[1] - layer.length[0] || 1);
    const alpha = random(layer.opacity) * (1 - lengthRatio * 0.42);

    return {
      x,
      y,
      length,
      thickness: pickThicknessBucket(random(layer.thickness)),
      alpha,
      velocity: random(layer.velocity),
      drift: random([-18, 18]),
      layer,
    };
  }

  private resetDrop(drop: RainDrop) {
    const fresh = this.createDrop(drop.layer, Math.random() * this.width, -random([20, this.height * 0.28]));
    Object.assign(drop, fresh);
  }

  private update(delta: number, time: number) {
    const config = RAIN_INTENSITY_CONFIG[this.options.intensity];

    if (time > this.nextDensityShift) {
      this.densityTarget = random([0.82, 1.16]);
      this.nextDensityShift = time + random([500, 3000]);
    }

    if (time > this.nextGustShift) {
      this.gustTarget = random([-1, 1]);
      this.nextGustShift = time + random([900, 3200]);
    }

    this.density += (this.densityTarget - this.density) * Math.min(1, delta * 1.4);
    this.gust += (this.gustTarget - this.gust) * Math.min(1, delta * 0.8);

    const baseAngle = 11 + this.options.wind * 4;
    const gustAngle = this.gust * 6;
    const angle = degreesToRadians(baseAngle + gustAngle);
    const windVector = Math.sin(angle);
    const groundY = this.height * 0.9;
    const activeDensity = this.density * this.adaptiveQuality;

    for (const drop of this.drops) {
      const activeGate = hashNoise(drop.x + time * 0.02, drop.y) < activeDensity;

      if (!activeGate) {
        continue;
      }

      const speed = drop.velocity * config.velocityMultiplier;
      drop.x += (windVector * speed + drop.drift + this.options.wind * 95) * delta;
      drop.y += Math.cos(angle) * speed * delta;

      if (!this.mobile && drop.y >= groundY && Math.random() < 0.014 * this.adaptiveQuality) {
        this.spawnRipple(drop.x, groundY + random([-10, 18]));
      }

      if (drop.y - drop.length > this.height || drop.x > this.width + 80 || drop.x < -80) {
        this.resetDrop(drop);
      }
    }

    let writeIndex = 0;

    for (const ripple of this.ripples) {
      ripple.age += delta;
      ripple.radius += (ripple.maxRadius - ripple.radius) * Math.min(1, delta * 7);

      if (ripple.age < ripple.life) {
        this.ripples[writeIndex] = ripple;
        writeIndex += 1;
      }
    }

    this.ripples.length = writeIndex;
  }

  private spawnRipple(x: number, y: number) {
    if (this.ripples.length > 36) {
      return;
    }

    this.ripples.push({
      x,
      y,
      age: 0,
      life: random([0.18, 0.46]),
      radius: random([1.5, 4]),
      maxRadius: random([8, 24]),
      alpha: random([0.05, 0.13]),
    });
  }

  private draw() {
    const config = RAIN_INTENSITY_CONFIG[this.options.intensity];
    const angle = degreesToRadians(11 + this.options.wind * 4 + this.gust * 6);
    const xOffset = Math.sin(angle);
    const yOffset = Math.cos(angle);

    const activeDensity = this.density * this.adaptiveQuality;

    this.clear();
    this.context.strokeStyle = this.options.color;
    this.context.lineCap = "round";
    this.context.filter = "none";

    for (const layer of LAYERS) {
      for (let bucket = 0; bucket < THICKNESS_BUCKETS.length; bucket += 1) {
        this.context.beginPath();
        let drawn = 0;

        for (const drop of this.drops) {
          if (drop.layer !== layer || drop.thickness !== bucket) {
            continue;
          }

          const alpha = drop.alpha * config.opacityMultiplier * activeDensity;

          if (alpha < 0.012) {
            continue;
          }

          const fadeLength = drop.length * (0.9 + alpha * 1.8);
          this.context.moveTo(drop.x, drop.y);
          this.context.lineTo(drop.x - xOffset * fadeLength, drop.y - yOffset * fadeLength);
          drawn += 1;
        }

        if (drawn > 0) {
          this.context.globalAlpha = layer.opacity[1] * config.opacityMultiplier * activeDensity;
          this.context.lineWidth = THICKNESS_BUCKETS[bucket];
          this.context.stroke();
        }
      }
    }

    this.context.filter = "none";
    this.context.lineWidth = 1;

    for (const ripple of this.ripples) {
      const progress = ripple.age / ripple.life;
      this.context.globalAlpha = ripple.alpha * (1 - progress);
      this.context.beginPath();
      this.context.ellipse(ripple.x, ripple.y, ripple.radius, ripple.radius * 0.28, 0, 0, Math.PI * 2);
      this.context.stroke();
    }

    this.context.globalAlpha = 1;
  }

  private clear() {
    this.context.clearRect(0, 0, this.width, this.height);
  }

  private cancelFrame() {
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
      this.frameId = 0;
    }
  }
}

function random(range: Range) {
  return range[0] + Math.random() * (range[1] - range[0]);
}

function pickThicknessBucket(thickness: number): 0 | 1 | 2 {
  if (thickness < 1) {
    return 0;
  }

  if (thickness < 1.65) {
    return 1;
  }

  return 2;
}

function degreesToRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

function hashNoise(x: number, y: number) {
  const value = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return value - Math.floor(value);
}
