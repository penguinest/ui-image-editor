import CanvasHandler from '@/ts/image-editor/tools/canvas-handler';
import { LayoutDefinitions } from '../../../helpers/layout';
import { CornerStyling, DEFAULT_STYLE } from './types';

export default class {
  public _path: Path2D = new Path2D();
  public readonly style: CornerStyling;
  private readonly _canvasHandler: CanvasHandler;
  private _position: LayoutDefinitions.Position | null = null;

  get path(): Path2D {
    return this._path;
  }

  get position(): LayoutDefinitions.Position | null {
    return this._position;
  }

  constructor(canvasHandler: CanvasHandler, style?: CornerStyling) {
    this._canvasHandler = canvasHandler;
    this.style = style || DEFAULT_STYLE;
  }

  public setPosition(position: LayoutDefinitions.Position): void {
    this._position = position;
  }

  public render(canvasRatio: number, touchDevice: boolean): void {
    if (!this._position || canvasRatio < 0) {
      return;
    }

    const { x, y } = this._position;

    const size = this.style.size;
    //const methodName = styling.isTransparent ? 'stroke' : 'fill';
    const stroke = this.style.hasBorder && this.style.strokeColor;

    this._canvasHandler.ctx.save();

    this._canvasHandler.ctx.fillStyle = this.style.fillColor;
    this._canvasHandler.ctx.strokeStyle = this.style.strokeColor;
    this._canvasHandler.ctx.lineWidth = canvasRatio;

    this._path = new Path2D();
    this._path.arc(x, y, Math.round(size[touchDevice ? 'touch' : 'mouse'] / (2 * canvasRatio)) + 0.5, 0, 2 * Math.PI, false);
    //ctx[methodName]();
    if (stroke) {
      this._canvasHandler.ctx.stroke(this._path);
    }
    this._canvasHandler.ctx.fill(this._path);
    this._canvasHandler.ctx.restore();
  }

  public reset(): void {
    this._position = null;
  }
}
