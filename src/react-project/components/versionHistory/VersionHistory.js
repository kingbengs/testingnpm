import React, { useEffect, useState } from 'react';
import styles from './VersionHistory.module.scss';
import leftSidebarStyles from 'react-project/LeftSideBar/LeftSideBar.module.scss';
import { iconClose } from 'react-project/assets/Icons';
import { TEXT_LOAD_MORE, TEXT_VERSION_HISTORY } from 'react-project/Constants/texts';
import cls from 'classnames';
import { SecondaryButton } from '../secondaryButton/SecondaryButton';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectFunnelRevisions,
  selectFunnelRevisionsMeta,
  selectIsFunnelRevisionsLoading,
} from 'react-project/redux/funnel-revisions/selectors';
import { formatDate } from 'react-project/Util/dateFormatter';
import { Loader } from 'react-project/components/loader/Loader';
import { Button } from 'react-project/components/button/Button';
import { selectIsFunnelLoading } from 'react-project/redux/funnels/selectors';
import { loadMoreRevisionsAsync } from 'react-project/redux/funnel-revisions/actions';

const DEFAULT_LIMIT = 10;

export const VersionHistory = ({ onClose, isSidebarOpened, onRestoreFunnel, funnelId }) => {
  const [page, setPage] = useState(0);

  const revisions = useSelector(selectFunnelRevisions);
  const meta = useSelector(selectFunnelRevisionsMeta);
  const isFunnelLoading = useSelector(selectIsFunnelLoading);
  const isRevisionsLoading = useSelector(selectIsFunnelRevisionsLoading);

  useEffect(() => {
    setPage(revisions.length / DEFAULT_LIMIT);
  }, [revisions]);

  const dispatch = useDispatch();
  const onLoadMoreRevisions = () => {
    dispatch(loadMoreRevisionsAsync(funnelId, page * DEFAULT_LIMIT));
  };

  return (
    <div className={cls(styles.VersionHistoryWrapper, { [styles.FullHeight]: !isSidebarOpened })}>
      <div className={styles.VersionHistoryContent}>
        <div className={styles.VersionHistoryHeader}>
          <div className={cls(leftSidebarStyles.BlockTitle, styles.VersionHistoryTitle)}>
            {TEXT_VERSION_HISTORY}
          </div>
          <div
            className={styles.CloseButton}
            onClick={() => {
              onClose();
            }}
          >
            {iconClose}
          </div>
        </div>
        <div>
          {revisions &&
            revisions.map((revision) => (
              <div className={styles.VersionHistoryItem} key={revision.attributes.created_at}>
                <div className={styles.VersionHistoryItemDatetime}>
                  {formatDate(revision.attributes.created_at)}
                </div>
                <SecondaryButton
                  onClick={() => onRestoreFunnel({ revision: revision.id })}
                  title="Restore version"
                  withBorder
                  className={styles.RestoreVersionButton}
                  disabled={isFunnelLoading || isRevisionsLoading}
                />
              </div>
            ))}
        </div>
        {meta.hasMore && (
          <div className={styles.VersionHistoryLoadMore}>
            <Button
              className={styles.VersionHistoryLoadMoreButton}
              onClick={onLoadMoreRevisions}
              disabled={isFunnelLoading}
            >
              {isFunnelLoading || isRevisionsLoading ? <Loader /> : TEXT_LOAD_MORE}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
