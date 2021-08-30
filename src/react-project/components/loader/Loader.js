import React from 'react';
import PropTypes from 'prop-types';
import cls from 'classnames';
import styles from './Loader.module.scss';

const variants = ['default', 'grey-font-1'];

export const Loader = (props) => {
    return (
        <div className={cls(styles.Loader, styles[props.variant])}>
            <svg className={styles.CircularLoader} viewBox="25 25 50 50">
                <circle className={styles.LoaderPath} cx="50" cy="50" r="20" fill="none"
                        strokeWidth="2"/>
            </svg>
        </div>
    );
};

Loader.defaultProps = {
    variant: "default"
};

Loader.propTypes = {
  variant: PropTypes.oneOf(variants)
};
