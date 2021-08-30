import React, { Component } from 'react';
import onClickOutside from 'react-onclickoutside';
import cls from 'classnames';
import styles from './StepsModal.module.scss';
import {
  iconActions,
  iconMisk,
  iconPage,
  iconSearch,
  iconSmallLogo,
  iconTraffic,
} from 'react-project/assets/Icons';
import { connect } from 'react-redux';
import { EElementCategories, EElementTypes, EExplorerConfigTypes } from 'shared/CSharedCategories';
import { ActionTypes, ANALYTICS_STATUS_LOADING, IconsConfig } from 'shared/CSharedConstants';
import { RP_EVENT_CREATE_OBJECT } from 'shared/CSharedEvents';
import { commonSendEventFunction } from 'shared/CSharedMethods';
import { AttributesList } from 'react-project/AttributeExplorer/AttributesList';

import { When } from 'react-project/Util/When';
import { buildGeneralTrafficStep } from 'react-project/Util/StepBuilder';
import { EStepConnectionPort } from 'shared/CSharedCategories';
import SharedElementHelpers from 'shared/SharedElementHelpers';
import { Loader } from '../components/loader/Loader';
import { NoDataBlock } from '../components/noDataBlock/NoDataBlock';
import {
  selectCurrentStep,
} from 'react-project/redux/current-step/selectors';
import {
  selectExplorerIsLoading,
  selectExplorerItemsConfig,
  selectExplorerPageNumber
} from 'react-project/redux/explorer/selectors';
import { TEXT_LOAD_MORE } from 'react-project/Constants/texts';
import { DropdownExplorer } from '../components/dropdown/DropdownExplorer';
import {
  COMMERCE_ACTION_NAME,
  commerceAction,
  isCommerceAction
} from 'react-project/Constants/commerceAction';
import { RefreshButton } from "react-project/components/refreshButton/RefreshButton";
import { IconList } from "react-project/components/iconList/IconList";
import { selectAnalyticsStatus } from "react-project/redux/analytics/selectors";
import {ViewportAllower} from "react-project/components/viewportAllower/ViewportAllower";
import {
  DEFAULT_HITS,
  DEFAULT_URL,
  getExplorerPageParametersAsync,
  onSetExplorerItemsConfig, onSetExplorerItemsConfigLoadMore,
  onSetExplorerPageNumber,
  setExplorerLoadingStatus
} from 'react-project/redux/explorer/actions';
import { selectFunnelConfiguration } from "../redux/funnel-configuration/selectors";
import { setNewCurrentStepLabel } from "../redux/current-step/actions";
import { numSeparator } from 'shared/NumberHelpers';

const MODAL_SIZE = {
  width : 400,
  height: 452,
};

const MAIN_TABS = {
  MAP: 'MAP',
  EXPLORER: 'EXPLORER',
};

const MAP_TABS = {
  PAGE: EElementTypes.PAGE,
  EVENT: EElementTypes.EVENT,
  SOURCE: EElementTypes.SOURCE,
  MISC: EElementTypes.MISC,
};

const EXPLORER_TABS = {
  PAGE: EElementTypes.PAGE,
  EVENT: EElementTypes.EVENT,
  SOURCE: EElementTypes.SOURCE,
};

const EXPLORER_ITEMS = {
  PREVIOUS_PAGES_ITEMS: [
    { name: 'Previous pages', type: EExplorerConfigTypes.PAGE },
    { name: 'All previous pages', type: EExplorerConfigTypes.PAGE_ALL },
  ],
  PREVIOUS_ACTIONS_ITEMS: [
    { name: 'All previous actions', type: EExplorerConfigTypes.EVENT_ALL },
  ],
  NEXT_PAGES_ITEMS: [
    { name: 'Next pages', type: EExplorerConfigTypes.PAGE },
    { name: 'All next pages', type: EExplorerConfigTypes.PAGE_ALL },
  ],
  NEXT_ACTIONS_ITEMS: [
    { name: 'Next actions', type: EExplorerConfigTypes.EVENT },
    { name: 'All next actions', type: EExplorerConfigTypes.EVENT_ALL },
  ]
};

const OFFSET_X = 8;
const VIEWPORT_OFFSET = 200;
const CONNECTION_OFFSET = 165;
const UNDER_HEADER_OFFSET = 30;

// This is necessary in order to display the correct header in the explorer's tab (for example,
// for the Action (EVENT) element in the explorer the tab "Actions" should contain only
// "All next actions", but for the Page (PAGE) should also have the "Next actions" and "All next actions")
const EXPLORER_TAB_TO_ITEMS = {
  PAGE: { // currentStep type
    PAGE: { // explorer tab type
      [EStepConnectionPort.IN]: EXPLORER_ITEMS.PREVIOUS_PAGES_ITEMS[0],
      [EStepConnectionPort.OUT]: EXPLORER_ITEMS.NEXT_PAGES_ITEMS[0],
    },
    EVENT: { // explorer tab type
      [EStepConnectionPort.IN]: EXPLORER_ITEMS.PREVIOUS_ACTIONS_ITEMS[0],
      [EStepConnectionPort.OUT]: EXPLORER_ITEMS.NEXT_ACTIONS_ITEMS[0],
    },
  },
  EVENT: {
    PAGE: {
      [EStepConnectionPort.IN]: EXPLORER_ITEMS.PREVIOUS_PAGES_ITEMS[0],
      [EStepConnectionPort.OUT]: EXPLORER_ITEMS.NEXT_PAGES_ITEMS[0],
    },
    EVENT: {
      [EStepConnectionPort.IN]: EXPLORER_ITEMS.PREVIOUS_ACTIONS_ITEMS[0],
      [EStepConnectionPort.OUT]: EXPLORER_ITEMS.NEXT_ACTIONS_ITEMS[1],
    },
  },
  SOURCE: {
    PAGE: {
      [EStepConnectionPort.OUT]: EXPLORER_ITEMS.NEXT_PAGES_ITEMS[0],
    },
    EVENT: {
      [EStepConnectionPort.OUT]: EXPLORER_ITEMS.NEXT_ACTIONS_ITEMS[1],
    },
  }
};

const DEFAULT_ITEMS_CONFIG = {
  [EExplorerConfigTypes.PAGE]: [
    {
      url: DEFAULT_URL,
      value: DEFAULT_HITS,
    },
  ],
  [EExplorerConfigTypes.EVENT]: [
    {
      url: DEFAULT_URL,
      value: DEFAULT_HITS,
    },
  ],
  [EExplorerConfigTypes.SOURCE]: [
    {
      url: DEFAULT_URL,
      hits: DEFAULT_HITS,
    },
  ],
  [EExplorerConfigTypes.PAGE_ALL]: [
    {
      url: DEFAULT_URL,
      value: DEFAULT_HITS,
    },
  ],
  [EExplorerConfigTypes.EVENT_ALL]: [
    {
      url: DEFAULT_URL,
      value: DEFAULT_HITS,
    },
  ],
  has_more_actions: false,
  has_more_pages: false,
  has_more_actions_all: false,
  has_more_pages_all: false,
};

class StepsModal extends Component {

    constructor(props) {
      super(props);
      const coords = props.coords ? {x: props.coords.x, y: props.coords.y} : {x: 0, y: 0};
      const port = props.port || false;

      this.textSearchInput = React.createRef();

      this.state = {
        position: coords,
        isParentHeader: props.isParentHeader || false,
        port: port,
        isDisabledMapTab: false,
        activeMainTab: MAIN_TABS.MAP,
        activeMapTab: MAP_TABS.PAGE,
        activeExplorerTab: EXPLORER_TABS.PAGE,
        explorerDropdownActiveItem: props.port && EXPLORER_TAB_TO_ITEMS.PAGE.PAGE[props.port],
        textSearch: '',
        isLoadingPageParameters : false,
      };
    }

    category = EElementCategories.STEP;

    onDragend = (clientX, clientY, step) => {
      const { src, title, type, url, filterData, utmData, hits, actionType } = step;
        this.props.onSetNewCurrentStepLabel(title);
        const objectData = {
          type,
          src,
          label: title,
          category: this.category,
          actionType: actionType || ActionTypes.NONE,
        };

        if (url) {
            objectData.url = url;
        }

        if (filterData) {
            objectData.filterData = filterData;
        }

        if (utmData) {
            objectData.utmData = utmData;
        }

      if (typeof hits !== 'undefined') {
          objectData.value = hits;
      }

        if(!this.state.port) {
            commonSendEventFunction(RP_EVENT_CREATE_OBJECT, {
                position: {x: clientX, y: clientY},
                object: objectData,
            });
        }else {
            commonSendEventFunction(RP_EVENT_CREATE_OBJECT, {
              position: { x: clientX, y: clientY },
              sourceId: this.props.currentStep.stepId,
              port: this.state.port,
              object: objectData
            });
        }
        this.props.onCloseModal();
    }

    focusTextSearch = () => {
      this.textSearchInput.current.focus();
    }

    activeTab = (type) => {
        this.setState({
            activeMapTab: type,
            isDisabledMapTab : false
        })

        this.focusTextSearch();
    }

    activeExplorerTab = (type) => {
        this.setState({
            activeExplorerTab: type,
            explorerDropdownActiveItem: EXPLORER_TAB_TO_ITEMS[this.props.currentStep.object.type]
              && EXPLORER_TAB_TO_ITEMS[this.props.currentStep.object.type][type]
              ? EXPLORER_TAB_TO_ITEMS[this.props.currentStep.object.type][type][this.props.port]
              : this.state.explorerDropdownActiveItem
        }, () => {
          this.getExplorerData();
        });
    }

    activeMainTab = (type) => {
        this.setState({
            activeMainTab: type
        })
    }

    getExplorerData = () => {
        const props = {
            funnelConfiguration: this.props.funnelConfiguration,
            currentStep: this.props.currentStep,
            port: this.state.port,
            mounted: this.mounted,
            onLoadMore: false,
            explorerItemsConfig: this.props.explorerItemsConfig,
            funnel: this.props.funnel,
            pageNumber: this.props.explorerPageNumber || 1
        }
        this.props.onSetExplorerItemsConfig(props);
    }

    onLoadMore = (type) => {
        if (type === EXPLORER_TABS.SOURCE || this.props.explorerIsLoading) {
            return;
        }

        // TODO: Rework this, should depend on the current explorer tab and the selected item in the dropdown
        if (this.props.explorerItemsConfig.has_more_actions
          || this.props.explorerItemsConfig.has_more_pages
          || this.props.explorerItemsConfig.has_more_actions_all
          || this.props.explorerItemsConfig.has_more_pages_all
        ) {
            this.props.updateExplorerStatus(true);
            let pageNumber = this.props.explorerPageNumber || 1;
            this.props.onSetExplorerPageNumber(++pageNumber);
        }
    }

    setTextSearch = (value) => {
      this.setState({
        isDisabledMapTab : !!value
      });
      this.setState({textSearch : value})
    }

    onSearchChange = (e) => {
      this.setTextSearch(e.target.value);
    }

    componentDidMount() {
        this.mounted = true;

        let container = document.getElementById('main_modal_tabs');
        container.addEventListener('wheel', this.onWheel);
        if (
          this.props.explorerItemsConfig &&
          this.props.explorerItemsConfig[EExplorerConfigTypes.PAGE] &&
          this.props.explorerItemsConfig[EExplorerConfigTypes.PAGE].length === 1
        ) {
          this.getExplorerData();
        }

        if (this.props.hasWorkspaceActions){
          this.activeMainTab(MAIN_TABS.EXPLORER);
        }
    }

    componentDidUpdate(prevProps) {
      if(this.props.explorerPageNumber !== prevProps.explorerPageNumber){
        this.getExplorerData();
      }
    }

    componentWillUnmount() {
        this.mounted = false;
        this.props.onSetExplorerPageNumber(1);
        this.props.onSetExplorerItemsConfigLoadMore(DEFAULT_ITEMS_CONFIG);
    }

    handleClickOutside = () => {
        this.props.onCloseModal();
    }

    isExploreTrafficEnabled = () => {
        const port = this.props.port;
        const currentStep = this.props.currentStep;

        if (!port || !currentStep || SharedElementHelpers.IsMisc(currentStep.object)) {
            return true;
        }

        return port !== EStepConnectionPort.OUT;
    }

    onWheel = (e) => {
      e.stopPropagation();
    }
    getExplorerPageParameters = (limit) => {

      this.setState({isLoadingPageParameters : true});
  
      this.props.onGetExplorerPageParameters(
        this.props.funnel.projectId,
        this.props.funnelConfiguration,
        limit
      ).then(() =>  this.setState({isLoadingPageParameters : false}));
    };
    //TODO: split into separate components
    render() {
        const {activeMapTab, isDisabledMapTab, activeMainTab, activeExplorerTab} = this.state;
        const onIconClick = (step) => {
            if(!!this.state.port) {
                this.onDragend(
                  this.state.position.x + OFFSET_X,
                  this.state.position.y + CONNECTION_OFFSET,
                  step
                );
            } else {
              const positionYOffset = this.state.position.y + UNDER_HEADER_OFFSET;
              const positionY = this.state.isParentHeader ? positionYOffset : this.state.position.y;
                this.onDragend(
                  this.state.position.x,
                  positionY,
                  step
                );
            }
        };

      const trafficAttributeClick = (attributeKey, attributeValue) => {
          const trafficStep = buildGeneralTrafficStep(attributeKey, attributeValue);
          onIconClick(trafficStep);
      };

      const onSelectDropdownExplorerItem = (item) => {
        this.setState({ explorerDropdownActiveItem: item }, () => {
          this.getExplorerData();
        })
      }

      const renderHeaderTitle = (param) => {
        switch(param) {
          case EXPLORER_TABS.PAGE:
            return (
              <div>
                <DropdownExplorer
                  items={this.props.port === EStepConnectionPort.IN ? EXPLORER_ITEMS.PREVIOUS_PAGES_ITEMS : EXPLORER_ITEMS.NEXT_PAGES_ITEMS}
                  onSelectItem={onSelectDropdownExplorerItem}
                  activeItem={this.state.explorerDropdownActiveItem}
                />
              </div>
            );
          case EXPLORER_TABS.EVENT:
            return (this.props.port === EStepConnectionPort.IN
              ? 'All previous actions'
              : SharedElementHelpers.IsPage(this.props.currentStep.object) ? (
                <div>
                  <DropdownExplorer
                    items={EXPLORER_ITEMS.NEXT_ACTIONS_ITEMS}
                    onSelectItem={onSelectDropdownExplorerItem}
                    activeItem={this.state.explorerDropdownActiveItem}
                  />
                </div>
              ) : 'All next actions'
            );
          case EXPLORER_TABS.SOURCE:
            return 'All traffic sources';
        }
      }
        const renderExplorerTab = (type) => {
            if (this.state.activeExplorerTab === EXPLORER_TABS.SOURCE) {
              const sourceItemsConfig = this.props.explorerItemsConfig[type];
              const commonAttributes = (sourceItemsConfig && sourceItemsConfig.commonParameters) || [];
              const customAttributes = (sourceItemsConfig && sourceItemsConfig.customParameters) || [];

              return (
                <div className={styles.StepsContainer}>
                    <div className={styles.ExplorerSectionHeader}>
                        <span className={styles.StepsTitle}>Common Parameters:</span>
                    </div>
                    <When condition={commonAttributes.length > 0}>
                        <AttributesList
                          attributes={commonAttributes}
                          onSelect={trafficAttributeClick}
                          onLoadMore={this.getExplorerPageParameters}
                          isLoadingPageParameters={this.state.isLoadingPageParameters}
                         />
                    </When>
                    <When condition={!commonAttributes.length}>
                        <div className={styles.NoAttributesMessage}>
                            No common attributes to explorer
                        </div>
                    </When>
                    <div className={styles.ExplorerSectionHeader}>
                        <span className={styles.StepsTitle}>Custom Parameters:</span>
                    </div>
                    <When condition={customAttributes.length > 0}>
                        <AttributesList
                          attributes={customAttributes}
                          onSelect={trafficAttributeClick}
                          onLoadMore={this.getExplorerPageParameters}
                          isLoadingPageParameters={this.state.isLoadingPageParameters}
                          />
                    </When>
                    <When condition={!customAttributes.length}>
                        <div className={styles.NoAttributesMessage}>
                            No custom attributes to explorer
                        </div>
                    </When>
                </div>
              );
            }

            const configType =
              this.props.port &&
              ((type === EXPLORER_TABS.PAGE)
                || (type === EXPLORER_TABS.EVENT)
                || (type === EXPLORER_TABS.SOURCE))
                ? this.state.explorerDropdownActiveItem.type: type;

            const getIconPath = (name, type) => {
              switch(type) {
                case EElementTypes.PAGE:
                  const pageIcon = IconsConfig[EElementTypes.PAGE].find((icon) => icon.name === 'Generic Page');
                  const pageIconSrc = `${pageIcon.srcPixi}${pageIcon.name.split(' ').join('').toLowerCase()}.png`;
                  return pageIconSrc;

                case EElementTypes.EVENT:
                  if (name === COMMERCE_ACTION_NAME) {
                    const actionIcon = IconsConfig.SPECIAL_EVENT.find((icon) => icon.name === commerceAction[name]);
                    const actionIconSrc = `${actionIcon.srcPixi}${actionIcon.name.toLowerCase()}.png`;

                    return actionIconSrc;
                  }
                  const actionIcon = IconsConfig[EElementTypes.EVENT].find((icon) => icon.name === 'Click');
                  const actionIconSrc = `${actionIcon.srcPixi}${actionIcon.name.toLowerCase()}.png`;

                  return actionIconSrc;
              }
            }

            const items = this.props.explorerItemsConfig[configType].map((item, i) => {
            return (<div className={styles.StepsItem} key={(item.name || item.url) + i}
                         onClick={() => {

                           const pageIcon = IconsConfig[EElementTypes.PAGE].find((icon) => icon.name === 'Generic Page');
                           const pageIconSrc = `${pageIcon.srcPixi}${pageIcon.name.split(' ').join('').toLowerCase()}.png`;
                           const actionIcon = IconsConfig[EElementTypes.EVENT].find((icon) => icon.name === 'Click');
                           const actionIconSrc = `${actionIcon.srcPixi}${actionIcon.name.toLowerCase()}.png`;

                           const iconPath =
                             type === EXPLORER_TABS.PAGE
                               ? pageIconSrc.substring(7, pageIconSrc.length)
                               : actionIconSrc.substring(7, actionIconSrc.length);

                           if (this.state.position.x === 60) {
                             this.onDragend(100, 250, {
                               src: getIconPath(item.name, type),
                               title: commerceAction[item.name] || item.name || item.url,
                               type,
                               url: item.url,
                               actionType: isCommerceAction(item.name) ? ActionTypes.COMMERCE : ActionTypes.NONE
                             });
                           } else {
                             onIconClick({
                               src: getIconPath(item.name, type),
                               title: commerceAction[item.name] || item.name || item.url,
                               type,
                               url: item.url,
                               hits: item.hits,
                               actionType: isCommerceAction(item.name) ? ActionTypes.COMMERCE : ActionTypes.NONE
                             });
                           }
                         }
                         }>
              <div className={styles.StepsUrl}>
                {commerceAction[item.name] && iconSmallLogo}
                {commerceAction[item.name] || item.name || item.url}
              </div>
              <div>{item.hasOwnProperty("hits") ? numSeparator(item.hits) : null}</div>
            </div>)
          });

          const {explorerItemsConfig = {}} = this.props;
          const configTypeToHasMore = {
            [EXPLORER_TABS.EVENT]: explorerItemsConfig.has_more_actions,
            [EExplorerConfigTypes.EVENT_ALL]: explorerItemsConfig.has_more_actions_all,
            [EXPLORER_TABS.PAGE]: explorerItemsConfig.has_more_pages,
            [EExplorerConfigTypes.PAGE_ALL]: explorerItemsConfig.has_more_pages_all,
          };

          const isHasMore = configTypeToHasMore[configType];
          const elementBottom = this.props.explorerIsLoading ? <Loader variant="grey-font-1" /> : TEXT_LOAD_MORE;

          return (
            <div className={styles.StepsContainer}>
              {items}
              {items.length ? <div className={styles.LoadMore} onClick={() => this.onLoadMore(type)}>
                    {isHasMore ? elementBottom : null}
              </div> : <NoDataBlock text="No data available"/>}
            </div>
          );
        }

        const renderMainTab = (type) => {
            if (type === MAIN_TABS.MAP) {
                return (
                    <div id="main_modal_tabs">
                        <div className={styles.SearchSection}>
                            {iconSearch}
                            <input placeholder="Search"
                                   autoFocus={true}
                                   ref={this.textSearchInput}
                                   maxLength="512"
                                   className={styles.Search}
                                   value={this.state.textSearch}
                                   onChange={this.onSearchChange}
                                   type="text"/>
                        </div>
                        <div className={styles.TopSectionIcon}>
                            <button
                              className={cls(styles.Chip, {[styles.Active]: !isDisabledMapTab && activeMapTab === MAP_TABS.PAGE})}
                              onClick={() => this.activeTab(MAP_TABS.PAGE)}>
                                <span className={styles.ChipIcon}>{iconPage}</span>
                                <span className={styles.ChipText}>Pages</span>
                            </button>

                            <button
                              className={cls(styles.Chip, {[styles.Active]: !isDisabledMapTab &&  activeMapTab === MAP_TABS.EVENT})}
                              onClick={() => this.activeTab(MAP_TABS.EVENT)}>
                                <span className={styles.ChipIcon}>{iconActions}</span>
                                <span className={styles.ChipText}>Actions</span>
                            </button>
                            <button
                              className={cls(styles.Chip, {[styles.Active]: !isDisabledMapTab &&  activeMapTab === MAP_TABS.SOURCE})}
                              onClick={() => this.activeTab(MAP_TABS.SOURCE)}>
                                <span className={styles.ChipIcon}>{iconTraffic}</span>
                                <span className={styles.ChipText}>Sources</span>
                            </button>
                            <button
                              className={cls(styles.Chip, {[styles.Active]: !isDisabledMapTab && activeMapTab === MAP_TABS.MISC})}
                              onClick={() => this.activeTab(MAP_TABS.MISC)}
                            >
                                <span className={styles.ChipIcon}>{iconMisk}</span>
                                <span className={styles.ChipText}>Offline</span>
                            </button>
                        </div>
                        <IconList
                          textSearch={this.state.textSearch}
                          type={activeMapTab}
                          colls={5}
                          onIconClick={onIconClick}
                          onDragEnd={this.onDragend}
                          isDisabledMapTab={isDisabledMapTab}
                          withSpecialItems
                        />
                        <button className={styles.CustomIconsButton}>
                            Manage Custom Icons
                        </button>
                    </div>
                )
            } else if (type === 'EXPLORER') {
                const isPageTab = activeExplorerTab === EXPLORER_TABS.PAGE;
                const isSourceTab = activeExplorerTab === EXPLORER_TABS.SOURCE;
                const isEventTab = activeExplorerTab === EXPLORER_TABS.EVENT;
                const isTrafficTabEnabled = this.isExploreTrafficEnabled();

                return (
                    <div className={styles.ExplorerSection}>
                        <div className={styles.TopSectionIcon}>
                            <button
                              className={cls(styles.Chip, {[styles.Active]: isPageTab})}
                              onClick={() => this.activeExplorerTab(EXPLORER_TABS.PAGE)}
                            >
                                <span className={styles.ChipIcon}>{iconPage}</span>
                                <span className={styles.ChipText}>Pages</span>
                            </button>
                            <button className={cls(styles.Chip, { [styles.Active]: isEventTab})}
                                    onClick={() => this.activeExplorerTab(EXPLORER_TABS.EVENT)}>
                                <span className={styles.ChipIcon}>{iconActions}</span>
                                <span className={styles.ChipText}>Actions</span>
                            </button>
                            <When condition={isTrafficTabEnabled}>
                                <button
                                  className={cls(styles.Chip, { [styles.Active]: isSourceTab})}
                                  onClick={() => this.activeExplorerTab(EXPLORER_TABS.SOURCE)}>
                                    <span className={styles.ChipIcon}>{iconTraffic}</span>
                                    <span className={styles.ChipText}>Traffic</span>
                                </button>
                            </When>
                        </div>
                        <div className={styles.ExplorerSectionHeader}>
                            <div className={styles.StepsTitle}>
                                {!this.props.port ? (
                                  <span>{ isSourceTab ? 'Traffic sources' : 'All Steps' }</span>
                                ) : (
                                  renderHeaderTitle(activeExplorerTab)
                                )}
                            </div>
                            <div>
                              <RefreshButton
                                analyticsStatus={this.props.analyticsStatus}
                                loading={this.props.analyticsStatus === ANALYTICS_STATUS_LOADING}
                                onClick={this.getExplorerData}
                              />
                            </div>
                        </div>
                        {renderExplorerTab(activeExplorerTab)}
                    </div>
                )
            }
        }
        
        return (
          <ViewportAllower
          startX={this.state.position.x + VIEWPORT_OFFSET}
          startY={this.state.position.y}
          className={styles.Modal}
          widthEl={MODAL_SIZE.width}
          heightEl={MODAL_SIZE.height}
            >
                <div className={styles.PageIconsTabs}>
                    <button
                      className={cls(styles.PageIconTab,{ [styles.Active]: activeMainTab === MAIN_TABS.MAP })}
                      onClick={() => this.activeMainTab(MAIN_TABS.MAP)}>
                        Map Icons
                    </button>
                    <button
                      className={cls(styles.PageIconTab, { [styles.Active]: activeMainTab === MAIN_TABS.EXPLORER})}
                      onClick={() => this.activeMainTab(MAIN_TABS.EXPLORER)}>
                      Explorer
                    </button>
                </div>
                {renderMainTab(activeMainTab)}
            </ViewportAllower>
        );
    }
}

function mapStateToProps(state) {
  return {
    currentStep: selectCurrentStep(state),
    funnelConfiguration: selectFunnelConfiguration(state),
    explorerIsLoading: selectExplorerIsLoading(state),
    explorerItemsConfig: selectExplorerItemsConfig(state),
    explorerPageNumber: selectExplorerPageNumber(state),
    analyticsStatus: selectAnalyticsStatus(state),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onSetNewCurrentStepLabel: (params) => dispatch(setNewCurrentStepLabel(params)),
    onSetExplorerItemsConfig: (params) => dispatch(onSetExplorerItemsConfig(params)),
    onSetExplorerPageNumber: (params) => onSetExplorerPageNumber(dispatch, params),
    onSetExplorerItemsConfigLoadMore: (params) =>
      onSetExplorerItemsConfigLoadMore(dispatch, params),
    updateExplorerStatus: (params) => dispatch(setExplorerLoadingStatus(params)),
    onGetExplorerPageParameters: (projectId, funnelConfiguration, limit) =>
      dispatch(getExplorerPageParametersAsync(projectId, funnelConfiguration, limit)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(onClickOutside(StepsModal));
