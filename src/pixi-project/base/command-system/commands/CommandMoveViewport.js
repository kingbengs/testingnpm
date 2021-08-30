export default class CommandMoveViewport {

    constructor(object, oldPosition , mesh) {
        this.object = object;
        this.oldPosition = oldPosition.clone();
        this.newPosition = object.center.clone();
        this.mesh = mesh;

        this.isExecuted = false;
    }

    execute() {
        if (!this.isExecuted) {
            this.object.moveCenter(this.newPosition.x, this.newPosition.y);
            this.mesh.recalculate();
            window.app.needsRendering();
            this.isExecuted = true;
        }
    }

    revert() {
        if (this.isExecuted) {
            this.object.moveCenter(this.oldPosition.x, this.oldPosition.y);
            this.mesh.recalculate();
            window.app.needsRendering();
            this.isExecuted = false;
        }
    }

}
