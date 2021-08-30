import * as PIXI from 'pixi.js';
import { EElementCategories } from 'shared/CSharedCategories';
import BaseContainer from "pixi-project/base/containers/BaseContainer";
import {
  COLOR_SHAPE_LINE,
  COLOR_SHAPE_FILL,
  COLOR_SHAPE_INVALID,
  OPACITY_INVALID_SHAPE,
} from 'pixi-project/view/Styles';
import { cloneData, commonSendEventFunction } from 'shared/CSharedMethods';
import { PR_EVENT_SHAPE_DRAWING_ENDED, PR_EVENT_SHAPE_DRAWING_ENDED_FAIL } from 'shared/CSharedEvents';
import AppSignals from 'pixi-project/signals/AppSignals';
import CommandReshape from 'pixi-project/base/command-system/commands/CommandReshape';

export const DEFAULT_SHAPE_LINE_WIDTH = 3;
export const SHAPE_VALID_SIZE = 20;

// Delegates: 
// - onShapeInvalidDraw(shape)

export default class ShapeContainerDrawable extends BaseContainer {
  constructor(eventHandlers, id, loadData = null) {
    super(eventHandlers, id);
    this.category = EElementCategories.SHAPE;
    this.loadData = loadData;
    this.handleIndex = 0;
    this.startHandlePosition = new PIXI.Point();
    this._handleShape = null;
    this.opositeHandle = null;
    this.delegate = null;

    // Information about the handle relative position
    this._handlesPositionInfo = [
      { x: 0, y: 0 }, // left-top
      { x: 1, y: 0 }, // right-top
      { x: 1, y: 1 }, // right-bottom
      { x: 0, y: 1 }, // left-bottom            
    ];

    // Information about how handles affect the width/height when dragged
    this._handlesSizeInfo = [
      { x: -1, y: -1 }, // left-top
      { x: 1, y: -1 }, // right-top
      { x: 1, y: 1 }, // right-bottom
      { x: -1, y: 1 }, // left-bottom            
    ];

    // Information about how handles affect the relative x/y position when dragged
    this._handlesMoveInfo = [
      { x: 1, y: 1 }, // left-top
      { x: 0, y: 1 }, // right-top
      { x: 0, y: 0 }, // right-bottom
      { x: 1, y: 0 }, // left-bottom           
    ];

    this.shapeData = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      shapeStyle: null,
    };

    this.shapeData.shapeStyle = this.getStyle();
    this.previousShapeData = null;
    this.previousPosition = new PIXI.Point();
  }

  init() {
    this.content = new PIXI.Graphics();
    this.content.interactive = true;
    this.content.cursor = 'move';
    this.addChild(this.content);

    if (this.loadData) {
      this.draw(this.category);
      this.load(this.loadData);
    } else {
      this.draw(this.category);
    }

    this.footer.removeFromParent();
  }

  onReshapeStarted() {
    this.previousPosition.copyFrom(this.position);
    this.previousShapeData = cloneData(this.shapeData);
  }

  onReshapeEnded() {
    this.onDrawEnd();
    this.positionPoints();
    this.setToolbarPositionPoint();

    let command = new CommandReshape(this , this.previousShapeData , this.previousPosition);
    AppSignals.commandCreated.dispatch(command , true);
  }

  onDrawEnd() {
    // abstract method
  }

  load(data) {
    this.shapeData = data;
    this.category = data.category;
    this.drawShape();

    this.interactive = true;
    this.content.interactive = true;
    this.positionPoints();
  }

  setShape(parameters) {
    this.shapeData.x = parameters.x;
    this.shapeData.y = parameters.y;
    this.shapeData.width = parameters.width;
    this.shapeData.height = parameters.height;

    if(parameters.shapeStyle){
      this.shapeData.shapeStyle.borderColor = parameters.shapeStyle.borderColor;
      this.shapeData.shapeStyle.fillColor = parameters.shapeStyle.fillColor;
    }

    window.app.needsRendering();
  }

  handleMoved(shape, startHandlePosition, point, index, isShift) {
    // In order to understand which handle is being dragged
    // and how that handle affects the x/y position and sizing
    // we are reading the values by the handle index 
    // for additional info see: drawScalePoints in SelectionTool.js to see how handles are created and indexed.
    const moveMultiplicator = this._handlesMoveInfo[index];
    const sizeMultiplicator = this._handlesSizeInfo[index];

    // calculate the disposition on the x/y axis 
    // this gives as the amount of available space between the start and end point
    const dispositionX = point.x - startHandlePosition.x;
    const dispositionY = point.y - startHandlePosition.y;

    // Now lets explain the calculation below that is being used to set the shape
    // x/y position is the dispositon multiplied by the move info _handlesMoveInfo
    // that simply says if the x/y position of the object should change based on
    // which handle we are dragging
    // for example if the top-left handle is moved , then the values are multiplied by 1
    // in order to move the position , as we draw the shape starting from the top-left corner
    // while if the bottom-right handle is moved it is multiplied by 0 and no change on 
    // the x/y position will take place

    // The _handlesSizeInfo multiplicator simply sets the value of the disposition in negative space if needed
    // that is important for the handles that are dragging toward negative values 
    // an example is the top-left handle which when dragged it goes into negative values
    // relative to its starting position , but the result is not to decrese the size of the shape
    // but instead to increase the size of it. 
    // That is why we either multupy them by negative values or keep the originals 

    // in addition to that we are adding the last known shape data (At the start of dragging) 
    // to it as we are getting relative values from the starting drag point , 
    // so in order to get the absolute position/size we need to add its starting position and size.
    // Basicaly we are caluclation relative change + previous state to get to the new state

    // bottom line , with just a few multiplicators we are managing to define how each 
    // handle will affect the shape when being dragged.
    // and then the math is just super simple:
    // dispositonValue * behaviourMultiplicator + startingValue

    let width = dispositionX * sizeMultiplicator.x + shape.width;
    let height = dispositionY * sizeMultiplicator.y + shape.height;
    let x = dispositionX * moveMultiplicator.x + shape.x;
    let y = dispositionY * moveMultiplicator.y + shape.y;

    if (isShift) {
      // If shift is hold then we can draw a perfect shape
      // that means we need to set the width and height of the available space to be equal.
      let new_width = width;
      let new_height = height;
      if (Math.abs(width) > Math.abs(height)) {
        new_height = Math.abs(width) * Math.sign(height);
      } else {
        new_width = Math.abs(height) * Math.sign(width);
      }

      // Then we take into account the new difference in size
      // and we are going to offset the shape on the coresponding axis
      let _x = new_width - width;
      let _y = new_height - height;

      x = (dispositionX - _x) * moveMultiplicator.x + shape.x;
      y = (dispositionY - _y) * moveMultiplicator.y + shape.y;

      width = new_width;
      height = new_height;
    }

    this.setShape({
      x: x,
      y: y,
      width: width,
      height: height
    });
  }

  onResizeHandleDown(e) {
    this.setResizeHandleDown(e.currentTarget);
    this.onReshapeStarted();
  }

  onResizeHandleMove(e, isShift = false) {
    this.setResizeHandleMove(e, isShift);
  }

  onResizeHandleUp(e) {
    if (!this.isShapeValid()) {
      this.setShape(this._handleShape);
      this.drawShape();
      this.positionPoints();
      this.setToolbarPositionPoint();
    } else {
      this.onReshapeEnded();
    }
  }

  setResizeHandleDown(handle) {
    this.handleIndex = handle.index;
    const scale = 1 / window.app.viewport.scaled;
    let gp = handle.getGlobalPosition();
    gp.x *= scale;
    gp.y *= scale;
    this.startHandlePosition.copyFrom(gp);
    this._handleShape = cloneData(this.shapeData);
  }

  setResizeHandleMove(p, isShift = false) {
    const scale = 1 / window.app.viewport.scaled;
    let currentPoint = new PIXI.Point().copyFrom(p);
    currentPoint.x *= scale;
    currentPoint.y *= scale;

    this.handleMoved(this._handleShape, this.startHandlePosition, currentPoint, this.handleIndex, isShift);
    this.drawShape();
  }

  addEvents() {
    super.addEvents();
  }

  createImage(category) {
    this.category = category;

    this.addChild(this.content);

    if (this.titleText && this.titleText.length > 0) {
      this.drawTitleLabel(this.titleText);
    }
  }

  /**
   * Set line styles
   * @private
   */
  _setLineStyles(lineWidth = DEFAULT_SHAPE_LINE_WIDTH) {
    const style = this.getStyle();

    let borderAlpha = (style.borderColor === 'transparent') ? 0 : 1;
    let fillAlpha = (style.fillColor === 'transparent') ? 0 : 1;

    let lineColor = style.borderColor;

    if (!this.isShapeValid()) {
      lineColor = COLOR_SHAPE_INVALID;
      borderAlpha = OPACITY_INVALID_SHAPE;
      fillAlpha = OPACITY_INVALID_SHAPE;
    }

    this.content.lineStyle(lineWidth, lineColor, borderAlpha);
    this.content.beginFill(style.fillColor, fillAlpha);
  }

  getStyle() {
    return this.shapeData.shapeStyle || {
      borderColor: COLOR_SHAPE_LINE,
      fillColor: COLOR_SHAPE_FILL,
    };
  }

  /**
   * Clear the context and set line styles
   * @private
   */
  _resetContext(lineWidth) {
    this.content.clear();
    this._setLineStyles(lineWidth);
  }

  /**
   * Sets a point from which we position the toolbar for an element
   */
  setToolbarPositionPoint() {
    this.positionPoint = this.bottomPoint;
  }

  /**
   * an event handler that informs back if the shape was added to the stage
   * @param {boolean} isShift 
   * @returns If the shape is valid
   */
  onStopDraw(isShift = false) {
    if (this.isShapeValid()) {
      this.interactive = true;
      this.content.interactive = true;
      this.positionPoints();
      commonSendEventFunction(PR_EVENT_SHAPE_DRAWING_ENDED);
      return true;
    } else {
      if (this.delegate && this.delegate.onShapeInvalidDraw) {
        this.delegate.onShapeInvalidDraw(this);
      }
      commonSendEventFunction(PR_EVENT_SHAPE_DRAWING_ENDED_FAIL);
      return false;
    }
  }

  highlightElement(highlight = true) {
    super.highlightElement(highlight);
    this.drawShape();
  }

  getState() {
    super.getState();

    this.stateData.shapeData = this.shapeData;
    // TODO category is probably not needed
    this.stateData.shapeData.category = this.category;
    this.stateData.shapeData.type = this.type;

    return this.stateData;
  }

  isShapeValid() {
    return (Math.abs(this.shapeData.width) > SHAPE_VALID_SIZE && Math.abs(this.shapeData.height) > SHAPE_VALID_SIZE);
  }

  normalizeShape() {
    if (this.shapeData.width < 0) {
      this.shapeData.width *= -1;
    }

    if (this.shapeData.height < 0) {
      this.shapeData.height *= -1;
    }
  }

  setStyle(style) {
    let myStyle = this.getStyle();
    if (style.fillColor !== undefined) {
      myStyle.fillColor = style.fillColor;
    }

    if (style.borderColor !== undefined) {
      myStyle.borderColor = style.borderColor;
    }
    this.drawShape();
    window.app.needsRendering();
  }

}
