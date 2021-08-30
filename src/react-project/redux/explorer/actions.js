import { createAction } from 'redux-actions';
import RequestService from 'react-project/Helpers/RequestService';
import { EStepConnectionPort } from 'shared/CSharedCategories';
import { ANALYTICS_STATUS_ERROR } from 'shared/CSharedConstants';
import { ActionNames } from 'react-project/redux/actionNamesConstant';

export const setExplorerPageParameters = createAction(ActionNames.setExplorerPageParameters);
export const setExplorerItemsConfig = createAction(ActionNames.setExplorerItemsConfig);
export const setExplorerPageNumber = createAction(ActionNames.setExplorerPageNumber);
export const setExplorerLoadingStatus = createAction(ActionNames.setExplorerLoadingStatus);

export const DEFAULT_URL = '------';
export const DEFAULT_HITS = '--';

const requestService = new RequestService();

export function getExplorerPageParametersAsync(projectId, funnelConfiguration, limit) {
  return async (dispatch) => {
    const responseData = await requestService.getExplorerPageParameters(
      projectId,
      funnelConfiguration,
      limit
    );

    dispatch(setExplorerPageParameters(responseData));
  };
}

const isConnectionPortIn = (port) => port === EStepConnectionPort.IN;
const isFirstPage = (page) => page === 1;

export const onSetExplorerItemsConfig = (props) => {
  return async (dispatch) => {
    const {
      port,
      funnel,
      pageNumber,
      funnelConfiguration,
      currentStep,
      explorerItemsConfig,
      mounted,
    } = props;
    dispatch(setExplorerLoadingStatus(true));

    let dataTransformationPromise, newExplorerItemsConfig;
    if (!port) {
      dataTransformationPromise = requestService.getExplorerWithoutFiltersRequest(
        funnel.projectId,
        pageNumber,
        funnelConfiguration
      );
    } else {
      dataTransformationPromise = requestService.getExplorerNextPrevSteps(
        funnel.projectId,
        port,
        currentStep,
        funnelConfiguration,
        pageNumber
      );
    }
    dataTransformationPromise
      .then((responseData) => {
        if (!mounted) {
          return;
        }

        const cachedConfig = isFirstPage(pageNumber)
          ? {PAGE: [], EVENT: [], PAGE_ALL: [], EVENT_ALL: []}
          : explorerItemsConfig;

        if (responseData) {
          newExplorerItemsConfig = {
            ...explorerItemsConfig,
            PAGE: isConnectionPortIn(port)
              ? [...cachedConfig['PAGE'], ...responseData.previous_pages.list]
              : [...cachedConfig['PAGE'], ...responseData.next_pages.list],
            PAGE_ALL: isConnectionPortIn(port)
              ? [...cachedConfig['PAGE_ALL'], ...responseData.previous_pages_all.list]
              : [...cachedConfig['PAGE_ALL'], ...responseData.next_pages_all.list],
            EVENT_ALL: isConnectionPortIn(port)
              ? [...cachedConfig['EVENT_ALL'], ...responseData.previous_actions_all.list]
              : [...cachedConfig['EVENT_ALL'], ...responseData.next_actions_all.list],
            EVENT: isConnectionPortIn(port)
              ? [...cachedConfig['EVENT'], ...responseData.previous_actions_all.list]
              : [...cachedConfig['EVENT'], ...responseData.next_actions.list],
            SOURCE: {
              commonParameters: port
                ? responseData.page_parameters_all.common_parameters
                : responseData.page_parameters.common_parameters,
              customParameters: port
                ? responseData.page_parameters_all.custom_parameters
                : responseData.page_parameters.custom_parameters,
            },
            has_more_actions: isConnectionPortIn(port)
              ? responseData.previous_actions_all.has_more
              : responseData.next_actions.has_more,
            has_more_pages: isConnectionPortIn(port)
              ? responseData.previous_pages.has_more
              : responseData.next_pages.has_more,
            has_more_actions_all: isConnectionPortIn(port)
              ? responseData.previous_actions_all.has_more
              : responseData.next_actions_all.has_more,
            has_more_pages_all: isConnectionPortIn(port)
              ? responseData.previous_pages_all.has_more
              : responseData.next_pages_all.has_more,
          };
        } else {
          newExplorerItemsConfig = {
            ...explorerItemsConfig,
          };
        }
        dispatch(setExplorerItemsConfig(newExplorerItemsConfig));

        dispatch(setExplorerLoadingStatus(false));

      })
      .catch(() => {
        dispatch(setExplorerLoadingStatus(ANALYTICS_STATUS_ERROR));
      });
  };
};

export const onSetExplorerPageNumber = (dispatch, newValue) => {
  dispatch(setExplorerPageNumber(newValue));
};

export const onSetExplorerItemsConfigLoadMore = (dispatch, newValue) => {
  dispatch(setExplorerItemsConfig(newValue));

  dispatch(setExplorerLoadingStatus(false));
};
