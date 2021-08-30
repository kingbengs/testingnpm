import { produce } from 'immer';
import { handleActions } from 'redux-actions';

import { updateFunnel, updateIsFunnelLoading } from './actions';

const initialState = {
  isFunnelLoading: false,
};

export default handleActions(
  {
    [updateFunnel.toString()]: (state, action) =>
      produce(state ,draft => {
        draft[action.payload.id] = action.payload;
      }),
    [updateIsFunnelLoading.toString()]: (state, action) =>
      produce(state ,draft => {
        draft.isFunnelLoading = action.payload;
      }),
  },
  initialState
);
