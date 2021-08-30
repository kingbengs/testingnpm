import React, { useState } from 'react';
import cls from 'classnames';
import { chevronRightIcon } from 'react-project/assets/Icons';
import styles from './Dropdown.module.scss';
import PropTypes from 'prop-types';
import { Dropdown } from './Dropdown';

export const DropdownExplorer = ({ items, activeItem, onSelectItem }) => {
  const [isDropdownOpened, setIsDropdownOpened] = useState(false);

  return (
    <Dropdown
      className={styles.Dropdown}
      triggerSlot={
        <div
          className={styles.DropdownExplorer}
          onClick={() => setIsDropdownOpened(!isDropdownOpened)}
        >
          <div className={styles.ActiveElement}>{activeItem.name}</div>
          {chevronRightIcon}
        </div>
      }
      isOpen={isDropdownOpened}
      onToggle={(o) => setIsDropdownOpened(o)}
    >
      <div className={styles.DropdownItems}>
        {items.map((item) => (
          <div
            key={item.name}
            className={cls(styles.DropdownItem, {
              [styles.ActiveItem]: activeItem === item,
            })}
            onClick={() => {
              onSelectItem(item);
              setIsDropdownOpened(false);
            }}
          >
            {item.name}
          </div>
        ))}
      </div>
    </Dropdown>
  );
};


DropdownExplorer.propTypes = {
  items: PropTypes.array,
  activeItem: PropTypes.shape({
    name: PropTypes.string,
    type: PropTypes.string
  }),
  onSelectItem: PropTypes.func
};
