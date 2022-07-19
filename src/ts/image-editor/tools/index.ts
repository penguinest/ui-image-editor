import CropCornerHandler from '@/ts/image-editor/tools/cropper-handler';
import CanvasHandler from '@/ts/image-editor/tools/canvas-handler';
import { EditorMode } from '../definitions';
import { TrackEventsVault } from '../helpers/events/definitions';
import { LayoutDefinitions } from '../helpers/layout';
import { Area } from '../helpers/layout/definitions';
import ImageManipulator from './image-manipulator/image-manipulator';

export default class {
  private readonly _mode: EditorMode;
  private readonly _canvasHandler: CanvasHandler;
  private _cropperHandler: CropCornerHandler | null = null;
  private readonly _mouseEvents: TrackEventsVault;

  constructor(config: { canvas: HTMLCanvasElement; mode: EditorMode; restrictedOutput?: LayoutDefinitions.Size; wrapper: HTMLDivElement }) {
    const { canvas, mode, restrictedOutput, wrapper } = config;
    this._canvasHandler = new CanvasHandler({ canvas, restrictedOutput, wrapper });
    this._mode = mode;

    if (this._isModeSelected(EditorMode.CROP)) {
      this._cropperHandler = new CropCornerHandler(this._canvasHandler);
    }

    // Store events in order to provide same pointer to removeListenerEvent
    this._mouseEvents = this._createMouseEvents();
  }

  public apply(): string {
    const { ctx } = this._canvasHandler;
    const imageManipulator = ImageManipulator(ctx);

    if (this._isModeSelected(EditorMode.CROP)) {
      const cutArea = this.cutArea();
      if (cutArea) {
        return imageManipulator.crop(cutArea).url('jpg');
      }
    }
    if (this._isModeSelected(EditorMode.SCALE)) {
      // TODO: IMPLEMENT ME
    }
    return imageManipulator.url('jpg');
  }

  public configureEventListenersState(onInitialize: boolean) {
    this._canvasHandler.configureEventListenersState({
      canvasEvents: this._mouseEvents,
      onInitialize
    });
  }

  public cutArea(): Area | null {
    const area = this._canvasHandler.snapshot.edition.cut;

    return area ?? null;
  }

  public setOutputSize(size: LayoutDefinitions.Size | null): void {
    this._canvasHandler.updateRestrictedOutputSize(size);
  }

  public setSizes(): void {
    if (this._canvasHandler.updateSizes()) {
      this._cropperHandler?.updateSize();
      this._canvasHandler.reDraw();
    }
  }

  public updateImage(image: HTMLImageElement) {
    if (!this._canvasHandler.setImage(image)) {
      return;
    }

    this._canvasHandler.reset();
    this._cropperHandler?.reset();

    this.setSizes();
  }

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
}
