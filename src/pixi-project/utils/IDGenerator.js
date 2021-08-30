// Taken from https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid
function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    // eslint-disable-next-line
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
}

/**
 * Generator that retrieves a unique UUID
 * @returns {Generator<*, void, *>}
 */
function* yieldId() {
  yield uuidv4();
}

/**
 * Generates a unique UUID. Is used to generate Ids for all elements
 * @returns {*}
 */
export default function generateId() {
  return yieldId().next().value;
}
