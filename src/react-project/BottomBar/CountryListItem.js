import React from 'react';
import styles from "./BottomBar.module.scss";
import { CountriesListArr } from 'shared/CSharedConstants';
import { numSeparator } from 'shared/NumberHelpers';

import { When } from 'react-project/Util/When';

export const CountryListItem = (props) => {
  const countryAttr = CountriesListArr.find(attrs => attrs.name === props.name);
  const countryClass = `flag flag-${countryAttr ?  countryAttr.iso2.toLowerCase() : ''}`;

  const percents = Math.round(props.hits * 100 / props.totalHits) === 0 ?
    '<1' :
    Math.round(props.hits * 100 / props.totalHits)

  return (
    <div className={styles.ListItem}>
        <When condition={props.hits}>
          <div className={styles.ListItemNameWrapper}>
            <span className={countryClass}></span>
            <span className={styles.ListItemName}>{props.name}</span>
          </div>
          <div>
            <span className={styles.ListItemPercent}>({numSeparator(props.hits)})</span>&nbsp;
            {percents}%
          </div>
        </When>
    </div>
  );
};
