import { Viewport } from 'pixi-viewport';
import AppSignals from "pixi-project/signals/AppSignals";

export default class AppViewport extends Viewport {
  onEvent() {
    AppSignals.viewportChanged.dispatch();
  }
}

