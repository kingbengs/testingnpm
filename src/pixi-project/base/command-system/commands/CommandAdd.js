import { PR_EVENT_COMMAND_ADD_EXECUTED } from 'shared/CSharedEvents';
import { commonSendEventFunction } from 'shared/CSharedMethods';
import SharedElementHelpers from 'shared/SharedElementHelpers';
import { CommandStatus } from '../CommandManager';

export default class CommandAdd {

    constructor(object, parent, objectsArray, relatedJoints, jointsLayer, jointsArray, selectionManager) {
        this.object = object;
        this.parent = parent;
        this.objects = objectsArray;
        this.relatedJoints = relatedJoints;
        this.jointsArray = jointsArray;
        this.jointsLayer = jointsLayer;
        this.selectionManager = selectionManager;
        this.isInitial = true;

        this.isExecuted = false;
    }

    execute() {
        if (!this.isExecuted) {
            this.isExecuted = true;
            const affectedObjects = [this.object];

            // Shapes && Texts have special rules on how to be placed on the canvas
            if (SharedElementHelpers.IsShape(this.object)) {
                SharedElementHelpers.InsertShape(this.object, this.objects, this.parent);
            } else if (SharedElementHelpers.IsText(this.object)) {
                SharedElementHelpers.InsertText(this.object, this.objects, this.parent);
            } else {
                this.parent.addChild(this.object);
                this.objects.push(this.object);
            }

            window.app.needsRendering();

            // attach event listeners to connections 
            if (!this.isInitial) {
                for (let i = 0; i < this.relatedJoints.length; i++) {
                    const conn = this.relatedJoints[i];
                    conn.attach();
                    this.jointsArray.push(conn);
                    this.jointsLayer.addChild(conn);
                }
            }

            // To make sure that he connection is drawn at the correct location
            for (let i = 0; i < this.relatedJoints.length; i++) {
                const conn = this.relatedJoints[i];
                conn.update();
                affectedObjects.push(conn);
            }

            commonSendEventFunction(PR_EVENT_COMMAND_ADD_EXECUTED, {
                isExecuted: true,
                status: CommandStatus.ADD,
                objects: affectedObjects
            });
        }
    }

    revert() {
        if (this.isExecuted) {
            const affectedObjects = [this.object];

            this.object.removeFromParent();
            this.objects.removeElement(this.object);
            this.selectionManager.clearSelection();
            this.selectionManager.hide();
            window.app.needsRendering();
            this.isExecuted = false;

            for (let i = 0; i < this.relatedJoints.length; i++) {
                const conn = this.relatedJoints[i];
                conn.detach();
                conn.removeFromParent();
                this.jointsArray.removeElement(conn);
                affectedObjects.push(conn);
            }

            this.isInitial = false;

            commonSendEventFunction(PR_EVENT_COMMAND_ADD_EXECUTED, {
                isExecuted: false,
                status: CommandStatus.DELETE,
                objects: affectedObjects
            });
        }
    }

}
