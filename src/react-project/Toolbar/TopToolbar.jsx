import React, {Component} from 'react';
import styles from 'react-project/Toolbar/Toolbar.module.scss';
import { iconDelete } from "react-project/assets/Icons";
import 'react-quill/dist/quill.snow.css';
import 'react-quill/dist/quill.bubble.css';
import {connect} from 'react-redux';
import cls from 'classnames';
import produce from "immer";
import {
    RP_EVENT_EDIT_OBJECT
} from 'shared/CSharedEvents';
import {EElementTypes, EElementCategories} from 'shared/CSharedCategories';
import { loadAnalyticsAsync } from '../redux/analytics/actions';
import StepToolbar from "./StepToolbar";
import { selectApiKey } from "react-project/redux/analytics/selectors";
import {ViewportAllower} from "react-project/components/viewportAllower/ViewportAllower"
import { commonSendEventFunction } from "shared/CSharedMethods";
import { selectCurrentStep } from "../redux/current-step/selectors";
import {
  setNewCurrentStepFilterParams,
  setNewCurrentStepTrackingUrl,
  setNewCurrentStepUtmData,
} from 'react-project/redux/current-step/actions';
import { selectFunnelConfiguration } from "../redux/funnel-configuration/selectors";

const typeSource = EElementTypes.SOURCE;
const typeActions = EElementTypes.EVENT;

class TopToolbar extends Component {
    constructor(props) {
        super(props);
        let activeStateForUrlParamsCheckbox;

        const filterParamsInitArray = this.props.currentStep.object.filterData;
        filterParamsInitArray.length > 0 ? activeStateForUrlParamsCheckbox = true : activeStateForUrlParamsCheckbox = false;
        this.state = {
            loadingThumbnailImg : false,
            notesBlock: true,
            categoryType: this.props.currentStep.object.category,
            isShowUrlParams: activeStateForUrlParamsCheckbox,
            urlValue: this.props.currentStep.object.url,
            labelValue: this.props.currentStep.object.label,
            filterParamsArray: filterParamsInitArray,
            utmData: this.props.currentStep.object.utmData,
            trackingURL: this.props.currentStep.object.trackingURL,
        };

        this.modules = {
            toolbar: [
                [{ 'font': [] }],
                [{ 'size': ['small', false, 'large', 'huge'] }],
                ['bold', 'italic', 'underline'],
                [{'list': 'ordered'}, {'list': 'bullet'}],
                [{ 'align': [] }],
                [{ 'color': [] }, { 'background': [] }],
                ['clean']
            ]
        };

        this.handleInputChangeUrlParams = this.handleInputChangeUrlParams.bind(this);
        this.handleFilterPageByUrlChange = this.handleFilterPageByUrlChange.bind(this);
    }

    handleInputChangeUrlParams(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        this.setState({
            [name]: value
        });
    }

    handleFilterPageByUrlChange(event) {
      const target = event.target;
      const value = target.checked;
      const name = target.name;

      this.setState({
        [name]: value
      });

      if (!value) {
        this.setState({ filterParamsArray: []});
      }

      commonSendEventFunction(RP_EVENT_EDIT_OBJECT, {
        stepId: this.props.currentStep.stepId,
        filterData: value ? this.state.filterParamsArray : []
      });
    }

    onTrackingUrlChange = (e) => {
      this.setState({
        trackingURL: e.target.value
      })

      commonSendEventFunction(RP_EVENT_EDIT_OBJECT, {
        stepId: this.props.currentStep.stepId,
        label: this.props.currentStep.object.label,
        filterData: this.props.currentStep.object.filterData,
        utmData: this.props.currentStep.object.utmData,
        trackingURL: e.target.value
      });

      this.props.onSetNewCurrentStepTrackingUrl(e.target.value);
    }

    onParamsInputChange = (e, rowIndex) => {
        const nextState = produce(this.state.filterParamsArray, draft => {
            draft[rowIndex][e.target.name] = e.target.value;
            if (draft[rowIndex].isFocusKey){
                draft[rowIndex].isFocusKey = false;
            }
        });

        this.setState({
            filterParamsArray: nextState
        });
        this.props.onSetNewCurrentStepFilterParams(nextState);
        const event = new CustomEvent(RP_EVENT_EDIT_OBJECT, {
            detail: {
                stepId: this.props.currentStep.stepId,
                label: this.props.currentStep.object.label,
                filterData: nextState
            }
        });
        document.dispatchEvent(event);
    }

    onParamsSourceChange = (e) => {
        const newUtmData = produce(this.state.utmData, draft => {
            draft[e.target.name] = e.target.value;
        });
        this.setState({
            utmData: newUtmData
        });
        this.props.onSetNewCurrentStepUtmData(newUtmData);
        const event = new CustomEvent(RP_EVENT_EDIT_OBJECT, {
            detail: {
                stepId: this.props.currentStep.stepId,
                label: this.props.currentStep.object.label,
                filterData: this.props.currentStep.object.filterData,
                utmData: newUtmData,
                trackingURL: 'test'
            }
        });
        document.dispatchEvent(event);
    }

    deleteParamRow = (rowIndex) => {
        const newState = this.state.filterParamsArray;
        const filtered = newState.filter((el, i) => {
            return i !== rowIndex
        });
        this.setState({
            filterParamsArray: filtered
        }, () => {
            const event = new CustomEvent(RP_EVENT_EDIT_OBJECT, {
                detail: {
                    stepId: this.props.currentStep.stepId,
                    label: this.props.currentStep.object.label,
                    filterData: this.state.filterParamsArray
                }
            })
            document.dispatchEvent(event);
        })
        this.props.onSetNewCurrentStepFilterParams(this.state.filterParamsArray);
    }

    addNewCustomParameter = () => {
      const newFilterParamsArray = this.state.filterParamsArray.concat({
        contains: '',
        key: '',
        value: '',
        isFocusKey: true
      });

      this.setState({
        filterParamsArray: newFilterParamsArray
      })
    };

    componentDidUpdate = (prevProps) => {
      if(prevProps.currentStep.object.filterData !== this.props.currentStep.object.filterData) {
        const filterData = this.props.currentStep.object.filterData;
        this.setState({ filterParamsArray: filterData, isShowUrlParams: filterData.length > 0 });
      }
    };

    render() {
        const {sectionStyle : {height : upperElHeight } = {}} = this.props;
        const addParamsSelect = (contains, i) => {
            if (this.props.iconType !== typeActions){
                return (
                    <div className={styles.FilterItemParameter}>
                        <label>Type</label>
                        <select
                            defaultValue={contains}
                            name="contains"
                            onChange={(e) => this.onParamsInputChange(e, i)}
                        >
                            <option value="true">Contains</option>
                            <option value="false">Does Not Contain</option>
                        </select>
                    </div>
                )
            }
        }

        // eslint-disable-next-line
        const urlParamsRows = this.state.filterParamsArray.map((filterItem, i) => {
            if (this.state.isShowUrlParams || this.props.iconType === typeSource) {
                return (
                    <div key={i} className={styles.FilterRow}>
                        {addParamsSelect(filterItem.contains, i)}
                        <div className={styles.FilterItemParameter}>
                            <label>Key</label>
                            <input
                                autoFocus={filterItem.isFocusKey}
                                name="key"
                                type="text"
                                value={filterItem.key}
                                onChange={(e) => this.onParamsInputChange(e, i)}
                            />
                        </div>
                        <div className={styles.FilterItemParameter}>
                            <label>Value</label>
                            <input
                                name="value"
                                type="text"
                                value={filterItem.value}
                                onChange={(e) => this.onParamsInputChange(e, i)}
                            />
                        </div>
                        <span onClick={() => this.deleteParamRow(i)}>{iconDelete}</span>
                    </div>
                )
            }
        })

        return (
            <ViewportAllower
            startX={this.props.position.x}
            startY={
                EElementCategories.SHAPE === this.state.categoryType
                  ? this.props.position.y - 15
                  : this.props.position.y
              }
            upperElHeight={upperElHeight}
            className={cls(styles[this.props.currentStep.object.type], styles.StepToolbarContainer)}>
              <StepToolbar
                iconType={this.props.iconType}
                isShowUrlParams={this.state.isShowUrlParams}
                handleInputChangeUrlParams={this.handleInputChangeUrlParams}
                onAddCustomParameter={this.addNewCustomParameter}
                urlParamsRows={urlParamsRows}
                trackingURL={this.state.trackingURL}
                onTrackingUrlChange={this.onTrackingUrlChange}
                utmData={this.state.utmData}
                onParamsSourceChange={this.onParamsSourceChange}
                onToggleContextMenu={this.toggleContextMenu}
                handleFilterPageByUrlChange={this.handleFilterPageByUrlChange}
                currentStep={this.props.currentStep}
                projectApiKey={this.props.projectApiKey}
                projectId={this.props.funnel.projectId}
                funnelConfiguration={this.props.funnelConfiguration}
              />
          </ViewportAllower>
        );
    }
}

function mapStateToProps(state) {
  return {
    currentStep: selectCurrentStep(state),
    funnelConfiguration: selectFunnelConfiguration(state),
    projectApiKey: selectApiKey(state),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onSetNewCurrentStepFilterParams: (newValue) =>
      dispatch(setNewCurrentStepFilterParams(newValue)),
    onSetNewCurrentStepUtmData: (newValue) => dispatch(setNewCurrentStepUtmData(newValue)),
    onSetNewCurrentStepTrackingUrl: (newValue) => dispatch(setNewCurrentStepTrackingUrl(newValue)),
    onLoadAnalytics: (projectId, funnelConfiguration, dataObjs, dataConnections) =>
      dispatch(loadAnalyticsAsync(projectId, funnelConfiguration, dataObjs, dataConnections)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(TopToolbar);
