import React, {Component} from "react";
import '../../pixi-project/index';
import styles from "./Main.module.scss";
import TopToolbar from "react-project/Toolbar/TopToolbar";
import AttributeExplorer from 'react-project/AttributeExplorer/AttributeExplorer';
import {NotificationAlert} from '../components/notificationAlert/NotificationAlert';

import {connect} from 'react-redux';
import {
  PR_EVENT_TOOLBAR_SHOWING,
  PR_EVENT_OPEN_ATTRIBUTE_EXPLORER,
  RP_EVENT_ERROR_MESSAGE,
  PR_EVENT_CONNECTION_IN_EMPTY_SPACE,
  RP_EVENT_CANCEL_NEW_STEP_FROM_CONNECTION,
  PR_EVENT_ELEMENT_POINTER_UP,
  RP_EVENT_ELEMENT_RIGHT_CLICK,
  PR_EVENT_CONNECTION_SETTINGS_BUTTON_CLICKED,
  PR_EVENT_ELEMENT_SELECTED,
} from 'shared/CSharedEvents';
import { EElementCategories, EElementTypes } from 'shared/CSharedCategories';
import CommonToolbar from "react-project/Toolbar/CommonToolbar";
import SharedElementHelpers from "shared/SharedElementHelpers";
import { ErrorMessageContainer } from 'react-project/Main/ErrorMessageContainer';

import { selectFunnel } from 'react-project/redux/funnels/selectors';
import { selectEmail } from "react-project/redux/user/selectors";
import { LoadHubspotChat } from "../Helpers/HubspotChat";
import { cloneData } from "shared/CSharedMethods";
import { setNewCurrentStep } from "react-project/redux/current-step/actions";
import { selectCurrentStep } from "../redux/current-step/selectors";

class Main extends Component {
    state = {
        toolbarOpened: false,
        category: EElementCategories.CONNECTION,
        toolbarData: {},
        attributeExplorerOpened: false,
        attributeExplorerCoords: {},
        toolbarMultiSelect: false,
        isErrorMessageShowing: false,
        isShowStep : false,
        ErrorMessageData: {}
    }

    errorMessageSetter = (isShow) => {
        this.setState({
            isErrorMessageShowing: isShow
        })
    }

    errorMessageHandler = (e) => {
        this.setState({
            isErrorMessageShowing: true,
            ErrorMessageData: e.detail.errorMSG
        })
    }

    setToolbarMultiselect = (state) => {
        this.setState({
            toolbarMultiSelect:state
        })
    }

    toolbarShowingHandler = (e) => {
      if (!e.detail.show) {
        this.setToolbarMultiselect(false);
        this.setState({
          attributeExplorerOpened: false,
          toolbarOpened: false,
          toolbarData: {},
        });
        return;
      }

      const detailData = {
        coords: e.detail.position || {x: 0, y: 0},
        sectionStyle: e.detail.sectionStyle || {},
        stepId: e.detail.stepId
      }

      if(e.detail.multiSelect) {
        this.setToolbarMultiselect(e.detail.multiSelect);
      }

      this.setState({
        toolbarOpened: e.detail.show,
        category: e.detail.category,
        toolbarData: detailData,
        type: e.detail.type,
      });
    }

    attributeExplorerHandler = (e) => {
        const detailDataCoords = e.detail.position;
        this.setState({
            attributeExplorerOpened: true,
            toolbarOpened: false,
            attributeExplorerCoords: detailDataCoords
        })
    }

    onConnectionInEmptySpace = () => {
        this.setState({isShowStep: true})
    }

    onCancelNewStepFromConnection = () => {
        this.setState({isShowStep: false})
    }

    onElementPointerUp = (e) => {
      this.updateCurrentStep(e.detail);
    }

    onElementRightClicked = (e) => {
      this.updateCurrentStep(e.detail);
    }

    onElementSelected = (e) => {
      this.updateCurrentStep(e.detail);
    }

    updateCurrentStep = (data) => {
      const step = cloneData(data);
      this.props.onSetNewCurrentStep(step);
    }

    onConnectionSettingsButtonClicked = (e) => {
      const data = {
        ...e.detail.step,
        supportedLineTypes: e.detail.toolbarData.supportedLineTypes
      };

      const detailData = {
        coords: e.detail.toolbarData.position || {x: 0, y: 0},
        sectionStyle: { height: 50 },
        stepId: e.detail.step.ID
      }

      this.setState({
        toolbarOpened: true,
        category: EElementCategories.CONNECTION,
        toolbarData: detailData,
        type: EElementTypes.MISC,
      });

      this.updateCurrentStep(data);
    }

    componentDidMount() {
        document.addEventListener(PR_EVENT_TOOLBAR_SHOWING, this.toolbarShowingHandler, false);
        document.addEventListener(PR_EVENT_OPEN_ATTRIBUTE_EXPLORER, this.attributeExplorerHandler, false);
        document.addEventListener(RP_EVENT_ERROR_MESSAGE, this.errorMessageHandler, false);
        document.addEventListener(PR_EVENT_CONNECTION_IN_EMPTY_SPACE, this.onConnectionInEmptySpace, false);
        document.addEventListener(RP_EVENT_CANCEL_NEW_STEP_FROM_CONNECTION, this.onCancelNewStepFromConnection, false);
        document.addEventListener(PR_EVENT_ELEMENT_POINTER_UP, this.onElementPointerUp, false);
        document.addEventListener(RP_EVENT_ELEMENT_RIGHT_CLICK, this.onElementRightClicked, false);
        document.addEventListener(PR_EVENT_CONNECTION_SETTINGS_BUTTON_CLICKED, this.onConnectionSettingsButtonClicked, false);
        document.addEventListener(PR_EVENT_ELEMENT_SELECTED, this.onElementSelected);
    }

    componentWillUnmount() {
      document.removeEventListener(PR_EVENT_TOOLBAR_SHOWING, this.toolbarShowingHandler, false);
      document.removeEventListener(PR_EVENT_OPEN_ATTRIBUTE_EXPLORER, this.attributeExplorerHandler, false);
      document.removeEventListener(RP_EVENT_ERROR_MESSAGE, this.errorMessageHandler, false);
      document.removeEventListener(PR_EVENT_CONNECTION_IN_EMPTY_SPACE, this.onConnectionInEmptySpace, false);
      document.removeEventListener(RP_EVENT_CANCEL_NEW_STEP_FROM_CONNECTION, this.onCancelNewStepFromConnection, false);
      document.removeEventListener(PR_EVENT_ELEMENT_POINTER_UP, this.onElementPointerUp, false);
      document.removeEventListener(RP_EVENT_ELEMENT_RIGHT_CLICK, this.onElementRightClicked, false);
      document.removeEventListener(PR_EVENT_CONNECTION_SETTINGS_BUTTON_CLICKED, this.onConnectionSettingsButtonClicked, false);
      document.removeEventListener(PR_EVENT_ELEMENT_SELECTED, this.onElementSelected);
    }

    render() {
        const isShowToolbar = this.state.toolbarOpened && this.state.isShowStep === false;
        const renderToolbar = () => {
            if (
                !SharedElementHelpers.IsConnection(this.state) &&
                isShowToolbar &&
                this.state.toolbarMultiSelect === false
              ) {
                return (
                  <TopToolbar
                    funnel={this.props.funnel}
                    position={this.state.toolbarData.coords}
                    sectionStyle={this.state.toolbarData.sectionStyle}
                    stepId={this.state.toolbarData.stepId}
                    iconType={this.state.type}
                  />
                );
              } else if (isShowToolbar && this.state.toolbarMultiSelect === true) {
                return (
                  <CommonToolbar
                    position={this.state.toolbarData.coords}
                    sectionStyle={this.state.toolbarData.sectionStyle}
                    stepId={this.state.toolbarData.stepId}
                    multiSelect={this.state.toolbarMultiSelect}
                  />
                );
              } else if (SharedElementHelpers.IsConnection(this.state) && this.state.toolbarOpened) {
                return (
                    <CommonToolbar position={this.state.toolbarData.coords} sectionStyle={this.state.toolbarData.sectionStyle} stepId={this.state.toolbarData.stepId} />
                )
            } else {
                return null;
            }
        };

        return (
            <div className={styles.Wrapper}>
                {this.props.userEmail && (
                  <LoadHubspotChat email={this.props.userEmail} />
                )}
                {renderToolbar()}
                { this.state.attributeExplorerOpened && this.props.funnel ?
                  <AttributeExplorer
                    position={this.state.attributeExplorerCoords}
                    funnel={this.props.funnel}
                  />
                  :
                  null
                }
                { this.state.isErrorMessageShowing ? <ErrorMessageContainer
                    msgData={this.state.ErrorMessageData}
                    onClose={() => this.errorMessageSetter(false)} /> : null }
                <NotificationAlert/>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
  return {
    currentStep: selectCurrentStep(state),
    funnel: selectFunnel(state, props.funnelId),
    userEmail: selectEmail(state),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onSetNewCurrentStep: (newValue) => dispatch(setNewCurrentStep(newValue)),
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(Main);
