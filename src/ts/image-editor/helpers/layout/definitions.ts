//#region TYPES
/**
 * Canvas `position` & `ratio` relative to its wrapper.
 * @property `layoutReference` coefficient between **canvas** & **image** HTMLElements
 */
export type CanvasSizeWithLayout = Size & {
  layoutReference: LayoutReference;
};

/**
 * Define rectangle cardinal position.
 * All values **should be** positive.
 */
export type Area = Record<'top' | 'right' | 'bottom' | 'left', number>;

export type EditorOffsetSize = {
  offsetWidth: number;
  offsetHeight: number;
};

export type LayoutReference = Position & Ratio;

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

/**
 * HTMLElements sizes for all `ImageEditor` components.
 */
export type SizeSnapShot = {
  canvas: CanvasSizeWithLayout;
  editor: Size;
  image: Size;
};
//#endregion TYPES
