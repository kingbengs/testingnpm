import React from "react";
import styles from "./NotificationAlert.module.scss";
import { NOTIFICATION_ALERTS } from "../../Constants/notification-alerts";
import {
  setPanGuideStatus,
  setPerfectShapeGuideStatus,
  setUpdateCanvasDataStatus,
} from "../../redux/notification-alerts/actions";
import { RemindButton } from "./common/RemindButton";
import { BlockButton } from "./common/BlockButton";
import { DismissButton } from "./common/DismissButton";
import { UpdateDataButton } from "./common/UpdateDataButton";
import { iconLeftMouse, iconMiddleMouse } from "../../assets/Icons";

export const AlertConf = {
  [NOTIFICATION_ALERTS.PERFECT_SHAPE_GUIDE]: {
    text: (
      <p>
        Hold <span className={styles.Key}>shift</span> anytime while drawing a shape to maintain
        perfect aspect ratio
      </p>
    ),
    firstButton: <RemindButton setStatus={setPerfectShapeGuideStatus} />,
    secondButton: <BlockButton alert={NOTIFICATION_ALERTS.PERFECT_SHAPE_GUIDE} setStatus={setPerfectShapeGuideStatus} />
  },
  [NOTIFICATION_ALERTS.PAN_GUIDE]: {
    text: (
      <p>
        You can pan while using any tool by using <br />{" "}
        <span className={styles.Svg}>{iconMiddleMouse}</span>{" "}
        <span className={styles.ReduceText}>or</span> <span className={styles.Key}>space</span>{" "}
        <span className={styles.ReduceText}>+</span>{" "}
        <span className={styles.Svg}>{iconLeftMouse}</span>
      </p>
    ),
    firstButton: <RemindButton setStatus={setPanGuideStatus} />,
    secondButton: <BlockButton alert={NOTIFICATION_ALERTS.PAN_GUIDE} setStatus={setPanGuideStatus} />
  },
  [NOTIFICATION_ALERTS.UPDATE_CANVAS_DATA]: {
    text: <p>Changes have been made, update canvas data</p>,
    firstButton: <UpdateDataButton />,
    secondButton: <DismissButton setStatus={setUpdateCanvasDataStatus} />
  },
};
