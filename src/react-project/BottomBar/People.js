import React, { useState } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { FILTER_TYPE_COMPARE } from '../../shared/CSharedConstants';
import { List } from "react-project/components/list/List";
import { SessionListItem } from "react-project/BottomBar/SessionListItem";
import { Button } from "react-project/components/button/Button";
import { When } from "react-project/Util/When";
import { SearchInput } from "../components/input/SearchInput";

import styles from "react-project/BottomBar/BottomBar.module.scss";

import { selectSessions, selectCompareMode } from "react-project/redux/analytics/selectors";
import { NoDataBlock } from "../components/noDataBlock/NoDataBlock";
import { selectFunnel } from "react-project/redux/funnels/selectors";

import { loadMoreSessionsAsync } from "react-project/redux/analytics/actions";
import { Loader } from "../components/loader/Loader";
import { TEXT_LOAD_MORE_USERS } from "react-project/Constants/texts";

const PeopleComponent = (props) => {
  const [propertySearchQuery, setPropertySearchQuery] = useState('');
  const sessions = props.sessions;
  const isCompare = props.type === FILTER_TYPE_COMPARE;
  const currentSessions = isCompare ? sessions.compareSessions : sessions.sessions;
  const currentSessionsMeta = isCompare ? sessions.compareMeta : sessions.meta;
  const filteredItems = currentSessions.filter(
    (p) =>
      !propertySearchQuery ||
      p.id.toLowerCase().includes(propertySearchQuery.toLowerCase())
  );
  const onLoadMoreSessions = () => {
    const {projectId} =  props.funnel;
    const last = currentSessions && currentSessions[currentSessions.length - 1];

    if (!projectId || !last) {
      return;
    }

    props.onLoadMoreSessions(projectId, last.intId, props.type === FILTER_TYPE_COMPARE);
  };

  return (
    <div className={!props.selectable ? styles.SectionWrapper : null}>
      <div>
        {!props.isSearchShowing ? (
          <b className={styles.SectionHeader}>People</b>
        ) : (
          <div className={styles.SectionSearch}>
            <SearchInput
              value={propertySearchQuery}
              onChange={(value) => {
                setPropertySearchQuery(value)}
              }
              placeholder="Search"
            />
          </div>
        )}

      </div>
      {props.compareModeEnabled && !props.selectable ? (
        <div className={styles.SessionsListWrapper}>
          <NoDataBlock text="No compare data available" />
        </div>
      ) : (
        <div className={styles.SessionsListWrapper}>
          <List
            items={filteredItems}
            renderHeader={() => (
              <div className={styles.ListHeader}>
                <div>
                  <span className={props.selectable ? styles.ColumnPadding : undefined}>
                    Country
                  </span>
                  <span className={styles.ColumnPadding}>Person</span>
                </div>
                <span>Last Seen</span>
              </div>
            )}
            renderItem={(item) => (
              <SessionListItem
                {...item}
                key={item.intId}
                selectable={props.selectable}
                isSelected={props.selectedSessionId === item.intId}
                toggleSelected={() => props.onSessionSelected(item)}
              />
            )}
          />
          <div className={styles.LoadMoreSessions}>
            <When condition={currentSessions.length >= currentSessionsMeta.count}>
              No more users to show
            </When>
            <When condition={currentSessions.length < currentSessionsMeta.count}>
              <Button
                className={styles.MediumButton}
                onClick={onLoadMoreSessions}
                disabled={props.sessions.isLoading}
              >
                {props.sessions.isLoading ? <Loader /> : TEXT_LOAD_MORE_USERS}
              </Button>
            </When>
          </div>
        </div>
      )}
    </div>
  );
};

const mapStateToProps = (state, ownProps) => ({
  sessions: selectSessions(state),
  funnel: selectFunnel(state, ownProps.funnelId),
  compareModeEnabled: selectCompareMode(state),
});

const mapDispatchToProps = (dispatch) => ({
  onLoadMoreSessions: (projectId, last, isCompare) => dispatch(loadMoreSessionsAsync(projectId, last, isCompare)),
});

PeopleComponent.propTypes = {
  funnelId: PropTypes.string.isRequired,
  funnel: PropTypes.shape({
    projectId: PropTypes.string.isRequired,
  }),
  sessions: PropTypes.shape({
    isLoading: PropTypes.bool.isRequired,
    sessions: PropTypes.arrayOf(
      PropTypes.shape({
        intId: PropTypes.number.isRequired,
      })
    ).isRequired,
    meta: PropTypes.shape({
      count: PropTypes.number.isRequired,
    }).isRequired,
    compareSessions: PropTypes.arrayOf(
      PropTypes.shape({
        intId: PropTypes.number.isRequired,
      })
    ).isRequired,
    compareMeta: PropTypes.shape({
      count: PropTypes.number.isRequired,
    }).isRequired,
  }),
  onLoadMoreSessions: PropTypes.func.isRequired,
  selectable: PropTypes.bool,
  isSearchShowing: PropTypes.bool,
  onSessionSelected: PropTypes.func,
  selectedSessionId: PropTypes.number,
};

export const People = connect(mapStateToProps, mapDispatchToProps)(PeopleComponent);
