import { handleActions } from "redux-actions";
import {
  DEFAULT_HITS,
  DEFAULT_URL,
  setExplorerItemsConfig,
  setExplorerLoadingStatus,
  setExplorerPageNumber,
  setExplorerPageParameters,
} from "react-project/redux/explorer/actions";
import { produce } from "immer";

const initialState = {
  explorerItemsConfig: {
    PAGE: [
      {
        url: DEFAULT_URL,
        value: DEFAULT_HITS,
      },
    ],
    EVENT: [
      {
        url: DEFAULT_URL,
        value: DEFAULT_HITS,
      },
    ],
    SOURCE: [
      {
        url: DEFAULT_URL,
        hits: DEFAULT_HITS,
      },
    ],
    PAGE_ALL: [
      {
        url: DEFAULT_URL,
        value: DEFAULT_HITS
      }
    ],
    EVENT_ALL: [
      {
        url: DEFAULT_URL,
        value: DEFAULT_HITS,
      },
    ],
    has_more_actions: false,
    has_more_pages: false,
    has_more_actions_all: false,
    has_more_pages_all: false,
  },
  explorerPageNumber: 1,
  explorerIsLoading: false,
};

export default handleActions(
  {
    [setExplorerItemsConfig.toString()]: (state, action) =>
      produce(state, (draft) => {
        draft.explorerItemsConfig = action.payload;
      }),
    [setExplorerPageNumber.toString()]: (state, action) =>
      produce(state, (draft) => {
        draft.explorerPageNumber = action.payload;
      }),
    [setExplorerLoadingStatus.toString()]: (state, action) =>
      produce(state, (draft) => {
        draft.explorerIsLoading = action.payload;
      }),
    [setExplorerPageParameters.toString()]: (state, action) =>
      produce(state, (draft) => {
        draft.explorerItemsConfig.SOURCE.commonParameters = action.payload.page_parameters.common_parameters;
        draft.explorerItemsConfig.SOURCE.customParameters = action.payload.page_parameters.custom_parameters;
      }),
  },
  initialState
);
