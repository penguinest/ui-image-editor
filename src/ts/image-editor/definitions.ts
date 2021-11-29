import { TrackEventsVault, TrackEventVault } from './helpers/events/definitions';

//#region ENUMS
/**
 * Define available tools on `ImageEditor` tool.
 * Intended for **bitwise** operations.
 */
export enum EditorMode {
  CROP = 1 << 0,
  SCALE = 1 << 1,
  ALL = ~(~0 << 2)
}
//#endregion

//#region INTERFACES
/**
 * Minimum implementation editor tools.
 */
export interface EditorTool {
  readonly mode: EditorMode;
  readonly mouseEvents: TrackEventVault | null;
}
//#endregion INTERFACES

//#region TYPES
export type ConstructorParameters = { canvas: HTMLCanvasElement; editor: HTMLDivElement; mode: EditorMode };

// Main intention here is accept more event in future
export type ImageEditorMouseEvents = TrackEventsVault;
//#endregion TYPES
