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
    this._state = reactive(defaultState);
  }

  get state(): State {
    return readonly(this._state);
  }

  public setCrop(value: CardinalArea) {
    this._state.crop = value;
  }

  public setOutput(value: Size | null) {
    this._state.outputSize = value;
  }
}
