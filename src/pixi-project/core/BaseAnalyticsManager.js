import { roundTo, toPercent } from 'shared/CSharedMethods';

export default class BaseAnalyticsManager {

    constructor(controller, view, data = null) {
        this.controller = controller;
        this.view = view;
        this.data = data;
        this.percent = 0;
    }

    setData(data) {
        this.data = data;

        if (!this.data) {
            // clear the view 
            this.view.setData([]);
        }
    }

    process() {
        // This is to be considered an abstract method
    }

    showPercent() {
        if (this.data && this.view.canHaveValue) {
            this.view.setData([toPercent(this.percent, 1)]);
        }
    }

    showHits() {
        if (this.data && this.view.canHaveValue) {
            this.view.setData([this.data['hits']]);
        }
    }

    getCompareData() {
        if (this.data['compare_to_data']) {
            let currentHits = this.data['hits'];
            let compareHits = this.data['compare_to_data']['hits'];
            let percent = this.parsePercent(currentHits / compareHits);

            return { currentHits, compareHits, percent };
        }
        return null;
    }

    parsePercent(percent) {
        percent = roundTo(percent, 2);
        if (percent === Infinity) {
            percent = 0;
        } else if (isNaN(percent)) {
            percent = 1;
        }

        if (percent === 1) {
            percent = '0';
        } else if (percent > 1) {
            percent = Math.round((percent - 1) * 100);
        } else {
            percent = Math.round((1 - percent) * 100) * -1;
        }
        return percent;
    }

    isZero(percent) {
        return Number(percent) === 0;
    }

    isPositive(percent) {
        return Number(percent) > 0;
    }

    onPointerOver(e) {
        window.app.needsRendering();
    }

    onPointerOut(e) {
        window.app.needsRendering();
    }
}
