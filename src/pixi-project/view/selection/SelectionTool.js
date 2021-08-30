import * as PIXI from 'pixi.js';
import Facade from 'pixi-project/Facade';
import { PR_EVENT_FUNNEL_CHANGED, PR_EVENT_TOOLBAR_SHOWING } from 'shared/CSharedEvents';
import AppSignals from "pixi-project/signals/AppSignals";
import ScalePoint from "pixi-project/base/elements/ScalePoint";
import { EStepConnectionPort } from "shared/CSharedCategories";
import { commonSendEventFunction } from "shared/CSharedMethods";
import SharedElementHelpers from "shared/SharedElementHelpers";
import { COLOR_SELECTION } from 'pixi-project/view/Styles';
import { SELECTION_BOUNDARY_GAP } from "../Styles";

export const SINGLE_SELECTION_BOUNDS_WIDTH = 2;

const MIN_ALLOWED_SCALE = 0.8;
const MAX_ALLOWED_SCALE = 3;
const SCALE_POINT_LEFT_BOTTOM = 'leftBottomScalePoint';
const SCALE_POINT_RIGHT_BOTTOM = 'rightBottomScalePoint';
const SCALE_POINT_RIGHT_TOP = 'rightTopScalePoint';
const SCALE_POINT_LEFT_TOP = 'leftTopScalePoint';
const PADDING_TOP_LEFT = 8.5;
const PADDING_BOTTOM_RIGHT = 11;
const HEADS_OFFSET = 10;

// Delegate
// - onShapeResizeHandleDown(event , currentStep)
// - onShapeResizeHandleMove(event , currentStep)
// - onShapeResizeHandleUp(event , currentStep)
export default class SelectionTool extends PIXI.Container {

  constructor(onHeadsDown, delegate) {
    super();

    this.isDraggingStarted = false;
    this.dragData = {};
    this.headIn = null;
    this.headOut = null;
    this.onHeadsDown = onHeadsDown;
    this.startHandlePosition = new PIXI.Point();
    this.delegate = delegate;
    this.sectionStyle = { height: 0 };
    this.init();
  }

  init() {
    AppSignals.setTextEditMode.add(this.onTextEditModeChanged, this);

    this.frame = new PIXI.Graphics();
    this.addChild(this.frame);
    this.drawHeads();
    this.drawScalePoints();
    this.isDraggingStarted = false;
    this.bottomScalePoints = [SCALE_POINT_LEFT_BOTTOM, SCALE_POINT_RIGHT_BOTTOM];

    this.opositeHandles = {};
    this.opositeHandles[SCALE_POINT_LEFT_BOTTOM] = SCALE_POINT_RIGHT_TOP;
    this.opositeHandles[SCALE_POINT_RIGHT_BOTTOM] = SCALE_POINT_LEFT_TOP;
    this.opositeHandles[SCALE_POINT_RIGHT_TOP] = SCALE_POINT_LEFT_BOTTOM;
    this.opositeHandles[SCALE_POINT_LEFT_TOP] = SCALE_POINT_RIGHT_BOTTOM;
  }

  isBottomScalePoint(pointName) {
    return this.bottomScalePoints.indexOf(pointName) > -1;
  }

  drawFrame() {
    this.frame.clear();
    this.frame.lineStyle(SINGLE_SELECTION_BOUNDS_WIDTH, COLOR_SELECTION, 1);

    const endPoint = this.currentStep.getEndPoint();
    const scale = window.app.viewport.scaled;
    const padding = SELECTION_BOUNDARY_GAP * scale;

    this.frame.drawRect(
      -padding,
      -padding,
      endPoint.width + 2 * padding,
      endPoint.height + 2 * padding,
    );
  }

  drawScalePoints() {
    this.scalePoints = {};
    let points = [SCALE_POINT_LEFT_TOP, SCALE_POINT_RIGHT_TOP, SCALE_POINT_RIGHT_BOTTOM, SCALE_POINT_LEFT_BOTTOM];
    const cursors = ['nwse-resize', 'nesw-resize', 'nwse-resize', 'nesw-resize'];

    for (let i = 0; i < points.length; i++) {
      const pointName = points[i];
      const cursor = cursors[i];

      let scalePoint = new ScalePoint(pointName);
      scalePoint.index = i;
      scalePoint.interactive = true;
      scalePoint.buttonMode = true;
      scalePoint.on('pointerdown', this.onScalePointDown.bind(this));
      scalePoint.cursor = cursor;
      this.addChild(scalePoint);
      this.scalePoints[pointName] = scalePoint;
    }

    //TODO these 2 events are wrongly named , and wrongly used.
    // Because of this , I receive "onScalePointUp" when there is no interaction with the scale point at all.
    Facade.viewport.on('pointermove', this.onScalePointMove.bind(this));
    Facade.viewport.on('pointerup', this.onScalePointUp.bind(this));
  }

  positionScalePoints() {
    const scale = window.app.viewport.scaled;

    this.scalePoints[SCALE_POINT_LEFT_TOP].x = -PADDING_TOP_LEFT * scale;
    this.scalePoints[SCALE_POINT_LEFT_TOP].y = -PADDING_TOP_LEFT * scale;

    this.scalePoints[SCALE_POINT_RIGHT_TOP].x = this.frame.width - PADDING_BOTTOM_RIGHT * scale;
    this.scalePoints[SCALE_POINT_RIGHT_TOP].y = -PADDING_TOP_LEFT * scale;

    this.scalePoints[SCALE_POINT_LEFT_BOTTOM].x = -PADDING_TOP_LEFT * scale;
    this.scalePoints[SCALE_POINT_LEFT_BOTTOM].y = this.frame.height - PADDING_BOTTOM_RIGHT * scale;

    this.scalePoints[SCALE_POINT_RIGHT_BOTTOM].x = this.frame.width - PADDING_BOTTOM_RIGHT * scale;
    this.scalePoints[SCALE_POINT_RIGHT_BOTTOM].y = this.frame.height - PADDING_BOTTOM_RIGHT * scale;
  }

  showScalePoints(visible) {
    for (const scalePoint of Object.values(this.scalePoints)) {
      scalePoint.visible = visible;
    }
  }

  drawHeads() {
    // todo Why are we using SVGs here. Are we using them at all
    const leftArrowHead = PIXI.Texture.from(`${process.env.PUBLIC_URL}/asset/leftArrowHead.svg`);
    const rightArrowHead = PIXI.Texture.from(`${process.env.PUBLIC_URL}/asset/rightArrowHead.svg`);

    this.headsContainer = new PIXI.Container();
    this.addChild(this.headsContainer);

    this.headIn = new PIXI.Sprite(leftArrowHead);
    this.headIn.name = EStepConnectionPort.IN;
    this.headIn.anchor.set(0.5);
    this.headIn.interactive = true;
    this.headIn.buttonMode = true;
    this.headIn.cursor = 'grab';
    this.headsContainer.addChild(this.headIn);

    this.headOut = new PIXI.Sprite(rightArrowHead);
    this.headOut.name = EStepConnectionPort.OUT;
    this.headOut.anchor.set(0.5);
    this.headOut.interactive = true;
    this.headOut.buttonMode = true;
    this.headOut.cursor = 'grab';
    this.headsContainer.addChild(this.headOut);

    this.headsContainer.interactive = true;

    this.headIn
      .on('pointerdown', this.onHeadsDown);

    this.headOut
      .on('pointerdown', this.onHeadsDown);
  }

  positionHeads() {
    const scale = window.app.viewport.scaled;
    const offset = HEADS_OFFSET * scale;

    this.headIn.x = -offset;
    this.headIn.y = this.frame.height / 2 - offset;

    this.headOut.x = this.frame.width - offset;
    this.headOut.y = this.frame.height / 2 - offset;
  }

  setStep(step) {
    if (this.currentStep !== step) {
      this.currentStep = step;
      this.updateFrame();
    }
  }

  updateFrame(showToolbar = true, showScalePoints = true, showHeads = true) {
    this.currentRatio = this.currentStep.height / this.currentStep.width;

    const p = Facade.viewport.toGlobal(this.currentStep);
    this.x = p.x;
    this.y = p.y;

    this.show(showToolbar, showScalePoints, showHeads);
  }

  /**
   * Decides the visibitily of the ports (in, out, attr exp)
   * @param step
   */
  setPortVisibility(step, visible = true) {
    this.headsContainer.interactive = visible && SharedElementHelpers.IsStep(step);
    this.headsContainer.visible = visible && SharedElementHelpers.IsStep(step);

    this.headIn.visible = visible && !SharedElementHelpers.IsSource(step);
    this.headIn.interactive = visible && !SharedElementHelpers.IsSource(step);
  }

  show(showToolbar = true, showScalePoints = true, showHeads = true) {

    if (!this.currentStep || this.currentStep.isEditMode) {
      return;
    }
    this.currentRatio = this.currentStep.height / this.currentStep.width;

    const p = Facade.viewport.toGlobal(this.currentStep);
    this.x = p.x;
    this.y = p.y;

    this.showScalePoints(showScalePoints && this.currentStep.isResizable);

    this.drawFrame();
    this.positionScalePoints();
    this.positionHeads();
    const isShow = this.currentStep.isShowTool;
    this.setToolbarPositionPoint();
    this.sendPositionForToolbar(showToolbar && isShow);
    this.visible = true;

    this.setPortVisibility(this.currentStep, showHeads);
  }

  hide() {
    if (this.visible) {
      this.sendPositionForToolbar(false);
      this.visible = false;
      this.positionPoint = null;
    }
  }

  setToolbarPositionPoint() {
    this.positionPoint = this.currentStep.positionPoint;

    const { height } = this.currentStep.getBounds();
    this.sectionStyle.height = height;
  }

  onTextEditModeChanged(status) {
    this.visible = !status;
  }

  /**
   * Sets a point from which we position the toolbar for an element
   */
  sendPositionForToolbar(show) {
    // TODO the function/event needs to be renamed to 'PR_EVENT_OBJECT_SELECTED'
    // TODO and the function can be named "notifyObjectSelected"
    if (!this.positionPoint) {
      return;
    }

    let data = this.getSelectedElementData();
    data.show = show;
    commonSendEventFunction(PR_EVENT_TOOLBAR_SHOWING, data);
  }

  getSelectedElementData() {
    if (!this.positionPoint) {
      return;
    }

    const position = this.positionPoint.getGlobalPosition();
    position.x *= window.app.scaleManager.aspectRatio;
    position.y *= window.app.scaleManager.aspectRatio;
    const data = this.currentStep.getState();
    data.position = { x: position.x, y: position.y };
    data.sectionStyle = { height: this.sectionStyle.height * window.app.scaleManager.aspectRatio };

    // todo Update API. Change stepId and ID to id
    data.stepId = data.ID;
    return data;
  }

  onViewportClicked() {
    AppSignals.viewportClicked.dispatch();
    if (this.currentStep && !this.currentStep.isText) {
      this.hide();
    }
    else if (this.currentStep && this.currentStep.isEditMode) {
      this.currentStep.isEditMode = false;
      this.setStep(this.currentStep);
    }
    else {
      this.hide();
    }
  }

  onScalePointDown(e) {
    this.hide();
    e.stopPropagation();
    this.setDraggingData(e);

    if (this.currentStep) {
      if (SharedElementHelpers.IsShape(this.currentStep)) {
        if (this.delegate && this.delegate.onShapeResizeHandleDown) {
          this.delegate.onShapeResizeHandleDown(e, this.currentStep);
        }
      } else {
        AppSignals.resizePointPressed.dispatch(e);
      }
    }
  }

  onScalePointMove(e) {
    if (this.isDraggingStarted) {

      if (SharedElementHelpers.IsShape(this.currentStep)) {
        if (this.delegate && this.delegate.onShapeResizeHandleMove) {
          this.delegate.onShapeResizeHandleMove(e, this.currentStep);
          e.stopPropagation();
        }
      } else {

        const newScale = this._getNewScale(e.data.global);

        // We limit scale values
        if ((newScale > MIN_ALLOWED_SCALE) && (newScale < MAX_ALLOWED_SCALE)) {
          let position;
          const changeScale = newScale / this.dragData.scale;
          switch (this.dragData.scalePointName) {
            case SCALE_POINT_RIGHT_BOTTOM:
              // Do nothing
              break;
            case SCALE_POINT_LEFT_BOTTOM:
              position = {
                x: this.dragData.position.x + this.dragData.size.width - (this.dragData.size.width * changeScale),
                y: this.dragData.position.y,
              }
              this._setLocalStepPosition(position);
              break;
            case SCALE_POINT_LEFT_TOP:
              position = {
                x: this.dragData.position.x + this.dragData.size.width - (this.dragData.size.width * changeScale),
                y: this.dragData.position.y + this.dragData.size.height - (this.dragData.size.height * changeScale),
              }
              this._setLocalStepPosition(position);
              break;
            case SCALE_POINT_RIGHT_TOP:
              position = {
                x: this.dragData.position.x,
                y: this.dragData.position.y + this.dragData.size.height - (this.dragData.size.height * changeScale),
              }
              this._setLocalStepPosition(position);
              break;
            default:
              throw Error(`[SelectionTool.onScalePointMove] Wrong value ${this.dragData.scalePointName}`);
          }

          this.currentStep.scale.set(newScale);
          this.currentStep.move();
        }

        // TODO delegate this event , so that we know about this event
        // this.currentStep.updateHighlightFrame();
      }

      window.app.needsRendering();
    }
  }

  onScalePointUp(e) {
    if (this.isDraggingStarted) {

      if (this.currentStep) {
        if (SharedElementHelpers.IsShape(this.currentStep)) {
          if (this.delegate && this.delegate.onShapeResizeHandleUp) {
            this.delegate.onShapeResizeHandleUp(e, this.currentStep);
            e.stopPropagation();
          }
        } else {
          AppSignals.resizePointReleased.dispatch();
        }
      }

      this.clearDraggingData();
      commonSendEventFunction(PR_EVENT_FUNNEL_CHANGED);
      this.setStep(this.currentStep);
      this.currentStep.move();
      window.app.needsRendering();
    }
  }

  /**
   * Calculate change in size of the element
   * @param position
   * @returns {number}
   * @private
   */
  _getNewScale(position) {
    // Important! this.y is actually the start of the step selected.
    // Selection bounds are drawn from -10, -10
    let height = 0;
    let scale = window.app.viewport.scaled;
    // In case we're using the bottom scale point, use top value
    if (this.isBottomScalePoint(this.dragData.scalePointName)) {
      height = position.y - SELECTION_BOUNDARY_GAP * scale - this.y;
    } else {
      height = this.y + this.dragData.size.height - position.y - SELECTION_BOUNDARY_GAP * scale;
    }

    return height * this.dragData.scale / this.dragData.size.height;
  }

  _getGlobalCoordinates(x, y) {
    // todo Extract to utils method that can create a copy in local/global scope
    const coords = Facade.viewport.toGlobal({
      x: x,
      y: y,
    });
    return coords;
  }

  _setLocalStepPosition(position) {
    const local = Facade.viewport.toLocal(position);
    this.currentStep.x = local.x;
    this.currentStep.y = local.y;
  }

  setDraggingData(e) {
    this.isDraggingStarted = true;
    this.dragData = {
      scalePointName: e.currentTarget.name,
      scale: this.currentStep.scale.x,
      position: this._getGlobalCoordinates(this.currentStep.x, this.currentStep.y),
      size: this.currentStep.getEndPoint(),
    }
  }

  clearDraggingData() {
    this.isDraggingStarted = false;
    this.dragData = {};
  }

  getOpositeHandle(handle) {
    let ohn = this.opositeHandles[handle.name];
    return this.scalePoints[ohn];
  }
}
