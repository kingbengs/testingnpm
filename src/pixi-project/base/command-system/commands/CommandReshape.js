import { PR_EVENT_COMMAND_RESHAPE_EXECUTED } from "shared/CSharedEvents";
import { cloneData, commonSendEventFunction } from "shared/CSharedMethods";
import { CommandStatus } from "../CommandManager";

export default class CommandReshape {

    constructor(shape, oldShapeData, oldPosition) {
        this.shape = shape;
        this.oldPosition = oldPosition.clone();
        this.newPosition = shape.position.clone();

        this.oldShapeData = cloneData(oldShapeData);
        this.newShapeData = cloneData(shape.shapeData);

        this.isExecuted = false;
    }

    execute() {
        if (!this.isExecuted) {
            this.shape.setShape(this.newShapeData);
            this.shape.drawShape();
            this.shape.position.set(this.newPosition.x, this.newPosition.y);
            this.shape.move();
            this.shape.positionPoints();
            this.shape.setToolbarPositionPoint();
            window.app.needsRendering();
            this.isExecuted = true;

            commonSendEventFunction(PR_EVENT_COMMAND_RESHAPE_EXECUTED, {
                isExecuted: true,
                status: CommandStatus.UPDATE,
                objects: [this.shape]
            });
        }
    }

    revert() {
        if (this.isExecuted) {
            this.shape.setShape(this.oldShapeData);
            this.shape.drawShape();
            this.shape.position.set(this.oldPosition.x, this.oldPosition.y);
            this.shape.move()
            this.shape.positionPoints();
            this.shape.setToolbarPositionPoint();;
            window.app.needsRendering();
            this.isExecuted = false;

            commonSendEventFunction(PR_EVENT_COMMAND_RESHAPE_EXECUTED, {
                isExecuted: false,
                status: CommandStatus.UPDATE,
                objects: [this.shape]
            });
        }
    }

}
