import { createAction } from "redux-actions";
import { ActionNames } from "react-project/redux/actionNamesConstant";

export const setPanGuideStatus = createAction(ActionNames.setPanGuideStatus);
export const setPerfectShapeGuideStatus = createAction(ActionNames.setPerfectShapeGuideStatus);
export const setUpdateCanvasDataStatus = createAction(ActionNames.setUpdateCanvasDataStatus);
