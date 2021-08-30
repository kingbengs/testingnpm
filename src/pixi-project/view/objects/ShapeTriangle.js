import ShapeContainerDrawable, { DEFAULT_SHAPE_LINE_WIDTH } from "pixi-project/view/objects/ShapeContainerDrawable";
import { EShapeTypes } from 'shared/CSharedConstants';

export const ORIENTATION_UP = 'up';
export const ORIENTATION_DOWN = 'down';

export default class ShapeTriangle extends ShapeContainerDrawable {

    constructor(eventHandlers, id, loadData = null) {
        super(eventHandlers, id, loadData);
        this.type = EShapeTypes.TRIANGLE;

        this.shapeData.orientation = ORIENTATION_UP;
    }

    onDrawEnd() {
        //Set the orientation of the shape
        if (this.shapeData.y + this.shapeData.height === 0) {
            if (this.shapeData.y < 0) {
                this.shapeData.orientation = ORIENTATION_UP;
            } else {
                this.shapeData.orientation = ORIENTATION_DOWN;
            }
        } else {
            if (this.shapeData.height < 0) {
                if (this.shapeData.orientation === ORIENTATION_UP) {
                    this.shapeData.orientation = ORIENTATION_DOWN;
                } else {
                    this.shapeData.orientation = ORIENTATION_UP;
                }
            }
        }

        // Shift shape data and position 
        // When we draw the shape , its position on the canvas (center of the object)
        // must be inline with the shape drawn on the pixi graphics object.
        // Since the shape can be drawn with negative values or at different 
        // starting x/y position , it then need to shifted and aligned at 
        // the final position on the canvas.

        this.x += this.shapeData.x;
        this.y += this.shapeData.y;

        this.shapeData.x = 0;
        this.shapeData.y = 0;

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

            let polygon = this.createPolygon();

            this.content.drawPolygon(polygon.points);
            this.content.closePath();
            this.content.endFill();

            this.content.hitArea = polygon;
        }
    }

    createPolygon() {
        let x0, y0, x1, y1, x2, y2;

        if (this.shapeData.orientation === ORIENTATION_DOWN) {
            x0 = this.shapeData.x + this.shapeData.width / 2;
            y0 = this.shapeData.y;
            x1 = this.shapeData.x + this.shapeData.width;
            y1 = this.shapeData.y + this.shapeData.height;
            x2 = this.shapeData.x + 0;
            y2 = this.shapeData.y + this.shapeData.height;
        } else {
            x0 = this.shapeData.x + this.shapeData.width / 2;
            y0 = this.shapeData.y + this.shapeData.height;
            x1 = this.shapeData.x + this.shapeData.width;
            y1 = (this.shapeData.y);
            x2 = this.shapeData.x + 0;
            y2 = (this.shapeData.y);
        }

        let polygon = new PIXI.Polygon([
            new PIXI.Point(x0,y0),
            new PIXI.Point(x1,y1),
            new PIXI.Point(x2,y2)
        ]);

        return polygon;
    }

}
