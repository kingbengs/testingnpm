import React, { useEffect, useRef } from 'react';
import styles from 'react-project/Toolbar/Toolbar.module.scss';
import dropdownStyles from 'react-project/components/dropdown/Dropdown.module.scss';
import { commonSendEventFunction } from 'shared/CSharedMethods';
import {
  icon3Dots,
  iconBringForward,
  iconBringToFront,
  iconCopy,
  iconRemove,
  iconSendBackward,
  iconSendToBack,
  iconThumbnail,
  iconDuplicate,
} from 'react-project/assets/Icons';
import { CommonDropdown } from '../components/dropdown/CommonDropdown';
import noop from 'lodash/noop';
import { DropdownBlock } from 'react-project/components/dropdown/DropdownBlock';
import { DropdownItem } from 'react-project/components/dropdown/DropdownItem';
import { When } from 'react-project/Util/When';
import { RefreshButton } from 'react-project/components/refreshButton/RefreshButton';
import { PropertyType, THUMBNAIL_TYPE } from 'shared/CSharedConstants';
import { TEXT_SETTINGS_LABEL, TEXT_SETTINGS_THUMBNAIL_URL } from 'react-project/Constants/texts';
import cls from 'classnames';
import {
  RP_EVENT_DELETE_PRESSED,
  RP_EVENT_COPY_PRESSED,
  RP_EVENT_DUPLICATE_PRESSED,
  PR_EVENT_BRING_FORWARD,
  PR_EVENT_BRING_TO_FRONT,
  PR_EVENT_SEND_BACKWARD,
  PR_EVENT_SEND_TO_BACK,
} from 'shared/CSharedEvents';
import { TEXTS_TOOLTIP } from 'react-project/Constants/texts';
import { Tooltip } from 'react-project/components/tooltip/Tooltip';
import { useDispatch, useSelector } from 'react-redux';
import {
  getThumbnailImg,
  setNewLabel,
  setNewUrl,
  updateAnalyticsWhenUrlChanged,
} from 'react-project/redux/current-step/actions';
import {
  selectCurrentStep,
  selectThumbnailIsLoading,
} from 'react-project/redux/current-step/selectors';
import { EElementTypes } from 'shared/CSharedCategories';
import { selectFunnelConfiguration } from 'react-project/redux/funnel-configuration/selectors';
import { addLastInputValue, setInputValue } from 'react-project/redux/inputs/actions';
import { selectInputValues } from 'react-project/redux/inputs/selectors';
import { CANVAS_ACTION_NAMES } from "react-project/Constants/canvasActionNames";

const LABELS = {
  DUPLICATE: 'Duplicate',
  COPY: 'Copy',
  DELETE: 'Delete',
  BRING_FORWARD: 'Bring forward',
  BRING_TO_FRONT: 'Bring to front',
  SEND_BACKWARD: 'Send backward',
  SEND_TO_BACK: 'Send to back',
};

const DropdownTrigger = ({ isOpen, ...rest }) => (
  <Tooltip label={TEXTS_TOOLTIP.MORE}>
    <div className={styles.Icon3Dots} {...rest}>
      {icon3Dots}
    </div>
  </Tooltip>
);

export const ContextMenu = ({
  dropdownTrigger = true,
  position = 'right',
  showLabel,
  projectId,
  onItemSelect = noop,
  notifyIfValueChanged = noop,
}) => {
  const dispatch = useDispatch();
  const currentStep = useSelector(selectCurrentStep);
  const funnelConfiguration = useSelector(selectFunnelConfiguration);
  const inputs = useSelector(selectInputValues);

  const labelRef = useRef();
  const urlRef = useRef();

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

  const onGetThumbnail = (e) => {
    dispatch(getThumbnailImg({ currentStep }));
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
        url: e.target.value,
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

  const onUrlFocus = (e) => {
    dispatch(
      setInputValue({ type: PropertyType.URL, value: e.target.value, stepId: currentStep.stepId })
    );
  };

  const thumbnailIsLoading = useSelector(selectThumbnailIsLoading);

  const urlValue = currentStep.object.url;
  const label = currentStep.object.label;
  const showUrlBlock = currentStep.object.type === EElementTypes.PAGE;

  const onSelect = (item) => {
    switch (item.label) {
      case LABELS.DUPLICATE:
        commonSendEventFunction(RP_EVENT_DUPLICATE_PRESSED);
        onItemSelect();
        break;
      case LABELS.COPY:
        commonSendEventFunction(RP_EVENT_COPY_PRESSED);
        onItemSelect();
        break;
      case LABELS.DELETE:
        commonSendEventFunction(RP_EVENT_DELETE_PRESSED);
        onItemSelect();
        break;
      case LABELS.BRING_FORWARD:
        commonSendEventFunction(PR_EVENT_BRING_FORWARD);
        onItemSelect();
        break;
      case LABELS.BRING_TO_FRONT:
        commonSendEventFunction(PR_EVENT_BRING_TO_FRONT);
        onItemSelect();
        break;
      case LABELS.SEND_BACKWARD:
        commonSendEventFunction(PR_EVENT_SEND_BACKWARD);
        onItemSelect();
        break;
      case LABELS.SEND_TO_BACK:
        commonSendEventFunction(PR_EVENT_SEND_TO_BACK);
        onItemSelect();
        break;
      default:
        noop();
        onItemSelect();
        break;
    }
  };

  const DROPDOWN_ITEMS = [
    <DropdownBlock isBorder key="block-2">
      <DropdownItem
        key={LABELS.COPY}
        label={LABELS.COPY}
        icon={iconCopy}
        actionName={CANVAS_ACTION_NAMES.COPY}
        onClick={() => onSelect({ label: LABELS.COPY })}
      />
      <DropdownItem
        key={LABELS.DUPLICATE}
        label={LABELS.DUPLICATE}
        icon={iconDuplicate}
        actionName={CANVAS_ACTION_NAMES.DUPLICATE}
        onClick={() => onSelect({ label: LABELS.DUPLICATE })}
      />
      <DropdownItem
        key={LABELS.DELETE}
        label={LABELS.DELETE}
        icon={iconRemove}
        actionName={CANVAS_ACTION_NAMES.DELETE}
        onClick={() => onSelect({ label: LABELS.DELETE })}
      />
    </DropdownBlock>,
    <DropdownBlock key="block-3">
      <DropdownItem
        key={LABELS.BRING_FORWARD}
        label={LABELS.BRING_FORWARD}
        icon={iconBringForward}
        actionName={CANVAS_ACTION_NAMES.BRING_FORWARD}
        onClick={() => onSelect({ label: LABELS.BRING_FORWARD })}
      />
      <DropdownItem
        key={LABELS.BRING_TO_FRONT}
        label={LABELS.BRING_TO_FRONT}
        icon={iconBringToFront}
        actionName={CANVAS_ACTION_NAMES.BRING_TO_FRONT}
        onClick={() => onSelect({ label: LABELS.BRING_TO_FRONT })}
      />
      <DropdownItem
        key={LABELS.SEND_BACKWARD}
        label={LABELS.SEND_BACKWARD}
        icon={iconSendBackward}
        actionName={CANVAS_ACTION_NAMES.SEND_BACKWARD}
        onClick={() => onSelect({ label: LABELS.SEND_BACKWARD })}
      />
      <DropdownItem
        key={LABELS.SEND_TO_BACK}
        label={LABELS.SEND_TO_BACK}
        icon={iconSendToBack}
        actionName={CANVAS_ACTION_NAMES.SEND_TO_BACK}
        onClick={() => onSelect({ label: LABELS.SEND_TO_BACK })}
      />
    </DropdownBlock>,
  ];

  if (showLabel) {
    DROPDOWN_ITEMS.unshift(
      <DropdownBlock isBorder key="block-1">
        <div className={styles.Settings}>
          <div className={cls(styles.SettingsLabel, styles.InputWithLabel)}>
            <label>{TEXT_SETTINGS_LABEL}</label>
            <input
              autoFocus={true}
              ref={labelRef}
              className={styles.Input}
              type="text"
              value={label}
              onChange={onLabelChange}
              onFocus={onLabelFocus}
              onBlur={onLabelBlur}
            />
          </div>

          <When condition={showUrlBlock}>
            <div className={cls(styles.SettingsThumbnail, styles.InputWithLabel)}>
              <label>{TEXT_SETTINGS_THUMBNAIL_URL}</label>
              <input
                ref={urlRef}
                value={urlValue}
                onChange={onUrlChanged}
                type="text"
                onBlur={onUrlFocusOut}
                onFocus={onUrlFocus}
                className={`${styles.Input} ${styles.ThumbnailUrlInput}`}
              />
              <div
                className={cls(styles.ThumbnailIcon, {
                  [styles.IconWithoutHover]: thumbnailIsLoading,
                })}
                onClick={onGetThumbnail}
              >
                {thumbnailIsLoading ? (
                  <RefreshButton
                    type={THUMBNAIL_TYPE}
                    analyticsStatus="success"
                    loading={true}
                    loaderClassName={styles.ThumbnailLoading}
                  />
                ) : (
                  iconThumbnail
                )}
              </div>
            </div>
          </When>
        </div>
      </DropdownBlock>
    );
  }

  if (dropdownTrigger) {
    return (
      <CommonDropdown
        items={DROPDOWN_ITEMS}
        dropdownTrigger={<DropdownTrigger />}
        position={position}
        className={styles.ContextMenuDropdown}
        contentClassName={styles.ContextMenuDropdownContent}
      />
    );
  } else {
    return <div className={dropdownStyles.ContextMenuWithoutDropdown}>{[...DROPDOWN_ITEMS]}</div>;
  }
};
