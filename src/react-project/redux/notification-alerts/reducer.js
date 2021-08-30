import { produce } from "immer";
import { handleActions } from "redux-actions";
import { setPanGuideStatus, setPerfectShapeGuideStatus, setUpdateCanvasDataStatus } from "./actions";
import { getBlockStorage } from "../../Util/notificationAlerts";
import { NOTIFICATION_ALERTS } from "../../Constants/notification-alerts";

const initialState = {
  [NOTIFICATION_ALERTS.PAN_GUIDE]: false,
  [NOTIFICATION_ALERTS.PERFECT_SHAPE_GUIDE]: false,
  [NOTIFICATION_ALERTS.UPDATE_CANVAS_DATA]: false,
};

const isBlocked = (alert) => {
  const blockAlerts = getBlockStorage();
  return blockAlerts.includes(alert);
};

export default handleActions(
  {
    [setPanGuideStatus.toString()]: (state, action) =>
      produce(state, (draft) => {
        const alert = NOTIFICATION_ALERTS.PAN_GUIDE;
        draft[alert] = isBlocked(alert) ? false : action.payload;
      }),
    [setPerfectShapeGuideStatus.toString()]: (state, action) =>
      produce(state, (draft) => {
        const alert = NOTIFICATION_ALERTS.PERFECT_SHAPE_GUIDE;
        draft[alert] = isBlocked(alert) ? false : action.payload;
      }),
    [setUpdateCanvasDataStatus.toString()]: (state, action) =>
      produce(state, (draft) => {
        const alert = NOTIFICATION_ALERTS.UPDATE_CANVAS_DATA;
        draft[alert] = action.payload;
      }),
  },
  initialState
);
