import Signals from "pixi-project/signals/AppSignals";

export default class CommandElementURL {
    constructor(object, previousURL, nextURL) {
        this.object = object;
        this.previousURL = previousURL;
        this.nextURL = nextURL;

        this.isExecuted = false;
    }

    execute() {
        if (!this.isExecuted) {
            this.object.url = this.nextURL;
            window.app.needsRendering();
            Signals.elementChanged.dispatch();
            this.isExecuted = true;
        }
    }

    revert() {
        if (this.isExecuted) {
            this.object.url = this.previousURL;
            Signals.elementChanged.dispatch();
            window.app.needsRendering();
            this.isExecuted = false;
        }
    }
}
