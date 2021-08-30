import * as PIXI from 'pixi.js';
import Styles, { COLOR_LABEL_DEFAULT } from 'pixi-project/view/Styles';

export const LABEL_OFFSET_Y = 5;
export const LABEL_PADDING = 5;

export const LABEL_ALIGN_LEFT = 'left';
export const LABEL_ALIGN_RIGHT = 'right';
export const LABEL_ALIGN_CENTER = 'center';

export default class InfoDisplay extends PIXI.Container {

    constructor(dataArray = []) {
        super();
        /**
         * onFooterHoverIn
         * onFooterHoverOut
         */
        this.delegate = null;
        this.data = dataArray;
        this.displayLabels = [];
        this.canHaveValue = false;
        this.cacheBiggestBounds = false;
        this._biggestHitArea = new PIXI.Rectangle();
        this.setData(dataArray);
        this.interactive = true;
        this.pointerover = this.onPointerOver.bind(this);
        this.pointerout = this.onPointerOut.bind(this);

        this.align = LABEL_ALIGN_CENTER;
    }

    /**
     * It will set the biggest bounds to be the hit area 
     */
    _saveBiggestHitArea() {
        const bounds = this.getLocalBounds();
        if (this._biggestHitArea.width * this._biggestHitArea.height < bounds.width * bounds.height) {
            this.hitArea = bounds.clone();
            this._biggestHitArea = this.hitArea;
        }
    }

    /**
     * It will display all the strings that are given in the dataArray
     * @param {Array} dataArray 
     */
    setData(dataArray) {
        this.data = [...dataArray];
        this._displayData();
    }

    /**
     * Creates all the labels and assigns the text to be displayed
     */
    _displayData() {
        for (let i = 0; i < this.data.length; i++) {
            const textData = this.data[i];
            let text = textData;

            if (Array.isArray(textData)) {
                text = [];
                for (let j = 0; j < textData.length; j++) {
                    const tData = textData[j];
                    text.push(tData.value);
                }
            } else if (typeof textData === "object") {
                text = textData.value;
            }

            // check if cached data is different from what we need to display
            if (this.displayLabels[i]) {
                if (this._isLabelDifferent(this.displayLabels[i], textData)) {
                    this._removeLabels(i);
                    this._createLabel(textData);
                }
            }

            // If the label does not exist , create it on the fly.
            let label = this.displayLabels[i] || this._createLabel(textData);

            if (Array.isArray(textData)) {
                for (let j = 0; j < label.length; j++) {
                    const labelText = text[j];
                    label[j].text = labelText;
                }
            } else {
                label.text = text;
            }
        }
        // Labels for which we don't have data are not needed
        this._removeUnusedLabels();
        this.repositionLabels();

        // This is done to avoid flickering when changing the values on hoverin/out.
        // So even if a smaller label is shown when hovering in , the bounds will remain
        // the same as when the larger label was shown avoiding the hoverout event.
        if (this.cacheBiggestBounds) {
            this._saveBiggestHitArea();
        }
    }

    _isLabelDifferent(label, labelData) {
        if (Array.isArray(label) && !Array.isArray(labelData)) {
            return true;
        } else if (!Array.isArray(label) && Array.isArray(labelData)) {
            return true;
        } else if (Array.isArray(label) && Array.isArray(labelData)) {

            if (labelData.length !== label.length) {
                return true;
            } else {
                for (let i = 0; i < label.length; i++) {
                    const l = label[i];
                    const d = labelData[i];
                    if (this._isLabelDataDifferent(l, d)) {
                        return true;
                    }
                }
            }

        } else {
            if (this._isLabelDataDifferent(label, labelData)) {
                return true;
            }
        }

        return false;
    }

    _isLabelDataDifferent(label, labelData) {
        if (label.tint !== labelData.color) {
            return true;
        }

        return false;
    }

    /**
     * Create a label object
     * @returns PIXI.Text
     */
    _createLabel(textData) {
        if (Array.isArray(textData)) {
            const labels = [];

            for (let j = 0; j < textData.length; j++) {
                const tData = textData[j];

                const label = new PIXI.BitmapText('', Styles.FOOTER_LABEL);
                label.tint = (tData.color === undefined) ? COLOR_LABEL_DEFAULT : tData.color;
                label.y = 200;
                label.anchor.x = 0.5;
                this.addChild(label);
                labels.push(label);
            }

            this.displayLabels.push(labels);
            return labels;
        } else if (typeof textData === "object") {
            const label = new PIXI.BitmapText('', Styles.FOOTER_LABEL);
            label.tint = (textData.color === undefined) ? COLOR_LABEL_DEFAULT : textData.color;
            label.y = 200;
            label.anchor.x = 0.5;

            this.addChild(label);
            this.displayLabels.push(label);
            return label;
        } else {
            const label = new PIXI.BitmapText('', Styles.FOOTER_LABEL);
            label.tint = COLOR_LABEL_DEFAULT;
            label.y = 200;
            label.anchor.x = 0.5;

            this.addChild(label);
            this.displayLabels.push(label);
            return label;
        }
    }

    /**
     * It will remove all the labels for which we do not have data
     */
    _removeUnusedLabels() {
        // remove any labels that are not being used
        this._removeLabels(this.data.length);
    }

    /**
     * It will remove all the labels starting at a given index
     */
    _removeLabels(startIndex) {
        // remove any labels that are not being used
        const removedLabels = this.displayLabels.splice(startIndex);

        for (let i = removedLabels.length - 1; i >= 0; i--) {
            if (Array.isArray(removedLabels[i])) {
                const rl = removedLabels[i];
                for (let j = 0; j < rl.length; j++) {
                    const label = rl[j];
                    label.removeFromParent();
                }
            } else {
                const label = removedLabels[i];
                label.removeFromParent();
            }
        }
    }

    repositionLabels() {
        let y = LABEL_OFFSET_Y;
        const PADDING_X = 5;
        let biggest_width = 0;

        for (let i = 0; i < this.displayLabels.length; i++) {
            if (Array.isArray(this.displayLabels[i])) {
                const labels = this.displayLabels[i];
                let highestLabel = 0;
                let width = 0;
                for (let j = 0; j < labels.length; j++) {
                    const label = labels[j];
                    label.y = y;
                    if (label.height > highestLabel) {
                        highestLabel = label.height;
                    }
                    width += label.width;
                }

                width += PADDING_X * (labels.length - 1);

                if (width > biggest_width) {
                    biggest_width = width;
                }

                let startX = - width / 2;
                y += highestLabel + LABEL_PADDING;

                for (let j = 0; j < labels.length; j++) {
                    const label = labels[j];
                    label.x = startX + label.width / 2 + PADDING_X * j;
                    startX += label.width + PADDING_X;
                }
            } else {
                const label = this.displayLabels[i];
                label.y = y;
                y += label.height + LABEL_PADDING;
                if (label.width > biggest_width) {
                    biggest_width = label.width;
                }
            }
        }

        if (this.align !== LABEL_ALIGN_CENTER) {
            for (let i = 0; i < this.displayLabels.length; i++) {
                if (Array.isArray(this.displayLabels[i])) {
                    const labels = this.displayLabels[i];
                    if (this.align === LABEL_ALIGN_LEFT) {
                        let startX = - biggest_width / 2;
                        for (let j = 0; j < labels.length; j++) {
                            const label = labels[j];
                            label.x = startX + label.width / 2;
                            startX += label.width + PADDING_X * j + PADDING_X;
                        }
                    } else if (this.align === LABEL_ALIGN_RIGHT) {
                        let startX = biggest_width / 2;
                        let counter = 0;
                        for (let j = labels.length - 1; j >= 0; j--) {
                            const label = labels[j];
                            label.x = startX - label.width / 2;
                            startX = startX - label.width - PADDING_X * (counter++) - PADDING_X;
                        }
                    }
                } else {
                    const label = this.displayLabels[i];
                    if (this.align === LABEL_ALIGN_LEFT) {
                        label.x = -biggest_width / 2 + label.width / 2;
                    } else if (this.align === LABEL_ALIGN_RIGHT) {
                        label.x = biggest_width / 2 - label.width / 2;
                    }
                }
            }
        }

    }

    updateVisibility(isVisible) {
        if (this.canHaveValue) {
            this.visible = isVisible;
        }
    }

    onPointerOver(e) {
        if (this.delegate && this.delegate.onFooterHoverIn) {
            this.delegate.onFooterHoverIn(e, this);
        }
    }

    onPointerOut(e) {
        if (this.delegate && this.delegate.onFooterHoverOut) {
            this.delegate.onFooterHoverOut(e, this);
        }
    }

}