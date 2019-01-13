import React, { Component } from 'react';
import { Card, Icon, Image, Label, Dropdown } from 'semantic-ui-react';
import { toast } from 'react-toastify';
import Slider from "react-slick";
import moment from 'moment';

import { userActions } from '../redux/actions/user';
import { authActions } from '../redux/actions/auth';
import { history } from '../helpers/history';

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

class AccountCard extends Component {
	constructor(props) {
		super(props)
		this.state = {
			blocked: this.props.user.blocked,
		}
	}
	handleReport = async () => {
		let res = await this.props.dispatch(userActions.report(this.props.user.username, this.props.token));
		if (res) {
			if (res.data === 'Unauthorized') {
				this.props.dispatch(authActions.logoutUser());
			}
			else if (res.status !== 200)
				toast.error(res.data.errMsg, {position: toast.POSITION.TOP_RIGHT});
			else {
				toast.success(res.data.errMsg, {position: toast.POSITION.TOP_RIGHT});
			}			
		}
	}

	handleBlock = async () => {
		let res = await this.props.dispatch(userActions.block(this.props.user.username, this.props.token));
		if (res) {
			if (res.data === 'Unauthorized') {
				this.props.dispatch(authActions.logoutUser());
			}
			else if (res.status !== 200)
				toast.error(res.data.errMsg, {position: toast.POSITION.TOP_RIGHT});
			else {
				await this.setState({ blocked: this.props.user.blocked});
				if (this.state.blocked)
					history.push('/account');
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

	options = [
		{ key: 'report', text: 'Report', onClick: this.handleReport },
		{ key: 'block', text: 'Block', onClick: this.handleBlock },
	]

	options2 = [
		{ key: 'report', text: 'Report', onClick: this.handleReport },
		{ key: 'unblock', text: 'Unblock', onClick: this.handleBlock },
	]

	render () {
		const { firstname, lastname, gender, orientation, birthdate, score, bio, tags, lastCon, id } = this.props.user
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
						arrows: false
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
			<Card fluid>
				<Slider {...settings} >
					{this.props.photos.map((photos, key) =>(<Image key={key} src={`/${photos.srcimg}`} fluid />))}
					{/* <Image src='/uploads/carla_renault14/photo1541748766278.jpeg' fluid /> */}
				</Slider>
				<Card.Content>
					{this.props.visits && !this.state.blocked &&
					<Dropdown trigger={<span>. . .</span>} options={this.options} icon={null} className='o-report'/>}
					{this.props.visits && this.state.blocked &&
					<Dropdown trigger={<span>. . .</span>} options={this.options2} icon={null} className='o-report'/>}
					<Card.Header>{firstname.charAt(0).toUpperCase() + firstname.slice(1)} {lastname.toUpperCase()} {getAge(moment(birthdate, "DD-MM-YYYY"))} years</Card.Header>
					<Card.Meta>
						<span className='sex'>{orientation}, {gender}</span>
					</Card.Meta>
					<Card.Meta>
						{this.isConnected(this.props.userconnected, id) &&
						<span className='online'>Online</span>}
						{!this.isConnected(this.props.userconnected, id) &&
						<span className='online'>Offline since {moment(lastCon, 'DD-MM-YYYY, h:mm:ss').fromNow()}</span>}
					</Card.Meta>
					<Card.Description className='account-card-bio'>{bio}</Card.Description>
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

export default (AccountCard);