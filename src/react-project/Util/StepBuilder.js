import { EElementTypes } from 'shared/CSharedCategories';

const GENERIC_TRAFFIC_ICON = 'StepsModal/Sources/trafficicon.png';
const UTM_KEYS = ['source', 'medium', 'campaign', 'content', 'term'];

export const buildGeneralTrafficStep = (attributeKey, attributeValue) => {
  const label = `${attributeKey}=${attributeValue || '*'}`;

  let filterData;
  let utmData;

  const utmKey = UTM_KEYS.find(k => `utm_${k}` === attributeKey);

  if (utmKey && attributeValue) {
    utmData = {
      [utmKey]: attributeValue
    };
  }
  else {
    filterData = [{ key: attributeKey, value: attributeValue,  contains: "true" }];
  }

  return {
    src: GENERIC_TRAFFIC_ICON,
    title: label,
    type: EElementTypes.SOURCE,
    filterData,
    utmData,
  };
};
