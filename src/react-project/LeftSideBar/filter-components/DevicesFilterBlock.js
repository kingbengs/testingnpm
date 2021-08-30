import React, { useRef, useState } from "react";
import styles from "react-project/LeftSideBar/LeftSideBar.module.scss";
import { iconDevices } from "react-project/assets/Icons";
import { When } from "react-project/Util/When";
import cls from "classnames";
import { ClickOutsideCustomComponent } from "react-project/Util/ClickOutsideCustom";
import DevicesFilter from "react-project/FilterData/DevicesFilter";
import PropTypes from "prop-types";
import { getDirtyStyle, getFilterAddClass } from "react-project/Util/FilterStyleHelper";

export const DEVICES_LIST = {
  'ALL_DEVICES': 'all devices',
  'MOBILE': 'mobile',
  'DESKTOP': 'desktop',
};

export const DevicesFilterBlock = ({ selectedDevice, funnel, onSelectDevice, type }) => {
  const [devicesOpened, setDevicesOpened] = useState(false);

  const onSelect = (selectedDevice) => {
    onSelectDevice({ device: selectedDevice });
  };

  const ref = useRef();

  return (
    <ClickOutsideCustomComponent
      ignoreClickOutside={!devicesOpened}
      onClickOutside={() => setDevicesOpened(false)}
    >
      <div
        className={cls(styles.FiltersItem, getFilterAddClass(type),  {
          [styles.ActiveFilter]: devicesOpened,
          [getDirtyStyle(type)]: selectedDevice !== DEVICES_LIST.ALL_DEVICES,
        })}
        ref={ref}
      >
        <div className={styles.ItemsForSelection} onClick={() => setDevicesOpened(!devicesOpened)}>
          <span>
            Device:
            <span className={cls(styles.CapitalizeTitle, styles.CountriesTitle)}>
              {selectedDevice}
            </span>
          </span>
          <div>{iconDevices}</div>
        </div>
        <When condition={devicesOpened && funnel}>
          <DevicesFilter
            funnel={funnel}
            selectedDevice={selectedDevice}
            setSelectedDevice={onSelect}
            innerRef={ref}
          />
        </When>
      </div>
    </ClickOutsideCustomComponent>
  );
};

DevicesFilterBlock.propType = {
  selectedDevice: PropTypes.string.isRequired,
  funnel: PropTypes.shape({
    projectId: PropTypes.string.isRequired,
  }),
  onSelectDevice: PropTypes.func.isRequired,
};
