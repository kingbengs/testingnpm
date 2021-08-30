import React from 'react';

import PropTypes from 'prop-types';

import { People } from 'react-project/BottomBar/People';

const PeopleFilterComponent = (props) => {
  return (
    <People
      funnelId={props.funnelId}
      selectable={true}
      onSessionSelected={props.onSessionSelected}
      selectedSessionId={props.selectedSessionId}
      isSearchShowing={true}
      type={props.type}
    />
  );
};

PeopleFilterComponent.propTypes = {
  funnelId: PropTypes.string.isRequired,
  selectedSessionId: PropTypes.number,
  onSessionSelected: PropTypes.func.isRequired
};

export const PeopleFilter = PeopleFilterComponent;
