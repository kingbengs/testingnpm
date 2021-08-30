import React from "react";
import styles from "react-project/Toolbar/Toolbar.module.scss";

import { When } from "react-project/Util/When";
import { setNewUrl, updateAnalyticsWhenUrlChanged } from "react-project/redux/current-step/actions";
import { useDispatch, useSelector } from "react-redux";
import { selectCurrentStep } from "react-project/redux/current-step/selectors";
import { selectFunnelConfiguration } from "react-project/redux/funnel-configuration/selectors";

export const PageTracking = (props) => {
  const {
    isShowUrlParams,
    onAddCustomParameter,
    urlParamsRows,
    handleFilterPageByUrlChange,
    projectId,
  } = props;

  const dispatch = useDispatch();
  const currentStep = useSelector(selectCurrentStep);
  const funnelConfiguration = useSelector(selectFunnelConfiguration);

  const onUrlFocusOut = (e) => {
    dispatch(
      updateAnalyticsWhenUrlChanged({
        url: e.target.value,
        currentStep,
        funnelConfiguration,
        projectId,
      })
    );
  };

  const onUrlChanged = (e) => {
    dispatch(setNewUrl({ url: e.target.value, currentStep }));
  };

  const urlValue = currentStep.object.url;

  return (
    <div className={styles.TrackingTab}>
      <div className={styles.Label}>
        <div>
          <label className={styles.SideBarLabel}>URL</label>
          <div className={styles.LabelWrapper}>
            <input
              autoFocus={true}
              value={urlValue}
              onChange={onUrlChanged}
              type="text"
              className={`${styles.RsInput}`}
              onBlur={onUrlFocusOut}
            />
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
            onChange={handleFilterPageByUrlChange}
          />
          <span className={styles.CheckboxSpan}></span>
          <div className={styles.CheckboxText}>Filter Page by URL Parameters</div>
        </label>
        {urlParamsRows}
        <When condition={isShowUrlParams}>
          <button className={styles.AddFilterBtn} onClick={onAddCustomParameter}>
            + Add Custom Parameter
          </button>
        </When>
      </div>
    </div>
  );
};
