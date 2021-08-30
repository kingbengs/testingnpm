import { TrackerProfileType, TrackerSessionType } from './types';

export default (serializer) => {
  serializer.register(TrackerSessionType, {
    relationships: {
      profile: {
        type: TrackerProfileType
      }
    }
  });
};
