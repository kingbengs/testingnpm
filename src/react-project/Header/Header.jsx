import React, { Component } from 'react';
import debounce from 'lodash/debounce';
import ToolsBox from '../ToolsBox/ToolsBox';
import AnalyticsBar from '../AnalyticsBar/AnalyticsBar';
import StepsModal from '../StepsModal/StepsModal';
import LeftSideBar from 'react-project/LeftSideBar/LeftSideBar';
import styles from './Header.module.scss';
import {
  iconRefreshBtn,
  iconCheckmark,
  iconAnalyticsError,
  iconAnalyticsWarning,
  iconBackBtnArrow,
  iconLogo,
  iconHelp,
} from '../assets/Icons';

import moment from 'moment';
import RequestService from '../Helpers/RequestService';
import { isAnalyticsInstalled } from '../Util/ActionsDetector';

import {
  PR_EVENT_REFRESH_RESPONSE,
  PR_EVENT_SAVE_RESPONSE,
  RP_EVENT_REFRESH_REQUEST,
  RP_EVENT_SAVE_REQUEST,
  PR_EVENT_FUNNEL_CHANGED,
  RP_EVENT_FIT_TO_SCREEN,
  PR_EVENT_ANALYTICS_NEEDS_REFRESH,
  RP_EVENT_ANALYTICS_UPDATED,
  RP_EVENT_ANALYTICS_STATUS_CHANGED,
  RP_EVENT_ZOOM_IN,
  RP_EVENT_ZOOM_RESET,
  RP_EVENT_ZOOM_OUT,
  PR_EVENT_ZOOM_LEVEL_CHANGED,
  RP_EVENT_ZOOM_VALUE_CHANGED,
  RP_EVENT_RESTORE_BUTTON_CLICKED,
} from 'shared/CSharedEvents';
import { commonSendEventFunction, goToURL, isEnterKey } from 'shared/CSharedMethods';

import { connect } from 'react-redux';
import {
  ANALYTICS_STATUS_LOADING,
  ANALYTICS_STATUS_ERROR,
  ANALYTICS_STATUS_STALE,
  ANALYTICS_STATUS_SUCCESS,
  SAVE_TYPE_AUTO,
  SAVE_TYPE_MANUAL,
} from 'shared/CSharedConstants';

import { selectFunnel, selectIsFunnelLoading } from 'react-project/redux/funnels/selectors';
import { fetchFunnelAsync, loadFunnelAsync } from 'react-project/redux/funnels/actions';
import { loadFunnelRevisionsAsync } from 'react-project/redux/funnel-revisions/actions';
import { selectAnalyticsStatus, selectCompareMode } from 'react-project/redux/analytics/selectors';
import {
  loadAnalyticsAsync,
  loadProfileCountriesAsync,
  refreshSessionsAsync,
  setAnalyticsStale,
  loadProjectApiKeyAsync,
  updateStatus,
} from 'react-project/redux/analytics/actions';
import { getWorkspaceFunnelsListUrl } from 'react-project/Util/ExternalUrlHelper';
import FullScreen from '../FullScreen/FullScreen';
import { Tooltip } from 'react-project/components/tooltip/Tooltip';
import { TEXTS_TOOLTIP } from 'react-project/Constants/texts';
import Expire from '../Helpers/Expire';
import { selectExplorerIsLoading } from 'react-project/redux/explorer/selectors';
import { ZoomDropdown } from './ZoomDropdown';
import { HeaderActionsDropdown } from './HeaderActionsDropdown';
import { VersionHistory } from '../components/versionHistory/VersionHistory';
import {
  selectFunnelRevisions,
  selectIsFunnelRevisionsLoading,
} from 'react-project/redux/funnel-revisions/selectors';
import {
  setNewFunnelConfiguration,
  setPanningActive,
} from 'react-project/redux/funnel-configuration/actions';
import { selectFunnelConfiguration } from '../redux/funnel-configuration/selectors';

const requestService = new RequestService();

const MAP_ANALYTICS_STATUS_TO_ICON = new Map([
  [ANALYTICS_STATUS_SUCCESS, iconCheckmark],
  [ANALYTICS_STATUS_ERROR, iconAnalyticsError],
  [ANALYTICS_STATUS_STALE, iconAnalyticsWarning],
]);

const AUTO_SAVE_LATENCY_TIME = 3 * 1000; // 3 secs
const IS_AUTOSAVE_DISABLED = process.env.REACT_APP_DEBUG === 'true';
const HELP_DESK_LINK = 'https://help.funnelytics.io/en/knowledge';

class Header extends Component {
  constructor(props) {
    super(props);

    this.state = {
      stepsModalOpened: false,
      menuPosition: {
        x: 680,
        y: 60,
      },
      activateSelectTool: false,
      funnelName: '',
      isFunnelSaving: false,
      isAutoSaving: false,
      isErrorSaving: false,
      isManualSaveMode: false,
      hasUnsavedChanges: false,
      showLeftSideBar: false,
      zoomValue: 100,
      draftedZoom: 100,
      zoomDropdownOpened: false,
      headerActionsDropdownOpened: false,
      versionHistoryOpened: false,
      hasWorkspaceActions: false,
    };

    this.refreshAnalytics = this.refreshAnalytics.bind(this);
    this.refreshRevisions = this.refreshRevisions.bind(this);
  }

  setActive = (type) => {
    this.setState({
      [type]: !this.state[type],
    });
  };

  setZoomDropdownOpened = (opened) => {
    this.setState({ zoomDropdownOpened: opened });
  };

  setLeftSideBarStatus(value) {
    this.setState({
      showLeftSideBar: value,
    });
  }

  onSaveClick = () => {
    this.save();
  };

  onSetIsNumbersActive = (value) => {
    this.props.setIsNumbersActive(value);
    this.setState({
      showLeftSideBar: value,
    });
  };

  onSetFullScreenStatus = () => {
    this.props.setFullScreenStatus(!this.props.isFullScreenActive);
    this.setLeftSideBarStatus(this.props.isFullScreenActive);
    this.setState({ versionHistoryOpened: false });
  };

  onSetNumbersStatus = (value) => {
    this.props.setIsNumbersActive(value);
    this.setLeftSideBarStatus(value);
    this.props.setFullScreenStatus(!value);
  };

  save = (type = SAVE_TYPE_MANUAL) => {
    if (this.state.isFunnelSaving) {
      return;
    }

    this.setState(
      {
        hasUnsavedChanges: false,
        isFunnelSaving: true,
        isAutoSaving: type === SAVE_TYPE_AUTO,
      },
      () => {
        commonSendEventFunction(RP_EVENT_SAVE_REQUEST, { value: true });
      }
    );
  };

  autoSave = () => {
    if (IS_AUTOSAVE_DISABLED || !this.state.hasUnsavedChanges) {
      return;
    }

    this.save(SAVE_TYPE_AUTO);
  };

  setSaveSuccess = () => {
    this.setState({
      isManualSaveMode: false,
      isErrorSaving: false,
    });
  };

  setSaveFail = () => {
    this.setState({
      isErrorSaving: true,
    });

    if (this.state.isAutoSaving && !this.state.isManualSaveMode) {
      this.setState(
        {
          isManualSaveMode: true,
        },
        () => {
          this.save(SAVE_TYPE_AUTO);
        }
      );
    }
  };

  autoSaveDebounced = debounce(this.autoSave, AUTO_SAVE_LATENCY_TIME);

  onAnalyticsNeedRefresh = () => {
    this.props.onSetAnalyticsStale();
  };

  onFunnelChanged = () => {
    this.setState({ hasUnsavedChanges: true }, this.autoSaveDebounced);
  };

  onRefreshAnalyticsClick = () => {
    if (this.props.isFunnelLoading || this.props.analyticsStatus === ANALYTICS_STATUS_LOADING) {
      return;
    }

    this.triggerRefreshAnalyticsEvent();
  };

  triggerRefreshAnalyticsEvent = () => {
    commonSendEventFunction(RP_EVENT_REFRESH_REQUEST, { value: true });
  };

  setHeaderActionsDropdownOpened = (opened) => {
    this.setState({ headerActionsDropdownOpened: opened });
  };

  setVersionHistoryOpened = (opened) => {
    this.setState({ versionHistoryOpened: opened });
    if (this.props.isNumbersActive) {
      this.props.setFullScreenStatus(false);
      this.setState({ showLeftSideBar: true });
    }
  };

  cleanCanvas = () => {
    commonSendEventFunction(RP_EVENT_RESTORE_BUTTON_CLICKED);
    this.refreshAnalytics([], []);
  };

  loadRequest = (params = {}, shouldBeSaved = false) => {
    this.props
      .onLoadFunnel({
        params,
        funnelId: this.props.funnelId,
        refreshAnalytics: this.refreshAnalytics,
        refreshRevisions: this.refreshRevisions,
      })
      .then(() => {
        if (shouldBeSaved) {
          this.setState({ hasUnsavedChanges: true }, this.autoSaveDebounced);
        }
      });
  };

  sendSaveResponse = (e) => {
    const objForSending = JSON.parse(e.detail.data);
    const previewForSending = JSON.parse(e.detail.preview);

    objForSending.funnelConfiguration = this.props.funnelConfiguration;

    requestService
      .saveFunnelRequest(this.props.funnelId, objForSending, previewForSending)
      .then((response) => {
        const { success } = response;

        if (success) {
          this.setSaveSuccess();
        } else {
          this.setSaveFail();
        }
      })
      .finally(() => {
        this.setState(
          {
            isFunnelSaving: false,
          },
          () => {
            this.refreshRevisions(this.props.funnelId);

            if (this.state.hasUnsavedChanges) {
              this.autoSaveDebounced();
            }
          }
        );
      });
  };

  transformCanvasEntities = ({ canvasEntities, compareCanvasEntities }) => {
    for (let key in canvasEntities) {
      canvasEntities[key].compare_to_data = compareCanvasEntities[key];
    }
    return canvasEntities;
  };

  sendRefreshResponse = (e) => {
    const objForSending = JSON.parse(e.detail.data);

    const dataObjs = objForSending.objects;
    const dataConnections = objForSending.joints;

    this.refreshAnalytics(dataObjs, dataConnections);
  };

  refreshAnalytics(dataObjs, dataConnections) {
    const projectId = this.props.funnel.projectId;
    const funnelConfiguration = this.props.funnelConfiguration;
    this.props.updateAnalyticsStatus(ANALYTICS_STATUS_LOADING);
    commonSendEventFunction(RP_EVENT_ANALYTICS_STATUS_CHANGED, {
      status: ANALYTICS_STATUS_LOADING,
    });

    if (this.props.compareModeEnabled) {
      Promise.all([
        this.props.onLoadAnalytics(projectId, funnelConfiguration, dataObjs, dataConnections, true),
        this.props.onLoadAnalytics(projectId, funnelConfiguration, dataObjs, dataConnections),
      ])
        .then(([compareCanvasEntities, canvasEntities]) => {
          const transformedCanvasEntities = this.transformCanvasEntities({
            canvasEntities,
            compareCanvasEntities,
          });
          commonSendEventFunction(RP_EVENT_ANALYTICS_UPDATED, transformedCanvasEntities);
          this.props.updateAnalyticsStatus(ANALYTICS_STATUS_SUCCESS);
          commonSendEventFunction(RP_EVENT_ANALYTICS_STATUS_CHANGED, {
            status: ANALYTICS_STATUS_SUCCESS,
          });
        })
        .catch(() => {
          commonSendEventFunction(RP_EVENT_ANALYTICS_STATUS_CHANGED, {
            status: ANALYTICS_STATUS_ERROR,
          });
          this.props.updateAnalyticsStatus(ANALYTICS_STATUS_ERROR);
          commonSendEventFunction(RP_EVENT_ANALYTICS_STATUS_CHANGED, {
            status: ANALYTICS_STATUS_ERROR,
          });
        });

      this.props.onLoadProfileCountries(
        projectId,
        funnelConfiguration,
        dataObjs,
        dataConnections,
        true
      );
      this.props.onLoadSessions(projectId, funnelConfiguration, dataObjs, dataConnections, true);
      this.props.onLoadProfileCountries(projectId, funnelConfiguration, dataObjs, dataConnections);
      this.props.onLoadSessions(projectId, funnelConfiguration, dataObjs, dataConnections);
    } else {
      this.props
        .onLoadAnalytics(projectId, funnelConfiguration, dataObjs, dataConnections)
        .then((canvasEntities) => {
          if (canvasEntities) {
            commonSendEventFunction(RP_EVENT_ANALYTICS_UPDATED, canvasEntities);
          }
          this.props.updateAnalyticsStatus(ANALYTICS_STATUS_SUCCESS);
          commonSendEventFunction(RP_EVENT_ANALYTICS_STATUS_CHANGED, {
            status: ANALYTICS_STATUS_SUCCESS,
          });
        })
        .catch(() => {
          commonSendEventFunction(RP_EVENT_ANALYTICS_STATUS_CHANGED, {
            status: ANALYTICS_STATUS_ERROR,
          });
          this.props.updateAnalyticsStatus(ANALYTICS_STATUS_ERROR);
          commonSendEventFunction(RP_EVENT_ANALYTICS_STATUS_CHANGED, {
            status: ANALYTICS_STATUS_ERROR,
          });
        });
      this.props.onLoadProfileCountries(projectId, funnelConfiguration, dataObjs, dataConnections);
      this.props.onLoadSessions(projectId, funnelConfiguration, dataObjs, dataConnections);
    }
  }

  humanizeInterval(revision) {
    const { attributes: { updated_at: date } = {} } = revision;

    if (date) {
      const diff = moment().diff(date, 'seconds');
      return `Saved ${moment.duration(diff, 'seconds').humanize()} ago`;
    } else {
      return '';
    }
  }

  refreshRevisions = (funnelId) => {
    this.props.onLoadFunnelRevisions(funnelId);
  };

  dateFormatter = (rawDate) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(rawDate));
  };

  activateSelectTool = () => {
    this.setState(
      {
        activateSelectTool: true,
      },
      () => {
        this.setState({
          activateSelectTool: false,
        });
      }
    );
  };

  openModal = (isOpen) => {
    this.setState({
      stepsModalOpened: isOpen,
    });
  };

  onFitToScreenClicked = () => {
    commonSendEventFunction(RP_EVENT_FIT_TO_SCREEN);
    this.setZoomDropdownOpened(false);
  };

  onZoomInClicked = () => {
    commonSendEventFunction(RP_EVENT_ZOOM_IN);
  };

  onZoomOutClicked = () => {
    commonSendEventFunction(RP_EVENT_ZOOM_OUT);
  };

  onZoomResetClicked = () => {
    commonSendEventFunction(RP_EVENT_ZOOM_RESET);
  };

  onBackBtnIconClick = () => {
    window.location.href = getWorkspaceFunnelsListUrl(this.props.funnel.projectId);
  };

  windowResizeCoordsRecalculationEvent = () => {
    const elem = document.querySelector('#ToolsBoxContainer');
    const rect = elem.getBoundingClientRect();
    this.setState({
      menuPosition: {
        ...this.state.menuPosition,
        x: rect.x,
      },
    });
  };

  onWheel = (e) => {
    e.preventDefault();
  };

  setCurrentZoom = (e) => {
    const updatedZoomValue = Math.round(e.detail.value * 100);
    this.setState({ zoomValue: updatedZoomValue, draftedZoom: updatedZoomValue });
  };

  handleZoomInputChange = (e) => {
    this.setState({ draftedZoom: e.target.value.replace(/[^\d]/g, '') });
  };

  handleZoomInputAccept = (e) => {
    if (isEnterKey(e.key)) {
      this.setState({ draftedZoom: this.state.zoomValue });
      this.acceptCurrentZoom();
    }
  };

  acceptCurrentZoom = () => {
    commonSendEventFunction(RP_EVENT_ZOOM_VALUE_CHANGED, { value: this.state.draftedZoom });
  };

  componentDidMount() {
    document.addEventListener(PR_EVENT_SAVE_RESPONSE, this.sendSaveResponse, false);
    document.addEventListener(PR_EVENT_REFRESH_RESPONSE, this.sendRefreshResponse, false);
    document.addEventListener(PR_EVENT_FUNNEL_CHANGED, this.onFunnelChanged, false);
    document.addEventListener(PR_EVENT_ANALYTICS_NEEDS_REFRESH, this.onAnalyticsNeedRefresh);
    document.addEventListener(PR_EVENT_ZOOM_LEVEL_CHANGED, this.setCurrentZoom);
    window.addEventListener('resize', this.windowResizeCoordsRecalculationEvent);
    window.addEventListener('wheel', this.onWheel, { passive: false });

    setTimeout(async () => {
      const result = await this.props.onFetchFunnel(this.props.funnelId);

      if (result.success) {
        const hasWorkspaceActions = await isAnalyticsInstalled(this.props.funnel.projectId);

        this.setState(
          {
            funnelName: this.props.funnel.name,
            hasWorkspaceActions,
          },
          () => {
            //TODO: refactor this - just simply use css positioning
            this.windowResizeCoordsRecalculationEvent();
          }
        );
        this.props.onLoadProjectApiKey(this.props.funnel.projectId);
      }
      this.loadRequest();
    }, 0);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.windowResizeCoordsRecalculationEvent);
    window.removeEventListener('wheel', this.onWheel);
    document.removeEventListener(PR_EVENT_ANALYTICS_NEEDS_REFRESH, this.onAnalyticsNeedRefresh);
  }

  render() {
    const { analyticsStatus, funnel } = this.props;
    const isAnalyticsLoading =
      analyticsStatus === ANALYTICS_STATUS_LOADING || this.props.explorerIsLoading;
    const isRotatedClass = isAnalyticsLoading ? styles.Rotated : '';
    const refreshButtonStatusIcon = MAP_ANALYTICS_STATUS_TO_ICON.get(analyticsStatus);

    const getAnalyticsStatusComponent = () => {
      switch (analyticsStatus) {
        case ANALYTICS_STATUS_LOADING:
          return <div className={styles.AnalyticsStatusText}>Data is loading</div>;
        case ANALYTICS_STATUS_STALE:
          return (
            <div className={styles.AnalyticsStatusText}>
              Changes have been made,&nbsp;
              <span className={styles.AnalyticsStatusBtn} onClick={this.onRefreshAnalyticsClick}>
                update canvas data
              </span>
            </div>
          );
        case ANALYTICS_STATUS_SUCCESS:
          return (
            <Expire delay={10000}>
              <div className={styles.AnalyticsStatusText}>Data successfully updated</div>
            </Expire>
          );
        default:
          return null;
      }
    };

    const positionOfModal = { x: this.state.menuPosition.x, y: this.state.menuPosition.y };

    const { funnelRevisions: { 0: funnelLastRevision = {} } = {} } = this.props;
    const statusSaveText = this.state.isErrorSaving ? (
      <div onClick={this.onSaveClick} className={styles.Error}>
        Save failed. Click here to try again
      </div>
    ) : (
      this.humanizeInterval(funnelLastRevision)
    );
    const textSavedTime = this.state.isFunnelSaving ? 'Saving...' : statusSaveText;
    const isUniversalLoaderActive =
      this.props.isFunnelLoading ||
      (analyticsStatus === ANALYTICS_STATUS_LOADING && this.props.isNumbersActive);

    return (
      <div className={styles.Wrapper} id="header">
        <div className={styles.Header}>
          {isUniversalLoaderActive && (
            <div className={styles.UniversalLoader}>
              <div className={styles.UniversalLoaderBar} />
            </div>
          )}
          <div className={styles.LeftSection}>
            <div className={styles.BackBtnIcon} onClick={this.onBackBtnIconClick}>
              {iconBackBtnArrow}
            </div>
            <div className={styles.Logo}>{iconLogo}</div>
            {this.state.funnelName && (
              <HeaderActionsDropdown
                dropdownOpened={this.state.headerActionsDropdownOpened}
                setDropdownOpened={this.setHeaderActionsDropdownOpened}
                canvasName={this.state.funnelName}
                openVersionHistory={() => {
                  this.setVersionHistoryOpened(true);
                  this.setHeaderActionsDropdownOpened(false);
                }}
              />
            )}
            <ToolsBox
              funnel={this.props.funnel}
              activateSelectTool={this.state.activateSelectTool}
              onPanningActive={(isActive) => this.props.onPanningActive(isActive)}
              openModal={(isOpen) => this.openModal(isOpen)}
              hasWorkspaceActions={this.state.hasWorkspaceActions}
            />
            {this.state.stepsModalOpened && this.props.funnel ? (
              <StepsModal
                isParentHeader={true}
                coords={positionOfModal}
                funnel={this.props.funnel}
                onCloseModal={() => {
                  this.openModal(false);
                  this.activateSelectTool();
                }}
              />
            ) : null}
            <AnalyticsBar
              isNumbersActive={this.props.isNumbersActive}
              setIsNumbersActive={this.onSetNumbersStatus}
            />
            {this.props.isNumbersActive ? (
              <>
                <Tooltip label={TEXTS_TOOLTIP.REFRESH_ANALYTICS}>
                  <div className={`${styles.RefreshBtn}`} onClick={this.onRefreshAnalyticsClick}>
                    <span className={`${isRotatedClass}`}>{iconRefreshBtn}</span>
                    {refreshButtonStatusIcon && !this.props.explorerIsLoading && (
                      <span className={`${styles.AnalyticsStatusIcon}`}>
                        {refreshButtonStatusIcon === iconCheckmark ? (
                          <Expire delay={10000}>{refreshButtonStatusIcon}</Expire>
                        ) : (
                          refreshButtonStatusIcon
                        )}
                      </span>
                    )}
                  </div>
                </Tooltip>
                {getAnalyticsStatusComponent()}
              </>
            ) : null}
          </div>
          <div className={styles.RightSection}>
            {!this.props.isFunnelRevisionsLoading && textSavedTime ? (
              <div className={styles.SavedTime}>{textSavedTime}</div>
            ) : null}
            <ZoomDropdown
              setDropdownOpened={this.setZoomDropdownOpened}
              draftedZoom={this.state.draftedZoom}
              dropdownOpened={this.state.zoomDropdownOpened}
              fitToScreenEvent={this.onFitToScreenClicked}
              handleZoomInputAccept={this.handleZoomInputAccept}
              handleZoomInputChange={this.handleZoomInputChange}
              zoomIn={this.onZoomInClicked}
              zoomOut={this.onZoomOutClicked}
              zoomReset={this.onZoomResetClicked}
              zoomValue={this.state.zoomValue}
              acceptCurrentZoom={this.acceptCurrentZoom}
            />
            <Tooltip label={TEXTS_TOOLTIP.HELP}>
              <div className={styles.RightSectionButton} onClick={() => goToURL(HELP_DESK_LINK)}>
                {iconHelp}
              </div>
            </Tooltip>
          </div>
        </div>
        {this.props.isNumbersActive ? (
          <FullScreen
            isFullScreenActive={this.props.isFullScreenActive}
            onSetFullScreenStatus={this.onSetFullScreenStatus}
          />
        ) : null}

        {this.state.showLeftSideBar && funnel ? <LeftSideBar funnel={funnel} /> : null}
        {this.state.versionHistoryOpened && funnel ? (
          <VersionHistory
            onClose={() => this.setVersionHistoryOpened(false)}
            isSidebarOpened={this.state.showLeftSideBar}
            onRestoreFunnel={(params) => {
              this.cleanCanvas();
              this.loadRequest(params, true);
            }}
            funnelId={this.props.funnelId}
          />
        ) : null}
      </div>
    );
  }
}

function mapStateToProps(state, props) {
  return {
    funnelConfiguration: selectFunnelConfiguration(state),
    funnelRevisions: selectFunnelRevisions(state),
    funnel: selectFunnel(state, props.funnelId),
    analyticsStatus: selectAnalyticsStatus(state),
    compareModeEnabled: selectCompareMode(state),
    explorerIsLoading: selectExplorerIsLoading(state),
    isFunnelLoading: selectIsFunnelLoading(state),
    isFunnelRevisionsLoading: selectIsFunnelRevisionsLoading(state),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onSetFunnelConfiguration: (newValue) => dispatch(setNewFunnelConfiguration(newValue)),
    onLoadAnalytics: (projectId, funnelConfiguration, dataObjs, dataConnections, compareMode) =>
      dispatch(
        loadAnalyticsAsync(projectId, funnelConfiguration, dataObjs, dataConnections, compareMode)
      ),
    updateAnalyticsStatus: (status) => dispatch(updateStatus(status)),
    onFetchFunnel: (funnelId) => dispatch(fetchFunnelAsync(funnelId)),
    onLoadFunnel: (params, cb) => dispatch(loadFunnelAsync(params, cb)),
    onPanningActive: (newValue) => dispatch(setPanningActive(newValue)),
    onLoadProfileCountries: (
      projectId,
      funnelConfiguration,
      dataObjs,
      dataConnections,
      compareMode
    ) =>
      dispatch(
        loadProfileCountriesAsync(
          projectId,
          funnelConfiguration,
          dataObjs,
          dataConnections,
          compareMode
        )
      ),
    onLoadSessions: (projectId, funnelConfiguration, dataObjs, dataConnections, compareMode) =>
      dispatch(
        refreshSessionsAsync(projectId, funnelConfiguration, dataObjs, dataConnections, compareMode)
      ),
    onLoadFunnelRevisions: (funnelId) => dispatch(loadFunnelRevisionsAsync(funnelId)),
    onSetAnalyticsStale: () => dispatch(setAnalyticsStale()),
    onLoadProjectApiKey: (projectId) => dispatch(loadProjectApiKeyAsync(projectId)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Header);
