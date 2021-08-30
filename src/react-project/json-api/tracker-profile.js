import { TrackerProfileAttributeType, TrackerProfileType, TrackerSessionType } from './types';

export default (serializer) => {
  serializer.register(TrackerProfileType, {
    relationships: {
      sessions: {
        type: TrackerSessionType
      },
      attrs: {
        type: TrackerProfileAttributeType
      }
    }
  });
};
