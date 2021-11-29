import { EditorMode, EditorTool } from '@/ts/image-editor/definitions';
import { TrackEventVault } from '../../helpers/events/definitions';

export default class implements EditorTool {
  public readonly mode = EditorMode.SCALE;

  constructor() {
    console.info('Implement me');
  }

  get mouseEvents(): TrackEventVault {
    return {
      mousedown: null,
      mousemove: null,
      mouseup: null,
      touchend: null,
      touchmove: null,
      touchstart: null
    };
  }
}
