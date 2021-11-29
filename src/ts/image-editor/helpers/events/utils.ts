import { Position } from '../layout/definitions';
import { TrackEventName } from './definitions';

// Safari do not support TouchEvent, check if typeof TouchEvent exists.
export const isTouchEvent = (event: Event): event is TouchEvent => typeof TouchEvent !== 'undefined' && event instanceof TouchEvent;

export const isTrackEvent = (name: string): name is TrackEventName => {
  return name in TrackEventName;
};

/**
 * Get track `Position` of an user interacion event.
 */
export const trackPosition = (event: MouseEvent | TouchEvent): Position => {
  if (isTouchEvent(event)) {
    return {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY
    };
  }
  return {
    x: event.x,
    y: event.y
  };
};
