import { PR_EVENT_COMMAND_REMOVE_EXECUTED } from "shared/CSharedEvents";
import { commonSendEventFunction } from "shared/CSharedMethods";
import { CommandStatus } from "../CommandManager";

export default class CommandDeleteStep {

    constructor(object, parent, objectsArray, focusSelectionManager) {
        this.object = object;
        this.parent = parent;
        this.objects = objectsArray;
        this.focusSelectionManager = focusSelectionManager;
        this.isExecuted = false;
        this.focusFilterTypes = object.isFocused ? object.focusFilterTypes.slice() : [];
    }

    execute() {
        if (!this.isExecuted) {
            this.isExecuted = true;
            window.app.needsRendering();

            this.object.removeFromParent();
            this.objects.removeElement(this.object);

            // TODO we should trigger hover out
            this.object.isHovered = false;

            if (this.focusFilterTypes.length) {
                for (let i = 0; i < this.focusFilterTypes.length; i++) {
                    const focusFilterType = this.focusFilterTypes[i];
                    this.focusSelectionManager.blurSingleElement(this.object, focusFilterType);
                }
                this.focusSelectionManager.drawAll();
            }

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

            if (this.focusFilterTypes.length) {
                for (let i = 0; i < this.focusFilterTypes.length; i++) {
                    const focusFilterType = this.focusFilterTypes[i];
                    this.focusSelectionManager.focusSingleElement(this.object, focusFilterType);
                }
                this.focusSelectionManager.drawAll();
            }

            commonSendEventFunction(PR_EVENT_COMMAND_REMOVE_EXECUTED, {
                isExecuted: false,
                status: CommandStatus.ADD,
                objects: [this.object]
            });
        }
    }

}
