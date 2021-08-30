import MainStorage from "pixi-project/core/MainStorage";
import Facade from "pixi-project/Facade";
const DEFAULT_FUNNEL_SCALING_MARGIN = 1.1;
const ZOOMING_STEP = 0.25;

export default class ZoomUtility {

    /**
     * The container that we are zooming in and out
     * @param {PIXI.DisplayObject} contentContainer 
     */
    constructor(contentContainer) {
        this.contentContainer = contentContainer;
    }

    /**
     * Scales the viewport to fit the whole funnel on one screen with a bit of space on the outsides
     */
    fitToScreen() {
        if (this.contentContainer.children.length === 0) {
            return;
        }

        let contentFitSize = this.calculateContentFitSize();
        Facade.viewport.fit(false, contentFitSize.fitWidth, contentFitSize.fitHeight);

        // after it is being fitted or maybe it did not fully fitted due to canvas scale limitations , 
        // lets check how much of available blank space we have on the sides
        let blankSpace = this.calculateBlankSpace(); // this.calculateContentFitSize();

        // Lets calculate where the new centerX and centerY are going to be.
        // lets start on the x position of the bounds content , then move 
        // the center for half the width of the bounds and substruct the blank space for the menus
        const bounds = this.contentContainer.getLocalBounds();
        let centerX = bounds.left + (bounds.width - blankSpace.left) / 2;
        let centerY = bounds.top + (bounds.height - blankSpace.top + blankSpace.bottom) / 2;

        Facade.viewport.moveCenter(centerX, centerY);
        window.app.needsRendering();
    }

    zoomIn() {
        let zoomLevel = Facade.viewport.scaled + ZOOMING_STEP;
        Facade.viewport.setZoom(zoomLevel, true);
    }

    zoomOut() {
        let zoomLevel = Facade.viewport.scaled - ZOOMING_STEP;
        Facade.viewport.setZoom(zoomLevel, true);
    }

    zoomReset() {
        Facade.viewport.setZoom(1, true);
    }

    setZoomLevel(zoomLevel) {
        Facade.viewport.setZoom(zoomLevel, true);
    }

    /**
     * Calculate blank space on the canvas sides that will be beneath the menus
     * @returns 
     */
    calculateContentFitSize() {
        // Descrition:
        // In order to fit the content to the screen size and take the side menus into account
        // we need to cheat a little bit since the canvas is beneath the menus.
        // To do that we need to artificially add blank space on the sides.

        // used to transfer the dom size of the side menus into canvas internal size
        const scaleFactor = 1 / window.app.scaleManager.aspectRatio;

        // get the panel sizes
        const leftWidth = MainStorage.getLeftPanelSize().width * scaleFactor;
        const bottomHeight = MainStorage.getBottomPanelSize().height * scaleFactor;
        const topHeight = MainStorage.getHeaderPanelSize().height * scaleFactor;
        const bounds = this.contentContainer.getLocalBounds();

        // lets calculate the fitting width size
        const canvasWidth = window.app.viewport.screenWidth;
        const availableSpaceWidth = canvasWidth - leftWidth;
        // now lets increase the content size for 10%
        const newBoundsWidth = bounds.width * DEFAULT_FUNNEL_SCALING_MARGIN;
        // We are going to extend the bounds of the content with the size of the side menu
        // in such a way that when fitted in the available space
        // there will be blank space on the side matching the side of the side menu
        // so we first calculate what size of the added blank space
        const newSideWidth = (newBoundsWidth * leftWidth) / availableSpaceWidth;
        // the size we are going to fit into the screen is simply the sum of
        // content bounds (enlarged by 10%) and the blank space on the side.
        const fitWidth = newBoundsWidth + newSideWidth;

        // The calculation is very similar for the Y axis
        // but in this case we need to take into account the size of the 
        // top menu and the bottom menu.
        const canvasHeight = window.app.viewport.screenHeight;
        const availableSpaceHeight = canvasHeight - bottomHeight - topHeight;
        const newBoundsHeight = bounds.height * DEFAULT_FUNNEL_SCALING_MARGIN;
        const newPanelHeight = (newBoundsHeight * (bottomHeight + topHeight)) / availableSpaceHeight;
        const fitHeight = newBoundsHeight + newPanelHeight;

        return { fitWidth, fitHeight };
    }

    calculateBlankSpace() {
        // used to transfer the dom size of the side menus into canvas internal size
        const scaleFactor = window.app.scaleManager.aspectRatio;
        const viewportScale = window.app.viewport.scaled;

        // get the panel sizes
        const leftWidth = MainStorage.getLeftPanelSize().width / scaleFactor / viewportScale;
        const bottomHeight = MainStorage.getBottomPanelSize().height / scaleFactor / viewportScale;
        const topHeight = MainStorage.getHeaderPanelSize().height / scaleFactor / viewportScale;

        return { left: leftWidth, top: topHeight, bottom: bottomHeight, right: 0 };
    }
}
