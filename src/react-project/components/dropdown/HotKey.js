import React from 'react';
import PropTypes from 'prop-types';
import cls from 'classnames';
import styles from 'react-project/components/dropdown/HotKey.module.scss';

const variants = ['default', 'light'];

const HotKeyComponent = ({ keys, separator = '', variant = 'default' }) => {
  const shouldBeSeparator = keys.length > 1;
  const isLastElement = (el) => {
    return keys.indexOf(el) === keys.length - 1;
  };

  return (
    <div className={styles.HotKeysWrapper}>
      {keys.map((el) => (
        <div key={el} className={styles.KeyWrapper}>
          <div className={styles.Key}>{el}</div>
          {shouldBeSeparator && !isLastElement(el) && (
            <div className={cls(styles.Separator, styles[variant])}>{separator}</div>
          )}
        </div>
      ))}
    </div>
  );
};

HotKeyComponent.propTypes = {
  separator: PropTypes.string,
  keys: PropTypes.array.isRequired,
  variant: PropTypes.oneOf(variants),
};

export const HotKey = HotKeyComponent;
