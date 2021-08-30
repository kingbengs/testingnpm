import React from 'react';
import { Button } from 'react-project/components/button/Button';
import { RevenueActionAttribute } from './RevenueActionAttribute';
import styles from './RevenueAction.module.scss';
import PropTypes from 'prop-types';

const RevenueActionAttributesComponent = ({
  attributes,
  properties,
  onPropertySelect,
  onSelectPropertyValue,
  onAdd,
  onDelete,
  isLoading
}) => {
  return (
    <div>
      {attributes.map((attr) => (
        <RevenueActionAttribute
          key={attr.key}
          properties={properties}
          selectedProperty={attr}
          selectedPropertyValue={attr.value}
          onPropertySelect={(property) => onPropertySelect(property, attr)}
          onSelectPropertyValue={(value) => onSelectPropertyValue(value, attr)}
          onDelete={() => onDelete(attr)}
          isLoading={isLoading}
        />
      ))}
      <Button
        variant="brand-reverse"
        className={styles.AddConditionButton}
        disabled={attributes.some((a) => !a.displayName)}
        onClick={onAdd}
      >
        + where
      </Button>
    </div>
  );
};

RevenueActionAttributesComponent.propTypes = {
  attributes: PropTypes.array.isRequired,
  properties: PropTypes.array.isRequired,
  onPropertySelect: PropTypes.func.isRequired,
  onSelectPropertyValue: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
};

export const RevenueActionAttributes = RevenueActionAttributesComponent;
