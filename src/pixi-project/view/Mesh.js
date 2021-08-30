import * as PIXI from 'pixi.js';
import Facade from 'pixi-project/Facade';

import { COLOR_MESH_LINE, COLOR_MESH_BACKGROUND } from "pixi-project/view/Styles";

const MESH_LINE_WIDTH = 2;
const MESH_LINE_ALPHA = 1;
const MESH_TEXTURE_SIZE = 256;

export default class Mesh extends PIXI.Container {
  constructor() {
    super();

    let texture = this.createTexture();
    let width = Facade.viewport.screenWidth;
    let height = Facade.viewport.screenHeight;

    this.pattern = new PIXI.TilingSprite(texture, width, height);
    this.addChild(this.pattern);
    this.recalculate();
  }

  createTexture() {
    this.graphics = new PIXI.Graphics();

    let textureWidth = MESH_TEXTURE_SIZE;
    let textureHeight = MESH_TEXTURE_SIZE;

    let renderTexture = new PIXI.RenderTexture.create({
      width: textureWidth,
      height: textureHeight,
      resolution: 1,
    });

    this.graphics.clear();
    this.graphics.beginFill(COLOR_MESH_BACKGROUND);
    this.graphics.drawRect(0, 0, textureWidth, textureHeight);
    this.graphics.endFill();

    this.graphics.lineStyle(MESH_LINE_WIDTH, COLOR_MESH_LINE, MESH_LINE_ALPHA);

    const rows = 2;
    const cols = 2;

    const rowHeight = textureHeight / rows;
    const colWidth = textureWidth / cols;

    for (let i = 0; i <= rows; i++) {
      this.graphics.moveTo(0, rowHeight * i);
      this.graphics.lineTo(textureWidth, rowHeight * i);
    }

    for (let i = 0; i <= cols; i++) {
      this.graphics.moveTo(colWidth * i, 0);
      this.graphics.lineTo(colWidth * i, textureHeight);
    }

    window.app.renderer.render(this.graphics, renderTexture);

    return renderTexture;
  }

  recalculate() {
    this.pattern.width = Facade.viewport.screenWidth;
    this.pattern.height = Facade.viewport.screenHeight;
    this.pattern.tilePosition.x = Facade.viewport.x;
    this.pattern.tilePosition.y = Facade.viewport.y;
    this.pattern.tileScale.set(Facade.viewport.scaled / 2);
  }

  show() {
    this.visible = true;
  }

  hide() {
    this.visible = false;
  }
}
