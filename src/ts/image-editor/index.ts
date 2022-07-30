import { ConstructorParameters } from './definitions';
import { LayoutDefinitions } from './helpers/layout';
import { CardinalArea } from './helpers/layout/definitions';
import { Store } from './store';
import Tools from './tools';

export * from './definitions';

class ImageEditor {
  private readonly _tools: Tools;
  private _image: HTMLImageElement | null = null;
  private readonly _store;

  constructor(config: ConstructorParameters) {
    const { canvas, wrapper, lockedOutputSize, mode, store } = config;

    this._store = store;

    this._tools = new Tools({
      canvas,
      mode,
      restrictedOutput: lockedOutputSize,
      store: this._store,
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

    const url = await this._tools.apply();

    if (url) {
      this._saveFile(url);
      return true;
    }
    // Make something useful with the result.
    // I.e stored result on server side or
    // implement a image preview for user validation
    return false;
  }

  public setCropArea(value: CardinalArea) {
    this._tools.setCropArea(value);
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
      img.crossOrigin = 'anonymous';
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
  private _onResize(_event: UIEvent): void {
    if (this._image) {
      this._tools.setSizes();
    }
  }
  private _saveFile(buffer: string) {
    const downloadAnchorElement = document.createElement('a');
    //downloadAnchorElement.id = 'download_file_anchor';
    document.body.appendChild(downloadAnchorElement);

    downloadAnchorElement.href = buffer;
    downloadAnchorElement.target = '_self';
    downloadAnchorElement.download = 'edited_file';
    downloadAnchorElement.click();
    document.body.removeChild(downloadAnchorElement);
  }
  //#endregion PRIVATE METHODS
}

/**
 * Creates an `ImageEditor` handler.
 * Intended to be used on a component.
 */
export default class {
  private _handler: ImageEditor | null = null;
  private readonly _store = new Store();

  get state() {
    return this._store.state;
  }

  /** Creates an image editor. Only one instance could be initiated.
   * @requires destroy on component unmount
   * @throw {canvas} Argument must have a valid 2d context
   */
  public initialize(config: Omit<ConstructorParameters, 'store'>): boolean {
    try {
      if (this._handler) {
        throw new Error('ImageEditor is already initialized.');
      }
      this._handler = new ImageEditor({ ...config, store: this._store });

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

    return await this._handler.setImageSource(source);
  }

  public setOutputSize(size: LayoutDefinitions.Size | null): void {
    if (this._handler) {
      this._handler.setOutputSize(size);
    }
  }

  public setCropAreaPosition(value: CardinalArea) {
    if (this._handler) {
      this._handler.setCropArea(value);
    }
  }
}
