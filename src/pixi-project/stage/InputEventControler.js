import Facade from "pixi-project/Facade";
import { EElementCategories } from "shared/CSharedCategories";
import {
    PR_EVENT_TEXT_EDITING_FINISH,
    PR_EVENT_ZOOM_LEVEL_CHANGED,
    RP_EVENT_EMPTY_CANVAS_DOUBLE_CLICK,
    RP_EVENT_EMPTY_CANVAS_POINTER_UP,
    RP_EVENT_ESC_PRESSED,
    RP_EVENT_FIT_TO_SCREEN,
    RP_EVENT_ZOOM_IN,
    RP_EVENT_ZOOM_OUT,
    RP_EVENT_ZOOM_RESET,
    RP_EVENT_ZOOM_VALUE_CHANGED,
    PR_EVENT_SHAPE_DRAWING_STARTED,
} from "shared/CSharedEvents";
import {
    commonSendEventFunction,
    getMousePosition,
    isCtrlKey,
    isDelete,
    isEscapeKey,
    isKeyC,
    isKeyD,
    isKeyMinus,
    isKeyPlus,
    isKeyV,
    isKeyY,
    isKeyZ,
    isKeyZero,
    isMouseWheelButton,
    isRightButton,
    isShiftKey,
    isSpaceKey
} from "shared/CSharedMethods";
import AppSignals from "pixi-project/signals/AppSignals";
import { ACTIVE_STATE_DRAW, ACTIVE_STATE_TEXT } from "shared/CSharedConstants";
import CommandMoveViewport from 'pixi-project/base/command-system/commands/CommandMoveViewport';

const DOUBLE_CLICK_TIMEOUT = 300; // 300 ms 

export default class InputEventControler {

    constructor(sceneManager, selectionManager, commandManager, copyPasteUtility, zoomUtility, planeContainer) {
        this.sceneManager = sceneManager;
        this.selectionManager = selectionManager;
        this.commandManager = commandManager;
        this.copyPasteUtility = copyPasteUtility;
        this.zoomUtility = zoomUtility;
        this.planeContainer = planeContainer;

        this.lastClickTimestamp = 0;
        this.lastEmptyCanvasClickPoint = new PIXI.Point();
        this.viewportDragStartPoint = new PIXI.Point();

        this.isPointerDown = false;
        this.isCtrlDown = false;
        this.isShiftDown = false;
    }

    attachListeners() {
        window.app.stage.on('pointerout', this.onStagePointerOut, this);

        Facade.viewport.on('pointerdown', this.onViewportDown, this);
        Facade.viewport.on('pointerup', this.onViewportUp, this);
        Facade.viewport.on('pointerupoutside', this.onViewportOut, this);
        Facade.viewport.on('pointercancel', this.onViewportOut, this);
        Facade.viewport.on('pointermove', this.onViewportMove, this);
        Facade.viewport.addListener('moved', this.onViewportDrag, this);
        Facade.viewport.addListener('wheel', this.onScroll, this);
        Facade.viewport.addListener('zoomed-end', this.onScrollEnd, this);
        Facade.viewport.addListener('drag-start', this.onViewportDragStart, this);
        Facade.viewport.addListener('drag-end', this.onViewportDragEnd, this);

        document.addEventListener(RP_EVENT_FIT_TO_SCREEN, this.onZoomFitToScreen.bind(this), false);
        document.addEventListener(RP_EVENT_ZOOM_IN, this.onZoomIn.bind(this), false);
        document.addEventListener(RP_EVENT_ZOOM_OUT, this.onZoomOut.bind(this), false);
        document.addEventListener(RP_EVENT_ZOOM_RESET, this.onZoomReset.bind(this), false);
        document.addEventListener(RP_EVENT_ZOOM_VALUE_CHANGED, this.onZoomSetLevel.bind(this), false);

        document.addEventListener('keydown', this.onKeyDown.bind(this));
        document.addEventListener('keyup', this.onKeyUp.bind(this));
        window.addEventListener('blur', this.onWindowLostFocus.bind(this));
    }

    onViewportDown(e) {
        window.app.needsRendering();
        this.isPointerDown = true;

        // on wheel click , enter quick panning
        if (isMouseWheelButton(e)) {
            e.data.originalEvent.preventDefault();
            this.planeContainer.setViewportCursor('grabbing');
            this.planeContainer.enterQuickPanning(e);
            //  resend the event to activate the viewport ,
            //  because dragging was disabled at the time of the event
            let event = new PIXI.InteractionEvent();
            event.data = e.data;
            event.data.originalEvent = null; // this is a hack to prevent recursion of this event
            window.app.renderer.plugins.interaction.dispatchEvent(Facade.viewport, 'pointerdown', event);
            return false;
        }

        this.selectionManager.hideToolbar();

        // handle cursor
        if (this.planeContainer.isToolbarDragging) {
            this.planeContainer.isToolbarDragging = false;
            this.planeContainer.toolbarDragData = null;
            this.planeContainer.setViewportCursor('default');
        }

        if (this.planeContainer.cursorMode === EElementCategories.PANNING) {
            this.planeContainer.setViewportCursor('grabbing');
        }

        // prevent selection when dropping a text object
        if (this.planeContainer.toolbarActiveState === ACTIVE_STATE_TEXT) {
            e.stopPropagation();
            return false;
        }

        if (this.planeContainer.isTextEditing()) {
            AppSignals.setOutEditMode.dispatch();
            commonSendEventFunction(PR_EVENT_TEXT_EDITING_FINISH, false);
        }

        // handle selection tool
        if (this.planeContainer.cursorMode === EElementCategories.CLICKING) {
            this.selectionManager.onViewportDown(e, this.isShiftDown);
        }

    }

    onViewportMove(e) {
        this.sceneManager.onViewportMove(e);

        if (this.isPointerDown) {

            if (this.planeContainer.toolbarActiveState === ACTIVE_STATE_DRAW) {
                this.onDrawObjectMove(e);
                return false;
            }

            if (this.planeContainer.cursorMode === EElementCategories.CLICKING) {
                this.selectionManager.onViewportMove(e);
            }

            if (this.planeContainer.cursorMode === EElementCategories.PANNING) {
                this.selectionManager.updateSelection(false, true, false, false);
                this.selectionManager.updateFocused();
            }
        }
    }

    onViewportDrag() {
        this.planeContainer.handleMeshPosition();
    }

    onViewportUp(e) {
        this.isPointerDown = false;
        window.app.needsRendering();

        if (this.planeContainer.isToolbarDragging) {
            if (SharedElementHelpers.IsText(this.planeContainer.toolbarDragData.object)) {
                this.sceneManager.createText({
                    detail: { position: { x: e.data.global.x, y: e.data.global.y }, object: this.planeContainer.toolbarDragData.object }
                }, false);
            } else {
                console.warn(`Object category ${this.planeContainer.toolbarDragData.object.category} is not Defined!`);
            }

            this.planeContainer.isToolbarDragging = false;
            this.planeContainer.toolbarDragData = null;
            this.planeContainer.setViewportCursor('default');

            return;
        }

        if (this.planeContainer.toolbarActiveState === ACTIVE_STATE_DRAW) {
            this.onDrawObjectEnd(e);
            return;
        }

        if (this.planeContainer.cursorMode === EElementCategories.CLICKING) {
            this.selectionManager.onViewportUp(e);
        }

        if (this.planeContainer.cursorMode === EElementCategories.PANNING) {
            this.planeContainer.setViewportCursor('grab');
            this.selectionManager.updateSelection(true, true);
        }

        // on wheel click , exit quick panning
        if (isMouseWheelButton(e)) {
            this.planeContainer.cancelQuickPanning();
        }

        this.sceneManager.onViewportUp(e);

        if (!this.selectionManager.hasSelectedElements()) {
            commonSendEventFunction(RP_EVENT_EMPTY_CANVAS_POINTER_UP, {
                originalEvent: e.data.originalEvent,
                isRight: isRightButton(e),
                canRedo: this.commandManager.canRedo(),
                canUndo: this.commandManager.canUndo(),
                canPaste: this.copyPasteUtility.canPaste(),
            });

            let timeNow = new Date().getTime();
            let timeSinceLastClick = timeNow - this.lastClickTimestamp;
            this.lastClickTimestamp = timeNow;

            let currentPoint = e.data.global.clone();
            let hasMoved = currentPoint.x !== this.lastEmptyCanvasClickPoint.x || currentPoint.y !== this.lastEmptyCanvasClickPoint.y;
            this.lastEmptyCanvasClickPoint = currentPoint;

            if (timeSinceLastClick < DOUBLE_CLICK_TIMEOUT && !hasMoved) {
                this.onDoubleClick(currentPoint);
            }
        }
    }

    onViewportOut(e) {
        this.isPointerDown = false;
        if (this.planeContainer.cursorMode === EElementCategories.PANNING) {
            // Handle an edge case when panning and mouse is released outside the canvas
            this.onViewportUp(e);
        } else if (this.planeContainer.isToolbarDragging) {
            // Handle an edge case when the dragging tool is pressed and released outside the canvas
            this.planeContainer.setViewportCursor('default');
        } else {
            this.selectionManager.onViewportOut(e);
        }
    }

    onDoubleClick(point) {
        point.x *= window.app.scaleManager.aspectRatio;
        point.y *= window.app.scaleManager.aspectRatio;
        commonSendEventFunction(RP_EVENT_EMPTY_CANVAS_DOUBLE_CLICK, point);
    }

    onStagePointerOut(e) {
        AppSignals.setOutEditMode.dispatch();
        this.selectionManager.hide();
    }

    onScroll(e) {
        this.selectionManager.hide();
        this.selectionManager.updateFocused();
        this.planeContainer.handleMeshPosition();
    }

    onScrollEnd(e) {
        this.selectionManager.show();
        this.selectionManager.updateFocused();
        this.planeContainer.handleMeshPosition();
        commonSendEventFunction(PR_EVENT_ZOOM_LEVEL_CHANGED, {
            value: Facade.viewport.scaled
        });
    }

    onViewportDragStart(e) {
        this.viewportDragStartPoint.copyFrom(Facade.viewport.center);
    }

    onViewportDragEnd(e) {
        let from = this.viewportDragStartPoint;
        let moveCommand = new CommandMoveViewport(Facade.viewport, from, this.planeContainer.mesh);
        this.commandManager.execute(moveCommand);
    }

    onDrawObjectStart(e) {
        commonSendEventFunction(PR_EVENT_SHAPE_DRAWING_STARTED);
        this.sceneManager.setObjectsInteraction(false);

        e.detail.position = getMousePosition();
        this.sceneManager.objectCreated = this.sceneManager.createShape(e, false, null);

        // we are simulating this in order to update the top left point in the selection
        // FIX , calculate that point directly
        this.selectionManager.addToSelection(this.sceneManager.objectCreated);
        this.selectionManager.updateSelection();
        this.selectionManager.clearSelection();
        this.selectionManager.multi.isSelecting = false;
        this.selectionManager.hide();

        this.sceneManager.objectCreated.setResizeHandleDown(this.selectionManager.single.scalePoints.leftTopScalePoint, this.isShiftDown);

        document.body.style.cursor = 'default';
    }

    onDrawObjectMove(e) {
        if (this.sceneManager.objectCreated) {
            this.sceneManager.objectCreated.onResizeHandleMove(e.data.global, this.isShiftDown);
            window.app.needsRendering();
        }
    }

    onDrawObjectEnd(e) {
        if (this.sceneManager.objectCreated) {
            this.sceneManager.objectCreated.onResizeHandleUp(e);
            if (this.sceneManager.objectCreated.isShapeValid()) {
                this.selectionManager.clearSelection();
                this.selectionManager.addToSelection(this.sceneManager.objectCreated);
                this.selectionManager.show();
            }
            this.planeContainer.endDrawing();
        }
    }

    /////////////////////////////////////////////////////////////////////////////////////
    /////////////////// KEYBORAD EVENTS & SYSTEM EVENTS

    onKeyDown(e) {
        // handle key modifiers first
        if (isShiftKey(e)) {
            this.isShiftDown = true;
        }

        if (isCtrlKey(e)) {
            this.isCtrlDown = true;
        }

        // It is important to check if we are editing a text 
        // as we should not activate our shortcuts then.
        // Imagine trying to delete a letter in some text
        // that will trigger deleting the selection
        const isInputActive = this.isInputActive();

        if (isSpaceKey(e) && !isInputActive) {
            this.onSpaceDown(e);
        } else if (isEscapeKey(e)) {
            if (this.planeContainer.isTextEditing()) {
                AppSignals.setOutEditMode.dispatch();
                commonSendEventFunction(PR_EVENT_TEXT_EDITING_FINISH, false);
                this.selectionManager.show();
            }
            commonSendEventFunction(RP_EVENT_ESC_PRESSED);

        } else if (this.isCtrlDown && isKeyC(e) && !isInputActive) {
            this.copyPasteUtility.copySelection();
        } else if (this.isCtrlDown && isKeyD(e) && !isInputActive) {
            this.copyPasteUtility.duplicateSelection();
            e.preventDefault();
        } else if (this.isCtrlDown && isKeyV(e) && !isInputActive) {
            this.copyPasteUtility.pasteClipboard();
        } else if (isDelete(e) && !isInputActive) {
            this.sceneManager.deleteSelection();
        } else if (this.isCtrlDown && isKeyZ(e) && !this.isShiftDown && !isInputActive) {
            this.commandManager.undo();
            window.app.needsRendering();
        } else if (
            ((this.isCtrlDown && isKeyY(e)) || (this.isCtrlDown && this.isShiftDown && isKeyZ(e)))
            && !isInputActive
        ) {
            this.commandManager.redo();
            window.app.needsRendering();
        } else if (this.isCtrlDown && isKeyPlus(e) && !isInputActive) {
            this.zoomUtility.zoomIn();
            e.preventDefault();
        } else if (this.isCtrlDown && isKeyMinus(e) && !isInputActive) {
            this.zoomUtility.zoomOut();
            e.preventDefault();
        } else if (this.isCtrlDown && isKeyZero(e) && !isInputActive) {
            this.zoomUtility.zoomReset();
            e.preventDefault();
        }
    }

    onKeyUp(e) {
        // handle key modifiers first
        this.isShiftDown = false;
        if (isShiftKey(e)) {
            this.isShiftDown = true;
        }

        if (isCtrlKey(e)) {
            this.isCtrlDown = false;
        }

        if (isSpaceKey(e)) {
            this.onSpaceUp(e);
        }
    }

    onSpaceDown(e) {
        this.planeContainer.enterQuickPanning();
    }

    onSpaceUp(e) {
        this.planeContainer.cancelQuickPanning();
    }

    onWindowLostFocus(e) {
        this.planeContainer.cancelQuickPanning();
        this.planeContainer.endDrawing();
    }

    onResize(frame) {
        Facade.viewport.resize(frame.width, frame.height);
        this.planeContainer.mesh.recalculate();
        window.app.needsRendering();
    }

    onZoomFitToScreen(e) {
        let oldPosition = Facade.viewport.center.clone();
        this.zoomUtility.fitToScreen();
        let command = new CommandMoveViewport(Facade.viewport, oldPosition, this.planeContainer.mesh);
        this.commandManager.execute(command);
    }

    onZoomIn(e) {
        this.zoomUtility.zoomIn();
    }

    onZoomOut(e) {
        this.zoomUtility.zoomOut();
    }

    onZoomReset(e) {
        this.zoomUtility.zoomReset();
    }

    onZoomSetLevel(e) {
        const zoomLevel = Number(e.detail.value) ? e.detail.value / 100 : 0.01;
        this.zoomUtility.setZoomLevel(zoomLevel);
    }

    /**
     * It tells you if an input element is currently in focus (if someone is typing)
     * @returns Boolean If an input element is focused
     */
    isInputActive() {
        const obj = document.activeElement;
        const isInputFocused = (obj instanceof HTMLInputElement) && obj.type === 'text';
        const isAreaFocused = (obj instanceof HTMLTextAreaElement);

        return isInputFocused || isAreaFocused;
    }

}
