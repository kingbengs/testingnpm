import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { RevenueActionSetup } from './revenue-action/RevenueActionSetup';
import { RevenueActionSettings } from './revenue-action/RevenueActionSettings';
import { When } from 'react-project/Util/When';
import {isAnalyticsInstalled} from '../../Util/ActionsDetector';
import { Loader } from '../../components/loader/Loader';
import { ViewportAllower } from "../../components/viewportAllower/ViewportAllower";
import styles from "react-project/Toolbar/Toolbar.module.scss";

const RevenueActionTrackingComponent = ({
  projectId,
  projectApiKey,
  currentStep,
  funnelConfiguration,
  updateProperties,
}) => {
  const [hasWorkspaceActions, setHasWorkspaceActions] = useState(false);
  const [hasWorkspaceActionsLoading, setHasWorkspaceActionsLoading] = useState(true);

  useEffect(() => {
    isAnalyticsInstalled(projectId).then(function(exists){
      setHasWorkspaceActionsLoading(false);
      setHasWorkspaceActions(exists);
    })

  }, [projectId]);

  return (
    <ViewportAllower position="relative" className={styles.StepToolbarSection}>
      <When condition={hasWorkspaceActionsLoading}>
        <Loader />
      </When>
      <When condition={!hasWorkspaceActionsLoading}>
        <When condition={hasWorkspaceActions}>
          <RevenueActionSettings
            projectId={projectId}
            currentStep={currentStep}
            funnelConfiguration={funnelConfiguration}
            updateProperties={updateProperties}
          />
        </When>
        <When condition={!hasWorkspaceActions}>
          <RevenueActionSetup apiKey={projectApiKey} />
        </When>
      </When>
    </ViewportAllower>
  );
};

RevenueActionTrackingComponent.propTypes = {
  projectApiKey: PropTypes.string,
  projectId: PropTypes.string.isRequired,
  currentStep: PropTypes.object.isRequired,
  funnelConfiguration: PropTypes.object.isRequired,
  updateProperties: PropTypes.func,
};

export const RevenueActionTracking = RevenueActionTrackingComponent;
