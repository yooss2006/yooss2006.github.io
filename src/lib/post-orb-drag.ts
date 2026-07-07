import type * as Matter from "matter-js";
import type { OrbRecord } from "./post-orb-physics";

const DRAG_CLICK_THRESHOLD = 6;
type Point = {
  readonly x: number;
  readonly y: number;
};

type DragState = {
  readonly pointerId: number;
  readonly record: OrbRecord;
  readonly offset: Point;
  readonly startPointer: Point;
  moved: boolean;
};

type AttachOrbDragOptions = {
  readonly Body: typeof Matter.Body;
  readonly field: HTMLElement;
  readonly getRecords: () => readonly OrbRecord[];
};

function pointerPoint(field: HTMLElement, event: PointerEvent): Point {
  const rect = field.getBoundingClientRect();

  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}

function dragRecordFromEvent(event: PointerEvent, records: readonly OrbRecord[]): OrbRecord | undefined {
  const target = event.target;
  if (!(target instanceof Element)) return undefined;

  const anchor = target.closest<HTMLElement>("[data-post-orb]");
  if (!anchor) return undefined;

  return records.find((record) => record.anchor === anchor);
}

export function attachOrbDrag(options: AttachOrbDragOptions): () => void {
  const { Body, field, getRecords } = options;
  let state: DragState | undefined;
  let suppressNextClick = false;
  let suppressTimer = 0;

  const moveBody = (pointer: Point, dragState: DragState): void => {
    const { record } = dragState;
    const x = Math.min(field.clientWidth - record.radius, Math.max(record.radius, pointer.x + dragState.offset.x));
    const y = Math.min(field.clientHeight - record.radius, Math.max(record.radius, pointer.y + dragState.offset.y));

    Body.setPosition(record.body, { x, y });
  };

  const onPointerDown = (event: PointerEvent) => {
    if (event.button !== 0 || state) return;

    const record = dragRecordFromEvent(event, getRecords());
    if (!record) return;

    const pointer = pointerPoint(field, event);
    state = {
      pointerId: event.pointerId,
      record,
      offset: {
        x: record.body.position.x - pointer.x,
        y: record.body.position.y - pointer.y,
      },
      startPointer: pointer,
      moved: false,
    };

    Body.setVelocity(record.body, { x: 0, y: 0 });
    Body.setAngularVelocity(record.body, 0);
  };

  const onPointerMove = (event: PointerEvent) => {
    if (!state || event.pointerId !== state.pointerId) return;

    const pointer = pointerPoint(field, event);

    moveBody(pointer, state);
    const wasDragging = state.moved;
    state.moved ||= Math.hypot(pointer.x - state.startPointer.x, pointer.y - state.startPointer.y) >= DRAG_CLICK_THRESHOLD;
    if (state.moved) {
      event.preventDefault();
      if (!wasDragging) field.setPointerCapture(event.pointerId);
    }
    Body.setVelocity(state.record.body, { x: 0, y: 0 });
    Body.setAngularVelocity(state.record.body, 0);
  };

  const onPointerEnd = (event: PointerEvent) => {
    if (!state || event.pointerId !== state.pointerId) return;

    const { moved, record } = state;

    Body.setVelocity(record.body, { x: 0, y: 0 });
    Body.setAngularVelocity(record.body, 0);
    if (field.hasPointerCapture(event.pointerId)) field.releasePointerCapture(event.pointerId);
    state = undefined;

    if (!moved) return;
    event.preventDefault();
    suppressNextClick = true;
    window.clearTimeout(suppressTimer);
    suppressTimer = window.setTimeout(() => {
      suppressNextClick = false;
    }, 250);
  };

  const onClick = (event: MouseEvent) => {
    if (!suppressNextClick) return;

    suppressNextClick = false;
    event.preventDefault();
    event.stopPropagation();
  };

  field.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerEnd);
  window.addEventListener("pointercancel", onPointerEnd);
  field.addEventListener("click", onClick, true);

  return () => {
    window.clearTimeout(suppressTimer);
    field.removeEventListener("pointerdown", onPointerDown);
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerEnd);
    window.removeEventListener("pointercancel", onPointerEnd);
    field.removeEventListener("click", onClick, true);
  };
}
