import { produce } from "immer";
import { handleActions } from "redux-actions";
import { addLastInputValue, clearInputsState, setInputValue } from "./actions";

const initialState = {
  inputs: []
};

export default handleActions(
  {
    [setInputValue.toString()]: (state, action) =>
      produce(state, (draft) => {
        const filteredArray = draft.inputs.filter(el => el.type !== action.payload.type);
        draft.inputs = [...filteredArray, { 
          ...action.payload,
          currentValue: action.payload.value,
          previousValue: action.payload.value
        }];
      }),
    [addLastInputValue.toString()]: (state, action) =>
      produce(state, (draft) => {
        const elem = draft.inputs.find(el => el.type === action.payload.type);
        const index = draft.inputs.indexOf(elem);
        if(index !== -1) {
          draft.inputs[index].currentValue = action.payload.value;
        }
      }),
    [clearInputsState.toString()]: (state) =>
      produce(state, (draft) => {
        draft.inputs = [];
      }),
  },
  initialState
);
