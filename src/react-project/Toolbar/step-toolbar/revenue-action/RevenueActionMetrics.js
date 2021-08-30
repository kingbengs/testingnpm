import React from 'react';
import PropTypes from 'prop-types';
import styles from './RevenueAction.module.scss';

import { Slider } from 'react-project/components/checkbox/Slider';

const RevenueActionMetricsComponent = ({
  isTotalRevenueSelected,
  onTotalRevenueToggle,
  isTotalCustomersSelected,
  onTotalCustomersToggle,
  isAvgPerCustomerSelected,
  onAvgPerCustomerToggle,
}) => {
  return (
    <div className={styles.MetricsDropdownContent}>
      <h6 className={styles.MetricsDropdownContentTitle}>Revenue Metrics</h6>
      <p className={styles.MetricsDropdownContentHint}>Select what to display on canvas</p>
      <div>
        <div className={styles.MetricItem}>
          <Slider
            isChecked={isTotalRevenueSelected}
            onClick={() => {
              onTotalRevenueToggle(!isTotalRevenueSelected);
            }}
          />
          <span className={styles.MetricItemName}>Total revenue</span>
        </div>
        <div className={styles.MetricItem}>
          <Slider
            isChecked={isTotalCustomersSelected}
            onClick={() => {
              onTotalCustomersToggle(!isTotalCustomersSelected);
            }}
          />
          <span className={styles.MetricItemName}>Total customers</span>
        </div>
        <div className={styles.MetricItem}>
          <Slider
            isChecked={isAvgPerCustomerSelected}
            onClick={() => {
              onAvgPerCustomerToggle(!isAvgPerCustomerSelected);
            }}
          />
          <span className={styles.MetricItemName}>Avg. value per customer</span>
        </div>
      </div>
    </div>
  );
};

RevenueActionMetricsComponent.propTypes = {
  isTotalRevenueSelected: PropTypes.bool.isRequired,
  onTotalRevenueToggle: PropTypes.func.isRequired,
  isTotalCustomersSelected: PropTypes.bool.isRequired,
  onTotalCustomersToggle: PropTypes.func.isRequired,
  isAvgPerCustomerSelected: PropTypes.bool.isRequired,
  onAvgPerCustomerToggle: PropTypes.func.isRequired,
};

export const RevenueActionMetrics = RevenueActionMetricsComponent;
