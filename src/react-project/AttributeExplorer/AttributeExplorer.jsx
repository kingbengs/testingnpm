import React, { Component } from 'react';
import { connect } from 'react-redux';

import styles from './AttributeExplorer.module.scss';
import { iconMinusSmall, iconSmallLogo } from 'react-project/assets/Icons';
import { RP_EVENT_EDIT_OBJECT } from 'shared/CSharedEvents';
import SharedElementHelpers from 'shared/SharedElementHelpers';

import { AttributesList } from './AttributesList';
import { ActionTypes } from 'shared/CSharedConstants';
import {
  getAttributeExplorerDataAsync,
  setAttributeExplorerData,
  setNewCurrentStepFilterParams,
} from 'react-project/redux/current-step/actions';
import { selectAnalyticsStatus } from 'react-project/redux/analytics/selectors';
import { commerceAction } from '../Constants/commerceAction';
import {
  selectAttributeExplorerData,
  selectCurrentStep,
} from '../redux/current-step/selectors';
import { commonSendEventFunction } from 'shared/CSharedMethods';
import { RefreshButton } from '../components/refreshButton/RefreshButton';
import { selectFunnelConfiguration } from "../redux/funnel-configuration/selectors";
import { selectExplorerIsLoading } from 'react-project/redux/explorer/selectors';

class AttributeExplorer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showContextMenu: false,
      urlValue: this.props.currentStep.object.url,
      filterParamsArray: this.props.currentStep.object.analyticsFilterData || [],
    };

    this.getAttributeExplorerData = this.getAttributeExplorerData.bind(this);
  }

  getAttributeExplorerData = () => {
    const startData = {
      id: this.props.currentStep.stepId,
      category: this.props.currentStep.object.category,
      type: this.props.currentStep.object.type,
      isCommerce: this.props.currentStep.object.actionType === ActionTypes.COMMERCE,
      attributes: this.props.currentStep.object.filterData.map((attr) => ({
        key: attr.key,
        value: attr.value,
        contains: 'true',
      })),
    };
    if (SharedElementHelpers.IsPage(this.props.currentStep.object)) {
      startData.url = this.props.currentStep.object.url;
    } else {
      startData.name =
        this.props.currentStep.object.actionType === ActionTypes.COMMERCE
          ? '__commerce_action__'
          : this.props.currentStep.object.label;
    }

    this.props.onGetAttributeExplorerData(
      this.props.funnel.projectId,
      startData,
      this.props.funnelConfiguration
    );
  };

  componentDidMount() {
    // Do not send traffic-explorer request if there is page without url
    if (!(SharedElementHelpers.IsPage(this.props.currentStep.object) && !this.props.currentStep.object.url)) {
      this.getAttributeExplorerData();
    }
  }

  componentWillUnmount() {
    this.props.setAttributeExplorerData({});
  }

  setSelectedAttribute = (key, value) => {
    const updatedFilterData = [...this.props.currentStep.object.filterData, { key: key, value: value }]
    this.props.onSetNewCurrentStepFilterParams(updatedFilterData);
    commonSendEventFunction(RP_EVENT_EDIT_OBJECT, {
      stepId: this.props.currentStep.stepId,
      label: this.props.currentStep.object.label,
      filterData: updatedFilterData,
    });
  };

  deleteSelectedAttribute = (item) => {
    const updatedFilterData = this.props.currentStep.object.filterData.filter((a) => a.key !== item.key);
    this.props.onSetNewCurrentStepFilterParams(updatedFilterData);
    commonSendEventFunction(RP_EVENT_EDIT_OBJECT, {
      stepId: this.props.currentStep.stepId,
      label: this.props.currentStep.object.label,
      filterData: updatedFilterData,
    });
  };

  render() {
    const ToolbarStyles = {
      top: this.props.position.y - 40,
      left: this.props.position.x,
    };

    const SelectedAttributes = () => {
      return (
        <div>
          {this.props.currentStep.object.filterData.length > 0 &&
            this.props.currentStep.object.filterData.map((item) => {
              return (
                <div key={item.key}>
                  <div
                    className={`${styles.ItemBlock} ${styles.SpaceBetween} ${styles.SelectedAttr}`}
                  >
                    <div className={`${styles.DoubleIndentedBlock}`}>
                      <span className={styles.Strong}>{item.key}:</span>
                      <span className={styles.AtrItem}>{item.value}</span>
                    </div>
                    <div
                      className={` ${styles.MinusBtn}`}
                      onClick={() => this.deleteSelectedAttribute(item)}
                    >
                      {iconMinusSmall}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      );
    };

    const renderAttributesList = () => {
      if (SharedElementHelpers.IsPage(this.props.currentStep.object)) {
        return (
          <div>
            <div className={styles.ItemBlock}>
              <span className={styles.Strong}>URL: </span> {this.props.currentStep.object.url || ''}
            </div>
            {SelectedAttributes()}
            <div className={styles.ItemBlock}>
              <span className={styles.Strong}>Common Parameters: </span>
            </div>
            {/* Select only those attributes that are missing in the filterData to avoid duplicate keys */}
            <AttributesList
              attributes={
                this.props.attributeExplorerData.common_parameters?.filter(
                  (e) => !this.props.currentStep.object.filterData.some((attr) => attr.key === e.key)
                ) || []
              }
              onSelect={this.setSelectedAttribute}
            />
            <div className={styles.ItemBlock}>
              <span className={styles.Strong}>Custom Parameters: </span>
            </div>
            {/* Select only those attributes that are missing in the filterData to avoid duplicate keys */}
            <AttributesList
              attributes={
                this.props.attributeExplorerData.custom_parameters?.filter(
                  (e) => !this.props.currentStep.object.filterData.some((attr) => attr.key === e.key)
                ) || []
              }
              onSelect={this.setSelectedAttribute}
            />
          </div>
        );
      }
      return (
        <div>
          <div className={`${styles.ItemBlock} ${styles.AttributeName}`}>
            <span className={styles.Strong}>Name: </span>
            {(commerceAction[this.props.currentStep.object.label] ||
              this.props.currentStep.actionType === ActionTypes.COMMERCE) &&
              iconSmallLogo}
            {commerceAction[this.props.currentStep.object.label] ||
              this.props.currentStep.object.label ||
              ''}
          </div>
          {SelectedAttributes()}
          {/* Select only those attributes that are missing in the filterData to avoid duplicate keys */}
          <AttributesList
            attributes={
              this.props.attributeExplorerData.action_attributes?.filter(
                (e) => !this.props.currentStep.object.filterData.some((attr) => attr.key === e.key)
              ) || []
            }
            onSelect={this.setSelectedAttribute}
          />
        </div>
      );
    };

    return (
      <div>
        <div className={styles.Container} style={ToolbarStyles}>
          <div className={styles.Header}>
            <div className={styles.AllSteps}>
              All Steps
              <span className={styles.LabelBeta}>BETA</span>
            </div>
            <div>
              <RefreshButton
                analyticsStatus={this.props.analyticsStatus}
                loading={this.props.explorerIsLoading}
                onClick={this.getAttributeExplorerData}
              />
            </div>
          </div>
          <div className={styles.ScrolledContent}>
            <div className={styles.ItemBlock}>
              <span className={styles.Strong}>Count: </span>
              {this.props.attributeExplorerData.countValue || 0}
            </div>
            {renderAttributesList()}
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    currentStep: selectCurrentStep(state),
    funnelConfiguration: selectFunnelConfiguration(state),
    analyticsStatus: selectAnalyticsStatus(state),
    explorerIsLoading: selectExplorerIsLoading(state),
    attributeExplorerData: selectAttributeExplorerData(state),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onSetNewCurrentStepFilterParams: (newValue) =>
      dispatch(setNewCurrentStepFilterParams(newValue)),
    onGetAttributeExplorerData: (projectId, startData, funnelConfiguration) =>
      dispatch(getAttributeExplorerDataAsync(projectId, startData, funnelConfiguration)),
    setAttributeExplorerData: (data) => dispatch(setAttributeExplorerData(data)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(AttributeExplorer);
