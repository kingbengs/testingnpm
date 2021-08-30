import { createAction } from "redux-actions";
import RequestService from "react-project/Helpers/RequestService";
import { ActionNames } from "react-project/redux/actionNamesConstant";

export const updateFunnelRevisions = createAction(ActionNames.updateFunnelRevisions);
export const updateFunnelRevisionsMeta = createAction(ActionNames.updateFunnelRevisionsMeta);
export const updateFunnelMoreRevisions = createAction(ActionNames.updateFunnelMoreRevisions);
export const updateFunnelRevisionsIsLoading = createAction(ActionNames.updateFunnelRevisionsIsLoading);

const requestService = new RequestService();

export const loadFunnelRevisionsAsync = (funnelId, offset = 0, limit = 10) => {
  return async (dispatch) => {
    dispatch(updateFunnelRevisionsIsLoading(true));
    const result = await requestService.loadFunnelRevisionsRequest(funnelId, offset, limit);

    const { data: revisionsData, meta } = result.data;

    if (result.success) {
      dispatch(updateFunnelRevisions(revisionsData));
      dispatch(updateFunnelRevisionsMeta(meta));
    }
    dispatch(updateFunnelRevisionsIsLoading(false));
    return result.data;
  };
};

export const loadMoreRevisionsAsync = (funnelId, offset = 0, limit = 10) => {
  return async (dispatch) => {
    dispatch(updateFunnelRevisionsIsLoading(true));
    const result = await requestService.loadFunnelRevisionsRequest(funnelId, offset, limit);
    const { data: revisionsData, meta } = result.data;

    if (result.success) {
      dispatch(updateFunnelMoreRevisions(revisionsData));
      dispatch(updateFunnelRevisionsMeta(meta));
    }
    dispatch(updateFunnelRevisionsIsLoading(false));
    return result.data;
  };
};
