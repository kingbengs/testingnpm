import { PR_EVENT_FUNNEL_CHANGED } from "shared/CSharedEvents";
import { commonSendEventFunction } from "shared/CSharedMethods";
import Signals from "pixi-project/signals/AppSignals";

export default class CommandLineType {
    constructor(object, lineType) {
        this.object = object;
        this.oldLineType = this.object.lineType;
        this.newLineType = lineType;

        this.isExecuted = false;
    }

    execute() {
        if (!this.isExecuted) {
            commonSendEventFunction(PR_EVENT_FUNNEL_CHANGED);
            this.object.setLineType(this.newLineType);
            Signals.elementChanged.dispatch();

            this.isExecuted = true;
        }
    }

    revert() {
        if (this.isExecuted) {
            commonSendEventFunction(PR_EVENT_FUNNEL_CHANGED);
            this.object.setLineType(this.oldLineType);
            Signals.elementChanged.dispatch();

            this.isExecuted = false;
        }
    }
}
