import React from 'react';

import cls from 'classnames';

import styles from './BottomBar.module.scss';
import { TopCountries } from './TopCountries';
import { People } from './People';

export const BottomBar = (props) => {
  const className = cls(styles.BottomBar, { [styles.BottomBarHidden]: props.isHidden})
  return (
    <div className={className} id="bottom-bar">
      <div className={styles.Section}>
        <TopCountries />
      </div>
      <div className={styles.Section}>
        <People funnelId={props.funnelId} />
      </div>
    </div>
  );
};
