import { handleActions } from "redux-actions";
import { produce } from "immer";
import { setApplyButtonEnabled, setFilter } from "react-project/redux/filters/actions";
import { dateFormatter } from "react-project/LeftSideBar/filter-components/DateFilterBlock";
import { DEVICES_LIST } from "react-project/LeftSideBar/filter-components/DevicesFilterBlock";

const currentDateString = new Date().toISOString();

const initialState = {
  currentFilters: {
    commonFilters: {
      inputStart: dateFormatter(currentDateString),
      inputFinish: dateFormatter(currentDateString),
      countries: [],
      device: DEVICES_LIST.ALL_DEVICES,
      step: null,
      session: null,
    },
    peopleCompareFilters: {
      step: null,
      countries: [],
      device: DEVICES_LIST.ALL_DEVICES,
      session: null
    },
    dateCompareFilter: {
      inputStart: dateFormatter(currentDateString),
      inputFinish: dateFormatter(currentDateString),
    },
  },
  previousFilters: {
    commonFilters: {
      inputStart: dateFormatter(currentDateString),
      inputFinish: dateFormatter(currentDateString),
      countries: [],
      device: DEVICES_LIST.ALL_DEVICES,
      step: null,
      session: null,
    },
    peopleCompareFilters: {
      step: null,
      countries: [],
      device: DEVICES_LIST.ALL_DEVICES,
      session: null
    },
    dateCompareFilter: {
      inputStart: dateFormatter(currentDateString),
      inputFinish: dateFormatter(currentDateString),
    },
  },

  applyButtonEnabled: false
};

export default handleActions(
  {
    [setFilter.toString()]: (state, action) =>
      produce(state, (draft) => {
        draft[action.payload.type][action.payload.filterName] = action.payload.value;
      }),
    [setApplyButtonEnabled.toString()]: (state, action) =>
      produce(state, (draft) => {
        draft.applyButtonEnabled = action.payload;
      }),
  },
  initialState
);
