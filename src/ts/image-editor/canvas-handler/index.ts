import { ImageEditorMouseEvents } from '../definitions';
import { LayoutDefinitions, LayoutUtils } from '../helpers/layout';
import { EventDefinitions, EventUtils } from '../helpers/events';

/**
 * Handles `ImageEditor`'s canvas and its sizes control.
 */
export default class {
  private readonly _canvas: HTMLCanvasElement;
  private readonly _ctx: CanvasRenderingContext2D;
  private _image: HTMLImageElement | null = null;
  public layout = LayoutUtils.initialize.units.reference();

  //#region GETTERS
  get canvas(): HTMLCanvasElement {
    return this._canvas;
  }

  get ctx(): CanvasRenderingContext2D {
    return this._ctx;
  }
  //#endregion GETTERS

  constructor(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
    this._canvas = canvas;
    this._ctx = context;
  }

  //#region PUBLIC METHODS
  /**
   * Bind mouse and touch events to their handlers.
   */
  public configureEventListenersState(config: { canvasEvents: ImageEditorMouseEvents; onInitialize: boolean }): void {
    // Do not use `const actions = config.onInitialize ? this._canvas.addEventListener : this._canvas.removeEventListener`.
    // This will mislead event into `window` rather than into `canvas` itself.
    const actions = config.onInitialize
      ? (name: EventDefinitions.TrackEventName, fn: EventDefinitions.CanvasEvent) => this._canvas.addEventListener(name, fn)
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
   * Resets canvas context and only left image source, if any.
   * @see clearCanvas
   */
  public reDraw(): boolean {
    this.clearCanvas();

    if (this._image) {
      this._ctx.drawImage(this._image, 0, 0);
      return true;
    }
    return false;
  }

  /**
   * Resets canvas context.
   */
  public clearCanvas(): void {
    const { width, height } = this._canvas;

    this._ctx.clearRect(0, 0, width, height);
  }

  /**
   * Set canvas sizes and calcule all translations ration between image and users preview layout.
   * Any time a new image is set, canvas will be re-drawn.
   * @see setSizes
   */
  public setImage(image: HTMLImageElement, containerSize: LayoutDefinitions.Size): void {
    if (this._image != image) {
      this._image = image;
      this.setSizes(containerSize);
    }
  }

  /**
   * Resets `canvas` sizes and convertion ratios based on its wrapper sizes (editor's HTMLDivElement)
   * only when `image` source is set.
   * @see _setCanvasSize
   * @see _setContextSize
   * @see _setLayoutReference
   */
  public setSizes(containerSize: LayoutDefinitions.Size): boolean {
    if (!this._image) {
      return false;
    }

    const { width, height } = containerSize;
    const effectiveSize = LayoutUtils.calculeEffectiveSize({
      editor: {
        width,
        height
      },
      image: this._image
    });

    this._setCanvasSize(effectiveSize);

    this._setContextSize(this._image);

    this._setLayoutReference(this._image);

    this.reDraw();

    return true;
  }
  //#endregion PUBLIC METHODS

  //#region PRIVATE METHODS
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
  private _setContextSize(size: LayoutDefinitions.Size): void {
    this._canvas.width = size.width;
    this._canvas.height = size.height;
  }

  /**
   * Calcule and store conversion rations and canvas `Position` relative to its wrapper (editor).
   */
  private _setLayoutReference(target: LayoutDefinitions.Size): void {
    const { left: x, top: y } = this._canvas.getBoundingClientRect();
    const canvas = {
      width: this._canvas.clientWidth,
      height: this._canvas.clientHeight
    };

    this.layout = {
      x,
      y,
      ...LayoutUtils.calculeRatio({ canvas, target })
    };
  }
  //#endregion PRIVATE METHODS
}
