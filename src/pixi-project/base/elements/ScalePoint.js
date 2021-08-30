import * as PIXI from 'pixi.js';

export default class ScalePoint extends PIXI.Graphics {
  constructor(name) {
    super();
    this.name = name;

    this.lineStyle(3, 0xD64E82);
    this.beginFill(0xf0f2f7);
    this.drawRoundedRect(0, 0, 10, 10, 3);
    this.pivot.set(this.width / 2);
  }
}
