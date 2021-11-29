import { CornerIdentity } from './corner/types';
import Corner from './corner';
import { LayoutDefinitions } from '../../helpers/layout';

//#region CONSTANTS
/**
 * Minimum crop area size in pixels.
 */
export const DEFAULT_MIN_SIZE = 20;
/**
 * Default outter crop area color.
 */
export const CROP_AREA_STYLE: CropAreaStyling = {
  fill: 'rgba(0, 0, 0, 0.7)',
  stroke: 'rgb(1, 0, 0)'
};

/**
 * Cropzone-coordinates with outer rectangle.
 */
export const InnerCornerIdentity = {
  /*
   *             x1         x2
   *     +-------+----------+-------+
   *     |///////|//////////|///////|
   *     |///////|//////////|///////|
   *  y1 +-------+----------+-------+ y1
   *     |///////|   Crop   |///////|
   *     |///////|   Area   |///////|
   *  y2 +-------+----------+-------+ y2
   *     |///////|//////////|///////|
   *     |///////|//////////|///////|
   *     +-------+----------+-------+
   *             x1         x2
   */
  X1: 'X1',
  X2: 'X2',
  Y1: 'Y1',
  Y2: 'Y2'
} as const;

/**
 * Cropzone-coordinates with outer rectangle.
 */
export const OuterCornerIdentity = {
  /*
   *     x0                         x3
   *  y0 +-------+----------+-------+ y0
   *     |///////|//////////|///////|
   *     |///////|//////////|///////|
   *     +-------+----------+-------+
   *     |///////|   Crop   |///////|
   *     |///////|   Area   |///////|
   *     +-------+----------+-------+
   *     |///////|//////////|///////|
   *     |///////|//////////|///////|
   *  y3 +-------+----------+-------+ y3
   *     x0                         x3
   */
  X0: 'X0',
  X3: 'X3',
  Y0: 'Y0',
  Y3: 'Y3'
} as const;
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
  Move = 'move',
  ResizeEW = 'ew-resize',
  ResizeNS = 'ns-resize',
  ResizeNESW = 'nesw-resize',
  ResizeNWSE = 'nwse-resize'
}
//#endregion ENUM

//#region TYPES
export type CropAreaCorners = Record<CornerIdentity, Corner>;
export type CropCanvasArea = {
  inner: InnerCropArea;
  outer: OuterCropArea;
};

export type InnerCornerIdentity = typeof InnerCornerIdentity[keyof typeof InnerCornerIdentity];
export type OuterCornerIdentity = typeof OuterCornerIdentity[keyof typeof OuterCornerIdentity];
/**
 * Inner crop area corner position in `pixels`.
 */
export type InnerCropArea = Record<InnerCornerIdentity, number>;
/**
 * Outer crop area corner position in `pixels`.
 */
export type OuterCropArea = Record<OuterCornerIdentity, number>;

export type CropAreaStyling = {
  fill: string;
  stroke: string;
};

/**
 * Drag execution definitions:
 * - action: what is user doing.
 * - who: will perform the action, if any.
 * - where: position of the action, if any, since some action are not affected by position.
 */
export type DraggingExection = {
  action: DraggingAction;
  corner: CornerIdentity | null;
  start: LayoutDefinitions.Position | null;
};
//#endregion TYPES
