import * as PIXI from "pixi.js"
import TextInput from 'pixi-text-input';
import Utils from "pixi-project/utils/Utils";

/**
 * Overwrite in order to get the calculations work right 
 * TODO it will be removed in future when the text tool is reworked
 */
TextInput.prototype._updateSurrogate = function () {
    let inputText = this;
    let padding = inputText._deriveSurrogatePadding();
    // let input_bounds = inputText._getDOMInputBounds(); // This line is a remainder of the change.
    let input_bounds = inputText._surrogate.getLocalBounds();

    inputText._surrogate.style = inputText._deriveSurrogateStyle();
    inputText._surrogate.style.padding = Math.max.apply(Math, padding);
    inputText._surrogate.y = inputText._multiline ? padding[0] : (input_bounds.height - inputText._surrogate.height) / 2;
    inputText._surrogate.x = padding[3];
    inputText._surrogate.text = inputText._deriveSurrogateText();

    switch (inputText._surrogate.style.align) {
        case 'left':
            inputText._surrogate.x = padding[3];
            break;
        case 'center':
            inputText._surrogate.x = input_bounds.width * 0.5 - inputText._surrogate.width * 0.5;
            break;
        case 'right':
            inputText._surrogate.x = input_bounds.width - padding[1] - inputText._surrogate.width;
            break;
        default:
            break;
    }

    inputText._updateSurrogateHitbox(input_bounds)
    inputText._updateSurrogateMask(input_bounds, padding)
};

/**
 * The object will be pulled in front of his siblings in its container
 */
PIXI.DisplayObject.prototype.bringToFront = function () {
    const parent = this.parent;
    parent.setChildIndex(this, parent.children.length - 1);
};

/**
 * The object will be put behind his siblings in its container
 */
PIXI.DisplayObject.prototype.pushToBack = function () {
    this.parent.setChildIndex(this, 0);
};

/**
 * Move the element a single level up in the display hiearchy
 * @returns boolean if the element was moved
 */
PIXI.DisplayObject.prototype.bringForward = function () {
    const parent = this.parent;
    let index = parent.children.indexOf(this);
    let newIndex = Utils.clamp(index + 1, 0, parent.children.length - 1);
    parent.setChildIndex(this, newIndex);
    return index !== newIndex;
};

/**
 * Move the element a single level down in the display hiearchy
 * @returns boolean if the element was moved
 */
PIXI.DisplayObject.prototype.sendBackward = function () {
    const parent = this.parent;
    let index = parent.children.indexOf(this);
    let newIndex = Utils.clamp(index - 1, 0, parent.children.length - 1);
    parent.setChildIndex(this, newIndex);
    return index !== newIndex;
};

/**
 * It will be removed from its parent container
 */
PIXI.DisplayObject.prototype.removeFromParent = function () {
    if (this.parent) {
        this.parent.removeChild(this);
    }
};

/**
 * Scale an object in order to fit in a given frame
 * @param {Number} fitWidth the width in which to fit in
 * @param {Number} fitHeight the height in which to fit in
 */
PIXI.DisplayObject.prototype.fitTo = function (fitWidth, fitHeight) {
    this.calculateBounds();
    const b = this.getLocalBounds();
    this.scale.set(Math.min(fitWidth / b.width, fitHeight / b.height));
};

/**
 * Scale an object in order to fill the entire given frame
 * @param {Number} fillWidth width to fill
 * @param {Number} fillHeight height to fill
 */
PIXI.DisplayObject.prototype.fillOut = function (fillWidth, fillHeight) {
    this.calculateBounds();
    const b = this.getLocalBounds();
    this.scale.set(Math.max(fillWidth / b.width, fillHeight / b.height));
};

/**
 * Set a texture to a sprite by name
 * @param {String} name name of the texture
 */
PIXI.Sprite.prototype.setTexture = function (name) {
    this.texture = PIXI.utils.TextureCache[name];
};

/**
 * Check if the given bounds intersects with the bounds of the object
 */
PIXI.DisplayObject.prototype.overlaps = function (rectangle) {
    let bounds = this.getBounds();
    return rectangle.overlaps(bounds);
};

PIXI.Rectangle.prototype.overlaps = function (rectangle) {
    return rectangle.x + rectangle.width > this.x &&
        rectangle.x < this.x + this.width &&
        rectangle.y + rectangle.height > this.y &&
        rectangle.y < this.y + this.height;
}

Object.defineProperty(PIXI.Rectangle.prototype, 'centerX',
    {
        get: function () { return this.x + this.width / 2; }
    }
);

Object.defineProperty(PIXI.Rectangle.prototype, 'centerY',
    {
        get: function () { return this.y + this.height / 2; }
    }
);

// Vector operations 

/**
 * It adds the value from another vector
 * @param {PIXI.Point} point 
 * @returns 
 */
PIXI.Point.prototype.add = function (point) {
    this.x += point.x;
    this.y += point.y;
    return this;
};

/**
 * It substruct the value from another vector
 * @param {Point} point 
 * @returns 
 */
PIXI.Point.prototype.sub = function (point) {
    this.x -= point.x;
    this.y -= point.y;
    return this;
};

/**
 * It multiplies the vector for a given value
 * @param {*} x 
 * @param {*} y 
 * @returns 
 */
PIXI.Point.prototype.scale = function (x, y) {
    this.x *= x;
    this.y *= y || x;
    return this;
};

/**
 * It creates a dot product
 * @param {*} other 
 * @returns 
 */
PIXI.Point.prototype.dot = function (other) {
    return this.x * other.x + this.y * other.y;
};

/**
 * Sets the length of the vector ( polar coordinates )
 * @param {*} length 
 * @returns 
 */
PIXI.Point.prototype.setLength = function (length) {
    var angle = Math.atan2(this.y, this.x);
    this.x = Math.cos(angle) * length;
    this.y = Math.sin(angle) * length;
    return this;
};

/**
 * Gets the length of the Vector ( polar coordinates )
 * @returns 
 */
PIXI.Point.prototype.getLength = function () {
    return Math.sqrt(this.x * this.x + this.y * this.y);
};

/**
 * Sets the angle of the vector ( polar coordinates )
 * @param {*} angle 
 * @returns 
 */
PIXI.Point.prototype.setAngle = function (angle) {
    var length = Math.sqrt(this.x * this.x + this.y * this.y);
    this.x = Math.cos(angle) * length;
    this.y = Math.sin(angle) * length;
    return this;
};

/**
 * Get the angle of the vector ( polar coordinates )
 * @returns 
 */
PIXI.Point.prototype.getAngle = function () {
    return Math.atan2(this.y, this.x);
};

/**
 * Returns a new point by adding two vectors
 * @param {*} v1 
 * @param {*} v2 
 * @returns 
 */
PIXI.Point.addition = function (v1, v2) {
    return new PIXI.Point(v1.x + v2.x, v1.y + v2.y);
};

/**
 * Returns a new point by substructing two vectors
 * @param {*} v1 
 * @param {*} v2 
 * @returns 
 */
PIXI.Point.substruction = function (v1, v2) {
    return new PIXI.Point(v1.x - v2.x, v1.y - v2.y);
};