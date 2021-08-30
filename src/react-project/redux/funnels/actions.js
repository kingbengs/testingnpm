import { createAction } from 'redux-actions';
import RequestService from 'react-project/Helpers/RequestService';
import { logout } from '../auth/actions';
import { commonSendEventFunction } from 'shared/CSharedMethods';
import { RP_EVENT_LOAD_REQUEST } from 'shared/CSharedEvents';
import { texturePathMorphing } from 'react-project/Util/texturePathMorphing';
import { setNewFunnelConfiguration } from "react-project/redux/funnel-configuration/actions";
import { ActionNames } from "react-project/redux/actionNamesConstant";

export const updateFunnel = createAction(ActionNames.updateFunnel);
export const updateIsFunnelLoading = createAction(ActionNames.updateIsFunnelLoading);

const requestService = new RequestService();

export const fetchFunnelAsync = (funnelId) => {
  return async (dispatch) => {
    const result = await requestService.fetchFunnelRequest(funnelId);

    if (result.success) {
      dispatch(updateFunnel(result.data));
    }

    if (!result.success && result.errorStatus === 401) {
      dispatch(logout());
    }

    return result;
  };
};

export const loadFunnelAsync = ({ funnelId, params = {}, refreshAnalytics, refreshRevisions }) => {
  return async (dispatch) => {
    dispatch(updateIsFunnelLoading(true));

    const response = await requestService.loadFunnelRequest(funnelId, params);
    if (!response) {
      commonSendEventFunction(RP_EVENT_LOAD_REQUEST, { data: { objects: [], joints: [] } });
      refreshAnalytics([], []);
      return;
    }

    // todo: remove it later. It's additional temporary method for changing old iconNames. Should be deleted after release, or someTime after
    const data = texturePathMorphing(response.data);
    if (Object.keys(data.funnelConfiguration).length !== 0) {
      dispatch(setNewFunnelConfiguration(data.funnelConfiguration));
    }

    commonSendEventFunction(RP_EVENT_LOAD_REQUEST, { data: data });

    dispatch(updateIsFunnelLoading(false));
    refreshAnalytics(data.objects, data.joints);
    refreshRevisions(funnelId);
  };
};
