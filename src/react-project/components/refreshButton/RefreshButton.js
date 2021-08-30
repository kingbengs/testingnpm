import {
  ANALYTICS_STATUS_ERROR,
  ANALYTICS_STATUS_STALE,
  ANALYTICS_STATUS_SUCCESS,
  THUMBNAIL_TYPE,
} from "shared/CSharedConstants";
import styles from "./RefreshButton.module.scss";
import {
  iconAnalyticsError,
  iconAnalyticsWarning,
  iconCheckmark,
  iconRefreshBtn,
} from "react-project/assets/Icons";
import React from "react";
import cls from "classnames";

const MAP_ANALYTICS_STATUS_TO_ICON = new Map([
  [ANALYTICS_STATUS_SUCCESS, iconCheckmark],
  [ANALYTICS_STATUS_ERROR, iconAnalyticsError],
  [ANALYTICS_STATUS_STALE, iconAnalyticsWarning],
]);

export const RefreshButton = ({ loading, analyticsStatus, onClick, type, loaderClassName }) => {
  const refreshButtonStatusIcon = MAP_ANALYTICS_STATUS_TO_ICON.get(analyticsStatus);

  if (loading) {
    return (
      <div
        className={cls(styles.AnalyticsReloading, loaderClassName, {
          [styles.ThumbnailLoad]: type === THUMBNAIL_TYPE,
        })}
      >
        {iconRefreshBtn}
      </div>
    );
  } else {
    return (
      <div className={styles.ReloadBtn} onClick={onClick}>
        {iconRefreshBtn}
        {refreshButtonStatusIcon && (
          <span className={styles.RefreshBtnStatus}>{refreshButtonStatusIcon}</span>
        )}
      </div>
    );
  }
};
