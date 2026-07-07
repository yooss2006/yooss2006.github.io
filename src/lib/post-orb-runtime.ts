import type * as Matter from "matter-js";
import { attachOrbDrag } from "./post-orb-drag";
import {
  applyFieldSize,
  buildBounds,
  buildOrbs,
  clearFieldSize,
  fieldSize,
  resetAnchor,
  syncAnchor,
  type OrbRecord,
} from "./post-orb-physics";

const ORB_TONE_COUNT = 7;
const RESIZE_SETTLE_MS = 120;

type MatterModule = typeof import("matter-js");

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
  let cleanupDrag = () => {};
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
    cleanupDrag();
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
    cleanupDrag = attachOrbDrag({ Body, field, getRecords: () => records });

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

  anchors.forEach((anchor) => {
    anchor.dataset.tone = String(Math.floor(Math.random() * ORB_TONE_COUNT) + 1);
  });

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
