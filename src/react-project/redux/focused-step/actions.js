import { createAction } from "redux-actions";
import {
  FILTER_TYPE_COMPARE,
  FILTER_TYPE_COMPARE_STEP,
  FILTER_TYPE_DEFAULT_STEP
} from "shared/CSharedConstants";
import { ActionNames } from "react-project/redux/actionNamesConstant";

export const updateDefaultFocusedStep = createAction(ActionNames.updateDefaultFocusedStep);
export const updateCompareFocusedStep = createAction(ActionNames.updateCompareFocusedStep);

export const updateFocusedStep = ({ step, stepOpened, filterTypes }) => {
  return (dispatch) => {
    if (filterTypes.includes(FILTER_TYPE_COMPARE_STEP)) {
      dispatch(updateCompareFocusedStep({ selectedValue: step, opened: stepOpened }));
    } else if(filterTypes.includes(FILTER_TYPE_DEFAULT_STEP)) {
      dispatch(updateDefaultFocusedStep({ selectedValue: step, opened: stepOpened }));
    }
  };
};

export const setStepFilterOpened = ({ id, value, selectedStep }) => {
  return (dispatch) => {
    if (id === FILTER_TYPE_COMPARE) {
      dispatch(updateCompareFocusedStep({ opened: value, selectedValue: selectedStep}));
    } else {
      dispatch(updateDefaultFocusedStep({ opened: value, selectedValue: selectedStep }));
    }
  };
};
