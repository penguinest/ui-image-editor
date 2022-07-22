import { Area, WrapperSize, Position, Ratio, Size, Canvas, EditionParams, CardinalArea } from './definitions';

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
  cut: (): CardinalArea => ({ x: 0, y: 0, width: 0, height: 0 }),
  position: (): Position => ({ x: 0, y: 0 }),
  ratio: (): Ratio => ({ horizontal: 1, vertical: 1 }),
  size: (): Size => ({ width: 0, height: 0 })
};

/**
 * Collection of `snapshots` initialization methods.
 */
const snapshot = {
  canvas: (): Canvas => ({ relativePosition: units.position(), size: units.size() }),
  image: (): Size => units.size(),
  edition: (): EditionParams => ({
    ratio: units.ratio(),
    restrictions: {}
  }),
  wrapper: (): Size => units.size()
};

export const initialize = {
  units,
  snapshot
};

/**
 * Collection of `size` extraction methods.
 */
export const sizeFrom = {
  canvas: (input: Size): Size => ({ width: input.width, height: input.height }),
  relativePosition: (input: HTMLElement): Position => {
    const { left: x, top: y } = input.getBoundingClientRect();
    return { x, y };
  },
  client: (input: WrapperSize): Size => ({
    width: input.clientWidth,
    height: input.clientHeight
  }),
  offset: (input: WrapperSize): Size => ({
    width: input.offsetWidth,
    height: input.offsetHeight
  }),
  image: (input: Size): Size => ({ width: input.width, height: input.height })
};

export const area = {
  isFullfilled: (area: Area | CardinalArea): boolean => Object.values(area).every((item) => Number.isInteger(item)),
  fromCardinal: (area: CardinalArea): Area => ({ left: area.x, top: area.y, right: area.x + area.width, bottom: area.y + area.height }),
  toCardinal: (area: Area): CardinalArea => ({ x: area.left, y: area.top, width: area.right - area.left, height: area.bottom - area.top })
};
