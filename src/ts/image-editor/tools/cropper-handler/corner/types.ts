//#region CONSTANTS
export const DEFAULT_STYLE: CornerStyling = {
  fillColor: 'rgb(255, 255, 255)',
  hasBorder: true,
  isTransparent: false,
  strokeColor: 'rgba(0, 0, 0, 0.8)',
  size: {
    mouse: 8,
    touch: 20
  }
};

export const BoundaryIdentity = {
  INNER: 'inner',
  OUTER: 'outer'
} as const;

export const CornerIdentity = {
  /*
   * Corner-coordinates schema
   *
   *    LT           TM            RT
   *     +------------+------------+
   *     |////////////|////////////|
   *     |////////////|////////////|
   *     |////////////|////////////|
   *  LM +------------+------------+ RM
   *     |////////////|////////////|
   *     |////////////|////////////|
   *     |////////////|////////////|
   *     +------------+------------+
   *    LB           BM            RB
   */
  LT: 'LT',
  LM: 'LM',
  LB: 'LB',
  RT: 'RT',
  RM: 'RM',
  RB: 'RB',
  TM: 'TM',
  BM: 'BM'
} as const;
//#endregion CONSTANTS

//#region TYPES
export type CornerStyling = {
  hasBorder: boolean;
  isTransparent: boolean;
  fillColor: string;
  strokeColor: string;
  size: {
    mouse: number;
    touch: number;
  };
};

export type BoundaryIdentity = typeof BoundaryIdentity[keyof typeof BoundaryIdentity];
export type CornerIdentity = typeof CornerIdentity[keyof typeof CornerIdentity];
//#endregion TYPES
