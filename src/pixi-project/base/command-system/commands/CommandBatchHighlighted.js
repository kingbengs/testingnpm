import CommandsBatch from "../CommandsBatch";

export default class CommandBatchHighlighted extends CommandsBatch {

    constructor(selectionManager) {
        super();
        this.selectionManager = selectionManager;
    }

    execute() {
        super.execute()
        this.selectionManager.show();
    }

    revert() {
        super.revert()
        this.selectionManager.show();
    }

}
