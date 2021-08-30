import { produce } from 'immer';
import { handleActions } from 'redux-actions';

import {
  updateFunnelRevisions,
  updateFunnelRevisionsMeta,
  updateFunnelMoreRevisions,
  updateFunnelRevisionsIsLoading,
} from './actions';

const initialState = {
  data: [],
  meta: {},
  isRevisionsLoading: false,
};

export default handleActions(
  {
    [updateFunnelRevisions.toString()]: (state, action) =>
      produce(state, (draft) => {
        draft.data = action.payload;
      }),
    [updateFunnelRevisionsMeta.toString()]: (state, action) =>
      produce(state, (draft) => {
        draft.meta = action.payload;
      }),
    [updateFunnelMoreRevisions.toString()]: (state, action) =>
      produce(state, (draft) => {
        const allValues = [...draft.data, ...action.payload];
        const filteredArray = allValues.filter(
          (v, i, a) => a.findIndex((t) => t.id === v.id) === i
        );
        draft.data = filteredArray;
      }),
    [updateFunnelRevisionsIsLoading.toString()]: (state, action) =>
      produce(state, (draft) => {
        draft.isRevisionsLoading = action.payload;
      }),
  },
  initialState
);
