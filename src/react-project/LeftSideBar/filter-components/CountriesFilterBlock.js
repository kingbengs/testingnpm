import React, { useRef, useState } from "react";
import styles from "react-project/LeftSideBar/LeftSideBar.module.scss";
import { iconCounty } from "react-project/assets/Icons";
import { When } from "react-project/Util/When";
import cls from "classnames";
import PropTypes from "prop-types";
import CountriesFilter from "react-project/FilterData/CountriesFilter";
import { ClickOutsideCustomComponent } from "react-project/Util/ClickOutsideCustom";
import { getDirtyStyle, getFilterAddClass } from "react-project/Util/FilterStyleHelper";

export const CountriesFilterBlock = ({ selectedCountries, funnel, onSelectCountries, type }) => {
  const [countriesOpened, setCountriesOpened] = useState(false);

  const onSelect = (selectedCountries) => {
    onSelectCountries({ countries: selectedCountries });
  };

  const ref = useRef();

  return (
    <ClickOutsideCustomComponent
      ignoreClickOutside={!countriesOpened}
      onClickOutside={() => setCountriesOpened(false)}
    >
      <div
        className={cls(styles.FiltersItem, getFilterAddClass(type), {
          [styles.ActiveFilter]: countriesOpened,
          [getDirtyStyle(type)]: selectedCountries.length !== 0,
        })}
        ref={ref}
      >
        <div
          className={styles.ItemsForSelection}
          onClick={() => setCountriesOpened(!countriesOpened)}
        >
          <span>
            Country:
            <span className={`${styles.CapitalizeTitle} ${styles.CountriesTitle}`}>
              {selectedCountries.join(', ') || 'all countries'}
            </span>
          </span>
          <div>{iconCounty}</div>
        </div>
        <When condition={countriesOpened && funnel}>
          <CountriesFilter
            funnel={funnel}
            selectedCountries={selectedCountries}
            setSelectedCountries={onSelect}
            innerRef={ref}
          />
        </When>
      </div>
    </ClickOutsideCustomComponent>
  );
};

CountriesFilterBlock.propType = {
  selectedCountries: PropTypes.array.isRequired,
  funnel: PropTypes.shape({
    projectId: PropTypes.string.isRequired,
  }),
  onSelectCountries: PropTypes.func.isRequired,
};
