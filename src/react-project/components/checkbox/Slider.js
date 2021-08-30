import React from 'react';
import PropTypes from 'prop-types';
import cls from 'classnames';

import styles from './Checkbox.module.scss';

const SliderComponent = ({ onClick, isChecked }) => {
  return (
    <div className={cls(styles.Slider, {[styles.SliderChecked]: isChecked})}>
      <label className={styles.SliderLabel}>
        <input type='checkbox' onClick={onClick}/>
        <span className={styles.SliderRound}></span>
      </label>
    </div>
  );
};

SliderComponent.propTypes = {
  isChecked: PropTypes.bool,
  onClick: PropTypes.func
};

export const Slider = SliderComponent;
