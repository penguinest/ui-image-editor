import { EditorMode, EditorTool } from '@/ts/image-editor/definitions';
import { TrackEventVault } from '../../helpers/events/definitions';

export default class implements EditorTool {
  public readonly mode = EditorMode.SCALE;

  constructor() {
    console.info('Implement me');
  }

  get mouseEvents(): Partial<TrackEventVault> {
    return {};
  }
}
