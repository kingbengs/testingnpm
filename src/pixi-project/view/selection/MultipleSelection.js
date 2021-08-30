import * as PIXI from 'pixi.js';
import Utils from "pixi-project/utils/Utils";
import { PR_EVENT_TOOLBAR_SHOWING } from "shared/CSharedEvents";
import { COLOR_SELECTION, COLOR_MULTIPLE_SELECTION_RECTANGLE } from 'pixi-project/view/Styles';
import { SELECTION_ROUND_CORNER } from "../Styles";
import { commonSendEventFunction } from 'shared/CSharedMethods';
import { EStepConnectionPort } from "shared/CSharedCategories";
import { CControlPointTypes } from 'pixi-project/base/containers/CContainerConstants';
const MULTIPLE_SELECTION_BOUNDS_WIDTH = 2;
export const MULTIPLE_SELECTION_WIDTH = 2;
export const MULTIPLE_SELECTION_RECTANGLE_OPACITY = 0.5;

export const EMSDrawTypes = {
  'SELECTION': 'SELECTION',
  'BOUNDS': 'BOUNDS',
};

export default class MultipleSelection extends PIXI.Container {
  constructor(onHeadsDown, delegate) {
    super();
    this.sourcePoint = null;
    this.targetPoint = null;

    this.boundsStart = { x: 0, y: 0 };
    this.boundsEnd = { x: 0, y: 0 };

    this.delegate = delegate;
    this.drawFrame = false;
    this.drawSelection = false;
    this.selectedObjects = [];
    this.sectionStyle = { height: 0 };

    this.onHeadsDown = onHeadsDown;
    this.headIn = null;
    this.headOut = null;

    this.init();
  }

  init() {
    this.frame = new PIXI.Graphics();
    this.addChild(this.frame);
    this.isDraggingStarted = false;
    this.isSelecting = false;
    this.drawArrows();
  }

  draw() {
    this.frame.clear();

    this.setVisibilityArrows(false);

    if (this.drawSelection && this.targetPoint) {
      this.frame.lineStyle(MULTIPLE_SELECTION_WIDTH, COLOR_MULTIPLE_SELECTION_RECTANGLE, MULTIPLE_SELECTION_RECTANGLE_OPACITY);
      this.frame.beginFill(COLOR_MULTIPLE_SELECTION_RECTANGLE, MULTIPLE_SELECTION_RECTANGLE_OPACITY);
      this.frame.drawRect(
        0, 0,
        this.targetPoint.x - this.x, this.targetPoint.y - this.y,
      );
    }

    if (this.drawFrame && this.boundsStart && this.boundsEnd) {
      this.frame.lineStyle(MULTIPLE_SELECTION_BOUNDS_WIDTH, COLOR_SELECTION);
      this.frame.beginFill(COLOR_MULTIPLE_SELECTION_RECTANGLE, 0);
      this.frame.drawRoundedRect(
        this.boundsStart.x - this.x, this.boundsStart.y - this.y,
        this.boundsEnd.x - this.boundsStart.x, this.boundsEnd.y - this.boundsStart.y,
        SELECTION_ROUND_CORNER,
      );

      if (this.delegate && this.delegate.onMultiSelectionFrameDraw) {
        this.delegate.onMultiSelectionFrameDraw(this.frame);
      }
    }

    if (!this.visible) {
      this.visible = true;
    }
  }


  drawArrows() {
    // todo Why are we using SVGs here. Are we using them at all
    const leftArrowHead = PIXI.Texture.from(`${process.env.PUBLIC_URL}/asset/leftArrowHead.svg`);
    const rightArrowHead = PIXI.Texture.from(`${process.env.PUBLIC_URL}/asset/rightArrowHead.svg`);

    this.headsContainer = new PIXI.Container();
    this.addChild(this.headsContainer);

    this.headIn = new PIXI.Sprite(leftArrowHead);
    this.headIn.name = EStepConnectionPort.IN;
    this.headIn.type = CControlPointTypes.LEFT;
    this.headIn.anchor.set(0.5);
    this.headIn.interactive = true;
    this.headIn.buttonMode = true;
    this.headIn.cursor = 'grab';
    this.headsContainer.addChild(this.headIn);

    this.headOut = new PIXI.Sprite(rightArrowHead);
    this.headOut.name = EStepConnectionPort.OUT;
    this.headOut.type = CControlPointTypes.RIGHT;
    this.headOut.anchor.set(0.5);
    this.headOut.interactive = true;
    this.headOut.buttonMode = true;
    this.headOut.cursor = 'grab';
    this.headsContainer.addChild(this.headOut);

    this.headsContainer.interactive = true;
    this.headsContainer.visible = false;

    this.headIn
      .on('pointerdown', this.onHeadsDown);

    this.headOut
      .on('pointerdown', this.onHeadsDown);

  }

  onElementPointerOut(e) {
    this.onElementPointerUp(e);
  }

  getSelectionBounds() {
    let result = null;
    if (this.sourcePoint && this.targetPoint) {

      const rect = Utils.getBoundingRect([
        this.sourcePoint.x, this.sourcePoint.y,
        this.targetPoint.x, this.targetPoint.y,
      ]);

      result = new PIXI.Rectangle(rect.left, rect.top, rect.width, rect.height);
    }

    return result;
  }

  _setSourcePoint(x, y) {
    this.sourcePoint = {
      x: x,
      y: y,
    };
    this.x = this.sourcePoint.x;
    this.y = this.sourcePoint.y;
  }

  _setTargetPoint(x, y) {
    this.targetPoint = {
      x: x,
      y: y,
    };
  }

  hideToolbar() {
    this.sendPositionForToolbar(false);
  }

  showToolbar() {
    this.sendPositionForToolbar(true);
  }

  setSelectionBounds(bounds) {
    this.boundsStart = { x: bounds.left, y: bounds.top };
    this.boundsEnd = { x: bounds.left + bounds.width, y: bounds.top + bounds.height };
  }

  resetSelection() {
    this.sourcePoint = null;
    this.targetPoint = null;
    this.boundsStart = null;
    this.boundsEnd = null;
    this.frame.clear();
  }

  hideBounds() {
    if (this.visible) {
      this.visible = false;
    }
  }

  setVisibilityArrows(status) {
    this.headsContainer.visible = status;
  }

  show(showToolbar = true) {
    this.positionArrow();

    if (showToolbar) {
      this.setVisibilityArrows(true);
    }
  }

  positionArrow() {

    this.headIn.x = this.boundsStart.x - this.x;
    this.headIn.y = this.boundsStart.y - this.y + (this.boundsEnd.y - this.boundsStart.y) / 2;

    this.headOut.x = this.boundsEnd.x - this.x;
    this.headOut.y = this.boundsEnd.y - this.y - (this.boundsEnd.y - this.boundsStart.y) / 2;

    this.points = [this.headIn, this.headOut];

  }

  updateFrame(showToolbar = true) {
    this.show(showToolbar);
  }

  /**
   * Sets a point from which we position the toolbar for an element
   */
  setToolbarPositionPoint() {
    if (this.boundsStart && this.boundsEnd) {
      const rect = Utils.getBoundingRect([
        this.boundsStart.x, this.boundsStart.y,
        this.boundsEnd.x, this.boundsEnd.y,
      ]);
      this.positionPoint = new PIXI.Point(
        rect.left + rect.width / 2,
        rect.top + rect.height,
      );
      this.sectionStyle.height = rect.height;
    }
  }

  sendPositionForToolbar(show) {
    if (show) {
      this.setToolbarPositionPoint();
    }
    if (!this.positionPoint) {
      return;
    }

    const position = this.positionPoint;
    position.x *= window.app.scaleManager.aspectRatio;
    position.y *= window.app.scaleManager.aspectRatio;
    const data = {};
    data.position = { x: position.x, y: position.y };
    data.sectionStyle = { height: this.sectionStyle.height * window.app.scaleManager.aspectRatio };
    data.show = show;
    data.multiSelect = true;
    // todo Have ids of the elements

    commonSendEventFunction(PR_EVENT_TOOLBAR_SHOWING, data);
  }

  onViewportDown(e) {
    let point = e.data.global;
    this._setSourcePoint(point.x, point.y);
    this._setTargetPoint(point.x, point.y);
  }

  onViewportMove(e) {
    let point = e.data.global;
    if (this.isSelecting) {
      this._setTargetPoint(point.x, point.y);
    }
  }

  onViewportUp(e) {
    if (this.isSelecting) {
      let point = e.data.global;
      this._setTargetPoint(point.x, point.y);
      this.isSelecting = false;
      this.frame.clear();
    }
    this.isDraggingStarted = false;
  }

  onViewportOut() {

  }

}
