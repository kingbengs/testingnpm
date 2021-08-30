import { createAction } from "redux-actions";
import { ActionNames } from "react-project/redux/actionNamesConstant";

export const setInputValue = createAction(ActionNames.setInputValue);
export const addLastInputValue = createAction(ActionNames.addLastInputValue);
export const clearInputsState = createAction(ActionNames.clearInputsState);
