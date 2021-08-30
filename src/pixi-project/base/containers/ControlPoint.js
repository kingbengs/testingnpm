import * as PIXI from 'pixi.js';

export default class ControlPoint extends PIXI.Graphics {
  constructor(type) {
    super();
    this.type = type;
  }
}
