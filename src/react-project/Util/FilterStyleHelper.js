import { FILTER_TYPE_COMPARE } from "shared/CSharedConstants";
import styles from "react-project/LeftSideBar/LeftSideBar.module.scss";

export const getDirtyStyle = (type) => {
  return type === FILTER_TYPE_COMPARE ? styles.DirtyCompareFilter : styles.DirtyFilter;
};

export const getFilterAddClass = (type) => {
  return type === FILTER_TYPE_COMPARE && styles.CompareFilter;
};
