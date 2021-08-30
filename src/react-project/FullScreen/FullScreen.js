import React from 'react';
import PropTypes from 'prop-types';

import styles from './FullScreen.module.scss';

import { iconFullScreenOpen, iconFullScreenClose } from '../assets/Icons';
import { Tooltip } from 'react-project/components/tooltip/Tooltip';
import { TEXTS_TOOLTIP } from 'react-project/Constants/texts';
import { TOOLTIP_POSITIONS } from 'react-project/Constants/tooltip';

const FullScreenComponent = ({ isFullScreenActive, onSetFullScreenStatus }) => {
  const fullScreenStatusClass = isFullScreenActive ? '' : styles.Inactive;

  return (
    <Tooltip
      label={isFullScreenActive ? TEXTS_TOOLTIP.SHOW_PANELS : TEXTS_TOOLTIP.HIDE_PANELS}
      position={isFullScreenActive ? TOOLTIP_POSITIONS.TOP : TOOLTIP_POSITIONS.BOTTOM}
    >
      <div
        className={`${styles.FullScreenBtn} ${fullScreenStatusClass}`}
        onClick={onSetFullScreenStatus}
      >
        <div className={styles.FullScreenIcon}>
          {isFullScreenActive ? iconFullScreenOpen : iconFullScreenClose}
        </div>
      </div>
    </Tooltip>
  );
};

FullScreenComponent.propTypes = {
  isFullScreenActive: PropTypes.bool.isRequired,
  onSetFullScreenStatus: PropTypes.func.isRequired,
};

export default FullScreenComponent;
