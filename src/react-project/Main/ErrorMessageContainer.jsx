import React from 'react';
import styles from './Main.module.scss';

export const ErrorMessageContainer = ({ onClose, msgData }) => {
  return (
    <div className={styles.ErrorMessageWrapper}>
      {msgData}
      <div className={styles.CloseIcon} onClick={onClose}>
        X
      </div>
    </div>
  );
}
