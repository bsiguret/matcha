import React, { Component } from 'react';
import { Card, Icon, Image, Label } from 'semantic-ui-react';
import { toast } from 'react-toastify';
import Slider from "react-slick";
import moment from 'moment';

import { userActions } from '../redux/actions/user';

function getAge(dateString) {
	var today = new Date();
	var birthDate = new Date(dateString);
	var age = today.getFullYear() - birthDate.getFullYear();
	var m = today.getMonth() - birthDate.getMonth();
	if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
			age--;
	}
	return age;
}

class MobileHomeCard extends Component {
	constructor(props) {
		super(props)
		this.state = {
			i: 0,
			len: 0,
			noResult: true
		}
	}

	handleHeart = async () => {
		if (!this.props.matchs[this.state.i].didLike) {
			let res = await this.props.dispatch(userActions.like(this.props.token, this.props.matchs[this.state.i].username, {love: '1'}));
			if (res.status !== 200)
				toast.error('An error happened', {position: toast.POSITION.TOP_RIGHT});
			else {
				// socket.emit('SERVER/ADD_LIKE', {
				// 	socketId: socket.id,
				// 	userId: this.props.userId,
				// 	likedId: this.props.matchs[this.state.i].username,
				// 	message: this.state.textArea
				// });
				toast.success(res.data.errMsg, {position: toast.POSITION.TOP_RIGHT});
			}
		}
		else {
			let res = await this.props.dispatch(userActions.like(this.props.token, this.props.matchs[this.state.i].username, {love: '0'}));
			if (res.status !== 200)
				toast.error('An error happened', {position: toast.POSITION.TOP_RIGHT});
			else {
				// socket.emit('SERVER/ADD_DISLIKE', {
				// 	socketId: socket.id,
				// 	userId: this.props.userId,
				// 	likedId: this.props.matchs[this.state.i].username,
				// 	message: this.state.textArea
				// });
				toast.success(res.data.errMsg, {position: toast.POSITION.TOP_RIGHT});
			}
		}
		this.handleNext()
	}

	handleNext = async () => {
		if (this.state.i + 1 < this.state.len) {
			this.setState({ i: this.state.i + 1 })
		}
		else
			this.setState({ noResult: true })
	}

	async componentDidMount() {
		await this.setState({len : Object.keys(this.props.matchs).length})
		if (this.state.len === 0)
			await this.setState({ noResult: true });
		else
		await this.setState({ noResult: false });
	}

	async componentWillUnmount() { await this.setState({len : 0, noResult: true }) }

	render () {
		const { noResult } = this.state
		const settings = {
      infinite: true,
      speed: 500,
      slidesToShow: 1,
			slidesToScroll: 1,
			responsive: [
        {
          breakpoint: 766,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
						infinite: true,
						arrows: true
					}
				}
			]
    };

		const Tags = ({tags}) => (
			<>
				{tags.map((tags, key)=> (
					<Label key={key}>
						{tags}
					</Label>
				))}
			</>
			);
		return (
		<div>
			{!noResult &&
			<div>
				<Icon size='big' link onClick={this.handleNext} color='red' className='o-home-mobile-close' name='close'/>
				<Icon size='big' link onClick={this.handleHeart} color='green' className='o-home-mobile-heart' name='heart' />
				<Card fluid className='ui-fluid-card-home'>
					<Slider {...settings} >
						{this.props.matchs[this.state.i].photos.map((photos, key) =>(<Image key={key} src={`/${photos.srcimg}`} fluid />))}
					</Slider>
					<Card.Content>
						<Card.Header>
							{this.props.matchs[this.state.i].firstname.charAt(0).toUpperCase() + this.props.matchs[this.state.i].firstname.slice(1)}
							{this.props.matchs[this.state.i].lastname.toUpperCase()}
							{getAge(moment(this.props.matchs[this.state.i].birthdate, "DD-MM-YYYY"))} years
						</Card.Header>
						<Card.Meta>
							<span className='occupation'>Student at 42</span>
						</Card.Meta>
						<Card.Meta>
							<span className='sex'>{this.props.matchs[this.state.i].orientation}, {this.props.matchs[this.state.i].gender}</span>
						</Card.Meta>
						<Card.Meta>
							<span className='online'>Offline - {moment(this.props.matchs[this.state.i].lastCon, 'DD-MM-YYYY, h:mm:ss').fromNow()}</span>	
						</Card.Meta>
						{this.props.matchs[this.state.i].bio.length >= 40 &&
						<Card.Description className='home-card-bio'>
							{this.props.matchs[this.state.i].bio.substring(0, 100 - 3)}
							{<a href={`/user/${this.props.matchs[this.state.i].username}`}>... More</a>}
						</Card.Description>}
						{this.props.matchs[this.state.i].bio.length < 40 &&
						<Card.Description>{this.props.matchs[this.state.i].bio}</Card.Description>}
					</Card.Content>
					<Card.Content>
						<Tags tags={this.props.matchs[this.state.i].tags} />
					</Card.Content>
					<Card.Content extra>
								<Icon name='heart' color='red'/>Score {this.props.matchs[this.state.i].score}
					</Card.Content>
				</Card>
			</div>}
			{noResult &&
			<div>
				<Card fluid className='home-mobile-noresult'>
					<Card.Content>
						<Card.Header style={{height: '300px'}}>
							<Icon size='massive' link color='red' className='o-home-mobile-fire' name='fire' />
						</Card.Header>
						<Card.Header>
							<span>There's no one new around you. Try to change filter...</span>
						</Card.Header>
					</Card.Content>
				</Card>
			</div>
			}
		</div>
		)
	}
}

export default (MobileHomeCard);