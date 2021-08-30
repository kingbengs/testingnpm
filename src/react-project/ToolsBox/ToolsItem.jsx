import React from 'react';
import styles from './ToolsBox.module.scss';
import cls from 'classnames';
import { ExtendableItem } from './ExtendableItem';
import { TooltipWithHotkey } from '../components/tooltip/TooltipWithHotkey';

function ToolsItem({
  icon,
  extended,
  open,
  openExtended,
  onSelectItem,
  type,
  createTextObject,
  notifyDragStarted,
  event,
  active,
  isSelected,
  tooltipLabel,
  selectedItem,
  actionName,
}) {
  const onSelect = (el) => {
    onSelectItem(el);
  };

  const onDragEnd = (el) => {
    onSelectItem(el);
    createTextObject && createTextObject(el.type);
  };

  const startDraggingText = (elType, e) => {
    notifyDragStarted && notifyDragStarted(elType, e);
  };

  let ActiveClass = active ? styles.Active : '';
  let ExtendedClass = !!extended ? styles.Extended : '';
  let ActiveIconClass;
  if (active && !extended) {
    ActiveIconClass = styles[icon.props.id];
  } else if (active && !!extended) {
    ActiveIconClass = styles[icon.props.id];
  } else {
    ActiveIconClass = '';
  }

  const className = cls(`${styles.Item} ${ActiveClass} ${ExtendedClass} ${ActiveIconClass}`, {
    [styles.Selected]: isSelected,
  });

  return (
    <>
      {!extended && (
        <li className={className} onClick={() => event && event()}>
          <TooltipWithHotkey label={tooltipLabel || ''} actionName={actionName}>
            <div className={styles.IconWithTrigger}>
              <div
                draggable={true}
                className={styles.Icon}
                onDragStart={(e) => {
                  e.preventDefault();
                  startDraggingText(type, e);
                }}
              >
                {icon}
              </div>
            </div>
          </TooltipWithHotkey>
        </li>
      )}
      {extended && (
        <ExtendableItem
          onOpen={openExtended ? () => openExtended(type) : event && (() => event())}
          onDragStart={(e) => {
            e.preventDefault();
            startDraggingText(type, e);
          }}
          icon={icon}
          open={open}
          dropdownItems={extended}
          onDragEnd={(el) => onDragEnd(el)}
          onSelectItem={(el) => onSelect(el)}
          selectedItem={selectedItem}
          tooltipLabel={tooltipLabel}
          classes={{ ExtendedClass, ActiveClass, ActiveIconClass }}
          onItemClick={() => event && event()}
          type={type}
        />
      )}
    </>
  );
}

export default ToolsItem;
