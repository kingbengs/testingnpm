export const dateFormatterToLocale = (rawDate) => {
  return new Date(rawDate).toLocaleDateString("en-US");
};

export const dateFormatter = (rawDate) => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(rawDate));
};
