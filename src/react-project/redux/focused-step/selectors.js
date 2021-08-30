import { FILTER_TYPE_COMPARE } from "shared/CSharedConstants";

export const selectStepFocused = (state) => state.focusedStep.stepFocused;
export const selectCompareStepFocused = (state) => state.focusedStep.compareStepFocused;

export const selectStepOpened = (state, type) => {
  if (type === FILTER_TYPE_COMPARE) {
    return state.focusedStep.compareStepFocused.opened;
  } else {
    return state.focusedStep.stepFocused.opened;
  }
};

export const selectSelectedStep = (state, type) => {
  if (type === FILTER_TYPE_COMPARE) {
    return state.focusedStep.compareStepFocused.selectedValue;
  } else {
    return state.focusedStep.stepFocused.selectedValue;
  }
};
