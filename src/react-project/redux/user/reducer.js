import { produce } from "immer";
import { handleActions } from "redux-actions";
import { setEmail, setPermission } from "./actions";

const initialState = {
  permissions: [],
  email: ''
};

export default handleActions(
  {
    [setPermission.toString()]: (state, action) =>
      produce(state, (draft) => {
        draft.permissions = [action.payload];
      }),
    [setEmail.toString()]: (state, action) =>
      produce(state, (draft) => {
        draft.email = action.payload;
      }),
  },
  initialState
);
