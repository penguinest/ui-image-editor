import { LayoutDefinitions } from '../../helpers/layout';
import { CornerIdentity } from './corner/types';
import { DraggingAction, DraggingExection, MouseCursor } from './definitions';

export const mouseCursorByCornerIdentity = (identity: CornerIdentity): MouseCursor => {
  switch (identity) {
    case CornerIdentity.LT:
    case CornerIdentity.RB:
      return MouseCursor.ResizeNWSE;
    case CornerIdentity.LB:
    case CornerIdentity.RT:
      return MouseCursor.ResizeNESW;
    case CornerIdentity.TM:
    case CornerIdentity.BM:
      return MouseCursor.ResizeNS;
    case CornerIdentity.LM:
    case CornerIdentity.RM:
      return MouseCursor.ResizeEW;
  }
};

export const initialize = {
  corner: (): DraggingExection => ({
    action: DraggingAction.NONE,
    corner: null,
    start: null
  })
};

/**
 * Calcule position differences.
 */
export const calculeMoveDeltas = (initial: LayoutDefinitions.Position, end: LayoutDefinitions.Position): LayoutDefinitions.Position => {
  return {
    x: end.x - initial.x,
    y: end.y - initial.y
  };
};

export const isCornerIdentity = (identity: string): identity is CornerIdentity => {
  // Only for non-constant, number-based enums
  // return identity in CornerIdentity;
  return Object.values(CornerIdentity).includes(identity as CornerIdentity);
};

export const isKnownMouseCursor = (cursor: string): cursor is MouseCursor => {
  // Only for non-constant, number-based enums
  // return cursor in MouseCursor;
  return Object.values(MouseCursor).includes(cursor as MouseCursor);
};
