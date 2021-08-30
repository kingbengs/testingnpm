import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import cls from 'classnames';
import "bootstrap-daterangepicker/daterangepicker.css";
import styles from "./LeftSideBar.module.scss";
import {
  iconPeople,
  iconRemoveFilter,
  iconAddFilter,
  iconSplitLink,
  iconLeadTime,
  iconCalendar,
} from "../assets/Icons";

import { cloneData, commonSendEventFunction } from "shared/CSharedMethods";
import {
  RP_EVENT_GET_DATA,
  RP_EVENT_STEP_FOCUS_CLEARED,
  RP_EVENT_REFRESH_REQUEST,
  RP_EVENT_STEP_FOCUS_CHANGED,
  RP_EVENT_FOCUS_FRAME_CLEARED,
} from "shared/CSharedEvents";
import {
  loadProfileCountriesAsync,
  setCompareMode,
  setSelectedCompareSession,
  setSelectedSession
} from "../redux/analytics/actions";
import {
  setStepFocusingId,
  setDataRange,
  setFilterData,
  setCompareFilterData,
  setCompareFilter,
} from 'react-project/redux/funnel-configuration/actions';
import {
  selectAnalyticsStatus,
  selectCompareMode,
  selectCompareSession,
  selectSession,
  selectSessions,
} from 'react-project/redux/analytics/selectors';

import {
  ANALYTICS_STATUS_LOADING,
  FILTER_TYPE_COMPARE,
  FILTER_TYPE_COMPARE_STEP,
  FILTER_TYPE_DEFAULT,
  FILTER_TYPE_DEFAULT_STEP,
} from "shared/CSharedConstants";
import { SecondaryButton } from "../components/secondaryButton/SecondaryButton";
import isEqual from "lodash/isEqual";
import { CommonDropdown } from "../components/dropdown/CommonDropdown";
import { FiltersBlock, FILTER_BLOCK_TYPES } from "./FiltersBlock";
import { dateFormatter } from "react-project/LeftSideBar/filter-components/DateFilterBlock";
import { DEFAULT_DEVICES_STATE } from "react-project/Constants/step-settings";
import {
  selectCompareStepFocused,
  selectStepFocused,
} from 'react-project/redux/focused-step/selectors';
import { setStepFilterOpened, updateFocusedStep } from 'react-project/redux/focused-step/actions';
import { DropdownItem } from 'react-project/components/dropdown/DropdownItem';
import { DropdownBlock } from 'react-project/components/dropdown/DropdownBlock';
import { selectApplyButtonEnabled, selectFilters } from 'react-project/redux/filters/selectors';
import {
  clearFilterState,
  setFilter,
  defaultFilters,
  setApplyButtonEnabled
} from 'react-project/redux/filters/actions';
import { FILTER_NAMES } from "react-project/Constants/filters";
import { selectCurrentStep } from "../redux/current-step/selectors";
import { selectFunnelConfiguration } from "react-project/redux/funnel-configuration/selectors";
import { selectExplorerItemsConfig } from "react-project/redux/explorer/selectors";
import { onSetExplorerItemsConfig } from "react-project/redux/explorer/actions";

const DropdownTrigger = ({ ...rest }) => {
  return (
    <div className={styles.CompareDropdownTrigger} {...rest}>
      {iconAddFilter}
    </div>
  );
};
const FILTERS = 'FILTERS.IDS';
const COMPARE_FILTER_LABELS = {
  PEOPLE: 'People',
  DATE: 'Date',
};

class LeftSideBar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isFlowActive: false,
      isLeadTimeActive: false,
      scrollTopPosition: 0,
    };

    this.sendToStore = this.sendToStore.bind(this);
    this.onSelectCompareFilter = this.onSelectCompareFilter.bind(this);
    this.onDeleteCompareFilter = this.onDeleteCompareFilter.bind(this);
  }

  sendToStore(dateRangeValue, compare = false) {
    const {
      funnelConfiguration: { selectedCompareFilter },
    } = this.props;
    let intermediateValue;
    if (dateRangeValue.min !== dateRangeValue.max) {
      intermediateValue = {
        min: new Date(dateRangeValue.min).toISOString(),
        max: new Date(dateRangeValue.max).toISOString(),
      };
    } else {
      intermediateValue = {
        min: new Date(new Date(dateRangeValue.min).setHours(0, 0, 0, 0)).toISOString(),
        max: new Date(new Date(dateRangeValue.max).setHours(23, 59, 59, 0)).toISOString(),
      };
    }

    if (selectedCompareFilter && selectedCompareFilter.label === COMPARE_FILTER_LABELS.PEOPLE) {
      this.props.onSetDateRange(intermediateValue, false);
      this.props.onSetDateRange(intermediateValue, true);
    } else {
      this.props.onSetDateRange(intermediateValue, compare);
    }
  }

  getCountriesRequest = (e) => {
    const objForSending = JSON.parse(e.detail.data);
    const { onLoadProfileCountries, funnelConfiguration, funnel } = this.props;

    onLoadProfileCountries(
      funnel.projectId,
      funnelConfiguration,
      objForSending.objects,
      objForSending.joints
    );
  };

  saveFilters = () => {
    if (this.props.analyticsStatus === ANALYTICS_STATUS_LOADING) {
      return;
    }

    const {
      commonFilters,
      peopleCompareFilters,
      dateCompareFilter,
    } = this.props.allFilters.currentFilters;

    const {
      onSetFilterData,
      onSetExplorerItemsConfig,
      funnel,
      currentStep,
      funnelConfiguration,
      funnelConfiguration: { selectedCompareFilter },
    } = this.props;

    const filters = {
      device: commonFilters.device || DEFAULT_DEVICES_STATE,
      countries: commonFilters.countries || [],
    };

    if (commonFilters.session) {
      filters.session = commonFilters.session.id;
    }

    onSetFilterData(filters).then(() => {
      if (this.props.compareModeEnabled) {
        const compareFilters =
          selectedCompareFilter.label === COMPARE_FILTER_LABELS.PEOPLE
            ? {
                device: peopleCompareFilters.device || DEFAULT_DEVICES_STATE,
                countries: peopleCompareFilters.countries || [],
              }
            : { ...filters };

        if (selectedCompareFilter.label === COMPARE_FILTER_LABELS.PEOPLE && peopleCompareFilters.session) {
          compareFilters.session = peopleCompareFilters.session.id;
        } else if (selectedCompareFilter.label !== COMPARE_FILTER_LABELS.PEOPLE && commonFilters.session) {
          compareFilters.session = commonFilters.session.id;
        }

        this.props.onSetCompareFilterData(compareFilters).then(() => {
          commonSendEventFunction(RP_EVENT_REFRESH_REQUEST);
          const props = {
            funnelConfiguration: {
              ...this.props.funnelConfiguration,
              filter: filters,
            },
            funnel: this.props.funnel,
            currentStep: this.props.currentStep,
            port: false,
            explorerItemsConfig: this.props.explorerItemsConfig,
            mounted: true,
          };

          this.props.onSetExplorerItemsConfig(props);
          this.props.setFilter({
            type: FILTER_NAMES.PREVIOUS_FILTERS,
            filterName: FILTER_NAMES.COMMON_FILTERS,
            value: commonFilters,
          });
          this.props.setFilter({
            type: FILTER_NAMES.PREVIOUS_FILTERS,
            filterName: FILTER_NAMES.PEOPLE_COMPARE_FILTERS,
            value: peopleCompareFilters,
          });
          this.props.setFilter({
            type: FILTER_NAMES.PREVIOUS_FILTERS,
            filterName: FILTER_NAMES.DATE_COMPARE_FILTER,
            value: dateCompareFilter,
          });
        });
      } else {
        commonSendEventFunction(RP_EVENT_REFRESH_REQUEST);
        const explorerItemsConfig = {
          funnelConfiguration: {
            ...funnelConfiguration,
            filter: filters,
            stepFocusingId: commonFilters.step?.ID,
          },
          funnel,
          currentStep,
          port: false,
          explorerItemsConfig: this.props.explorerItemsConfig,
          mounted: true,
        };

        onSetExplorerItemsConfig(explorerItemsConfig);
        this.props.setFilter({
          type: FILTER_NAMES.PREVIOUS_FILTERS,
          filterName: FILTER_NAMES.COMMON_FILTERS,
          value: commonFilters,
        });
        this.props.setFilter({
          type: FILTER_NAMES.PREVIOUS_FILTERS,
          filterName: FILTER_NAMES.PEOPLE_COMPARE_FILTERS,
          value: peopleCompareFilters,
        });
        this.props.setFilter({
          type: FILTER_NAMES.PREVIOUS_FILTERS,
          filterName: FILTER_NAMES.DATE_COMPARE_FILTER,
          value: dateCompareFilter,
        });
      }
    });
    this.props.setApplyButtonForceEnabled(false);
  };

  clearFilters = () => {
    const currentDateString = new Date().toISOString();

    this.clearStepFocusingFilter([FILTER_TYPE_COMPARE_STEP, FILTER_TYPE_DEFAULT_STEP]);
    this.props.setSelectedSession({ session: null });
    this.props.setSelectedCompareSession({ session: null });

    this.sendToStore({
      min: dateFormatter(currentDateString),
      max: dateFormatter(currentDateString),
    });
    this.sendToStore(
      {
        min: dateFormatter(currentDateString),
        max: dateFormatter(currentDateString),
      },
      true
    );

    this.props.clearFiltersState().then(() => this.saveFilters());
  };

  onSelectCompareFilter(item) {
    this.props.setCompareFilterStatus({ status: item || false }).then(() =>
      this.sendToStore({
        min: dateFormatter(this.props.allFilters.currentFilters.commonFilters.inputStart),
        max: dateFormatter(this.props.allFilters.currentFilters.commonFilters.inputFinish),
      })
    );
    this.props.onSetCompareModeEnabled(true);
    this.props.setApplyButtonForceEnabled(true);
  }

  onDeleteCompareFilter() {
    const currentDateString = new Date().toISOString();

    this.props.onSetCompareModeEnabled(false);
    this.props.onSetCompareFilterData({});
    this.sendToStore(
      {
        min: dateFormatter(currentDateString),
        max: dateFormatter(currentDateString),
      },
      true
    );
    this.props.setCompareFilterStatus({ status: false });
    this.props.onSetStepFocusingId('', true);
    this.clearStepFocusingFilter([FILTER_TYPE_COMPARE_STEP]);
    this.saveFilters();
  }

  onScroll = (e) => {
    this.setState({ scrollTopPosition: e.target.scrollTop });
  };

  componentDidMount() {
    document.addEventListener(FILTERS, this.getCountriesRequest, false);
    document.addEventListener(RP_EVENT_STEP_FOCUS_CHANGED, this.onStepFocusChanged, false);
    document.addEventListener(RP_EVENT_FOCUS_FRAME_CLEARED, this.onFocusFrameCleared, false);
    commonSendEventFunction(RP_EVENT_GET_DATA, { value: 'FILTERS.IDS' });
  }

  componentWillUnmount() {
    document.removeEventListener('refreshResponse', this.getCountriesRequest, false);
  }

  onFocusFrameCleared = (e) => {
    const focusedStepData =
      e.detail.filterType === FILTER_TYPE_DEFAULT_STEP
        ? this.props.stepFocused
        : this.props.compareStepFocused;
    this.props.onUpdateStepFocused({
      step: null,
      stepOpened: focusedStepData.opened, // in case it is openned keep it that way
      filterTypes: [e.detail.filterType],
    });
    this.setStepFilterState(e.detail.filterType, null);
  };

  setStepFilterState = (filterType, step) => {
    if (filterType === FILTER_TYPE_DEFAULT_STEP) {
      this.props.setFilter({
        type: FILTER_NAMES.CURRENT_FILTERS,
        filterName: FILTER_NAMES.COMMON_FILTERS,
        value: { ...this.props.allFilters.currentFilters.commonFilters, step },
      });
    } else {
      this.props.setFilter({
        type: FILTER_NAMES.CURRENT_FILTERS,
        filterName: FILTER_NAMES.PEOPLE_COMPARE_FILTERS,
        value: { ...this.props.allFilters.currentFilters.peopleCompareFilters, step },
      });
    }
  };

  onStepFocusChanged = (e) => {
    const filterType = e.detail.filterType;
    const step = e.detail.step;
    const hasFocus = e.detail.hasFocus;

    const focusedStepData =
      filterType === FILTER_TYPE_DEFAULT_STEP
        ? this.props.stepFocused
        : this.props.compareStepFocused;
    const previousStep = focusedStepData.selectedValue;

    if (hasFocus) {
      // lets clear the element
      this.props.onUpdateStepFocused({
        step: null,
        stepOpened: false, // focusedStepData.opened
        filterTypes: [filterType],
      });

      this.setStepFilterState(filterType, null);
      this.props.onSetStepFocusingId('', filterType === FILTER_TYPE_COMPARE_STEP);
    } else {
      // If there was a previously selected element for the same filter , then clear it first
      if (previousStep) {
        this.props.onUpdateStepFocused({
          step: null,
          stepOpened: false, // focusedStepData.opened
          filterTypes: [filterType],
        });

        this.setStepFilterState(filterType, null);
        this.props.onSetStepFocusingId('', filterType === FILTER_TYPE_COMPARE_STEP);
        commonSendEventFunction(RP_EVENT_STEP_FOCUS_CLEARED, { types: [filterType] });
      }

      // Then select the new element
      this.props.onUpdateStepFocused({
        step: cloneData(step),
        stepOpened: false,
        filterTypes: [filterType],
      });
      this.setStepFilterState(filterType, cloneData(step));
      this.props.onSetStepFocusingId(step.ID, filterType === FILTER_TYPE_COMPARE_STEP);
    }
  };

  clearStepFocusingFilter = (filterTypes) => {
    const ids = [];
    for (let i = 0; i < filterTypes.length; i++) {
      const filterType = filterTypes[i];
      const focusedStepData =
        filterType === FILTER_TYPE_DEFAULT_STEP
          ? this.props.stepFocused
          : this.props.compareStepFocused;
      const previousStep = focusedStepData.selectedValue;

      if (previousStep) {
        ids.push(previousStep.ID);
      }

      this.props.onUpdateStepFocused({
        step: null,
        stepOpened: false,
        filterTypes: [filterType],
      });
    }

    // It is important to send a single clearing event
    commonSendEventFunction(RP_EVENT_STEP_FOCUS_CLEARED, { types: filterTypes, ids: ids });
  };

  render() {
    const {
      funnel,
      sessions,
      funnelConfiguration,
      funnelConfiguration: { selectedCompareFilter },
      onSetStepFocusingId,
      analyticsStatus,
      compareModeEnabled,
    } = this.props;
    const { isLeadTimeActive, isFlowActive } = this.state;

    const isActiveFlowClass = this.state.isFlowActive ? styles.Active : '';
    const isActiveIconLeadTimeClass = this.state.isLeadTimeActive ? styles.Active : '';

    const { currentFilters, previousFilters } = this.props.allFilters;

    return (
      <div
        className={cls(styles.Wrapper, styles.LeftSidebar)}
        id="left-sidebar"
        onScroll={this.onScroll}
      >
        <div className={styles.LeftSidebarWrapper} id="left-sidebar-wrapper">
        <div className={styles.ShowOnCanvasBlock}>
          <div className={styles.BlockTitle}>Show on canvas</div>
          {/*todo: remove it into separate component*/}
          <div className={styles.AnalyticsControl}>
            <div
              className={`${styles.AnalyticsControlItem} ${isActiveFlowClass} ${styles.IconSplitLink}`}
            >
              <label className={`${styles.Switch}`}>
                <input
                  type="checkbox"
                  onClick={() => this.setState({ isFlowActive: !isFlowActive })}
                />
                <span className={styles.SliderRound}></span>
              </label>
              <span>{iconSplitLink}</span>
              <span className={styles.Title}>Flow</span>
            </div>
            <div
              className={`${styles.AnalyticsControlItem} ${isActiveIconLeadTimeClass} ${styles.IconLeadTime}`}
            >
              <label className={`${styles.Switch}`}>
                <input
                  type="checkbox"
                  onClick={() => this.setState({ isLeadTimeActive: !isLeadTimeActive })}
                />
                <span className={styles.SliderRound}></span>
              </label>
              <span>{iconLeadTime}</span>
              <span className={styles.Title}>Lead time</span>
            </div>
          </div>
        </div>
        <div className={styles.FilterDataBlock}>
          <div className={styles.BlockTitle}>Filter Data by</div>
          <FiltersBlock
            filtersSet={[
              FILTER_BLOCK_TYPES.DATE,
              FILTER_BLOCK_TYPES.COUNTRIES,
              FILTER_BLOCK_TYPES.DEVICE,
              FILTER_BLOCK_TYPES.STEP,
              FILTER_BLOCK_TYPES.PEOPLE,
            ]}
            type={FILTER_TYPE_DEFAULT}
            currentFilters={this.props.allFilters.currentFilters.commonFilters}
            funnel={funnel}
            sessions={sessions}
            onStepFocused={this.onStepFocused}
            funnelConfiguration={funnelConfiguration}
            onSetStepFocusingId={onSetStepFocusingId}
            onUpdateStepFocused={this.props.onUpdateStepFocused}
            setFilters={(newValue) =>
              this.props.setFilter({
                type: FILTER_NAMES.CURRENT_FILTERS,
                filterName: FILTER_NAMES.COMMON_FILTERS,
                value: { ...this.props.allFilters.currentFilters.commonFilters, ...newValue },
              })
            }
            onClearStep={() => {
              this.setStepFilterState(FILTER_TYPE_DEFAULT_STEP, null);
              return this.clearStepFocusingFilter([FILTER_TYPE_DEFAULT_STEP]);
            }}
            sendToStore={this.sendToStore}
            selectedStep={this.props.stepFocused}
            scrollTopPosition={this.state.scrollTopPosition}
          />
        </div>
        <div className={styles.FilterDataBlock}>
          <div className={styles.BlockTitle}>
            <span>Compare data by</span>
            {!compareModeEnabled && (
              <CommonDropdown
                items={[
                  <DropdownBlock isBorder key="block-1">
                    <DropdownItem
                      onClick={() =>
                        this.onSelectCompareFilter({ label: COMPARE_FILTER_LABELS.DATE })
                      }
                      label={COMPARE_FILTER_LABELS.DATE}
                      key={COMPARE_FILTER_LABELS.DATE}
                      icon={iconCalendar}
                    />
                    <DropdownItem
                      onClick={() =>
                        this.onSelectCompareFilter({ label: COMPARE_FILTER_LABELS.PEOPLE })
                      }
                      label={COMPARE_FILTER_LABELS.PEOPLE}
                      key={COMPARE_FILTER_LABELS.PEOPLE}
                      icon={iconPeople}
                    />
                  </DropdownBlock>,
                ]}
                dropdownTrigger={<DropdownTrigger />}
                contentClassName={styles.CompareDropdownContent}
              />
            )}
            {compareModeEnabled && (
              <div className={styles.CompareDropdownTrigger} onClick={this.onDeleteCompareFilter}>
                {iconRemoveFilter}
              </div>
            )}
          </div>

          {selectedCompareFilter.label === COMPARE_FILTER_LABELS.PEOPLE && (
            <FiltersBlock
              type={FILTER_TYPE_COMPARE}
              filtersSet={[
                FILTER_BLOCK_TYPES.COUNTRIES,
                FILTER_BLOCK_TYPES.DEVICE,
                FILTER_BLOCK_TYPES.STEP,
                FILTER_BLOCK_TYPES.PEOPLE,
              ]}
              currentFilters={this.props.allFilters.currentFilters.peopleCompareFilters}
              funnel={funnel}
              sessions={{ session: sessions.compareSessions, meta: sessions.compareMeta }}
              funnelConfiguration={funnelConfiguration}
              onSetStepFocusingId={(value) => onSetStepFocusingId(value, true)}
              onUpdateStepFocused={this.props.onUpdateStepFocused}
              onClearStep={() => {
                this.setStepFilterState(FILTER_TYPE_COMPARE_STEP, null);
                return this.clearStepFocusingFilter([FILTER_TYPE_COMPARE_STEP]);
              }}
              setFilters={(newValue) =>
                this.props.setFilter({
                  type: FILTER_NAMES.CURRENT_FILTERS,
                  filterName: FILTER_NAMES.PEOPLE_COMPARE_FILTERS,
                  value: {
                    ...this.props.allFilters.currentFilters.peopleCompareFilters,
                    ...newValue,
                  },
                })
              }
              sendToStore={(date) => this.sendToStore(date, true)}
              selectedStep={this.props.compareStepFocused}
              scrollTopPosition={this.state.scrollTopPosition}
            />
          )}
          {selectedCompareFilter.label === COMPARE_FILTER_LABELS.DATE && (
            <FiltersBlock
              type={FILTER_TYPE_COMPARE}
              filtersSet={[FILTER_BLOCK_TYPES.DATE]}
              currentFilters={this.props.allFilters.currentFilters.dateCompareFilter}
              funnel={funnel}
              sessions={{ session: sessions.compareSessions, meta: sessions.compareMeta }}
              funnelConfiguration={funnelConfiguration}
              onSetStepFocusingId={(value) => onSetStepFocusingId(value, true)}
              setFilters={(newValue) =>
                this.props.setFilter({
                  type: FILTER_NAMES.CURRENT_FILTERS,
                  filterName: FILTER_NAMES.DATE_COMPARE_FILTER,
                  value: {
                    ...this.props.allFilters.currentFilters.dateCompareFilter,
                    ...newValue,
                  },
                })
              }
              sendToStore={(date) => this.sendToStore(date, true)}
              scrollTopPosition={this.state.scrollTopPosition}
            />
          )}
        </div>
        <div className={styles.FilterDataBlock}>
          <div className={styles.FiltersBtns}>
            <SecondaryButton
              title="Apply filters"
              disabled={
                analyticsStatus === ANALYTICS_STATUS_LOADING ||
                (isEqual(previousFilters, currentFilters) && !this.props.applyButtonForceEnabled)
              }
              onClick={this.saveFilters}
              withBorder
            />
            <SecondaryButton
              title="Clear filters"
              disabled={
                analyticsStatus === ANALYTICS_STATUS_LOADING ||
                isEqual(previousFilters, defaultFilters)
              }
              onClick={this.clearFilters}
            />
          </div>
        </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  currentStep: selectCurrentStep(state),
  explorerItemsConfig: selectExplorerItemsConfig(state),
  funnelConfiguration: selectFunnelConfiguration(state),
  sessions: selectSessions(state),
  analyticsStatus: selectAnalyticsStatus(state),
  compareModeEnabled: selectCompareMode(state),
  stepFocused: selectStepFocused(state),
  compareStepFocused: selectCompareStepFocused(state),
  selectedSession: selectSession(state),
  selectedCompareSession: selectCompareSession(state),
  allFilters: selectFilters(state),
  applyButtonForceEnabled: selectApplyButtonEnabled(state),
});

function mapDispatchToProps(dispatch) {
  return {
    onSetExplorerItemsConfig: (params) => dispatch(onSetExplorerItemsConfig(params)),
    onSetFilterData: (newValue) => dispatch(setFilterData(newValue)),
    onSetCompareFilterData: (newValue) => dispatch(setCompareFilterData(newValue)),
    onSetDateRange: (newValue, compare) => dispatch(setDataRange(newValue, compare)),
    onSetStepFocusingId: (newValue, compare) => dispatch(setStepFocusingId(newValue, compare)),
    onSetCompareModeEnabled: (newValue) => dispatch(setCompareMode(newValue)),
    onLoadProfileCountries: (projectId, funnelConfiguration, dataObjs, dataConnections) =>
      dispatch(
        loadProfileCountriesAsync(projectId, funnelConfiguration, dataObjs, dataConnections)
      ),
    onSetStepOpened: ({ id, value, selectedStep }) =>
      dispatch(setStepFilterOpened({ id, value, selectedStep })),
    onUpdateStepFocused: ({ step, stepOpened, filterTypes }) =>
      dispatch(updateFocusedStep({ step, stepOpened, filterTypes })),
    setCompareFilterStatus: ({ status }) => dispatch(setCompareFilter({ status })),
    setSelectedCompareSession: ({ session }) => dispatch(setSelectedCompareSession({ session })),
    setSelectedSession: ({ session }) => dispatch(setSelectedSession({ session })),
    setFilter: ({ type, filterName, value }) => dispatch(setFilter({ type, filterName, value })),
    clearFiltersState: () => dispatch(clearFilterState()),
    setApplyButtonForceEnabled: (status) => dispatch(setApplyButtonEnabled(status))
  };
}

LeftSideBar.propTypes = {
  funnel: PropTypes.shape({
    projectId: PropTypes.string.isRequired,
  }),
};

export default connect(mapStateToProps, mapDispatchToProps)(LeftSideBar);
