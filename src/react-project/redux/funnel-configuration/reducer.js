import { handleActions } from "redux-actions";
import { produce } from "immer";
import {
  updateStepFocusingId,
  updateDataRange,
  updateFilterData,
  updateCompareFilterData,
  updateStepCompareFocusingId,
  updateCompareDataRange,
  setCompareFilterStatus,
  setPanningActive,
  setNewFunnelConfiguration,
} from './actions';
import { DEFAULT_STEP_STATE, DEFAULT_DEVICES_STATE } from "react-project/Constants/step-settings";

const initialState = {
  dateRange: {
    min: new Date().toISOString(),
    max: new Date().toISOString(),
  },
  compareDateRange: {
    min: new Date().toISOString(),
    max: new Date().toISOString(),
  },
  isPanningActive: false,
  filter: {
    device: DEFAULT_DEVICES_STATE,
    countries: [],
  },
  compareFilter: {
    device: DEFAULT_DEVICES_STATE,
    countries: [],
  },
  selectedCompareFilter: false,
  stepFocusingId: DEFAULT_STEP_STATE,
  stepCompareFocusingId: DEFAULT_STEP_STATE,
};

export default handleActions(
  {
    [updateCompareDataRange.toString()]: (state, action) =>
      produce(state, (draft) => {
        draft.compareDateRange = {
          min: action.payload.min,
          max: action.payload.max,
        };
      }),
    [updateDataRange.toString()]: (state, action) =>
      produce(state, (draft) => {
        draft.dateRange = {
          min: action.payload.min,
          max: action.payload.max,
        };
      }),
    [updateStepFocusingId.toString()]: (state, action) =>
      produce(state, (draft) => {
        draft.stepFocusingId = action.payload;
      }),
    [updateStepCompareFocusingId.toString()]: (state, action) =>
      produce(state, (draft) => {
        draft.stepCompareFocusingId = action.payload;
      }),
    [updateFilterData.toString()]: (state, action) =>
      produce(state, (draft) => {
        draft.filter = {
          device: action.payload.device,
          countries: action.payload.countries,
        };

        if (action.payload.session) {
          draft.filter.session = action.payload.session;
        }
      }),
    [updateCompareFilterData.toString()]: (state, action) =>
      produce(state, (draft) => {
        draft.compareFilter = {
          device: action.payload.device,
          countries: action.payload.countries,
        };

        if (action.payload.session) {
          draft.compareFilter.session = action.payload.session;
        }
      }),
    [setCompareFilterStatus.toString()]: (state, action) =>
      produce(state, (draft) => {
        draft.selectedCompareFilter = action.payload.status;
      }),
    [setPanningActive.toString()]: (state, action) =>
      produce(state, (draft) => {
        draft.isPanningActive = action.payload;
      }),
    [setNewFunnelConfiguration.toString()]: (state, action) =>
      produce(state, (draft) => {
        draft.stepFocusingId = action.payload.stepFocusingId;
        draft.dateRange = action.payload.dateRange;
      }),
  },
  initialState
);
