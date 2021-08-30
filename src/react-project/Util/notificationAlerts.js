const KEY_STORAGE = "alert-blocked";

export const getBlockStorage = () => {
  return JSON.parse(localStorage.getItem(KEY_STORAGE)) || [];
};

export const pushToBlockStorage = (alert) => {
  const alertBlocked = getBlockStorage();
  alertBlocked.push(alert);
  localStorage.setItem(KEY_STORAGE, JSON.stringify(alertBlocked));
};
