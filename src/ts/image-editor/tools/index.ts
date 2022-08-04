import CropCornerHandler from '@/ts/image-editor/tools/cropper-handler';
import CanvasHandler from '@/ts/image-editor/tools/canvas-handler';
import { EditorMode } from '../definitions';
import { TrackEventsVault } from '../helpers/events/definitions';
import { LayoutDefinitions, LayoutUtils } from '../helpers/layout';
import { Area, CardinalArea } from '../helpers/layout/definitions';
import ImageManipulator from './image-manipulator/image-manipulator';
import { Store } from '../store';

type ConfigParams = {
  canvas: HTMLCanvasElement;
  mode: EditorMode;
  restrictedOutput?: LayoutDefinitions.Size;
  store: Store;
  wrapper: HTMLDivElement;
};

export default class {
  private readonly _mode: EditorMode;
  private readonly _canvasHandler: CanvasHandler;
  private _cropperHandler: CropCornerHandler | null = null;
  private readonly _mouseEvents: TrackEventsVault;

  constructor(config: ConfigParams) {
    const { canvas, mode, restrictedOutput, store, wrapper } = config;
    this._canvasHandler = new CanvasHandler({ canvas, restrictedOutput, store, wrapper });
    this._mode = mode;

    if (this._isModeSelected(EditorMode.CROP)) {
      this._cropperHandler = new CropCornerHandler(this._canvasHandler);
    }

    // Store events in order to provide same pointer to removeListenerEvent
    this._mouseEvents = this._createMouseEvents();
  }

  //#region PUBLIC METHODS
  /** Perform image manipulation using the given modifications. */
  public async apply(): Promise<string> {
    const { src } = this._canvasHandler;

    if (!src) {
      throw new Error('Image is not set');
    }

    let imageManipulator = await ImageManipulator(src);

    if (this._isModeSelected(EditorMode.CROP)) {
      const cutArea = this.cutArea();
      if (cutArea) {
        imageManipulator = imageManipulator.crop(cutArea);
      }
    }

    if (this._isModeSelected(EditorMode.SCALE)) {
      const outputSize = this._canvasHandler.snapshot.edition.output;
      if (outputSize) {
        imageManipulator = await imageManipulator.scale(outputSize);
      }
    }
    return imageManipulator.url('jpeg');
  }

  /**
   * Update events binding.
   * @param onInitialize [true] -> add / [false] -> remove
   */
  public setEventListenersState(onInitialize: boolean) {
    this._canvasHandler.setEventListenersState({
      canvasEvents: this._mouseEvents,
      onInitialize
    });
  }

  /**
   * Returns the current cropped area, if any.
   */
  public cutArea(): Area | null {
    const area = this._canvasHandler.snapshot.edition.cut;
    if (!area) {
      return null;
    }

    return LayoutUtils.area.fromCardinal(area);
  }

  public setCropArea(value: CardinalArea) {
    this._cropperHandler?.updateSizeFromInterface(value);
  }

  public setOutputSize(size: LayoutDefinitions.Size | null): void {
    const result = this._canvasHandler.updateRestrictedOutputSize(size);

    if (result) {
      this.setCropArea(result);
    }
  }

  /**
   * Adjust canvas and crop area to the wrapper layout.
   */
  public onResize(): void {
    if (this._canvasHandler.updateSizes()) {
      this._canvasHandler.reDraw();
      this._cropperHandler?.updateSize();
    }
  }

  /**
   * Update printed image on the canvas. This implies reseting all the modifications & adjusting canvas sizes.
   */
  public updateImage(image: HTMLImageElement) {
    if (!this._canvasHandler.setImage(image)) {
      return;
    }

    this._canvasHandler.reset();
    this._cropperHandler?.reset();

    // Adjust canvas to the new image layout.
    this.onResize();
  }
  //#endregion PUBLIC METHODS

  //#region PRIVATE METHODS
  private _isModeSelected(mode: EditorMode): boolean {
    return (this._mode & mode) === mode;
  }

  private _createMouseEvents(): TrackEventsVault {
    const events: TrackEventsVault = {
      mousedown: [],
      mousemove: [],
      mouseup: [],
      touchend: [],
      touchmove: [],
      touchstart: [],
      wheel: []
    };

    const rawEvents = [this._cropperHandler?.mouseEvents];

    rawEvents.forEach((toolsEvent) => {
      if (toolsEvent) {
        Object.entries(toolsEvent).filter(([key, value]) => {
          if (value) {
            events[key as keyof TrackEventsVault].push(value);
          }
        });
      }
    });
    return events;
  }
  //#endregion PRIVATE METHODS
}
