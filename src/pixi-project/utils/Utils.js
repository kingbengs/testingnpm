export default new class Utils {
  // todo Consider removing
  // randomNumber(min, max) {
  //   return Math.random() * (max - min) + min;
  // }

  // getRandomInt(min, max) {
  //   return Math.round(this.randomNumber(min, max));
  // }
  //
  // // Converts from degrees to radians.
  // deg2rad(degrees) {
  //   return degrees * Math.PI / 180;
  // }
  //
  // // Converts from radians to degrees.
  rad2deg(radians) {
    return radians * 180 / Math.PI;
  }

  distanceAB(a, b) {
    let xs = b.x - a.x;
    let ys = b.y - a.y;
    return Math.sqrt(xs * xs + ys * ys);
  }

  getBoundingRect(points) {
    if (!points || !points.length) {
      throw Error(`Utils.getBoundingRect: empty or not an array input ${points}`);
    }
    let minX = points[0], minY = points[1], maxX = points[0], maxY = points[1];

    for (let i = 2; i < points.length; i += 2) {
      minX = Math.min(minX, points[i]);
      maxX = Math.max(maxX, points[i]);
      minY = Math.min(minY, points[i + 1]);
      maxY = Math.max(maxY, points[i + 1]);
    }

    return {
      left: minX,
      top: minY,
      width: maxX - minX,
      height: maxY - minY,
      get centerX() {
        return this.left + this.width / 2;
      },
      get centerY() {
        return this.top + this.height / 2;
      },
      get right() {
        return this.left + this.width;
      },
      get bottom() {
        return this.top + this.height;
      },
      get x() {
        return this.left;
      },
      get y() {
        return this.top;
      }
    };
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
    return this.getBoundingRect(selection);
  }

  _addGlobalCoordinates(target, x, y) {
    const coords = window.app.viewport.toGlobal({
      x: x,
      y: y,
    });
    target.push(...[coords.x, coords.y]);
  }

  angleAB(pointA, pointB) {
    return Math.atan2(pointB.y - pointA.y, pointB.x - pointA.x);
  }

  /**
     * Finds which point is higher and lower by Y axis between the two provided
     * @param point1
     * @param point2
     * @returns {{lower: *, higher: *}} The point that is higher (Y axis). Null in case of same Y
     */
  getHigherLowerPoint(point1, point2) {
    let higher = null;
    let lower = null;
    if (point1.y !== point2.y) {
      higher = point1;
      lower = point2;
      if (point1.y > point2.y) {
        higher = point2;
        lower = point1;
      }
    }
    return { higher, lower };
  }

  /**
   * Clamps a value between defined limit
   * @param {Number} value 
   * @param {Number} min 
   * @param {Number} max 
   * @returns 
   */
  clamp(value, min, max) {
    return Math.min(Math.max(value, Math.min(min, max)), Math.max(min, max));
  }

  /**
   * Normalization
   * It returns a number between 0 and 1 in the given range.
   * it can be above 1 and below 0 if the value is out of range.
   * Normalization is the oposite process of Linear Interpolation
   * @param {Number} value 
   * @param {Number} min 
   * @param {Number} max 
   * @returns 
   */
  normalize(value, min, max) {
    return (value - min) / (max - min);
  }

  /**
   * Linear Interpolation 
   * It takes a normalized value between 0 and 1 
   * and returns a value on the given range
   * https://en.wikipedia.org/wiki/Linear_interpolation
   * Linear Interpolation is the oposite process of Normalization
   * @param {*} norm 
   * @param {*} min 
   * @param {*} max 
   * @returns 
   */
  lerp(norm, min, max) {
    return (max - min) * norm + min;
  }

  /**
   * It takes a value , from a defined source range
   * and it translates it to a destination range
   * @param {Number} value 
   * @param {Number} sourceMin 
   * @param {Number} sourceMax 
   * @param {Number} destMin 
   * @param {Number} destMax 
   * @returns 
   */
  map(value, sourceMin, sourceMax, destMin, destMax) {
    return this.lerp(this.normalize(value, sourceMin, sourceMax), destMin, destMax);
  }

  /**
   * Checks if a given values is withing a given range ( inclusively )
   * @param {Number} value 
   * @param {Number} min 
   * @param {Number} max 
   * @returns 
   */
  inRange(value, min, max) {
    return value >= Math.min(min, max) && value <= Math.max(min, max);
  }

}();
