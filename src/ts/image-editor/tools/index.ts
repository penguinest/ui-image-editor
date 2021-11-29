import CropCornerHandler from '@/ts/image-editor/tools/cropper-handler';
import ScaleHandler from '@/ts/image-editor/tools/scale-handler';
import CanvasHandler from '@/ts/image-editor/canvas-handler';
import { EditorMode } from '../definitions';
import { TrackEventsVault } from '../helpers/events/definitions';
import { LayoutDefinitions, LayoutUtils } from '../helpers/layout';
import { Area } from '../helpers/layout/definitions';

export default class {
  private readonly _mode: EditorMode;
  private readonly _canvasHandler: CanvasHandler;
  private _cropperHandler: CropCornerHandler | null = null;
  private _scaleHandler: ScaleHandler | null = null;
  private _sizesSnapShot: LayoutDefinitions.SizeSnapShot = LayoutUtils.initialize.snapshots.dom();
  public readonly mouseEvents: TrackEventsVault;

  constructor(config: { canvasHandler: CanvasHandler; mode: EditorMode }) {
    const { canvasHandler, mode } = config;
    this._canvasHandler = canvasHandler;
    this._mode = mode;

    if (this._isModeSelected(EditorMode.CROP)) {
      this._cropperHandler = new CropCornerHandler(this._canvasHandler);
    }
    if (this._isModeSelected(EditorMode.SCALE)) {
      this._scaleHandler = new ScaleHandler();
    }

    // Store events in order to provide same pointer to removeListenerEvent
    this.mouseEvents = this._mouseEvents();
  }

  public cropArea(): Area | null {
    const area = this._cropperHandler?.cropInnerArea();
    if (!area) {
      return null;
    }
    const { X1: left, X2: right, Y1: top, Y2: bottom } = area;

    return {
      bottom,
      left,
      right,
      top
    };
  }

  public setSizes({
    editor,
    image,
    sourceChange
  }: {
    editor: LayoutDefinitions.EditorOffsetSize;
    image: LayoutDefinitions.Size;
    sourceChange?: boolean;
  }): void {
    const sizes = {
      canvas: {
        ...LayoutUtils.sizeFrom.canvas(this._canvasHandler.canvas),
        layoutReference: this._canvasHandler.layout
      },
      editor: LayoutUtils.sizeFrom.editor(editor),
      image: LayoutUtils.sizeFrom.image(image)
    };

    const { editor: previousEditor } = this._sizesSnapShot;
    const { editor: nextEditor } = sizes;

    const editorWithUpdatedSizes = previousEditor.width !== nextEditor.width || previousEditor.height !== nextEditor.height;

    if (sourceChange) {
      this._cropperHandler?.reset();
    }

    if (editorWithUpdatedSizes || sourceChange) {
      this._sizesSnapShot = sizes;

      this._cropperHandler?.updateSize(sizes);
      if (this._scaleHandler) {
        // TODO: IMPLEMENT ME
      }
    }
  }

  private _isModeSelected(mode: EditorMode): boolean {
    return (this._mode & mode) === mode;
  }

  private _mouseEvents(): TrackEventsVault {
    const events: TrackEventsVault = {
      mousedown: [],
      mousemove: [],
      mouseup: [],
      touchend: [],
      touchmove: [],
      touchstart: []
    };

    const rawEvents = [this._cropperHandler?.mouseEvents, this._scaleHandler?.mouseEvents];

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
