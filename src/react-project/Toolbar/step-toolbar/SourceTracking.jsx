import React from 'react';
import styles from 'react-project/Toolbar/Toolbar.module.scss';

export const SourceTracking = (props) => {
  const {
    trackingURL, onTrackingUrlChange, utmData, onParamsSourceChange,
    onAddCustomParameter, urlParamsRows
  } = props;

  return (
    <div className={styles.TrackingTab}>
      <div className={styles.Label}>
        <div>
          <label className={styles.SideBarLabel}>External URL</label>
          <div className={styles.LabelWrapper}>
            <input
              autoFocus={true}
              value={trackingURL}
              onChange={onTrackingUrlChange}
              type="text"
              className={`${styles.RsInput}`}
            />
          </div>
        </div>
      </div>
      <div className={styles.Label}>
        <label className={styles.FilterLabel}>
          <div className={styles.CheckboxText}>
            Parameters
          </div>
        </label>
        <div className={styles.FilterRow}>
          <div className={styles.FilterItemParameter}>
            <label>UTM Source</label>
            <input
              name="source"
              type="text"
              value={utmData.source}
              onChange={onParamsSourceChange}
            />
          </div>
          <div className={styles.FilterItemParameter}>
            <label>UTM Medium</label>
            <input
              name="medium"
              type="text"
              value={utmData.medium}
              onChange={onParamsSourceChange}
            />
          </div>
          <div className={styles.FilterItemParameter}>
            <label>UTM Campaign</label>
            <input
              name="campaign"
              type="text"
              value={utmData.campaign}
              onChange={onParamsSourceChange}
            />
          </div>
        </div>
        <div className={styles.FilterRow}>
          <div className={styles.FilterItemParameter}>
            <label>UTM Content</label>
            <input
              name="content"
              type="text"
              value={utmData.content}
              onChange={onParamsSourceChange}
            />
          </div>
          <div className={styles.FilterItemParameter}>
            <label>UTM Term</label>
            <input
              name="term"
              type="text"
              value={utmData.term}
              onChange={onParamsSourceChange}
            />
          </div>
          <div className={styles.FilterItemParameter}>
            <label></label>
          </div>
        </div>
        {urlParamsRows}
        <button
          className={styles.AddFilterBtn}
          onClick={onAddCustomParameter}
        >
          + Add Custom Parameter
        </button>
      </div>
    </div>
  );
};
