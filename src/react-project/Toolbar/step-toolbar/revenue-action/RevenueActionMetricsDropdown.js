import React, { useState } from 'react';
import cls from 'classnames';

import { Dropdown } from 'react-project/components/dropdown/Dropdown';
import { iconArrow, iconLayers } from 'react-project/assets/Icons';

import styles from './RevenueAction.module.scss';
import { RevenueActionMetrics } from './RevenueActionMetrics';
import { ClickOutsideCustomComponent } from "../../../Util/ClickOutsideCustom";

const MetricsDropdownTrigger = ({ isOpen, metricsCount, enabledMetricsCount, ...rest }) => {
  return (
    <div className={styles.MetricsDropdownTrigger} {...rest}>
      <div className={styles.MetricsDropdownTriggerLayersIcon}>{iconLayers}</div>
      <span className={styles.MetricsDropdownTriggerText}>
        Display Revenue Data ({enabledMetricsCount}/{metricsCount})
      </span>
      <div className={cls(styles.TriggerIcon, { [styles.TriggerIconOpened]: isOpen })}>
        {iconArrow}
      </div>
    </div>
  );
};

const RevenueActionMetricsDropdownComponent = ({
  isTotalRevenueSelected,
  isTotalCustomersSelected,
  isAvgPerCustomerSelected,
  setIsTotalRevenueSelected,
  setIsTotalCustomersSelected,
  setIsAvgPerCustomerSelected,
}) => {
  const [isMetricsDropdownOpened, setIsMetricsDropdownOpened] = useState(false);
  const enabledMetricsCount =
    Number(isTotalRevenueSelected) +
    Number(isTotalCustomersSelected) +
    Number(isAvgPerCustomerSelected);

  return (
    <div className={styles.Metrics}>
      <ClickOutsideCustomComponent
        onClickOutside={() => setIsMetricsDropdownOpened(false)}
      >
        <Dropdown
          triggerSlot={
            <MetricsDropdownTrigger
              metricsCount={3}
              enabledMetricsCount={enabledMetricsCount}
              isOpen={isMetricsDropdownOpened}
            />
          }
          isOpen={isMetricsDropdownOpened}
          onToggle={(o) => setIsMetricsDropdownOpened(o)}
        >
          <RevenueActionMetrics
            isAvgPerCustomerSelected={isAvgPerCustomerSelected}
            isTotalCustomersSelected={isTotalCustomersSelected}
            isTotalRevenueSelected={isTotalRevenueSelected}
            onAvgPerCustomerToggle={setIsAvgPerCustomerSelected}
            onTotalCustomersToggle={setIsTotalCustomersSelected}
            onTotalRevenueToggle={setIsTotalRevenueSelected}
          />
        </Dropdown>
      </ClickOutsideCustomComponent>
    </div>
  );
};

export const RevenueActionMetricsDropdown = RevenueActionMetricsDropdownComponent;
