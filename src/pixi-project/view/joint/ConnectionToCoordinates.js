import * as PIXI from 'pixi.js';
import { DEFAULT_CONNECTION_LINE_WIDTH } from "pixi-project/view/joint/ConnectionContainer";
import ConnectionHelper from "pixi-project/view/joint/ConnectionHelper";
import { EStepConnectionPort } from "shared/CSharedCategories";
import Utils from "pixi-project/utils/Utils";
import Facade from 'pixi-project/Facade';
import { COLOR_CONNECTION_LINE } from 'pixi-project/view/Styles';

const ARROW_FRACTION = 0.95;
const ARROW_RELATIVE_VALUE = 2;

/**
 * Class to draw bezier curve from starting location to point where cursor is.
 * Destroyed when we either cancel the line or select the element where
 * the connection should end (in this case we switch to ConnectionContainer
 */
export default class ConnectionToCoordinates extends PIXI.Container {
  constructor(selected, targetX, targetY, port) {
    super();
    this.selected = selected;

    this.targetPoint = new PIXI.Point(targetX, targetY);

    this.port = port;
    this.head = null;

    this.graphics = new PIXI.Graphics();
    this.addChild(this.graphics);

    this.createHead();
    this.updateHeads();

    this.draw();
  }

  draw() {
    this.graphics.lineStyle(DEFAULT_CONNECTION_LINE_WIDTH, COLOR_CONNECTION_LINE);

    const pointData = this._getNearestControlPoint();
    const point = pointData.localPoint;
    this.graphics.moveTo(point.x, point.y);

    const controlPoint1 = this.calculateControlFirst(point);
    const controlPoint2 = this.calculateControlSecond(point);

    this.graphics.bezierCurveTo(
      controlPoint1.x, controlPoint1.y,
      controlPoint2.x, controlPoint2.y,
      this.targetPoint.x, this.targetPoint.y,
    );
  }

  createHead() {
    this.head = new PIXI.Graphics();
    const { width, color } = this._getLineStyle();
    this.head.lineStyle(width, color);
    this.head.visible = true;

    this._createHeadHalf(this.head, width, color, 45, 0, 0);
    this._createHeadHalf(this.head, width, color, -45, 0, 0);
    this.addChild(this.head);
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
    // line.beginFill(color);
    // line.drawRect(0, 0, 4, 12, 7);
    line.lineStyle(width, color);
    line.moveTo(0, 0);
    line.lineTo(0, 12);
    line.angle = angle;
    line.x = x;
    line.y = y;
    parent.addChild(line);
    return line;
  }

  /**
   * Returns the style of the line depending on the current line type
   * @returns {{color: number, width: number}}
   * @private
   */
  _getLineStyle() {
    // todo extract to object
    let width = DEFAULT_CONNECTION_LINE_WIDTH;
    let color = COLOR_CONNECTION_LINE;

    return { width, color };
  }

  updateHeads() {
    if (this.port === EStepConnectionPort.OUT) {
      this.head.x = this.targetPoint.x
      this.head.y = this.targetPoint.y;
      this.head.angle = this._getAngle();
    } else {
      const pointData = this._getNearestControlPoint();
      const point = pointData.localPoint;
      this.head.x = point.x;
      this.head.y = point.y;
      this.head.angle = ConnectionHelper.GetAngleForHead(pointData.controlPoint) - 90;
    }
  }

  _getAngle() {
    const pointData = this._getNearestControlPoint();
    const localPoint = pointData.localPoint;
    const controlPoint1 = this.calculateControlFirst(localPoint);
    const controlPoint2 = this.calculateControlSecond(localPoint);

    const point = ConnectionHelper.GetBezierPoint(
      localPoint, controlPoint1, controlPoint2,
      this.targetPoint,
      ARROW_FRACTION);

    const subX = this.targetPoint.x - point.x;
    const subY = this.targetPoint.y - point.y;

    let angle;
    if (Math.abs(subX / subY) > ARROW_RELATIVE_VALUE) {
      // arrow points to right
      angle = (subX > 0) ? -270 : -90;
    } else if (Math.abs(subY / subX) > ARROW_RELATIVE_VALUE) {
      // arrow points to bot
      angle = (subY > 0) ? -180 : 0;
    } else {
      angle = (this.targetPoint.y > point.y) ? -180 : 0;
    }

    return angle;
  }

  calculateControlFirst(point) {
    // todo Create a utility methods
    const distX = (this.targetPoint.x - point.x);
    const shift = distX / 1.8;
    return {
      x: point.x + shift,
      y: point.y,
    };
  }

  calculateControlSecond(point) {
    const distX = (this.targetPoint.x - point.x);
    const shift = distX / 1.8;
    return {
      x: this.targetPoint.x - shift,
      y: this.targetPoint.y,
    };
  }

  update(targetX, targetY) {
    this.targetPoint.set(targetX, targetY);
    this.graphics.clear();
    this.draw();
    this.updateHeads();
  }

  onDestroy() {
    this.removeChild(this.head);
  }

  _getNearestControlPoint() {
    const selPoints = this.selected.points;

    // todo Refactor ConnCont nearest point to the same interface
    let localPoint, minDist = 100000, nearestLocalPoint, nearestControlPoint, curDist;
    let i = 0;
    do {
      localPoint = Facade.viewport.toLocal(selPoints[i], this.selected);
      curDist = Utils.distanceAB(localPoint, this.targetPoint);
      if (curDist < minDist) {
        minDist = curDist;
        nearestControlPoint = selPoints[i];
        nearestLocalPoint = localPoint;
      }
      i++;
    } while (i < selPoints.length);

    return {
      controlPoint: nearestControlPoint,
      distance: minDist,
      localPoint: nearestLocalPoint,
    }
  }
  
}
