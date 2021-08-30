import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

import { RevenueActionAttributes } from './RevenueActionAttributes';
import { RevenueActionMetricsDropdown } from './RevenueActionMetricsDropdown';
import RequestService from 'react-project/Helpers/RequestService';

import styles from './RevenueAction.module.scss';
import stepStyles from 'react-project/Toolbar/Toolbar.module.scss';
import produce from 'immer';
import { commonSendEventFunction } from 'shared/CSharedMethods';
import { RP_ANALYTICS_FILTER_DATA_CHANGED, RP_EVENT_EDIT_OBJECT } from 'shared/CSharedEvents';
import { COMMERCE_ACTION_NAME, commerceAction } from 'react-project/Constants/commerceAction';
import { ActionTypes } from 'shared/CSharedConstants';
import { ViewportAllower } from '../../../components/viewportAllower/ViewportAllower';

const requestService = new RequestService();

const useRevenueActionProperties = () => {
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadProperties = useCallback(
    async (projectId, startData, funnelConfiguration) => {
      setIsLoading(true);

      const response = await requestService.getAttributeExplorerData(
        projectId,
        startData,
        funnelConfiguration
      );

      if (response) {
        setProperties(
          response.action_attributes.map((property) => ({
            ...property,
            hits: Number(property.hits),
            values: [...property.values.map((v) => ({...v, hits: Number(v.hits)}))],
            displayName: commerceAction[property.key] || property.key,
          }))
        );
        setIsLoading(false);
      }
    },
    [setIsLoading, setProperties]
  );

  return {
    properties,
    loadProperties,
    isLoading,
  };
};

const RevenueActionSettingsComponent = ({ projectId, currentStep, funnelConfiguration }) => {
  const { properties, loadProperties, isLoading } = useRevenueActionProperties();

  const displayFilter = currentStep.object.analyticsFilterData?.displayFilter || {};
  const dataFilter = currentStep.object.filterData || [];

  const [isTotalRevenueSelected, setIsTotalRevenueSelected] = useState(
    displayFilter.totalRevenew === false ? false : true
  );
  const [isTotalCustomersSelected, setIsTotalCustomersSelected] = useState(
    displayFilter.totalCustomers === false ? false : true
  );
  const [isAvgPerCustomerSelected, setIsAvgPerCustomerSelected] = useState(
    displayFilter.avgValuePerCustomer === false ? false : true
  );

  const mappedAttributes =
    dataFilter.filter((el) => !!el).length > 0
      ? dataFilter
          .filter((el) => !!el)
          .map((filter) => ({
            displayName: commerceAction[filter.key] || filter.key,
            key: filter.key,
            value: filter.value,
            comparison: "contains",
            hits: filter.hits || 0,
            values: [],
          }))
      : [
          {
            displayName: '',
            key: '',
            value: '',
            comparison: 'isEqual',
            hits: 0,
            values: [],
          },
        ];

  const [attributes, setAttributes] = useState(mappedAttributes);

  const onPropertySelect = (property, attr) => {
    const index = attributes.findIndex((a) => a === attr);
    setAttributes(
      produce(attributes, (draft) => {
        draft[index].key = property.key;
        draft[index].displayName = property.displayName;
        draft[index].values = property.values;
        draft[index].hits = property.hits;
      })
    );
  };
  const onSelectPropertyValue = (value, attr) => {
    const index = attributes.findIndex((a) => a === attr);
    setAttributes(
      produce(attributes, (draft) => {
        draft[index].value = value;
      })
    );
  };
  const onDelete = (attr) => {
    setAttributes(attributes.filter((a) => a !== attr));
  };
  const onAdd = () =>
    setAttributes([
      ...attributes,
      {
        displayName: '',
        key: '',
        hits: 0,
        values: [],
        value: '',
      },
    ]);

  // TODO: Fix memmory leak warning (previous request should be aborted if props are changed)
  useEffect(() => {
    const startData = {
      id: currentStep.stepId,
      category: currentStep.object.category,
      type: currentStep.object.type,
      name:
        currentStep.object.actionType === ActionTypes.COMMERCE
          ? COMMERCE_ACTION_NAME
          : currentStep.object.label,
      isCommerce: currentStep.object.actionType === ActionTypes.COMMERCE,
      attributes: attributes.map((el) => ({ key: el.key, value: el.value, contains: 'true' })),
    };

    loadProperties(projectId, startData, funnelConfiguration);
    commonSendEventFunction(RP_ANALYTICS_FILTER_DATA_CHANGED, {
      entities: {
        [currentStep.stepId]: {
          displayFilter: {
            totalRevenew: isTotalRevenueSelected,
            totalCustomers: isTotalCustomersSelected,
            avgValuePerCustomer: isAvgPerCustomerSelected,
          },
          dataFilter: [
            ...attributes
              .map((el) => {
                if (el.key === '') return;
                return { key: el.key, value: el.value, contains: 'true' };
              })
              .filter((el) => !!el),
          ],
        },
      },
    });
    commonSendEventFunction(RP_EVENT_EDIT_OBJECT, {
      stepId: currentStep.stepId,
      filterData: [
        ...attributes
          .map((el) => {
            if (el.key === '') return;
            return { key: el.key, value: el.value, contains: 'true' };
          })
          .filter((el) => !!el),
      ],
    });
  }, [
    projectId,
    currentStep,
    funnelConfiguration,
    attributes,
    isTotalCustomersSelected,
    isAvgPerCustomerSelected,
    isTotalRevenueSelected,
  ]);

  return (
    <ViewportAllower type="relative" className={stepStyles.StepToolbarSection}>
      <div className={stepStyles.TrackingTab}>
        <h6 className={styles.Title}>Revenue Tracking</h6>
        <p className={styles.SettingsDescription}>
          This step represents people who completed a <b>purchase</b>
        </p>
        <div className={styles.SettingsContent}>
          <RevenueActionAttributes
            attributes={attributes}
            properties={properties}
            onPropertySelect={onPropertySelect}
            onSelectPropertyValue={onSelectPropertyValue}
            onAdd={onAdd}
            onDelete={onDelete}
            isLoading={isLoading}
          />
          <RevenueActionMetricsDropdown
            isAvgPerCustomerSelected={isAvgPerCustomerSelected}
            isTotalCustomersSelected={isTotalCustomersSelected}
            isTotalRevenueSelected={isTotalRevenueSelected}
            setIsAvgPerCustomerSelected={setIsAvgPerCustomerSelected}
            setIsTotalCustomersSelected={setIsTotalCustomersSelected}
            setIsTotalRevenueSelected={setIsTotalRevenueSelected}
          />
        </div>
      </div>
    </ViewportAllower>
  );
};

RevenueActionSettingsComponent.propTypes = {
  projectId: PropTypes.string.isRequired,
  currentStep: PropTypes.shape({
    stepId: PropTypes.string.isRequired,
    object: PropTypes.shape({
      category: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  funnelConfiguration: PropTypes.object.isRequired,
};

export const RevenueActionSettings = RevenueActionSettingsComponent;
