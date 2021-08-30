import { createAction } from 'redux-actions';
import { removeAuthCookie } from 'react-project/Util/AuthCookie';
import { ActionNames } from "react-project/redux/actionNamesConstant";

export const clean = createAction(ActionNames.clean);

export const logout = () => (dispatch) => {
  removeAuthCookie();
  dispatch(clean());
};
