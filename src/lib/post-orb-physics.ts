import type * as Matter from "matter-js";

const MIN_FIELD_HEIGHT = 320;
const MAX_FIELD_HEIGHT = 520;
const WALL_THICKNESS = 80;
const ORB_RADIUS_MIN = 24;
const ORB_RADIUS_MAX = 40;

type MatterModule = typeof import("matter-js");

export type OrbRecord = {
  readonly anchor: HTMLElement;
  readonly body: Matter.Body;
  readonly radius: number;
};

type FieldSize = {
  readonly width: number;
  readonly height: number;
};

function anchorIndex(anchor: HTMLElement): number {
  const value = Number(anchor.dataset.index ?? 0);

  return Number.isFinite(value) ? value : 0;
}

export function fieldSize(field: HTMLElement, count: number): FieldSize {
  const width = Math.max(field.clientWidth, ORB_RADIUS_MAX * 2);
  const countHeight = Math.min(MAX_FIELD_HEIGHT, MIN_FIELD_HEIGHT + Math.max(0, count - 3) * 42);

  return {
    width,
    height: countHeight,
  };
}

export function applyFieldSize(field: HTMLElement, size: FieldSize): void {
  field.style.minHeight = `${size.height}px`;
  field.style.height = `${size.height}px`;
}

export function clearFieldSize(field: HTMLElement): void {
  field.style.minHeight = "";
  field.style.height = "";
}

function cappedRadius(anchor: HTMLElement, fieldWidth: number, count: number): number {
  const visualRadius = Math.max(anchor.offsetWidth, anchor.offsetHeight) / 2;
  const widthBoundRadius = fieldWidth / Math.max(2.7, Math.min(count, 5) + 1.4);

  return Math.min(ORB_RADIUS_MAX, Math.max(ORB_RADIUS_MIN, Math.min(visualRadius, widthBoundRadius)));
}

export function buildBounds(matter: MatterModule, size: FieldSize): Matter.Body[] {
  const { Bodies } = matter;
  const { width, height } = size;

  return [
    Bodies.rectangle(width / 2, height + WALL_THICKNESS / 2, width + WALL_THICKNESS * 2, WALL_THICKNESS, { isStatic: true }),
    Bodies.rectangle(-WALL_THICKNESS / 2, height / 2, WALL_THICKNESS, height + WALL_THICKNESS * 2, { isStatic: true }),
    Bodies.rectangle(width + WALL_THICKNESS / 2, height / 2, WALL_THICKNESS, height + WALL_THICKNESS * 2, { isStatic: true }),
  ];
}

export function buildOrbs(matter: MatterModule, anchors: readonly HTMLElement[], size: FieldSize, drop: boolean): readonly OrbRecord[] {
  const { Bodies } = matter;
  const safeWidth = Math.max(size.width, ORB_RADIUS_MAX * 2);

  return anchors.map((anchor) => {
    const index = anchorIndex(anchor);
    const radius = cappedRadius(anchor, safeWidth, anchors.length);
    const laneCount = Math.max(1, anchors.length);
    const x = ((index + 1) * safeWidth) / (laneCount + 1);
    const y = drop ? radius : size.height - radius;
    const body = Bodies.circle(x, y, radius, { restitution: 0.58, friction: 0.08, frictionAir: 0.018, density: 0.0012 });

    return { anchor, body, radius };
  });
}

export function resetAnchor(anchor: HTMLElement): void {
  anchor.style.transform = "";
}

export function syncAnchor(record: OrbRecord): void {
  const { anchor, body, radius } = record;
  const x = body.position.x - radius;
  const y = body.position.y - radius;

  anchor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
}
