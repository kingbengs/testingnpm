import * as PIXI from 'pixi.js';
import PlaneContainer from "pixi-project/view/PlaneContainer";

export default class MainContainer extends PIXI.Container {
  constructor() {
    super();
    this.init();
  }

  init() {
    console.log('[Analysis] MainContainer: PlaneContainer creation');
    this.planeContainer = new PlaneContainer();

    this.addChild(this.planeContainer);
  }
}
