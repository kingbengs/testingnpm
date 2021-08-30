import React from "react";
import styles from "../NotificationAlert.module.scss";
import { TEXT_UPDATE_DATA } from "../../../Constants/notification-alerts";
import { RP_EVENT_REFRESH_REQUEST } from "shared/CSharedEvents";
import { commonSendEventFunction } from "shared/CSharedMethods";

export const UpdateDataButton = () => {
  const updateData = () => {
    commonSendEventFunction(RP_EVENT_REFRESH_REQUEST, { value: true });
  };

  return (
    <div onClick={() => updateData()} className={styles.Item}>
      {TEXT_UPDATE_DATA}
    </div>
  );
};
