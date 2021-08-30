export default class CommandsBatch {

    constructor(commands = []) {
        this.commands = commands;
        this.isExecuted = false;
    }

    add(command) {
        this.commands.push(command);
    }

    addCommands(commands) {
        this.commands = this.commands.concat(commands);
    }

    execute() {
        if (!this.isExecuted) {
            for (let i = 0; i < this.commands.length; i++) {
                this.commands[i].execute();
            }
            this.isExecuted = true;
        }
    }

    revert() {
        if (this.isExecuted) {
            for (let i = 0; i < this.commands.length; i++) {
                this.commands[i].revert();
            }
            this.isExecuted = false;
        }
    }

    isEmpty() {
        return this.commands.length === 0;
    }

}
