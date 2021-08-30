import { createAction } from 'redux-actions';
import { ActionNames } from "react-project/redux/actionNamesConstant";

export const updateStepFocusingId = createAction(ActionNames.updateStepFocusingId);
export const updateStepCompareFocusingId = createAction(ActionNames.updateStepCompareFocusingId);
export const updateDataRange = createAction(ActionNames.updateDataRange);
export const updateCompareDataRange = createAction(ActionNames.updateCompareDataRange);
export const updateFilterData = createAction(ActionNames.updateFilterData);
export const updateCompareFilterData = createAction(ActionNames.updateCompareFilterData);
export const setCompareFilterStatus = createAction(ActionNames.setCompareFilterStatus);
export const setPanningActive = createAction(ActionNames.setPanningActive);
export const setNewFunnelConfiguration = createAction(ActionNames.setNewFunnelConfiguration);

export const setCompareFilter = ({ status }) => {
  return (dispatch) => {
    return new Promise((resolve) => {
      dispatch(setCompareFilterStatus({ status }));

      resolve();
    });
  };
};

export function setStepFocusingId(newValue, compare = false) {
  if (compare) {
    return async dispatch => {
      dispatch(updateStepCompareFocusingId(newValue));
    };
  }
  return async dispatch => {
    dispatch(updateStepFocusingId(newValue));
  };
}

export function setDataRange(newValue, compare = false) {
  if (compare) {
    return async dispatch => {
      dispatch(updateCompareDataRange(newValue));
    };
  } else {
    return async dispatch => {
      dispatch(updateDataRange(newValue));
    };
  }
}

export function setFilterData(newValue, compare = false) {
  return async dispatch => {
    return new Promise((resolve) => {
      dispatch(updateFilterData(newValue, compare));
      resolve()
    });
  };
}

export function setCompareFilterData(newValue, compare = false) {
  return async dispatch => {
    return new Promise((resolve) => {
      dispatch(updateCompareFilterData(newValue, compare));
      resolve()
    });
  };
}
