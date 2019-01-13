import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Grid, Icon, Loader } from 'semantic-ui-react';
import { ToastContainer, toast } from 'react-toastify';
import '../stylesheets/account.scss'

import Header from '../layouts/header';
import AccountCard from '../components/accountCard';

import { userActions } from '../redux/actions/user';
import { authActions } from '../redux/actions/auth';

import { history } from '../helpers/history';
import { socket } from '../socket/socket';


class VisitsProfilePage extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: true,
			accountHeight: ''
		};

		this.resizeHandle = this.resizeHandle.bind(this);
		this.handleHeart = this.handleHeart.bind(this);
	}

	resizeHandle() {
		let height = window.innerHeight - document.getElementsByClassName('ui attached menu')[0].offsetHeight;
		this.setState({accountHeight: (height >= 1003 ? height : 1003)})
	}

	handleHeart = async () => {
		if (!this.props.profile.didLike) {
			let res = await this.props.dispatch(userActions.like(this.props.token, this.props.match.params.username, {love: '1'}));
			if (res.status !== 200)
				this.props.dispatch(authActions.logoutUser())
			else {
				socket.emit('SERVER/ADD_LIKE', {
					username: this.props.user.username,
					user1Id: this.props.user.id,
					user2Id: this.props.profile.id,
				});
				toast.success(res.data.errMsg, {position: toast.POSITION.TOP_RIGHT});
				document.querySelector(".o-hearticon").classList.add("pulse");
			}
		}
		else {
			let res = await this.props.dispatch(userActions.like(this.props.token, this.props.match.params.username, {love: '0'}));
			if (res.status !== 200)
				this.props.dispatch(authActions.logoutUser())
			else {
				socket.emit('SERVER/ADD_DISLIKE', {
					username: this.props.user.username,
					user1Id: this.props.user.id,
					user2Id: this.props.profile.id,
				});
				toast.success(res.data.errMsg, {position: toast.POSITION.TOP_RIGHT});
				document.querySelector(".o-hearticon").classList.remove("pulse");
			}
		}
	}

	getProfile = async (username) => {
    let token = JSON.parse(localStorage.getItem('user'));
    if (token) {
			var res = await this.props.dispatch(userActions.getProfile(token, username));
      if (res.status !== 200 && res.data === 'Unauthorized') {
				await this.props.dispatch(authActions.logoutUser());
			}
			else if (res.status !== 200){
				history.push('/account')
				toast.error(res.data.errMsg, {position: toast.POSITION.TOP_RIGHT});
			}
		}
		return res;
  }

	componentDidMount = async () => {
		if (this.props.user.username.toLowerCase() === this.props.match.params.username)
			history.push('/account')
		else {
			let res = await this.getProfile(this.props.match.params.username);
			if (res.status === 200) {
				socket.emit('SERVER/ADD_VISIT', {
					username: this.props.user.username,
					user1Id: this.props.user.id,
					user2Id: this.props.profile.id,
				});
				this.setState({ loading: false})
				let height = window.innerHeight - document.getElementsByClassName('ui attached menu')[0].offsetHeight;
				this.setState({accountHeight: (height >= 914.5 ? height : 914.5)})
			}
		}
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.resizeHandle);
	}

  render() {
		let { loading, accountHeight } = this.state;
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
				{!loading && this.props && Object.keys(this.props.user).length !== 3 &&
				<div className="header">
					<Header username={this.props.user.username} photos={this.props.user.photos}/>
				</div>}
				{loading &&
					<Loader active inline='centered'/>
				}
				{!loading && this.props.userconnected &&
				<div className='o-account-wrapper' style={ {height: accountHeight } }>
					<div className="d-account">
						<Grid container columns='equal' stackable centered verticalAlign='middle' padded='vertically'>
							<Grid.Row centered verticalAlign='middle'>
								{this.props && this.props.profile && Object.keys(this.props.profile).length !== 0 &&
								<Grid.Column className='accountCard'>
									{this.props.profile.didLike && 
									<Icon size='big' link onClick={this.handleHeart} color='red' className='o-hearticon' name='heart'/>}
									{!this.props.profile.didLike &&
										<Icon size='big' link onClick={this.handleHeart} color='red' className='o-hearticon' name='heart outline'/>}
									<AccountCard dispatch={this.props.dispatch} userconnected={this.props.userconnected} user={this.props.profile} token={this.props.token} photos={this.props.profile.photos} visits={true}/>
								</Grid.Column>}
							</Grid.Row>
						</Grid>
					</div>
				</div>}
			</div>
		)
  }
}

const mapStateToProps = state => ({
	user: state.userReducer.user,
	userconnected: state.userReducer.userconnected,
	profile: state.userReducer.profile,
	visits: state.userReducer.visits,
	token: state.authReducer.user
})

export default connect(mapStateToProps)(VisitsProfilePage);