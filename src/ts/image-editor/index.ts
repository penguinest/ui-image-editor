import { ConstructorParameters } from './definitions';
import { LayoutDefinitions } from './helpers/layout';
import Tools from './tools';

export * from './definitions';

class ImageEditor {
  private readonly _tools: Tools;
  private _image: HTMLImageElement | null = null;

  constructor(config: ConstructorParameters) {
    const { canvas, wrapper, lockedOutputSize, mode } = config;

    this._tools = new Tools({
      canvas,
      mode,
      restrictedOutput: lockedOutputSize,
      wrapper
    });

    this._configureEventListenersState({
      onInitialize: true
    });
  }

  //#region PUBLIC METHODS
  public destroy(): void {
    this._configureEventListenersState({
      onInitialize: false
    });
  }

  public async apply(): Promise<boolean> {
    if (!this._image) {
      return false;
    }
    const cutArea = this._tools.cutArea();
    if (!cutArea) {
      return false;
    }
    const url = this._tools.apply();

    // Make something useful with the result.
    // I.e stored result on server side or
    // implement a image preview for user validation
    return !!url;
  }

  public async setImageSource(source: string): Promise<boolean> {
    try {
      this._image = await this._loadImage(source);
      this._tools.updateImage(this._image);

      return true;
    } catch (error) {
      this._image = null;
      console.error(error);
    }
    return false;
  }

  public setOutputSize(size: LayoutDefinitions.Size | null): void {
    this._tools.setOutputSize(size);
  }
  //#endregion PUBLIC METHODS

  //#region PRIVATE METHODS
  /**
   * Bind mouse, touch and resize events to their handlers.
   * - Canvas: mouse & touch
   * - Window: resize
   */
  private _configureEventListenersState(config: { onInitialize: boolean }) {
    const { onInitialize } = config;

    if (window) {
      const action = config.onInitialize ? window.addEventListener : window.removeEventListener;
      action('resize', (event) => this._onResize(event));
    }

    this._tools.configureEventListenersState(onInitialize);
  }

  /**
   * Create an `HTMLImgeElement` given a valid image source.
   */
  private async _loadImage(source: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = source;
      img.onerror = reject;
      img.onload = () => {
        resolve(img);
      };
    });
  }

  /**
   * Windows `onresize` event handler.
   * @see _configureEventListenersState
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private _onResize(_event: UIEvent): void {
    if (this._image) {
      this._tools.setSizes();
    }
  }
  //#endregion PRIVATE METHODS
}

/**
 * Creates an `ImageEditor` handler.
 * Intended to be used on a component.
 */
export default class {
  private _handler: ImageEditor | null = null;

  /** Creates an image editor. Only one instance could be initiated.
   * @requires destroy on component unmount
   * @throw {canvas} Argument must have a valid 2d context
   */
  public initialize(config: ConstructorParameters): boolean {
    try {
      if (this._handler) {
        throw new Error('ImageEditor is already initialized.');
      }
      this._handler = new ImageEditor(config);

      return true;
    } catch (error) {
      this._handler = null;
      console.log(error);
    }
    return false;
  }

  /**
   * Free DOM event bindings
   */
  public destroy(): void {
    this._handler?.destroy();
    this._handler = null;
  }

  /**
   * Perform image changes based on user actions.
   */
  public async apply(): Promise<boolean> {
    if (!this._handler) {
      return false;
    }
    return await this._handler.apply();
  }

  /**
   * Load an image to be processed.
   */
  public async setImageSource(source: string): Promise<boolean> {
    if (!this._handler) {
      return false;
    }

    return this._handler.setImageSource(source);
  }

  public setOutputSize(size: LayoutDefinitions.Size | null): void {
    if (this._handler) {
      this._handler.setOutputSize(size);
    }
  }
}
