//#region BASIC
/**
 * Define rectangle cardinal position.
 * All values **should be** positive.
 */
export type Area = Record<'top' | 'right' | 'bottom' | 'left', number>;

/**
 * Define rectangle by origin on cardinal axis & sizes for width/height.
 */
export type CardinalArea = Position & Size;

export type EditorOffsetSize = {
  offsetWidth: number;
  offsetHeight: number;
};

export type Position = {
  x: number;
  y: number;
};

/**
 * Define conversion ratio between elements on a 2d plane.
 */
export type Ratio = {
  horizontal: number;
  vertical: number;
};

/**
 * Define a rectangle `size`.
 */
export type Size = {
  width: number;
  height: number;
};
//#endregion BASIC

//#region COMPLEX
export type Canvas = {
  relativePosition: Position;
  size: Size;
};

export type EditionParams = {
  /** Effective cut area expressed with **image dimensions**. */
  cut?: Area;
  /** Between canvas & image. Should be smaller than (or equal to) 1. */
  ratio: Ratio;
  restrictions: {
    /** Ratio between **horizontal** and ** vertical** sizes.
     * - Landscape: `dimensionRatio > 1`
     * - Portrait: `dimensionRatio < 1`
     * - Square: `dimensionRatio === 0`
     */
    shapeRatio?: number;
    lockedOutputSize?: Size;
  };
};

/**
 * HTMLElements sizes for all `ImageEditor` components.
 */
export type EditorSnapShot = {
  canvas: Canvas;
  edition: EditionParams;
  image: Size;
  wrapper: Size;
};

export type WrapperSize = {
  clientWidth: number;
  clientHeight: number;
  offsetWidth: number;
  offsetHeight: number;
};
//#endregion COMPLEX
