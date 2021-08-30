import { handleAction } from 'redux-actions';
import { produce } from 'immer';
import { parseAuthCookie } from 'react-project/Util/AuthCookie';

import { clean } from './actions';

const getInitialState = () => {
  const parsedCookie = parseAuthCookie();

  if (!parsedCookie) {
    return {
      isAuthenticated: false,
      userId: undefined
    };
  }

  const isAuthenticated = Boolean(parsedCookie.id) && Boolean(parsedCookie.accessToken);

  return {
    isAuthenticated,
    userId: isAuthenticated ? parsedCookie.id : undefined
  };
};

const initialState = getInitialState();

export default handleAction(
  clean.toString(),
  state => produce(state, draft => {
    draft.isAuthenticated = false;
    draft.userId = undefined;
  }),
  initialState
);
