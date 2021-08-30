import React from 'react';
import PropTypes from 'prop-types'
import cls from 'classnames';

import styles from './Disclosure.module.scss';

const DisclosureComponent = ({ disclosureButtonSlot, children, isOpened }) => {
  return (
    <div>
      {disclosureButtonSlot}
      <div className={cls(styles.DisclosurePanel, {[styles.DisclosurePanelOpened]: isOpened})}>
        {children}
      </div>
    </div>
  );
};

DisclosureComponent.propTypes = {
  isOpened: PropTypes.bool.isRequired,
  disclosureButtonSlot: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired
};

export const Disclosure = DisclosureComponent;
