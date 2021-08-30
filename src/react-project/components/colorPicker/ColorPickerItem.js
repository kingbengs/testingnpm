import React from "react";
import styles from "react-project/components/colorPicker/ColorPicker.module.scss";
import PropTypes from "prop-types";
import cls from "classnames";

const ColorPickerItemComponent = ({ value, isActive, setActive }) => {
  const className = cls(styles[value.class], {
    [styles.ActiveColor]: isActive,
  });

  return (
    <button
      onClick={() => setActive(value.color)}
      className={className}
    ></button>
  );
};

ColorPickerItemComponent.propTypes = {
  value: PropTypes.shape({
    class: PropTypes.string.isRequired,
  }),
  setActive: PropTypes.func.isRequired,
};

export const ColorPickerItem = ColorPickerItemComponent;
