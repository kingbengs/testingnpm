import Facade from "pixi-project/Facade";
import generateId from "pixi-project/utils/IDGenerator";
import Utils from "pixi-project/utils/Utils";
import { cloneData } from "shared/CSharedMethods";

const VALUE_OF_SHIFTING = 30;

export default class CopyPasteUtility {

    constructor(sceneManager, selectionManager) {
        this.sceneManager = sceneManager;
        this.selectionManager = selectionManager;
        this.clipboard = null;
        this.reset();
    }

    duplicateSelection() {
        this.copySelection();
        if (this.clipboard) {
            let center = JSON.parse(this.clipboard).center;
            center.x += VALUE_OF_SHIFTING;
            center.y += VALUE_OF_SHIFTING;
            center = window.app.viewport.toGlobal(center);
            this.pasteClipboard(center);
        }
    }

    copySelection() {
        let clipboard = JSON.parse(this.clipboard);
        clipboard.objects = [];
        clipboard.joints = [];

        let selectionBounds = null;
        let selectedObjects = this.selectionManager.selectedObjects;

        if (selectedObjects.length === 1) {
            let selectedElement = selectedObjects[0];
            let state = this.copyElementState(selectedElement);
            clipboard.objects.push(state);
            selectionBounds = Utils.findGroupBounds([selectedElement]);
        } else if (selectedObjects.length > 1) {
            selectionBounds = Utils.findGroupBounds(selectedObjects);

            for (let i = 0; i < selectedObjects.length; i++) {
                let state = this.copyElementState(selectedObjects[i]);
                clipboard.objects.push(state);
            }

            const joints = this.sceneManager.joints;

            for (let i = 0; i < joints.length; i++) {
                const joint = joints[i];
                const idA = joint.iconA.id;
                const idB = joint.iconB.id;
                // if both ends of the joint are in the clipboard , then lets copy the connection
                let counter = 0;
                for (let j = 0; j < clipboard.objects.length; j++) {
                    const object = clipboard.objects[j];
                    if (idA === object.ID || idB === object.ID) {
                        if (counter++ === 1) {
                            let state = this.copyElementState(joint);
                            clipboard.joints.push(state);
                        }
                    }
                }
            }
        }

        if (selectionBounds) {
            // Find the center point of the selection that was copied
            const bouindsLocalPosition = Facade.viewport.toLocal(new PIXI.Point(selectionBounds.left, selectionBounds.top));
            clipboard.center.x = bouindsLocalPosition.x + selectionBounds.width / 2;
            clipboard.center.y = bouindsLocalPosition.y + selectionBounds.height / 2;
        }

        // The reference is stored in JSON format to avoid references
        this.clipboard = JSON.stringify(clipboard);
    }

    copyElementState(element) {
        let state = cloneData(element.getState());
        state.isFocused = element.isFocused;
        state.focusFilterTypes = element.focusFilterTypes;
        return state;
    }

    canPaste() {
        let clipboard = JSON.parse(this.clipboard);

        if (clipboard.objects.length === 0) {
            // no objects to paste
            return false;
        } else {
            return true;
        }
    }

    pasteClipboard(p = null) {
        // prepare the clipboard
        p = p || window.app.renderer.plugins.interaction.mouse.global;
        p = window.app.viewport.toLocal(p);
        this.replaceClipboardIds(); // to avoid duplicate IDs
        let clipboard = JSON.parse(this.clipboard);

        if (!this.canPaste()) {
            // no objects to paste
            return;
        }

        // move the position of all the objects in the clipboard so that their group center
        // as at a new position , for the existing clipboard center see copySelection
        this.centerClipboardAt(clipboard, p);

        const importedObjects = this.sceneManager.addObjectsToScene(clipboard.objects, clipboard.joints);

        // Removes the elements from stage , and then inserts them through the command system.
        this.sceneManager.reAddElements(importedObjects);

        this.selectionManager.clearSelection();
        this.selectionManager.addObjectsToSelection(importedObjects); // select the pasted objects
        this.selectionManager.updateSelection(true, true);

        window.app.needsRendering();
    }

    centerClipboardAt(clipboard, p) {
        // calculate the distance between the clipboard group center
        // and the target point
        const shiftX = p.x - clipboard.center.x;
        const shiftY = p.y - clipboard.center.y;

        for (let i = 0; i < clipboard.objects.length; i++) {
            const objectData = clipboard.objects[i];
            objectData.x += shiftX;
            objectData.y += shiftY;

            if (objectData.shapeData) {
                objectData.shapeData.parentx = objectData.x;
                objectData.shapeData.parenty = objectData.y;
            }
        }
    }

    replaceClipboardIds() {
        let clipboard = JSON.parse(this.clipboard);

        let ids = {};

        for (let j = 0; j < clipboard.objects.length; j++) {
            const object = clipboard.objects[j];
            let id = generateId();
            ids[object.ID] = id;
            object.ID = id;
        }

        for (let j = 0; j < clipboard.joints.length; j++) {
            const joint = clipboard.joints[j];
            let id = generateId();
            ids[joint.ID] = id;
            joint.ID = id;
            joint.iconA_ID = ids[joint.iconA_ID];
            joint.iconB_ID = ids[joint.iconB_ID];
        }

        this.clipboard = JSON.stringify(clipboard);
    }

    reset() {
        // It is stored in JSON format to avoid references
        this.clipboard = JSON.stringify({ objects: [], joints: [], center: new PIXI.Point() });
    }

}
