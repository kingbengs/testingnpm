export function numSeparator(value, separator = ",") {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
}
