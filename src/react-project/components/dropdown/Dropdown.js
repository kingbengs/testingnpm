import React, { useState, useRef, cloneElement } from 'react';
import PropTypes from 'prop-types';
import { useKey, useClickAway } from 'react-use';
import cls from 'classnames';

import styles from './Dropdown.module.scss';
import { When } from 'react-project/Util/When';

const DropdownComponent = ({
  children,
  triggerSlot,
  isOpen,
  onToggle,
  className,
  contentClassName,
  position = 'left',
}) => {
  const [closingWithClick, setClosingWithClick] = useState(false);
  const [stylesDropdown, setStylesDropdown] = useState({});

  const ref = useRef(null);
  const updateRef = (ref) => {
    if (ref) {
      const { innerWidth, innerHeight } = window;
      const screen = { width: innerWidth, height: innerHeight };
      const { y, height } = ref.getBoundingClientRect();
      const top = -height - 10;

      if (!Object.keys(stylesDropdown).length && y + height > screen.height) {
        setStylesDropdown({ top });
      }

      if (y < 0) {
        const topMin = top - y;

        if (topMin !== stylesDropdown.top) {
          setStylesDropdown({ top: topMin });
        }
      }
    }
  };

  useClickAway(ref, () => onToggle(false));
  useKey('Escape', () => onToggle(false));

  const onMouseDown = () => {
    if (isOpen) {
      setClosingWithClick(true);
    }
  };

  const onClick = () => {
    if (!isOpen && closingWithClick) {
      setClosingWithClick(false);
    }

    onToggle(!isOpen);
  };

  return (
    <div className={cls(styles.Dropdown, className)}>
      {cloneElement(triggerSlot, {
        onClick,
        onMouseDown,
        isOpen
      })}
      <When condition={isOpen}>
        <div
          style={stylesDropdown}
          className={cls(styles.DropdownContent, contentClassName, {
            [styles.DropdownLeft]: position === 'left',
            [styles.DropdownRight]: position === 'right',
          })}
          ref={ref => updateRef(ref)}
        >
          {children}
        </div>
      </When>
    </div>
  );
};

DropdownComponent.propTypes = {
  children: PropTypes.node,
  triggerSlot: PropTypes.node,
  isOpen: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  className: PropTypes.string,
  position: PropTypes.string,
};

export const Dropdown = DropdownComponent;
