import { PR_EVENT_COMMAND_SCALE_EXECUTED } from "shared/CSharedEvents";
import { commonSendEventFunction } from "shared/CSharedMethods";
import { CommandStatus } from "../CommandManager";

export default class CommandScale {

    constructor(object, oldScale, oldPosition) {
        this.object = object;
        this.oldPosition = oldPosition.clone();
        this.newPosition = object.position.clone();
        this.oldScale = oldScale.clone();
        this.newScale = object.scale.clone();

        this.isExecuted = false;
    }

    execute() {
        if (!this.isExecuted) {
            this.object.scale.set(this.newScale.x, this.newScale.y);
            this.object.position.set(this.newPosition.x, this.newPosition.y);
            this.object.move();
            window.app.needsRendering();
            this.isExecuted = true;

            commonSendEventFunction(PR_EVENT_COMMAND_SCALE_EXECUTED, {
                isExecuted: true,
                status: CommandStatus.UPDATE,
                objects: [this.object]
            });
        }
    }

    revert() {
        if (this.isExecuted) {
            this.object.scale.set(this.oldScale.x, this.oldScale.y);
            this.object.position.set(this.oldPosition.x, this.oldPosition.y);
            this.object.move();
            window.app.needsRendering();
            this.isExecuted = false;

            commonSendEventFunction(PR_EVENT_COMMAND_SCALE_EXECUTED, {
                isExecuted: false,
                status: CommandStatus.UPDATE,
                objects: [this.object]
            });
        }
    }

}
