import CullingSegment from "./CullingSegment";

export default class ViewportCulling {

    constructor(viewport, segmentSize = null) {
        this.viewport = viewport;
        this.segmentSize = segmentSize || { width: 800, height: 800 };
        this.segments = {}; // keep all the segments in a hash table

        this.viewportLastPosition = { x: null, y: null };
        this.viewportLastScale = null;
        this.isDirty = false;
    }

    prepObjectsForRendering() {
        // calculate only if there was a change
        if (this.isDirty || this.hasViewportChanged()) {
            this.hideAllObjects();
            this.showObjectsInVisibleSegments();

            this.saveViewportState();
            this.isDirty = false;
        }
    }

    hideAllObjects() {
        this.setSegmentsVisibility(this.segments, false);
    }

    showObjectsInVisibleSegments() {
        const segments = this.getVisibleSegments();
        this.setSegmentsVisibility(segments, true);
    }

    setSegmentsVisibility(segments, visible) {
        for (let segment of Object.values(segments)) {
            for (let i = 0; i < segment.objects.length; i++) {
                const object = segment.objects[i];
                object.visible = visible;
            }
        }
    }

    hasViewportChanged() {
        if (this.viewportLastPosition.x === this.viewport.x &&
            this.viewportLastPosition.y === this.viewport.y &&
            this.viewportLastScale === this.viewport.scaled) {
            return false;
        }
        return true;
    }

    saveViewportState() {
        this.viewportLastPosition.x = this.viewport.x;
        this.viewportLastPosition.y = this.viewport.y;
        this.viewportLastScale = this.viewport.scaled;
    }

    setDirty() {
        this.isDirty = true;
        window.app.needsRendering();
    }

    updateObjects(objects) {
        for (let i = 0; i < objects.length; i++) {
            const object = objects[i];
            this.updateObject(object);
        }
    }

    updateObject(object) {
        this.removeObject(object);
        this.addObject(object);
    }

    getObjectsInViewport() {
        const segments = this.getVisibleSegments();
        const objects = {};

        const viewportBounds = this.getViewportBounds();

        // iterate segments , 
        for (const segment of Object.values(segments)) {
            for (let i = 0; i < segment.objects.length; i++) {
                const object = segment.objects[i];
                // get the cached culling Bounds , as they should be already calculated
                // when placing the object in the correct segment
                const bounds = object.cullingBounds;
                if (viewportBounds.overlaps(bounds)) {
                    objects[object._id] = object;
                }
            }
        }
        return Object.values(objects);
    }

    getVisibleSegments() {
        const segments = [];
        const ids = this.getVisibleSegmentIds();
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            // Using find segments instead of fetch segments
            // to avoid creation of empty unused segments
            const segment = this.findSegmentById(id);
            if (segment) {
                segments.push(segment);
            }
        }
        return segments;
    }

    getVisibleSegmentIds() {
        const bounds = this.getViewportBounds();
        const segmentIds = this.calcSegmentIds(bounds);

        return segmentIds;
    }

    getViewportBounds() {
        return new PIXI.Rectangle(
            -this.viewport.x / this.viewport.scaled,
            -this.viewport.y / this.viewport.scaled,
            this.viewport.screenWidthInWorldPixels,
            this.viewport.screenHeightInWorldPixels
        );
    }

    addObjects(objects) {
        for (let i = 0; i < objects.length; i++) {
            const object = objects[i];
            this.addObject(object);
        }
    }

    addObject(object) {
        const bounds = object.getCullingBounds();
        const segmentIds = this.calcSegmentIds(bounds);

        for (let i = 0; i < segmentIds.length; i++) {
            const segmentId = segmentIds[i];
            const segment = this.fetchSegmentById(segmentId);
            segment.add(object);
        }
        this.setDirty();
    }

    /**
     * Looks up for a segment by the given ID in the cache ,
     * if the segment does not exist it will be created and added to the segments cache
     * @param {*} id 
     * @returns 
     */
    fetchSegmentById(id) {
        let segment = this.segments[id];
        if (!segment) {
            segment = new CullingSegment(id);
            this.segments[id] = segment;
        }
        return segment;
    }

    /**
     * If no such segment exists them return undefined;
     * @param {*} id 
     * @returns 
     */
    findSegmentById(id) {
        return this.segments[id];
    }

    /**
     * Calculate the segment IDs where the bounds lays
     * @param {*} bounds 
     * @returns 
     */
    calcSegmentIds(bounds) {
        // This algorithm assumes that all objects have non rotated rectangular bounds.
        // and object can span between multiple segments
        // and lets assume that the segmentation has a starting point at 0,0

        // Lets calculate where the object is on the X axis 
        const startX = Math.floor(bounds.x / this.segmentSize.width);
        const endX = Math.floor((bounds.x + bounds.width) / this.segmentSize.width);
        const xIds = this.range(Math.min(startX, endX), Math.max(startX, endX));

        // now lets calcualte on the y axis
        const startY = Math.floor(bounds.y / this.segmentSize.height);
        const endY = Math.floor((bounds.y + bounds.height) / this.segmentSize.height);
        const yIds = this.range(Math.min(startY, endY), Math.max(startY, endY));

        // stich the ids together
        return this.combineIds(xIds, yIds);
    }

    combineIds(xIds, yIds) {
        const ids = [];
        // Instead of creating strings , we will create a unique number
        // but their uniqness in not guaranteed , it can happen a segments to share a bucket ( different numbers generating the same integer)
        // But that is a small trade off , for a performance boost 
        // Also considering our range of numbers ( size of the canvas and number of segments)
        // it is very unlekely that we gonna run in a situation of duplicate segments.
        for (let i = 0; i < xIds.length; i++) {
            const idx = xIds[i];
            for (let j = 0; j < yIds.length; j++) {
                const idy = yIds[j];
                ids.push((idx * 1000000) + idy);
            }
        }

        return ids;
    }

    removeObjects(objects) {
        for (let i = 0; i < objects.length; i++) {
            const object = objects[i];
            this.removeObject(object);
        }
    }

    /**
     * The object will be removed from all segments where it belongs
     * @param {*} object 
     */
    removeObject(object) {
        for (let i = 0; i < object.segmentIds.length; i++) {
            const id = object.segmentIds[i];
            const segment = this.findSegmentById(id);
            segment.remove(object);
        }
        this.setDirty();
    }

    range(start, end, step = 1) {
        let output = [];
        for (let i = start; i <= end; i += step) {
            output.push(i);
        }
        return output;
    }

    clear() {
        this.segments = {};
    }
}
