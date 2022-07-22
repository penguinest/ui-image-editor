import { reactive, readonly } from 'vue';
import { CardinalArea } from './helpers/layout/definitions';

type State = {
  crop: CardinalArea;
};

const defaultState: State = {
  crop: {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  }
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
}
