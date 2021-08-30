import * as PIXI from 'pixi.js';
import AppSignals from "pixi-project/signals/AppSignals";
import ConnectionContainer from "pixi-project/view/joint/ConnectionContainer";
import { EElementCategories, EStepConnectionPort } from "shared/CSharedCategories";
import {
    ACTIVE_STATE_DRAW,
    ANALYTICS_DATA_DEFAULT_PLACEHOLDER,
    EShapeTypes,
    EXPORTED_IMAGE_NAME
} from "shared/CSharedConstants";
import {
    PR_EVENT_COMMAND_ADD_EXECUTED,
    PR_EVENT_COMMAND_MOVE_EXECUTED,
    PR_EVENT_COMMAND_REMOVE_EXECUTED,
    PR_EVENT_COMMAND_RESHAPE_EXECUTED,
    PR_EVENT_COMMAND_SCALE_EXECUTED,
    PR_EVENT_CONNECTION_IN_EMPTY_SPACE,
    PR_EVENT_CONNECTION_SETTINGS_BUTTON_CLICKED,
    PR_EVENT_FUNNEL_CHANGED,
    PR_EVENT_OPEN_ATTRIBUTE_EXPLORER,
    PR_EVENT_REFRESH_RESPONSE,
    PR_EVENT_SAVE_RESPONSE,
    RP_EVENT_CREATE_OBJECT,
    RP_EVENT_REFRESH_REQUEST,
    RP_EVENT_SAVE_REQUEST,
} from "shared/CSharedEvents";
import { commonSendEventFunction } from "shared/CSharedMethods";
import SharedElementHelpers from "shared/SharedElementHelpers";
import Signals from "pixi-project/signals/AppSignals";
import Facade from "pixi-project/Facade";
import StepContainer from "pixi-project/view/objects/StepContainer";
import TextContainer from "pixi-project/view/objects/TextContainer";
import ShapeEllipse from "pixi-project/view/objects/ShapeEllipse";
import ShapeRectangle from "pixi-project/view/objects/ShapeRectangle";
import ShapeTriangle, { ORIENTATION_DOWN } from "pixi-project/view/objects/ShapeTriangle";
import ConnectionToCoordinates from 'pixi-project/view/joint/ConnectionToCoordinates';
import CommandAdd from 'pixi-project/base/command-system/commands/CommandAdd';
import CommandDeleteConnection from 'pixi-project/base/command-system/commands/CommandDeleteConnection';
import CommandsBatch from 'pixi-project/base/command-system/CommandsBatch';
import CommandDeleteStep from 'pixi-project/base/command-system/commands/CommandDeleteStep';
import CommandAddConnection from 'pixi-project/base/command-system/commands/CommandAddConnection';
import ViewportCulling from 'pixi-project/base/culling/ViewportCulling';
import { CommandStatus } from 'pixi-project/base/command-system/CommandManager';

export default class SceneManager {

    constructor(controller) {
        this.controller = controller;
        this.selectionManager = null;
        this.commandManager = null;

        this.iconsContainer = controller.iconsContainer;
        this.jointsContainer = controller.jointsContainer;
        this.mesh = controller.mesh;

        this.objects = [];
        this.joints = [];
        this.objectCreated = null;
        this.iconA = null;
        this.iconB = null;
        this.pointerJoint = null;
        this._addStepOnConnectionEnd = false;
        this.stateData = { objects: [], joints: [] };

        this.importer = null;
        this.culling = new ViewportCulling(window.app.viewport);

        document.addEventListener(RP_EVENT_SAVE_REQUEST, this.onSaveRequest.bind(this), false);
        document.addEventListener(RP_EVENT_REFRESH_REQUEST, this.onAnalyticsRefresh.bind(this), false);
        document.addEventListener(RP_EVENT_CREATE_OBJECT, this.onCreateObject.bind(this), false);

        // handle culling events

        AppSignals.connectionMoved.add(this.onConnectionMoved, this);
        document.addEventListener(PR_EVENT_COMMAND_ADD_EXECUTED, this.onCommandAddExecuted.bind(this));
        document.addEventListener(PR_EVENT_COMMAND_REMOVE_EXECUTED, this.onCommandDeleteExecuted.bind(this));
        document.addEventListener(PR_EVENT_COMMAND_MOVE_EXECUTED, this.onCommandMoveExecuted.bind(this));
        document.addEventListener(PR_EVENT_COMMAND_RESHAPE_EXECUTED, this.onCommandReshapeExecuted.bind(this));
        document.addEventListener(PR_EVENT_COMMAND_SCALE_EXECUTED, this.onCommandScaleExecuted.bind(this));


    }

    onConnectionMoved(connection) {
        this.culling.updateObject(connection);
    }

    onCommandAddExecuted(e) {
        this.handleCullingByStatus(e.detail);
    }

    onCommandDeleteExecuted(e) {
        this.handleCullingByStatus(e.detail);
    }

    onCommandMoveExecuted(e) {
        this.handleCullingByStatus(e.detail);
    }

    onCommandReshapeExecuted(e) {
        this.handleCullingByStatus(e.detail);
    }

    onCommandScaleExecuted(e) {
        this.handleCullingByStatus(e.detail);
    }

    handleCullingByStatus(data) {
        if (data.status === CommandStatus.ADD) {
            this.culling.addObjects(data.objects);
        } else if (data.status === CommandStatus.DELETE) {
            this.culling.removeObjects(data.objects);
        } else if (data.status === CommandStatus.UPDATE) {
            this.culling.updateObjects(data.objects);
        }
    }

    /**
     * Returns an index of an element from the array
     * @param id
     * @param source Array of the elements to look into
     * @returns {number}
     */
    getElementIndexById(id, source) {
        for (let i = 0; i < source.length; i++) {
            if (source[i].id === id) {
                return i;
            }
        }

        return -1;
    }

    /**
    * Parse and use all data that we received from the server to load the funnel
    * @param e - server data
    */
    addObjectsToScene(objects, connections) {
        console.log('[Analysis] PlaneContainer: both resolved, loading. Last!!!');

        const importedObjects = [];

        // Parse data into internal format
        for (let i = 0; i < objects.length; i++) {
            const data = {
                detail: {
                    object: {
                        id: objects[i].ID,
                        src: objects[i].texturePath,
                        url: objects[i].url,
                        label: objects[i].label,
                        value: objects[i].value,
                        category: objects[i].category,
                        type: objects[i].type,
                        actionType: objects[i].actionType,
                        analyticsFilterData: objects[i].analyticsFilterData,
                        x: objects[i].x,
                        y: objects[i].y,
                    },
                },
            };

            // Old shapes format support added on 26 04 2021
            // TODO It should be remove after some time 
            // when we are sure that no more old shapes are in the system
            this.transformOldShapeFormat(objects[i]);
            this.transformOldShapeFormat(data.detail.object);

            // todo Refactor to allow an element to add his data depending on the element type
            if (SharedElementHelpers.IsStep(objects[i])) {
                if (typeof objects[i].filterData !== 'undefined') {
                    data.detail.object.filterData = objects[i].filterData;
                }
                if (typeof objects[i].trackingURL !== 'undefined') {
                    data.detail.object.trackingURL = objects[i].trackingURL;
                }
                if (typeof objects[i].utmData !== 'undefined') {
                    data.detail.object.utmData = objects[i].utmData;
                }
                if (typeof objects[i].useThumbnail !== 'undefined') {
                    data.detail.object.useThumbnail = objects[i].useThumbnail;
                }
                if (typeof objects[i].thumbnailURL !== 'undefined') {
                    data.detail.object.thumbnailURL = objects[i].thumbnailURL;
                }
            }

            let loadData = null;
            if (objects[i].category === EElementCategories.SHAPE) {
                loadData = objects[i].shapeData;
            }

            // Create elements
            this.onCreateObject(data, true, loadData);

            if (this.objectCreated) {
                if (objects[i].category === EElementCategories.TEXT) {
                    this.objectCreated.setText(objects[i].text);
                }

                this.objectCreated.scale.set(objects[i].scaleX, objects[i].scaleY);
                importedObjects.push(this.objectCreated);

                if (objects[i].isFocused && objects[i].focusFilterTypes) {
                    for (let j = 0; j < objects[i].focusFilterTypes.length; j++) {
                        const focusFilterType = objects[i].focusFilterTypes[j];
                        this.selectionManager.focusSelection.focusSingleElement(this.objectCreated, focusFilterType);
                    }
                }
            }
        }

        this.objectCreated = null;

        // Create joins between objects
        for (let i = 0; i < connections.length; i++) {
            const connectionData = connections[i];
            const iconA = this.objects[this.getStepIndexById(connectionData.iconA_ID)];
            const iconB = this.objects[this.getStepIndexById(connectionData.iconB_ID)];
            const connectionType = connectionData.headAVisible ? 'in' : 'out';

            const connection = new ConnectionContainer(iconA, iconB, connectionData.ID, connectionData);
            connection.delegate = this;
            connection.init(connectionType);
            connection.headA.visible = connectionData.headAVisible;
            connection.headB.visible = connectionData.headBVisible;
            connection.headA.angle = connectionData.headAAngle;
            connection.headB.angle = connectionData.headBAngle;

            this.joints.push(connection);
            this.jointsContainer.addChild(connection);
        }

        this.selectionManager.focusSelection.drawAll();
        window.app.needsRendering();

        return importedObjects;
    }

    shouldDraw(isLoaded) {
        return !isLoaded
            && this.controller.toolbarActiveState === ACTIVE_STATE_DRAW
            && !this.selectionManager.hasSelectedElements();
    }

    onCreateObject(e, isLoaded = false, loadData = null) {
        if (!isLoaded) {
            e.detail.position.x *= 1 / window.app.scaleManager.aspectRatio;
            e.detail.position.y *= 1 / window.app.scaleManager.aspectRatio;
        }

        if (this.shouldDraw(isLoaded)) {
            // create an object when in drawing mode
            this.controller.inputEventControler.onDrawObjectStart(e);
            return;
        }

        AppSignals.setOutEditMode.dispatch();
        if (!isLoaded) {
            commonSendEventFunction(PR_EVENT_FUNNEL_CHANGED);
            if (!SharedElementHelpers.IsTextOrShapeElements(e.detail.object)) {
                Signals.elementChanged.dispatch();
            }
            window.app.needsRendering();
        }

        switch (e.detail.object.category) {
            case EElementCategories.STEP:
                this.objectCreated = this.createStep(e, isLoaded);
                // In case of creating an element after drawing connection to an empty space
                if (this.selectionManager.selectedObjects.length > 1 && e.detail.port) {
                    this.createAdditionalMultiConnection(this.objectCreated);
                } else if (e.detail.sourceId && e.detail.port) {
                    this.createAdditionalConnection(e.detail.port, e.detail.sourceId, null, this.objectCreated);
                }

                this.addObjectToStage(this.objectCreated, isLoaded);

                if (e.type === RP_EVENT_CREATE_OBJECT) {
                    this.selectionManager.selectElement(this.objectCreated);
                }

                break;
            case EElementCategories.TEXT:
                this.objectCreated = this.createText(e, isLoaded);
                break;
            case EElementCategories.SHAPE:
                this.objectCreated = this.createShape(e, isLoaded, loadData);
                break;
            default:
                throw Error(`[onCreateObject] Wrong object type ${e.detail.object.category}`);
        }
    }

    initializeObject(updElement, data, isLoaded = false) {
        let p;
        if (isLoaded) {
            p = { x: data.detail.object.x, y: data.detail.object.y };
        } else {
            p = Facade.viewport.toLocal(data.detail.position);
        }
        updElement.x = p.x;
        updElement.y = p.y;
        updElement.init();
        updElement.originWidth = updElement.width;
        updElement.originHeight = updElement.height;

        return updElement;
    }

    addObjectToStage(updElement, isLoaded) {
        if (!isLoaded) {
            // Find related connections , ( creating a step by dragging a connection )
            const relatedJoints = this.findAllRelatedConnections(updElement);

            let commandAdd = new CommandAdd(updElement, this.iconsContainer, this.objects, relatedJoints, this.jointsContainer, this.joints, this.selectionManager);
            this.commandManager.execute(commandAdd);
        } else {
            // Shapes & Texts have special rules on how to be placed on the canvas
            if (SharedElementHelpers.IsShape(updElement)) {
                SharedElementHelpers.InsertShape(updElement, this.objects, this.iconsContainer);
            } else if (SharedElementHelpers.IsText(updElement)) {
                SharedElementHelpers.InsertText(updElement, this.objects, this.iconsContainer);
            } else {
                this.iconsContainer.addChild(updElement);
                this.objects.push(updElement);
            }
        }
    }

    findAllRelatedConnections(element) {
        const relatedJointsIDs = this.getAllJointsIdsRelatedToStep(element);
        const relatedJoints = [];
        for (let i = 0; i < relatedJointsIDs.length; i++) {
            const id = relatedJointsIDs[i];
            const joint = this.getConnectionById(id);
            relatedJoints.push(joint);
        }
        return relatedJoints;
    }

    createStep(data, isLoaded = false) {
        const { object } = data.detail;

        const texturePath = object.src;
        const { label } = object;
        const texture = PIXI.Texture.from(texturePath);
        // todo need to refactor the parameter set process
        let step = new StepContainer(object.type, label, texture, this._getEventHandlers(), object.id, object.value);
        step.texturePath = texturePath;
        step.setURL(object.url);
        step.setFilterData(object.filterData);
        step.setTrackingURL(object.trackingURL);
        step.setUTMData(object.utmData);
        step.setThumbnail(object.thumbnailURL, object.useThumbnail);
        step.setActionType(object.actionType);
        step.setAnalyticsFilterData(object.analyticsFilterData);
        step = this.initializeObject(step, data, isLoaded);
        return step;
    }

    createText(data, isLoaded = false) {
        const { object } = data.detail;
        let textObject = new TextContainer(object.text, this._getEventHandlers(), object.id);

        this.initializeObject(textObject, data, isLoaded);
        this.addObjectToStage(textObject, isLoaded);

        if (!isLoaded) {
            // setTimeout is used to send the method to execute in the event loop
            setTimeout(function () {
                textObject.enterEditMode();
            }, 0);

            this.selectionManager.clearSelection();
            this.selectionManager.addToSelection(textObject);
            this.selectionManager.updateSelection();
            this.selectionManager.hide();
        }

        return textObject;
    }

    createShape(data, isLoaded = false, loadData = null) {
        const objectData = data.detail.object;

        let shape = null;

        if (objectData.type === EShapeTypes.CIRCLE || objectData.type === EShapeTypes.ELLIPSE) {
            shape = new ShapeEllipse(
                this._getEventHandlers(),
                objectData.id,
                loadData,
            );
        } else if (objectData.type === EShapeTypes.SQUARE || objectData.type === EShapeTypes.RECTANGLE) {
            shape = new ShapeRectangle(
                this._getEventHandlers(),
                objectData.id,
                loadData,
            );
        } else if (objectData.type === EShapeTypes.TRIANGLE) {
            shape = new ShapeTriangle(
                this._getEventHandlers(),
                objectData.id,
                loadData,
            );
        }
        shape.delegate = this;
        shape = this.initializeObject(shape, data, isLoaded);

        this.addObjectToStage(shape, true);

        return shape;
    }

    transformOldShapeFormat(objectData) {
        if (objectData.category === EShapeTypes.CIRCLE) {
            objectData.category = EElementCategories.SHAPE;
            objectData.type = EShapeTypes.ELLIPSE;
            if (objectData.shapeData) {
                objectData.shapeData.width = objectData.shapeData.radius;
                objectData.shapeData.height = objectData.shapeData.radius;
            }
        } else if (objectData.category === EShapeTypes.SQUARE) {
            objectData.category = EElementCategories.SHAPE;
            objectData.type = EShapeTypes.RECTANGLE;
        } else if (objectData.category === EShapeTypes.TRIANGLE) {
            objectData.category = EElementCategories.SHAPE;
            objectData.type = EShapeTypes.TRIANGLE;
            if (objectData.shapeData) {
                let sd = objectData.shapeData;
                sd.width = Math.abs(sd.x0 - sd.x2);
                sd.height = Math.abs(sd.y0 - sd.y1);
                sd.x = 0;
                sd.y = 0;
                sd.orientation = ORIENTATION_DOWN;
            }
        }

        if (objectData.shapeData) {
            objectData.shapeData.category = EElementCategories.SHAPE;
        }
    }

    removeStepWithId(id) {
        const index = this.getStepIndexById(id);
        let step = this.objects[index];
        const joints = this.getAllJointsIdsRelatedToStep(step);
        for (let i = 0; i < joints.length; i++) {
            this.removeConnection(joints[i]);
        }

        step.onDestroy();
        this.iconsContainer.removeChild(step);
        step = null;
        this.objects.splice(index, 1);
    }

    /**
     * Removes a connection object. Removes the element from total connection list
     * @param id
     */
    removeConnection(id) {
        for (let i = this.joints.length - 1; i >= 0; i--) {
            if (this.joints[i].id === id) {
                this.joints[i].onDestroy();
                this.joints[i] = null;
                this.joints.splice(i, 1);
                Signals.elementChanged.dispatch();
                break;
            }
        }
        window.app.needsRendering();
    }

    /**
     * Create a connection between two steps
     * @param iconA
     * @param iconB
     */
    createConnection(iconA, iconB, lineType, saveForUndo = true, multi = false) {
        let joint = null;
        this.iconB = iconB;

        const existingJoint = this.checkForJointBetween(iconA, iconB);

        if (existingJoint) {
            if ((existingJoint.iconA === iconA && this.isIncommingCon())
                || (existingJoint.iconA === this.iconB && this.isOutgoingCon())) {
                existingJoint.showHeadB();
            }

            if ((existingJoint.iconA === iconA && this.isOutgoingCon())
                || (existingJoint.iconA === this.iconB && this.isIncommingCon())) {
                existingJoint.showHeadB();
            }
            this.removeHighlight(iconA, iconB);
        } else {
            //todo Need to take a hard look at the whole implementation. There are several issues in here that should be simplified
            if (this.isIncommingCon() && !multi) {
                this.iconB = iconA;
                this.iconA = iconB;
                this.fromIconHeadName = EStepConnectionPort.OUT;
                joint = new ConnectionContainer(iconB, iconA);
            } else {
                joint = new ConnectionContainer(iconA, iconB);
            }

            joint.delegate = this;
            joint.init(this.fromIconHeadName);

            if (lineType) {
                joint.setLineType(lineType);
            }

            if (this.isIncommingCon()) {
                joint.showHeadA();
            } else {
                joint.showHeadB();
            }

            if (saveForUndo) {
                let commandAddConnection = new CommandAddConnection(joint, this.jointsContainer, this.joints);
                this.commandManager.execute(commandAddConnection);
                this.removeHighlight(iconA, iconB);
            }

            Signals.elementChanged.dispatch();
        }
        this.removeCoordinatesJoint();

        if (this.controller.cursorMode === EElementCategories.PANNING) {
            Facade.viewport.plugins.resume('drag');
        }

        window.app.needsRendering();

        return joint;
    }

    isIncommingCon() {
        return this.fromIconHeadName === EStepConnectionPort.IN;
    }

    isOutgoingCon() {
        return this.fromIconHeadName === EStepConnectionPort.OUT;
    }

    removeHighlight(iconA, iconB) {
        iconA.isHovered = false;
        iconB.isHovered = false;

        if (!this.selectionManager.isSelected(iconA)) {
            this.selectionManager.focusSelection.hoverOut(iconA);
        } else if (!this.selectionManager.isSelected(iconB)) {
            this.selectionManager.focusSelection.hoverOut(iconB);
        } else {
            this.selectionManager.focusSelection.drawAll();
        }
    }

    addConnection(connection) {
        if (connection) {
            this.joints.push(connection);
            this.jointsContainer.addChild(connection);
        }
    }

    /**
     * Create a connection right after creating an element and
     * which is connected to step with iconAId Id
     * @param headName
     * @param iconAId
     * @param iconBId
     */
    createAdditionalConnection(headName, iconAId, lineType, iconB) {
        const iconA = this.getStepById(iconAId);
        if (iconA) {
            this.fromIconHeadName = headName;
            this.iconA = iconA;
            let connection = this.createConnection(this.iconA, iconB, lineType, false);
            this.addConnection(connection);
        } else {
            throw Error(`[PlaneContainer: createAdditionalConnection] no step with id ${iconAId}`);
        }
    }

    createAdditionalMultiConnection(iconB) {
        this.createConnectionsToElement(iconB)
    }

    /**
     * Removes the floating connection
     */
    removeCoordinatesJoint() {
        this._addStepOnConnectionEnd = false;
        this.jointsContainer.removeChild(this.pointerJoint);
        this.pointerJoint = null;
        this.iconA = null;
        this.iconB = null;
        window.app.needsRendering();
    }

    checkForJointBetween(stepB, stepA) {
        for (let i = 0; i < this.joints.length; i++) {
            if ((this.joints[i].iconA === stepB && this.joints[i].iconB === stepA)
                || (this.joints[i].iconA === stepA && this.joints[i].iconB === stepB)) {
                return this.joints[i];
            }
        }
        return null;
    }

    /**
     * Gets a step element by ID
     * @param id
     * @returns {BaseContainer} Element. If not found - null.
     */
    getStepById(id) {
        let result = null;
        const elementId = this.getStepIndexById(id);
        if (elementId >= 0) {
            result = this.objects[elementId];
        }
        return result;
    }

    /**
     * Gets a connection element by ID
     * @param id
     * @returns {ConnectionContainer} Element. If not found - null.
     */
    getConnectionById(id) {
        let result = null;
        const elementId = this.getConnectionIndexById(id);
        if (elementId >= 0) {
            result = this.joints[elementId];
        }
        return result;
    }

    /**
     * Returns container object by ID
     * @param id Id of the element
     * @returns {BaseContainer} Container object
     */
    getElementById(id) {
        let result = this.getStepById(id);
        if (!result) {
            result = this.getConnectionById(id);
            if (!result) {
                throw Error(`[PlaneContainer.getElementById] No element with id ${id} found`);
            }
        }

        return result;
    }

    hasConnection(stepA, stepB) {
        for (let i = 0; i < this.joints.length; i++) {
            let isInConnection = this.joints[i].iconA.id === stepA.id && this.joints[i].iconB.id === stepB.id;
            let isOutConnection = this.joints[i].iconA.id === stepB.id && this.joints[i].iconB.id === stepA.id;

            if (isInConnection || isOutConnection) {
                return true;
            }
        }
        return false;
    }

    getAllJointsIdsRelatedToStep(step) {
        const joints = [];
        for (let i = 0; i < this.joints.length; i++) {
            if (this.joints[i].iconA.id === step.id || this.joints[i].iconB.id === step.id) {
                joints.push(this.joints[i].id);
            }
        }
        return joints;
    }

    /**
     * Prepare data about all components to save it to server
     * @param includeConnections - why do you need the data: for make a save or get ids of all elements
     */
    getSceneData(includeConnections = true) {
        this.stateData.objects = this.getObjectsData();
        this.stateData.joints = includeConnections ? this.getConnectionsStateData() : this.getDataConnectionsStateData();

        const data = {
            data: JSON.stringify(this.stateData),
            preview: JSON.stringify(this.createSnapshot().src)
        };

        return data;
    }

    getObjectsData() {
        const data = [];

        for (let i = 0; i < this.objects.length; i++) {
            const obj = this.objects[i];
            const objectState = obj.getState();
            data.push(objectState);
        }

        return data;
    }

    /**
     * Get the state data of data connections.
     * @returns stateData
     */
    getDataConnectionsStateData() {
        const stateData = [];

        for (let i = 0; i < this.joints.length; i++) {
            const joint = this.joints[i];
            const jointState = joint.getState();
            // Ignore connections connections that do not have data
            if (this.isDataConnection(joint)) {
                stateData.push(jointState);
            }
        }

        return stateData;
    }

    /**
     * Get the state data of connections.
     * @returns stateData
     */
    getConnectionsStateData() {
        const stateData = [];

        for (let i = 0; i < this.joints.length; i++) {
            const joint = this.joints[i];
            const jointState = joint.getState();
            stateData.push(jointState);
        }

        return stateData;
    }

    /**
     * If it is a connection between , page / event / source.
     * Offline elements , shapes or texts do not hold data
     * @param {ConnectionContainer} connection 
     * @returns 
     */
    isDataConnection(connection) {
        return (SharedElementHelpers.IsStep(connection.iconA) && !SharedElementHelpers.IsMisc(connection.iconA)) &&
            (SharedElementHelpers.IsStep(connection.iconB) && !SharedElementHelpers.IsMisc(connection.iconB));
    }

    getStepIndexById(id) {
        return this.getElementIndexById(id, this.objects);
    }

    getConnectionIndexById(id) {
        return this.getElementIndexById(id, this.joints);
    }

    createSnapshot() {
        let width = Facade.viewport.screenWidth;
        let height = Facade.viewport.screenHeight;
        const resolution = 2;
        //TODO Make the snapshot be equal to what is visible

        let renderTexture = new PIXI.RenderTexture.create({ width, height, resolution });
        const renderer = window.app.renderer;

        // Prepare the scene for rendering
        this.mesh.visible = false;

        // Render the scene into a new texture
        renderer.render(Facade.viewport, renderTexture);

        // Revert all scene changes after rendering
        this.mesh.visible = true;

        // Handle the image 
        let img = renderer.extract.image(renderTexture, 'image/png');
        img.name = EXPORTED_IMAGE_NAME;

        return img;
    }

    forceDownloadImage(src) {
        let a = document.createElement("a");
        a.href = src;
        a.download = `${EXPORTED_IMAGE_NAME}.png`;
        a.click();
    }

    copyImageToClipboard(imageSrc) {
        //If Clipboard is supported
        if (window['ClipboardItem'] && navigator.clipboard) {
            fetch(imageSrc)
                .then(function (response) {
                    return response.blob();
                })
                .then(function (blob) {
                    const item = new window.ClipboardItem({ "image/png": blob });
                    navigator.clipboard.write([item]);
                });
        }
    }

    /**
    * Returns an object that stores all event handlers
    * @returns {{onElementPointerDown: PlaneContainer.onElementPointerDown, onElementPointerUp: PlaneContainer.onElementPointerUp}}
    * @private
    */
    _getEventHandlers() {
        return {
            onElementPointerDown: this.controller.onElementPointerDown.bind(this.controller),
            onElementPointerMove: this.controller.onElementPointerMove.bind(this.controller),
            onElementPointerUp: this.controller.onElementPointerUp.bind(this.controller),
            onElementPointerUpOutside: this.controller.onElementPointerUpOutside.bind(this.controller),
            onElementPointerOver: this.controller.onElementPointerOver.bind(this.controller),
            onElementPointerOut: this.controller.onElementPointerOut.bind(this.controller),
        }
    }

    // TODO object intereation can also be in Scene Manager

    /**
     * It handles the objects interation state ,
     * used to disable other objects for interaction
     */
    setObjectsInteraction(interactive) {
        for (let i = 0; i < this.objects.length; i++) {
            let object = this.objects[i];
            object.setInteractiveChildren(interactive);
        }

        for (let i = 0; i < this.joints.length; i++) {
            let joint = this.joints[i];
            joint.setInteractiveChildren(interactive);
        }
    }

    /**
     * It handles the objects interation state ,
     * used to disable other objects for interaction
     */
    lockInteractionsForNonStepOjects() {
        for (let i = 0; i < this.objects.length; i++) {
            let object = this.objects[i];
            if (!SharedElementHelpers.IsStep(object)) {
                object.setInteractiveChildren(false);
            }
        }

        for (let i = 0; i < this.joints.length; i++) {
            let joint = this.joints[i];
            joint.setInteractiveChildren(false);
        }
    }

    /**
    * It reverts the objects interation state to a previous known state
    */
    revertObjectsInteraction() {
        for (let i = 0; i < this.objects.length; i++) {
            let object = this.objects[i];
            object.revertInteractiveChildren();
        }

        for (let i = 0; i < this.joints.length; i++) {
            let joint = this.joints[i];
            joint.revertInteractiveChildren();
        }
    }

    deleteElementById(id) {
        const element = this.getElementById(id);
        if (!element) {
            throw Error(`[PlaneContainer.deleteElementById] Wrong element with id: ${id}`);
        }
        commonSendEventFunction(PR_EVENT_FUNNEL_CHANGED);

        switch (element.category) {
            case EElementCategories.STEP:
            case EElementCategories.TEXT:
            case EElementCategories.SHAPE:
                this.removeStepWithId(id);
                break;
            case EElementCategories.CONNECTION:
                this.removeConnection(id);
                break;
            default:
                throw Error(`[PlaneContainer.deleteElementById] Wrong element category to delete ${element.category} with id: ${id}`);
        }

        if (!SharedElementHelpers.IsTextOrShapeElements(element)) {
            Signals.elementChanged.dispatch();
        }
        window.app.needsRendering();
    }

    deleteSelection() {
        let commandBatch = new CommandsBatch();

        let commands = this.getDeleteCommands(this.selectionManager.selectedObjects);
        for (let i = 0; i < commands.length; i++) {
            const command = commands[i];
            commandBatch.add(command);
        }
        this.commandManager.execute(commandBatch);

        this.selectionManager.clearSelection();
        this.selectionManager.hide();
        window.app.needsRendering();
    }

    getDeleteCommands(steps) {
        let relatedConnections = [];
        let commands = [];

        for (let i = 0; i < steps.length; i++) {
            let object = steps[i];
            let deleteCommand = new CommandDeleteStep(object, this.iconsContainer, this.objects, this.selectionManager.focusSelection);
            commands.push(deleteCommand);
            relatedConnections = relatedConnections.concat(this.findAllRelatedConnections(object));
        }

        // Get all unique connections
        relatedConnections = relatedConnections.filter(function (item, pos, self) {
            return self.indexOf(item) == pos;
        });

        // Then add the connections
        for (let i = 0; i < relatedConnections.length; i++) {
            let connection = relatedConnections[i];
            let deleteCommand = new CommandDeleteConnection(connection, this.jointsContainer, this.joints);
            commands.push(deleteCommand);
        }

        return commands;
    }

    /**
     * Removes the elements from stage , and then inserts them through the command system.
     * @param {Steps} steps 
     */
    reAddElements(steps) {
        let deleteCommands = this.getDeleteCommands(steps);
        let addCommandsBatch = new CommandsBatch();

        for (let i = 0; i < deleteCommands.length; i++) {
            const deleteCommand = deleteCommands[i];
            // The command is being executed , but its not added into the commands queue
            deleteCommand.execute();

            let object = deleteCommand.object;
            let parent = deleteCommand.parent;
            let objects = deleteCommand.objects;

            let addCommand = null;
            // Convert the Delete commands into Add commands.
            if (deleteCommand instanceof CommandDeleteStep) {
                let object = deleteCommand.object;
                // It is important that related joints is empty since we are already adding the joints
                addCommand = new CommandAdd(object, parent, objects, [], this.jointsContainer, this.joints, this.selectionManager);
            } else if (deleteCommand instanceof CommandDeleteConnection) {
                addCommand = new CommandAddConnection(object, parent, objects);
            }

            // because we used a delete command to remove elements from the stage , that completly removes all event listeners.
            // To add them back we need to set the flag in the newly created command "wasReverted" to be true
            // That will add the event listeners back at its first execution.
            addCommand.wasReverted = true;
            addCommandsBatch.add(addCommand);
        }
        this.commandManager.execute(addCommandsBatch);
    }

    saveToPng() {
        const img = this.createSnapshot();
        this.forceDownloadImage(img.src);
        this.copyImageToClipboard(img.src);
    }

    resetStepsAnalyticsData() {
        for (let i = 0; i < this.objects.length; i++) {
            const object = this.objects[i];
            if (object.analyticsManager) {
                object.analyticsManager.setData(null);
            }
            object.footer.setData([ANALYTICS_DATA_DEFAULT_PLACEHOLDER]);
        }
    }

    resetConnectionsAnalyticsData() {
        for (let i = 0; i < this.joints.length; i++) {
            const connection = this.joints[i];
            connection.analyticsManager.setData(null);
            connection.footer.setData([ANALYTICS_DATA_DEFAULT_PLACEHOLDER]);
        }
    }

    onViewportMove(e) {
        if (this.iconA) {
            // update joint position when trying to connect to another object
            const p = Facade.viewport.toLocal(e.data.global);
            if (this.pointerJoint && !this._addStepOnConnectionEnd) {
                this.pointerJoint.update(p.x, p.y);
                window.app.needsRendering();
            }
        }
    }

    onViewportUp(e) {
        // if we need to create an element
        if (this.pointerJoint && this.iconA) {
            this._addStepOnConnectionEnd = true;
            const position = e.data.global;
            position.x *= window.app.scaleManager.aspectRatio;
            position.y *= window.app.scaleManager.aspectRatio;
            const event = new CustomEvent(PR_EVENT_CONNECTION_IN_EMPTY_SPACE, {
                detail: { position: { x: position.x, y: position.y }, sourceId: this.iconA.id, port: this.pointerJoint.port },
            });
            document.dispatchEvent(event);
        } else if (this.pointerJoint) {
            this.removeCoordinatesJoint();
            this.selectionManager.hideToolbar();
        }
    }

    onSelectionHeadsDown(e) {
        if (!this.iconA) {
            e.stopPropagation();
            const port = e.currentTarget.name;
            const p = e.data.global;
            p.x *= window.app.scaleManager.aspectRatio;
            p.y *= window.app.scaleManager.aspectRatio;

            if (port === EStepConnectionPort.BOTTOM) {
                const event = new CustomEvent(PR_EVENT_OPEN_ATTRIBUTE_EXPLORER, {
                    detail: {
                        position: { x: p.x, y: p.y }
                    },
                });
                document.dispatchEvent(event);
            } else {
                this.fromIconHeadName = port;
                // add selection with controll points for correct get nearest control point
                this.iconA = this.selectionManager.selectedObjects.length > 1 ? this.selectionManager.multi : this.selectionManager.selectedObjects[0];
                // todo Why do we need this check? If we do need it - move before 'p' var decl
                if (!e.data) {
                    return;
                }
                const toPoint = Facade.viewport.toLocal(e.target.getGlobalPosition())
                this.iconA.data = e.data;
                this.pointerJoint = new ConnectionToCoordinates(this.iconA, toPoint.x, toPoint.y, port);
                this.jointsContainer.addChild(this.pointerJoint);
                Facade.viewport.plugins.pause('drag');
                this.selectionManager.updateSelection(false, true, false, false);
            }
        }
        window.app.needsRendering();
    }

    createConnectionsToElement(targetElement) {
        if (this.selectionManager.selectedObjects.length > 1 && !this.selectionManager.isSelected(targetElement)) {
            // Create multiple connections to an element
            let batchCommands = new CommandsBatch();

            this.selectionManager.selectedObjects.forEach(element => {

                let hasConnection = this.hasConnection(element, targetElement);

                if (!hasConnection) {
                    let connection = this.createConnection(element, targetElement, undefined, false, true);
                    let commandAddConnection = new CommandAddConnection(connection, this.jointsContainer, this.joints);
                    batchCommands.add(commandAddConnection);
                }
            });

            if (batchCommands.commands.length) {
                this.commandManager.execute(batchCommands);
            } else {
                this.removeCoordinatesJoint();
            }

            targetElement.isHovered = false;
            if (!this.selectionManager.isSelected(targetElement)) {
                this.selectionManager.focusSelection.hoverOut(targetElement);
            } else {
                this.selectionManager.focusSelection.drawAll();
            }

            this.selectionManager.selectElement(targetElement);

        } else if (this.selectionManager.selectedObjects.length > 1 && this.selectionManager.isSelected(targetElement)) {
            // If there is multiple connection and it is trying to connect to element in this selection
            this.removeCoordinatesJoint();
            this.selectionManager.show();
        } else if (this.iconA && (this.iconA !== targetElement)) {
            // Create a single connection to an element
            this.createConnection(this.iconA, targetElement);
            this.selectionManager.selectElement(targetElement);

        } else {
            // If it is trying to connect to itself
            this.removeCoordinatesJoint();
            this.selectionManager.show();
        }

        this.fromIconHeadName = null;
        window.app.needsRendering();
    }

    onSaveRequest(e) {
        const data = this.getSceneData(true);
        commonSendEventFunction(PR_EVENT_SAVE_RESPONSE, data);
    }

    onAnalyticsRefresh(e) {
        this.resetStepsAnalyticsData();
        this.resetConnectionsAnalyticsData();

        const data = this.getSceneData(false);
        commonSendEventFunction(PR_EVENT_REFRESH_RESPONSE, data);
    }

    // Delegate handler connection handler
    onConnectionDeleteBtn(connection) {
        if (this.pointerJoint) {
            this.removeCoordinatesJoint();
            this.selectionManager.show();
        } else {
            let deleteCommand = new CommandDeleteConnection(connection, this.jointsContainer, this.joints);
            this.commandManager.execute(deleteCommand);
        }
    }

    // Delegate handler connection handler
    onConnectionSettingsBtn(connection) {
        if (this.pointerJoint) {
            this.removeCoordinatesJoint();
            this.selectionManager.show();
        } else {
            const toolbarData = connection._getToolbarData(true);
            const stepData = connection.getState();

            stepData.stepId = stepData.ID;
            const data = {
                step: stepData,
                toolbarData
            };

            commonSendEventFunction(PR_EVENT_CONNECTION_SETTINGS_BUTTON_CLICKED, data);
        }
    }

    // Delegate handler connection handler
    onConnectionPointerDown(e, connection) {
        e.stopPropagation();
        this.selectionManager.clearSelection();
        this.selectionManager.hide();
        this.selectionManager.hideToolbar();
    }

    // Delegate handler connection handler
    onConnectionPointerUp(e, connection) {
        e.stopPropagation();
        // Finish the selection
        this.selectionManager.onViewportUp(e);
        if (this.selectionManager.isMovingElements()) {
            this.selectionManager.onElementPointerUp(e);

            this.controller.viewportAutoPan.isActive = false;
            this.controller.alignmentGuides.clear();
        }

        if (this.pointerJoint) {
            this.removeCoordinatesJoint();
            this.selectionManager.hideToolbar();
        }
    }

    // Delegate handler connection handler
    onConnectionPointerOut(e, connection) {
        for (let i = 0; i < this.joints.length; i++) {
            const joint = this.joints[i];
            const local = joint.graphics.toLocal(e.data.global);
            const bounds = joint.graphics.hitArea;
            if (!bounds.contains(local.x, local.y)) {
                joint.showButtons(false);
                joint.analyticsManager.onPointerOut(e);
            }
        }
        window.app.needsRendering();
    }

    // Delegate handler shape Handler
    onShapeInvalidDraw(shape) {
        this.deleteElementById(shape.id);
    }

    destroyAllObjects() {
        for (let i = this.joints.length - 1; i >= 0; i--) {
            this.joints[i].onDestroy();
        }

        for (let i = this.objects.length - 1; i >= 0; i--) {
            this.objects[i].onDestroy();
        }
    }

}
