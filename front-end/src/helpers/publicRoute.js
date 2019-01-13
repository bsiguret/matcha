import React from 'react';
import { Redirect, Route } from 'react-router-dom';

export const PublicRoute = ({ component: Component, isAuth, isVerified, isCompleted, ...rest }) => (
  <Route
    {...rest}
    render={props =>
      isAuth === true ? (
        isVerified === 1 ? (
          isCompleted === 1 ? (
				    <Redirect to='/home' />
          ) : (
            <Redirect to='/profile-not-completed' />
          )
        ) : (
          <Redirect to='/' />
        )
      ) : (
				<Component {...props}/>
      )
    }
  />
);
export default PublicRoute;