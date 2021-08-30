import React from 'react';
import styles from 'react-project/ToolsBox/ToolsBox.module.scss';
import cls from 'classnames';
import { iconArrow } from 'react-project/assets/Icons';
import { DropdownBlock } from 'react-project/components/dropdown/DropdownBlock';
import { DropdownItem } from 'react-project/components/dropdown/DropdownItem';
import { CommonDropdown } from 'react-project/components/dropdown/CommonDropdown';
import { TooltipWithHotkey } from 'react-project/components/tooltip/TooltipWithHotkey';

const DropdownTrigger = ({
  classes,
  onOpen,
  onItemClick,
  tooltipLabel,
  onDragStart,
  icon,
  open,
  type,
  isOpen,
  actionName,
  ...rest
}) => {
  return (
    <div
      className={cls(
        styles.Item,
        classes.ActiveClass,
        classes.ExtendedClass,
        classes.ActiveIconClass
      )}
      {...rest}
    >
      <li
        onClick={() => {
          onOpen(type);
          onItemClick();
        }}
        className={styles.IconWithTrigger}
      >
        <TooltipWithHotkey label={tooltipLabel || ''} actionName={actionName}>
          <div className={styles.IconWithTrigger}>
            <div draggable={true} className={cls(styles.Icon)} onDragStart={onDragStart}>
              {icon}
              <span className={styles.Arrow} style={isOpen ? { transform: 'rotate(180deg)' } : {}}>
                {iconArrow}
              </span>
            </div>
          </div>
        </TooltipWithHotkey>
      </li>
    </div>
  );
};

export const ExtendableItem = ({
  dropdownItems,
  onDragEnd,
  onSelectItem,
  selectedItem,
  ...dropdownProps
}) => {
  return (
    <CommonDropdown
      className={styles.TopToolbarDropdown}
      forceCloseOnSelect
      dropdownTrigger={<DropdownTrigger {...dropdownProps} type={selectedItem.type} actionName={selectedItem.actionName} />}
      items={[
        <DropdownBlock key={selectedItem.type} style={{ minWidth: '180px' }}>
          {dropdownItems.map((el) => (
            <DropdownItem
              key={el.label}
              draggable={true}
              icon={el.icon}
              label={el.label}
              onDragEnd={() => onDragEnd(el)}
              onClick={() => onSelectItem(el)}
              actionName={el.actionName}
              active={el.label === selectedItem.label}
            />
          ))}
        </DropdownBlock>,
      ]}
    />
  );
};
