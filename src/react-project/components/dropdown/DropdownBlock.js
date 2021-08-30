import React, { cloneElement } from "react";
import PropTypes from "prop-types";
import styles from "react-project/components/dropdown/Dropdown.module.scss";
import cls from "classnames";

const DropdownBlockComponent = ({ children, isBorder, ...other }) => {
  if (children.length > 1) {
    return (
      <div
        className={cls(styles.DropdownBlock, { [styles.DropdownBlockWithBorder]: isBorder })}
        {...other}
      >
        {children.map((el) =>
          cloneElement(el, {
            key: el.key,
          })
        )}
      </div>
    );
  } else {
    return (
      <div
        className={cls(styles.DropdownBlock, { [styles.DropdownBlockWithBorder]: isBorder })}
        {...other}
      >
        {children}
      </div>
    );
  }
};

DropdownBlockComponent.propTypes = {
  children: PropTypes.node.isRequired,
  isBorder: PropTypes.bool,
};

export const DropdownBlock = DropdownBlockComponent;
