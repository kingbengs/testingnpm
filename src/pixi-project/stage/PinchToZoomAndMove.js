import { Plugin } from 'pixi-viewport';

const DEFAULT_OPTIONS = {
    moveSpeed: 1,
    moveReverse: false,
    zoomSpeed: 1,
    zoomReverse: false,
};

export default class PinchToZoomAndMove extends Plugin {
    constructor(app ,viewport, options) {
        super(viewport);
        this.parent = viewport;
        this.options = { ...DEFAULT_OPTIONS, ...options };

        this.moveReverse = this.options.moveReverse ? 1 : -1;
        this.zoomReverse = this.options.zoomReverse ? 1 : -1;

    }

    wheel(e) {
        e.preventDefault();
        e.stopPropagation();

        if (e.ctrlKey) {
            this.zoom(e);
        } else {
            this.pan(e);
        }

        this.parent.emit('wheel', { wheel: { dx: e.deltaX, dy: e.deltaY, dz: e.deltaZ }, event: e, viewport: this.parent });
        window.app.needsRendering();
    }

    pan(event) {
        this.parent.x +=
            event.deltaX * this.options.moveSpeed * this.moveReverse;
        this.parent.y +=
            event.deltaY * this.options.moveSpeed * this.moveReverse;
    }

    zoom(event) {
        const delta = 1 - ((this.zoomReverse * event.deltaY * this.options.zoomSpeed) / 250);

        const point = this.parent.input.getPointerPosition(event);
        const oldPoint = this.parent.toLocal(point);

        this.parent.scale.x *= delta;
        this.parent.scale.y *= delta;

        const clampZoom = this.parent.plugins.get('clamp-zoom');
        if (clampZoom) {
            clampZoom.clamp();
        }

        const newPoint = this.parent.toGlobal(oldPoint);
        this.parent.x += point.x - newPoint.x;
        this.parent.y += point.y - newPoint.y;
    }
}
