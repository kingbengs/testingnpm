import React, { forwardRef } from 'react';
import { Dropdown } from 'react-project/components/dropdown/Dropdown';
import { DropdownBlock } from 'react-project/components/dropdown/DropdownBlock';
import styles from 'react-project/Header/Header.module.scss';
import cls from 'classnames';
import { iconArrow, iconVersionHistory } from 'react-project/assets/Icons';
import { ClickOutsideCustomComponent } from '../Util/ClickOutsideCustom';
import { DropdownItem } from "react-project/components/dropdown/DropdownItem";
import { TEXT_VERSION_HISTORY } from "react-project/Constants/texts";

const DropdownTrigger = forwardRef(({ canvasName, isOpen, value, ...rest }, ref) => {
  return (
    <div ref={ref} className={styles.HeaderActionsDropdownTrigger} {...rest}>
        <div className={styles.CanvasName}>{canvasName}</div>
        <div className={cls(styles.TriggerIcon, { [styles.TriggerIconOpened]: isOpen })}>
          {iconArrow}
        </div>
    </div>
  );
});

export const HeaderActionsDropdown = ({ setDropdownOpened, dropdownOpened, canvasName, openVersionHistory }) => {
  return (
    <Dropdown
      contentClassName={styles.HeaderActionsDropdownContent}
      triggerSlot={<DropdownTrigger canvasName={canvasName} />}
      className={styles.HeaderActionsDropdown}
      onToggle={(opened) => setDropdownOpened(opened)}
      isOpen={dropdownOpened}
      position="right"
    >
      <ClickOutsideCustomComponent
        onClickOutside={() => {
          setDropdownOpened(false);
        }}
      >
        <DropdownBlock key="block-1">
          <DropdownItem
            icon={iconVersionHistory}
            onClick={openVersionHistory}
            label={TEXT_VERSION_HISTORY}
            key={TEXT_VERSION_HISTORY}
          />
        </DropdownBlock>
      </ClickOutsideCustomComponent>
    </Dropdown>
  );
};
