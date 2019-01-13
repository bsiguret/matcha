import React from 'react';
import { Redirect, Route } from 'react-router-dom';

export const VerifiedRoute = ({ component: Component, isAuth, isVerified, isCompleted, ...rest }) => (
  <Route
    {...rest}
    render={props =>
      isAuth === true && isVerified === 1 && isCompleted === 0 ? (
        <Component {...props}/>
      ) : (
        <Redirect to='/' />
      )
    }
  />
);
export default VerifiedRoute;