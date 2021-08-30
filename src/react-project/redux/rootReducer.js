import { combineReducers } from 'redux';

import funnelConfiguration from './funnel-configuration/reducer';
import funnelRevisions from './funnel-revisions/reducer';
import currentStep from './current-step/reducer';
import focusedStep from './focused-step/reducer';
import analytics from './analytics/reducer';
import explorer from './explorer/reducer';
import funnels from './funnels/reducer';
import filters from './filters/reducer';
import inputs from './inputs/reducer';
import auth from './auth/reducer';
import user from './user/reducer';
import notificationAlerts from './notification-alerts/reducer';

export default combineReducers({
  funnelConfiguration,
  funnelRevisions,
  currentStep,
  focusedStep,
  analytics,
  explorer,
  funnels,
  filters,
  inputs,
  user,
  auth,
  notificationAlerts
});
