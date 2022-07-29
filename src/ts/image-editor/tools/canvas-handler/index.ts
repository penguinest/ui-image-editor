import { CutArea, CUT_AREA_STYLE } from './definitions';
import { ImageEditorMouseEvents } from '../../definitions';
import { LayoutDefinitions, LayoutUtils } from '../../helpers/layout';
import { EventDefinitions, EventUtils } from '../../helpers/events';
import { EditionParams, EditorSnapShot } from '../../helpers/layout/definitions';
import { Store } from '../../store';
import { DEFAULT_MIN_SIZE } from '../cropper-handler/definitions';

/**
 * Handles `ImageEditor`'s canvas and its sizes control.
 */
export default class {
  private readonly _canvas: HTMLCanvasElement;
  private readonly _ctx: CanvasRenderingContext2D;
  private readonly _store: Store;
  private _image: HTMLImageElement | null = null;
  private _wrapper: HTMLDivElement;
  private _editionParams: EditionParams = LayoutUtils.initialize.snapshot.edition();

  constructor(config: { canvas: HTMLCanvasElement; restrictedOutput?: LayoutDefinitions.Size; store: Store; wrapper: HTMLDivElement }) {
    const { canvas, restrictedOutput, store, wrapper } = config;
    this._canvas = canvas;
    this._store = store;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Invalid canvas context.');
    }

    this._ctx = ctx;
    this._wrapper = wrapper;

    if (restrictedOutput) {
      this._editionParams.restrictions = {
        //shapeRatio: IMPLEMENT ME
        lockedOutputSize: restrictedOutput
      };
    }
  }

  //#region GETTERS
  get canvas(): HTMLCanvasElement {
    return this._canvas;
  }

  get ctx(): CanvasRenderingContext2D {
    return this._ctx;
  }

  get src(): string | null {
    return this._image?.src || null;
  }

  get snapshot(): EditorSnapShot {
    return {
      canvas: {
        relativePosition: LayoutUtils.sizeFrom.relativePosition(this._canvas),
        size: LayoutUtils.sizeFrom.canvas(this._canvas)
      },
      edition: this._editionParams,
      image: this._image ? LayoutUtils.sizeFrom.image(this._image) : LayoutUtils.initialize.snapshot.image(),
      wrapper: LayoutUtils.sizeFrom.offset(this._wrapper)
    };
  }

  //#endregion GETTERS

  //#region PUBLIC METHODS
  /**
   * Bind mouse and touch events to their handlers.
   */
  public configureEventListenersState(config: { canvasEvents: ImageEditorMouseEvents; onInitialize: boolean }): void {
    // Do not use `const actions = config.onInitialize ? this._canvas.addEventListener : this._canvas.removeEventListener`.
    // This will mislead event into `window` rather than into `canvas` itself.
    const actions = config.onInitialize
      ? (name: EventDefinitions.TrackEventName, fn: EventDefinitions.CanvasEvent) => this._canvas.addEventListener(name, fn, true)
      : (name: EventDefinitions.TrackEventName, fn: EventDefinitions.CanvasEvent) => this._canvas.removeEventListener(name, fn);

    Object.entries(config.canvasEvents).forEach(([name, events]) => {
      events.forEach((event) => {
        if (EventUtils.isTrackEvent(name)) {
          actions(name, event);
        }
      });
    });
  }

  /**
   * Resets canvas context.
   */
  public clearCanvas(): void {
    const { width, height } = this._canvas;

    this._ctx.clearRect(0, 0, width, height);
  }

  /**
   * Resets canvas context and only left image source, if any.
   * @see clearCanvas
   */
  public reDraw(): boolean {
    this.clearCanvas();

    if (this._image) {
      this._ctx.drawImage(this._image, 0, 0);
      this._fillCutArea();
      return true;
    }
    return false;
  }

  public reset() {
    if (this._editionParams.cut) {
      delete this._editionParams.cut;
    }
  }

  public setInnerArea(inner: LayoutDefinitions.Area): LayoutDefinitions.Area {
    this._editionParams.cut = inner;
    this.reDraw();

    this._store.setCrop(LayoutUtils.area.toCardinal(inner));
    return inner;
  }

  /**
   * Set canvas sizes and calcule all translations ration between image and users preview layout.
   * Any time a new image is set, canvas will be re-drawn.
   * @see updateSizes
   */
  public setImage(image: HTMLImageElement): boolean {
    if (this._image != image) {
      this._image = image;
      return true;
    }
    return false;
  }

  public updateRestrictedOutputSize(size: LayoutDefinitions.Size | null): LayoutDefinitions.CardinalArea | null {
    if (size) {
      const restrictedWidth = Math.min(Math.max(DEFAULT_MIN_SIZE, size.width), this._image?.width || Number.MAX_VALUE);
      const restrictedHeight = Math.min(Math.max(DEFAULT_MIN_SIZE, size.height), this._image?.height || Number.MAX_VALUE);
      const lockedOutputSize = {
        width: restrictedWidth,
        height: restrictedHeight
      };

      this._store.setOutput(lockedOutputSize);

      this._editionParams.restrictions = {
        ...this._editionParams.restrictions,
        lockedOutputSize
      };

      if (this._editionParams.cut) {
        const wRatio = restrictedWidth / restrictedHeight;
        const area = LayoutUtils.area.toCardinal(this._editionParams.cut);
        const optionOne = {
          width: Math.max(area.width, restrictedWidth),
          height: Math.max(area.width, restrictedWidth) / wRatio
        };
        const optionTwo = {
          height: Math.max(area.height, restrictedHeight),
          width: Math.max(area.height, restrictedHeight) * wRatio
        };
        const result = optionOne.height <= this._image!.height && optionOne.width <= this._image!.width ? optionOne : optionTwo;
        const p = {
          x: Math.min(area.x, this._image!.width - result.width),
          y: Math.min(area.y, this._image!.height - result.height)
        };
        const t = {
          ...p,
          ...result
        };

        return t;
      }

      return null;
    } else {
      delete this._editionParams.restrictions!.lockedOutputSize;
      this._store.setOutput(null);
    }

    return null;
  }

  /**
   * Resets `canvas` sizes and convertion ratios based on its wrapper sizes (editor's HTMLDivElement)
   * only when `image` source is set.
   * @see _setCanvasSize
   * @see _setContextSize
   * @see _setLayoutReference
   */
  public updateSizes(): boolean {
    if (!this._image) {
      return false;
    }

    const effectiveSize = LayoutUtils.calculeEffectiveSize({
      editor: LayoutUtils.sizeFrom.client(this._wrapper),
      image: this._image
    });

    this._setCanvasSize(effectiveSize);

    this._setContextSize();

    this._updateLayoutRatio();

    return true;
  }
  //#endregion PUBLIC METHODS

  //#region PRIVATE METHODS
  private _cutAreaCoodinates(): CutArea | null {
    if (this._editionParams.cut && this._image) {
      const { cut } = this._editionParams;

      const outer = {
        left: 0,
        bottom: this._image.height,
        right: this._image.width,
        top: 0
      };

      return {
        inner: cut,
        outer
      };
    }
    return null;
  }

  /**
   * Create inner and outer areas.
   */
  private _fillCutArea(): void {
    const cutArea = this._cutAreaCoodinates();

    if (!cutArea) {
      return;
    }

    const { inner: innerCut, outer: outerCut } = cutArea;

    this.ctx.save();
    // Reduce aliasing
    //ctx.translate(0.5, 0.5);
    this.ctx.fillStyle = CUT_AREA_STYLE.fill;
    this.ctx.strokeStyle = CUT_AREA_STYLE.stroke;
    this.ctx.beginPath();

    //#region Outer rectangle
    this.ctx.moveTo(outerCut.left, outerCut.top);
    this.ctx.lineTo(outerCut.right, outerCut.top);
    this.ctx.lineTo(outerCut.right, outerCut.bottom);
    this.ctx.lineTo(outerCut.left, outerCut.bottom);
    this.ctx.lineTo(outerCut.left, outerCut.top);
    this.ctx.closePath();
    this.ctx.stroke();
    //#endregion Outer rectangle

    //#region Inner rectangle
    // Reduce aliasing
    //ctx.translate(0.5, 0.5);
    this.ctx.moveTo(innerCut.left, innerCut.top);
    this.ctx.lineTo(innerCut.left, innerCut.bottom);
    this.ctx.lineTo(innerCut.right, innerCut.bottom);
    this.ctx.lineTo(innerCut.right, innerCut.top);
    this.ctx.lineTo(innerCut.left, innerCut.top);
    this.ctx.closePath();
    //#endregion Inner rectangle

    this.ctx.fill();
    this.ctx.restore();
  }

  /**
   * Set canvas `dom` sizes.
   */
  private _setCanvasSize(size: LayoutDefinitions.Size): void {
    this._canvas.style.width = `${size.width}px`;
    this._canvas.style.height = `${size.height}px`;
  }

  /**
   * Set canvas `content` sizes.
   */
  private _setContextSize(): void {
    if (!this._image) {
      return;
    }
    const { width, height } = this._image;

    this._canvas.width = width;
    this._canvas.height = height;
  }

  /**
   * Calcule and store conversion rations and canvas `Position` relative to its wrapper (editor).
   */
  private _updateLayoutRatio() {
    if (!this._image) {
      return;
    }

    const canvas = {
      width: this._canvas.clientWidth,
      height: this._canvas.clientHeight
    };

    const ratio = LayoutUtils.calculeRatio({ canvas, target: this._image });

    this._editionParams = {
      ...this._editionParams,
      ratio
    };
  }
  //#endregion PRIVATE METHODS
}
