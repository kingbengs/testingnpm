import React from 'react';
import styles from 'react-project/Toolbar/Toolbar.module.scss';

import { When } from 'react-project/Util/When';
import { setNewLabel } from "react-project/redux/current-step/actions";
import { useDispatch, useSelector } from "react-redux";
import { selectCurrentStep } from "react-project/redux/current-step/selectors";

export const EventTracking = (props) => {
  const dispatch = useDispatch();
  const currentStep = useSelector(selectCurrentStep);
  const {isShowUrlParams,
    handleInputChangeUrlParams, onAddCustomParameter, urlParamsRows
  } = props;

  const onLabelChange = (e) => {
    dispatch(setNewLabel({ label: e.target.value, currentStep }))
  }

  const label = currentStep.object.label;

  return (
    <div className={styles.TrackingTab}>
      <div className={styles.Label}>
        <div>
          <label className={styles.FilterLabel}>
            <div className={styles.CheckboxText}>
              Trigger Settings
            </div>
          </label>
          <label className={styles.SideBarLabel}>Label</label>
          <div className={styles.LabelWrapper}>
            <input
              className={styles.RsInput}
              type="text"
              value={label}
              onChange={onLabelChange}/>
          </div>
        </div>
      </div>
      <div className={styles.Label}>
        <label className={styles.FilterLabel}>
          <input
            className={styles.Checkbox}
            type="checkbox"
            name="isShowUrlParams"
            checked={isShowUrlParams}
            onChange={handleInputChangeUrlParams}
          />
          <span className={styles.CheckboxSpan}></span>
          <div className={styles.CheckboxText}>
            Properties
          </div>
        </label>
        {urlParamsRows}
        <When condition={isShowUrlParams}>
          <button
            className={styles.AddFilterBtn}
            onClick={onAddCustomParameter}
          >
            Add Property
          </button>
        </When>
      </div>
    </div>
  );
};
