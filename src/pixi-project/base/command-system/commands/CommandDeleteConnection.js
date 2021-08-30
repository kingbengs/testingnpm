import { PR_EVENT_COMMAND_REMOVE_EXECUTED } from "shared/CSharedEvents";
import { commonSendEventFunction } from "shared/CSharedMethods";
import { CommandStatus } from "../CommandManager";

export default class CommandDeleteConnection {

    constructor(object, parent, objectsArray) {
        this.object = object;
        this.parent = parent;
        this.objects = objectsArray;
        this.isExecuted = false;
    }

    execute() {
        if (!this.isExecuted) {
            this.isExecuted = true;
            window.app.needsRendering();

            this.object.removeFromParent();
            this.objects.removeElement(this.object);
            this.object.detach();

            commonSendEventFunction(PR_EVENT_COMMAND_REMOVE_EXECUTED, {
                isExecuted: true,
                status: CommandStatus.DELETE,
                objects: [this.object]
            });
        }
    }

    revert() {
        if (this.isExecuted) {
            this.isExecuted = false;
            window.app.needsRendering();

            this.parent.addChild(this.object);
            this.objects.push(this.object);
            this.object.attach();
            this.object.update();

            commonSendEventFunction(PR_EVENT_COMMAND_REMOVE_EXECUTED, {
                isExecuted: false,
                status: CommandStatus.ADD,
                objects: [this.object]
            });
        }
    }

}
