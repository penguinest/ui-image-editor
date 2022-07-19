//#region CONSTANTS

import { LayoutDefinitions } from '../../helpers/layout';

/**
 * Default outter cut area color.
 */
export const CUT_AREA_STYLE: CutAreaStyling = {
  fill: 'rgba(0, 0, 0, 0.7)',
  stroke: 'rgb(1, 0, 0)'
};
//#endregion CONSTANTS

//#region ENUM
/**
 * Allowed set of dragging actions.
 */
export enum DraggingAction {
  NONE,
  CREATE,
  MOVE,
  RESIZE
}

/**
 * Cursor's mouse style names
 */
export enum MouseCursor {
  Auto = 'auto',
  Grab = 'grab',
  Move = 'move',
  ResizeEW = 'ew-resize',
  ResizeNS = 'ns-resize',
  ResizeNESW = 'nesw-resize',
  ResizeNWSE = 'nwse-resize'
}
//#endregion ENUM

//#region TYPES
export type CutArea = {
  inner: LayoutDefinitions.Area;
  outer: LayoutDefinitions.Area;
};

export type CutAreaStyling = {
  fill: string;
  stroke: string;
};
//#endregion TYPES
