export const getRefPosition = (ref) => {
  if (ref && ref.current) {
    return ref.current.getBoundingClientRect();
  }

  return { x: 0, y: 0, width: 0 };
};
