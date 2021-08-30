import React, { useRef, useState } from "react";
import styles from "react-project/LeftSideBar/LeftSideBar.module.scss";
import filterStyles from 'react-project/FilterData/FilterData.module.scss';
import { iconPeople } from "react-project/assets/Icons";
import { When } from "react-project/Util/When";
import cls from "classnames";
import { ClickOutsideCustomComponent } from "react-project/Util/ClickOutsideCustom";
import { PeopleFilter } from "react-project/FilterData/PeopleFilter";
import PropTypes from "prop-types";
import { getDirtyStyle, getFilterAddClass } from "react-project/Util/FilterStyleHelper";
import { FILTER_ITEM_PADDING_WIDTH, HEADER_HEIGHT, LEFT_SIDEBAR_WIDTH } from 'shared/CSharedConstants';
import { hasScrollBar } from 'react-project/Util/hasScrollBar';
import { getRefPosition } from "react-project/Util/getRefPosiiton";
import { numSeparator } from 'shared/NumberHelpers';

export const PeopleFilterBlock = ({ selectedSession, funnel, onSelectSession, sessions, type }) => {
  const [peopleOpened, setPeopleOpened] = useState(false);

  const onSelect = (newSession) => {
    onSelectSession({
      session: !selectedSession || selectedSession.intId !== newSession.intId ? newSession : null,
    });
  };

  const ref = useRef();
  const position = getRefPosition(ref);
  const sidebar = document.getElementById('left-sidebar-wrapper');

  return (
    <ClickOutsideCustomComponent
      ignoreClickOutside={!peopleOpened}
      onClickOutside={() => setPeopleOpened(false)}
    >
      <div
        className={cls(styles.FiltersItem, getFilterAddClass(type), {
          [styles.ActiveFilter]: peopleOpened,
          [getDirtyStyle(type)]: selectedSession,
        })}
        ref={ref}
      >
        <div className={styles.ItemsForSelection} onClick={() => setPeopleOpened(!peopleOpened)}>
          <div>
            People:
            <span className={styles.CountriesTitle}>
              {selectedSession ? selectedSession.id : numSeparator(sessions.meta.count)}
            </span>
          </div>
          <div>{iconPeople}</div>
        </div>
        <When condition={peopleOpened && funnel}>
          <div
            className={cls(styles.FilterContainer, filterStyles.PeopleFilter)}
            style={{
              position: 'absolute',
              top: position.y - HEADER_HEIGHT,
              left: LEFT_SIDEBAR_WIDTH + (hasScrollBar(sidebar) ? 0 : FILTER_ITEM_PADDING_WIDTH),
              zIndex: 2,
            }}
          >
            <PeopleFilter
              selectedSessionId={selectedSession ? selectedSession.intId : null}
              onSessionSelected={onSelect}
              funnelId={funnel.id}
              type={type}
            />
          </div>
        </When>
      </div>
    </ClickOutsideCustomComponent>
  );
};

PeopleFilter.propType = {
  selectedSession: PropTypes.array.isRequired,
  funnel: PropTypes.shape({
    projectId: PropTypes.string.isRequired,
  }),
  onSelectSession: PropTypes.func.isRequired,
  sessions: PropTypes.array,
};
