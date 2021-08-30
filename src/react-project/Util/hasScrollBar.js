export const hasScrollBar = (element) => {
  if (element && element.scrollHeight > element.clientHeight) {
    return true;
  }

  return false;
};
