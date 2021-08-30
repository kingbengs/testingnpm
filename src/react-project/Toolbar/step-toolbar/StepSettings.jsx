import React, { useEffect, useRef, useState } from 'react';
import styles from 'react-project/Toolbar/Toolbar.module.scss';
import stepModalStyles from 'react-project/StepsModal/StepsModal.module.scss';
import iconStyles from 'react-project/components/iconList/IconList.module.scss';

import { iconSearch, iconThumbnail } from 'react-project/assets/Icons';
import { When } from 'react-project/Util/When';
import { IconList } from 'react-project/components/iconList/IconList';
import { commonSendEventFunction } from 'shared/CSharedMethods';
import { RP_EVENT_ICON_CHOSEN } from 'shared/CSharedEvents';
import { RefreshButton } from 'react-project/components/refreshButton/RefreshButton';

import { PropertyType, THUMBNAIL_TYPE } from 'shared/CSharedConstants';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectCurrentStep,
  selectThumbnailIsLoading,
} from 'react-project/redux/current-step/selectors';
import {
  getThumbnailImg,
  setNewLabel,
  setNewUrl,
  updateAnalyticsWhenUrlChanged,
} from 'react-project/redux/current-step/actions';
import { selectFunnelConfiguration } from 'react-project/redux/funnel-configuration/selectors';
import { selectInputValues } from 'react-project/redux/inputs/selectors';
import { addLastInputValue, setInputValue } from 'react-project/redux/inputs/actions';

export const StepSettings = (props) => {
  const { showUrlBlock, iconType, stepId, projectId, notifyIfValueChanged } = props;
  const [searchText, setSearchText] = useState('');

  const dispatch = useDispatch();
  const currentStep = useSelector(selectCurrentStep);
  const funnelConfiguration = useSelector(selectFunnelConfiguration);

  const inputs = useSelector(selectInputValues);

  const labelRef = useRef();
  const urlRef = useRef();
  const searchRef = useRef();

  useEffect(() => {
    if (labelRef && labelRef.current) {
      dispatch(
        setInputValue({
          type: PropertyType.LABEL,
          value: labelRef.current.value,
          stepId: currentStep.stepId,
        })
      );
    }
    if (urlRef && urlRef.current) {
      dispatch(
        setInputValue({
          type: PropertyType.URL,
          value: urlRef.current.value,
          stepId: currentStep.stepId,
        })
      );
    }
  }, [labelRef, urlRef]);

  const onLabelChange = (e) => {
    dispatch(setNewLabel({ label: e.target.value, currentStep }));
    dispatch(addLastInputValue({ type: PropertyType.LABEL, value: labelRef.current.value }));
  };

  const onGetThumbnail = (e) => {
    dispatch(getThumbnailImg({ currentStep }));
  };

  const onLabelFocus = (e) => {
    dispatch(
      setInputValue({ type: PropertyType.LABEL, value: e.target.value, stepId: currentStep.stepId })
    );
  };

  const onLabelBlur = (e) => {
    const currentValue = e.target.value;
    const pageLabel = inputs.find((el) => el.type === PropertyType.LABEL);
    const data = {
      type: PropertyType.LABEL,
      previousValue: pageLabel.previousValue,
      currentValue: currentValue,
      value: currentValue,
      stepId: currentStep.stepId,
    };
    if (notifyIfValueChanged(data)) {
      dispatch(setInputValue(data));
    }
  };

  const onUrlFocus = (e) => {
    dispatch(
      setInputValue({ type: PropertyType.URL, value: e.target.value, stepId: currentStep.stepId })
    );
  };

  const onUrlFocusOut = (e) => {
    const currentValue = e.target.value;
    const pageURL = inputs.find((el) => el.type === PropertyType.URL);
    const data = {
      type: PropertyType.URL,
      previousValue: pageURL.previousValue,
      currentValue: currentValue,
      value: currentValue,
      stepId: currentStep.stepId,
    };
    if (notifyIfValueChanged(data)) {
      dispatch(setInputValue(data));
    }

    dispatch(
      updateAnalyticsWhenUrlChanged({
        url: currentValue,
        currentStep,
        funnelConfiguration,
        projectId,
      })
    );
  };

  const onUrlChanged = (e) => {
    dispatch(setNewUrl({ url: e.target.value, currentStep }));
    dispatch(addLastInputValue({ type: PropertyType.URL, value: urlRef.current.value }));
  };

  const thumbnailIsLoading = useSelector(selectThumbnailIsLoading);

  const urlValue = currentStep.object.url;
  const label = currentStep.object.label;

  const onIconClick = ({ src, title }) => {
    commonSendEventFunction(RP_EVENT_ICON_CHOSEN, {
      stepId: stepId,
      texturePath: src,
      title: title,
    });
  };

  return (
    <div className={styles.StepSettings}>
      <div className={styles.Label}>
        <div>
          <label className={styles.SideBarLabel}>Label</label>
          <div className={styles.LabelWrapper}>
            <input
              autoFocus={true}
              ref={labelRef}
              className={styles.RsInput}
              type="text"
              value={label}
              onChange={onLabelChange}
              onFocus={onLabelFocus}
              onBlur={onLabelBlur}
            />
          </div>
        </div>
        <When condition={showUrlBlock}>
          <div>
            <label className={styles.SideBarLabel}>URL</label>
            <div className={styles.LabelWrapper}>
              <input
                ref={urlRef}
                value={urlValue}
                onChange={onUrlChanged}
                type="text"
                onFocus={onUrlFocus}
                onBlur={onUrlFocusOut}
                className={`${styles.RsInput} ${styles.UrlInput}`}
              />

              <div className={styles.ThumbnailIcon} onClick={onGetThumbnail}>
                {thumbnailIsLoading ? (
                  <RefreshButton type={THUMBNAIL_TYPE} analyticsStatus="success" loading={true} />
                ) : (
                  iconThumbnail
                )}
              </div>
            </div>
          </div>
        </When>
      </div>
      <div>
        <div className={stepModalStyles.SearchSection}>
          <h5 className={iconStyles.IconHeader}>Icons</h5>
          <div className={styles.IconsListBlock}>
            <div className={styles.SearchIcon}>{iconSearch}</div>
            <input
              placeholder="Search"
              ref={searchRef}
              className={styles.Search}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              type="text"
            />
          </div>
        </div>
        <IconList
          type={iconType}
          onIconClick={onIconClick}
          onDragEnd={() => false}
          textSearch={searchText}
        />
      </div>
    </div>
  );
};
