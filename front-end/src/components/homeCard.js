import React, { Component } from 'react';
import { Card, Icon, Image, Label } from 'semantic-ui-react';
import { toast } from 'react-toastify';
import Slider from "react-slick";
import moment from 'moment';

import { userActions } from '../redux/actions/user';
import { authActions } from '../redux/actions/auth';
import { socket } from '../socket/socket';

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

class HomeCard extends Component {
	constructor(props) {
		super(props)
		this.state = {
			blocked: this.props.user.blocked,
		}
	}

	handleHeart = async () => {
		if (!this.props.user.didLike) {
			let res = await this.props.dispatch(userActions.like(this.props.token, this.props.user.username, {love: '1'}, this.props.arrayId));
			if (res.status !== 200)
				this.props.dispatch(authActions.logoutUser())
			else {
				socket.emit('SERVER/ADD_LIKE', {
					username: this.props.me.username,
					user1Id: this.props.me.id,
					user2Id: this.props.user.id,
				});
				this.props.handleLike(true, this.props.user.score + 2)
				toast.success(res.data.errMsg, {position: toast.POSITION.TOP_RIGHT});
				document.querySelector(".o-hearticon").classList.add("pulse");
			}
		}
		else {
			let res = await this.props.dispatch(userActions.like(this.props.token, this.props.user.username, {love: '0'}, this.props.arrayId));
			if (res.status !== 200) {
				this.props.dispatch(authActions.logoutUser())
			}
			else {
				if (this.props.user.score !== 0)
					this.props.handleLike(false, this.props.user.score - 2)
				else
					this.props.handleLike(false, this.props.user.score)
				socket.emit('SERVER/ADD_DISLIKE', {
					username: this.props.me.username,
					user1Id: this.props.me.id,
					user2Id: this.props.user.id,
				});
				toast.success(res.data.errMsg, {position: toast.POSITION.TOP_RIGHT});
				document.querySelector(".o-hearticon").classList.remove("pulse");
			}
		}
	}

	isConnected = (userconnected, id) => {
    for (let index = 0; index < userconnected.length; index++) {
      if (userconnected[index].userid === id)
        return true
    }
    return false
  }
	
	render () {
		const { firstname, lastname, gender, distance, orientation, birthdate, score, bio, tags, lastCon, username, id } = this.props.user
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
			{this.props.user.didLike && 
			<Icon size='big' link onClick={this.handleHeart} color='red' className='o-hearticon' name='heart'/>}
			{!this.props.user.didLike &&
			<Icon size='big' link onClick={this.handleHeart} color='red' className='o-hearticon' name='heart outline'/>}
			<Card fluid className='ui-fluid-card-home'>
				<Slider {...settings} >
					{this.props.photos.map((photos, key) =>(<Image key={key} src={`/${photos.srcimg}`} fluid />))}
					{/* <Image src='/uploads/carla_renault14/photo1541748766278.jpeg' fluid /> */}
				</Slider>
				<Card.Content>
					<Card.Header>{firstname.charAt(0).toUpperCase() + firstname.slice(1)} {lastname.toUpperCase()} {getAge(moment(birthdate, "DD-MM-YYYY"))} years</Card.Header>
					<Card.Meta>
						<span>{distance.toString().substring(0, 4)}km away</span>
					</Card.Meta>
					<Card.Meta>
						<span className='sex'>{orientation}, {gender}</span>
					</Card.Meta>
					<Card.Meta>
						{this.isConnected(this.props.userconnected, id) &&
						<span className='online'>Online</span>}
						{!this.isConnected(this.props.userconnected, id) &&
						<span className='online'>Offline since {moment(lastCon, 'DD-MM-YYYY, h:mm:ss').fromNow()}</span>}
					</Card.Meta>
					{bio.length >= 40 &&
					<Card.Description className='home-card-bio'>{bio.substring(0, 100 - 3)}{<a href={`/user/${username}`}>... More</a>}</Card.Description>}
					{bio.length < 40 &&
					<Card.Description>{bio}<a href={`/user/${username}`}>... More</a></Card.Description>}
				</Card.Content>
				<Card.Content>
				{tags && tags.length > 0 &&
					<Tags tags={tags} />}
				</Card.Content>
				<Card.Content extra>
							<Icon name='heart' color='red'/>Score {score}
				</Card.Content>
			</Card>
		</div>
		)
	}
}

export default (HomeCard);