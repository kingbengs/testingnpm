export default function addValue(map, values) {
  values.map((element) => {
    map[element] = element;
    return element;
  });
}
