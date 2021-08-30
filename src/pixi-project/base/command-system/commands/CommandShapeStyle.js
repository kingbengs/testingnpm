import { cloneData } from "shared/CSharedMethods";

export default class CommandShapeStyle {

    constructor(shape, oldShapeData) {
        this.shape = shape;

        this.oldShapeData = cloneData(oldShapeData);
        this.newShapeData = cloneData(shape.shapeData);

        this.isExecuted = false;
    }

    execute() {
        if (!this.isExecuted) {
            this.shape.setShape(this.newShapeData);
            this.shape.drawShape();
            window.app.needsRendering();
            this.isExecuted = true;
        }
    }

    revert() {
        if (this.isExecuted) {
            this.shape.setShape(this.oldShapeData);
            this.shape.drawShape();
            window.app.needsRendering();
            this.isExecuted = false;
        }
    }

}
