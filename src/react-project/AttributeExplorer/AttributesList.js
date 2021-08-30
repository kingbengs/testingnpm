import React, { useState } from "react";
import PropTypes from "prop-types";
import cls from "classnames";

import styles from "react-project/AttributeExplorer/AttributeExplorer.module.scss";
import { chevronRightIcon, iconPlusSmall, iconSmallLogo } from "react-project/assets/Icons";
import { When } from "react-project/Util/When";
import { commerceAction } from "../Constants/commerceAction";
import { TEXT_LOAD_MORE } from "../Constants/texts";
import { Button } from "../components/button/Button";
import { numSeparator } from "shared/NumberHelpers";
const LIMIT_VALUES = 20;

const AttributesListComponent = (props) => {
  const [expandedAttributeKeys, setExpandedAttributeKeys] = useState([]);
  const [limitValues, setLimitValues] = useState(LIMIT_VALUES);

  const onToggleExpanded = (value) => {
    const isAlreadyExpanded = expandedAttributeKeys.some((k) => k === value);
    const newExpandedAttributesKeys = isAlreadyExpanded
      ? expandedAttributeKeys.filter((k) => k !== value)
      : expandedAttributeKeys.concat(value);

    setExpandedAttributeKeys(newExpandedAttributesKeys);
  };

  const onLoadMore = () => {
    const limit = limitValues + LIMIT_VALUES;
    setLimitValues(limit);
    props.onLoadMore(limit);
  };

  return (
    <div>
      {props.attributes.map((attribute) => (
        <div key={attribute.key}>
          <div
            className={cls(styles.ItemBlock, styles.SpaceBetween, {
              [styles.Expanded]: expandedAttributeKeys.some((k) => k === attribute.key),
            })}
          >
            <div className={styles.LeftSideBlock}>
              <When condition={attribute.values.length > 0}>
                <div className={styles.IndentBtn} onClick={() => onToggleExpanded(attribute.key)}>
                  {chevronRightIcon}
                </div>
              </When>
              <div className={`${styles.Strong} ${styles.AttributeKey}`}>
                {commerceAction[attribute.key] && iconSmallLogo}
                {`${commerceAction[attribute.key] || attribute.key}:`}
              </div>
              ({numSeparator(attribute.hits)})
            </div>
            <div className={styles.PlusBtn} onClick={() => props.onSelect(attribute.key, '')}>
              {iconPlusSmall}
            </div>
          </div>
          <When
            condition={
              attribute.values.length > 0 && expandedAttributeKeys.some((k) => k === attribute.key)
            }
          >
            {attribute.values.map((itemValue) => (
              <div
                key={itemValue.value}
                className={cls(styles.ItemBlock, styles.SpaceBetween, styles.ExpandedBlock)}
              >
                <div className={styles.LeftSideBlock}>
                  <span className={styles.Strong}>{itemValue.value}:</span>({numSeparator(itemValue.hits)})
                </div>
                <div
                  className={styles.PlusBtn}
                  onClick={() => props.onSelect(attribute.key, itemValue.value)}
                >
                  {iconPlusSmall}
                </div>
              </div>
            ))}
            {attribute.has_more ? (
              <div className={styles.LoadMorePageParameters}>
                <Button
                  disabled={props.isLoadingPageParameters}
                  className={styles.MediumButton}
                  onClick={onLoadMore}
                >
                  {TEXT_LOAD_MORE}
                </Button>
              </div>
            ) : null}
          </When>
        </div>
      ))}
    </div>
  );
};

AttributesListComponent.propTypes = {
  attributes: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      values: PropTypes.arrayOf(
        PropTypes.shape({
          value: PropTypes.string.isRequired,
          hits: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
        })
      ),
      hits: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    })
  ).isRequired,
  onSelect: PropTypes.func.isRequired,
};

export const AttributesList = AttributesListComponent;
