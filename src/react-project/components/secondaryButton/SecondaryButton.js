import React from "react";
import styles from "./SecondaryButtons.module.scss";
import cls from 'classnames';

export const SecondaryButton = ({ onClick, disabled, withBorder, title, className }) => {
  return (
    <button
      disabled={disabled}
      className={cls(styles.FilterBtn, className, {[styles.WithBorder]: withBorder})}
      onClick={onClick}
    >
      {title}
    </button>
  );
};
