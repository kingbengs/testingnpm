/**
 * Class for storing all data for pixi side of the project (for now)
 */
class MainStorage {
    togglePanelStatus = {
        numbers: false,
        flow: false,
        forecast: false
    }

    setTogglePanelStatus(data) {
        this.togglePanelStatus = data;
    }

    getTogglePanelStatus() {
        return this.togglePanelStatus;
    }

    getBottomPanelSize() {
        return this.getBoundsByElementId('bottom-bar');
    }

    getLeftPanelSize() {
        return this.getBoundsByElementId('left-sidebar');
    }

    getHeaderPanelSize() {
        return this.getBoundsByElementId('header');
    }

    getBoundsByElementId(elementID) {
        const element = document.getElementById(elementID);
        return element ? element.getBoundingClientRect() : new DOMRect();
    }

}

export default new MainStorage();

