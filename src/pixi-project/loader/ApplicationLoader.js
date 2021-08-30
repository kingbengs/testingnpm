import 'pixi-assetslist-loader';
import * as PIXI from 'pixi.js';
import Signals from "pixi-project/signals/AppSignals";

export default class ApplicationLoader {
  loadAssets() {
    PIXI.Loader.shared.add(`${process.env.PUBLIC_URL}/asset/AssetsConfig.json`);
    PIXI.Loader.shared.onComplete.add(() => { this.onComplete(); });
    // PIXI.Loader.shared.onProgress.add(() => {Signals.loadingProgress.dispatch(e.progress)})
    PIXI.Loader.shared.load();
  }

  onComplete = () => {
    const entries = Object.entries(PIXI.Loader.shared.resources);
    this.textures = [];
    for (let i = 0; i < entries.length; i++) {
      const res = entries[i][1];
      if (res.texture) {
        this.textures.push(res.texture.baseTexture);
      }
    }

    Signals.assetsLoadingComplete.dispatch();
  }
}
