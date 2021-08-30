import React, { useState } from 'react';
import PropTypes from 'prop-types';
import cls from 'classnames';
import pluralize from 'pluralize';

import styles from './RevenueAction.module.scss';
import { Dropdown } from 'react-project/components/dropdown/Dropdown';
import { iconArrow, iconTrash } from 'react-project/assets/Icons';
import { SearchInput } from 'react-project/components/input/SearchInput';
import { Disclosure } from 'react-project/components/disclosure/Disclosure';
import { When } from '../../../Util/When';
import { isEnterKey } from 'shared/CSharedMethods';
import { ClickOutsideCustomComponent } from "../../../Util/ClickOutsideCustom";

const DropdownTrigger = ({ isOpen, value, placeholder, ...rest }) => {
  return (
    <div className={styles.ConditionDropdownTrigger} {...rest}>
      <span className={styles.ConditionDropdownTriggerValue}>{value || placeholder}</span>
      <div className={cls(styles.TriggerIcon, { [styles.TriggerIconOpened]: isOpen })}>
        {iconArrow}
      </div>
    </div>
  );
};

DropdownTrigger.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  value: PropTypes.string,
  placeholder: PropTypes.string.isRequired,
};

const RevenueActionAttributeComponent = ({
  properties,
  selectedProperty,
  onPropertySelect,
  selectedPropertyValue,
  onSelectPropertyValue,
  onDelete,
  isLoading,
}) => {
  const [isPropertyDropdownOpened, setIsPropertyDropdownOpened] = useState(false);
  const [isValueDropdownOpened, setIsValueDropdownOpened] = useState(false);
  const [propertyCustomValue, setPropertyCustomValue] = useState('');
  const [propertySearchQuery, setPropertySearchQuery] = useState('');
  const [propertiesDisclosureOpened, setPropertiesDisclosureOpened] = useState(false);
  if (!properties) {
    return null;
  }
  const filteredProperties = properties.filter(
    (p) =>
      !propertySearchQuery ||
      p.displayName.toLowerCase().includes(propertySearchQuery.toLowerCase())
  );

  const onSelectProperty = (property) => {
    onPropertySelect(property);
    setIsPropertyDropdownOpened(false);
  };
  const onCustomValueKeyDown = (e) => {
    if (!isEnterKey(e.key)) {
      return;
    }

    onSelectPropertyValue(propertyCustomValue);
    setPropertyCustomValue('');
    setIsValueDropdownOpened(false);
  };
  const onSelectValue = (v) => {
    onSelectPropertyValue(v.value);
    setIsValueDropdownOpened(false);
    setPropertyCustomValue('');
  };

  return (
    <div className={styles.Attribute}>
      <span>where</span>
      <ClickOutsideCustomComponent
        onClickOutside={() => setIsPropertyDropdownOpened(false)}
      >
        <Dropdown
          className={styles.AttributesDropdown}
          triggerSlot={
            <DropdownTrigger
              value={selectedProperty.displayName}
              placeholder="Property"
              isOpen={isPropertyDropdownOpened}
            />
          }
          isOpen={isPropertyDropdownOpened}
          onToggle={(o) => setIsPropertyDropdownOpened(o)}
        >
          <div className={styles.PropertyDropdownContent}>
            <div className={styles.SearchProperty}>
              <SearchInput
                value={propertySearchQuery}
                onChange={(value) => setPropertySearchQuery(value)}
                placeholder="Search"
              />
            </div>
            <div className={styles.DropdownList}>
              {isLoading && <div className={styles.PropertiesLoading}>Is loading...</div>}
              <When condition={!isLoading}>
                <Disclosure
                  isOpened={propertiesDisclosureOpened}
                  disclosureButtonSlot={
                    <div
                      onClick={() => setPropertiesDisclosureOpened(!propertiesDisclosureOpened)}
                      className={styles.PropertiesListDisclosureButton}
                    >
                      <div>
                        <div
                          className={cls(styles.TriggerIcon, {
                            [styles.TriggerIconOpened]: propertiesDisclosureOpened,
                          })}
                        >
                          {iconArrow}
                        </div>
                        <span className={styles.PropertiesListDisclosureButtonText}>
                          Action Properties
                        </span>
                      </div>
                      <span>{pluralize('type', filteredProperties.length, true)}</span>
                    </div>
                  }
                >
                  {filteredProperties.map((p) => (
                    <div
                      key={p.key}
                      className={styles.DropdownListItem}
                      onClick={() => onSelectProperty(p)}
                    >
                      <span>{p.displayName}</span>
                      <span>{p.hits}</span>
                    </div>
                  ))}
                </Disclosure>
              </When>
            </div>
          </div>
        </Dropdown>
      </ClickOutsideCustomComponent>
      <span className={styles.AttributesOperator}>is equal to</span>
      <ClickOutsideCustomComponent
        onClickOutside={() => setIsValueDropdownOpened(false)}
      >
        <Dropdown
          className={styles.AttributesDropdown}
          triggerSlot={
            <DropdownTrigger
              value={selectedPropertyValue}
              placeholder="Value"
              isOpen={isValueDropdownOpened}
            />
          }
          isOpen={isValueDropdownOpened}
          onToggle={(o) => setIsValueDropdownOpened(o)}
        >
          <div>
            <div className={styles.CustomPropertyValue}>
              <input
                autoFocus={true}
                type="text"
                value={propertyCustomValue}
                placeholder="Enter custom value"
                onChange={(e) => setPropertyCustomValue(e.target.value)}
                onKeyDown={onCustomValueKeyDown}
              />
            </div>
            <When condition={isLoading || !selectedProperty.key}>
              {!selectedProperty.key ? (
                <div className={styles.PropertiesLoading}>Must select key</div>
              ) : (
                <div className={styles.PropertiesLoading}>Is loading...</div>
              )}
            </When>
            {properties.find((e) => e.key === selectedProperty.key) && (
              <When condition={!isLoading && selectedProperty.key}>
                <div className={styles.DropdownList}>
                  {properties
                    .find((e) => e.key === selectedProperty.key)
                    .values.map((v) => (
                      <div
                        key={v.value}
                        className={styles.DropdownListItem}
                        onClick={() => onSelectValue(v)}
                      >
                        <span>{v.value}</span>
                        <span>{v.hits}</span>
                      </div>
                    ))}
                </div>
              </When>
            )}
          </div>
        </Dropdown>
      </ClickOutsideCustomComponent>
      <button className={styles.RemoveConditionButton} onClick={onDelete}>
        {iconTrash}
      </button>
    </div>
  );
};

RevenueActionAttributeComponent.propTypes = {
  properties: PropTypes.arrayOf(
    PropTypes.shape({
      displayName: PropTypes.string.isRequired,
      hits: PropTypes.number.isRequired,
      values: PropTypes.arrayOf(
        PropTypes.shape({
          value: PropTypes.string.isRequired,
          hits: PropTypes.number,
        })
      ).isRequired,
    })
  ).isRequired,
  selectedProperty: PropTypes.object,
  onPropertySelect: PropTypes.func.isRequired,
  selectedPropertyValue: PropTypes.string,
  onSelectPropertyValue: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
};

export const RevenueActionAttribute = RevenueActionAttributeComponent;
