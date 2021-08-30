export const getLoginUrl = () => {
  return `${process.env.REACT_APP_CURRENT_APP_URL}/login`;
};

export const getWorkspaceFunnelsListUrl = (workspaceId) => {
  return `${process.env.REACT_APP_CURRENT_APP_URL}/dashboard/workspaces/${workspaceId}/funnels`;
};
