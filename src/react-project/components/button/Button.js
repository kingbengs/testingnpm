import React from 'react';
import cls from 'classnames';
import styles from './Button.module.scss';

export const Button = (props) => {
  return (
    <button
      className={cls(styles.BrandBlue, props.className)}
      onClick={props.onClick}
      disabled={props.disabled}
    >
      {props.children}
    </button>
  );
};
