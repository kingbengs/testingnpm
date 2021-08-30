import React from 'react';
import styles from 'react-project/components/tooltip/Tooltip.module.scss';
import { HotKey } from 'react-project/components/dropdown/HotKey';
import { Tooltip } from 'react-project/components/tooltip/Tooltip';
import { getHotkeyForAction } from 'react-project/Util/HotkeysUtil';
import PropTypes from 'prop-types';

export const TooltipWithHotkey = ({ actionName, label, children }) => {
  const hotkey = getHotkeyForAction(actionName);

  return (
    <Tooltip
      label={
        <div className={styles.TooltipWithHotkey}>
          <div>{label}</div>
          {hotkey && <HotKey keys={hotkey.keys} separator={hotkey.separator} variant="light" />}
        </div>
      }
    >
      {children}
    </Tooltip>
  );
};

TooltipWithHotkey.propTypes = {
  actionName: PropTypes.string,
  label: PropTypes.string,
  children: PropTypes.node,
};
