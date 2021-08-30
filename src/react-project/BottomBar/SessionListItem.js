import React from 'react';
import { formatDistanceToNowStrict } from 'date-fns'
import PropTypes from 'prop-types';

import styles from "./BottomBar.module.scss";
import { CountriesListArr } from 'shared/CSharedConstants';

import { When } from 'react-project/Util/When';

const SessionListItemComponent = (props) => {
  const countryAttr = props.country.name ?
    CountriesListArr.find(attrs => attrs.name === props.country.name) : null;
  const countryClass = `flag flag-${countryAttr ?  countryAttr.iso2.toLowerCase() : ''}`;

  return (
    <div className={styles.ListItem}>
      <div className={styles.ListItemNameWrapper}>
        <When condition={props.selectable}>
          <input type="checkbox" onChange={props.toggleSelected} checked={props.isSelected}/>
        </When>
        <span className={countryClass}></span>
        <span className={styles.ColumnPadding}>User {props.id.split('-')[0]}</span>
      </div>
      <div>{formatDistanceToNowStrict(props.createdAt)} ago</div>
    </div>
  );
};

SessionListItemComponent.propTypes = {
  selectable: PropTypes.bool,
  toggleSelected: PropTypes.func,
  isSelected: PropTypes.bool,
  country: PropTypes.shape({
    name: PropTypes.string
  }).isRequired,
  id: PropTypes.string.isRequired,
  createdAt: PropTypes.instanceOf(Date).isRequired
};

export const SessionListItem = SessionListItemComponent;
