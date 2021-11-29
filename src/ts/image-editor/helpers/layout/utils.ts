import { Area, CanvasSizeWithLayout, EditorOffsetSize, LayoutReference, Position, Ratio, Size, SizeSnapShot } from './definitions';

/**
 * Calcule the canvas sizes depending on the **wrapper** (editor), the **content** (image) and its **orientation**.
 */
export const calculeEffectiveSize = (input: { editor: Size; image: Size }): Size => {
  const { editor, image } = input;
  const widthScaleFactor = editor.width / image.width;
  const heigthScaleFactor = editor.height / image.height;

  const isMostLikely = {
    landscape: widthScaleFactor < heigthScaleFactor,
    portrait: widthScaleFactor > heigthScaleFactor
  };

  const isStretch = {
    horizontally: widthScaleFactor < 1,
    vertically: heigthScaleFactor < 1
  };

  if (isStretch.horizontally && isMostLikely.landscape) {
    return {
      width: Math.round(image.width * widthScaleFactor),
      height: Math.round(image.height * widthScaleFactor)
    };
  } else if (isStretch.vertically && isMostLikely.portrait) {
    return {
      width: Math.round(image.width * heigthScaleFactor),
      height: Math.round(image.height * heigthScaleFactor)
    };
  }
  return {
    width: Math.min(image.width, editor.width),
    height: Math.min(image.height, editor.height)
  };
};

/**
 * Calcule ratio between canvas "physical" sizes. and image original sizes.
 */
export const calculeRatio = (input: { canvas: Size; target: Size }): Ratio => {
  const { canvas, target } = input;

  return {
    horizontal: canvas.width / target.width,
    vertical: canvas.height / target.height
  };
};

/**
 * Collection of `unit` initialization methods.
 */
const units = {
  area: (): Area => ({ bottom: 0, left: 0, right: 0, top: 0 }),
  reference: (): LayoutReference => ({ ...units.position(), ...units.ratio() }),
  position: (): Position => ({ x: 0, y: 0 }),
  ratio: (): Ratio => ({ horizontal: 1, vertical: 1 }),
  size: (): Size => ({ width: 0, height: 0 })
};

/**
 * Collection of `snapshots` initialization methods.
 */
const snapshots = {
  canvasSizeWithLayout: (): CanvasSizeWithLayout => ({
    ...units.size(),
    layoutReference: units.reference()
  }),
  dom: (): SizeSnapShot => ({
    canvas: snapshots.canvasSizeWithLayout(),
    editor: units.size(),
    image: units.size()
  })
};

export const initialize = {
  units,
  snapshots
};

/**
 * Collection of `size` extraction methods.
 */
export const sizeFrom = {
  canvas: (input: Size): Size => input,
  editor: (input: EditorOffsetSize): Size => ({
    width: input.offsetWidth,
    height: input.offsetHeight
  }),
  image: (input: Size): Size => input
};
