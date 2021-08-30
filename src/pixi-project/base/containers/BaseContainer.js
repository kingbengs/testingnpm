import * as PIXI from 'pixi.js';
import ControlPoint from './ControlPoint';
import { PR_EVENT_TOOLBAR_SHOWING } from 'shared/CSharedEvents';
import { EElementCategories, EElementTypes } from 'shared/CSharedCategories';
import MainStorage from "pixi-project/core/MainStorage";
import generateId from "pixi-project/utils/IDGenerator";
import BaseSignals from "pixi-project/base/signals/BaseSignals";
import Styles, {
  COLOR_LABEL_DEFAULT,
  COLOR_SELECTION,
  FOOTER_MARGIN,
  TITLE_MARGIN,
} from 'pixi-project/view/Styles';
import InfoDisplay from "pixi-project/view/objects/InfoDisplay";
import { CControlPointTypes } from "pixi-project/base/containers/CContainerConstants";
import SharedElementHelpers from 'shared/SharedElementHelpers';
import { commonSendEventFunction } from 'shared/CSharedMethods';
import { ANALYTICS_DATA_DEFAULT_PLACEHOLDER } from 'shared/CSharedConstants';


export default class BaseContainer extends PIXI.Container {
  constructor(eventHandlers, id = generateId()) {
    super();
    this.titleText = '';
    this._highlighted = false;
    this.valueSecondary = '0';
    this.url = '';
    this.isText = false;
    this.stateData = {};
    this.id = id;
    this._id = PIXI.utils.uid(); // internal integer ID , for performance 
    this.segmentIds = []; // Used to optimize culling
    this.cullingBounds = new PIXI.Rectangle();
    this.category = EElementCategories.NONE;
    this.type = EElementTypes.NONE;
    this._previousInteractiveChildrenState = null;
    this.isHovered = false;
    this.isSelected = false;
    this.isFrameShowing = false; // Focus frame or highlight frame
    this.isTitleShifted = false;

    this.titleLabel = new PIXI.BitmapText('', Styles.TITLE_LABEL);
    this.footer = new InfoDisplay([ANALYTICS_DATA_DEFAULT_PLACEHOLDER]);
    this.addChild(this.footer);

    this.isDebug = false;
    this.isPointerDown = false;

    if (eventHandlers) {
      this.onElementPointerDown = eventHandlers.onElementPointerDown;
      this.onElementPointerMove = eventHandlers.onElementPointerMove;
      this.onElementPointerUp = eventHandlers.onElementPointerUp;
      this.onElementPointerUpOutside = eventHandlers.onElementPointerUpOutside;
      this.onElementPointerOver = eventHandlers.onElementPointerOver;
      this.onElementPointerOut = eventHandlers.onElementPointerOut;
    }

    this.originWidth = 0;
    this.originHeight = 0;
    this.edgePointsAmount = 1;
    this.isShowTool = true;
    this.isResizable = true;
    this.frozedData = {
      eventData: null,
      position: {
        x: 0,
        y: 0,
      }
    };

    this.analyticsManager = null;

  }

  // noinspection JSUnusedLocalSymbols
  createImage(data) {
    // todo I don't like the weird check "if this.label". Refactor if necessary
    if (this.titleText && this.titleText.length > 0) {
      this.drawTitleLabel(this.titleText);

      this.footer.x = this.content.width / 2;
      this.footer.y = this.content.height;
      this.footer.updateVisibility(MainStorage.getTogglePanelStatus().numbers);
      this.addChild(this.footer);
    }
    this.highlightFrame = new PIXI.Graphics();
    this.addChild(this.highlightFrame);
  }

  draw(data) {
    this.createImage(data);

    this.interactive = true;
    this.buttonMode = true;
    this.content.interactive = true;
    this.highlightElement(false);

    this.edgePointsAmount = 1;
    this.drawPoints();
    this.addEvents();
  }

  addEvents() {
    this.content
      .on('pointerdown', this.onElementPointerDown)
      .on('pointermove', this.onElementPointerMove)
      .on('pointerup', this.onElementPointerUp)
      .on('pointerupoutside', this.onElementPointerUpOutside)
      .on('pointerover', this.onElementPointerOver)
      .on('pointerout', this.onElementPointerOut);

    //TODO refactor and prevent elements from propagating events.
    // this.content.on('pointerup', e => e.stopPropagation());
  }

  drawPoints() {
    // todo Rewrite. We need small part of this code
    this.points = [];
    this.topPoint = new ControlPoint(CControlPointTypes.TOP);
    this.topPoint.beginFill(0x000000);
    this.topPoint.drawCircle(0, 0, 3);
    this.topPoint.visible = this.isDebug;
    this.points.push(this.topPoint);
    this.addChildAt(this.topPoint, 0);

    this.bottomPoint = new ControlPoint(CControlPointTypes.BOTTOM);
    this.bottomPoint.beginFill(0x000000);
    this.bottomPoint.drawCircle(0, 0, 3);
    this.bottomPoint.visible = this.isDebug;
    this.points.push(this.bottomPoint);
    this.addChildAt(this.bottomPoint, 0);

    this.rightPoint = new ControlPoint(CControlPointTypes.RIGHT);
    this.rightPoint.beginFill(0x000000);
    this.rightPoint.drawCircle(0, 0, 3);
    this.rightPoint.visible = this.isDebug;
    this.points.push(this.rightPoint);
    this.addChildAt(this.rightPoint, 0);

    this.leftPoint = new ControlPoint(CControlPointTypes.LEFT);
    this.leftPoint.beginFill(0x000000);
    this.leftPoint.drawCircle(0, 0, 3);
    this.leftPoint.visible = this.isDebug;
    this.points.push(this.leftPoint);
    this.addChildAt(this.leftPoint, 0);

    this.positionPoints();
    this.setToolbarPositionPoint();
  }

  _setCommonLabelProps(text, element) {
    element.text = text;
    this.addChild(element);
  }

  drawTitleLabel(titleText) {
    if (typeof this.titleText !== 'undefined') {
      this.titleText = titleText;
      this.titleLabel.text = titleText;
      this.titleLabel.visible = true;
      this.titleLabel.anchor.x = 0.5;
      this.titleLabel.x = this.content.width / 2;
      if (this.isTitleShifted) {
        this.shiftDisplayLabels();
      } else {
        this.normalizeDisplayLabels();
      }
      this.addChild(this.titleLabel);
    }
  }

  setURL(url) {
    this.url = url || '';
  }

  /**
   * Update values for an element. Should extend for element-specific values
   * @param data
   */
  updateObject(data) {
    if (typeof data.label !== 'undefined') {
      // noinspection JSUnresolvedFunction
      this.drawTitleLabel(data.label);
    }

    if (data.url !== undefined && (this.url !== data.url)) {
      this.setURL(data.url);
    }
  }

  /**
   * Sets a point from which we position the toolbar for an element
   */
  setToolbarPositionPoint() {
    this.positionPoint = this.bottomPoint;
  }

  /**
   * Recalculates the edge control points of the bounds 
   * The points are used to snap the connection lines in place.
   */
  positionPoints() {
    const padding = this.getBoundsPadding();

    const centerX = (this.content.width / (this.edgePointsAmount) / 2); // center on the X axis
    const rightX = this.getBoundsRightX(); // get the right point position
    const centerY = (this.content.height / (this.edgePointsAmount) / 2); // center on the Y axis
    const bottomY = this.content.height; // the bottom point position

    this.topPoint.x = centerX;
    this.topPoint.y = -padding.top;
    this.bottomPoint.x = centerX;
    this.bottomPoint.y = bottomY + padding.bottom;
    this.rightPoint.x = rightX + padding.right;
    this.rightPoint.y = centerY;
    this.leftPoint.x = -padding.left;
    this.leftPoint.y = centerY;
  }

  /**
   * It calculates the local right X cooridinate of the element
   * @returns Integer coordinate
   */
  getBoundsRightX() {
    if (SharedElementHelpers.IsTextOrShapeElements(this)) {
      return this.content.width;
    }
    return this.content.width / 2;
  }

  getBoundsPadding() {
    let padding = {
      top: 20,
      right: 40,
      bottom: 20,
      left: 14,
    };

    if (SharedElementHelpers.IsPage(this)) {
      padding.right = 70;
    } else if (SharedElementHelpers.IsText(this)) {
      padding.top = 14;
      padding.right = 20;
    } else if (SharedElementHelpers.IsShape(this)) {
      padding.right = 14;
    }

    return padding;
  }

  /**
   * Returns the data that should be send to react when showing a toolbar
   * @returns {{show: *, stepId: *, position: {x: number, y: number}, category: string}}
   * @private
   */
  _getToolbarData(show) {
    const position = this.positionPoint.getGlobalPosition();
    position.x *= window.app.scaleManager.aspectRatio;
    position.y *= window.app.scaleManager.aspectRatio;
    return { position: { x: position.x, y: position.y }, show, stepId: this.id, category: this.category, supportedLineTypes: this.supportedLineTypes };
  }

  sendPositionForToolbar(show) {
    if (!this.positionPoint) {
      return;
    }

    const data = this._getToolbarData(show);
    commonSendEventFunction(PR_EVENT_TOOLBAR_SHOWING, data);
  }

  onDestroy() {
    this.sendPositionForToolbar(false);

    this.content.removeAllListeners();

    this.onElementPointerDown = null;
    this.onElementPointerMove = null;
    this.onElementPointerUp = null;
    this.onElementPointerUpOutside = null;
    this.onElementPointerOver = null;
    this.onElementPointerOut = null;

    for (let i = this.points.length - 1; i >= 0; i--) {
      this.removeChild(this.points[i]);
    }
    this.points = null;
  }

  /**
   * Save current position of the element for future use
   * @param localPosition
   * @param data
   */
  freezeStartMoveData(localPosition, data) {
    this.frozedData = {
      eventData: data,
      position: {
        x: localPosition.x * this.scale.x,
        y: localPosition.y * this.scale.y,
      }
    }
  }
  /**
   * Get frozen data
   * @returns {null}
   */
  getFrozenData() {
    return this.frozedData;
  }

  move() {
    BaseSignals.moveObject.dispatch(this);
  }

  getState() {
    this.stateData.ID = this.id;
    this.stateData.x = this.x;
    this.stateData.y = this.y;
    this.stateData.scaleX = this.scale.x;
    this.stateData.scaleY = this.scale.y;
    this.stateData.label = this.titleText;
    this.stateData.url = this.url;
    this.stateData.isText = this.isText;
    this.stateData.isShowTool = this.isShowTool;
    this.stateData.isResizable = this.isResizable;
    this.stateData.category = this.category;
    this.stateData.type = this.type;
  }

  // eslint-disable-next-line
  onScalePointDown(e) {
    // abstract method
  }

  // eslint-disable-next-line class-methods-use-this
  onScalePointMove(e) {
    // abstract method
  }

  // eslint-disable-next-line class-methods-use-this
  onScalePointUp(e) {
    // abstract method
  }

  highlightElement(highlight = true) {
    this.titleLabel.tint = highlight ? COLOR_SELECTION : COLOR_LABEL_DEFAULT;
    this._highlighted = highlight;
  }

  setInteractiveChildren(interactive) {
    if (this._previousInteractiveChildrenState === null) {
      this._previousInteractiveChildrenState = this.interactiveChildren;
      this.interactiveChildren = interactive;
    }
  }

  revertInteractiveChildren() {
    if (this._previousInteractiveChildrenState !== null) {
      this.interactiveChildren = this._previousInteractiveChildrenState;
      this._previousInteractiveChildrenState = null;
    }
  }

  onAnalyticsDataReceived(data) {
    if (this.analyticsManager) {
      this.analyticsManager.setData(data);
    }
  }

  processAnalyticsData() {
    if (this.analyticsManager) {
      this.analyticsManager.process();
    }
  }

  getEndPoint() {
    let scale = window.app.viewport.scaled;
    return {
      width: (this.content.width * this.scale.x * scale),
      height: (this.content.height * this.scale.y * scale),
    };
  }

  get value() {
    return this.analyticsManager ? this.analyticsManager.data.hits : 0;
  }

  onSelected() {
    this.isSelected = true;
    if (!this.isFrameShowing) {
      this.shiftDisplayLabels();
    }
  }

  onDeselected() {
    this.isSelected = false;
    if (!this.isFrameShowing) {
      this.normalizeDisplayLabels();
    }
  }

  /**
   * Event handler fired when a foucs frame or highlight ( yellow ) frame is showing around the element
   * Focus frame is shown when People Who Performed tool is used to "focus" and element
   */
  onFrameShow() {
    this.isFrameShowing = true;
    if (!this.isSelected) {
      this.shiftDisplayLabels();
    }
  }

  /**
   * Event handler fired when a foucs frame or highlight ( yellow ) frame is removed from the element
   * Focus frame is shown when People Who Performed tool is used to "focus" and element
   */
  onFrameHide() {
    this.isFrameShowing = false;
    if (!this.isSelected) {
      this.normalizeDisplayLabels();
    }
  }

  shiftDisplayLabels() {
    this.footer.y = this.content.height + FOOTER_MARGIN;
    this.titleLabel.y = -TITLE_MARGIN - TITLE_MARGIN / 2;
    this.isTitleShifted = true;
  }

  normalizeDisplayLabels() {
    this.footer.y = this.content.height;
    this.titleLabel.y = -TITLE_MARGIN;
    this.isTitleShifted = false;
  }

  getCullingBounds() {
    this.getLocalBounds(this.cullingBounds);
    this.cullingBounds.x += this.x;
    this.cullingBounds.y += this.y;
    return this.cullingBounds;
  }

}
