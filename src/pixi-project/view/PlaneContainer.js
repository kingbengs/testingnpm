import * as PIXI from 'pixi.js';
import Facade from 'pixi-project/Facade';
import {
  PR_EVENT_ANALYTICS_NEEDS_REFRESH,
  PR_EVENT_FUNNEL_CHANGED,
  RP_EVENT_CANCEL_NEW_STEP_FROM_CONNECTION,
  RP_EVENT_CURSOR_TYPE,
  RP_EVENT_DELETE_PRESSED,
  RP_EVENT_COPY_PRESSED,
  RP_EVENT_DUPLICATE_PRESSED,
  RP_EVENT_PASTE_PRESSED,
  RP_EVENT_EDIT_OBJECT,
  RP_EVENT_GET_DATA,
  RP_EVENT_HORIZONTAL_ALIGNMENT,
  RP_EVENT_LOAD_REQUEST,
  RP_EVENT_CONNECTION_LINE_TYPE_CHANGED,
  RP_EVENT_DRAW_LINE_TYPE_CHANGED,
  RP_EVENT_TOGGLE_PANEL_STATUS,
  RP_EVENT_ANALYTICS_UPDATED,
  RP_EVENT_UPDATE_STEP_THUMBNAIL,
  RP_EVENT_VERTICAL_ALIGNMENT,
  RP_EVENT_OBJECT_DRAG_START,
  RP_EVENT_SAVE_TO_PNG,
  PR_EVENT_TOOLBOX_STATE_CHANGED,
  RP_ANALYTICS_FILTER_DATA_CHANGED,
  PR_EVENT_QUICK_PANNING_MODE_CHANGED,
  RP_EVENT_ANALYTICS_STATUS_CHANGED,
  RP_ANALYTICS_PWP_TOOL_ACTIVATED,
  PR_EVENT_SHAPE_STYLE_CHANGED,
  RP_EVENT_STEP_FOCUS_CHANGED,
  RP_EVENT_STEP_FOCUS_CLEARED,
  RP_EVENT_UNDO_CLICKED,
  RP_EVENT_REDO_CLICKED,
  RP_EVENT_ICON_CHOSEN,
  RP_EVENT_PROPERTY_CHANGED,
  RP_EVENT_RESTORE_BUTTON_CLICKED,
} from 'shared/CSharedEvents';
import { EElementCategories } from 'shared/CSharedCategories';
import {
  ANALYTICS_STATUS_LOADING,
  ACTIVE_STATE_DRAW,
  ACTIVE_STATE_TEXT,
  PropertyType,
} from 'shared/CSharedConstants';
import AppSignals from "pixi-project/signals/AppSignals";
import MainStorage from "pixi-project/core/MainStorage";
import Mesh from "pixi-project/view/Mesh";
import SharedElementHelpers from "shared/SharedElementHelpers";
import {
  commonSendEventFunction,
  isMouseWheelButton,
  isRightButton,
  cloneData,
} from "shared/CSharedMethods";
import Signals from "pixi-project/signals/AppSignals";
import SelectionManager from './selection/SelectionManager';
import CommandManager from 'pixi-project/base/command-system/CommandManager';
import SceneManager from 'pixi-project/stage/SceneManager';
import CopyPasteUtility from 'pixi-project/stage/CopyPasteUtility';
import ZoomUtility from 'pixi-project/stage/ZoomUtility';
import AlignUtility, { ALIGN_CENTER_X, ALIGN_CENTER_Y } from 'pixi-project/stage/AlignUtility';
import CommandBatchHighlighted from 'pixi-project/base/command-system/commands/CommandBatchHighlighted';
import CommandLineType from 'pixi-project/base/command-system/commands/CommandLineType';
import CommandDrawLineType from 'pixi-project/base/command-system/commands/CommandDrawLineType';
import CommandScale from 'pixi-project/base/command-system/commands/CommandScale';
import CommandShapeStyle from 'pixi-project/base/command-system/commands/CommandShapeStyle';
import ViewportAutoPan from 'pixi-project/stage/ViewportAutoPan';
import CommandThumbnail from 'pixi-project/base/command-system/commands/CommandThumbnail';
import CommandContentIcon from 'pixi-project/base/command-system/commands/CommandContentIcon';
import CommandElementTitle from 'pixi-project/base/command-system/commands/CommandElementTitle';
import CommandElementURL from 'pixi-project/base/command-system/commands/CommandElementURL';
import AlignmentGuides from './guides/AlignmentGuides';
import InputEventControler from 'pixi-project/stage/InputEventControler';

export default class PlaneContainer extends PIXI.Container {
  constructor() {
    super();
    console.log('[Analysis] PlaneContainer: Promises init');
    this.dataReceivedPromise = new Promise(resolve => {
      this.dataReceivedPromiseResolve = resolve;
    });
    this.initializationPromise = new Promise(resolve => {
      this.initializationPromiseResolve = resolve;
    });
    this.funnelDrawnPromise = new Promise(resolve => {
      this.funnelDrawnPromiseResolve = resolve;
    });
    Signals.assetsLoadingComplete.add(this.onAssetsLoadingComplete.bind(this), this);

    this.init();

    this.inputEventControler.attachListeners();

    this.setCursorMode(EElementCategories.CLICKING);

    AppSignals.setInEditMode.add(this.onEnterTextEditMode, this);
    AppSignals.resizePointPressed.add(this.onResizePointPressed, this);
    AppSignals.resizePointReleased.add(this.onResizePointReleased, this);
    AppSignals.elementChanged.add(this.onElementChanged, this);
    AppSignals.commandCreated.add(this.onCommandCreated, this);
    AppSignals.stageBeforeRendered.add(this.onBeforeStageRendered, this);

    document.addEventListener(RP_EVENT_DELETE_PRESSED, this.onDeleteObjects.bind(this), false);
    document.addEventListener(RP_EVENT_COPY_PRESSED, this.onCopyObjects.bind(this), false);
    document.addEventListener(RP_EVENT_DUPLICATE_PRESSED, this.onDuplicateObjects.bind(this), false);
    document.addEventListener(RP_EVENT_PASTE_PRESSED, this.onPasteObjects.bind(this), false);
    document.addEventListener(RP_EVENT_VERTICAL_ALIGNMENT, this.onVerticalAlign.bind(this), false);
    document.addEventListener(RP_EVENT_HORIZONTAL_ALIGNMENT, this.onHorizontalAlign.bind(this), false);
    document.addEventListener(RP_EVENT_CURSOR_TYPE, this.onCursorTypeChanged.bind(this), false);
    document.addEventListener(RP_EVENT_GET_DATA, this.getIDSData.bind(this), true);
    document.addEventListener(RP_EVENT_LOAD_REQUEST, this.onDataReceived.bind(this), false);
    document.addEventListener(RP_EVENT_EDIT_OBJECT, this.onEditObject.bind(this), false);
    document.addEventListener(RP_EVENT_ANALYTICS_UPDATED, this.onUpdateAnalytics.bind(this), false);
    document.addEventListener(RP_EVENT_TOGGLE_PANEL_STATUS, this._onTogglePanelStatus.bind(this), false);
    document.addEventListener(RP_EVENT_UPDATE_STEP_THUMBNAIL, this._onUpdateStepThumbnail.bind(this), false);
    document.addEventListener(RP_EVENT_CONNECTION_LINE_TYPE_CHANGED, this.onConnectionLineTypeChanged.bind(this), false);
    document.addEventListener(RP_EVENT_DRAW_LINE_TYPE_CHANGED, this.onDrawLineTypeChanged.bind(this), false);
    document.addEventListener(RP_EVENT_CANCEL_NEW_STEP_FROM_CONNECTION, this._onCancelNewStepFromConnection.bind(this), false);
    document.addEventListener(RP_EVENT_OBJECT_DRAG_START, this.onToolbarDragStarted.bind(this), false);
    document.addEventListener(RP_EVENT_SAVE_TO_PNG, this.onSaveToPng.bind(this), false);
    document.addEventListener(PR_EVENT_TOOLBOX_STATE_CHANGED, this.onToolbarActiveStateChanged.bind(this), false);
    document.addEventListener(RP_EVENT_ANALYTICS_STATUS_CHANGED, this.onAnalyticsStatusChanged.bind(this), false);
    document.addEventListener(RP_ANALYTICS_FILTER_DATA_CHANGED, this.onAnalyticsFilterChanged.bind(this), false);
    document.addEventListener(RP_ANALYTICS_PWP_TOOL_ACTIVATED, this.onAnalyticsPWPActivated.bind(this), false);
    document.addEventListener(PR_EVENT_SHAPE_STYLE_CHANGED, this.onShapeStyleChanged.bind(this), false);
    document.addEventListener(RP_EVENT_STEP_FOCUS_CLEARED, this.onStepFocusCleared.bind(this), false);
    document.addEventListener(RP_EVENT_UNDO_CLICKED, this.onUndoClicked.bind(this), false);
    document.addEventListener(RP_EVENT_REDO_CLICKED, this.onRedoClicked.bind(this), false);
    
    document.addEventListener(RP_EVENT_ICON_CHOSEN, this.onIconChosen.bind(this), false);
    document.addEventListener(RP_EVENT_PROPERTY_CHANGED, this.onElementPropertyChanged.bind(this), false);
    document.addEventListener(RP_EVENT_RESTORE_BUTTON_CLICKED, this.onRestoreClicked.bind(this), false);

  }

  init() {
    this.interactive = false;

    this.isToolbarDragging = false;
    this.toolbarDragData = null;
    this.toolbarActiveState = null;
    this.cursorTimerID = null;
    this.analyticsLoadingStatus = null;
    this.hasElementChanged = false;
    this.isPWPActive = false;
    this.PWPFilterType = null;
    this.isResizePointPressed = false;

    this.meshContainer = new PIXI.Container();
    this.iconsContainer = new PIXI.Container();
    this.selectionToolContainer = new PIXI.Container();
    this.multipleSelectionContainer = new PIXI.Container();
    this.focusSelectionContainer = new PIXI.Container();
    this.jointsContainer = new PIXI.Container();

    this.meshContainer.interactive = true;
    this.iconsContainer.interactive = true;
    this.selectionToolContainer.interactive = true;
    this.multipleSelectionContainer.interactive = true;
    this.focusSelectionContainer.interactive = false;
    this.jointsContainer.interactive = true;

    this.objectStartingScale = new PIXI.Point();
    this.objectStartingPosition = new PIXI.Point();

    window.app.stage.addChildAt(this.meshContainer, 0);
    this.addChild(this.iconsContainer);
    this.addChild(this.jointsContainer);

    this.mesh = new Mesh();
    console.log('[Analysis] PlaneContainer: drawMesh');
    this.mesh.interactive = true;
    this.meshContainer.addChild(this.mesh);

    window.app.stage.addChild(this.selectionToolContainer);
    window.app.stage.addChild(this.multipleSelectionContainer);
    window.app.stage.addChild(this.focusSelectionContainer);

    //TODO consider the scene manager and selection manager to talk through a common interface
    this.sceneManager = new SceneManager(this);
    this.selectionManager = new SelectionManager(this, this.sceneManager);
    this.sceneManager.selectionManager = this.selectionManager;
    this.alignmentGuides = new AlignmentGuides(window.app.viewport);

    this.selectionToolContainer.addChild(this.selectionManager.single);
    this.multipleSelectionContainer.addChild(this.selectionManager.multi);
    this.focusSelectionContainer.addChild(this.selectionManager.focusSelection);
    window.app.stage.addChild(this.alignmentGuides);

    this.commandManager = new CommandManager();
    this.sceneManager.commandManager = this.commandManager;

    this.copyPasteUtility = new CopyPasteUtility(this.sceneManager, this.selectionManager);

    this.zoomUtility = new ZoomUtility(this.sceneManager.iconsContainer);
    this.alignUtility = new AlignUtility();
    this.viewportAutoPan = new ViewportAutoPan(this);

    this.inputEventControler = new InputEventControler(
      this.sceneManager,
      this.selectionManager,
      this.commandManager,
      this.copyPasteUtility,
      this.zoomUtility,
      this
    );

  }

  /////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////// TOUCH EVENT HANDLERS

  onElementPointerDown(e) {
    const element = this.selectionManager.getClickedElement(e);
    const ignoreClick = this.isPWPActive && !SharedElementHelpers.IsStep(element);

    if (ignoreClick) {
      e.stopPropagation();
      return;
    }

    if (isRightButton(e) && !isMouseWheelButton(e)) {
      this.selectionManager.onElementRightMouseDown(e);
      return;
    }

    if (!isMouseWheelButton(e)) {
      const isMultiSelect = this.inputEventControler.isShiftDown || this.inputEventControler.isCtrlDown;
      this.selectionManager.onElementPointerDown(e, isMultiSelect);

      if (this.alignmentGuides.isActive) {
        this.setGuidesObjects();
      }
    }

    if (this.isPWPActive) {
      // Immediately deselect the element , it will cause the selection frame to
      // display in blue , signaling that the element is focused
      // and avoid the yellow frame that shows when an element is hovered.
      element.isHovered = false;
      element.isPointerDown = false;

      let selectionFrame = this.selectionManager.focusSelection.findFrameByElementId(element.id);
      let hasFocus = (selectionFrame && selectionFrame.hasFilterType(this.PWPFilterType));

      // Note , the order is important here , please don't change it.
      let data = this.selectionManager.single.getSelectedElementData();
      this.selectionManager.clearSelection();
      this.selectionManager.hide();

      // React will cause to unfocus other focused steps
      // So its important to also send the event first for that to happen
      // And then we can focus our step after that
      commonSendEventFunction(RP_EVENT_STEP_FOCUS_CHANGED, {
        step: data,
        filterType: this.PWPFilterType,
        hasFocus: hasFocus
      });

      this.setStepFocused(element.id, !hasFocus);
      e.stopPropagation();
    }

    if (this.selectionManager.selectedElement && !SharedElementHelpers.IsText(this.selectionManager.selectedElement)) {
      AppSignals.setOutEditMode.dispatch();
    }
  }

  onElementPointerMove(e) {
    if (this.isTextEditing()) {
      return;
    }

    const element = this.selectionManager.getClickedElement(e);
    if (element.isPointerDown) {
      this.viewportAutoPan.isActive = true;
    }

    this.selectionManager.onElementPointerMove(e);

    if (element.isPointerDown && this.selectionManager.hasSelectedElements()) {
      this.showAlignmentGuides();
    }
  }

  onElementPointerUp(e) {
    if (this.cursorMode === EElementCategories.PANNING) {
      Facade.viewport.plugins.resume('drag');
    }

    this.viewportAutoPan.isActive = false;
    this.alignmentGuides.clear();

    // If we are clicking on an element whith a connetion line 
    if (this.sceneManager.pointerJoint && !this.selectionManager.selectedElementInsideShape) {
      e.stopPropagation();
      const element = this.selectionManager.getClickedElement(e);
      this.sceneManager.createConnectionsToElement(element)
      return;
    }

    if (isRightButton(e) && !isMouseWheelButton(e)) {
      this.selectionManager.onElementRightMouseUp(e);
      return;
    }

    this.selectionManager.onElementPointerUp(e);
  }

  onElementPointerUpOutside(e) {
    this.viewportAutoPan.isActive = false;
    this.selectionManager.onElementPointerUpOutside(e);
    this.alignmentGuides.clear();
  }

  onElementPointerOver(e) {
    this.selectionManager.onElementPointerOver(e, this.isPWPActive, this.sceneManager.pointerJoint);
  }

  onElementPointerOut(e) {
    this.selectionManager.onElementPointerOut(e, this.isPWPActive, this.sceneManager.pointerJoint);
  }

  // Delegate handler
  onSelectionHeadsDown(e) {
    this.sceneManager.onSelectionHeadsDown(e);
  }

  // Delegate handler - ViewportAutoPan
  onViewportAutoPan() {
    if (!this.isResizePointPressed) {
      this.selectionManager.moveElements();
    }
    this.selectionManager.updateFocused();

    // update the alignment guides
    if (this.alignmentGuides.isActive) {
      this.setGuidesObjects();
      this.showAlignmentGuides();
    }

    this.handleMeshPosition();
  }

  showAlignmentGuides() {
    let bounds = this.selectionManager.getSelectionBoundingRect();
    this.alignmentGuides.show(bounds, this.selectionManager.selectedObjects);

    if (this.alignmentGuides.didSnap) {
      // Repeat the process ( redo calculations ) to remove execess lines
      let bounds = this.selectionManager.getSelectionBoundingRect();
      this.alignmentGuides.show(bounds, this.selectionManager.selectedObjects);

      this.selectionManager.updateSelectionAfterElementMovement();
    }
  }

  setGuidesObjects() {
    const visibleObjects = this.getVisibleSteps();
    for (let i = 0; i < this.selectionManager.selectedObjects.length; i++) {
      const element = this.selectionManager.selectedObjects[i];
      visibleObjects.removeElement(element);
    }
    this.alignmentGuides.setRelativeObjects(visibleObjects);
  }

  /**
   * Trigged when a resize point is pressed in the selection tool
   * @param {Event} e
   */
  onResizePointPressed(e) {
    this.sceneManager.setObjectsInteraction(false);
    this.isResizePointPressed = true;
    if (this.selectionManager.selectedElement) {
      let object = this.selectionManager.selectedElement;
      this.objectStartingScale.copyFrom(object.scale);
      this.objectStartingPosition.copyFrom(object.position);
    }
  }

  /**
   * Trigged when a resize point is released in the selection tool
   */
  onResizePointReleased() {
    this.sceneManager.revertObjectsInteraction();
    this.isResizePointPressed = false;
    if (this.selectionManager.selectedElement) {
      if (!SharedElementHelpers.IsShape(this.selectionManager.selectedElement)) {
        let object = this.selectionManager.selectedElement;
        let batch = new CommandBatchHighlighted(this.selectionManager);
        let command = new CommandScale(object, this.objectStartingScale, this.objectStartingPosition);
        batch.add(command);
        this.commandManager.execute(batch);
      }
    }
  }

  onShapeResizeHandleDown(e, shape) {
    shape.opositeHandle = this.selectionManager.single.getOpositeHandle(e.currentTarget);
    shape.onResizeHandleDown(e);
  }

  onShapeResizeHandleMove(e, shape) {
    shape.onResizeHandleMove(e.data.global, this.inputEventControler.isShiftDown);
    window.app.needsRendering();
  }

  onShapeResizeHandleUp(e, shape) {
    shape.onResizeHandleUp(e);
  }

  /////////////////////////////////////////////////////////////////////////////////////
  ////////////////// OTHER EVENT HANDLERS

  /**
   * Handler of the scene loading event. Needed to resolve async race between
   * mesh creation and loading of the funnel scene
   * @param e
   */
  onDataReceived(e) {
    console.log('[Analysis] PlaneContainer: dataReceived (data received promise resolved)');
    this.dataReceivedPromiseResolve(e);

    console.log('[Analysis] PlaneContainer: loadScene');

    const { objects } = e.detail.data;
    const { joints: connections } = e.detail.data;

    Promise.all([this.initializationPromise, this.dataReceivedPromise]).then(() => {
      this.sceneManager.addObjectsToScene(objects, connections);
      this.sceneManager.culling.addObjects(this.sceneManager.objects);
      this.sceneManager.culling.addObjects(this.sceneManager.joints);
      this.zoomUtility.fitToScreen();
      this.funnelDrawnPromiseResolve();

      // for testing purpose
      // this.setAnalyticsData();
      // this.processAnalyticsData();

      window.app.needsRendering();
    });
  }

  /**
   * Is triggered when all assets for PIXI side are loaded
   */
  onAssetsLoadingComplete() {
    console.log('[Analysis] PlaneContainer: onAssetsLoadingComplete');
    this.initializationPromiseResolve();
  }

  /**
   * Handler for the case when we request analytics for a list of nodes
   * @param event
   */
  onUpdateAnalytics(event) {
    Promise.all([
      this.initializationPromise, this.meshReadyPromise,
      this.dataReceivedPromise, this.funnelDrawnPromise
    ]).then(() => {
      this.setAnalyticsData(event.detail);
      this.processAnalyticsData();
      window.app.needsRendering();
    });
  }

  onAnalyticsStatusChanged(e) {
    // Once the analytics data has loaded, check if an element was edited while loading
    // Note: edge case for 'Refresh analytics' status. For most of the cases refer to onElementChanged
    if (this.analyticsLoadingStatus === ANALYTICS_STATUS_LOADING && this.hasElementChanged) {
      commonSendEventFunction(PR_EVENT_ANALYTICS_NEEDS_REFRESH);
      this.hasElementChanged = false;
    }
    this.analyticsLoadingStatus = e.detail.status;
    window.app.needsRendering();
  }

  onAnalyticsFilterChanged(e) {
    const keys = Object.keys(e.detail.entities);

    for (let i = 0; i < keys.length; i++) {
      const stepId = keys[i];
      const step = this.sceneManager.getElementById(stepId);
      step.analyticsManager.updateFilter(e.detail.entities[stepId]);
    }
    window.app.needsRendering();
  }

  /**
   * Handler for editing icon values
   * @param data
   */
  onEditObject(data) {
    try {
      const step = this.sceneManager.getElementById(data.detail.stepId);
      step.updateObject(data.detail);
      commonSendEventFunction(PR_EVENT_FUNNEL_CHANGED);
      window.app.needsRendering();
    } catch (e) {
      // todo Temp. Remove when we will fix the problem with async loading (elements not showing)
      console.log(`[onEditObject] There is no element with ID ${data.detail.stepId}`);
    }
  }

  onElementPropertyChanged(event) {
    const type = event.detail.type;
    const stepId = event.detail.stepId;
    const element = this.sceneManager.getElementById(stepId);

    if (type === PropertyType.LABEL) {
      const command = new CommandElementTitle(element, event.detail.previousValue, event.detail.currentValue);
      this.commandManager.execute(command);
    } else if (type === PropertyType.URL) {
      const command = new CommandElementURL(element, event.detail.previousValue, event.detail.currentValue);
      this.commandManager.execute(command);
    }
  }

  onIconChosen(data) {
    const step = this.sceneManager.getElementById(data.detail.stepId);
    const texturePath = data.detail.texturePath;
    const command = new CommandContentIcon(step, texturePath);
    this.commandManager.execute(command);
  }

  onDeleteObjects(e) {
    this.sceneManager.deleteSelection();
  }

  onCopyObjects(e) {
    this.copyPasteUtility.copySelection();
    this.selectionManager.hideToolbar();
  }

  onDuplicateObjects(e) {
    this.copyPasteUtility.duplicateSelection();
    this.selectionManager.hideToolbar();
  }

  onPasteObjects(e) {
    const position = e.detail;
    // Map the point to the canvas resolution
    position.x *= 1 / window.app.scaleManager.aspectRatio;
    position.y *= 1 / window.app.scaleManager.aspectRatio;
    this.copyPasteUtility.pasteClipboard(position);
  }

  onUndoClicked() {
    this.commandManager.undo();
  }

  onRedoClicked() {
    this.commandManager.redo();
  }

  onElementChanged() {
    // keep track if an element was updated 
    this.hasElementChanged = true;

    // if the analytics data is not loading , 
    // the status can be set to ANALYTICS_NEEDS_REFRESH immediately.
    // But there is an edge case when we change funnel during the process of analytics update.
    // In this case we send status update to React and after loading finishes show the correct marker
    // on the 'Refresh analytics' button
    // In this case check onAnalyticsStatusChanged function.
    if (this.analyticsLoadingStatus !== ANALYTICS_STATUS_LOADING) {
      commonSendEventFunction(PR_EVENT_ANALYTICS_NEEDS_REFRESH);
      this.hasElementChanged = false;
    }
  }

  onStepFocusCleared(e) {
    this.selectionManager.focusSelection.removeByFilterType(e.detail.types);
  }

  /**
   * Change inBetween status of a connection
   * Temporarily updates status of all connected outgoing connections
   * @param e
   * @private
   */
  onConnectionLineTypeChanged(e) {
    const data = e.detail;
    if (!data || (typeof data.id === 'undefined')) {
      throw Error(`[_onSetInBetweenSteps] Wrong data format ${data}`);
    }

    const connection = this.sceneManager.getConnectionById(data.id);
    if (connection) {
      let command = new CommandLineType(connection, e.detail.lineType);
      this.commandManager.execute(command);
    } else {
      throw Error(`[_onSetInBetweenSteps] Wrong data format ${data}`);
    }
  }

  onDrawLineTypeChanged(e) {
    const data = e.detail;
    if (!data || (typeof data.id === 'undefined')) {
      throw Error(`[_onSetInBetweenSteps] Wrong data format ${data}`);
    }
    
    const connection = this.sceneManager.getConnectionById(data.id);
    if (connection) {
      let command = new CommandDrawLineType(connection, e.detail.lineType);
      this.commandManager.execute(command);
    } else {
      throw Error(`[_onSetInBetweenSteps] Wrong data format ${data}`);
    }
  }


  onShapeStyleChanged(e) {
    const shape = this.selectionManager.selectedElement;
    const oldShapeData = cloneData(shape.shapeData);

    const style = e.detail;
    shape.setStyle(style);

    const command = new CommandShapeStyle(shape, oldShapeData);
    this.commandManager.execute(command);
  }

  /**
   * Change texture to new thumbnail for the element
   * @param e
   * @private
   */
  _onUpdateStepThumbnail(e) {
    const data = e.detail;
    if (!data || !data.url || (typeof data.id === 'undefined')) {
      throw Error(`[_onUpdateStepThumbnail] Wrong data format ${data}`);
    }

    const step = this.sceneManager.getElementById(data.id);
    // Only for 'step' type for now
    if (SharedElementHelpers.IsStep(step)) {

      step.loadThumbnail(data.url, (texture) => {
        let thumbnail = step.generateThumbnail(texture);
        let command = new CommandThumbnail(step, data.url, true, thumbnail);
        this.commandManager.execute(command);
      });

    }
  }

  /**
   * Cancel the joint to the coordinates if after opening a "new step" dialog
   * we cancel the action somehow
   * @private
   */
  _onCancelNewStepFromConnection() {
    this.sceneManager.removeCoordinatesJoint();
  }

  /**
   * Handle new values of toggle panel from react
   * @param e
   * @private
   */
  _onTogglePanelStatus(e) {
    const data = e.detail;
    const currentStatus = MainStorage.getTogglePanelStatus();

    // Note! Consider refactoring when all 3 toggles will be implemented

    // "Numbers" toggle changed
    if (currentStatus.numbers !== data.numbers) {
      this.applyNumbersToggle(data);
    }

    // "Flow" toggle changed
    // "Forecast" toggle changed

    MainStorage.setTogglePanelStatus(data);
    window.app.needsRendering();
  }

  onToolbarDragStarted(e) {
    this.isToolbarDragging = true;
    this.toolbarDragData = e.detail;
    //TODO add a custom icon for dragging objects into the canvas
    this.setViewportCursor('grabbing');
  }

  onToolbarActiveStateChanged(e) {
    const state = e.detail.state;
    this.toolbarActiveState = state;

    switch (state) {
      case ACTIVE_STATE_DRAW: {
        document.body.style.cursor = 'crosshair';
        break;
      }
      case ACTIVE_STATE_TEXT: {
        document.body.style.cursor = 'text';
        break;
      }
      default: {
        document.body.style.cursor = 'default';
      }
    }
  }

  /**
   * Event handler when the cursor is changed
   * @param {Data} event 
   */

  onCursorTypeChanged(event) {
    this.setCursorMode(event.detail.category);
  }

  /**
   * Triggered when any text element is entering edit mode
   */
  onEnterTextEditMode() {
    this.selectionManager.hide();
  }

  /**
   * Align a set of selected elements to the top
   */
  onVerticalAlign() {
    this.alignObjects(ALIGN_CENTER_X);
  }

  /**
   * Align a set of selected elements to the left
   */
  onHorizontalAlign() {
    this.alignObjects(ALIGN_CENTER_Y);
  }

  onSaveToPng() {
    this.sceneManager.saveToPng();
  }

  onCommandCreated(command, isBatching = null) {
    if (isBatching) {
      let batch = new CommandBatchHighlighted(this.selectionManager);
      batch.add(command);
      this.commandManager.execute(batch);
    } else {
      this.commandManager.execute(command);
    }
  }

  onBeforeStageRendered(e) {
    this.sceneManager.culling.prepObjectsForRendering();
  }

  ////////////////////////////////////////////////////////////////////////////////////
  ////////////////// ACTION METHODS - methods that perform some action

  alignObjects(type) {
    let commandsBatch = new CommandBatchHighlighted(this.selectionManager);
    let commands = this.alignUtility.alignObjects(this.selectionManager.selectedObjects, type);
    commandsBatch.addCommands(commands);
    this.commandManager.execute(commandsBatch);
    this.selectionManager.updateSelection(true, true);
    window.app.needsRendering();
  }

  // TODO make an analytics manager that will hold and process all the data
  setAnalyticsData(data) {
    if (data) {
      this.setAnalyticsDataToObjects(data, this.sceneManager.objects);
      this.setAnalyticsDataToObjects(data, this.sceneManager.joints);
    } else {
      console.warn("Invalid analytics data");
    }
  }

  setAnalyticsDataToObjects(data, objects) {
    for (let i = 0; i < objects.length; i++) {
      const object = objects[i];
      const objectData = data[object.id];
      if (objectData && (typeof objectData.hits !== 'undefined')) {
        object.onAnalyticsDataReceived(objectData);
      }
    }
  }

  processAnalyticsData() {
    this.processAnalyticsDataToObjects(this.sceneManager.objects);
    this.processAnalyticsDataToObjects(this.sceneManager.joints);
  }

  processAnalyticsDataToObjects(objects) {
    for (let i = 0; i < objects.length; i++) {
      objects[i].processAnalyticsData();
    }
  }

  //TODO this is also a candiate for a analytics manager
  /**
   * Change UI according to toggle panel status
   */
  applyNumbersToggle(data = MainStorage.getTogglePanelStatus()) {
    const objects = this.sceneManager.objects;
    for (let i = 0; i < objects.length; i++) {
      if (SharedElementHelpers.IsStep(objects[i])) {
        objects[i].footer.updateVisibility(data.numbers);
      }
    }

    const joints = this.sceneManager.joints;
    for (let i = 0; i < joints.length; i++) {
      joints[i].footer.updateVisibility(data.numbers);
    }
  }

  setCursorMode(type) {
    this.cursorMode = type;
    switch (type) {
      case EElementCategories.PANNING:
        Facade.viewport.plugins.resume('drag');
        Facade.viewport.plugins.resume('pinch');
        this.iconsContainer.interactiveChildren = false;
        this.jointsContainer.interactiveChildren = false;
        this.setViewportCursor('grab');
        break;
      case EElementCategories.CLICKING:
        Facade.viewport.plugins.pause('drag');
        Facade.viewport.plugins.pause('decelerate');
        Facade.viewport.plugins.pause('pinch');
        this.iconsContainer.interactiveChildren = true;
        this.jointsContainer.interactiveChildren = true;
        this.setViewportCursor('default');
        break;
      default:
        console.log('[setCursorMode] Unknown cursor type');
        break;
    }
  }

  setViewportCursor(cursor) {
    clearTimeout(this.cursorTimerID);
    this.cursorTimerID = setTimeout(function () {
      Facade.viewport.cursor = cursor;
    }, 0);
  }


  enterQuickPanning() {
    if (this.cursorMode !== EElementCategories.PANNING && !this.inputEventControler.isInputActive()) {
      this.setCursorMode(EElementCategories.PANNING);
      commonSendEventFunction(PR_EVENT_QUICK_PANNING_MODE_CHANGED, { isPanning: true });
    }
  }

  cancelQuickPanning() {
    if (!this.inputEventControler.isInputActive()) {
      this.setCursorMode(EElementCategories.CLICKING);
      commonSendEventFunction(PR_EVENT_QUICK_PANNING_MODE_CHANGED, { isPanning: false });
    }
  }

  endDrawing() {
    this.sceneManager.revertObjectsInteraction();
    if (this.sceneManager.objectCreated && this.sceneManager.objectCreated.onStopDraw) {
      const isValid = this.sceneManager.objectCreated.onStopDraw(this.inputEventControler.isShiftDown);
      if (isValid) {
        // Prepare for adding
        this.sceneManager.objects.removeElement(this.sceneManager.objectCreated);
        this.sceneManager.objectCreated.removeFromParent();

        // Add it to the stage via the command system so it can have undo/redo
        this.sceneManager.addObjectToStage(this.sceneManager.objectCreated, false);
      }
    }

    this.sceneManager.objectCreated = null;
    if (this.toolbarActiveState === ACTIVE_STATE_DRAW) {
      document.body.style.cursor = 'crosshair';
    }
  }

  handleMeshPosition() {
    if (this.mesh) {
      this.mesh.recalculate();
    }

    window.app.needsRendering();
  }

  setStepFocused(id, isFocused) {
    let element = this.sceneManager.getElementById(id);
    let similar = this.selectionManager.focusSelection.findSimilarElements(element, this.sceneManager.objects);
    if (isFocused) {
      this.selectionManager.focusSelection.focus(element, similar, this.PWPFilterType);
    } else {
      this.selectionManager.focusSelection.blur(element, similar, this.PWPFilterType);
    }
  }

  ////////////////////////////////////////////////////////////////////////////////////
  /////////////// GETTERS

  getVisibleSteps() {
    const visibleObjects = this.sceneManager.culling.getObjectsInViewport();
    for (let i = visibleObjects.length - 1; i >= 0; i--) {
      let object = visibleObjects[i];
      if (SharedElementHelpers.IsConnection(object)) {
        visibleObjects.splice(i, 1);
      }
    }
    return visibleObjects;
  }

  /**
   * Returns the analytics element data
   * @param data
   */
  getIDSData(data) {
    // todo Plan is to move RP_EVENT_SAVE_REQUEST and RP_EVENT_REFRESH_REQUEST to this functionality
    const eventName = data.detail.value;
    const objects = this.sceneManager.objects;
    const joints = this.sceneManager.joints;

    this.minimalData = { objects: [], joints: [] };
    for (let i = 0; i < objects.length; i++) {
      const obj = objects[i].getState();
      this.minimalData.objects.push(obj);
    }

    for (let i = 0; i < joints.length; i++) {
      const joint = joints[i].getState();
      // Don't request analytics for connections that connect to Text or Shape elements
      if ((SharedElementHelpers.IsStep(joints[i].iconA) && !SharedElementHelpers.IsMisc(joints[i].iconA)) &&
        (SharedElementHelpers.IsStep(joints[i].iconB) && !SharedElementHelpers.IsMisc(joints[i].iconB))) {
        this.minimalData.joints.push(joint);
      }
    }

    const event = new CustomEvent(eventName, {
      detail: { data: JSON.stringify(this.minimalData) },
    });
    document.dispatchEvent(event);
  }

  /**
   * People Who Perfomed 
   * @param {Bool} isActive 
   */
  onAnalyticsPWPActivated(e) {
    const isActive = e.detail.opened;
    this.PWPFilterType = e.detail.type;

    // People Who Performed
    this.activatePWP(isActive);
  }

  /**
   * Activate People Who Perfomed 
   * @param {Bool} isActive 
   */
  activatePWP(isActive) {
    this.isPWPActive = isActive;
    const objects = this.sceneManager.objects;

    if (isActive) {
      this.selectionManager.clearSelection();
      this.selectionManager.hide();

      document.body.style.cursor = 'crosshair';
      this.setViewportCursor('crosshair');

      for (let i = 0; i < objects.length; i++) {
        let object = objects[i];
        object.cursor = 'pointer';
      }

      this.sceneManager.lockInteractionsForNonStepOjects();
    } else {
      document.body.style.cursor = 'default';
      this.setViewportCursor('default');

      for (let i = 0; i < objects.length; i++) {
        let object = objects[i];
        object.cursor = 'move';
      }

      this.sceneManager.revertObjectsInteraction();
    }
  }

  onRestoreClicked(e) {
    this.clearStage();
  }

  clearStage() {
    // clear the main reference of the imported objects
    this.sceneManager.destroyAllObjects();
    this.sceneManager.objects = [];
    this.sceneManager.joints = [];
    this.sceneManager.stateData = { objects: [], joints: [] };

    // remove them from the stage
    this.jointsContainer.removeChildren();
    this.iconsContainer.removeChildren();

    this.selectionManager.clearSelection();
    this.selectionManager.hide();
    this.selectionManager.hideToolbar();

    this.commandManager.reset();
    this.copyPasteUtility.reset();

    this.sceneManager.culling.clear();
  }

  isTextEditing() {
    return this.getEditingText() ? true : false;
  }

  getEditingText() {
    if (this.selectionManager.hasSelectedElements()) {
      const selectedObjects = this.selectionManager.selectedObjects;
      for (let i = 0; i < selectedObjects.length; i++) {
        const selectedElement = selectedObjects[i];
        if (selectedElement && SharedElementHelpers.IsText(selectedElement) && selectedElement.isEditMode) {
          return selectedElement;
        }
      }
    }
    return null;
  }

}
