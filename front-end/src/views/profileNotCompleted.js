import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Grid, Loader } from 'semantic-ui-react';
import { ToastContainer } from 'react-toastify';
import '../stylesheets/account.scss'

import Header from '../layouts/header';
import AccountEdit from '../components/accountEdit';

class ProfileNotCompletedPage extends Component {

  render() {
    return (
			<div style={{ touchAction: 'manipulation' }}>
				<ToastContainer
					position="top-right"
					autoClose={3000}
					hideProgressBar={false}
					newestOnTop
					closeOnClick
					rtl={false}
					pauseOnVisibilityChange
					draggable
					pauseOnHover
				/>
				{!this.props && Object.keys(this.props.user).length === 3 &&
					<Loader active inline='centered' />
				}
				{this.props && Object.keys(this.props.user).length !== 3 &&
				<div className="header">
					<Header username={this.props.user.username} photos={this.props.photos}/>
				</div>}
				<div className="d-account">
					<Grid container columns='equal' stackable centered verticalAlign='middle' padded='vertically'>
						<Grid.Row>
						{this.props && Object.keys(this.props.user).length !== 3 &&
							<Grid.Column className='accountEdit'>
									<AccountEdit user={this.props.user} token={this.props.token} photos={this.props.photos} dispatch={this.props.dispatch}/>
							</Grid.Column>}
						</Grid.Row>
					</Grid>
				</div>
			</div>
		)
  }
}

const mapStateToProps = state => ({
	user: state.userReducer.user,
	token: state.authReducer.user,
	photos: state.userReducer.user.photos,
})

export default connect(mapStateToProps)(ProfileNotCompletedPage);