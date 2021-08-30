import BaseAnalyticsManager from "pixi-project/core/BaseAnalyticsManager";
import { toPercent } from 'shared/CSharedMethods';
import MainStorage from "pixi-project/core/MainStorage";
import {
    COLOR_COMPARE_HITS,
    COLOR_COMPARE_VALUE,
    COLOR_LABEL_DEFAULT,
} from "pixi-project/view/Styles";
import { numSeparator } from "shared/NumberHelpers";

export default class AnalyticsConnectionManager extends BaseAnalyticsManager {

    process() {
        if (this.data) {
            this.percent = this.getConversionRate(this.data['hits']);

            this.showPercent();
        }
    }

    getConversionRate(value, isCompare = false) {
      const data = this.controller.iconA.analyticsManager.data;
      const incomingValue = isCompare ? data['compare_to_data']['hits'] : data['hits'];

      if (incomingValue > 0) {
        return value / incomingValue * 100;
      } else {
        return 0;
      }
    }

    showHits() {
        if (this.data && this.view.canHaveValue) {

            if (this.data['compare_to_data']) {
                const data = this.getCompareData();

                this.view.setData([
                    [
                        { value: numSeparator(data.currentHits), color: COLOR_COMPARE_VALUE },
                        { value: `(${numSeparator(data.compareHits)})`, color: COLOR_COMPARE_HITS }
                    ]
                ]);

            } else {
                this.view.setData([numSeparator(this.data['hits'])]);
            }

        }
    }

    showPercent() {
        if (this.data && this.view.canHaveValue) {
            if (this.data['compare_to_data']) {
                const data = this.getCompareData();

                const comparePercent = this.getConversionRate(data.compareHits, true);

                this.view.setData([
                  [
                    { value: toPercent(this.percent, 2), color: COLOR_LABEL_DEFAULT },
                    { value: `(${toPercent(comparePercent, 2)})`, color: COLOR_COMPARE_HITS },
                  ],
                ]);

            } else {
                this.view.setData([toPercent(this.percent, 2)]);
            }
            this.view.updateVisibility(MainStorage.getTogglePanelStatus().numbers);
        }
    }

    onPointerOut(e) {
        super.onPointerOut(e);
        this.showPercent();
    }

    onPointerOver(e) {
        super.onPointerOver(e);
        this.showHits();
    }

}
