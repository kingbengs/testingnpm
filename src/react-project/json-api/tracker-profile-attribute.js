import { TrackerProfileAttributeType, TrackerProfileType } from './types';

export default (serializer) => {
  serializer.register(TrackerProfileAttributeType, {
    relationships: {
      profile: {
        type: TrackerProfileType
      }
    }
  });
};
