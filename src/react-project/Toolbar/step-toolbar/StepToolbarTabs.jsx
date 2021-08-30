import React from 'react';
import cls from 'classnames';

import { iconSettings, iconTracking } from 'react-project/assets/Icons';
import styles from 'react-project/Toolbar/Toolbar.module.scss';
import {
  STEP_SETTINGS_TAB_NAME,
  STEP_TRACKING_TAB_NAME,
  STEP_BORDER_COLOR_TAB_NAME,
  STEP_FILL_COLOR_TAB_NAME,
  ItemsWithLabelCustomization,
} from 'react-project/Constants/step-settings';
import { When } from 'react-project/Util/When';
import { getColorClass } from 'react-project/Util/ColorPicker';
import { ContextMenu } from 'react-project/Toolbar/ContextMenu';
import { Tooltip } from 'react-project/components/tooltip/Tooltip';
import { TEXTS_TOOLTIP } from 'react-project/Constants/texts';
import { EElementTypes } from "shared/CSharedCategories";
import { ActionTypes } from "shared/CSharedConstants";

const TABS = new Map([
  [
    STEP_SETTINGS_TAB_NAME,
    {
      icon: iconSettings,
      className: styles.IconSettings,
      classNameActive: styles.StepToolbarTabActive,
      title: 'SETTINGS',
    },
  ],
  [
    STEP_TRACKING_TAB_NAME,
    {
      icon: iconTracking,
      className: styles.IconTracking,
      classNameActive: styles.StepToolbarTabActive,
      title: 'TRACKING',
    },
  ],
  [
    STEP_BORDER_COLOR_TAB_NAME,
    {
      icon: '',
      className: styles.ShapeToolbarTab,
      classNameActive: styles.ShapeToolbarTabActive,
      title: '',
      toolTipsTitle: TEXTS_TOOLTIP.BORDER_COLOR,
    },
  ],
  [
    STEP_FILL_COLOR_TAB_NAME,
    {
      icon: '',
      className: styles.ShapeToolbarTab,
      classNameActive: styles.ShapeToolbarTabActive,
      title: '',
      toolTipsTitle: TEXTS_TOOLTIP.FILL_COLOR,
    },
  ],
]);

export const StepToolbarTabs = (props) => {
  const { shapeStyle, selectedTab, onSelectTab, tabs, notifyIfValueChanged, onCloseMenu } = props;

  const tabsClassName = cls(styles.StepToolbarSection, styles.StepToolbarTabs);

  const renderTab = (tab, tabClassName) => {
    const isCommerceAction = props.currentStep.object.actionType === ActionTypes.COMMERCE;
    const isDisabledStep =
      tab === STEP_TRACKING_TAB_NAME && props.iconType === EElementTypes.EVENT && !isCommerceAction;
    const stepTab = (
      <button
        key={tab}
        className={tabClassName}
        onClick={() => (!isDisabledStep ? onSelectTab(tab) : false)}
      >
        {TABS.get(tab).icon}
        <When condition={Boolean(TABS.get(tab).title)}>
          <span className={styles.StepToolbarTabText}>{TABS.get(tab).title}</span>
        </When>
      </button>
    );

    return isDisabledStep ? (
      <Tooltip key={tab} label={TEXTS_TOOLTIP.ADVANCED_TRACKING_SETUP_UNAVAILABLE}>
        {stepTab}
      </Tooltip>
    ) : (
      stepTab
    );
  };

  return (
    <div className={tabsClassName}>
      {tabs.map((tab) => {
        const tabClassName = cls(styles.StepToolbarTab, TABS.get(tab).className, {
          [TABS.get(tab).classNameActive]: selectedTab === tab,
          [styles[`Border${getColorClass(shapeStyle.borderColor)}`]]:
            tab === STEP_BORDER_COLOR_TAB_NAME,
          [styles[`Fill${getColorClass(shapeStyle.fillColor)}`]]: tab === STEP_FILL_COLOR_TAB_NAME,
        });

        return [STEP_BORDER_COLOR_TAB_NAME, STEP_FILL_COLOR_TAB_NAME].includes(tab) ? (
          <Tooltip key={tab} label={TABS.get(tab).toolTipsTitle}>
            <div className={tabClassName} onClick={() => onSelectTab(tab)}>
              <div
                className={
                  tab === STEP_BORDER_COLOR_TAB_NAME ? styles.WrapperShape : styles.WrapperShapeFill
                }
              >
                <button></button>
              </div>
            </div>
          </Tooltip>
        ) : (
          renderTab(tab, tabClassName)
        );
      })}
      <ContextMenu
        showLabel={ItemsWithLabelCustomization.includes(props.currentStep.object.type)}
        onCloseMenu={onCloseMenu}
        notifyIfValueChanged={notifyIfValueChanged}
      />
    </div>
  );
};
