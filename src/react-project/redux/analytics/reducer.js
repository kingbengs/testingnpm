import { produce } from 'immer';
import { handleActions } from 'redux-actions';
import unionBy from 'lodash/unionBy';

import { ANALYTICS_STATUS_SUCCESS } from 'shared/CSharedConstants';
import {
  updateStatus,
  updateProfileCountries,
  refreshSessions,
  insertSessions, 
  insertCompareSessions,
  updateSessionsLoadingStatus,
  setProjectApiKey,
  setCompareMode,
  refreshCompareSessions,
  setSelectedSession,
  setSelectedCompareSession,
} from './actions';

const initialState = {
  status: ANALYTICS_STATUS_SUCCESS,
  attributeExplorerStatus: ANALYTICS_STATUS_SUCCESS,
  projectApiKey: null,
  profileAttributes: {
    countries: [],
  },
  sessions: {
    sessions: [],
    meta: {
      count: 0,
    },
    compareSessions: [],
    compareMeta: {
      count: 0
    },
    isLoading: false,
  },
  selectedSession: null,
  selectedCompareSession: null,
  compareModeEnabled: false
};

export default handleActions(
  {
    [updateStatus.toString()]: (state, action) =>
      produce(state, (draft) => {
        draft.status = action.payload;
      }),
    [updateProfileCountries.toString()]: (state, action) =>
      produce(state, (draft) => {
        draft.profileAttributes.countries = action.payload;
      }),
    [updateSessionsLoadingStatus.toString()]: (state, action) =>
      produce(state, (draft) => {
        draft.sessions.isLoading = action.payload;
      }),
    [refreshSessions.toString()]: (state, action) =>
      produce(state, (draft) => {
        draft.sessions.sessions = action.payload.sessions;
        draft.sessions.meta = action.payload.meta;
      }),
    [refreshCompareSessions.toString()]: (state, action) =>
      produce(state, (draft) => {
        draft.sessions.compareSessions = action.payload.sessions;
        draft.sessions.compareMeta = action.payload.meta;
      }),
    [insertSessions.toString()]: (state, action) =>
      produce(state, (draft) => {
        draft.sessions.sessions = unionBy(
          draft.sessions.sessions,
          action.payload.sessions,
          'intId'
        );
        draft.sessions.meta = action.payload.meta;
      }),
    [insertCompareSessions.toString()]: (state, action) =>
      produce(state, (draft) => {
        draft.sessions.compareSessions = unionBy(
          draft.sessions.compareSessions,
          action.payload.sessions,
          'intId'
        );
        draft.sessions.compareMeta = action.payload.meta;
      }),
    [setProjectApiKey.toString()]: (state, action) =>
      produce(state, (draft) => {
        draft.projectApiKey = action.payload;
      }),
    [setCompareMode.toString()]: (state, action) =>
      produce(state, (draft) => {
        draft.compareModeEnabled = action.payload;
      }),
    [setSelectedSession.toString()]: (state, action) =>
      produce(state, (draft) => {
        draft.selectedSession = action.payload.session;
      }),
    [setSelectedCompareSession.toString()]: (state, action) =>
      produce(state, (draft) => {
        draft.selectedCompareSession = action.payload.session;
      }),
  },
  initialState
);
