import ShapeContainerDrawable, { DEFAULT_SHAPE_LINE_WIDTH } from "pixi-project/view/objects/ShapeContainerDrawable";
import { EShapeTypes } from 'shared/CSharedConstants';

export default class ShapeRectangle extends ShapeContainerDrawable {

    constructor(eventHandlers, id, loadData = null) {
        super(eventHandlers, id, loadData);
        this.type = EShapeTypes.RECTANGLE;
    }

    onDrawEnd() {
        // Shift shape data and position 
        // When we draw the shape , its position on the canvas (center of the object)
        // must be inline with the shape drawn on the pixi graphics object.
        // Since the shape can be drawn with negative values or at different 
        // starting x/y position , it then need to shifted and aligned at 
        // the final position on the canvas.
        
        // In this case we simply  set the x,y of the shape data to be the 
        // new position of the element , and then set the shape to start from 0,0
        this.x += this.shapeData.x;
        this.y += this.shapeData.y;
        this.shapeData.x = 0;
        this.shapeData.y = 0;

        // in the case of negative values , we also need to adjust the element positon
        if (this.shapeData.width < 0) {
            this.x += this.shapeData.width;
        }

        if (this.shapeData.height < 0) {
            this.y += this.shapeData.height;
        }

        this.normalizeShape();
        this.drawShape();
    }

    drawShape() {
        if (this.shapeData.width !== 0 && this.shapeData.height !== 0) {
            this._resetContext(DEFAULT_SHAPE_LINE_WIDTH);
            this.content.drawRect(this.shapeData.x, this.shapeData.y, this.shapeData.width, this.shapeData.height);
            this.content.endFill();
            this.content.hitArea = new PIXI.Rectangle(this.shapeData.x, this.shapeData.y, this.shapeData.width, this.shapeData.height);
        }
    }
    
}
