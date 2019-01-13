import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Segment, Menu, Card, Icon } from 'semantic-ui-react';
import { ToastContainer } from 'react-toastify';
import '../stylesheets/home.scss'

import Header from '../layouts/header';
import HomeCard from '../components/homeCard';
import HomeFilter from '../components/homeFilter';
import MDSpinner from "react-md-spinner";

import { userActions } from '../redux/actions/user';
import HomeMatchs from '../components/homeMatch';
import MobileHomeCard from '../components/mobileHomeCard';
import { authActions } from '../redux/actions/auth';

class HomePage extends Component {
	constructor(props) {
		super(props);
		this.state = {
			edit: false,
			loading: true,
			homeHeight: '',
			isMobile: '',
			activeItem: 'match',
			user: ''
		};
		
		this.resizeHandle = this.resizeHandle.bind(this);
		window.addEventListener('resize', this.resizeHandle, false)
	}

	resizeHandle() {
		let height = window.innerHeight - document.getElementsByClassName('ui attached menu')[0].offsetHeight;
		let isMobile = (window.innerWidth > 766 ? false : true)
		this.setState({homeHeight: (height >= 1000 ? height : 1000), isMobile})
	}

	handleItemClick = (e, { name }) => this.setState({ activeItem: name })
	
	handleSpinner (bool) {
		this.setState({
			loading: bool
		})
	}

	handleLike(bool, score) {
		this.setState({
			user: {
				...this.state.user,
				didLike: bool,
				score: score
			}
		})
	}

	handleSearchCard(user, arrayId) {
		this.setState({
			user: user,
			arrayId: arrayId
		})
	}

	async componentDidMount() {
		let height = window.innerHeight - document.getElementsByClassName('ui attached menu')[0].offsetHeight;
		let isMobile = (window.innerWidth > 766 ? false : true)
		this.setState({homeHeight: (height >= 1000 ? height : 1000), isMobile})
		let res = await this.props.dispatch(userActions.getMatch(this.props.token));
		if (res.status === 200)
			this.setState({ loading: false })
		else if (res.data === 'Unauthorized') {
			this.props.dispatch(authActions.logoutUser());
		}
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.resizeHandle);
	}

  render() {
		let { homeHeight, activeItem, isMobile, loading } = this.state;
		if (isMobile) {
			return(
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
					<div className="header">
						<Header username={this.props.user.username} photos={this.props.photos}/>
					</div>
					<Segment>
						<Menu attached='top' tabular>
							<Menu.Item name='match' active={activeItem === 'match'} onClick={this.handleItemClick} />
							<Menu.Item position='right' name='filter' active={activeItem === 'filter'} onClick={this.handleItemClick} />
						</Menu>
						{activeItem === 'match' &&
						<Segment attached='bottom' style={{ overflow: 'auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-evenly' }}>
							{loading &&
							<div className='home-spinner'>
								<MDSpinner />
							</div>}
							{!loading && this.props.userconnected && this.props.matchs &&
							<div className='mobileSearchCard'>
								<MobileHomeCard dispatch={this.props.dispatch} userconnected={this.props.userconnected} matchs={this.props.matchs} token={this.props.token}/>
							</div>}
						</Segment>}
						{activeItem === 'filter' && !this.props.matchs &&
						<Segment attached='bottom'>
							<HomeFilter dispatch={this.props.dispatch} spinner={this.handleSpinner.bind(this)} token={this.props.token} />
						</Segment>}
						{activeItem === 'filter' && this.props.matchs &&
						<Segment attached='bottom'>
							<HomeFilter results={this.props.matchs.length} dispatch={this.props.dispatch} spinner={this.handleSpinner.bind(this)} token={this.props.token} />
						</Segment>}
					</Segment>
				</div>
			)
		}
		else {
			return (
				<div>
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
					<div className="header">
						<Header username={this.props.user.username} photos={this.props.photos}/>
					</div>
					<div className='o-home-wrapper' style={ {height: homeHeight } }>
						<div className='o-leftHome'>
							{!this.props.matchs &&
							<Segment>
								<HomeFilter dispatch={this.props.dispatch} spinner={this.handleSpinner.bind(this)} token={this.props.token} />
							</Segment>}
							{this.props.matchs &&
							<Segment>
								<HomeFilter results={this.props.matchs.length} dispatch={this.props.dispatch} spinner={this.handleSpinner.bind(this)} token={this.props.token} />
							</Segment>}
							<Segment className='home-card'>
								{!this.state.user &&
								<div className='home-spinner'>
									<Card fluid className='home-mobile-noresult'>
										<Card.Content>
											<Card.Header style={{height: '300px'}}>
												<Icon size='massive' color='red' className='o-home-mobile-fire' name='fire' />
											</Card.Header>
											<Card.Header>
												<span>Click on a profile !</span>
											</Card.Header>
										</Card.Content>
									</Card>
								</div>}
								{this.state.user && this.props.userconnected &&
								<HomeCard dispatch={this.props.dispatch} me={this.props.user} userconnected={this.props.userconnected} handleLike={this.handleLike.bind(this)} user={this.state.user} arrayId={this.state.arrayId} photos={this.state.user.photos} token={this.props.token}/>}							
							</Segment>
						</div>
						<div className='o-rightHome' >
							<Segment style={{ height: '968.13px', overflow: 'auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-evenly' }}>
								{loading &&
								<div className='home-spinner'>
									<MDSpinner />
								</div>}
								{!loading && this.props.matchs && this.props.userconnected &&
								<HomeMatchs matchs={this.props.matchs} userconnected={this.props.userconnected} openCard={this.handleSearchCard.bind(this)}/>
								}
							</Segment>
						</div>
					</div>
				</div>
			)
		}
  }
}

const mapStateToProps = state => ({
	user: state.userReducer.user,
	userconnected: state.userReducer.userconnected,
	matchs: state.userReducer.matchs,
	photos: state.userReducer.user.photos,
	token: state.authReducer.user
})

export default connect(mapStateToProps)(HomePage);