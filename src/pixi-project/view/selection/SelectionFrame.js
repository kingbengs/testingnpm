import Utils from 'pixi-project/utils/Utils';
import * as PIXI from 'pixi.js';
import { FILTER_TYPE_COMPARE_STEP, FILTER_TYPE_DEFAULT_STEP } from 'shared/CSharedConstants';
import { SELECTION_BOUNDARY_GAP } from "../Styles";

const FOCUS_ICONS_MARGIN = 15;
const MARKS_SCALE = 0.18;
const SCALE_THRESHOLD = 0.7;

// DELEGATE
// - onFrameRemoved(frame , filterType)

export default class SelectionFrame extends PIXI.Container {

    constructor(element, delegate = null) {
        super();

        this.graphics = new PIXI.Graphics();
        this.addChild(this.graphics);

        this.delegate = delegate;

        this.element = element;
        this.visibleFrame = true;
        this.frame = { x: 0, y: 0, width: 0, height: 0, lineColor: 0 };

        this.frameIcon1 = null;
        this.frameIcon2 = null;

        this.filterTypeIcons = {};
        this.filterTypeIcons[FILTER_TYPE_COMPARE_STEP] = 'filter_focus_icon_1.png';
        this.filterTypeIcons[FILTER_TYPE_DEFAULT_STEP] = 'filter_focus_icon_2.png';

        this.init();
    }

    init() {
        this.frameIcon1 = this.createIcon('filter_focus_icon_2.png');
        this.frameIcon1.filterType = FILTER_TYPE_DEFAULT_STEP;

        this.frameIcon2 = this.createIcon('filter_focus_icon_1.png');
        this.frameIcon2.filterType = FILTER_TYPE_COMPARE_STEP;

        this.frameIcon1.visible = false;
        this.frameIcon2.visible = false;
    }

    createIcon(textureName) {
        const icon = PIXI.Sprite.from(PIXI.utils.TextureCache[textureName]);
        icon.anchor.set(0.5, 0.5);
        icon.scale.set(MARKS_SCALE);
        icon.interactive = true;
        icon.buttonMode = true;
        icon.pointerover = this.onFrameIconOver.bind(this);
        icon.pointerout = this.onFrameIconOut.bind(this);
        icon.pointerdown = this.onFrameIconDown.bind(this);

        this.addChild(icon);

        return icon;
    }

    draw(lineColor, lineWidth) {
        const endPoint = this.element.getEndPoint();
        const viewportScale = window.app.viewport.scaled;
        const padding = SELECTION_BOUNDARY_GAP * viewportScale;
        const centerX = endPoint.width / 2;

        if (this.visibleFrame) {
            const width = endPoint.width + 2 * padding;
            const height = endPoint.height + 2 * padding;
            this.drawFrame(- padding, - padding, width, height, lineWidth, lineColor);
        }

        this.graphics.visible = this.visibleFrame;

        // Update the PWP marks
        this.positionMarks(centerX, viewportScale, padding);
        this.scaleMarks(viewportScale);
    }

    positionMarks(centerX, viewportScale, padding) {
        const hasTwoIcons = (this.frameIcon1.visible && this.frameIcon2.visible);
        const markerSpacing = hasTwoIcons ? FOCUS_ICONS_MARGIN : 0;

        this.frameIcon1.y = - padding;
        this.frameIcon2.y = - padding;

        // Apply the scale to the markerSpacing that separates the two marks
        // so that they don't appear outside the frame when zoomed out
        const belowThreshold = (viewportScale < SCALE_THRESHOLD);
        const spacing = belowThreshold ? markerSpacing * viewportScale : markerSpacing;

        this.frameIcon1.x = centerX - spacing;
        this.frameIcon2.x = centerX + spacing;
    }

    scaleMarks(viewportScale) {
        // If the viewport scale (zoom) is bellow a certain threshold 
        // Then start scaling the buttons down with it
        const belowThreshold = (viewportScale < SCALE_THRESHOLD);
        const scaledValue = viewportScale * MARKS_SCALE;
        const markerScale = belowThreshold ? scaledValue : MARKS_SCALE;

        this.frameIcon1.scale.set(markerScale);
        this.frameIcon2.scale.set(markerScale);
    }

    drawFrame(x, y, width, height, lineWidth, lineColor) {
        if (this.isFrameEqual(x, y, width, height, lineColor)) {
            // No need to redraw the frame
            return;
        } else {
            this.setFrame(x, y, width, height, lineColor);
        }

        this.graphics.clear();
        this.graphics.lineStyle(lineWidth, lineColor, 1);
        this.graphics.drawRect(
            x,
            y,
            width,
            height,
        );
    }

    isFrameEqual(x, y, width, height, lineColor) {
        return this.frame.x === x &&
            this.frame.y === y &&
            this.frame.width === width &&
            this.frame.height === height &&
            this.frame.lineColor === lineColor;
    }

    setFrame(x, y, width, height, lineColor) {
        this.frame.x = x;
        this.frame.y = y;
        this.frame.width = width;
        this.frame.height = height;
        this.frame.lineColor = lineColor;
    }

    onFrameIconOver(e) {
        e.currentTarget.texture = PIXI.utils.TextureCache['close.png'];
        window.app.needsRendering();
    }

    onFrameIconOut(e) {
        const iconName = this.filterTypeIcons[e.currentTarget.filterType];
        e.currentTarget.texture = PIXI.utils.TextureCache[iconName];
        window.app.needsRendering();
    }

    onFrameIconDown(e) {
        e.stopPropagation();
        if (this.delegate && this.delegate.onFrameRemoved) {
            this.delegate.onFrameRemoved(this, e.currentTarget.filterType);
        }
    }

    setFilterType(filterType) {
        if (filterType === FILTER_TYPE_COMPARE_STEP) {
            this.frameIcon2.visible = true;
        } else if (filterType === FILTER_TYPE_DEFAULT_STEP) {
            this.frameIcon1.visible = true;
        }
    }

    removeFilterType(filterType) {
        if (filterType === FILTER_TYPE_COMPARE_STEP) {
            this.frameIcon2.visible = false;
        } else if (filterType === FILTER_TYPE_DEFAULT_STEP) {
            this.frameIcon1.visible = false;
        }
    }

    hasFilterType(type) {
        if (type === FILTER_TYPE_COMPARE_STEP && this.frameIcon2.visible) {
            return true;
        } else if (type === FILTER_TYPE_DEFAULT_STEP && this.frameIcon1.visible) {
            return true;
        } else {
            return false;
        }
    }

    isValid() {
        return (this.frameIcon1.visible || this.frameIcon2.visible);
    }
}
