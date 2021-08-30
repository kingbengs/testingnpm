import React from "react";
import { useDispatch } from "react-redux";
import styles from "../NotificationAlert.module.scss";
import { pushToBlockStorage } from "../../../Util/notificationAlerts";
import { TEXT_DONT_SHOW_AGAIN } from "../../../Constants/notification-alerts";

export const BlockButton = ({ setStatus, alert }) => {
  const dispatch = useDispatch();

  const closeForever = () => {
    dispatch(setStatus(false));
    pushToBlockStorage(alert);
  };

  return (
    <div onClick={() => closeForever()} className={styles.Item}>
      {TEXT_DONT_SHOW_AGAIN}
    </div>
  );
};
