export const selectAnalyticsStatus = state => state.analytics.status;

export const selectProfileCountries = state => state.analytics.profileAttributes.countries;

export const selectSessions = state => state.analytics.sessions;

export const selectSession = state => state.analytics.selectedSession;

export const selectCompareSession = state => state.analytics.selectedCompareSession;

export const selectApiKey = state => state.analytics.projectApiKey;

export const selectCompareMode = state => state.analytics.compareModeEnabled;
