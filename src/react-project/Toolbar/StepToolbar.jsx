import React, { Component } from 'react';
import styles from 'react-project/Toolbar/Toolbar.module.scss';

import { PR_EVENT_SHAPE_STYLE_CHANGED, RP_EVENT_PROPERTY_CHANGED } from 'shared/CSharedEvents';

import {
  STEP_SETTINGS_TAB_NAME,
  STEP_TRACKING_TAB_NAME,
  STEP_BORDER_COLOR_TAB_NAME,
  STEP_FILL_COLOR_TAB_NAME,
} from 'react-project/Constants/step-settings';
import { ColorPicker } from 'react-project/components/colorPicker/ColorPicker';
import { When } from 'react-project/Util/When';
import { EShapeTypes, PropertyType } from 'shared/CSharedConstants';
import { EElementTypes } from 'shared/CSharedCategories';

import { StepToolbarTabs } from './step-toolbar/StepToolbarTabs';
import { StepSettings } from './step-toolbar/StepSettings';
import { PageTracking } from './step-toolbar/PageTracking';
import { SourceTracking } from './step-toolbar/SourceTracking';
import { EventTracking } from './step-toolbar/EventTracking';
import { RevenueActionTracking } from './step-toolbar/RevenueActionTracking';
import { ActionTypes } from 'shared/CSharedConstants';
import { ViewportAllower } from 'react-project/components/viewportAllower/ViewportAllower';
import { ClickOutsideCustomComponent } from '../Util/ClickOutsideCustom';
import { selectInputValues } from 'react-project/redux/inputs/selectors';
import { connect } from 'react-redux';
import { clearInputsState } from 'react-project/redux/inputs/actions';
import { notifyIfValueChanged, onCloseMenu } from "react-project/Util/InputHelpers";

const NOT_TRACKING_STEP_TABS = [STEP_SETTINGS_TAB_NAME];
const TRACKING_STEP_TABS = [STEP_SETTINGS_TAB_NAME, STEP_TRACKING_TAB_NAME];

const STEP_TABS_MAP = new Map([
  [EElementTypes.PAGE, TRACKING_STEP_TABS],
  [EElementTypes.SOURCE, TRACKING_STEP_TABS],
  [EElementTypes.EVENT, TRACKING_STEP_TABS],
  [EElementTypes.MISC, NOT_TRACKING_STEP_TABS],
  [EShapeTypes.ELLIPSE, [STEP_BORDER_COLOR_TAB_NAME, STEP_FILL_COLOR_TAB_NAME]],
  [EShapeTypes.RECTANGLE, [STEP_BORDER_COLOR_TAB_NAME, STEP_FILL_COLOR_TAB_NAME]],
  [EShapeTypes.TRIANGLE, [STEP_BORDER_COLOR_TAB_NAME, STEP_FILL_COLOR_TAB_NAME]],
]);

class StepToolbar extends Component {
  state = {
    selectedTab: undefined,
    showColorPicker: false,
    shapeStyle : {borderColor : '', fillColor : ''}
  };

  setShapeStyle = (shapeStyle) => {
    this.setState({shapeStyle});
  }

  onShapeStyleChanged = (e) => {

    const {detail = {}} = e;
    const {shapeStyle : {borderColor, fillColor} = {}} = this.state;

    let shapeStyle = {borderColor, fillColor};
    Object.keys(detail).forEach((key) => shapeStyle[key] = detail[key])

    this.setShapeStyle(shapeStyle);

  }

  componentDidMount() {

    const {
      object : {
        shapeStyle = {}
      } = {}
    } = this.props.currentStep;

    this.setShapeStyle(shapeStyle);

    document.addEventListener(PR_EVENT_SHAPE_STYLE_CHANGED, this.onShapeStyleChanged, false);
  }

  componentWillUnmount() {
    document.removeEventListener(PR_EVENT_SHAPE_STYLE_CHANGED, this.onShapeStyleChanged, false);
  }

  onTabSelected = (selectedTab) => {
    this.setState({
      selectedTab,
      showColorPicker: [STEP_BORDER_COLOR_TAB_NAME, STEP_FILL_COLOR_TAB_NAME].includes(selectedTab)
        ? !this.state.showColorPicker || this.state.selectedTab !== selectedTab
        : false,
    });
  };

  render() {
    const { selectedTab, showColorPicker, shapeStyle } = this.state;

    const {
      iconType,
      isShowUrlParams,
      handleInputChangeUrlParams,
      handleFilterPageByUrlChange,
      onAddCustomParameter,
      urlParamsRows,
      trackingURL,
      onTrackingUrlChange,
      utmData,
      onParamsSourceChange,
    } = this.props;
    const tabs = STEP_TABS_MAP.has(iconType) ? STEP_TABS_MAP.get(iconType) : [];

    return (
      <div className={styles.StepToolbar}>
        <div className={styles.StepToolbarTabsWrapper}>
          <StepToolbarTabs
            shapeStyle={shapeStyle}
            selectedTab={selectedTab}
            onSelectTab={this.onTabSelected}
            tabs={tabs}
            iconType={iconType}
            stepId={this.props.currentStep.stepId}
            currentStep={this.props.currentStep}
            notifyIfValueChanged={notifyIfValueChanged}
            onCloseMenu={() => onCloseMenu({ inputs: this.props.inputs, clearInputsState: this.props.clearInputsState})}
          />
        </div>
        <ClickOutsideCustomComponent
          onClickOutside={() => {
            this.setState({ selectedTab: false });
          }}
        >
          <When condition={selectedTab === STEP_SETTINGS_TAB_NAME}>
            <ViewportAllower type="relative" className={styles.StepToolbarSection}>
              <StepSettings
                iconType={iconType}
                stepId={this.props.currentStep.stepId}
                showUrlBlock={iconType === EElementTypes.PAGE}
                projectId={this.props.projectId}
                notifyIfValueChanged={notifyIfValueChanged}
              />
            </ViewportAllower>
          </When>
          <When condition={selectedTab === STEP_TRACKING_TAB_NAME}>
            <When condition={iconType === EElementTypes.PAGE}>
              <ViewportAllower type="relative" className={styles.StepToolbarSection}>
                <PageTracking
                  isShowUrlParams={isShowUrlParams}
                  handleInputChangeUrlParams={handleInputChangeUrlParams}
                  handleFilterPageByUrlChange={handleFilterPageByUrlChange}
                  onAddCustomParameter={onAddCustomParameter}
                  urlParamsRows={urlParamsRows}
                  projectId={this.props.projectId}
                />
              </ViewportAllower>
            </When>
            <When condition={iconType === EElementTypes.SOURCE}>
              <ViewportAllower type="relative" className={styles.StepToolbarSection}>
                <SourceTracking
                  trackingURL={trackingURL}
                  onTrackingUrlChange={onTrackingUrlChange}
                  utmData={utmData}
                  onParamsSourceChange={onParamsSourceChange}
                  onAddCustomParameter={onAddCustomParameter}
                  urlParamsRows={urlParamsRows}
                />
              </ViewportAllower>
            </When>
            <When
              condition={
                iconType === EElementTypes.EVENT &&
                this.props.currentStep.object.actionType !== ActionTypes.COMMERCE
              }
            >
              <ViewportAllower type="relative" className={styles.StepToolbarSection}>
                <EventTracking
                  isShowUrlParams={isShowUrlParams}
                  handleInputChangeUrlParams={handleInputChangeUrlParams}
                  onAddCustomParameter={onAddCustomParameter}
                  urlParamsRows={urlParamsRows}
                />
              </ViewportAllower>
            </When>
            <When
              condition={
                iconType === EElementTypes.EVENT &&
                this.props.currentStep.object.actionType === ActionTypes.COMMERCE
              }
            >
              <RevenueActionTracking
                projectApiKey={this.props.projectApiKey}
                projectId={this.props.projectId}
                currentStep={this.props.currentStep}
                funnelConfiguration={this.props.funnelConfiguration}
              />
            </When>
          </When>
          <When condition={showColorPicker && selectedTab === STEP_BORDER_COLOR_TAB_NAME}>
            <ViewportAllower type="relative" className={styles.StepToolbarSection}>
              <ColorPicker color={shapeStyle.borderColor} type={selectedTab} />
            </ViewportAllower>
          </When>
          <When condition={showColorPicker && selectedTab === STEP_FILL_COLOR_TAB_NAME}>
            <ViewportAllower type="relative" className={styles.StepToolbarSection}>
              <ColorPicker color={shapeStyle.fillColor} type={selectedTab} />
            </ViewportAllower>
          </When>
        </ClickOutsideCustomComponent>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    inputs: selectInputValues(state),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    clearInputsState: () => dispatch(clearInputsState()),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(StepToolbar);
