import React from "react";
import { useDispatch } from "react-redux";
import styles from "../NotificationAlert.module.scss";
import { TEXT_REMIND_ME_LATER } from "../../../Constants/notification-alerts";

export const RemindButton = ({ setStatus }) => {
  const dispatch = useDispatch();

  const close = () => {
    dispatch(setStatus(false));
  };

  return (
    <div onClick={() => close()} className={styles.Item}>
      {TEXT_REMIND_ME_LATER}
    </div>
  );
};
