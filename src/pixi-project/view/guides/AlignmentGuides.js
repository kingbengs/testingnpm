import * as PIXI from 'pixi.js';
import { COLOR_ALIGNMENT_GUIDE } from '../Styles';

const SNAP_DISTANCE = 10; // in pixels
const LINES_THICKNESS = 1.5;
const MARKER_TEXTURE_SIZE = 15;
const MARKERS_SIZE = 6;

const ALIGN_VERTICAL = 'vertical';
const ALIGN_HORIZONTAL = 'horizontal';

export default class AlignmentGuides extends PIXI.Container {
    constructor(viewport) {
        super();
        this.viewport = viewport;
        this.lineTexture = this.createLineTexture();
        this.xTexture = this.createXTexture();
        this.activeLines = []; // the lines that are shown on the canvas
        this.freeLines = []; // cache the lines that we are going to show on screen
        this.activeMarkers = [];
        this.freeMarkers = [];

        this.frames = []; // frames that we are going to compare agains
        this.isActive = true;
        this.sortMethod = null;
        this.didSnap = false;

        this.initializeSorting();
    }

    initializeSorting() {
        this.sortMethod = function (a, b) {
            if (a.absDiscrepancy < b.absDiscrepancy) {
                return -1;
            } else if (a.absDiscrepancy > b.absDiscrepancy) {
                return 1;
            }

            return 0;
        };
    }

    show(bounds, objects) {
        const guides = this.showGuides(bounds);
        this.snapToGuides(objects, guides);
    }

    showGuides(bounds) {
        if (this.isActive) {
            this.clear();
            const verticalGuides = this.getClosestVericalGuides(bounds);
            const horizontalGuides = this.getClosestHorizontalGuides(bounds);

            this.drawGuides(verticalGuides, ALIGN_VERTICAL);
            this.drawGuides(horizontalGuides, ALIGN_HORIZONTAL);
            return { verticalGuides, horizontalGuides };
        }
    }

    snapToGuides(objects, guides) {
        this.didSnap = false;
        const vGuide = guides.verticalGuides.length ? guides.verticalGuides[0] : null;
        const hGuide = guides.horizontalGuides.length ? guides.horizontalGuides[0] : null;
        this.didSnap = (vGuide || hGuide);
        const scale = this.viewport.scaled;

        for (let i = 0; i < objects.length; i++) {
            const object = objects[i];
            if (this.didSnap) {
                object.x -= vGuide ? (vGuide.discrepancy / scale) : 0;
                object.y -= hGuide ? (hGuide.discrepancy / scale) : 0;
                object.move();
            }
        }

        return this.didSnap;
    }

    drawGuides(guides, alignment) {
        const isHorizontal = (alignment === ALIGN_HORIZONTAL);
        for (let i = 0; i < guides.length; i++) {
            const guideData = guides[i];
            const length = guideData.minMax[1] - guideData.minMax[0];
            const line = this.fetchFreeLine(length, alignment);
            line.x = isHorizontal ? guideData.minMax[0] : guideData.value;
            line.y = isHorizontal ? guideData.value : guideData.minMax[0];
            this.addLine(line);
            this.displayMarkers(guideData.value, guideData.markers, alignment);
        }
    }

    displayMarkers(value, markers, alignment) {
        const isHorizontal = (alignment === ALIGN_HORIZONTAL);
        for (let i = 0; i < markers.length; i++) {
            const marker = this.fetchFreeMarker();
            marker.x = isHorizontal ? markers[i] : value;
            marker.y = isHorizontal ? value : markers[i];
            this.addMarker(marker);
        }
    }

    getClosestHorizontalGuides(bounds) {
        const horizontalGuides = this.getAllHorizontalGuides(bounds);
        this.sortGuides(horizontalGuides);
        return this.reduceToClosest(horizontalGuides);
    }

    getClosestVericalGuides(bounds) {
        const verticalGuides = this.getAllVerticalGuides(bounds);
        this.sortGuides(verticalGuides);
        return this.reduceToClosest(verticalGuides);
    }

    reduceToClosest(guides) {
        const closest = [];

        if (guides.length) {
            const initialGuideData = guides[0];
            closest.push(initialGuideData);

            for (let i = 1; i < guides.length; i++) {
                const guideData = guides[i];
                if (initialGuideData.absDiscrepancy === guideData.absDiscrepancy) {
                    closest.push(guideData);
                } else {
                    break;
                }
            }
        }

        return closest;
    }

    sortGuides(guides) {
        guides.sort(this.sortMethod);
    }

    getAllVerticalGuides(bounds) {
        let verticalGuides = [];
        verticalGuides = verticalGuides.concat(this.checkVerticalValues(bounds.left, bounds));
        verticalGuides = verticalGuides.concat(this.checkVerticalValues(bounds.centerX, bounds));
        verticalGuides = verticalGuides.concat(this.checkVerticalValues(bounds.right, bounds));
        return verticalGuides;
    }

    getAllHorizontalGuides(bounds) {
        let horizontalGuides = [];
        horizontalGuides = horizontalGuides.concat(this.checkHorizontalValues(bounds.top, bounds));
        horizontalGuides = horizontalGuides.concat(this.checkHorizontalValues(bounds.centerY, bounds));
        horizontalGuides = horizontalGuides.concat(this.checkHorizontalValues(bounds.bottom, bounds));
        return horizontalGuides;
    }

    checkHorizontalValues(value, bounds) {
        const matches = [];

        for (let i = 0; i < this.frames.length; i++) {
            const frame = this.frames[i];
            this.saveMatchingValue(value, ALIGN_HORIZONTAL, bounds, frame.top, frame, matches);
            this.saveMatchingValue(value, ALIGN_HORIZONTAL, bounds, frame.centerY, frame, matches);
            this.saveMatchingValue(value, ALIGN_HORIZONTAL, bounds, frame.bottom, frame, matches);
        }

        return matches;
    }

    checkVerticalValues(value, bounds) {
        const matches = [];

        for (let i = 0; i < this.frames.length; i++) {
            const frame = this.frames[i];
            this.saveMatchingValue(value, ALIGN_VERTICAL, bounds, frame.left, frame, matches);
            this.saveMatchingValue(value, ALIGN_VERTICAL, bounds, frame.centerX, frame, matches);
            this.saveMatchingValue(value, ALIGN_VERTICAL, bounds, frame.right, frame, matches);
        }

        return matches;
    }

    saveMatchingValue(value, alignment, bounds, frameValue, frame, matches) {
        const discrepancy = (value - frameValue);
        const absDiscrepancy = Math.abs(discrepancy).toFixed(1);

        if (absDiscrepancy < (SNAP_DISTANCE)) {
            let markers = null;

            if (alignment === ALIGN_VERTICAL) {
                markers = [bounds.top, bounds.bottom, frame.top, frame.bottom];
            } else if (alignment === ALIGN_HORIZONTAL) {
                markers = [bounds.left, bounds.right, frame.left, frame.right];
            }

            const minMax = this.findMinMax(markers);

            matches.push({
                value: frameValue,
                discrepancy: discrepancy,
                absDiscrepancy: absDiscrepancy,
                frame: frame,
                minMax: minMax,
                markers: markers
            });
        }
    }

    findMinMax(arr) {
        let min = arr[0];
        let max = arr[0];
        let i = arr.length;

        while (i--) {
            min = arr[i] < min ? arr[i] : min;
            max = arr[i] > max ? arr[i] : max;
        }
        return [min, max];
    }

    setRelativeObjects(objects) {
        this.frames = this.getFrames(objects);
    }

    getFrames(objects) {
        const frames = [];
        for (var i = 0; i < objects.length; i++) {
            const object = objects[i];
            const frame = object.content.getBounds();
            frames.push(frame);
        }
        return frames;
    }

    clear() {
        this.removeAllLines();
        this.removeAllMarkers();
    }

    // markers related code

    fetchFreeMarker() {
        let marker = this.freeMarkers.pop();
        if (!marker) {
            marker = new PIXI.Sprite(this.xTexture);
            marker.anchor.set(0.5, 0.5);
        }
        marker.width = MARKERS_SIZE;
        marker.height = MARKERS_SIZE;
        return marker;
    }

    addMarker(marker) {
        this.addChild(marker);
        this.activeMarkers.push(marker);
    }

    removeMarker(marker) {
        marker.removeFromParent();
        this.freeMarkers.push(marker);
        this.activeMarkers.removeElement(marker);
    }

    removeAllMarkers() {
        for (let i = this.activeMarkers.length - 1; i >= 0; i--) {
            const marker = this.activeMarkers[i];
            this.removeMarker(marker);
        }
    }

    // Line related code

    fetchFreeLine(length, alignment) {
        const isHorizontal = (alignment === ALIGN_HORIZONTAL);
        let line = this.freeLines.pop();
        if (!line) {
            line = new PIXI.Sprite(this.lineTexture);
        }
        line.width = isHorizontal ? length : LINES_THICKNESS;
        line.height = isHorizontal ? LINES_THICKNESS : length;
        line.anchor.x = isHorizontal ? 0 : 0.5;
        line.anchor.y = isHorizontal ? 0.5 : 0;
        return line;
    }

    addLine(line) {
        this.addChild(line);
        this.activeLines.push(line);
    }

    removeLine(line) {
        line.removeFromParent();
        this.freeLines.push(line);
        this.activeLines.removeElement(line);
    }

    removeAllLines() {
        for (let i = this.activeLines.length - 1; i >= 0; i--) {
            const line = this.activeLines[i];
            this.removeLine(line);
        }
    }

    createLineTexture() {
        this.graphics = new PIXI.Graphics();

        const textureWidth = 2;
        const textureHeight = 2;

        const renderTexture = new PIXI.RenderTexture.create({
            width: textureWidth,
            height: textureHeight,
            resolution: 1,
        });

        this.graphics.clear();
        this.graphics.beginFill(COLOR_ALIGNMENT_GUIDE);
        this.graphics.drawRect(0, 0, textureWidth, textureHeight);
        this.graphics.endFill();

        window.app.renderer.render(this.graphics, renderTexture);

        return renderTexture;
    }

    createXTexture() {
        this.graphics = new PIXI.Graphics();

        const textureWidth = MARKER_TEXTURE_SIZE;
        const textureHeight = MARKER_TEXTURE_SIZE;

        const renderTexture = new PIXI.RenderTexture.create({
            width: textureWidth,
            height: textureHeight,
            resolution: 1,
        });

        this.graphics.clear();

        this.graphics.lineStyle(LINES_THICKNESS, COLOR_ALIGNMENT_GUIDE, 1);
        this.graphics.moveTo(0, 0);
        this.graphics.lineTo(textureWidth, textureHeight);
        this.graphics.moveTo(0, textureHeight);
        this.graphics.lineTo(textureWidth, 0);

        window.app.renderer.render(this.graphics, renderTexture);

        return renderTexture;
    }

}
