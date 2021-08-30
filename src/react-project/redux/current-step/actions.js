import {
  ANALYTICS_STATUS_ERROR,
  ANALYTICS_STATUS_LOADING,
  ANALYTICS_STATUS_SUCCESS,
} from "shared/CSharedConstants";
import { loadAnalyticsAsync, updateStatus } from "react-project/redux/analytics/actions";
import RequestService from "react-project/Helpers/RequestService";
import { createAction } from "redux-actions";
import { commonSendEventFunction } from "shared/CSharedMethods";
import { RP_EVENT_EDIT_OBJECT } from "shared/CSharedEvents";
import { ActionNames } from "react-project/redux/actionNamesConstant";

const requestService = new RequestService();

export const setThumbnailIsLoading = createAction(ActionNames.setThumbnailIsLoading);
export const setAttributeExplorerData = createAction(ActionNames.setAttributeExplorerData);
export const setNewCurrentStepLabel = createAction(ActionNames.setNewCurrentStepLabel);
export const setNewCurrentStepUrl = createAction(ActionNames.setNewCurrentStepUrl);
export const setNewCurrentStep = createAction(ActionNames.setNewCurrentStep);
export const setNewCurrentStepFilterParams = createAction(ActionNames.setNewCurrentStepFilterParams);
export const setNewCurrentStepUtmData = createAction(ActionNames.setNewCurrentStepUtmData);
export const setNewCurrentStepTrackingUrl = createAction(ActionNames.setNewCurrentStepTrackingUrl);

export function setNewLabel({ label, currentStep }) {
  return async (dispatch) => {
    dispatch(setNewCurrentStepLabel(label));

    commonSendEventFunction(RP_EVENT_EDIT_OBJECT, {
      stepId: currentStep.stepId,
      label,
      filterData: currentStep.object.filterData,
    });
  };
}

export function getThumbnailImg({ currentStep }) {
  return async (dispatch) => {
    if (currentStep?.object.url) {
      dispatch(setThumbnailIsLoading(true));
      requestService.getThumbnailImg(currentStep.stepId, currentStep.object.url).finally(() => {
        dispatch(setThumbnailIsLoading(false));
      });
    }
  };
}

export function setNewUrl({ url, currentStep }) {
  return async (dispatch) => {
    dispatch(setNewCurrentStepUrl(url));

    commonSendEventFunction(RP_EVENT_EDIT_OBJECT, {
      stepId: currentStep.stepId,
      url,
    });
  };
}

export function updateAnalyticsWhenUrlChanged({ url, currentStep, projectId, funnelConfiguration }) {
  return async (dispatch) => {
    dispatch(setNewCurrentStepUrl(url));

    const objForSending = [
      {
        ID: currentStep.stepId,
        url,
        filterData: currentStep.object.filterData,
      },
    ];

    dispatch(updateStatus(ANALYTICS_STATUS_LOADING));

    dispatch(loadAnalyticsAsync(projectId, funnelConfiguration, objForSending))
      .then(() => {
        dispatch(updateStatus(ANALYTICS_STATUS_SUCCESS));
      })
      .catch(() => {
        dispatch(updateStatus(ANALYTICS_STATUS_ERROR));
      });

    commonSendEventFunction(RP_EVENT_EDIT_OBJECT, {
      stepId: currentStep.stepId,
      url,
    });
  };
}

export function getAttributeExplorerDataAsync(projectId, startData, funnelConfiguration) {
  return async (dispatch) => {
    dispatch(updateStatus(ANALYTICS_STATUS_LOADING));

    const responseData = await requestService.getAttributeExplorerData(
      projectId,
      startData,
      funnelConfiguration
    );

    dispatch(setAttributeExplorerData(responseData));
    dispatch(updateStatus(responseData ? ANALYTICS_STATUS_SUCCESS : ANALYTICS_STATUS_ERROR));
  };
}
