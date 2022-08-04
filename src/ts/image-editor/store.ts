import { reactive, readonly } from 'vue';
import { CardinalArea, Size } from './helpers/layout/definitions';

export type State = {
  crop: CardinalArea | null;
  outputSize: Size | null;
};

const defaultState: State = {
  crop: null,
  outputSize: null
};

export class Store {
  protected readonly _state: State;

  constructor() {
    this._state = reactive({ ...defaultState });
  }

  get state(): State {
    return readonly(this._state);
  }

  public reset() {
    const { crop, outputSize } = defaultState;

    this._state.crop = crop;
    this._state.outputSize = outputSize;
  }

  public setCrop(value: CardinalArea | null) {
    this._state.crop = value;
  }

  public setOutput(value: Size | null) {
    this._state.outputSize = value;
  }
}
