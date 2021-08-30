import React, { useEffect, useState } from "react";
import styles from "./NotificationAlert.module.scss";
import { useSelector } from "react-redux";
import { selectNotificationAlerts } from "../../redux/notification-alerts/selectors";
import { AlertConf } from "./conf";
import cls from "classnames";

import { PR_EVENT_SHAPE_DRAWING_ENDED, PR_EVENT_SHAPE_DRAWING_ENDED_FAIL, PR_EVENT_SHAPE_DRAWING_STARTED } from "shared/CSharedEvents";

const MAX_Z_INDEX = 2147483647;

export const NotificationAlert = () => {
  const notificationAlerts = useSelector(selectNotificationAlerts);
  const activeAlerts = Object.keys(notificationAlerts).filter((item) => notificationAlerts[item]);
  const currentAlert = activeAlerts[activeAlerts.length - 1];

  const [isDisable, setDisable] = useState(false);

  const onDrawShapeStarted = (e) => {
    setDisable(true);
  };

  const onDrawShapeEnded = (e) => {
    setDisable(false);
  };

  useEffect(() => {
    document.addEventListener(PR_EVENT_SHAPE_DRAWING_STARTED, onDrawShapeStarted, false);
    document.addEventListener(PR_EVENT_SHAPE_DRAWING_ENDED, onDrawShapeEnded, false);
    document.addEventListener(PR_EVENT_SHAPE_DRAWING_ENDED_FAIL, onDrawShapeEnded, false);
 
    return () => {
      window.removeEventListener(PR_EVENT_SHAPE_DRAWING_STARTED, onDrawShapeStarted);
      window.removeEventListener(PR_EVENT_SHAPE_DRAWING_ENDED, onDrawShapeEnded);
      window.removeEventListener(PR_EVENT_SHAPE_DRAWING_ENDED_FAIL, onDrawShapeEnded);
    };
  }, []);

  useEffect(() => {
    if (currentAlert) {
      const hubspot = document.getElementById("hubspot-messages-iframe-container");

      if (hubspot) {
        hubspot.style.zIndex = MAX_Z_INDEX - 1;
      }
    }
  }, [currentAlert]);

  return currentAlert ? (
    <div
      className={cls(styles.Notification, {
        [styles.Hide]: isDisable,
      })}
    >
      <div className={styles.Text}>{AlertConf[currentAlert].text}</div>
      <div className={styles.Actions}>
        {AlertConf[currentAlert].firstButton}
        {AlertConf[currentAlert].secondButton}
      </div>
    </div>
  ) : (
    false
  );
};
