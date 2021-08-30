import React, { useState } from "react";
import PropTypes from "prop-types";
import { Dropdown } from "./Dropdown";
import styles from "./Dropdown.module.scss";
import cls from "classnames";
import { ClickOutsideCustomComponent } from "../../Util/ClickOutsideCustom";

export const CommonDropdown = ({
  dropdownTrigger,
  className,
  contentClassName,
  items,
  position = "right",
  forceCloseOnSelect = false,
}) => {
  const [dropdownOpened, setDropdownOpened] = useState(false);
  return (
    <ClickOutsideCustomComponent
      ignoreClickOutside={!dropdownOpened}
      onClickOutside={() => {
        setDropdownOpened(false);
      }}
    >
      <Dropdown
        className={className}
        triggerSlot={dropdownTrigger}
        isOpen={dropdownOpened}
        onToggle={(o) => setDropdownOpened(o)}
        position={position}
      >
        <div
          className={cls(styles.CommonDropdownItems, contentClassName)}
          onClick={forceCloseOnSelect ? () => setDropdownOpened(false) : () => {}}
        >
          {items.map((item) => (
            <div key={item.key}>{item}</div>
          ))}
        </div>
      </Dropdown>
    </ClickOutsideCustomComponent>
  );
};

CommonDropdown.propTypes = {
  dropdownTrigger: PropTypes.node,
  className: PropTypes.string,
  contentClassName: PropTypes.string,
  items: PropTypes.array,
  position: PropTypes.string, //TODO: change to enum with available options
};
