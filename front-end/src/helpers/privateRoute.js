import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { connect } from 'react-redux';
import MessageWidget from '../components/messagewidget';

export const PrivateRoute = ({ component: Component, isAuth, isVerified, isCompleted, ...rest }) => (
  <Route
    {...rest}
    render={props =>
      isAuth === true && isVerified === 1 && isCompleted === 1 ? (
        <div>
          <Component {...props}/>
          <MessageWidget />
        </div>
      ) : (
        <Redirect to='/' />
      )
    }
  />
);
export default connect()(PrivateRoute);