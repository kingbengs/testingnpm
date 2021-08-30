import isString from 'lodash/isString';
import URI from 'urijs';

function normalizeUrl(parsed) {
  parsed.normalize();
  parsed.protocol('');
  parsed.search('');
  parsed.hash('');

  let result = parsed.toString().slice(2);
  if (result.slice(result.length - 1) !== '/') {
    result += '/';
  }

  return result;
}

function cleanUrl(url) {
  if (!url || url === 'null' || !isString(url)) {
    return null;
  }
  let clean = url.trim();
  if (clean.search(/^http[s]?:\/\//i) === -1) {
    clean = `http://${url}`;
  }

  return clean;
}

const needsSubdomain = parsed => (!parsed.subdomain() && normalizeUrl(parsed).slice(0, 4) !== 'www.');

export const parseURL = (inputUrl) => {
  const url = cleanUrl(inputUrl);
  if (!url) {
    return null;
  }

  const checkOnly = new URI(url);
  const parsedResult = new URI(url);

  if (needsSubdomain(checkOnly)) {
    parsedResult.subdomain('www');
  }

  return normalizeUrl(parsedResult);
}
