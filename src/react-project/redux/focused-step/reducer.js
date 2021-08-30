import { produce } from 'immer';
import { handleActions } from 'redux-actions';

import { updateDefaultFocusedStep, updateCompareFocusedStep } from './actions';

const initialState = {
  stepFocused: {
    id: 'default',
    opened: false,
    selectedValue: null,
  },
  compareStepFocused: {
    id: 'compare',
    opened: false,
    selectedValue: null,
  }
};

export default handleActions(
  {
    [updateDefaultFocusedStep.toString()]: (state, action) =>
      produce(state, (draft) => {
        draft.stepFocused = {
          ...draft.stepFocused,
          opened: action.payload.opened,
          selectedValue: action.payload.selectedValue,
        };
      }),
    [updateCompareFocusedStep.toString()]: (state, action) =>
      produce(state, (draft) => {
        draft.compareStepFocused = {
          ...draft.compareStepFocused,
          opened: action.payload.opened,
          selectedValue: action.payload.selectedValue,
        };
      }),
  },
  initialState
);
