import React from 'react';
import PropTypes from 'prop-types'
import cls from 'classnames';

import styles from './Input.module.scss';
import { iconSearch } from 'react-project/assets/Icons';

const SearchInputComponent = ({ value, onChange, className, placeholder }) => {
  const onInputChange = e => {
    if (!onChange) {
      return;
    }

    onChange(e.target.value);
  };

  return (
    <div className={cls(styles.SearchInput, className)}>
      <div>{iconSearch}</div>
      <input
        autoFocus={true}
        type='text'
        value={value}
        placeholder={placeholder}
        onChange={onInputChange}
      />
    </div>
  );
};

SearchInputComponent.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  className: PropTypes.string,
  placeholder: PropTypes.string
};

export const SearchInput = SearchInputComponent;
