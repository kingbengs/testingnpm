import { DropdownBlock } from 'react-project/components/dropdown/DropdownBlock';
import styles from 'react-project/Header/Header.module.scss';
import commonDropdownStyles from 'react-project/components/dropdown/Dropdown.module.scss';
import {
  iconArrow,
  iconFitBtn,
  iconPercent,
  iconZoomDefault,
  iconZoomIn,
  iconZoomOut,
} from 'react-project/assets/Icons';
import { DropdownItem } from 'react-project/components/dropdown/DropdownItem';
import {
  TEXT_FIT_TO_SCREEN,
  TEXT_ZOOM_DEFAULT,
  TEXT_ZOOM_IN,
  TEXT_ZOOM_OUT,
  TEXTS_TOOLTIP,
} from 'react-project/Constants/texts';
import React, { forwardRef, useEffect } from 'react';
import cls from 'classnames';
import { Tooltip } from 'react-project/components/tooltip/Tooltip';
import { Dropdown } from 'react-project/components/dropdown/Dropdown';
import { ClickOutsideCustomComponent } from '../Util/ClickOutsideCustom';
import { CANVAS_ACTION_NAMES } from "react-project/Constants/canvasActionNames";

const ZoomDropdownTrigger = forwardRef(({ isOpen, value, ...rest }, ref) => {
  return (
    <div ref={ref} className={styles.ZoomDropdownTrigger} {...rest}>
      <Tooltip label={TEXTS_TOOLTIP.ZOOM_VIEW_OPTIONS}>
        <div className={styles.ZoomDropdownTriggerContent}>
          <div className={styles.ZoomDropdownTriggerValue}>{value}%</div>
          <div className={cls(styles.TriggerIcon, { [styles.TriggerIconOpened]: isOpen })}>
            {iconArrow}
          </div>
        </div>
      </Tooltip>
    </div>
  );
});

export const ZoomDropdown = ({
  zoomValue,
  draftedZoom,
  handleZoomInputChange,
  handleZoomInputAccept,
  zoomIn,
  zoomOut,
  zoomReset,
  fitToScreenEvent,
  dropdownOpened,
  setDropdownOpened,
  acceptCurrentZoom,
}) => {
  return (
    <ClickOutsideCustomComponent
      onClickOutside={() => {
        setDropdownOpened(false);
        acceptCurrentZoom();
      }}
    >
      <Dropdown
        contentClassName={styles.ZoomDropdownContent}
        triggerSlot={<ZoomDropdownTrigger value={zoomValue} />}
        className={styles.ZoomDropdown}
        onToggle={(opened) => setDropdownOpened(opened)}
        isOpen={dropdownOpened}
        position="right"
      >
        <div className={cls(commonDropdownStyles.CommonDropdownItems, styles.ZoomDropdownContent)}>
          <DropdownBlock isBorder>
            <div className={styles.ZoomInputWrapper} key="block-1">
              <input
                type="text"
                autoFocus={true}
                value={draftedZoom}
                onChange={handleZoomInputChange}
                onKeyDown={handleZoomInputAccept}
              />
              <div className={styles.ZoomInputIcon}>{iconPercent}</div>
            </div>
          </DropdownBlock>
          <DropdownBlock key="block-2">
            <DropdownItem
              icon={iconZoomIn}
              onClick={zoomIn}
              label={TEXT_ZOOM_IN}
              actionName={CANVAS_ACTION_NAMES.ZOOM_IN}
              key={TEXT_ZOOM_IN}
            />
            <DropdownItem
              icon={iconZoomOut}
              onClick={zoomOut}
              label={TEXT_ZOOM_OUT}
              actionName={CANVAS_ACTION_NAMES.ZOOM_OUT}
              key={TEXT_ZOOM_OUT}
            />
            <DropdownItem
              icon={iconZoomDefault}
              onClick={zoomReset}
              label={TEXT_ZOOM_DEFAULT}
              actionName={CANVAS_ACTION_NAMES.RESET_ZOOM}
              key={TEXT_ZOOM_DEFAULT}
            />
            <DropdownItem
              icon={iconFitBtn}
              onClick={fitToScreenEvent}
              label={TEXT_FIT_TO_SCREEN}
              actionName={CANVAS_ACTION_NAMES.FIT_TO_SCREEN}
              key={TEXT_FIT_TO_SCREEN}
            />
          </DropdownBlock>
        </div>
      </Dropdown>
    </ClickOutsideCustomComponent>
  );
};
