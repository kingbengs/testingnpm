import React from "react";
import PropTypes from "prop-types";
import styles from "react-project/components/dropdown/Dropdown.module.scss";
import { HotKey } from "react-project/components/dropdown/HotKey";
import cls from "classnames";
import { getHotkeyForAction } from "react-project/Util/HotkeysUtil";

const DropdownItemComponent = ({ label, actionName, icon, disabled = false, active = false, ...other }) => {
  const hotkey = getHotkeyForAction(actionName);

  return (
    <div
      className={cls(styles.DropdownItem, { [styles.DropdownItemDisabled]: disabled })}
      {...other}
    >
      <div className={cls(styles.DropdownItemLabelWrapper, { [styles.ActiveDropdownItem]: active })}>
        {icon && <div className={styles.DropdownItemIcon}>{icon}</div>}
        <div className={styles.DropdownItemLabel}>{label}</div>
      </div>
      {hotkey && <HotKey {...hotkey} />}
    </div>
  );
};

DropdownItemComponent.propTypes = {
  label: PropTypes.string,
  hotkey: PropTypes.shape({
    keys: PropTypes.array,
    separator: PropTypes.string,
  }),
  icon: PropTypes.node,
  disabled: PropTypes.bool,
  active: PropTypes.bool,
};

export const DropdownItem = DropdownItemComponent;
