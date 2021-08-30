import React from 'react';
import pluralize from 'pluralize';
import cls from 'classnames';

import styles from './List.module.scss'

import { iconArrow } from 'react-project/assets/Icons';

export const Pagination = (props) => {
  const previousDisabled = props.from <= 1;
  const onPreviousPage = () => {
    if (previousDisabled) {
      return;
    }

    props.onPreviousPage();
  };
  const nextDisabled = props.to > props.totalCount - 1;
  const onNextPage = () => {
    if (nextDisabled) {
      return;
    }

    props.onNextPage();
  };

  const previousStyles = cls(styles.PreviousPage, { [styles.NextPrevDisabled]:  previousDisabled});
  const nextStyles = cls(styles.NextPage, { [styles.NextPrevDisabled]: nextDisabled});

  return (
    <div className={styles.Pagination}>
      <span className={styles.CurrentRange}>
        {props.from}-{props.to} of {pluralize(props.word, props.totalCount, true)}
      </span>
      <div className={previousStyles} onClick={onPreviousPage}>{iconArrow}</div>
      <div className={nextStyles} onClick={onNextPage}>{iconArrow}</div>
    </div>
  );
};
