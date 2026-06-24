import type * as Matter from "matter-js";

const MIN_FIELD_HEIGHT = 320;
const MAX_FIELD_HEIGHT = 520;
const WALL_THICKNESS = 80;
const ORB_RADIUS_MIN = 24;
const ORB_RADIUS_MAX = 40;
const DROP_GAP = 28;
const RESIZE_SETTLE_MS = 120;

type MatterModule = typeof import("matter-js");

type OrbRecord = {
  readonly anchor: HTMLElement;
  readonly body: Matter.Body;
  readonly radius: number;
};

type FieldSize = {
  readonly width: number;
  readonly height: number;
};

type PostOrbBoxElement = HTMLElement & {
  dataset: DOMStringMap & {
    count?: string;
    fallbackReason?: string;
    motion?: string;
    postOrbReady?: string;
    state?: string;
  };
  __postOrbCleanup?: () => void;
};

type Runtime = { readonly initializeAll: () => void; readonly cleanupAll: () => void };

type MatterStartContext = {
  readonly owner: PostOrbBoxElement;
  readonly field: HTMLElement;
  readonly anchors: readonly HTMLElement[];
  readonly deactivate: () => void;
  readonly isActive: () => boolean;
};

declare global {
  interface Window {
    __postOrbBoxRuntime?: Runtime;
  }
}

function anchorIndex(anchor: HTMLElement): number {
  const value = Number(anchor.dataset.index ?? 0);

  return Number.isFinite(value) ? value : 0;
}

function fieldSize(field: HTMLElement, count: number): FieldSize {
  const width = Math.max(field.clientWidth, ORB_RADIUS_MAX * 2);
  const countHeight = Math.min(MAX_FIELD_HEIGHT, MIN_FIELD_HEIGHT + Math.max(0, count - 3) * 42);

  return {
    width,
    height: countHeight,
  };
}

function applyFieldSize(field: HTMLElement, size: FieldSize): void {
  field.style.minHeight = `${size.height}px`;
  field.style.height = `${size.height}px`;
}

function clearFieldSize(field: HTMLElement): void {
  field.style.minHeight = "";
  field.style.height = "";
}

function cappedRadius(anchor: HTMLElement, fieldWidth: number, count: number): number {
  const visualRadius = Math.max(anchor.offsetWidth, anchor.offsetHeight) / 2;
  const widthBoundRadius = fieldWidth / Math.max(2.7, Math.min(count, 5) + 1.4);

  return Math.min(ORB_RADIUS_MAX, Math.max(ORB_RADIUS_MIN, Math.min(visualRadius, widthBoundRadius)));
}

function buildBounds(matter: MatterModule, size: FieldSize): Matter.Body[] {
  const { Bodies } = matter;
  const { width, height } = size;

  return [
    Bodies.rectangle(width / 2, height + WALL_THICKNESS / 2, width + WALL_THICKNESS * 2, WALL_THICKNESS, { isStatic: true }),
    Bodies.rectangle(-WALL_THICKNESS / 2, height / 2, WALL_THICKNESS, height + WALL_THICKNESS * 2, { isStatic: true }),
    Bodies.rectangle(width + WALL_THICKNESS / 2, height / 2, WALL_THICKNESS, height + WALL_THICKNESS * 2, { isStatic: true }),
  ];
}

function buildOrbs(matter: MatterModule, anchors: readonly HTMLElement[], size: FieldSize, drop: boolean): readonly OrbRecord[] {
  const { Bodies } = matter;
  const safeWidth = Math.max(size.width, ORB_RADIUS_MAX * 2);

  return anchors.map((anchor) => {
    const index = anchorIndex(anchor);
    const radius = cappedRadius(anchor, safeWidth, anchors.length);
    const laneCount = Math.max(1, anchors.length);
    const x = ((index + 1) * safeWidth) / (laneCount + 1);
    const y = drop ? -(index + 1) * (radius + DROP_GAP) : size.height - radius;
    const body = Bodies.circle(x, y, radius, { restitution: 0.58, friction: 0.08, frictionAir: 0.018, density: 0.0012 });

    return { anchor, body, radius };
  });
}

function resetAnchor(anchor: HTMLElement): void {
  anchor.style.transform = "";
}

function syncAnchor(record: OrbRecord): void {
  const { anchor, body, radius } = record;
  const x = body.position.x - radius;
  const y = body.position.y - radius;

  anchor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
}

function cleanupOwner(owner: PostOrbBoxElement): void {
  owner.__postOrbCleanup?.();
  owner.__postOrbCleanup = undefined;
}

function markStatic(owner: PostOrbBoxElement, anchors: readonly HTMLElement[], state: string, motion: string): void {
  anchors.forEach(resetAnchor);
  owner.dataset.postOrbReady = "true";
  owner.dataset.motion = motion;
  owner.dataset.state = state;
}

function markFallback(owner: PostOrbBoxElement, anchors: readonly HTMLElement[], error: unknown): void {
  owner.dataset.fallbackReason = error instanceof Error ? error.name : "NonErrorMatterFailure";
  markStatic(owner, anchors, "fallback", "static");
}

async function startMatter(context: MatterStartContext): Promise<void> {
  const { owner, field, anchors, deactivate, isActive } = context;
  let matter: MatterModule | undefined;
  let engine: Matter.Engine | undefined;
  let runner: Matter.Runner | undefined;
  let bounds: Matter.Body[] = [];
  let resizeTimer = 0;
  let resizeAttached = false;
  let motionAttached = false;
  let tickAttached = false;
  let records: readonly OrbRecord[] = [];
  let syncAnchors = () => {};
  let rebuildBounds = () => {};
  let syncMotionPreference = () => {};
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const cleanupMatter = () => {
    deactivate();
    window.clearTimeout(resizeTimer);
    if (resizeAttached) window.removeEventListener("resize", rebuildBounds);
    if (motionAttached) reduceMotion.removeEventListener("change", syncMotionPreference);
    if (tickAttached && matter && runner) matter.Events.off(runner, "tick", syncAnchors);
    if (runner && matter) matter.Runner.stop(runner);
    if (engine && matter) matter.Engine.clear(engine);
    anchors.forEach(resetAnchor);
    clearFieldSize(field);
    owner.dataset.postOrbReady = "false";
    owner.dataset.motion = "static";
    owner.dataset.state = "fallback";
  };

  owner.__postOrbCleanup = cleanupMatter;

  try {
    const loadedMatter = await import("matter-js");
    matter = loadedMatter;
    if (!isActive() || !owner.isConnected) {
      cleanupMatter();
      return;
    }

    const { Body, Composite, Engine, Events, Runner } = loadedMatter;
    const size = fieldSize(field, anchors.length);
    applyFieldSize(field, size);
    engine = Engine.create({ gravity: { x: 0, y: 0.88 } });
    runner = Runner.create();
    records = buildOrbs(loadedMatter, anchors, size, true);
    syncAnchors = () => records.forEach(syncAnchor);
    bounds = buildBounds(loadedMatter, size);

    rebuildBounds = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (!isActive() || !owner.isConnected || !engine) return;

        const nextSize = fieldSize(field, anchors.length);
        const bodies = records.map((record) => record.body);

        applyFieldSize(field, nextSize);
        Composite.remove(engine.world, [...bounds, ...bodies]);
        bounds = buildBounds(loadedMatter, nextSize);
        records = buildOrbs(loadedMatter, anchors, nextSize, false);
        records.forEach((record) => Body.setVelocity(record.body, { x: 0, y: 0 }));
        Composite.add(engine.world, [...bounds, ...records.map((record) => record.body)]);
        syncAnchors();
      }, RESIZE_SETTLE_MS);
    };

    syncMotionPreference = () => {
      if (!reduceMotion.matches) return;

      cleanupOwner(owner);
      markStatic(owner, anchors, "static", "reduced");
    };

    Composite.add(engine.world, [...bounds, ...records.map((record) => record.body)]);
    syncAnchors();
    Events.on(runner, "tick", syncAnchors);
    tickAttached = true;
    window.addEventListener("resize", rebuildBounds, { passive: true });
    resizeAttached = true;
    reduceMotion.addEventListener("change", syncMotionPreference);
    motionAttached = true;
    Runner.run(runner, engine);
    owner.dataset.state = "active";
  } catch (error) {
    cleanupMatter();
    markFallback(owner, anchors, error);
  }
}

async function initializePostOrbBox(owner: PostOrbBoxElement): Promise<void> {
  if (owner.dataset.postOrbReady === "true") return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const field = owner.querySelector<HTMLElement>("[data-post-orb-field]");
  const anchors = field ? Array.from(field.querySelectorAll<HTMLElement>("[data-post-orb]")) : [];
  let active = true;

  owner.__postOrbCleanup = () => {
    active = false;
    anchors.forEach(resetAnchor);
    if (field) clearFieldSize(field);
    owner.dataset.postOrbReady = "false";
    owner.dataset.state = "fallback";
  };

  if (!field || anchors.length === 0) {
    markStatic(owner, anchors, "empty", reduceMotion.matches ? "reduced" : "static");
    return;
  }

  if (reduceMotion.matches) {
    markStatic(owner, anchors, "static", "reduced");
    return;
  }

  owner.dataset.postOrbReady = "true";
  owner.dataset.motion = "active";
  owner.dataset.state = "initializing";

  await startMatter({
    owner,
    field,
    anchors,
    deactivate: () => {
      active = false;
    },
    isActive: () => active,
  });
}

function createRuntime(): Runtime {
  const initializeAll = () => {
    document.querySelectorAll<PostOrbBoxElement>("[data-post-orb-box]").forEach((owner) => {
      void initializePostOrbBox(owner);
    });
  };
  const cleanupAll = () => {
    document.querySelectorAll<PostOrbBoxElement>("[data-post-orb-box]").forEach(cleanupOwner);
  };

  document.addEventListener("DOMContentLoaded", initializeAll);
  document.addEventListener("astro:page-load", initializeAll);
  document.addEventListener("astro:before-swap", cleanupAll);

  return { initializeAll, cleanupAll };
}

export function initializePostOrbBoxes(): void {
  window.__postOrbBoxRuntime ??= createRuntime();
  window.__postOrbBoxRuntime.initializeAll();
}
