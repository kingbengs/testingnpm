import React, { createContext } from "react";
import { connect } from 'react-redux';
import { logout as logoutAction} from 'react-project/redux/auth/actions';
import { selectAuth } from "../redux/auth/selectors";

export const authContext = createContext('auth');

const AuthProvider = ({ children, auth, logout }) => {
  return (
    <authContext.Provider value={{auth, logout}}>
      {children}
    </authContext.Provider>
  );
};

const mapStateToProps = state => ({
  auth: selectAuth(state),
});

const mapDispatchToProps = dispatch => ({
  logout: () => dispatch(logoutAction())
});

export default connect(mapStateToProps, mapDispatchToProps)(AuthProvider);
