import * as PIXI from 'pixi.js';
import { EElementCategories, EElementTypes, EStepConnectionPort } from 'shared/CSharedCategories';
import BaseContainer from "pixi-project/base/containers/BaseContainer";
import BaseSignals from "pixi-project/base/signals/BaseSignals";
import Utils from "pixi-project/utils/Utils";
import generateId from "pixi-project/utils/IDGenerator";
import Facade from 'pixi-project/Facade';
import ConnectionHelper from "pixi-project/view/joint/ConnectionHelper";
import {
  EConnectionCentered,
  EConnectionLineType,
  EConnectionDrawLineType,
  EConnectionType
} from "pixi-project/base/joint/CConnectionConstants";
import SharedElementHelpers from "shared/SharedElementHelpers";
import MainStorage from "pixi-project/core/MainStorage";
import AnalyticsConnectionManager from "pixi-project/core/AnalyticsConnectionManager";
import { COLOR_CONNECTION_LINE } from 'pixi-project/view/Styles';
import AppSignals from 'pixi-project/signals/AppSignals';

export const DEFAULT_CONNECTION_LINE_WIDTH = 2;
export const DEFAULT_HIT_AREA_SHIFT = 20;
const DEFAULT_DOTTED_DOT_FRACTION = 0.02;
const DEFAULT_DOTTED_EMPTY_FRACTION = 0.03;
const DEFAULT_DOTTED_LENGTH = 300;
const MIDDLE_MAX_OFFSET_X = 30;
const MIDDLE_OFFSET_Y = 30;
const CATCH_DIFFERENCE = 130;
const DEFAULT_HIT_AREA_STEP = 0.2;
const ITERATOR_INCREMENT = 0.001;
const SETTINGS_OFFSET = 60;
const DELETE_OFFSET = 30;
const TEXTURE_NAME_NO_DATA = 'no-data.png';
const TEXTURE_NAME_SETTINGS = 'settings.svg';
const TEXTURE_NAME_DELETE = 'delete.svg';

// Delegates:
// - onConnectionDeleteBtn(connection)
// - onConnectionSettingsBtn(connection)
// - onConnectionPointerDown(event,connection)
// - onConnectionPointerOut(event,connection)

export default class ConnectionContainer extends BaseContainer {
  constructor(elementA, elementB, id = generateId(), loadData = null) {
    super();

    this.category = EElementCategories.CONNECTION;
    this.id = id;
    this.pointA = new PIXI.Point();
    this.pointB = new PIXI.Point();
    this.iconA = elementA;
    this.iconB = elementB;
    this._selectable = true;
    this.type = EElementTypes.NONE;
    this.connectionTypeSource = EStepConnectionPort.IN;
    this.drawToCenter = EConnectionCentered.NONE;
    this.arrowHeadShown = EConnectionCentered.NONE;
    this.delegate = null;

    if (loadData && loadData.drawLineType) {
      this.drawLineType = loadData.drawLineType;
    } else {
      this.drawLineType = EConnectionDrawLineType.BEZIER;
    }

    if (this.canToogleType()) {

      if (loadData && loadData.lineType) {
        // This is new data format for connections , that stores lineType on serverside.
        this.lineType = loadData.lineType;
      } else if (loadData && loadData.ignoreInBetween) {
        // This is a support for old connections (Stored on serverside before the new format)
        this.lineType = EConnectionLineType.DOTTED;
      } else {
        this.lineType = EConnectionLineType.SOLID;
      }

    } else {
      this.lineType = EConnectionLineType.NODATA;
    }

    const isSourceToAction = (SharedElementHelpers.IsSource(elementA) && SharedElementHelpers.IsAction(elementB))
      || (SharedElementHelpers.IsAction(elementA) && SharedElementHelpers.IsSource(elementB));
    const isActionToAction = SharedElementHelpers.IsAction(elementA) && SharedElementHelpers.IsAction(elementB);
    const isSourceToSource = SharedElementHelpers.IsSource(elementA) && SharedElementHelpers.IsSource(elementB);

    if (isSourceToAction || isActionToAction || isSourceToSource) {
      this.supportedLineTypes = [
        EConnectionLineType.DOTTED,
        EConnectionLineType.NODATA
      ];
      this.lineType = EConnectionLineType.DOTTED;
    }  else if (!this.canToogleType()){
      this.supportedLineTypes = [
        EConnectionLineType.NODATA
      ];
    } else {
      this.supportedLineTypes = [
        EConnectionLineType.SOLID,
        EConnectionLineType.DOTTED,
        EConnectionLineType.NODATA
      ];
    }

    this.graphics = new PIXI.Graphics();
    this.graphics.interactive = this._selectable;
    this.addChild(this.graphics);

    this.noDataIcon = PIXI.Sprite.from(TEXTURE_NAME_NO_DATA);
    this.noDataIcon.scale.set(0.4);
    this.noDataIcon.anchor.set(0.5, 0.5);
    this.noDataIcon.visible = this.isNoDataLine();
    this.addChild(this.noDataIcon);

    this.footer.canHaveValue = true;
    this.footer.delegate = this;
    this.footer.cacheBiggestBounds = true;
    this.footer.bringToFront();
    this.analyticsManager = new AnalyticsConnectionManager(this, this.footer);

    this.updateFooter();
    this.createButtons();
  }

  init(connectionType) {
    // todo make connection type EConnectionType
    this.connectionTypeSource = connectionType;

    this.drawHeadA();
    this.drawHeadB();

    this.attach();
    this.draw();
  }

  /**
   * Create a settings and delete buttons on a connection
   */
  createButtons() {
    this.settingsButton = this._createConnectionButton(TEXTURE_NAME_SETTINGS);
    this.deleteButton = this._createConnectionButton(TEXTURE_NAME_DELETE);
  }

  draw(update = false) {
    this.updatePoints();
    this.calculateControlPoints();
    this.drawAppropriateLine();

    const offset = this._getOffsetForPosition();
    const point = this.getConnectionPoint(0.5);

    this.footer.position.set(point.x + offset.x, point.y + offset.y);
    this.footer.updateVisibility(MainStorage.getTogglePanelStatus().numbers);

    this.headA.x = this.pointA.x;
    this.headA.y = this.pointA.y;
    this.headB.x = this.pointB.x;
    this.headB.y = this.pointB.y;
    this.headA.angle = ConnectionHelper.GetAngleForHead(this.nearestPoints.pointA) - 90;

    if (this.drawLineType === EConnectionDrawLineType.STRAIGHT){
      const radians = Utils.angleAB(this.pointA, this.pointB);
      this.headB.angle = Utils.rad2deg(radians) + 90;
    } else {
      this.headB.angle = ConnectionHelper.GetAngleForHead(this.nearestPoints.pointB) - 90;
    }

    this.noDataIcon.position.set(point.x, point.y);

    this.visible = Utils.distanceAB(this.iconA, this.iconB) >= 100;
    this.positionButtons();
  }

  updateHeadsVisibility() {
    if (this.isDependentConnection()) {
      if (SharedElementHelpers.IsAction(this.iconB)) {
        this.headB.visible = false;
      } else {
        this.headB.visible = true;
      }
    } else {
      this.headA.visible = (this.arrowHeadShown === EConnectionCentered.A);
      this.headB.visible = (this.arrowHeadShown === EConnectionCentered.B);
    }
  }

  /**
   * Draw the line according to the lineType parameter
   */
  drawAppropriateLine() {
    const { width, color } = this._getLineStyle();
    this.graphics.lineStyle(width, color);

    if (this.lineType === EConnectionLineType.SOLID
      || this.lineType === EConnectionLineType.NODATA) {

      if (this.drawLineType === EConnectionDrawLineType.STRAIGHT){
        this.drawLine(this.pointA, this.pointB);
      } else {
        this.drawBezier(this.pointA, this.controlPointA, this.controlPointB, this.pointB);
      } 

    } else {
      this.drawDottedLine();
    }

    if (this._selectable) {
      this._setHitArea();
    }
  }

  drawDottedLine() {
    let fraction = 0;

    // We calculate the length of the bezier curve and set
    // the length of each dash approximately the same
    const length = ConnectionHelper.GetLength(this.pointA, this.controlPointA, this.controlPointB, this.pointB);
    const dottedFraction = DEFAULT_DOTTED_DOT_FRACTION * (DEFAULT_DOTTED_LENGTH / length);
    const emptyFraction = DEFAULT_DOTTED_EMPTY_FRACTION * (DEFAULT_DOTTED_LENGTH / length);

    while (fraction < 1) {
      // Calculate the start of the dash
      // const dottedStartPoint = ConnectionHelper.GetLinePoint(this.pointA, this.pointB, fraction);
      const dottedStartPoint = this.getConnectionPoint(fraction);

      // Set the end fraction of the dash
      fraction += dottedFraction;
      // Fix for the case when we go above '1' fraction. We use '1' instead
      if (fraction > 1) {
        fraction = 1;
      }
      // Calculate the end of the dash
      // const dottedFinishPoint = ConnectionHelper.GetLinePoint(this.pointA, this.pointB, fraction);
      const dottedFinishPoint = this.getConnectionPoint(fraction);

      this.drawLine(dottedStartPoint, dottedFinishPoint);

      fraction += emptyFraction;
    }
  }

  drawLine(pointA, pointB) {
    this.graphics.moveTo(pointA.x, pointA.y);
    this.graphics.lineTo(pointB.x, pointB.y);
  }

  drawBezier(pointA, controlPointA, controlPointB, pointB) {
    this.graphics.moveTo(pointA.x, pointA.y);
    this.graphics.bezierCurveTo(
      controlPointA.x, controlPointA.y,
      controlPointB.x, controlPointB.y,
      pointB.x, pointB.y,
    );
  }

  /**
  * Recalculate and redraw the line
  * @param redrawOnly - defines if we need to recalculate curve control points, nearest points etc
  */
  update(redrawOnly = false) {
    this.graphics.clear();
    if (redrawOnly) {
      this.drawAppropriateLine();
    } else {
      this.draw(true);
    }
  }

  /**
   * Changes drawing points of the connection. For normal case - two closest control points.
   * In case of dependant action - we draw deeper into the element so it would look
   * like one solid line
   */
  updatePoints() {
    this.nearestPoints = ConnectionHelper.GetNearestPointsBetween(this.iconA, this.iconB, Facade.viewport);

    switch (this.drawToCenter) {
      case EConnectionCentered.NONE:
        this.pointA = this.nearestPoints.points.A;
        this.pointB = this.nearestPoints.points.B;
        break;
      case EConnectionCentered.A:
        this.pointA = ConnectionHelper.ShiftCoordinates(this.nearestPoints.points.A, this.nearestPoints.pointA);
        this.pointB = this.nearestPoints.points.B;
        break;
      case EConnectionCentered.B:
        this.pointA = this.nearestPoints.points.A;
        this.pointB = ConnectionHelper.ShiftCoordinates(this.nearestPoints.points.B, this.nearestPoints.pointB);
        break;
      default:
        throw Error(`[ConnectionContainer.updatePoints] Wrong type of parameter ${this.drawToCenter}`);
    }
  }

  calculateControlPoints() {
    this.controlPointA = ConnectionHelper.CalculateControlFirst(this.pointA, this.pointB, this.nearestPoints.pointA.type);
    this.controlPointB = ConnectionHelper.CalculateControlSecond(this.pointA, this.pointB, this.nearestPoints.pointB.type);
  }

  createHead() {
    let head = new PIXI.Graphics();
    const { width, color } = this._getLineStyle();
    head.lineStyle(width, color);
    this._createHeadHalf(head, width, color, 45, 0, -1);
    this._createHeadHalf(head, width, color, -45, -2.5, 1.7);
    this.addChild(head);
    head.visible = false;
    return head;
  }

  drawHeadA() {
    this.headA = this.createHead();
  }

  drawHeadB() {
    this.headB = this.createHead();
  }

  showHeadA() {
    this.headA.visible = true;
    this.arrowHeadShown = EConnectionCentered.A;
    this.updateHeadsVisibility();
  }

  showHeadB() {
    this.headB.visible = true;
    this.arrowHeadShown = EConnectionCentered.B;
    this.updateHeadsVisibility();
  }

  activateHeadA() {
    this.arrowHeadShown = EConnectionCentered.A;
    this._registerCorrectHeadDirections(EConnectionType.INCOMING, EConnectionType.OUTGOING);
    this.updateHeadsVisibility();
  }

  activateHeadB() {
    this.arrowHeadShown = EConnectionCentered.B;
    this._registerCorrectHeadDirections(EConnectionType.OUTGOING, EConnectionType.INCOMING);
    this.updateHeadsVisibility();
  }

  /**
   * Register the connection to directions specified
   * @param directionA
   * @param directionB
   * @private
   */
  _registerCorrectHeadDirections(directionA, directionB) {
    if (SharedElementHelpers.IsAction(this.iconA)) {
      this.iconA.registerConnection(directionA, this);
    }

    if (SharedElementHelpers.IsAction(this.iconB)) {
      this.iconB.registerConnection(directionB, this);
    }
  }

  /**
   * Returns offset in cases when our curve is more vertical that horizontal
   * @returns {{x: number, y: *}}
   * @private
   */
  _getOffsetForPosition() {
    const offset = { x: 0, y: MIDDLE_OFFSET_Y };
    const diffX = Math.abs(this.pointA.x - this.pointB.x);
    if (diffX < CATCH_DIFFERENCE) {
      offset.x = Math.max(
        -MIDDLE_MAX_OFFSET_X,
        -MIDDLE_MAX_OFFSET_X * (MIDDLE_MAX_OFFSET_X / diffX),
      );

      const { higher, lower } = Utils.getHigherLowerPoint(this.pointA, this.pointB);
      if (lower && (lower.x < higher.x)) {
        offset.x = -offset.x;
      }
    }

    return offset;
  }

  setLineType(type) {
    this.lineType = type;
    this.updateFooter();
    this.noDataIcon.visible = this.isNoDataLine();
    this.update();
    this.analyticsManager.setData(null);

    window.app.needsRendering();
  }

  setDrawLineType(type) {
    this.drawLineType = type;
    this.updateFooter();
    this.noDataIcon.visible = this.isNoDataLine();
    this.update();
    
    window.app.needsRendering();
  }

  /**
   * Returns the other side of the element
   * @param element {BaseContainer}
   */
  getOtherSide(element) {
    const isAEnd = element.id === this.iconA.id;
    const isBEnd = element.id === this.iconB.id;
    let result = null;

    if (isAEnd) {
      result = this.iconB;
    }

    if (isBEnd) {
      result = this.iconA;
    }

    return result;
  }

  /**
   * Draw half of a head
   * @param parent
   * @param width
   * @param color
   * @param angle
   * @param x
   * @param y
   * @returns {PIXI.Graphics}
   * @private
   */
  _createHeadHalf(parent, width, color, angle, x, y) {
    const line = new PIXI.Graphics();
    line.beginFill(color);
    line.drawRoundedRect(0, 0, 4, 12, 7);
    line.angle = angle;
    line.x = x;
    line.y = y;
    parent.addChild(line);
    return line;
  }

  /**
   * Show and hide the settings and delete button
   * @param show
   */
  showButtons(show = true) {
    this.settingsButton.visible = show;
    this.deleteButton.visible = show;
  }

  _createConnectionButton(path) {
    const image = PIXI.Loader.shared.resources[path].texture;
    const button = new PIXI.Sprite(image);
    button.anchor.set(0.5);
    button.scale.set(0.4);
    button.interactive = true;
    button.buttonMode = true;
    button.visible = false;
    this.addChild(button);
    return button;
  }

  /**
   * Returns the data that should be send to react when showing a toolbar
   * @returns {{show: *, stepId: *, position: {x: number, y: number}, category: string}}
   * @private
   */
  _getToolbarData(show) {
    let detail = super._getToolbarData(show);
    detail.isTextShape = SharedElementHelpers.IsTextOrShapeElements(this.iconB);
    return detail;
  }

  /**
   * Sets a point from which we position the toolbar for an element
   */
  setToolbarPositionPoint() {
    this.positionPoint = this.settingsButton;
  }

  getConnectionPoint(fraction) {
    if (this.drawLineType === EConnectionDrawLineType.STRAIGHT) {
      return ConnectionHelper.GetLinePoint(this.pointA, this.pointB, fraction);
    } else {
      return ConnectionHelper.GetBezierPoint(
        this.pointA,
        this.controlPointA,
        this.controlPointB,
        this.pointB,
        fraction
      );
    }
  }

  /**
   * Put buttons at fixed offset from the start of the connection
   * @returns {{settings: {x: number, y: number}, delete: {x: number, y: number}}}
   * @private
   */
  _getButtonPositions() {
    let delPos, setPos;
    let curFraction = 0;
    let point0 = this.pointA, point1;
    let curLength = 0;

    do {
      curFraction += ITERATOR_INCREMENT;
      // Get approximate length of an increment
      point1 = this.getConnectionPoint(curFraction);
      curLength += Utils.distanceAB(point0, point1)

      // As soon as we know position of Delete button - we save it
      if (!delPos && (curLength > DELETE_OFFSET)) {
        delPos = point1;
      }

      point0 = point1;
    } while (curLength < SETTINGS_OFFSET);

    // Save the settings position
    setPos = point1;

    return {
      delete: delPos,
      settings: setPos
    }
  }

  positionButtons() {
    const positions = this._getButtonPositions();
    this.settingsButton.position = new PIXI.Point(positions.settings.x, positions.settings.y);
    this.deleteButton.position = new PIXI.Point(positions.delete.x, positions.delete.y);
    this.setToolbarPositionPoint();
  }

  /**
   * Sets hit area around the connection
   * @private
   */
  _setHitArea() {
    // todo [optimize] Update hit area only when dragging of element was done - no need to recalculate ti
    // To make sure our hit area box is nice and surrounds the connection curve we create
    // two parallel approximated curves besides the main one by introducing shifts for X and Y
    // coordinates.

    // We're adding Y shift pretty easily, But then there are several possible
    // cases for calculating X. So we calculate shifts for the case when source is to the
    // right and above the target. And in other cases simply switch "polarity"
    const curve1 = [], curve2 = [];

    // Create parallel approximated curves
    let fraction = 0;
    while (fraction <= 1) {
      fraction = (fraction > 1) ? 1 : fraction;
      const point = ConnectionHelper.GetBezierPoint(
        this.pointA, this.controlPointA, this.controlPointB, this.pointB,
        fraction,
      );

      let xShift = DEFAULT_HIT_AREA_SHIFT;
      // In case our source point is to the left of the end point we need to reduce the
      // X coordinate of the hitArea curve that have bigger Y (having a bigger Y means that
      // it is lower one) in order to have a nice hitArea box
      if (this.iconA.x < this.iconB.x) {
        xShift = -xShift;
      }

      // In case our source is lower that the target.
      // Important! Do not unite this condition with the previous one - there are
      // cases when both should work at the same time
      if (this.iconA.y > this.iconB.y) {
        xShift = -xShift;
      }
      curve1.push(point.x + xShift);
      curve1.push(point.y + DEFAULT_HIT_AREA_SHIFT);
      curve2.push(point.x - xShift);
      curve2.push(point.y - DEFAULT_HIT_AREA_SHIFT);
      fraction += DEFAULT_HIT_AREA_STEP;
    }

    // Create a polygon from two curves. To do it
    // we add the second curve in reverse order to the first
    for (let i = (curve2.length - 1); i >= 0; i -= 2) {
      curve1.push(curve2[i - 1]); curve1.push(curve2[i]);
    }

    // console.log('curve merged ');
    // for (let i = 0; i < curve1.length; i += 2) {
    //   console.log(curve1[i], curve1[i+1]);
    // }

    // DEBUG functionality: Draw hit area box
    // this.graphics.moveTo(curve1[0], curve1[1]);
    // for (let i = 2; i < curve1.length; i += 2) {
    //   this.graphics.lineTo(curve1[i], curve1[i+1]);
    // }
    // this.graphics.lineTo(curve1[0], curve1[1]);

    this.graphics.hitArea = new PIXI.Polygon(curve1);
  }

  canToogleType() {
    if (
      SharedElementHelpers.IsTextOrShapeElements(this.iconA) ||
      SharedElementHelpers.IsTextOrShapeElements(this.iconB) ||
      SharedElementHelpers.IsMisc(this.iconA) ||
      SharedElementHelpers.IsMisc(this.iconB)
    ) {
      return false;
    }
    return true;
  }

  updateFooter() {
    if (this.isNoDataLine()) {
      this.footer.canHaveValue = false;
      this.footer.visible = false;
    } else {
      this.footer.canHaveValue = true;
      this.footer.updateVisibility(MainStorage.getTogglePanelStatus().numbers);
    }
  }

  // TODO , verify if this is the correct check , as the lines above also claims to calculate the same
  isDependentConnection() {
    return !(this.drawToCenter === EConnectionCentered.NONE);
  }

  isNoDataLine() {
    return this.lineType === EConnectionLineType.NODATA;
  }

  /**
  * Returns the style of the line depending on the current line type
  * @returns {{color: number, width: number}}
  * @private
  */
  _getLineStyle() {
    return { width: DEFAULT_CONNECTION_LINE_WIDTH, color: COLOR_CONNECTION_LINE };
  }

  getState() {
    const data = {};

    data.ID = this.id;
    data.iconA_ID = this.iconA.id;
    data.iconB_ID = this.iconB.id;

    data.headAVisible = this.headA.visible;
    data.headAAngle = this.headA.angle;
    data.headBVisible = this.headB.visible;
    data.headBAngle = this.headB.angle;
    data.lineType = this.lineType;
    data.drawLineType = this.drawLineType;

    if (this.lineType === EConnectionLineType.DOTTED) {
      data.ignoreInBetween = true;
    }

    return data;
  }

  /////////////////////////////////////////////////////////////////////
  //////////////////////// EVENT HANDLERS

  /**
   * Notifies if the elements that are connection by this connection
   * is part of the Dependant action chain
   */
  onUpdateDependentActionStatus(element, status) {
    // If status is set to "Not a connection to a dependant action" -
    // draw as usual
    if (!status) {
      this.drawToCenter = EConnectionCentered.NONE;
    } else {
      // In case we are connected to a dependant action - use updated coordinates
      if (element.id === this.iconA.id) {
        this.drawToCenter = EConnectionCentered.A;
      } else if (element.id === this.iconB.id) {
        this.drawToCenter = EConnectionCentered.B;
      } else {
        throw Error(`[ConnectionContainer.onUpdateDependentActionStatus] Wrong dependant action status update!`)
      }
    }

    if (this.isDependentConnection()) {
      this.removeChild(this.footer);
    } else {
      this.addChild(this.footer);
    }

    this.update();
    this.updateHeadsVisibility();
  }

  onFooterHoverIn(e, footer) {
    this.analyticsManager.onPointerOver(e);
  }

  onFooterHoverOut(e, footer) {
    this.analyticsManager.onPointerOut(e);
  }

  /**
   * Send event to delete a connection
   */
  onDeleteClick(e) {
    if (this.delegate && this.delegate.onConnectionDeleteBtn) {
      this.delegate.onConnectionDeleteBtn(this);
    }
    e.stopPropagation();
  }

  onSettingsClick(e) {
    if (this.delegate && this.delegate.onConnectionSettingsBtn) {
      this.delegate.onConnectionSettingsBtn(this);
    }
    e.stopPropagation();
  }

  onPointerOver(e) {
    this.showButtons(true);
    this.analyticsManager.onPointerOver(e);
    window.app.needsRendering();
  }

  onPointerOut(e) {
    if (this.delegate && this.delegate.onConnectionPointerOut) {
      this.delegate.onConnectionPointerOut(e, this);
    }
  }

  onPointerDown(e) {
    if (this.delegate && this.delegate.onConnectionPointerDown) {
      this.delegate.onConnectionPointerDown(e, this);
    }
  }

  onPointerUp(e) {
    if (this.delegate && this.delegate.onConnectionPointerUp) {
      this.delegate.onConnectionPointerUp(e, this);
    }
  }

  onMoveObject(data) {
    if (data === this.iconA || data === this.iconB) {
      this.update();
      AppSignals.connectionMoved.dispatch(this);
    }
  }

  onDestroy() {
    this.detach();

    this.removeChild(this.settingsButton);
    this.removeChild(this.deleteButton);
    this.removeChild(this.headB);
    this.removeChild(this.headA);
    this.iconA = null;
    this.iconB = null;

    this.sendPositionForToolbar(false);
    this.destroy();
  }

  detach() {
    this.graphics.removeAllListeners();
    this.settingsButton.removeAllListeners();
    this.deleteButton.removeAllListeners();
    BaseSignals.moveObject.remove(this.onMoveObject, this);

    if (SharedElementHelpers.IsStep(this.iconA)) {
      this.iconA.unregisterConnection(this);
    }

    if (SharedElementHelpers.IsStep(this.iconB)) {
      this.iconB.unregisterConnection(this);
    }
  }

  attach() {
    if (this._selectable) {
      this.graphics
        .on('pointerdown', this.onPointerDown.bind(this))
        .on('pointerup', this.onPointerUp.bind(this))
        .on('pointerover', this.onPointerOver.bind(this))
        .on('pointerout', this.onPointerOut.bind(this));
    }

    this.settingsButton.on('pointerdown', (e) => { e.stopPropagation(); });
    this.settingsButton.on('pointerup', this.onSettingsClick.bind(this));

    this.deleteButton.on('pointerdown', (e) => { e.stopPropagation(); });
    this.deleteButton.on('pointerup', this.onDeleteClick.bind(this));

    BaseSignals.moveObject.add(this.onMoveObject, this);

    if (this.connectionTypeSource && (this.connectionTypeSource === 'in')) {
      this.activateHeadA();
    } else {
      this.activateHeadB();
    }
  }

}
