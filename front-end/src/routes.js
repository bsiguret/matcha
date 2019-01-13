import React, { Component } from 'react';
import { Router, Switch, Route } from "react-router-dom";
import { connect } from 'react-redux';
import { Loader } from 'semantic-ui-react';

import IndexPage from './views/index';
import AccountPage from './views/account';
import Page404 from './views/page404';
import Page500 from './views/page500';
import EmailConfirmPage from './views/emailConfirm';
import ProfileNotCompletedPage from './views/profileNotCompleted';
import MessagePage from './views/message';
import OAuthPage from './views/oauth';
import VisitsProfilePage from './views/visitsProfile';
import ResetPassPage from './views/resetPass';
import HomePage from './views/home';

import { userActions } from './redux/actions/user';
import { authActions } from './redux/actions/auth';

import { PrivateRoute } from './helpers/privateRoute';
import { PublicRoute } from './helpers/publicRoute';
import { VerifiedRoute } from './helpers/verifiedRoute';
import { history } from './helpers/history';

class Routes extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true
    }
  }
  getData = async () => {
    let token = JSON.parse(localStorage.getItem('user'));
    if (token) {
      let res = await this.props.dispatch(userActions.getUserData(token));
      if (res !== 200 && res !== 500) {
        await this.props.dispatch(authActions.logoutUser());
        this.setState({ loading: false})
      }
      else if (res === 500){
        history.push('/yourenotsupposedtobehere/500');
        this.setState({ loading: false})
      }
      return res
    }
  }

  componentDidMount = async () => {
    await this.getData();
    this.setState({ loading: false})
  }

  render() {
    const { loading } = this.state;
    return (
      <Router history={history}>
        <div>
          {loading &&
            <Loader active>Loading ...</Loader>
          }
          {!loading &&
          <Switch>
            <PublicRoute exact path="/" component={IndexPage} isAuth={this.props.isAuth} isVerified={this.props.isVerified} isCompleted={this.props.isCompleted}/>
            <PublicRoute path="/oauth/" component={OAuthPage} isAuth={this.props.isAuth} isVerified={this.props.isVerified} isCompleted={this.props.isCompleted}/>
            <PublicRoute path="/emailconfirm/:username/:token" component={EmailConfirmPage} isAuth={this.props.isAuth} isVerified={this.props.isVerified} isCompleted={this.props.isCompleted}/>
            <PublicRoute path="/resetpass/:username/:token" component={ResetPassPage} isAuth={this.props.isAuth} isVerified={this.props.isVerified} isCompleted={this.props.isCompleted}/>
            <VerifiedRoute path="/profile-not-completed" component={ProfileNotCompletedPage} isAuth={this.props.isAuth} isVerified={this.props.isVerified} isCompleted={this.props.isCompleted}/>
            <PrivateRoute path="/home" component={HomePage} isAuth={this.props.isAuth} isVerified={this.props.isVerified} isCompleted={this.props.isCompleted}/>
            <PrivateRoute path="/account" component={AccountPage} isAuth={this.props.isAuth} isVerified={this.props.isVerified} isCompleted={this.props.isCompleted}/>
            <PrivateRoute path="/user/:username" component={VisitsProfilePage} isAuth={this.props.isAuth} isVerified={this.props.isVerified} isCompleted={this.props.isCompleted}/>
            <PublicRoute path="/message" component={MessagePage} isAuth={this.props.isAuth} isVerified={this.props.isVerified} isCompleted={this.props.isCompleted}/>
            <Route path='/yourenotsupposedtobehere/500' component={Page500} />
            <Route component={Page404} />
          </Switch>}
        </div>
      </Router>
    )
  }
}

const mapStateToProps = state => ({
  isAuth: state.authReducer.isAuth,
  isVerified: state.userReducer.user.isVerified,
  isCompleted: state.userReducer.user.isCompleted,
  user: state.userReducer.user,
});

const connectedApp = connect(mapStateToProps)(Routes);
export { connectedApp as Routes };