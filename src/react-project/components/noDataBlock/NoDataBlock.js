import React from "react";
import styles from "./NoDataBlock.module.scss";

export const NoDataBlock = ({ text }) => {
  return (
    <div className={styles.ContainerGrey}>
      <div className={styles.ChildText}>{text}</div>
    </div>
  );
};
