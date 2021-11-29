import { ConstructorParameters } from './definitions';
import { Size } from './helpers/layout/definitions';
import Tools from './tools';
import CanvasHandler from './canvas-handler';

class ImageEditor {
  private readonly _canvasHandler: CanvasHandler;
  private readonly _tools: Tools;
  private readonly _editor: HTMLDivElement;
  private _image: HTMLImageElement | null = null;

  constructor(config: ConstructorParameters) {
    const { canvas, editor, mode } = config;

    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Invalid canvas context.');
    }

    this._canvasHandler = new CanvasHandler(canvas, context);
    this._tools = new Tools({ canvasHandler: this._canvasHandler, mode });
    this._editor = editor;

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
    const cropArea = this._tools.cropArea();
    if (!cropArea) {
      return false;
    }
    // Implement your own logic to transform image accordly.
    // I.e:
    // - Server side: sharp
    // - Client side: cropper.js
    return true;
  }

  public async setImageSource(source: string): Promise<boolean> {
    try {
      const image = await this._loadImage(source);
      this._image = image;
      this._canvasHandler.setImage(image, this._editorSize());
      this._tools.setSizes({ editor: this._editor, image: this._image, sourceChange: true });

      return true;
    } catch (error) {
      this._image = null;
      console.error(error);
    }
    return false;
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

    this._canvasHandler.configureEventListenersState({
      canvasEvents: this._tools.mouseEvents,
      onInitialize
    });
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
   * Convert editor element (`HTMLDivElement`) into an `Size` object type.
   */
  private _editorSize(): Size {
    return {
      width: this._editor.clientWidth,
      height: this._editor.clientHeight
    };
  }

  /**
   * Windows `onresize` event handler.
   * @see _configureEventListenersState
   */
  private _onResize(_event: UIEvent): void {
    if (this._image) {
      // Update canvas sizes after DOM is reloaded
      this._canvasHandler.setSizes(this._editorSize());

      // Canvas resets image every time a resize takes place
      this._tools.setSizes({ editor: this._editor, image: this._image });
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
}
