import MainStorage from "pixi-project/core/MainStorage";
import Utils from "pixi-project/utils/Utils";
import { getMousePosition } from "shared/CSharedMethods";

const MIN_SPEED = 1;
const MAX_SPEED = 10;
const EDGE_DISTANCE = 60; // in pixels

// DELEGATE
// -onViewportAutoPan
export default class ViewportAutoPan {

    constructor(delegate) {
        this.delegate = delegate;
        this.isActive = false;
        this.velocity = new PIXI.Point();
        this.viewport = window.app.viewport;

        window.app.ticker.add(this.onUpdate, this);
    }

    onUpdate(deltaTime) {
        if (this.isActive) {
            // Calculate the relative position of the mouse in the viewport
            // and the available viewport size
            let data = this.getRelativePointInViewport();
            // Calculate the direction in wich we need to move the viewport 
            let dirVector = this.calculateDirection(data.x, data.y, data.width, data.height);

            this.moveViewportInDirection(dirVector, deltaTime);
        }
    }

    moveViewportInDirection(dirVector, deltaTime = 1) {
        if (dirVector.x || dirVector.y) {
            let centerX = this.viewport.center.x;
            let centerY = this.viewport.center.y;

            // Scaling the panning speed so that it appears constant
            // no matter the zoomed scale of the canvas
            const scale = this.viewport.scaled;
            let minSpeed = MIN_SPEED * 1 / scale;
            let maxSpeed = MAX_SPEED * 1 / scale;

            if (dirVector.x) {
                centerX += Utils.lerp(dirVector.xValue, minSpeed, maxSpeed) * deltaTime * dirVector.dirX;
            }

            if (dirVector.y) {
                centerY += Utils.lerp(dirVector.yValue, minSpeed, maxSpeed) * deltaTime * dirVector.dirY;
            }

            this.viewport.moveCenter(centerX, centerY);
            window.app.needsRendering();

            if (this.delegate && this.delegate.onViewportAutoPan) {
                this.delegate.onViewportAutoPan();
            }
        }
    }

    getRelativePointInViewport() {
        let p = getMousePosition();
        const menusOffset = this.getViewportSideOffset();
        let x = p.x - menusOffset.left;
        let y = p.y - menusOffset.top;
        let width = this.viewport.screenWidth - menusOffset.right - menusOffset.left;
        let height = this.viewport.screenHeight - menusOffset.bottom - menusOffset.top;
        return { x, y, width, height };
    }

    calculateDirection(pointX, pointY, viewportWidth, viewportHeight) {
        let x = 0;
        let y = 0;
        let dirX = 0;
        let dirY = 0;
        let rightEdge = viewportWidth - EDGE_DISTANCE;
        let bottomEdge = viewportHeight - EDGE_DISTANCE;

        if (pointX < EDGE_DISTANCE) {
            let n = Utils.normalize(pointX, EDGE_DISTANCE, 0);
            x = Utils.clamp(n, 0, 1) * -1;
            dirX = -1;
        } else if (pointX > rightEdge) {
            let n = Utils.normalize(pointX, rightEdge, viewportWidth);
            x = Utils.clamp(n, 0, 1);
            dirX = 1;
        }

        if (pointY < EDGE_DISTANCE) {
            let n = Utils.normalize(pointY, EDGE_DISTANCE, 0);
            y = Utils.clamp(n, 0, 1) * -1;
            dirY = -1;
        } else if (pointY > bottomEdge) {
            let n = Utils.normalize(pointY, bottomEdge, viewportHeight);
            y = Utils.clamp(n, 0, 1);
            dirY = 1;
        }

        return { x, y, dirX, dirY, xValue: Math.abs(x), yValue: Math.abs(y) };
    }

    /**
     * It returns the size of the menus if they are opened
     * @returns 
     */
    getViewportSideOffset() {
        // used to transfer the dom size of the side menus into canvas internal size
        const scaleFactor = window.app.scaleManager.aspectRatio;

        // get the panel sizes
        const leftWidth = MainStorage.getLeftPanelSize().width / scaleFactor;
        const bottomHeight = MainStorage.getBottomPanelSize().height / scaleFactor;
        const topHeight = MainStorage.getHeaderPanelSize().height / scaleFactor;

        return { left: leftWidth, top: topHeight, bottom: bottomHeight, right: 0 };
    }

}
