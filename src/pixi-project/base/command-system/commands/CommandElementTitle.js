export default class CommandElementTitle {
    constructor(object, previousTitle, nextTitle) {
        this.object = object;
        this.previousTitle = previousTitle;
        this.nextTitle = nextTitle;

        this.isExecuted = false;
    }

    execute() {
        if (!this.isExecuted) {
            this.object.drawTitleLabel(this.nextTitle);
            window.app.needsRendering();
            this.isExecuted = true;
        }
    }

    revert() {
        if (this.isExecuted) {
            this.object.drawTitleLabel(this.previousTitle);
            window.app.needsRendering();
            this.isExecuted = false;
        }
    }
}
