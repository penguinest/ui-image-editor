//#region TYPES
export type CanvasEvent = (event: MouseEvent | TouchEvent) => void;

/**
 * User interaction events, mainly mouse & touch.
 */
export const TrackEventName = {
  mousemove: 'mousemove',
  mouseup: 'mouseup',
  mousedown: 'mousedown',
  touchstart: 'touchstart',
  touchmove: 'touchmove',
  touchend: 'touchend',
  wheel: 'wheel'
} as const;

export type TrackEventName = typeof TrackEventName[keyof typeof TrackEventName];

export type TrackEventVault = Record<TrackEventName, CanvasEvent | null>;
export type TrackEventsVault = Record<TrackEventName, CanvasEvent[]>;
//#endregion TYPES
