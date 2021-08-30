import BaseAnalyticsManager from "pixi-project/core/BaseAnalyticsManager";
import { roundTo, toPercent } from 'shared/CSharedMethods';
import SharedElementHelpers from "shared/SharedElementHelpers";
import { numSeparator } from "shared/NumberHelpers";
import {
    COLOR_COMPARE_HITS, COLOR_COMPARE_LABEL,
    COLOR_COMPARE_PERCENT_POSITIVE,
    COLOR_COMPARE_PERCENT_NEGATIVE,
    COLOR_COMPARE_VALUE, COLOR_LABEL_DEFAULT,
} from 'pixi-project/view/Styles';

export default class AnalyticsStepManager extends BaseAnalyticsManager {

    constructor(controller, view, data = null) {
        super(controller, view, data);
        this.currency = '$';
        this.filterData = {
          dataFilter: [],
          displayFilter: {
            avgValuePerCustomer: true,
            totalCustomers: true,
            totalRevenew: true,
          }
        }
    }

    process() {
        if (this.data) {
            if (this.controller.isDependentAction) {
                const inbound = this.controller.incomingConnections[0].getOtherSide(this.controller);
                if (inbound) {
                    if (inbound.hasAnalyticsData() && inbound.value > 0) {
                        const value = this.data.hits;
                        this.percent = value / inbound.value * 100;
                    } else {
                        this.percent = 0;
                    }
                    this.showPercent();
                } else {
                    console.warn("No incomming connection");
                }
            } else if (this.data.is_commerce) {
                this.showDetails();
            } else {
                this.showHits();
            }
        }
    }

    updateFilter(filterData) {
        // TODO , the data that we receive needs to be stored at the backend.
        this.filterData = filterData;
        this.process();
    }

    showDetails() {
        if (this.data['compare_to_data']) {
            this.showCompareDetails();
        } else {
            const revenue = this.data.total_revenue_in_cents / 100;
            const customers = this.data.hits;
            const avgValue = (revenue / customers) || 0;

            let displayData = [];

            if (this.filterData && this.filterData.displayFilter && this.filterData.displayFilter.totalRevenew) {
                displayData.push([
                    { value: 'Total Revenue:', color: COLOR_COMPARE_LABEL },
                    { value: `${this.currency}${numSeparator(roundTo(revenue, 2))}`, color: COLOR_COMPARE_VALUE }
                ]);
            }

            if (this.filterData && this.filterData.displayFilter && this.filterData.displayFilter.totalCustomers) {
                displayData.push([
                    { value: 'Total Customers:', color: COLOR_COMPARE_LABEL },
                    { value: `${customers}`, color: COLOR_COMPARE_VALUE }
                ]);
            }

            if (this.filterData && this.filterData.displayFilter && this.filterData.displayFilter.avgValuePerCustomer) {
                displayData.push([
                    { value: 'Average Customer Value:', color: COLOR_COMPARE_LABEL },
                    { value: `${this.currency}${numSeparator(roundTo(avgValue, 2))}`, color: COLOR_COMPARE_VALUE }
                ]);
            }

            this.view.setData(displayData);
        }
    }

    showCompareDetails() {
        const revenue = this.data.total_revenue_in_cents / 100;
        const customers = this.data.hits;
        const avgValue = (revenue / customers) || 0;

        const compare_revenue = this.data['compare_to_data'].total_revenue_in_cents / 100;
        const compare_customers = this.data['compare_to_data'].hits;
        const compare_avgValue = (compare_revenue / compare_customers) || 0;

        let revenuePercent = this.parsePercent(revenue / compare_revenue);
        let customersPercent = this.parsePercent(customers / compare_customers);
        let avgPercent = this.parsePercent(avgValue / compare_avgValue);

        let displayData = [];

        if (this.filterData && this.filterData.displayFilter && this.filterData.displayFilter.totalRevenew) {
            const color = this.isPositive(revenuePercent) ? COLOR_COMPARE_PERCENT_POSITIVE : COLOR_COMPARE_PERCENT_NEGATIVE;
            const percentColor = this.isZero(revenuePercent) ? COLOR_COMPARE_LABEL : color;
            displayData.push(
                [
                    { value: `Total Revenue:`, color: COLOR_COMPARE_LABEL },
                    { value: `${this.currency}${numSeparator(roundTo(revenue, 2))}`, color: COLOR_COMPARE_VALUE },
                    { value: `(${this.currency}${numSeparator(roundTo(compare_revenue, 2))})`, color: COLOR_COMPARE_HITS },
                    { value: `${toPercent(revenuePercent, 1)}`, color: percentColor }
                ]
            );
        }

        if (this.filterData && this.filterData.displayFilter && this.filterData.displayFilter.totalCustomers) {
            const color = this.isPositive(customersPercent) ? COLOR_COMPARE_PERCENT_POSITIVE : COLOR_COMPARE_PERCENT_NEGATIVE;
            const percentColor = this.isZero(customersPercent) ? COLOR_COMPARE_LABEL : color;
            displayData.push(
                [
                    { value: `Total Customers:`, color: COLOR_COMPARE_LABEL },
                    { value: `${customers}`, color: COLOR_COMPARE_VALUE },
                    { value: `(${compare_customers})`, color: COLOR_COMPARE_HITS },
                    { value: `${toPercent(customersPercent, 1)}`, color: percentColor }
                ]
            );
        }

        if (this.filterData && this.filterData.displayFilter && this.filterData.displayFilter.avgValuePerCustomer) {
            const color = this.isPositive(avgPercent) ? COLOR_COMPARE_PERCENT_POSITIVE : COLOR_COMPARE_PERCENT_NEGATIVE;
            const percentColor = this.isZero(avgPercent) ? COLOR_COMPARE_LABEL : color;
            displayData.push(
                [
                    { value: `Average Customer Value:`, color: COLOR_COMPARE_LABEL },
                    { value: `${this.currency}${numSeparator(roundTo(avgValue, 2))}`, color: COLOR_COMPARE_VALUE },
                    { value: `(${this.currency}${numSeparator(roundTo(compare_avgValue, 2))})`, color: COLOR_COMPARE_HITS },
                    { value: `${toPercent(avgPercent, 1)}`, color: percentColor }
                ]
            );
        }

        this.view.setData(displayData);
    }

    onPointerOut(e) {
        super.onPointerOut(e);
        if (SharedElementHelpers.IsAction(this.controller) && this.controller.isDependentAction) {
            this.showPercent();
        }
    }

    onPointerOver(e) {
        super.onPointerOver(e);
        if (SharedElementHelpers.IsAction(this.controller) && this.controller.isDependentAction) {
            this.showHits();
        }
    }

    showHits() {
        if (this.data && this.view.canHaveValue) {
            if (this.data['compare_to_data']) {
                const data = this.getCompareData();

                const color = this.isPositive(data.percent) ? COLOR_COMPARE_PERCENT_POSITIVE : COLOR_COMPARE_PERCENT_NEGATIVE;
                const percentColor = this.isZero(data.percent) ? COLOR_COMPARE_LABEL : color;

                this.view.setData([
                    [
                        { value: numSeparator(data.currentHits), color: COLOR_LABEL_DEFAULT },
                        { value: `(${numSeparator(data.compareHits)})`, color: COLOR_COMPARE_HITS }
                    ],
                    { value: toPercent(data.percent, 1), color: percentColor }
                ]);

            } else {
                const hits = numSeparator(this.data['hits']);
                this.view.setData([hits]);
            }
        }
    }

}
