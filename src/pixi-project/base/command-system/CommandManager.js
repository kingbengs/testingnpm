import { PR_EVENT_UNDO_REDO_ACTIONS_UPDATED } from "shared/CSharedEvents";
import { commonSendEventFunction } from "shared/CSharedMethods";

const COMMANDS_LIMIT = 50;

export const CommandStatus = {
    UPDATE: 'update',
    ADD: 'add',
    DELETE: 'delete'
};

export default class CommandManager {

    constructor(commandsQueue = []) {
        this.commandsQueue = commandsQueue;
        this.lastDoneActionIndex = -1;
        this.limit = COMMANDS_LIMIT;
    }

    execute(command) {
        // execute the command immediately
        command.execute();

        // In the case of executing Undo multiple times
        // and then we simply add a new command , then all the commands that where undone 
        // need to be removed from the commandsQueue
        if (this.lastDoneActionIndex !== this.commandsQueue.length - 1) {
            this.commandsQueue.splice(this.lastDoneActionIndex + 1);
        }

        this.commandsQueue.push(command);

        // Drop the first action the command queue when we exceed the limit
        if (this.commandsQueue.length > this.limit) {
            this.commandsQueue.shift();
        }

        // update the index to point to the last action that is being executed
        this.lastDoneActionIndex = this.commandsQueue.length - 1;
    }

    undo() {
        if (this.canUndo()) {
            // Take the last action that was executed , then decrement the index
            let command = this.commandsQueue[this.lastDoneActionIndex--];
            command.revert();
            commonSendEventFunction(PR_EVENT_UNDO_REDO_ACTIONS_UPDATED, {
                canUndo: this.canUndo(), canRedo: this.canRedo()
            });
        }
    }

    redo() {
        if (this.canRedo()) {
            // First increase the index to point to the next command
            let command = this.commandsQueue[++this.lastDoneActionIndex];
            command.execute();
            commonSendEventFunction(PR_EVENT_UNDO_REDO_ACTIONS_UPDATED, {
                canUndo: this.canUndo(), canRedo: this.canRedo()
            });
        }
    }

    canRedo() {
        return (this.lastDoneActionIndex < this.commandsQueue.length - 1);
    }

    canUndo() {
        return (this.lastDoneActionIndex >= 0);
    }

    reset() {
        this.commandsQueue = [];
        this.lastDoneActionIndex = -1;
    }

}
