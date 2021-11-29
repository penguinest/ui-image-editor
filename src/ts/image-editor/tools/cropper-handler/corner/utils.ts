import { LayoutDefinitions } from '../../../helpers/layout';
import { CornerIdentity } from './types';

export const cornerIdentityByDeltas = (deltas: LayoutDefinitions.Position): CornerIdentity => {
  const incrementHorizontal = deltas.x > 0;
  const incrementVertical = deltas.y > 0;

  if (incrementHorizontal) {
    return incrementVertical ? CornerIdentity.RB : CornerIdentity.RT;
  }
  return incrementVertical ? CornerIdentity.LB : CornerIdentity.LT;
};
