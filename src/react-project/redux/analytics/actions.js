import { createAction } from 'redux-actions';
import RequestService from 'react-project/Helpers/RequestService';

import { ANALYTICS_STATUS_STALE } from "shared/CSharedConstants";
import { ActionNames } from "react-project/redux/actionNamesConstant";

export const updateStatus = createAction(ActionNames.updateStatus);
export const updateProfileCountries = createAction(ActionNames.updateProfileCountries);
export const refreshSessions = createAction(ActionNames.refreshSessions);
export const refreshCompareSessions = createAction(ActionNames.refreshCompareSessions);
export const insertSessions = createAction(ActionNames.insertSessions);
export const insertCompareSessions = createAction(ActionNames.insertCompareSessions);
export const updateSessionsLoadingStatus = createAction(ActionNames.updateSessionsLoadingStatus);
export const setProjectApiKey = createAction(ActionNames.setProjectApiKey);
export const setCompareMode = createAction(ActionNames.setCompareMode);
export const setSelectedSession = createAction(ActionNames.setSelectedSession);
export const setSelectedCompareSession = createAction(ActionNames.setSelectedCompareSession);

const requestService = new RequestService();

export function loadAnalyticsAsync(projectId, funnelConfiguration, dataObjs, dataConnections, compareMode) {
  return async dispatch => {
    await requestService.dataTransformation(funnelConfiguration, dataObjs, dataConnections, compareMode);
    const { data } = await requestService.loadAnalyticsRequest(projectId, compareMode);

    if (data) {
      return data.canvas_entities;
    }
  };
}

export function loadProfileCountriesAsync(projectId, funnelConfiguration, dataObjs, dataConnections, compareMode) {
  return async dispatch => {
    await requestService.dataTransformation(funnelConfiguration, dataObjs, dataConnections, compareMode);
    const countries = await requestService.getCountriesRequest(projectId, compareMode);

    dispatch(updateProfileCountries(countries));
    return countries;
  };
}

export function refreshSessionsAsync(projectId, funnelConfiguration, dataObjs, dataConnections, compareMode) {
  return async dispatch => {
    dispatch(updateSessionsLoadingStatus(true));

    await requestService.dataTransformation(funnelConfiguration, dataObjs, dataConnections, compareMode);

    const response = await requestService.getSessionsRequest(projectId, compareMode);

    dispatch(updateSessionsLoadingStatus(false));

    if (!response.success) {
      return;
    }

    if(compareMode) {
      dispatch(refreshCompareSessions(response.data));
    } else {
      dispatch(refreshSessions(response.data));
    }
    return response;
  };
}

export function loadMoreSessionsAsync(projectId, last, isCompare) {
  return async dispatch => {
    dispatch(updateSessionsLoadingStatus(true));

    const response = await requestService.getSessionsRequest(projectId, isCompare, last);

    dispatch(updateSessionsLoadingStatus(false));

    if (!response.success) {
      return;
    }
    if (isCompare){
      dispatch(insertCompareSessions(response.data));
    } else {
      dispatch(insertSessions(response.data));
    }
  };
}

export function loadProjectApiKeyAsync(projectId) {
  return async dispatch => {
    const apiKey = await requestService.getProjectApiKey(projectId);

    dispatch(setProjectApiKey(apiKey));
  };
}

export function setAnalyticsStale() {
  return async dispatch => {
    dispatch(updateStatus(ANALYTICS_STATUS_STALE));
  };
}
