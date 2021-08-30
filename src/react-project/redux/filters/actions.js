import { createAction } from 'redux-actions';
import { dateFormatter } from 'react-project/LeftSideBar/filter-components/DateFilterBlock';
import { DEVICES_LIST } from 'react-project/LeftSideBar/filter-components/DevicesFilterBlock';
import { setStepFocusingId } from "react-project/redux/funnel-configuration/actions";
import { FILTER_NAMES } from "react-project/Constants/filters";
import { ActionNames } from "react-project/redux/actionNamesConstant";

export const setFilter = createAction(ActionNames.setFilter);
export const setApplyButtonEnabled = createAction(ActionNames.setApplyButtonEnabled);

const currentDateString = new Date().toISOString();

export const defaultFilters = {
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
    session: null,
  },
  dateCompareFilter: {
    inputStart: dateFormatter(currentDateString),
    inputFinish: dateFormatter(currentDateString),
  },
};

export const clearFilterState = () => {
  return (dispatch) => {
    const promise = new Promise(function(resolve) {
      dispatch(
        setFilter({
          type: FILTER_NAMES.CURRENT_FILTERS,
          filterName: FILTER_NAMES.COMMON_FILTERS,
          value: defaultFilters.commonFilters,
        })
      );
      dispatch(
        setFilter({
          type: FILTER_NAMES.CURRENT_FILTERS,
          filterName: FILTER_NAMES.PEOPLE_COMPARE_FILTERS,
          value: defaultFilters.peopleCompareFilters,
        })
      );
      dispatch(
        setFilter({
          type: FILTER_NAMES.CURRENT_FILTERS,
          filterName: FILTER_NAMES.DATE_COMPARE_FILTER,
          value: defaultFilters.dateCompareFilter,
        })
      );
      dispatch(setStepFocusingId('', false));
      dispatch(setStepFocusingId('', true));

      resolve();
    });

    return promise;
  };
};
