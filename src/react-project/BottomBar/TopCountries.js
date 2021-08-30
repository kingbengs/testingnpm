import React,  { useState, useEffect } from 'react';

import { List } from 'react-project/components/list/List';
import { Pagination } from 'react-project/components/list/Pagination';
import { CountryListItem } from 'react-project/BottomBar/CountryListItem';
import styles from 'react-project/BottomBar/BottomBar.module.scss';

import { selectProfileCountries } from 'react-project/redux/analytics/selectors';

import { connect } from 'react-redux'

const PAGE_SIZE = 5;

const TopCountriesComponent = (props) => {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    setOffset(0);
  }, [props.countries]);

  const totalCount = props.countries.length;
  const totalCountriesHits = props.countries.reduce((sum, cur) => {
    sum += cur.hits;
    return sum;
  }, 0);

  const countries = props.countries.slice(offset, offset + PAGE_SIZE);
  const countryItems = countries.map(country => ({
    ...country,
    totalHits: totalCountriesHits
  }));

  return (
    <div>
      <div className={styles.SectionHeader}>
        <b>Top Countries</b>
        <Pagination
          from={Math.min(offset + 1, totalCount)}
          to={Math.min(offset + PAGE_SIZE, totalCount)}
          onNextPage={() => setOffset(Math.min(offset + PAGE_SIZE, totalCount-1))}
          onPreviousPage={() => setOffset(Math.max(offset - PAGE_SIZE, 0))}
          word='item'
          totalCount={totalCount} />
      </div>
      <List
        items={countryItems}
        renderHeader={() => (
          <div className={styles.ListHeader}>
            <span>Country</span>
            <span>Total People</span>
          </div>
        )}
        renderItem={item => (
          <CountryListItem
            {...item}
            key={item.name}
          />
        )}
      />
    </div>
  );
};

const mapStateToProps = state => ({
  countries: selectProfileCountries(state),
});

export const TopCountries = connect(mapStateToProps)(TopCountriesComponent);
