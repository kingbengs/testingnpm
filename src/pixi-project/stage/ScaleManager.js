const CANVAS_HEIGHT = 1080;

export default class ScaleManager {
  constructor(application) {
    this.application = application;
    this.canvasWidth = 0;
    this.canvasHeight = 0;
    this.containerWidth = 0;
    this.containerHeight = 0;
    this.canvasOffsetX = 0;
    this.canvasOffsetY = 0;
    this.aspectRatio = 1;

    this.readContainerSize();

    window.addEventListener('resize', this.onResize.bind(this));
  }

  readContainerSize() {
    this.setCanvasSize(0, 0, window.innerWidth, window.innerHeight);
  }

  setCanvasSize(offsetX, offsetY, width, height) {
    this.canvasOffsetX = offsetX;
    this.canvasOffsetY = offsetY;

    this.containerWidth = width;
    this.containerHeight = height;

    this.canvasWidth = (this.containerWidth * CANVAS_HEIGHT) / this.containerHeight;
    this.canvasHeight = CANVAS_HEIGHT;

    this.aspectRatio = this.containerWidth / this.canvasWidth;
  }

  updateCanvas() {
    const renderer = this.application.renderer;
    renderer.resize(Math.ceil(this.canvasWidth), Math.ceil(this.canvasHeight));
    renderer.view.style.width = `${Math.ceil(this.containerWidth)}px`;
    renderer.view.style.height = `${Math.ceil(this.containerHeight)}px`;
  }

  getContainerSize() {
    return { width: this.containerWidth, height: this.containerHeight };
  }

  getCanvasSize() {
    return { width: this.canvasWidth, height: this.canvasHeight };
  }

  onResize() {
    this.readContainerSize();
    this.updateCanvas();

    if (this.application.mainContainer) {
      const inputEventControler = this.application.mainContainer.planeContainer.inputEventControler;
      inputEventControler.onResize({
        x: this.canvasOffsetX,
        y: this.canvasOffsetY,
        width: this.canvasWidth,
        height: this.canvasHeight
      });
    }
  }

}
