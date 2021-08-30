export const ActionNames = {
  updateStatus: '@analytics/UPDATE_STATUS',
  updateProfileCountries: '@analytics/UPDATE_PROFILE_COUNTRIES',
  refreshSessions: '@analytics/UPDATE_SESSIONS',
  refreshCompareSessions: '@analytics/UPDATE_COMPARE_SESSIONS',
  insertSessions: '@analytics/INSERT_SESSIONS',
  insertCompareSessions: '@analytics/INSERT_COMPARE_SESSIONS',
  updateSessionsLoadingStatus: '@analytics/UPDATE_SESSIONS_LOADING_STATUS',
  setProjectApiKey: '@analytics/SET_PROJECT_API_KEY',
  setCompareMode: '@analytics/SET_COMPARE_MODE',
  setSelectedSession: "@analytics/SET_SELECTED_SESSION",
  setSelectedCompareSession: "@analytics/SET_SELECTED_COMPARE_SESSION",

  clean: '@auth/clean',

  setThumbnailIsLoading: "@current-step/SET_THUMBNAIL_IS_LOADING",
  setAttributeExplorerData: '@current-step/SET_ATTRIBUTE_EXPLORER_DATA',
  setNewCurrentStepLabel: "@current-step/SET_NEW_CURRENT_STEP_LABEL",
  setNewCurrentStepUrl: "@current-step/SET_NEW_CURRENT_STEP_URL",
  setNewCurrentStep: "@current-step/SET_NEW_CURRENT_STEP",
  setNewCurrentStepFilterParams: "@current-step/SET_NEW_CURRENT_STEP_FILTER_PARAMS",
  setNewCurrentStepUtmData: "@current-step/SET_NEW_CURRENT_STEP_UTM_DATA",
  setNewCurrentStepTrackingUrl: "@current-step/SET_NEW_CURRENT_STEP_TRACKING_URL",

  setExplorerPageParameters: '@explorer/SET_EXPLORER_PAGE_PARAMETERS',
  setExplorerItemsConfig: '@explorer/SET_EXPLORER_ITEMS_CONFIG',
  setExplorerPageNumber: '@explorer/SET_EXPLORER_PAGE_NUMBER',
  setExplorerLoadingStatus: '@explorer/SET_EXPLORER_LOADING_STATUS',

  setFilter: '@filters/SET_FILTER',
  setApplyButtonEnabled: '@filters/SET_APPLY_BUTTON_STATUS',

  updateDefaultFocusedStep: "@focused-step/UPDATE_DEFAULT_STEP",
  updateCompareFocusedStep: "@focused-step/UPDATE_COMPARE_STEP",

  updateStepFocusingId: '@funnel-configuration/SET_STEP_FOCUSING_ID',
  updateStepCompareFocusingId: '@funnel-configuration/SET_STEP_COMPARE_FOCUSING_ID',
  updateDataRange: '@funnel-configuration/SET_NEW_DATE_RANGE',
  updateCompareDataRange: '@funnel-configuration/SET_COMPARE_DATE_RANGE',
  updateFilterData: '@funnel-configuration/SET_FILTER_DATA',
  updateCompareFilterData: '@funnel-configuration/SET_COMPARE_FILTER_DATA',
  setCompareFilterStatus: '@funnel-configuration/SET_COMPARE_FILTER_STATUS',
  setPanningActive: '@funnel-configuration/SET_PANNING_ACTIVE',
  setNewFunnelConfiguration: '@funnel-configuration/SET_NEW_FUNNEL_CONFIGURATION',

  updateFunnelRevisions: "@funnel-revisions/UPDATE_REVISIONS",
  updateFunnelRevisionsMeta: "@funnel-revisions/UPDATE_REVISIONS_META",
  updateFunnelMoreRevisions: "@funnel-revisions/UPDATE_MORE_REVISIONS",
  updateFunnelRevisionsIsLoading: "@funnel-revisions/UPDATE_REVISIONS_IS_LOADING",

  updateFunnel: '@funnel/UPDATE',
  updateIsFunnelLoading: '@funnel/UPDATE_IS_FUNNEL_LOADING',

  setInputValue: "@inputs/SET_INPUT_VALUE",
  addLastInputValue: "@inputs/ADD_LAST_INPUT_VALUE",
  clearInputsState: "@inputs/CLEAR_INPUTS_STATE",

  setPermission: "@user/SET_PERMISSION",
  setEmail: "@user/SET_EMAIL",  

  setPanGuideStatus: "@notification-alerts/SET_PAN_GUIDE_STATUS",  
  setPerfectShapeGuideStatus: "@notification-alerts/SET_PERFECT_SHAPE_GUIDE_STATUS",  
  setUpdateCanvasDataStatus: "@notification-alerts/SET_UPDATE_CANVAS_DATA_STATUS",  
};
