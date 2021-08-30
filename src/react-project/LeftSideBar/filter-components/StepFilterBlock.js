import React, { useEffect, useRef } from "react";
import styles from "react-project/LeftSideBar/LeftSideBar.module.scss";
import { iconClose, iconStep } from "react-project/assets/Icons";
import { When } from "react-project/Util/When";
import cls from "classnames";
import { ClickOutsideCustomComponent } from "react-project/Util/ClickOutsideCustom";

import { RP_ANALYTICS_PWP_TOOL_ACTIVATED } from "shared/CSharedEvents";
import PropTypes from "prop-types";
import { commonSendEventFunction } from "shared/CSharedMethods";
import {
  TEXT_CLEAR_PEOPLE_PERFORMED,
  TEXT_INFO_PEOPLE_PERFORMED,
} from "react-project/Constants/texts";

import { getDirtyStyle, getFilterAddClass } from "react-project/Util/FilterStyleHelper";
import { useDispatch } from "react-redux";
import { setStepFilterOpened } from "react-project/redux/focused-step/actions";
import {
  FILTER_ITEM_PADDING_WIDTH,
  FILTER_TYPE_COMPARE,
  FILTER_TYPE_COMPARE_STEP,
  FILTER_TYPE_DEFAULT,
  FILTER_TYPE_DEFAULT_STEP,
  HEADER_HEIGHT,
  LEFT_SIDEBAR_WIDTH,
} from "shared/CSharedConstants";
import { hasScrollBar } from "react-project/Util/hasScrollBar";
import { getRefPosition } from "react-project/Util/getRefPosiiton";

export const DEFAULT_STEP_LABEL = "Select a step";

const CONVERT_TYPE = {
  [FILTER_TYPE_COMPARE]: FILTER_TYPE_COMPARE_STEP,
  [FILTER_TYPE_DEFAULT]: FILTER_TYPE_DEFAULT_STEP,
};

export const StepFilterBlock = ({ type, selectedStep, onClearStep }) => {
  const dispatch = useDispatch();

  const toggleOpenedFilter = (e, value) => {
    dispatch(
      setStepFilterOpened({
        id: type,
        value: value ? value : !selectedStep.opened,
        selectedStep: selectedStep.selectedValue,
      })
    );
  };

  useEffect(() => {
    commonSendEventFunction(RP_ANALYTICS_PWP_TOOL_ACTIVATED, {
      opened: selectedStep.opened,
      type: CONVERT_TYPE[selectedStep.id],
    });
  }, [selectedStep.opened]);

  const ref = useRef();
  const position = getRefPosition(ref);
  const sidebar = document.getElementById('left-sidebar-wrapper');

  return (
    <ClickOutsideCustomComponent
      ignoreClickOutside={!selectedStep.opened}
      onClickOutside={(e) => toggleOpenedFilter(e, false)}
    >
      <div
        className={cls(styles.FiltersItem, getFilterAddClass(type), {
          [styles.ActiveFilter]: selectedStep.opened,
          [getDirtyStyle(type)]: selectedStep.selectedValue !== null,
        })}
        ref={ref}
      >
        <div className={styles.ItemsForSelection} onClick={toggleOpenedFilter}>
          <span>
            People who performed:
            <span className={`${styles.CountriesTitle}`}>
              {selectedStep.selectedValue?.label || DEFAULT_STEP_LABEL}
            </span>
          </span>
          <div>{iconStep}</div>
        </div>
        <When condition={selectedStep.opened}>
          <div
            className={styles.StepFilterWrapper}
            style={{
              position: 'absolute',
              top: position.y - HEADER_HEIGHT,
              left: LEFT_SIDEBAR_WIDTH + (hasScrollBar(sidebar) ? 0 : FILTER_ITEM_PADDING_WIDTH),
              zIndex: 2,
            }}
          >
            <div className={`${styles.SectionItem} ${styles.StepItem}`} onClick={onClearStep}>
              {selectedStep.selectedValue
                ? TEXT_CLEAR_PEOPLE_PERFORMED
                : TEXT_INFO_PEOPLE_PERFORMED}
            </div>
            <div className={styles.CloseIcon} onClick={(e) => toggleOpenedFilter(e, false)}>
              {iconClose}
            </div>
          </div>
        </When>
      </div>
    </ClickOutsideCustomComponent>
  );
};

StepFilterBlock.propType = {
  selectedStep: PropTypes.shape({
    label: PropTypes.string.isRequired,
  }),
  onSelectStep: PropTypes.func.isRequired,
  onSetStepFocusingId: PropTypes.func.isRequired,
};
