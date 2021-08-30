import { createAction } from "redux-actions";
import RequestService from "react-project/Helpers/RequestService";
import { ActionNames } from "react-project/redux/actionNamesConstant";

export const setPermission = createAction(ActionNames.setPermission);
export const setEmail = createAction(ActionNames.setEmail);

const requestService = new RequestService();

export const loadPermissionAsync = ({ scopeId, permission, scope, projectId }) => {
  return async (dispatch) => {
    const hasPermission = await requestService.hasUserPermission({
      scopeId,
      permission,
      projectId,
      scope,
    });

    if (hasPermission) {
      dispatch(setPermission({ name: permission, permitted: hasPermission.permitted }));
    }
  };
};

export const loadUserData = ({ userId }) => {
  return async (dispatch) => {
    const response = await requestService.getUserData({ userId });

    if (response && response.data && response.data.attributes) {
      dispatch(setEmail(response.data.attributes.email));
    }
  };
};
