import { BoundaryIdentity, CornerIdentity } from './corner/types';
import {
  CropAreaCorners,
  CropCanvasArea,
  CROP_AREA_STYLE,
  OuterCropArea,
  InnerCropArea,
  MouseCursor,
  DraggingAction,
  DraggingExection,
  DEFAULT_MIN_SIZE
} from './definitions';
import Corner from './corner';
import { calculeMoveDeltas, initialize, isCornerIdentity, isKnownMouseCursor, mouseCursorByCornerIdentity } from './utils';
import { cornerIdentityByDeltas } from './corner/utils';
import CanvasHandler from '../../canvas-handler';
import { EventDefinitions, EventUtils } from '../../helpers/events';
import { LayoutDefinitions, LayoutUtils } from '../../helpers/layout';
import { EditorMode, EditorTool } from '../../definitions';

export default class implements EditorTool {
  public readonly mode = EditorMode.CROP;
  private readonly _corners: CropAreaCorners;
  private readonly _canvasHandler: CanvasHandler;
  private _canvasSizeWithLayout = LayoutUtils.initialize.snapshots.canvasSizeWithLayout();
  private _draggingExecution: DraggingExection = initialize.corner();
  private _imageSizes = LayoutUtils.initialize.units.size();
  private _isTouchDevice = false;

  //#region GETTERS
  /**
   * Mouse event actions on track event trigger.
   * All `touch` event should `preventDefault` in order to do not double launch actions (after touch event, mouse events are always launch too).
   */
  get mouseEvents(): EventDefinitions.TrackEventVault {
    return {
      touchstart: (event) => {
        this.__mouseDownEvent(event);
        this._setTouchDevice(true);
        event.preventDefault();
      },
      touchend: (event) => {
        this.__mouseUpEvent(event);
        event.preventDefault();
      },
      touchmove: (event) => {
        this.__mouseMoveEvent(event);
        event.preventDefault();
      },
      mousemove: (event) => this.__mouseMoveEvent(event),
      mousedown: (event) => {
        this.__mouseDownEvent(event);
        this._setTouchDevice(false);
      },
      mouseup: (event) => this.__mouseUpEvent(event)
    };
  }
  //#endregion GETTERS

  constructor(canvasHandler: CanvasHandler) {
    this._corners = Object.values(CornerIdentity)
      .map((identity) => {
        return { [identity]: new Corner(canvasHandler) };
      })
      .reduce((acc, value) => ({ ...acc, ...value }), {}) as CropAreaCorners;

    this._canvasHandler = canvasHandler;
  }

  //#region PUBLIC METHODS
  public cropInnerArea(): InnerCropArea | null {
    const positionLT = this._corners[CornerIdentity.LT].position;
    const positionRB = this._corners[CornerIdentity.RB].position;
    if (positionLT && positionRB) {
      const { x: X1, y: Y1 } = positionLT;
      const { x: X2, y: Y2 } = positionRB;

      return { X1, X2, Y1, Y2 };
    }
    return null;
  }

  public cropOuterArea(): OuterCropArea {
    return {
      X0: 0,
      X3: this._imageSizes.width,
      Y0: 0,
      Y3: this._imageSizes.height
    };
  }

  /**
   * Reset all `corners` positions.
   */
  public reset(): void {
    Object.values(this._corners).forEach((corner) => corner.reset());
  }

  /**
   * Update crop area once wrappers sizes change.
   */
  public updateSize(input: { canvas: LayoutDefinitions.CanvasSizeWithLayout; image: LayoutDefinitions.Size }): void {
    this._canvasSizeWithLayout = input.canvas;

    const { layoutReference } = input.canvas;
    const canvasRatio = Math.min(layoutReference.horizontal, layoutReference.vertical);

    if (canvasRatio > 0) {
      this._imageSizes = input.image;
      if (this.cropInnerArea()) {
        this._renderAll();
      }
    }
  }
  //#endregion PUBLIC METHODS

  //#region PRIVATE METHODS
  /**
   * Check if a position belongs to inner or outer position.
   */
  private _boundaryByPosition(position: LayoutDefinitions.Position): BoundaryIdentity {
    const { x, y } = position;
    const innerArea = this.cropInnerArea();
    if (innerArea) {
      if (x >= innerArea.X1 && x <= innerArea.X2 && y >= innerArea.Y1 && y <= innerArea.Y2) {
        return BoundaryIdentity.INNER;
      }
    }
    return BoundaryIdentity.OUTER;
  }
  /**
   * Transform windows mouse/touch position into loaded image.
   * Note: Image can be larger than actual screen.
   */
  private _calculeMousePosition(rawPosition: LayoutDefinitions.Position): LayoutDefinitions.Position {
    const canvasLayoutReference = this._canvasSizeWithLayout.layoutReference;

    const position = {
      x: Math.max(Math.round((rawPosition.x - canvasLayoutReference.x) / canvasLayoutReference.horizontal), 0),
      y: Math.max(Math.round((rawPosition.y - canvasLayoutReference.y) / canvasLayoutReference.vertical), 0)
    };

    return position;
  }

  private _createCropArea(position: LayoutDefinitions.Position): CornerIdentity | null {
    const startPosition = this._draggingExecution.start;

    if (!startPosition) {
      throw new Error('Start position not found while creating CropArea.');
    }

    const deltas = calculeMoveDeltas(startPosition, position);
    const area = this._minimumCropArea({ deltas, position });

    if (!area) {
      return null;
    }

    const cornerIdentity = cornerIdentityByDeltas(deltas);
    this._setPositions(area);

    return cornerIdentity;
  }

  private _cropAreaCoodinates(): CropCanvasArea | null {
    const inner = this.cropInnerArea();

    if (inner) {
      const outer: OuterCropArea = {
        X0: 0,
        X3: this._imageSizes.width,
        Y0: 0,
        Y3: this._imageSizes.height
      };

      return {
        inner,
        outer
      };
    }
    return null;
  }

  /**
   * Check if a position belongs to a corner.
   */
  private _cornerIdByPosition(position: LayoutDefinitions.Position): CornerIdentity | null {
    const corner = Object.entries(this._corners).find(([identity, corner]) => {
      if (corner && isCornerIdentity(identity) && this._canvasHandler.ctx.isPointInPath(corner.path, position.x, position.y)) {
        return identity;
      }
    });

    return (corner?.[0] as CornerIdentity) || null;
  }

  /**
   * Create inner and outer areas.
   */
  private _fillCropArea(): void {
    const cropArea = this._cropAreaCoodinates();

    if (!cropArea) {
      return;
    }

    const { inner: innerCropArea, outer: outerCropArea } = cropArea;

    this._canvasHandler.ctx.save();
    // Reduce aliasing
    //ctx.translate(0.5, 0.5);
    this._canvasHandler.ctx.fillStyle = CROP_AREA_STYLE.fill;
    this._canvasHandler.ctx.strokeStyle = CROP_AREA_STYLE.stroke;
    this._canvasHandler.ctx.beginPath();

    //#region Outer rectangle
    this._canvasHandler.ctx.moveTo(outerCropArea.X0, outerCropArea.Y0);
    this._canvasHandler.ctx.lineTo(outerCropArea.X3, outerCropArea.Y0);
    this._canvasHandler.ctx.lineTo(outerCropArea.X3, outerCropArea.Y3);
    this._canvasHandler.ctx.lineTo(outerCropArea.X0, outerCropArea.Y3);
    this._canvasHandler.ctx.lineTo(outerCropArea.X0, outerCropArea.Y0);
    this._canvasHandler.ctx.closePath();
    this._canvasHandler.ctx.stroke();
    //#endregion Outer rectangle

    //#region Inner rectangle
    // Reduce aliasing
    //ctx.translate(0.5, 0.5);
    this._canvasHandler.ctx.moveTo(innerCropArea.X1, innerCropArea.Y1);
    this._canvasHandler.ctx.lineTo(innerCropArea.X1, innerCropArea.Y2);
    this._canvasHandler.ctx.lineTo(innerCropArea.X2, innerCropArea.Y2);
    this._canvasHandler.ctx.lineTo(innerCropArea.X2, innerCropArea.Y1);
    this._canvasHandler.ctx.lineTo(innerCropArea.X1, innerCropArea.Y1);
    this._canvasHandler.ctx.closePath();
    //#endregion Inner rectangle

    this._canvasHandler.ctx.fill();
    this._canvasHandler.ctx.restore();
  }

  /**
   * Render all crop related items on the canvas, this affects to corners & crop inner and outer areas.
   */
  private _renderAll(): void {
    this._canvasHandler.reDraw();
    this._fillCropArea();
    Object.values(this._corners).forEach((corner) =>
      corner.render(this._canvasSizeWithLayout.layoutReference.horizontal, this._isTouchDevice)
    );
  }

  /**
   * Given a drag movement, return the minumum crop area related to this movement.
   */
  private _minimumCropArea({
    deltas,
    position
  }: {
    deltas: LayoutDefinitions.Position;
    position: LayoutDefinitions.Position;
  }): LayoutDefinitions.Area | null {
    if (!deltas.x || !deltas.y) {
      return null;
    }
    const area = LayoutUtils.initialize.units.area();

    if (deltas.x > 0) {
      area.right = position.x + DEFAULT_MIN_SIZE;
      area.left = position.x;
    } else {
      area.right = position.x;
      area.left = position.x - DEFAULT_MIN_SIZE;
    }
    if (deltas.y > 0) {
      area.bottom = position.y + DEFAULT_MIN_SIZE;
      area.top = position.y;
    } else {
      area.bottom = position.y;
      area.top = position.y - DEFAULT_MIN_SIZE;
    }

    return area;
  }

  /**
   * @see DraggingAction.RESIZE
   */
  private _moveCorner({ cornerIdentity, position }: { cornerIdentity: CornerIdentity; position: LayoutDefinitions.Position }): void {
    const cropArea = this.cropInnerArea();

    if (!cropArea) {
      throw new Error('Invalid crop area.');
    }

    let { Y1: top, X2: right, Y2: bottom, X1: left } = cropArea;

    //#region calcule horizontal position
    switch (cornerIdentity) {
      case CornerIdentity.LT:
      case CornerIdentity.LM:
      case CornerIdentity.LB:
        {
          const gap = Math.max(right - position.x, DEFAULT_MIN_SIZE);
          left = right - gap;
        }
        break;
      case CornerIdentity.RB:
      case CornerIdentity.RT:
      case CornerIdentity.RM:
        {
          const gap = Math.max(position.x - left, DEFAULT_MIN_SIZE);
          right = left + gap;
        }
        break;
    }
    //#endregion calcule horizontal position

    //#region calcule vertical position
    switch (cornerIdentity) {
      case CornerIdentity.LT:
      case CornerIdentity.TM:
      case CornerIdentity.RT:
        {
          const gap = Math.max(bottom - position.y, DEFAULT_MIN_SIZE);
          top = bottom - gap;
        }
        break;
      case CornerIdentity.RB:
      case CornerIdentity.LB:
      case CornerIdentity.BM:
        {
          const gap = Math.max(position.y - top, DEFAULT_MIN_SIZE);
          bottom = top + gap;
        }
        break;
      //#endregion calcule vertical position
    }

    this._setPositions({
      bottom,
      left,
      right,
      top
    });
  }

  /**
   * @see DraggingAction.MOVE
   */
  private _moveCropArea(position: LayoutDefinitions.Position) {
    const innerAreaPosition = this.cropInnerArea();
    const startPosition = this._draggingExecution.start;

    if (innerAreaPosition && startPosition) {
      const outerBoundaries = this.cropOuterArea();

      let { X1: left, X2: right, Y1: top, Y2: bottom } = innerAreaPosition;

      const deltas = calculeMoveDeltas(startPosition, position);
      const moveDeltas = {
        x: 0,
        y: 0
      };

      if (deltas.x > 0) {
        moveDeltas.x = Math.min(right + deltas.x, outerBoundaries.X3) - right;
      } else if (deltas.x < 0) {
        moveDeltas.x = Math.max(left + deltas.x, outerBoundaries.X0) - left;
      }
      if (deltas.y > 0) {
        moveDeltas.y = Math.min(bottom + deltas.y, outerBoundaries.Y3) - bottom;
      } else if (deltas.y < 0) {
        moveDeltas.y = Math.max(top + deltas.y, outerBoundaries.Y0) - top;
      }

      if (moveDeltas.x === 0 && moveDeltas.y === 0) {
        return;
      }

      top += moveDeltas.y;
      right += moveDeltas.x;
      bottom += moveDeltas.y;
      left += moveDeltas.x;

      this._draggingExecution.start!.x += moveDeltas.x;
      this._draggingExecution.start!.y += moveDeltas.y;

      this._setPositions({
        bottom,
        left,
        right,
        top
      });
    } else {
      throw new Error('Either inner area or start position are not set.');
    }
  }

  /**
   * Detect mouse cursor for crop area movement depending on mouse position.
   */
  private _mouseCursorAreaByPosition(position: LayoutDefinitions.Position): MouseCursor.Auto | MouseCursor.Move {
    const boundaryIdentity = this._boundaryByPosition(position);
    return boundaryIdentity === BoundaryIdentity.INNER ? MouseCursor.Move : MouseCursor.Auto;
  }

  /**
   * Set corner position.
   */
  private _setPositions({ bottom, left, right, top }: { bottom: number; left: number; right: number; top: number }) {
    this._corners[CornerIdentity.LT].setPosition({ x: left, y: top });
    this._corners[CornerIdentity.LM].setPosition({ x: left, y: top + (bottom - top) / 2 });
    this._corners[CornerIdentity.LB].setPosition({ x: left, y: bottom });
    this._corners[CornerIdentity.RT].setPosition({ x: right, y: top });
    this._corners[CornerIdentity.RM].setPosition({ x: right, y: top + (bottom - top) / 2 });
    this._corners[CornerIdentity.RB].setPosition({ x: right, y: bottom });
    this._corners[CornerIdentity.TM].setPosition({ x: left + (right - left) / 2, y: top });
    this._corners[CornerIdentity.BM].setPosition({ x: left + (right - left) / 2, y: bottom });

    this._renderAll();
  }

  private _setDraggingExecution(action: Exclude<DraggingAction, DraggingAction.NONE>, position: LayoutDefinitions.Position) {
    this._draggingExecution = {
      ...this._draggingExecution,
      action,
      start: position
    };
  }

  private _setTouchDevice(value: boolean): void {
    this._isTouchDevice = value;
  }

  private __mouseMoveEvent: EventDefinitions.CanvasEvent = (event): void => {
    const target = event.target instanceof HTMLCanvasElement && event.target;
    if (!target) {
      return;
    }

    const draggingAction = this._draggingExecution.action;
    const trackPosition = EventUtils.trackPosition(event);
    const position = this._calculeMousePosition(trackPosition);

    if (draggingAction === DraggingAction.NONE) {
      if (this.cropInnerArea()) {
        const currentCursor = isKnownMouseCursor(target.style.cursor) ? target.style.cursor : MouseCursor.Auto;
        const cornerIdentity = this._cornerIdByPosition(position);
        const nextCursor = (cornerIdentity && mouseCursorByCornerIdentity(cornerIdentity)) ?? this._mouseCursorAreaByPosition(position);

        if (nextCursor && nextCursor !== currentCursor) {
          target.style.cursor = nextCursor;
        }
      }
    } else if (draggingAction === DraggingAction.RESIZE) {
      const cornerIdentity = this._draggingExecution.corner ?? this._cornerIdByPosition(position);
      if (cornerIdentity) {
        if (!this._draggingExecution.corner) {
          this._draggingExecution.corner = cornerIdentity;
        }
        this._moveCorner({ cornerIdentity, position });
      } else {
        console.error(cornerIdentity, 'This should never happen');
      }
    } else if (draggingAction === DraggingAction.CREATE) {
      if (this._draggingExecution.corner) {
        this._moveCorner({ cornerIdentity: this._draggingExecution.corner, position });
      } else {
        const cornerIdentity = this._createCropArea(position);
        if (cornerIdentity) {
          this._draggingExecution.corner = cornerIdentity;
        }
      }
    } else if (draggingAction === DraggingAction.MOVE) {
      this._moveCropArea(position);
    }
  };

  private __mouseDownEvent: EventDefinitions.CanvasEvent = (event): void => {
    const trackPosition = EventUtils.trackPosition(event);

    const position = this._calculeMousePosition(trackPosition);

    const cornerIdentity = this._cornerIdByPosition(position);
    if (cornerIdentity) {
      this._setDraggingExecution(DraggingAction.RESIZE, position);
    } else {
      const boundaryIdentity = this._boundaryByPosition(position);
      if (boundaryIdentity === BoundaryIdentity.INNER) {
        this._setDraggingExecution(DraggingAction.MOVE, position);
      } else {
        if (!this.cropInnerArea()) {
          this._setDraggingExecution(DraggingAction.CREATE, position);
        }
      }
    }
  };

  private __mouseUpEvent: EventDefinitions.CanvasEvent = (_event): void => {
    this._draggingExecution = initialize.corner();
  };
  //#endregion PRIVATE METHODS
}
