import JSONAPISerializer from 'json-api-serializer';

import registerTrackerSession from  './tracker-session';
import registerTrackerProfile from  './tracker-profile';
import registerTrackerProfileAttribute from  './tracker-profile-attribute';

const serializer = new JSONAPISerializer();

registerTrackerSession(serializer);
registerTrackerProfile(serializer);
registerTrackerProfileAttribute(serializer);

export default serializer;
