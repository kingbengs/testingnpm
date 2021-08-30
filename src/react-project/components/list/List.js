import React from 'react';

import styles from './List.module.scss'

export const List = (props) => {
  return (
    <div className={styles.List}>
      <div>
        {props.renderHeader()}
      </div>
      <div className={styles.ListItems}>
        {props.items.map(item => props.renderItem(item))}
      </div>
    </div>
  );
};
