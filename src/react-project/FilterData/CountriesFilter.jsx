import React, { Component } from 'react';
import PropTypes from "prop-types";
import styles from './FilterData.module.scss';

import { connect } from 'react-redux';
import { iconSearch } from "react-project/assets/Icons";
import { selectProfileCountries } from 'react-project/redux/analytics/selectors';
import { loadProfileCountriesAsync } from 'react-project/redux/analytics/actions';
import { When } from 'react-project/Util/When';
import { hasScrollBar } from '../Util/hasScrollBar';
import {
  FILTER_ITEM_PADDING_WIDTH,
  CountriesListArr,
  HEADER_HEIGHT,
  LEFT_SIDEBAR_WIDTH,
} from 'shared/CSharedConstants';
import { getRefPosition } from "react-project/Util/getRefPosiiton";
import { selectCurrentStep } from "../redux/current-step/selectors";
import { selectFunnelConfiguration } from "../redux/funnel-configuration/selectors";
import { numSeparator } from 'shared/NumberHelpers';

class CountriesFilter extends Component {

  constructor(props) {
    super(props);

    let countries = props.selectedCountries;

    this.state = {
      selectedCountries: countries,
      searchQuery: null,
      countriesListFull: []
    }
  }

  handleSearchChange(event) {
    const searchQuery = event.target.value;

    this.setState({
      searchQuery,
    });
  }

  handleCheckboxChange(event, countryName) {
    const isChecked = event.target.checked;

    let {selectedCountries} = this.state;

    if (isChecked && !selectedCountries.some(c => c === countryName)) {
      selectedCountries = selectedCountries.concat(countryName);
    }

    if (!isChecked && selectedCountries.some(c => c === countryName)) {
      selectedCountries = selectedCountries.filter(c => c !== countryName);
    }

    this.setState({
      selectedCountries
    });

    this.props.setSelectedCountries(selectedCountries);
  }

  getCountriesClass(countryName) {
    let CountryClass = 'flag-';
    CountriesListArr.forEach((item) => {
      if (item.name === countryName) {
        CountryClass += item.iso2.toLowerCase();
      }
    });
    return CountryClass
  }

    render() {
        const searchQuery = this.state.searchQuery;
        const selectedCountries = this.state.selectedCountries;
        const totalCountriesHits = this.props.profileCountries.reduce((sum, cur) => {
            sum += cur.hits
            return sum;
        }, 0);

        const CountriesItems = this.props.profileCountries
          .filter((c) => !searchQuery || c.name.toLowerCase().indexOf(searchQuery.toLowerCase()) >= 0)
          .map((country, i) => {
            const CountriesClass = this.getCountriesClass(country.name);
            if(country.name){
                return (
                    <div key={country.name}
                         className={`${styles.SectionItem} ${styles.CheckboxItem} ${this.state.selectedDevice === country ? styles.ActiveItem : ''} `}
                    >
                        <div className={`${styles.FlexBlock} ${styles.CountriesRows}`}>
                        <span className={styles.CheckBoxIcon}>
                            <input type="checkbox"
                                   name={country.name}
                                   onChange={(e) => this.handleCheckboxChange(e, country.name)}
                                   checked={selectedCountries.some(c => c === country.name)}
                            />
                        </span>
                            <span className={styles.Position}>{country.position || (i+1)}.</span>
                            <span className={`flag ${CountriesClass}`}></span>
                            <span className={styles.CapitalizeTitle}>{country.name}</span>
                        </div>
                        <div className={styles.FlexBlock}>
                        <span className={`${styles.CapitalizeTitle} ${styles.Hits}`}>
                            <span className={styles.ColorGrey}>({numSeparator(country.hits)})</span>
                            <span className={styles.Percentages}>{Math.round(country.hits * 100 / totalCountriesHits) === 0 ? '<1' :  Math.round(country.hits * 100 / totalCountriesHits)}%</span>
                        </span>
                        </div>
                    </div>
                );
            }
        });

        const SelectedCountriesItems = selectedCountries
          .map((countryName, i) => {
            const country = this.props.profileCountries.find(c => c.name === countryName) || {
                name: countryName,
                hits: 0
            };
            const CountriesClass = this.getCountriesClass(country.name);
            return (
                <div key={country.name}
                     className={`${styles.SectionItem} ${styles.CheckboxItem} ${this.state.selectedDevice === country ? styles.ActiveItem : ''} `}
                     >
                    <div className={`${styles.FlexBlock} ${styles.CountriesRows}`}>
                        <span className={styles.CheckBoxIcon}>
                            <input type="checkbox"
                                   checked={true}
                                   onChange={(e) => this.handleCheckboxChange(e, country.name)}/>
                        </span>
                        <span className={styles.Position}>{country.position || (i+1)}.</span>
                        <span className={`flag ${CountriesClass}`}></span>
                        <span className={styles.CapitalizeTitle}>{country.name}</span>
                    </div>
                    <div className={styles.FlexBlock}>
                        <span className={`${styles.CapitalizeTitle} ${styles.Hits}`}>
                            <span  className={styles.ColorGrey}>({numSeparator(country.hits)})</span>
                            <span className={styles.Percentages}>{Math.round(country.hits * 100 / totalCountriesHits) === 0 ? '<1' :  Math.round(country.hits * 100 / totalCountriesHits)}%</span>
                        </span>
                    </div>
                </div>
            );
        });

        const sidebar = document.getElementById('left-sidebar-wrapper');
        const position = getRefPosition(this.props.innerRef);

        return (
          <div
            className={styles.CountriesList}
            style={{
              position: 'absolute',
              top: position.y - HEADER_HEIGHT,
              left: LEFT_SIDEBAR_WIDTH + (hasScrollBar(sidebar) ? 0 : FILTER_ITEM_PADDING_WIDTH),
              zIndex: 2,
            }}
          >
                <div className={`${styles.SectionItem} ${styles.BackTitle}`}>
                    <div className={styles.FlexBlock}>
                        <div className={`${styles.ChevronIcon}`}>{iconSearch}</div>
                        <input autoFocus={true} 
                               placeholder="Search"
                               onChange={(e) => this.handleSearchChange(e)}
                               maxLength="32"
                               type="text"/>
                    </div>
                </div>
              <When condition={SelectedCountriesItems.length}>
                <div className={styles.SelectedCountriesHeader}>
                  Selected Countries
                </div>
                {SelectedCountriesItems}
                <div className={styles.AllCountriesHeader}>
                  All Countries
                </div>
              </When>
              <div className={`${styles.CountriesItemsSection}`}>
                {CountriesItems}
              </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
  return {
    currentStep: selectCurrentStep(state),
    funnelConfiguration: selectFunnelConfiguration(state),
    profileCountries: selectProfileCountries(state)
  }
}

function mapDispatchToProps(dispatch) {
  return {
    onLoadProfileCountries: (projectId, funnelConfiguration, dataObjs, dataConnections) =>
      dispatch(loadProfileCountriesAsync(projectId, funnelConfiguration, dataObjs, dataConnections))
  }
}

CountriesFilter.propTypes = {
  selectedCountries: PropTypes.arrayOf(PropTypes.string),
  setSelectedCountries: PropTypes.func.isRequired,
  funnel: PropTypes.shape({
    projectId: PropTypes.string.isRequired
  })
};

export default connect(mapStateToProps, mapDispatchToProps)(CountriesFilter);
