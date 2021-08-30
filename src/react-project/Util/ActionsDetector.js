import RequestService from "react-project/Helpers/RequestService";

const requestService = new RequestService();

const generateKeyForActionsExistsParam = (projectId) =>
  `are-workspace-actions-detected:${projectId}`;

const checkCacheAnalyticsIsInstalled = (projectId) => {
  const actionsKey = generateKeyForActionsExistsParam(projectId);
  return Boolean(localStorage.getItem(actionsKey));
};

const setCacheAnalyticsInstalled = (projectId, hasCode) => {
  const actionsKey = generateKeyForActionsExistsParam(projectId);

  if (hasCode) {
    //TODO: consider to introduce the separate helper for localStorage
    localStorage.setItem(actionsKey, "true");
  }
};

export const isAnalyticsInstalled = async (projectId) => {
  const isCacheInstalled = checkCacheAnalyticsIsInstalled(projectId);

  if (isCacheInstalled) {
    return isCacheInstalled;
  } else {
    const hasCode = await requestService.checkActionsExist(projectId);
    setCacheAnalyticsInstalled(projectId, hasCode);
    return hasCode;
  }
};
