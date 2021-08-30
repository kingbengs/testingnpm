import { PR_EVENT_COMMAND_MOVE_EXECUTED } from "shared/CSharedEvents";
import { commonSendEventFunction } from "shared/CSharedMethods";
import { CommandStatus } from "../CommandManager";

export default class CommandMove {

    constructor(object, startPosition, endPosition = null) {
        this.object = object;
        this.startPosition = startPosition.clone();
        this.endPosition = endPosition || object.position.clone();

        this.isExecuted = false;
    }

    execute() {
        if (!this.isExecuted) {
            this.object.x = this.endPosition.x;
            this.object.y = this.endPosition.y;
            this.object.move();
            this.isExecuted = true;

            commonSendEventFunction(PR_EVENT_COMMAND_MOVE_EXECUTED, {
                isExecuted: true,
                status: CommandStatus.UPDATE,
                objects: [this.object]
            });
        }
    }

    revert() {
        if (this.isExecuted) {
            this.object.x = this.startPosition.x;
            this.object.y = this.startPosition.y;
            this.object.move();
            this.isExecuted = false;

            commonSendEventFunction(PR_EVENT_COMMAND_MOVE_EXECUTED, {
                isExecuted: false,
                status: CommandStatus.UPDATE,
                objects: [this.object]
            });
        }
    }

}
