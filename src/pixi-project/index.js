import { TweenMax } from "gsap"
import * as PIXI from "pixi.js"
import 'pixi-project/core/ExtraPIXI.js';
import 'pixi-project/core/ExtraFunctions.js';
import Application from "pixi-project/Application";

window.PIXI = PIXI;

TweenMax.ticker.useRAF(true);

// Silence all console messages in production
if(process.env.NODE_ENV === "production"){
    console.log = () => {};
    console.warn = () => {};
}

console.log('[Analysis] index.js: creation of Application');
window.app = new Application();
window.app.start();
