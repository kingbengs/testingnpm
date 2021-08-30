import Facade from "pixi-project/Facade";
import Utils from "pixi-project/utils/Utils";
import {
    PR_EVENT_ELEMENT_POINTER_UP,
    PR_EVENT_ELEMENT_SELECTED,
    PR_EVENT_FUNNEL_CHANGED,
    PR_EVENT_TOOLBAR_SHOWING,
    RP_EVENT_ELEMENT_RIGHT_CLICK
} from "shared/CSharedEvents";
import { EElementCategories } from 'shared/CSharedCategories';
import { commonSendEventFunction, getMousePosition } from "shared/CSharedMethods";
import { SELECTION_BOUNDARY_GAP, SELECTION_PADDING, SELECTION_ROUND_CORNER } from "../Styles";
import {
    PR_EVENT_BRING_FORWARD,
    PR_EVENT_BRING_TO_FRONT,
    PR_EVENT_SEND_BACKWARD,
    PR_EVENT_SEND_TO_BACK,
} from 'shared/CSharedEvents';
import MultipleSelection from "./MultipleSelection";
import SelectionTool from "./SelectionTool";
import CommandMove from "pixi-project/base/command-system/commands/CommandMove";
import AppSignals from "pixi-project/signals/AppSignals";
import CommandBatchHighlighted from "pixi-project/base/command-system/commands/CommandBatchHighlighted";
import SharedElementHelpers from "shared/SharedElementHelpers";
import FocusSelection from "./FocusSelection";

const ORDER_ASC = 'ASC';
const ORDER_DESC = 'DESC';

export default class SelectionManager {

    constructor(delegate, sceneManager) {
        this.selectedObjects = [];
        this.delegate = delegate;
        this.sceneManager = sceneManager;
        this.single = new SelectionTool(this.onHeadsDown.bind(this), this);
        this.multi = new MultipleSelection(this.onHeadsDown.bind(this), this);
        this.focusSelection = new FocusSelection(this);

        this.selectedElementLocalPos = null;
        this.selectedElementInsideShape = false;
        this.didDrag = false; // if any element position was moved
        this.startingPositions = [];

        document.addEventListener(PR_EVENT_BRING_FORWARD, this.onBringForward.bind(this), false);
        document.addEventListener(PR_EVENT_BRING_TO_FRONT, this.onBringToFront.bind(this), false);
        document.addEventListener(PR_EVENT_SEND_BACKWARD, this.onSendBackward.bind(this), false);
        document.addEventListener(PR_EVENT_SEND_TO_BACK, this.onSendToBack.bind(this), false);
    }

    get selectedElement() {
        if (this.selectedObjects.length === 1) {
            return this.selectedObjects[0];
        } else {
            return null;
        }
    }

    onViewportDown(e) {
        //if element was not created after connection in empty space
        if (!this.sceneManager.iconA) {
            this.didDrag = false;
            this.clearSelection();
            this.multi.isSelecting = true;
            this.multi.onViewportDown(e);

            this.updateSelection();
        }
    }

    onViewportMove(e) {
        if (this.multi.isSelecting) {
            this.multi.drawFrame = false;
            this.multi.drawSelection = true;
            this.multi.onViewportMove(e);

            this.resolveMultiSelection();
            this.updateSelection(false, false, false, false, false);
        }
    }

    onViewportUp(e) {
        if (this.multi.isSelecting) {
            this.multi.onViewportUp(e);
            this.resolveMultiSelection(e);
        }

        this.updateSelection(true, true);
    }

    onViewportOut(e) {
        //TODO handle it here
    }

    onElementPointerDown(e, isMultiSelect) {
        // The event is attached at the content layer of the elements
        // so that is why we are looking at the parent element
        const element = this.getClickedElement(e);
        element.isPointerDown = true;

        e.stopPropagation();
        this.didDrag = false;

        // Handle element selection
        this.applySelectionRules(element, isMultiSelect);


        // Prepare objects for dragging
        if (this.selectedObjects.length === 1) {
            this.selectedElementLocalPos = e.data.getLocalPosition(this.selectedElement);
            this.selectedElementLocalPos.x *= this.selectedElement.scale.x;
            this.selectedElementLocalPos.y *= this.selectedElement.scale.y;
            this.selectedElement.data = e.data;
            this.selectedElement.startPos = {
                x: e.data.global.x,
                y: e.data.global.y,
            };

            Facade.viewport.plugins.pause('drag');
        } else if (this.selectedObjects.length > 1) {
            this.selectedObjects.forEach(element => {
                let position = e.data.getLocalPosition(element);
                element.freezeStartMoveData(position, e.data);
            });
            Facade.viewport.plugins.pause('drag');
        }

        this.startingPositions = [];
        this.selectedObjects.forEach(element => {
            this.startingPositions.push({ element, position: element.position.clone() });
        });
    }

    onElementPointerMove(e) {
        // The event is attached at the content layer of the elements
        // so that is why we are looking at the parent element
        const element = this.getClickedElement(e);

        if (element.isPointerDown) {
            this.moveElements();
        }
    }

    moveElements() {
        if (this.selectedObjects.length === 1) {
            // DRAG Single Element
            const newPosition = this.selectedElement.data.getLocalPosition(Facade.viewport);
            this.selectedElement.x = newPosition.x - this.selectedElementLocalPos.x;
            this.selectedElement.y = newPosition.y - this.selectedElementLocalPos.y;
            this.selectedElement.move();
        } else if (this.selectedObjects.length > 1) {
            // DRAG Multiselection
            let newPosition, frozenData;
            this.selectedObjects.forEach(element => {
                frozenData = element.getFrozenData();
                newPosition = frozenData.eventData.getLocalPosition(Facade.viewport);
                element.x = newPosition.x - frozenData.position.x;
                element.y = newPosition.y - frozenData.position.y;
                // todo [optimize] since currently each connection is re-drawed twice
                element.move();
            });
        }
        this.updateSelectionAfterElementMovement();
    }

    updateSelectionAfterElementMovement() {
        this.didDrag = true;
        this.updateSelection(false, true, false, false, false);
        this.updateFocused();
    }

    onElementPointerUp(e) {
        this.stopElementsMovement();
        if (this.startingPositions.length > 0) {
            e.stopPropagation();
            this.createMovementCommands();
        }
        
        const element = this.getClickedElement(e);
        element.isPointerDown = false;
    }

    stopElementsMovement() {
        for (let i = 0; i < this.selectedObjects.length; i++) {
            const element = this.selectedObjects[i];
            if (element.isPointerDown) {
                // The mouse was released on the same element that was clicked    
                element.isPointerDown = false;
                if (this.didDrag) {
                    commonSendEventFunction(PR_EVENT_FUNNEL_CHANGED);
                }
                this.updateSelection(true);

                const data = element.getState();
                data.stepId = data.ID;
                commonSendEventFunction(PR_EVENT_ELEMENT_POINTER_UP, data);
                break; // since we drag only by trouching a single element
            }
        }
    }

    createMovementCommands() {
        let batch = new CommandBatchHighlighted(this);
        for (let i = 0; i < this.startingPositions.length; i++) {
            const data = this.startingPositions[i];
            if (data.element.x === data.position.x && data.element.y === data.position.y) {
                break;
            } else {
                let moveCommand = new CommandMove(data.element, data.position);
                batch.add(moveCommand);
            }
        }
        this.startingPositions = [];

        if (!batch.isEmpty()) {
            AppSignals.commandCreated.dispatch(batch);
        }
    }

    onElementPointerUpOutside(e) {
        this.onElementPointerUp(e);
    }

    onElementPointerOver(e, isPWPActive, pointerJoint) {
        const element = this.getClickedElement(e);
        element.isHovered = true;

        if (isPWPActive) {
            if (SharedElementHelpers.IsStep(element)) {
                this.focusSelection.hoverIn(element);
            }
        }

        if (pointerJoint) {
            const sectionContainer = this.selectedObjects.length > 1 ? this.multi : this.single;
            this.selectedElementInsideShape = element.overlaps(sectionContainer.frame) 
  
            if (!this.isSelected(element) && !this.selectedElementInsideShape) {
                this.focusSelection.hoverIn(element);
            }
        }
    }

    onElementPointerOut(e, isPWPActive, pointerJoint) {
        let element = this.getClickedElement(e);
        element.isHovered = false;

        if (isPWPActive) {
            if (SharedElementHelpers.IsStep(element)) {
                this.focusSelection.hoverOut(element);
            }
        }

        if (pointerJoint) {
            if (!this.isSelected(element)) {
                this.focusSelection.hoverOut(element);
            }
        }
    }

    onElementRightMouseDown(e) {
        e.stopPropagation();
        let element = this.getClickedElement(e);
        this.applySelectionRules(element);
    }

    onElementRightMouseUp(e) {
        e.stopPropagation();
        let element = this.getClickedElement(e);
        const data = element.getState();
        data.stepId = data.ID;
        data.position = getMousePosition();
        data.position.x *= window.app.scaleManager.aspectRatio;
        data.position.y *= window.app.scaleManager.aspectRatio;
        commonSendEventFunction(RP_EVENT_ELEMENT_RIGHT_CLICK, data);
    }

    applySelectionRules(element, isMultiSelect) {
        if (isMultiSelect && this.isSelected(element)) {
            // shift clicking on a selected element
            this.removeFromSelection(element);
        } else if (isMultiSelect && !this.isSelected(element)) {
            // shift clicking on a non selected element
            this.addToSelection(element);
        } else if (!isMultiSelect && !this.isSelected(element)) {
            // clicking on an element that is not in the selection without shift 
            // this is the case of straight forward selecting an element by clicking it
            this.clearSelection();
            this.addToSelection(element);
        }

        // handle how the selection is displayed , if it is displayed
        this.updateSelection(false, true, false, false, false);
    }

    isMovingElements() {
        return this.startingPositions.length > 0;
    }

    getClickedElement(e) {
        return e.currentTarget.parent;
    }

    addObjectsToSelection(objects) {
        for (let i = 0; i < objects.length; i++) {
            const object = objects[i];
            this.addToSelection(object);
        }
    }

    addToSelection(object) {
        let index = this.selectedObjects.indexOf(object);
        if (index === -1) {
            object.highlightElement(true);
            this.selectedObjects.push(object);
            this.onElementSelected(object);
        }
    }

    removeFromSelection(object) {
        let index = this.selectedObjects.indexOf(object);
        if (index > -1) {
            object.highlightElement(false);
            this.selectedObjects.splice(index, 1);
            this.onElementDeselected(object);
        }
    }

    clearSelection() {
        for (let i = 0; i < this.selectedObjects.length; i++) {
            const object = this.selectedObjects[i];
            object.highlightElement(false);
            this.onElementDeselected(object);
        }
        this.selectedObjects = [];
    }

    isSelected(element) {
        return this.selectedObjects.indexOf(element) > -1;
    }

    hasSelectedElements() {
        return this.selectedObjects.length > 0;
    }

    resolveMultiSelection() {
        let bounds = this.multi.getSelectionBounds();
        this.checkSelection(bounds);
    }

    checkSelection(bounds) {
        let newlySelectedObjects = [];

        if (bounds) {
            const objects = this.sceneManager.objects;
            objects.forEach(element => {
                if (element.overlaps(bounds)) {
                    newlySelectedObjects.push(element);
                }
            });
        }

        // Note! It is important to only make the necessary change ,
        // add or remove only the elments that are in/out of the selection
        // so that we can emmit the right events

        // Clear deselected elements first
        for (let i = 0; i < this.selectedObjects.length; i++) {
            const selectedObject = this.selectedObjects[i];
            if (newlySelectedObjects.indexOf(selectedObject) === -1) {
                this.removeFromSelection(selectedObject);
            }
        }

        // Add newly selected elements
        for (let i = 0; i < newlySelectedObjects.length; i++) {
            const newObject = newlySelectedObjects[i];
            if (this.selectedObjects.indexOf(newObject) === -1) {
                this.addToSelection(newObject);
            }
        }
    }

    selectElement(element) {
        this.clearSelection();
        this.addToSelection(element);
        this.updateSelection(false, true);

        // Notify that the element was selected
        const stepData = element.getState();
        stepData.stepId = stepData.ID;
        commonSendEventFunction(PR_EVENT_ELEMENT_SELECTED, stepData);
    }

    updateSelection(showToolbar = false, preventDrawSelection = false, showScalePoints = true, showHeads = true) {
        if (this.selectedObjects.length === 1) {
            // Update how the selection frames are drawn in the case of single selection
            // It handles cases when a single element is :
            //  - being pressed down directly
            //  - mouse released and selected , it shows the menu
            //  - while a selection tool is dragging , the menu will be hidden
            this.multi.drawSelection = preventDrawSelection ? false : !showToolbar;
            this.multi.drawFrame = false;
            this.multi.draw();

            this.single.setStep(this.selectedObjects[0]);
            this.single.updateFrame(showToolbar, showScalePoints, showHeads);
        } else if (this.selectedObjects.length > 1) {
            // For multiselection we hide the single selection tool
            this.single.hide();

            let bounds = this.getGroupBounds();
            const scale = window.app.viewport.scaled;
            const padding = SELECTION_PADDING * scale;
            // lets add padding            
            bounds.left -= padding;
            bounds.top -= padding;
            bounds.width += padding * 2;
            bounds.height += padding * 2;

            // show the multiselection

            this.multi.drawSelection = preventDrawSelection ? false : !showToolbar;
            this.multi.drawFrame = true;
            this.multi.setSelectionBounds(bounds);
            this.multi.setToolbarPositionPoint();
            this.multi.sendPositionForToolbar(showToolbar);
            this.multi.draw();
            this.multi.updateFrame(showToolbar);
        } else if (showToolbar) {
            // Trying to make a selection , but no objects are selected
            // so we just need to hide the selection tool
            this.hide();
        } else {
            // this is the case when a selection is dragging
            // and it is trying to activly select an object
            // but no object are being selected yet
            // also this is the case when panning the canvas
            this.single.hide();
            this.multi.drawFrame = false;
            this.multi.drawSelection = preventDrawSelection ? false : true;
            this.multi.draw();
        }

        window.app.needsRendering();
    }

    hideToolbar() {
        // todo Make hiding toolbar work through one pipe
        // todo [optimize] Do no redraw the toolbar if you'se selecting the same element
        commonSendEventFunction(PR_EVENT_TOOLBAR_SHOWING, {
            show: false
        });
    }

    getSelectionBoundingRect() {
        if (this.selectedElement) {
            return this.selectedElement.content.getBounds();
        }

        return this.getGroupBounds();
    }

    getGroupBounds() {
        return this.findGroupBounds(this.selectedObjects);
    }

    findGroupBounds(objects) {
        const selection = [];
        for (let i = 0; i < objects.length; i++) {
            let el = objects[i];
            this._addGlobalCoordinates(selection, el.x, el.y);
            this._addGlobalCoordinates(selection, el.x + el.content.width * el.scale.x, el.y + el.content.height * el.scale.y);
            this._addGlobalCoordinates(selection, el.x + el.content.width * el.scale.x, el.y);
            this._addGlobalCoordinates(selection, el.x, el.y + el.content.height * el.scale.y);
        }
        return Utils.getBoundingRect(selection);
    }

    _addGlobalCoordinates(target, x, y) {
        const coords = Facade.viewport.toGlobal({
            x: x,
            y: y,
        });
        target.push(...[coords.x, coords.y]);
    }

    onHeadsDown(e) {
        if (this.delegate && this.delegate.onSelectionHeadsDown) {
            this.delegate.onSelectionHeadsDown(e);
        }
    }

    show() {
        this.updateSelection(true, true);
    }

    hide() {
        this.single.hide();
        this.multi.hideBounds();
        this.multi.hideToolbar();
        window.app.needsRendering();
    }

    // Handle delegation
    onMultiSelectionFrameDraw(graphics) {
        // lets draw individual frames
        for (let i = 0; i < this.selectedObjects.length; i++) {
            const scale = window.app.viewport.scaled;
            const padding = scale * SELECTION_BOUNDARY_GAP;

            const object = this.selectedObjects[i];
            const coords = Facade.viewport.toGlobal(object);

            const width = (object.content.width * object.scale.x * scale);
            const height = (object.content.height * object.scale.y * scale);

            graphics.drawRoundedRect(
                coords.x - padding - this.multi.x,
                coords.y - padding - this.multi.y,
                width + 2 * padding,
                height + 2 * padding,
                SELECTION_ROUND_CORNER
            );
        }
    }

    onBringForward() {
        // Lets take all the selected elements in descending order
        // and since we are ordering them in descending order it means that the first 
        // element in the array is going to be the one that is the first on the z axis (in front of all the other elements)
        const elementsToMove = this.getElementsToMove(ORDER_DESC);
        let lastElementMoved = true;

        // we will now try to move all elemnts up one level , starting with the one at the top
        // there is only one rule when not to move , and that is:
        // If the element infront can't be moved furter ( last moved element ) and we are right 
        // behind that element , then we also can't move.
        // For additional information see https://funnelytics.atlassian.net/wiki/spaces/EN/pages/1246724097/Move+elements+on+Z+axis+One+above+other

        for (let i = 0; i < elementsToMove.length; i++) {
            const element = elementsToMove[i];
            const lastElement = elementsToMove[i - 1];

            // Don't move up if the element right infront of you have not moved up.
            if (lastElement) {
                if (lastElement.index + 1 === element.index && !lastElementMoved) {
                    continue;
                }
            }
            lastElementMoved = element.object.bringForward();
        }

        this.hideToolbar();
        this.show();
    }

    onBringToFront() {
        // Lets take all the selected elements in ascending order
        // and since we are ordering them in ascending order it means that the first 
        // element in the array is going to be the one that is the last on the z axis (behind all the other elements)
        // and if we bring the last one at front , and then continue 2nd last again to front
        // this will result with moving all the object to the front and also keeping their relative position to each other
        // For additional information see https://funnelytics.atlassian.net/wiki/spaces/EN/pages/1246724097/Move+elements+on+Z+axis+One+above+other
        const elementsToMove = this.getElementsToMove(ORDER_ASC);

        for (let i = 0; i < elementsToMove.length; i++) {
            const element = elementsToMove[i];
            element.object.bringToFront();
        }

        this.hideToolbar();
        this.show();
    }

    onSendBackward() {
        // For more details please see onBringForward() , as it is the same method ,just in reverse
        // For additional information see https://funnelytics.atlassian.net/wiki/spaces/EN/pages/1246724097/Move+elements+on+Z+axis+One+above+other
        const elementsToMove = this.getElementsToMove(ORDER_ASC);
        let lastElementMoved = true;

        for (let i = 0; i < elementsToMove.length; i++) {
            const element = elementsToMove[i];
            const lastElement = elementsToMove[i - 1];

            // Don't move up if the element right infront of you have not moved up.
            if (lastElement) {
                if (lastElement.index + 1 === element.index && !lastElementMoved) {
                    continue;
                }
            }
            lastElementMoved = element.object.sendBackward();
        }

        this.hideToolbar();
        this.show();
    }

    onSendToBack() {
        // Lets take all the selected elements in descending order
        // and since we are ordering them in descending order it means that the first 
        // element in the array is going to be the one that is the first on the z axis (in front of all the other elements)
        // and if we push first element to the back of all elements , and then continue with 2nd element
        // this will result with moving all the object at the back and also keeping their relative position to each other
        // For additional information see https://funnelytics.atlassian.net/wiki/spaces/EN/pages/1246724097/Move+elements+on+Z+axis+One+above+other
        const elementsToMove = this.getElementsToMove(ORDER_DESC);

        for (let i = 0; i < elementsToMove.length; i++) {
            const element = elementsToMove[i];
            element.object.pushToBack();
        }

        this.hideToolbar();
        this.show();
    }

    /**
     * It takes all the elements in the selection , orders them by their position in the canvas
     * and returns them
     * 
     * @param {String} order Either ASC or DESC
     * @returns an array that contains wrapped objects with their index position information
     */
    getElementsToMove(order = ORDER_DESC) {
        // Lets take all the selected elements and create a new array
        // that will hold the objects along with their index position in their parent container
        const elementsToMove = [];
        for (let i = 0; i < this.selectedObjects.length; i++) {
            const selectedObject = this.selectedObjects[i];
            elementsToMove.push({
                object: selectedObject,
                index: selectedObject.parent.getChildIndex(selectedObject)
            });
        }

        // lets order them by thier index
        let compare = null;

        if (order === ORDER_DESC) {
            compare = (a, b) => {
                if (a.index < b.index) {
                    return 1;
                } else if (a.index > b.index) {
                    return -1;
                }
                return 0;
            };
        } else if (order === ORDER_ASC) {
            compare = (a, b) => {
                if (a.index < b.index) {
                    return -1;
                } else if (a.index > b.index) {
                    return 1;
                }
                return 0;
            };
        }
        elementsToMove.sort(compare);

        return elementsToMove;
    }

    onShapeResizeHandleDown(e, shape) {
        this.delegate.onShapeResizeHandleDown(e, shape);
    }

    onShapeResizeHandleMove(e, shape) {
        this.delegate.onShapeResizeHandleMove(e, shape);
    }

    onShapeResizeHandleUp(e, shape) {
        this.delegate.onShapeResizeHandleUp(e, shape);
    }

    onElementSelected(element) {
        element.onSelected();
        if (element.isFocused) {
            this.focusSelection.hideFrameByElementId(element.id);
        }
    }

    onElementDeselected(element) {
        element.onDeselected();
        if (element.isFocused) {
            this.focusSelection.showFrameByElementId(element.id);
        }
    }

    updateFocused() {
        this.focusSelection.updatePositions();
    }

}
