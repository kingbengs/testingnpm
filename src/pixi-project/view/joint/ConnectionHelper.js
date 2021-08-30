import { CControlPointTypes } from 'pixi-project/base/containers/CContainerConstants';
import Utils from "pixi-project/utils/Utils";

const DEFAULT_PENETRATION_WIDTH = 12;
const DEFAULT_PENETRATION_HEIGHT = 23;
const NON_SIMETRY_ANOMALY_PADDING = 3;

export default class ConnectionHelper {
  static GetAngleForHead(gr) {
    switch (gr.type) {
      case CControlPointTypes.TOP:
        return -90;
      case CControlPointTypes.BOTTOM:
        return 90;
      case CControlPointTypes.RIGHT:
        return 0;
      case CControlPointTypes.LEFT:
        return -180;
      default:
        throw Error(`[ConnectionHelper.GetAngleForHead] Incorrect parameters ${gr.type}`);
    }
  }

  static ShiftCoordinates(point, controlPoint) {
    switch (controlPoint.type) {
      case CControlPointTypes.TOP:
        point.y = point.y + DEFAULT_PENETRATION_HEIGHT;
        break;
      case CControlPointTypes.BOTTOM:
        point.y = point.y - DEFAULT_PENETRATION_HEIGHT;
        break;
      case CControlPointTypes.RIGHT:
        point.x = point.x - DEFAULT_PENETRATION_WIDTH;
        break;
      case CControlPointTypes.LEFT:
        point.x = point.x + DEFAULT_PENETRATION_WIDTH + NON_SIMETRY_ANOMALY_PADDING;
        break;
      default:
        throw Error(`[ConnectionHelper.ShiftCoordinates] Incorrect parameters ${controlPoint.type}`);
    }

    return point;
  }

  static CalculateShift(type, pointA, pointB) {
    let shiftX = 0, shiftY = 0;
    if (type === CControlPointTypes.LEFT || type === CControlPointTypes.RIGHT) {
      shiftX = (pointB.x - pointA.x) / 2.2;
    }
    if (type === CControlPointTypes.TOP || type === CControlPointTypes.BOTTOM) {
      shiftY = (pointB.y - pointA.y) / 2.2;
    }
    return { shiftX, shiftY };
  }

  /**
   *
   * @param p0 Starting point (x or y)
   * @param p1 Control point 1 (x or y)
   * @param p2 Control point 2 (x or y)
   * @param p3 End point (x or y)
   * @param distance Fraction (from 0 to 1) of the full length of the curve
   * @returns {number} Coordinate (x or y) of the point on specified distance from the start
   */
  static CalculateBezierPoint(p0, p1, p2, p3, distance) {
    const t = distance;
    return ((1 - t) ** 3) * p0
      + 3 * ((1 - t) ** 2) * t * p1
      + 3 * (1 - t) * t * t * p2
      + (t ** 3) * p3;
  }

  /**
   * Returns the point on a curve for a given fraction [0, 1] on it
   * @param pointA
   * @param controlPointA
   * @param controlPointB
   * @param pointB
   * @param fraction [0, 1]
   * @returns {{x: number, y: number}}
   * @constructor
   */
  static GetBezierPoint(pointA, controlPointA, controlPointB, pointB, fraction) {
    return {
      x: ConnectionHelper.CalculateBezierPoint(
        pointA.x,
        controlPointA.x,
        controlPointB.x,
        pointB.x,
        fraction,
      ),
      y: ConnectionHelper.CalculateBezierPoint(
        pointA.y,
        controlPointA.y,
        controlPointB.y,
        pointB.y,
        fraction,
      ),
    }
  }

  // noinspection JSUnusedGlobalSymbols
  /**
   * Returns the point on a straight line for a given fraction [0, 1] on it
   * @param pointA
   * @param pointB
   * @param fraction
   * @returns {{x: *, y: *}}
   * @constructor
   */
  static GetLinePoint(pointA, pointB, fraction) {
    let x, y;
    x = pointA.x + fraction * (pointB.x - pointA.x);
    y = pointA.y + fraction * (pointB.y - pointA.y);
    return { x, y };
  }

  /**
   * Calculates the length of a Bezier Curve
   * @param {Point} pointA 
   * @param {Point} controlPointA 
   * @param {Point} controlPointB 
   * @param {Point} pointB 
   * @returns Integer
   */
  static GetLength(pointA, controlPointA, controlPointB, pointB) {
    let startPoint, endPoint;
    const step = 0.01;
    let length = 0;
    for (let i = 0; i < 1; i += step) {
      startPoint = ConnectionHelper.GetBezierPoint(
        pointA, controlPointA, controlPointB, pointB,
        i,
      );

      endPoint = ConnectionHelper.GetBezierPoint(
        pointA, controlPointA, controlPointB, pointB,
        i + step,
      );

      length += Utils.distanceAB(startPoint, endPoint);
    }

    return length;
  }

  static GetNearestPointsBetween(iconA, iconB, localLayer) {
    const iconAPoints = iconA.points;
    const iconBPoints = iconB.points;
    let  grA, grB;
    let dist = 999999;
    const points = { A: null, B: null };

    for (let i = 0; i < iconAPoints.length; i++) {
      let pointA = localLayer.toLocal(iconAPoints[i].position, iconA);
      for (let j = 0; j < iconBPoints.length; j++) {
        let pointB = localLayer.toLocal(iconBPoints[j].position, iconB);
        let tDist = Utils.distanceAB(pointA, pointB);
        if (tDist < dist) {
          dist = tDist;
          grA = iconAPoints[i];
          grB = iconBPoints[j];
          points.A = pointA;
          points.B = pointB;
        }
      }
    }

    return { points, pointA: grA, pointB: grB };
  }

  static CalculateControlFirst(pointA, pointB, type) {
    const { shiftX, shiftY } = ConnectionHelper.CalculateShift(type, pointA, pointB);
    return {
      x: pointA.x + shiftX,
      y: pointA.y + shiftY,
    };
  }

  static CalculateControlSecond(pointA, pointB, type) {
    const { shiftX, shiftY } = ConnectionHelper.CalculateShift(type, pointA, pointB);
    return {
      x: pointB.x - shiftX,
      y: pointB.y - shiftY,
    };
  }

}
