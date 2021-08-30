import Facade from "pixi-project/Facade";
import ShapeContainerDrawable, { DEFAULT_SHAPE_LINE_WIDTH, SHAPE_VALID_SIZE } from "pixi-project/view/objects/ShapeContainerDrawable";
import { EShapeTypes } from 'shared/CSharedConstants';
import { SELECTION_BOUNDARY_GAP } from "../Styles";

export default class ShapeEllipse extends ShapeContainerDrawable {

    constructor(eventHandlers, id, loadData = null) {
        super(eventHandlers, id, loadData);
        this.type = EShapeTypes.ELLIPSE;

        this._handlesSizeInfo = [
            { x: -0.5, y: -0.5 }, // left-top
            { x: 0.5, y: -0.5 }, // right-top
            { x: 0.5, y: 0.5 }, // right-bottom
            { x: -0.5, y: 0.5 }, // left-bottom
        ];

        this._handlesMoveInfo = [
            { x: 0.5, y: 0.5 }, // left-top
            { x: 0.5, y: 0.5 }, // right-top
            { x: 0.5, y: 0.5 }, // right-bottom
            { x: 0.5, y: 0.5 }, // left-bottom
        ];
    }

    onDrawEnd() {
        // Shift shape data and position 
        // When we draw the shape , its position on the canvas (center of the object)
        // must be inline with the shape drawn on the pixi graphics object.
        // Since the shape can be drawn with negative values or at different 
        // starting x/y position , it then need to shifted and aligned at 
        // the final position on the canvas.

        this.x += this.shapeData.x - this.shapeData.width;
        this.y += this.shapeData.y - this.shapeData.height;

        this.normalizeShape();
        this.shapeData.x = this.shapeData.width;
        this.shapeData.y = this.shapeData.height;
        this.drawShape();        
    }

    drawShape() {
        if (this.shapeData.width !== 0 && this.shapeData.height !== 0) {
            this._resetContext(DEFAULT_SHAPE_LINE_WIDTH);
            this.content.drawEllipse(this.shapeData.x, this.shapeData.y, this.shapeData.width, this.shapeData.height);
            this.content.endFill();
            this.content.hitArea = new PIXI.Ellipse(this.shapeData.x, this.shapeData.y, this.shapeData.width, this.shapeData.height);
        }
    }

    // This method is an overwrite 
    // please see handleMoved in the parent class for explanation.
    handleMoved(shape, startHandlePosition, point, index, isShift) {
        const moveMultiplicator = this._handlesMoveInfo[index];
        const sizeMultiplicator = this._handlesSizeInfo[index];

        const dispositionX = point.x - startHandlePosition.x;
        const dispositionY = point.y - startHandlePosition.y;

        let width = Math.abs(dispositionX * sizeMultiplicator.x + shape.width);
        let height = Math.abs(dispositionY * sizeMultiplicator.y + shape.height);

        let x = dispositionX * moveMultiplicator.x + shape.x;
        let y = dispositionY * moveMultiplicator.y + shape.y;

        if (isShift) {
            // for more info on how drawing a perfect shape works , 
            // please see handleMoved in the parent class
            const scale = window.app.viewport.scaled;
            
            // displacePoint , we need to understand if we are dragging into positive or negative space
            // that is , if the difference between the starting point and the current point dragged is positive or negative.
            // Its polarity is used to determine if we need to add or remove the difference of width/height 
            // in order to reposition the shape correctly 
            let p = Facade.viewport.toLocal({ x: point.x * scale, y: point.y * scale });
            let displacePoint = { x: p.x - this.x, y: p.y - this.y };

            if (this.opositeHandle) {
                // In the case of reshaping the tool the starting point is the oposite point 
                // from the handle being dragged
                let startPosition = this.opositeHandle.getGlobalPosition();
                startPosition.x *= 1 / scale;
                startPosition.y *= 1 / scale;
                // We also need to take into account the padding of the selection frame 
                startPosition.x += SELECTION_BOUNDARY_GAP * Math.sign(sizeMultiplicator.x);
                startPosition.y += SELECTION_BOUNDARY_GAP * Math.sign(sizeMultiplicator.y);
                displacePoint = { x: point.x - startPosition.x, y: point.y - startPosition.y };
            }

            let new_width = width;
            let new_height = height;

            if (width > height) {
                new_height = (width);
            } else {
                new_width = (height);
            }

            let _x = (new_width - width) * Math.sign(displacePoint.x);
            let _y = (new_height - height) * Math.sign(displacePoint.y);

            x = (dispositionX) * moveMultiplicator.x + _x + shape.x;
            y = (dispositionY) * moveMultiplicator.y + _y + shape.y;

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

    isShapeValid() {
        return (Math.abs(this.shapeData.width * 2) > SHAPE_VALID_SIZE && Math.abs(this.shapeData.height * 2) > SHAPE_VALID_SIZE);
    }

}
