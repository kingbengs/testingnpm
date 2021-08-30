import * as PIXI from 'pixi.js';
import Platform from 'pixi-project/utils/Platform';
import ScaleManager from 'pixi-project/stage/ScaleManager';
import AppViewport from 'pixi-project/stage/AppViewport';
import MainContainer from './view/MainContainer';
import Facade from "pixi-project/Facade"
import ApplicationLoader from "pixi-project/loader/ApplicationLoader";
import Signals from "pixi-project/signals/AppSignals";
import { TweenMax } from 'gsap';
import { COLOR_BACKGROUND } from 'pixi-project/view/Styles';
import PinchToZoomAndMove from './stage/PinchToZoomAndMove';

const ZOOMING_OUT_LIMIT = 0.02;
const ZOOMING_IN_LIMIT = 4;

export default class Application {

  constructor() {
    console.log('[Analysis] Application: constructor (before loading resources)');

    this.isTrackpadNavigation = false; //TODO read this from storage in a folowup stroy

    // Initialize Application
    this.renderer = null;
    this.stage = null;
    this.ticker = null;
    this.viewport = null;
    this._needsRendering = true;

    this.scaleManager = new ScaleManager(this);
    this.createPIXIApplication();
    this.createViewport();

    TweenMax.ticker.sleep();
    this.ticker.add(() => {
      TweenMax.ticker.tick();
    });
  }

  createPIXIApplication() {
    const canvas = document.getElementById('canvas');
    const isRetina = (window.devicePixelRatio || 1) > 1;
    const isMacOS = Platform.isMacOS();

    const canvasSize = this.scaleManager.getCanvasSize();

    const settings = {
      view: canvas,
      backgroundColor: COLOR_BACKGROUND,
      legacy: true,
      antialias: true,
      preserveDrawingBuffer: true,
      sharedLoader: true,
      width: canvasSize.width,
      height: canvasSize.height,
      powerPreference: isRetina ? 'high-performance' : undefined,
      resolution: isMacOS ? 2 : 1.5,
      autoDensity: true
    };

    this.renderer = new PIXI.Renderer(settings);
    this.stage = new PIXI.Container();
    this.ticker = new PIXI.Ticker();

    // on-demand rendering
    this.ticker.add(() => {
      if (this._needsRendering) {
        this._needsRendering = false;
        Signals.stageBeforeRendered.dispatch();
        this.renderer.render(this.stage);
      }
    }, PIXI.UPDATE_PRIORITY.LOW);
  }

  createViewport() {
    const canvasSize = this.scaleManager.getCanvasSize();
    const viewportSettings = {
      screenWidth: canvasSize.width,
      screenHeight: canvasSize.height,
      interaction: this.renderer.plugins.interaction,
      divWheel: this.renderer.view,
      passiveWheel: this.isTrackpadNavigation ? false : true
    };

    this.viewport = new AppViewport(viewportSettings);

    // add the viewport to the stage
    this.stage.addChild(this.viewport);

    // activate plugins
    this.viewport
      .drag()
      .clampZoom({
        minScale: ZOOMING_OUT_LIMIT,
        maxScale: ZOOMING_IN_LIMIT,
      });

    if (this.isTrackpadNavigation) {
      const wheelSettings = { trackpadPinch: true, wheelZoom: false, zoomSpeed: 5 };
      this.viewport.plugins.add('wheel', new PinchToZoomAndMove(this, this.viewport, wheelSettings));
    } else {
      this.viewport
        .pinch()
        .wheel();
    }

    Facade.viewport = this.viewport;
  }

  needsRendering() {
    this._needsRendering = true;
  }

  start = () => {
    console.log('[Analysis] Application: start (creating MainContainer, PlaneContainer)');
    this.mainContainer = new MainContainer();
    Facade.viewport.addChild(this.mainContainer);

    console.log('[Analysis] Application: constructor. Load resources start');
    this.appLoader = new ApplicationLoader();
    this.appLoader.loadAssets();
    this.ticker.start();
    this.scaleManager.onResize();
  }

}
