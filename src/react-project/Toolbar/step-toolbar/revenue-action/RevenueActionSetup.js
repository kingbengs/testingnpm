import React, { useRef } from 'react';
import PropTypes from 'prop-types';

import styles from './RevenueAction.module.scss';
import { iconExternalLink } from 'react-project/assets/Icons';
import { ViewportAllower } from "../../../components/viewportAllower/ViewportAllower";

const RevenueActionSetupComponent = props => {
  const textAreaRef = useRef(null);
  const copyToClipBoard = () => {
    textAreaRef.current.select();
    document.execCommand('copy');
  };

  return (
    <ViewportAllower type="relative" className={styles.Setup}>
        <h6 className={styles.Title}>Setup Revenue Tracking</h6>
        <div className={styles.SetupContent}>
          <div className={styles.SetupDescription}>
            <p>
              Setup revenue tracking to better understand conversions, track KPIs and more in real
              time.
            </p>
            <p className={styles.SetupInstructions}>
              Follow the instructions to send revenue data.
            </p>
            <a
              className={styles.SetupInstructionsLink}
              href="https://kb.funnelytics.io/en/knowledge/send-a-purchase-webhook-to-funnelytics"
              target="_blank"
              rel="noopener noreferrer"
            >
              View setup instructions
              <span className={styles.SetupInstructionsLinkIcon}>{iconExternalLink}</span>
            </a>
          </div>
          <div className={styles.ApiKey}>
            <div className={styles.ApiKeyHeader}>
              <span>API Key</span>
              <button onClick={copyToClipBoard} className={styles.CopyApiKeyToClipboardButton}>
                Copy to clipboard
              </button>
            </div>
            <textarea
              ref={textAreaRef}
              className={styles.ApiKeyTextarea}
              rows="4"
              readOnly
              value={props.apiKey}
            />
          </div>
        </div>
    </ViewportAllower>
  );
};

RevenueActionSetupComponent.propTypes = {
  apiKey: PropTypes.string.isRequired,
};

export const RevenueActionSetup = RevenueActionSetupComponent;
