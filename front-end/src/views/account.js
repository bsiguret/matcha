import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Grid, Icon, Loader, Segment } from 'semantic-ui-react';
import { ToastContainer } from 'react-toastify';
import '../stylesheets/account.scss'

import Header from '../layouts/header';
import AccountCard from '../components/accountCard';
import AccountEdit from '../components/accountEdit';
import AccountVisits from '../components/accountVisits';

import { userActions } from '../redux/actions/user';
import { authActions } from '../redux/actions/auth';

class Account extends Component {
	constructor(props) {
		super(props);
		this.state = {
			edit: false,
			loading: true,
			accountHeight: ''
		};

		this.resizeHandle = this.resizeHandle.bind(this);
		this.handleEdit = this.handleEdit.bind(this);

		window.addEventListener('resize', this.resizeHandle, false)
	}

	resizeHandle() {
		let height = window.innerHeight - document.getElementsByClassName('ui attached menu')[0].offsetHeight;
		this.setState({accountHeight: (height >= 1100 ? height : 1100)})
	}

	handleEdit() {
		if (this.state.edit === false)
			this.setState({ edit: true });
		else
			this.setState({ edit: false });
		this.resizeHandle()
	}

	getVisits = async () => {
    let token = this.props.token
    if (token) {
      let res = await this.props.dispatch(userActions.getVisits(token));
      if (res !== 200) {
        await this.props.dispatch(authActions.logoutUser());
			}
			return res
		}
  }

	componentDidMount = async () => {
		let res = await this.getVisits();
		if (res === 200) {
			this.setState({ loading: false})
			let height = window.innerHeight - document.getElementsByClassName('ui attached menu')[0].offsetHeight;
			this.setState({accountHeight: (height >= 1100 ? height : 1100)})
		}
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.resizeHandle);
	}

  render() {
		let { edit, loading, accountHeight } = this.state;
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
					<Header username={this.props.user.username} photos={this.props.photos}/>
				</div>}
				{loading &&
					<Loader active inline='centered'/>
				}
				{!loading &&
				<div className='o-account-wrapper' style={ {height: accountHeight } }>
					<div className="d-account">
						<Grid container columns='equal' stackable centered verticalAlign='middle' padded='vertically'>
							<Grid.Row centered verticalAlign='middle'>
								{!edit && this.props && this.props.userconnected && this.props.photos && Object.keys(this.props.user).length !== 3 &&
								<Grid.Column className='accountCard'>
									<Icon link onClick={this.handleEdit} className='o-editicon' name='edit'/>
									<AccountCard user={this.props.user} userconnected={this.props.userconnected} photos={this.props.photos}/>
								</Grid.Column>}
								{edit && this.props && this.props.photos && Object.keys(this.props.user).length !== 3 &&
								<Grid.Column className='accountEdit'>
									<Icon link onClick={this.handleEdit} className='o-closeedit' name='close'/>
									<AccountEdit user={this.props.user} token={this.props.token} photos={this.props.photos} dispatch={this.props.dispatch}/>
								</Grid.Column>}
								<Grid.Column className='o-segment-visits'>
									<Segment >
										<div className='accountVisits'>
											<AccountVisits visits={this.props.visits}/>
										</div>
									</Segment>
								</Grid.Column>
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
	photos: state.userReducer.user.photos,
	visits: state.userReducer.visits,
	token: state.authReducer.user
})

export default connect(mapStateToProps)(Account);